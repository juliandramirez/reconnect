/**
 * @flow
 */

import firestore from '@react-native-firebase/firestore'

import type { DataMap } from 'Reconnect/src/lib/utils'
import { stringNotEmpty } from 'Reconnect/src/lib/utils'
import type { ReminderValue } from 'Reconnect/src/services/notifications'
import { ReminderValues } from 'Reconnect/src/services/notifications'
import Constants from 'Reconnect/src/Constants'

import NotificationsManager from './notifications'
import AuthManager from './auth'


/* MARK: - Constants */

const COLLECTION_REF = firestore().collection(Constants.storageRefs.spaces)

/* MARK: - Types */

export type SpaceConfiguration = {|
    shortName?: ?string,
    color: string,
    reminderValue: ReminderValue    
|}

export type Space = {
    id: string,
    invitationCode: string,
    hostId: string,
    guestId?: ?string,
    configuration?: ?SpaceConfiguration
}

/* MARK: - Services */

const SpacesManager = {}

SpacesManager.getSpaceWithInvitationCode = async (code: string) : Promise<?Space> => {

    const ref = COLLECTION_REF
        .where('invitationCode', '==', code)
        .where('waitingForGuest', '==', true)

    const results = await ref.get()

    if (results.size != 1) {
        return null
    }
    
    const result = results.docs[0]
    return _dataToSpaceObject(result.id, result.data())    
}

SpacesManager.createSpace = async (configuration : SpaceConfiguration) : Promise<Space> => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    // create new space
    const invitationCode = await _computeInvitationCode()
    const newSpaceRef = await COLLECTION_REF.add({
        invitationCode,
        waitingForGuest: true,
        created: firestore.FieldValue.serverTimestamp(),
        hostConfiguration: {
            userId,            
            ...configuration
        }
    })

    const space = {
        id: newSpaceRef.id,
        invitationCode,
        hostId: userId,        
        configuration
    }

    // configure local notifications
    _configureLocalNotifications(space.id, space.configuration)

    return space
}

SpacesManager.attachToSpace = async (space: Space, configuration: SpaceConfiguration) : Promise<Space> => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    const spaceRef = COLLECTION_REF.doc(space.id)
    await spaceRef.update({
        waitingForGuest: false,
        guestConfiguration: {
            userId,
            ...configuration
        }
    })

    const updatedSpace = {
        id: space.id,
        invitationCode: space.invitationCode,
        hostId: space.hostId,
        guestId: userId,        
        configuration       
    }

    // configure local notifications
    _configureLocalNotifications(updatedSpace.id, updatedSpace.configuration)

    return updatedSpace
}

SpacesManager.editSpaceConfiguration = async ({ id, configuration } : { id: string, configuration: SpaceConfiguration }) => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    const spaceRef = COLLECTION_REF.doc(id)
    const spaceDoc = await spaceRef.get()
    if (!spaceDoc.exists) {
        throw Constants.errorCodes.notFound
    }

    const space = _dataToSpaceObject(spaceDoc.id, spaceDoc.data())    
    if (userId == space.hostId) {
        await spaceRef.update({
            hostConfiguration: {
                userId,
                ...configuration
            }
        })
    } else if (userId == space.guestId) {
        await spaceRef.update({
            guestConfiguration: {
                userId,
                ...configuration
            }
        })        
    } else {
        throw Constants.errorCodes.unauthorized
    }

    // configure local notifications
    _configureLocalNotifications(id, configuration)
}

SpacesManager.getNumberOfSpaces = async () : Promise<number> => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    const hostResults = await COLLECTION_REF.where('hostConfiguration.userId', '==', userId).get()
    const guestResults = await COLLECTION_REF.where('guestConfiguration.userId', '==', userId).get()

    return hostResults.size + guestResults.size
}

SpacesManager.subscribeToChanges = (listener: (Array<Space>) => any): Function => { 
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    // Firebase does not support or operations... we have to do 2 queries everytime something changes :(
    const updateListener = async () => {        
        const hostResults = await COLLECTION_REF.where('hostConfiguration.userId', '==', userId).get()
        const guestResults = await COLLECTION_REF.where('guestConfiguration.userId', '==', userId).get()

        const mergedResults = [...hostResults.docs, ...guestResults.docs]

        const sortedResults = mergedResults.sort((a, b) => {
            // created is null for items that are just created...
            if (a.data().created === null && b.data().created === null ) {
                return 0
            } else if (a.data().created === null) {
                return -1
            } else if (b.data().created === null) {
                return 1
            } else {
                return a.data().created.toMillis() - b.data().created.toMillis()
            }
        })            

        const spaces = sortedResults.map(spaceRef => 
            _dataToSpaceObject(spaceRef.id, spaceRef.data())
        )
        listener(spaces)        
    }

    const hostSpacesUnsubscribe = COLLECTION_REF
        .where('hostConfiguration.userId', '==', userId)
        .onSnapshot( 
            (spaceRefs) => {
                updateListener()
            }, 
            (error) => {
                console.log('Error listening to space changes:', error)
            }
        )
    
    const guestSpacesUnsubscribe = COLLECTION_REF
        .where('guestConfiguration.userId', '==', userId)
        .onSnapshot( 
            (spaceRefs) => {
                updateListener()
            }, 
            (error) => {
                console.log('Error listening to space changes:', error)
            }
        )

    return () => {
        hostSpacesUnsubscribe()
        guestSpacesUnsubscribe()
    }
    
}

/* MARK: - Helper Functions */

async function _configureLocalNotifications(id: string, configuration: SpaceConfiguration) {
    
    const reminderValue = configuration.reminderValue
    const writeTo = stringNotEmpty(configuration.shortName) ? `to ${configuration.shortName ?? ''}` : ''
    const writeEvery = ReminderValues[reminderValue].toLowerCase()

    NotificationsManager.configureLocalNotification({
        id: id,
        title: 'Time to reconnect',
        message: `Just reminding you that you wanted to write ${writeEvery} ${writeTo}`,
        reminderValue
    })
}

async function _computeInvitationCode(): Promise<string> {
    const spaces = await COLLECTION_REF.get()
    const numberOfSpaces = spaces.size

    // salt in case number of spaces is taken from firestore cache
    const offlineSalt = Math.floor(Math.random() * 100)

    // rotate every 1000 spaces
    return offlineSalt.toString(10) + (numberOfSpaces % 1000).toString(10)
}

function _dataToSpaceObject(id: string, data: DataMap): Space {
    const userId = AuthManager.currentUserId()

    let configurationData = null
    if (data.hostConfiguration.userId == userId) {
        configurationData = data.hostConfiguration
    } else if (data.guestConfiguration?.userId == userId) {
        configurationData = data.guestConfiguration
    }

    return {
        id,
        invitationCode: data.invitationCode,
        hostId: data.hostConfiguration.userId,
        guestId: data.guestConfiguration?.userId,
        configuration: configurationData == null ? null : {
            shortName: configurationData.shortName,
            color: configurationData.color,
            reminderValue: configurationData.reminderValue
        }
    }
}

export default SpacesManager