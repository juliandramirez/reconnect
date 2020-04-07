/**
 * @flow
 */

import messaging from '@react-native-firebase/messaging'
import { Alert, Linking } from 'react-native'

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
        { message: string, cancelButtonText: string, onCancel: Function }) => {
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