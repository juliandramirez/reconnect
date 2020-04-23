/**
 * @flow
 */

import React from 'react'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import functions from '@react-native-firebase/functions'
import RNUserIdentity from 'react-native-user-identity'

import AnalyticsManager from 'Reconnect/src/lib/analytics'
import CrashReportManager from 'Reconnect/src/lib/crashreports'
import Constants from 'Reconnect/src/Constants'

import NotificationsManager from './notifications'


/* MARK: - Constants */

const COLLECTION_REF = firestore().collection(Constants.storageRefs.users)

/* MARK: - Services */

const AuthManager = {}

AuthManager.init = (authListener: Function) : Function => {    
    // transform firebase model to our model (just a user id for now)
    const listener = (user) => {
        authListener(user?.uid ?? null)
    }

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
            androidAccountSelectionMessage,
            androidAccountType: null
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
        
        // update notification token after sign in
        NotificationsManager.updateNotificationToken()

        CrashReportManager.setUserId(user.uid)
        AnalyticsManager.logLogin('uid-auth')        

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

export default AuthManager