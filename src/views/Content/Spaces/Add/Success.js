/**
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { View, Share, Text, Linking } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation, useRoute } from '@react-navigation/native'

import NotificationsManager from 'Reconnect/src/services/notifications'
import Constants from 'Reconnect/src/Constants'
import { useModalBackground } from 'Reconnect/src/lib/utils'


const AddSpaceSuccess = () => {
    const COLOR = 'snow'

    /* Hooks */
    const navigation = useNavigation()
    const modalDismiss = useModalBackground(COLOR)
    const route = useRoute()

    /* Properties */
    const { space } = route.params

    /* Functions */
    function _cancel() {
        modalDismiss()
        navigation.goBack()
    }

    function _sendInstructions() {
        const message = '1. Download app here: ${Constants.appUrl}\n2. Open the app and use the invitation code ${space.invitationCode}'
        Share.share({ message })
    }

    async function _enableNotifications() {
        const requestedPermission = await NotificationsManager.requestPermissions()                
        if (requestedPermission != 'enabled') {                    
            NotificationsManager.goToSettingsAlert({
                message: 'You must enable notifications in settings', 
                cancelButtonText: 'I don\'t need reminders'
            })
        }
    }

    /* Render */
    return (
        <View style={{ 
            backgroundColor: COLOR, 
            flex: 1, 
            paddingVertical: '20%',
            alignContent: 'center'
        }}>
            <Text>Personal Space Created</Text>

            <Text>Now you need to invite the other person to the space. Send them the instructions to install the app and add your space</Text>

            <Button type='clear' title='SEND INSTRUCTIONS' onPress={_sendInstructions} />

            <Text>If you want to be notified when the other person writes a post give the app permission to send notifications</Text>
            <Button type='clear' title='ENABLE NOTIFICATIONS' onPress={_enableNotifications} />


            <Button title='GO TO YOUR NEW SPACE' />

        </View>
    )
}

export default AddSpaceSuccess