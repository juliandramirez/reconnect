/**
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { View, Share, Text, Linking, TouchableOpacity } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation, useRoute } from '@react-navigation/native'
import EStyleSheet from 'react-native-extended-stylesheet'

import NotificationsManager from 'Reconnect/src/services/notifications'
import Constants from 'Reconnect/src/Constants'
import { useModalBackground } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'


const styles = EStyleSheet.create({
    container: {        
        flex: 1,
        paddingHorizontal: '20 rem',
        paddingBottom: '20 rem',        
        justifyContent: 'flex-end',
        backgroundColor: Theme.colors.addSpaceBackground,
    },
        titleContainer: {
            flex: 1, 
            justifyContent: 'flex-end'
        },
        content: {
            flex: 0,
            height: '400 rem',          
        },
            section: {
                justifyContent: 'center',
                padding: '20 rem',
                paddingBottom: '5 rem',
                marginTop: '20 rem',
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: '#cccccc'
            },
                text: {
                    textAlign: 'justify',
                    fontSize: '15 rem',
                    color: '#555555',
                    marginBottom: '5 rem',
                    letterSpacing: 0.5
                },
                button: {
                    height: '50 rem'
                }
})

const AddSpaceSuccess = () => {

    /* Hooks */
    const navigation = useNavigation()
    const modalDismiss = useModalBackground(Theme.colors.addSpaceBackground)
    const route = useRoute()

    /* State */
    const [sendCodePressed, setSendCodePressed] = useState<boolean>(false)
    const [notificationsWereEnabled, setNotificationsWereEnabled] = useState<boolean>(false)

    /* Properties */
    const { space, isNewSpace, notificationPermissions } = route.params

    /* Functions */
    function _goToSpace() {
        modalDismiss()
        navigation.navigate( NavigationRoutes.Main, { space: space } )
    }

    function _sendInstructions() {
        const message = `1. Download app here: ${Constants.appUrl}\n2. Open the app and use the invitation code ${space.invitationCode}`
        Share.share({ message })
        setSendCodePressed(true)
    }

    async function _enableNotifications() {
        const requestedPermission = await NotificationsManager.requestPermissions()                
        if (requestedPermission != 'enabled') {                    
            NotificationsManager.goToSettingsAlert({
                message: 'You must enable notifications in settings', 
                cancelButtonText: 'I don\'t want notifications'
            })
        } else {
            setNotificationsWereEnabled(true)
        }
    }

    /* Render */
    return (
        <View style={styles.container}>

            <View style={ styles.titleContainer }>
                <Text style={ Theme.palette.title }>
                    Personal Space Created
                </Text>
            </View>


            <View style={styles.content}>

                <View style={{flex: 1, justifyContent: 'flex-start', marginVertical: 20}}>
                    {
                        isNewSpace ?                             
                            <TouchableOpacity onPress={_sendInstructions} style={ styles.section }>                                
                                <Text style={ styles.text }>
                                    Now you just need to invite the other person to the space by sending them a private code
                                </Text>
                                <Button title='SEND CODE' type='clear' 
                                    buttonStyle={ Theme.palette.clearButton }                     
                                    titleStyle={ Theme.palette.clearButtonText } 
                                    onPress={_sendInstructions}                    
                                />
                            </TouchableOpacity>                                                          
                        : 
                            <></>
                    }                    
                    {
                        notificationPermissions !== 'enabled' ? 
                            notificationsWereEnabled ? 
                                <View style={ styles.section }>
                                    <Text style={{ ...styles.text, textAlign: 'center', fontWeight: 'bold' }}>
                                        NOTIFICATIONS ENABLED
                                    </Text>
                                    <Text style={{ ...styles.text }}>
                                        You will be sent a notification when the other person writes a post
                                    </Text>
                                </View>
                            :
                                <TouchableOpacity onPress={_enableNotifications} style={ styles.section }>
                                    <Text style={ styles.text }>
                                        (OPTIONAL) If you want to be notified when the other person writes a post
                                    </Text>
                                    <Button title='ENABLE NOTIFICATIONS' type='clear'
                                        buttonStyle={ Theme.palette.clearButton }                     
                                        titleStyle={ Theme.palette.clearButtonText }
                                        onPress={_enableNotifications}
                                    />
                                </TouchableOpacity>
                        : <></>
                    }                    
                </View>

                <View style={{flex: 0}}>
                    <Button title='GO TO YOUR NEW SPACE' 
                        buttonStyle={{ ...Theme.palette.button, ...styles.button }}  
                        disabled={!sendCodePressed && isNewSpace}                   
                        onPress={_goToSpace} />
                </View>
            </View>

        </View>
    )
}

export default AddSpaceSuccess