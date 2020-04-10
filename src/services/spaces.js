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
        throw 'unauthenticated'
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
    _configureLocalNotifications(space)

    return space
}

SpacesManager.attachToSpace = async (space: Space, configuration: SpaceConfiguration) : Promise<Space> => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw 'unauthenticated'
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
    _configureLocalNotifications(updatedSpace)

    return updatedSpace
}

SpacesManager.subscribeToChanges = (listener: (Array<Space>) => any): Function => { 
    return COLLECTION_REF.orderBy('created', 'asc').onSnapshot( (spaceRefs) => {
        const spaces = spaceRefs.docs.map(spaceRef => 
            _dataToSpaceObject(spaceRef.id, spaceRef.data())
        )

        listener(spaces)
    }, (error) => {
        console.log('Error listening to space changes:', error)
    })
}

/* MARK: - Helper Functions */

async function _configureLocalNotifications(space: Space) {
    
    const reminderValue = space.configuration?.reminderValue ?? 'NoNeed'
    const writeTo = stringNotEmpty(space.configuration?.shortName) ? `to ${space.configuration?.shortName ?? ''}` : ''
    const writeEvery = ReminderValues[reminderValue].toLowerCase()

    NotificationsManager.configureLocalNotification({
        id: space.id,
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