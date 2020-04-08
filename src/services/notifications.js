/**
 * @flow
 */

import { Alert, Linking } from 'react-native'
import messaging from '@react-native-firebase/messaging'
import LocalNotification from 'react-native-push-notification'
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'

import { ReminderValues } from 'Reconnect/src/services/content'
import type { Space, ReminderValue } from 'Reconnect/src/services/content'



const STORAGE_KEY_PREPEND = 'NOTIF-ID-'
const NotificationsManager = {}


NotificationsManager.init = async () => await messaging().registerDeviceForRemoteMessages()

NotificationsManager.getPermissions = async (): Promise<NotificationPermissions> => {
    const permissions = await messaging().hasPermission()
    return _toPermissionType(permissions)    
}

NotificationsManager.requestPermissions = async (): Promise<NotificationPermissions> => {
    const requestedPermission = await messaging().requestPermission()
    return _toPermissionType(requestedPermission)
}

NotificationsManager.goToSettingsAlert = ({ message, cancelButtonText, onCancel = () => {} } : 
        { message: string, cancelButtonText: string, onCancel?: Function }) => {
    Alert.alert('Notifications disabled', message, [
            {
                text: cancelButtonText,
                onPress: onCancel,
                style: 'cancel'
            },
            {
                text: 'Go to Settings',
                onPress: Linking.openSettings,
                style: 'default'
            }            
        ],
        {
            cancelable: false
        },
    )
}

NotificationsManager.configureLocalNotification = async (space: Space) => {    
    const storageKey = `${STORAGE_KEY_PREPEND}${space.id}`

  // cancel local notification if it existed before... 
    const previousNotificationId = await AsyncStorage.getItem(storageKey)
    if (previousNotificationId != null) {
        LocalNotification.cancelLocalNotifications({ id: previousNotificationId })
        await AsyncStorage.removeItem(storageKey)     
    }

    const reminderValue = space.configuration?.reminderValue
    if (reminderValue && reminderValue !== 'NoNeed') {
        const newNotificationId = Math.floor( Date.now() / 1000.0 ).toString(10)
        // $FlowExpectedError: Condition checks for not null
        const writeTo = space.configuration?.shortName ? `to ${space.configuration.shortName} ` : ''
        const writeEvery = ReminderValues[reminderValue].toLowerCase()

        LocalNotification.localNotificationSchedule({
            title: 'Time to reconnect', 
            message: `Just reminding you that you wanted to write ${writeTo}${writeEvery}`,

            /* Android Only Properties */
            importance: 'max',
            priority: 'max', 
            id: newNotificationId,

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
export type NotificationPermissions = 'disabled' | 'enabled' | 'pending'


