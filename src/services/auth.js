/**
 * @flow
 */

import React from 'react'
import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'

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

AuthManager.signIn = async () : Promise<string> => {
    try {
        const account = await auth().signInAnonymously()
        const user = account.user
        
        // update notification token after sign in
        NotificationsManager.updateNotificationToken()

        CrashReportManager.setUserId(user.uid)
        AnalyticsManager.logLogin('anonymous-auth')        

        return user.uid
    } catch (e) {        
        switch (e.code) {
            default:
                CrashReportManager.report({ 
                    message: `Error signing in to firebase`,
                    cause: e
                })
                break
        }
        throw e
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