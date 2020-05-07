/**
 * @flow
 */

import React from 'react'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import functions from '@react-native-firebase/functions'
import RNUserIdentity from 'react-native-user-identity'
import AsyncStorage from '@react-native-community/async-storage'

import AnalyticsManager from 'Reconnect/src/lib/analytics'
import CrashReportManager from 'Reconnect/src/lib/crashreports'
import Constants from 'Reconnect/src/Constants'

import NotificationsManager from './notifications'
import SpacesManager from './spaces'


/* MARK: - Constants */

const COLLECTION_REF = firestore().collection(Constants.storageRefs.users)
const STORAGE_KEY_FIRST_RUN = 'FIRST_RUN_AUTH'

/* MARK: - Services */

const AuthManager = {}

AuthManager.init = (authListener: Function) : Function => {    
    // transform firebase model to our model (just a user id for now)
    const listener = (user) => {
        authListener(user?.uid ?? null)
    }

    // check if it is first run
    AsyncStorage.getItem(STORAGE_KEY_FIRST_RUN).then(value => {
        if (!value) {            
            // if it's first run and there is a user:  
            // (since firebase users are stored in the keychain this happens on app reinstalls)
            if (AuthManager.currentUserId()) {
                _setUpUser()
            }

            AsyncStorage.setItem(STORAGE_KEY_FIRST_RUN, 'done')
        }
    })

    // returns unsubscribe function
    return auth().onAuthStateChanged(listener)
}

AuthManager.currentUserId = (): ?string => {
    return auth().currentUser?.uid ?? null
}

AuthManager.signIn = async ({ androidAccountSelectionMessage } : { 
    androidAccountSelectionMessage: string 
        }) : Promise<string> => {
    
    // get uid for user...
    const uid = await RNUserIdentity.getUserId({
            androidAccountSelectionMessage
        })
    if (uid === null) {
        throw 'no-uid-available'
    }

    // get firebase token based on uid and auth using that
    try {
        const tokenResponse = await functions().httpsCallable('tokenFromUID')({ uid })
        const token = tokenResponse.data
        const userCredential = await auth().signInWithCustomToken(token)

        const user = userCredential.user        
        await _setUpUser()      

        return user.uid
    } catch (e) {        
        CrashReportManager.report({ 
            message: `Error signing in to firebase: ` + (e.message ?? ''),
            cause: e
        })
        throw 'internal-error'
    }
}

AuthManager.signOut = async () => {
    await auth().signOut()
}

AuthManager.getUserNotificationToken = async (userId: string): Promise<?string> => {    
    const ref = COLLECTION_REF.doc(userId)
    const info = await ref.get()

    return info.data().notificationToken
}

AuthManager.updateCurrentUserNotificationToken = async (token: string) => {
    const currentUserId = AuthManager.currentUserId()

    if (currentUserId != null) {
        const ref = COLLECTION_REF.doc(currentUserId)
        await ref.set({
            notificationToken: token
        })
    }
}


async function _setUpUser() {
    // update notification token after sign in
    NotificationsManager.updateNotificationToken()

    CrashReportManager.logLogin()
    AnalyticsManager.logLogin('uid-auth')        

    // if user has previous spaces (app reinstall perhaps? ask notification permissions and recompute notifications)        
    const userSpaces = await SpacesManager.getUserSpaces()
    if (userSpaces.length > 0) {
        await NotificationsManager.requestPermissions()                
        userSpaces.forEach(space => 
            SpacesManager.configureLocalNotifications(space.id, space.configuration)
        )
    }
}

export default AuthManager