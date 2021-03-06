/**
 * @flow
 */

import React, { useState } from 'react'
import { View, TouchableOpacity, Text, Keyboard, Platform } from 'react-native'
import { Button, Input } from 'react-native-elements'
import EStyleSheet from 'react-native-extended-stylesheet'
import RNPickerSelect from 'react-native-picker-select'

import { showErrorMessage, goToSettingsAlert } from 'Reconnect/src/lib/utils'
import type { SpaceConfiguration } from 'Reconnect/src/services/spaces'
import type { NotificationPermissions, ReminderValue } from 'Reconnect/src/services/notifications'
import NotificationsManager, { ReminderValues } from 'Reconnect/src/services/notifications'
import Theme from 'Reconnect/src/theme/Theme'
import { SpaceView } from 'Reconnect/src/views/Content/Spaces/List'


const styles = EStyleSheet.create({
    container: {
        flex: 1, 
        marginTop: '15 rem',
        marginBottom: '20 rem',
        justifyContent: 'flex-end'
    },
        basicInfoContainer: {
            flex: 5
        },
            basicInfoField: {
                flex: 2, 
                justifyContent: 'center'
            },
            colorsContainer: {
                flexDirection: 'row', 
                paddingTop: '10 rem'
            },
            previewContainer: {
                flex: 0, 
                justifyContent: 'center', 
                alignItems: 'center'
            },
        remindersContainer: {
            flex: 3, 
            justifyContent: 'center'
        },
            remindersTitle: {
                fontSize: '14 rem',
                color: 'black', 
                fontWeight: 'bold', 
                textAlign: 'center',
                marginBottom: '10 rem'
            },
            remindersPickerIOS: {
                textAlign: 'center',
                fontSize: '16 rem',
                paddingVertical: '10 rem',
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: '4 rem',
                color: 'black', 
            },
            remindersPickerAndroid: {
                fontSize: '16 rem',
                paddingHorizontal: '10 rem',
                paddingVertical: '8 rem',
                borderWidth: 1,
                borderColor: 'black',
                borderRadius: '8 rem',
                color: 'black',                 
            },
        fieldText: {
            fontSize: '14 rem',
            color: 'grey'
        },
        button: {                                
            marginTop: 1,   
            marginBottom: '1 rem'      
        }        
})


const Page2 = ({ initialConfiguration = null, submitLabel, cancelLabel, submit, cancelOrBack } : { 
        initialConfiguration?: ?SpaceConfiguration, 
        submitLabel: string,
        submit: (SpaceConfiguration) => any, 
        cancelLabel: string,
        cancelOrBack: () => void,
     }) => {

    /* State */
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [shortName, setShortName] = 
        useState<?string>(initialConfiguration ? initialConfiguration.shortName : '')
    const [color, setColor] = 
        useState<string>(initialConfiguration ? initialConfiguration.color : Theme.colors.spaceColors[0])
    const [reminderValue, setReminderValue]= 
        useState<?ReminderValue>(initialConfiguration ? initialConfiguration.reminderValue : null)

    /* Functions */
    async function _submit() {
        if (!submitting) {
            if (!shortName) {
                showErrorMessage('Select a nickname for him/her')
            } else if (!reminderValue) {
                showErrorMessage('Select an item for reminders')
            } else {
                setSubmitting(true)

                try {
                    await submit({ shortName, color, reminderValue })
                } catch (error){
                    setSubmitting(false)
                    showErrorMessage('Check your internet connection')
                }  
            }       
        }        
    }

    async function _checkNotificationPermissions() {
        if (Platform.OS === 'ios' && 
                reminderValue && reminderValue != 'NoNeed') {                    

            const showAlert = () => {
                goToSettingsAlert({
                    title: 'Notifications disabled',
                    message: 'To get reminders you must enable notifications in settings', 
                    cancelButtonText: 'I don\'t need reminders',
                    onCancel: () => setReminderValue('NoNeed')
                })
            }
            
            const permissions = await NotificationsManager.getPermissions() 
            if (permissions == 'disabled' ){
                setReminderValue(null)
                showAlert()
            } else if (permissions === 'pending') {
                const requestedPermission = await NotificationsManager.requestPermissions()
                
                if (requestedPermission != 'enabled') {                    
                    setReminderValue(null)
                    showAlert()
                }
            }
        }
    }

    /* Render */
    return (
        <>
            <View style={ styles.container }>                

                <View style={ styles.basicInfoContainer }>

                    <View style={ styles.basicInfoField }>
                        <Text style={ styles.fieldText }>Nickname for him/her</Text>
                        <Input 
                            disabled={submitting}
                            inputContainerStyle={{ marginHorizontal: -10 }}
                            placeholder="e.g. 'Dad', 'big Bro', 'BFF'"   
                            placeholderTextColor='#ccc'
                            value={ shortName }
                            onChangeText={val => setShortName(val)}              
                        />
                    </View>

                    <View style={ styles.basicInfoField }>                    
                        <Text style={ styles.fieldText }>
                            Color (visual cue for the space)
                        </Text>
                        <View style={ styles.colorsContainer }>
                        {
                            Theme.colors.spaceColors.map( item => 
                                <TouchableOpacity key={item} activeOpacity={1}
                                    onPress={() => {
                                        if (!submitting) {
                                            setColor(item)
                                            Keyboard.dismiss()
                                        }                                        
                                    }}
                                    style={{ 
                                        aspectRatio: 1, 
                                        width: '14.28%', 
                                        backgroundColor: item,
                                        borderWidth: color == item ? 0.5 : 0
                                    }}                                        
                                />
                            )
                        }                
                        </View>
                    </View>

                    <View style={styles.previewContainer}>
                        <SpaceView isSelected={true} previewMode={true} space={{
                            id: 'id',
                            hostId: 'id',
                            invitationCode: 'code',
                            configuration: {
                                color,
                                //$FlowExpectedError: not null
                                shortName,
                                reminderValue: 'NoNeed'
                            }
                        }}/>                        
                    </View>
                </View>                

                <View style={styles.remindersContainer}>

                    <Text style={styles.remindersTitle}>
                        How often would you like to be reminded to write something to this person?
                    </Text>
                    <RNPickerSelect 
                        disabled={submitting}
                        style={{
                            inputIOS: styles.remindersPickerIOS,
                            inputAndroid: styles.remindersPickerAndroid,
                        }}
                        value={ reminderValue }
                        onValueChange={(value) => setReminderValue(value)}
                        onDonePress={_checkNotificationPermissions}
                        items={ 
                            Object.keys(ReminderValues).map( key =>
                                { return { label: ReminderValues[key], value: key } }
                            )
                        }
                    />
                </View>
            </View>

            <View>
                <Button title={submitLabel} onPress={ _submit } loading={submitting}
                    buttonStyle={{...styles.button, ...Theme.palette.button}}                         
                />
                <Button title={cancelLabel} onPress={ cancelOrBack } 
                    disabled={submitting}
                    buttonStyle={{...styles.button, ...Theme.palette.button}}
                />
            </View>
        </>
    )
}

export default Page2