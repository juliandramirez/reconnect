/**
 * @flow
 */

import firestore from '@react-native-firebase/firestore'
import * as RNLocalize from 'react-native-localize'

import type { DataMap } from 'Reconnect/src/lib/utils'
import { stringNotEmpty } from 'Reconnect/src/lib/utils'
import type { ReminderValue } from 'Reconnect/src/services/notifications'
import { ReminderValues } from 'Reconnect/src/services/notifications'
import Constants from 'Reconnect/src/Constants'
import AnalyticsManager from 'Reconnect/src/lib/analytics'
import CrashReportManager from 'Reconnect/src/lib/crashreports'
import AsyncStorage from '@react-native-community/async-storage'

import NotificationsManager from './notifications'
import AuthManager from './auth'


/* MARK: - Constants */

const COLLECTION_REF = firestore().collection(Constants.storageRefs.spaces)

export const PushNotificationActions = {
    spaceJoined: 'joined',
    postSent: 'post-sent'
}

const TIMEZONE_STORAGE_KEY = 'TIMEZONE'

/* MARK: - Types */

export type SpaceConfiguration = {|
    shortName: string,
    color: string,
    reminderValue: ReminderValue    
|}

export type Space = {|
    id: string,
    invitationCode: string,
    hostId: string,
    guestId?: ?string,
    configuration?: ?SpaceConfiguration,
    theirConfiguration?: ?SpaceConfiguration
|}

/* MARK: - Services */

const SpacesManager = {}

SpacesManager.init = async () => {
    const userId = AuthManager.currentUserId()
    const currentTimezone = RNLocalize.getTimeZone()

    // if it's first time just save the device timezone...
    if (!userId) {        
        await AsyncStorage.setItem(TIMEZONE_STORAGE_KEY, currentTimezone)
    } else {        
        const previousTimezone = await AsyncStorage.getItem(TIMEZONE_STORAGE_KEY)        
        
    // if timezone has changed, update the notification scheduling...
        if (previousTimezone != currentTimezone) {
            const userSpaces = await SpacesManager.getUserSpaces()
            userSpaces.forEach(space => 
                SpacesManager.configureLocalNotifications(space.id, space.configuration)
            )        
    
            await AsyncStorage.setItem(TIMEZONE_STORAGE_KEY, currentTimezone)
        }
    }
}

SpacesManager.getSpaceWithInvitationCode = async (code: string) : Promise<?Space> => {

    const ref = COLLECTION_REF
        .where('invitationCode', '==', code)
        .where('waitingForGuest', '==', true)

    // get with invitation code can never be from cache...
    const results = await ref.get({ source: 'server' })

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
    const newSpaceRef = COLLECTION_REF.doc()
    await firestore().runTransaction(async transaction => {        
        await transaction.set(newSpaceRef, {
            invitationCode,
            waitingForGuest: true,
            created: firestore.FieldValue.serverTimestamp(),
            hostConfiguration: {
                userId,            
                ...configuration
            }
        })
    })

    const space = {
        id: newSpaceRef.id,
        invitationCode,
        hostId: userId,        
        configuration
    }

    // configure local notifications
    SpacesManager.configureLocalNotifications(space.id, space.configuration)

    AnalyticsManager.updateNumberOfSpaces()

    return space
}

SpacesManager.attachToSpace = async (space: Space, configuration: SpaceConfiguration) : Promise<Space> => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    const spaceRef = COLLECTION_REF.doc(space.id)
    await firestore().runTransaction(async transaction => {
        await transaction.update(spaceRef, {
            waitingForGuest: false,
            guestConfiguration: {
                userId,
                ...configuration
            }
        })
    })

    const updatedSpace = {
        id: space.id,
        invitationCode: space.invitationCode,
        hostId: space.hostId,
        theirConfiguration: space.theirConfiguration,
        guestId: userId,        
        configuration,               
    }

    // configure local notifications
    SpacesManager.configureLocalNotifications(updatedSpace.id, updatedSpace.configuration)

    // send push notification to host
    NotificationsManager.sendRemoteNotification({
        userId: updatedSpace.hostId,
        title: 'Someone joined you',
        message: 'Your invitation to your shared space has been accepted!',
        extra: {
            spaceId: updatedSpace.id,
            action: PushNotificationActions.spaceJoined
        }
    })

    // log space created
    AnalyticsManager.logEvent('space_configured', {
        spaceId: updatedSpace.id,
        hostId: updatedSpace.hostId,
        hostReminderValue: updatedSpace.theirConfiguration?.reminderValue ?? null,
        guestId: updatedSpace.guestId,
        guestReminderValue: updatedSpace.configuration.reminderValue
    })

    AnalyticsManager.updateNumberOfSpaces()

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
        await firestore().runTransaction(async transaction => {
            await transaction.update(spaceRef, {
                hostConfiguration: {
                    userId,
                    ...configuration
                }
            })
        })
    } else if (userId == space.guestId) {
        await firestore().runTransaction(async transaction => {
            await transaction.update(spaceRef, {
                guestConfiguration: {
                    userId,
                    ...configuration
                }
            })
        })    
    } else {
        throw Constants.errorCodes.unauthorized
    }

    // configure local notifications
    SpacesManager.configureLocalNotifications(id, configuration)
}

SpacesManager.getNumberOfUserSpaces = async () : Promise<number> => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    const hostResults = await COLLECTION_REF.where('hostConfiguration.userId', '==', userId).get()
    const guestResults = await COLLECTION_REF.where('guestConfiguration.userId', '==', userId).get()

    return hostResults.size + guestResults.size
}

SpacesManager.subscribeToSpaceChanges = ({ spaceId, listener } : { 
        spaceId: string, 
        listener: (Space) => any }) => {

        return COLLECTION_REF.doc(spaceId)
            .onSnapshot( 
                (spaceDoc) => {
                    const space = _dataToSpaceObject(spaceDoc.id, spaceDoc.data())
                    listener(space)
                }, 
                (error) => {
                    CrashReportManager.report({ 
                        message: `Error listening to changes of space ${spaceId}`,
                        cause: error
                    })
                }
            )
}

SpacesManager.getUserSpaces = async () => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    const hostResults = await COLLECTION_REF.where('hostConfiguration.userId', '==', userId).get()
    const guestResults = await COLLECTION_REF.where('guestConfiguration.userId', '==', userId).get()

    const mergedResults = [...hostResults.docs, ...guestResults.docs]
    // sort by created date
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

    return sortedResults.map(spaceRef => 
        _dataToSpaceObject(spaceRef.id, spaceRef.data())
    )
}

SpacesManager.subscribeToUserSpacesChanges = (listener: (Array<Space>) => any): Function => { 
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }
    
    const updateListener = async () => {        
        const spaces = await SpacesManager.getUserSpaces()
        listener(spaces)        
    }

    // Firebase does not support OR operations... we have to listen on 2 different properties and then join 2 queries :(
    const hostSpacesUnsubscribe = COLLECTION_REF
        .where('hostConfiguration.userId', '==', userId)
        .onSnapshot( 
            (spaceRefs) => {
                updateListener()
            }, 
            (error) => {
                CrashReportManager.report({ 
                    message: `Error listening to space changes for user ${userId}`,
                    cause: error
                })                
            }
        )
    
    const guestSpacesUnsubscribe = COLLECTION_REF
        .where('guestConfiguration.userId', '==', userId)
        .onSnapshot( 
            (spaceRefs) => {
                updateListener()
            }, 
            (error) => {
                CrashReportManager.report({ 
                    message: `Error listening to space changes for user ${userId}`,
                    cause: error
                })                                
            }
        )

    return () => {
        hostSpacesUnsubscribe()
        guestSpacesUnsubscribe()
    }
    
}

SpacesManager.notifyUserPublishedNewPost = (space: Space) => {
    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    let recipientId = null
    if (space.hostId == userId) {
        recipientId = space.guestId
    } else if (space.guestId == userId) {
        recipientId = space.hostId
    } else {
        throw Constants.errorCodes.unauthorized
    }

    if (recipientId) {
        NotificationsManager.sendRemoteNotification({
            userId: recipientId,
            title: 'New letter received',
            message: 'You just received a letter from someone special',
            extra: {
                spaceId: space.id,
                action: PushNotificationActions.postSent
            }
        })
    }
}

SpacesManager.configureLocalNotifications = (id: string, configuration: SpaceConfiguration) => {
    
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

/* MARK: - Helper Functions */

async function _computeInvitationCode(): Promise<string> {
    const spaces = await COLLECTION_REF.get()
    const numberOfSpaces = spaces.size

    // salt in case number of spaces is taken from firestore cache
    const offlineSalt = Math.floor(Math.random() * 100)

    // rotate every 1000 spaces
    return offlineSalt.toString(10) + (numberOfSpaces % 1000).toString(10).padStart(3, '0')
}

function _dataToSpaceObject(id: string, data: DataMap): Space {
    
    const userId = AuthManager.currentUserId()

    let configurationData = null
    let theirConfigurationData = null

    if (data.hostConfiguration.userId == userId) {
        configurationData = data.hostConfiguration
        theirConfigurationData = data.guestConfiguration
    } else if (data.guestConfiguration?.userId == userId) {
        configurationData = data.guestConfiguration
        theirConfigurationData = data.hostConfiguration
    } else {
        theirConfigurationData = data.hostConfiguration
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
        },
        theirConfiguration: theirConfigurationData == null ? null : {
            shortName: theirConfigurationData.shortName,
            color: theirConfigurationData.color,
            reminderValue: theirConfigurationData.reminderValue
        },
    }
}

export default SpacesManager