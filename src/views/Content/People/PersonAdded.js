/**
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { View, Share, Text, Linking } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import messaging from '@react-native-firebase/messaging'
import PushNotification from 'react-native-push-notification'

import { useModalBackground } from 'Reconnect/src/lib/utils'


const PersonAdded = () => {
    const COLOR = 'snow'

    /* Hooks */
    const navigation = useNavigation()
    const modalDismiss = useModalBackground(COLOR)

    /* Functions */
    function _cancel() {
        modalDismiss()
        navigation.goBack()
    }

    const [permission, setPermission] = useState('')

    useEffect(() => {
        (async () => {
            const settings = await messaging().hasPermission()

            if (settings) {
                setPermission(settings)
            }
        })()
    }, [])

    /* Render */
    return (
        <View style={{ flex: 1}}>
            <Button title='Local Notification NOW' onPress={() => {
                PushNotification.localNotificationSchedule({
                        title: "Local Notification", 
                        message: "My Notification Message", 
                        date: new Date(Date.now() + 5 * 1000),
                        repeatType: 'time',
                        repeatTime: 2000,
                        importance: 'max',
                        priority: 'max' 
                    })
            }}/>

            <Button title='CANCEL' onPress={() => PushNotification.cancelAllLocalNotifications()}/>
            <Button title='Open settings' onPress={() => Linking.openSettings()}/>
            <Text>{permission}</Text>
            <Button title='NOTIFICATION' onPress={() => { 
                messaging().requestPermission()
                .then(settings => {
                    setPermission(settings)
                })
            }}/>

            <Button title='SHARE' onPress={() => { 
                Share.share({ message: '1. Download app here: http://google.com\n2. Use invitation code AWNSD' })
            }}/>

            <Button title='...' onPress={navigation.goBack}/>
        </View>
    )
}

export default PersonAdded