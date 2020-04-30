/**
 * @flow
 */

import { AppState } from 'react-native'
import messaging from '@react-native-firebase/messaging'
import functions from '@react-native-firebase/functions'
import LocalNotification from 'react-native-push-notification'
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'

import type { StringMap } from 'Reconnect/src/lib/utils'

import AuthManager from './auth'


/* MARK: - Constants */

const STORAGE_KEY_PREPEND = 'NOTIF-ID-'

export const ReminderValues = {
    NoNeed: 'I don\'t need reminders',
    EveryWeek: 'Every week',
    EveryMonth: 'Every month',
    EveryMorning: 'Every morning',
    EveryNight: 'Every night',    
}

/* MARK: - Types */

export type ReminderValue = $Keys<typeof ReminderValues>
export type NotificationPermissions = 'disabled' | 'enabled' | 'pending'

/* MARK: - Services */

const NotificationsManager = {}

NotificationsManager.init = (): Function => {
    
    // 1. subscribe to token changes (on foreground)...
    const tokenRefreshUnsubscribe = messaging().onTokenRefresh( token => {
        NotificationsManager.updateNotificationToken()
    })

    // 2. register for remote notifications (listener above is called)...
    messaging().registerDeviceForRemoteMessages()

    /* 3. update token when app goes to the foreground
     *    firebase onTokenRefresh is not called in the background */
    const changeAppStateListener = state => {
        if (state === 'active') {
            NotificationsManager.updateNotificationToken()
        }
    }
    AppState.addEventListener('change', changeAppStateListener)

    // return clean up function
    return () => {
        tokenRefreshUnsubscribe()
        AppState.removeEventListener('change', changeAppStateListener)
    }
}

NotificationsManager.subscribeToRemoteNotifications = (listener: (?StringMap, boolean) => any) : Function => {

    // if app started because the user pressed the notification, send the event signaling it was a notification in the background
    messaging().getInitialNotification().then( remoteMessage => {
        if (remoteMessage && remoteMessage.data) {
            listener(remoteMessage.data, true)
        }        
    })
    messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage && remoteMessage.data) {
            listener(remoteMessage.data, true)
        }
    })

    return messaging().onMessage( remoteMessage => {
        if (remoteMessage && remoteMessage.data) {
            listener(remoteMessage.data, false)
        }
    })
}

NotificationsManager.sendRemoteNotification = async ({ userId, title, message, extra } 
        : { userId: string, title: string, message: string, extra?: StringMap }) => {

    const token = await AuthManager.getUserNotificationToken(userId)
    if (token) {
        await functions().httpsCallable('sendPushNotification')({
            token, title, message, extra
        })
    }    
}

NotificationsManager.updateNotificationToken = async () => {
    const token = await messaging().getToken()
    if (token && token !== 'unregistered') {        
        await AuthManager.updateCurrentUserNotificationToken(token)
    }
}

NotificationsManager.getPermissions = async (): Promise<NotificationPermissions> => {
    const permissions = await messaging().hasPermission()
    return _toPermissionType(permissions)    
}

NotificationsManager.requestPermissions = async (): Promise<NotificationPermissions> => {
    const requestedPermission = await messaging().requestPermission()
    return _toPermissionType(requestedPermission)
}

NotificationsManager.configureLocalNotification = async ({ id, title, message, reminderValue } 
        : { id: string, title: string, message: string, reminderValue: ReminderValue }) => {    

    const storageKey = `${STORAGE_KEY_PREPEND}${id}`

  // cancel local notification if it existed before... 
    const previousNotificationId = await AsyncStorage.getItem(storageKey)
    if (previousNotificationId) {
        LocalNotification.cancelLocalNotifications({ id: previousNotificationId })
        await AsyncStorage.removeItem(storageKey)     
    }

    if (reminderValue && reminderValue !== 'NoNeed') {
        const newNotificationId = Math.floor( Date.now() / 1000.0 ).toString(10)

        LocalNotification.localNotificationSchedule({
            title, 
            message,

            /* Android Only Properties */
            importance: 'max',
            priority: 'max', 
            id: newNotificationId,
            largeIcon: 'ic_notification',
            smallIcon: 'ic_notification',

            /* IOS Only Properties */
            userInfo: { id: newNotificationId },

            /* Scheduling params */
            ...(_notificationScheduleParams(reminderValue))
        })

    // Set new local notification id...
        AsyncStorage.setItem(storageKey, newNotificationId)
    }
}

function _notificationScheduleParams(reminderValue: ReminderValue) {

    let nextTime = moment().endOf('day').fromNow()
    let repeatInterval;

    switch(reminderValue){
        case 'EveryMorning':
            
            // TEST VALUES
            // nextTime = moment().add(5, 'seconds').toDate()
            // repeatInterval = 'minute'

            // 9 am every day, starting tomorrow
            nextTime = moment().startOf('day').add(1, 'days').add(9, 'hours').toDate()
            repeatInterval = 'day'
            break
        case 'EveryNight':
            // 9 pm every day, starting tomorrow
            nextTime = moment().startOf('day').add(1, 'days').add(21, 'hours').toDate()
            repeatInterval = 'day'
            break
        case 'EveryWeek':
            // 8 pm every sunday, starting next sunday
            nextTime = moment().startOf('week').add(1, 'weeks').add(20, 'hours').toDate()
            repeatInterval = 'week'
            break
        case 'EveryMonth':
            // 8 pm every month, starting next sunday
            nextTime = moment().startOf('week').add(1, 'weeks').add(20, 'hours').toDate()
            repeatInterval = 'month'
            break
    }    

    return { 
        date: nextTime,
        repeatType: repeatInterval,
    }
}

function _toPermissionType(FCMPermission: number) {
    if (FCMPermission === -1) {
        return 'pending'
    } else if (FCMPermission === 0) {
        return 'disabled'
    } else {
        return 'enabled'
    }
}

export default NotificationsManager
