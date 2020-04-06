/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import EStyleSheet from 'react-native-extended-stylesheet'
import RNPickerSelect from 'react-native-picker-select'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Theme from 'Reconnect/src/theme/Theme'
import { useModalBackground } from 'Reconnect/src/lib/utils'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'

import { Profile } from './PeopleList'


const styles = EStyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '20 rem',
        paddingBottom: '8 rem',        
        justifyContent: 'flex-end',
    },
        titleContainer: {
            flex: 1, 
            justifyContent: 'flex-end'
        },
            title: {
                fontSize: '28 rem',  
                textTransform: 'capitalize',
                color: '#555555',
            },
        page: {
            flex: 0,
            height: '466 rem',            
        },
})

const AddPerson = () => { 
    const COLOR = 'snow'

    /* Hooks */
    const navigation = useNavigation()
    const modalDismiss = useModalBackground(COLOR)

    /* State */
    const [pageNumber, setPageNumber] = useState<number>(1)
    
    /* Functions */

    function _submitPage1(invitationCode: ?string) {
        setPageNumber(2)
    }
    
    function _submitPage2(shortName: ?string, color: string, reminderValue: ReminderValue) {
        _cancel()

        navigation.navigate( NavigationRoutes.PersonAdded )
    }

    function _cancel() {
        modalDismiss()
        navigation.goBack()
    }

    /* Render */
    return (
        <View style={{ backgroundColor: COLOR, ...styles.container }}>

            <View style={{ ...styles.titleContainer }}>
                <Text style={styles.title}>Add a new space</Text>
            </View>     

            <View style={{ ...styles.page }}>
            { 
                pageNumber === 1 ? 
                    <AddPersonPage1 submit={_submitPage1} cancel={_cancel}/> 
                : 
                    <AddPersonPage2 submit={_submitPage2} cancel={_cancel}/> 
            }
            </View>
        </View>
    )
}


const page1Styles = EStyleSheet.create({
    container: {              
        marginTop: '30 rem',
        marginBottom: '20 rem',
    },
        spaceTypeCard: {
            justifyContent: 'center',
            padding: '20 rem',
            marginVertical: '20 rem',
            backgroundColor: 'white',
            borderColor: 'black',
            borderWidth: 1,             
        },
            spaceTypeTitle: {
                fontSize: '15 rem',
                marginBottom: '5 rem',
                fontWeight: 'bold', 
                textAlign : 'center' 
            },
            spaceTypeSubtitle: {
                fontSize: '15 rem',
                marginTop: '5 rem',
                textAlign : 'center' 
            }, 
        button: {                                
            marginTop: 1,   
            marginBottom: '1 rem'      
        }
})
const AddPersonPage1 = ({ submit, cancel } 
    : { submit: (?string) => void, cancel: () => void }) => {

    /* Variables */
    const invitationCodeRef = useRef<Input>()

    /* State */
    const [newSpace, setNewSpace] = useState<?boolean>(null)
    const [invitationCode, setInvitationCode] = useState<?string>(null)

    /* Functions */

    function _setNewSpace(value: boolean) {
        if (value === true) {
            setNewSpace(true)
            setInvitationCode(null)
            invitationCodeRef.current.blur()
        } else if (value === false) {
            setNewSpace(false)
            invitationCodeRef.current.focus()
        }
    }

    function _reset() {
        setInvitationCode(null)
        setNewSpace(null)
    }

    function _submit() {
        // TODO: check invitation code is valid before passing it...
        if (invitationCode || newSpace) {
            submit(invitationCode)
        }        
    }

    /* Render */
    return (
        <>
            <View style={{ ...page1Styles.container }}>

                <TouchableOpacity activeOpacity={1} 
                    onPress={() => _setNewSpace(false)}
                >
                    <View style={{
                        ...page1Styles.spaceTypeCard,
                        opacity: newSpace === false ? 1.0 : 0.4
                    }}>
                        <Text style={ page1Styles.spaceTypeTitle }>
                            I RECEIVED AN INVITATION CODE
                        </Text>

                        <Input 
                            placeholder='Enter the code'
                            ref={ref => invitationCodeRef.current = ref}
                            onFocus={() => _setNewSpace(false)}
                            onSubmitEditing={() => {
                                if (!invitationCode) {
                                    _reset()
                                }
                            }}
                            returnKeyType='done'
                            value={ invitationCode }
                            onChangeText={val => setInvitationCode(val)}
                        />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={() => _setNewSpace(true)}
                >
                    <View style={{
                        ...page1Styles.spaceTypeCard,
                        opacity: newSpace === true ? 1.0 : 0.4
                    }}>
                        <Text style={page1Styles.spaceTypeTitle}>
                            I WANT TO CREATE A NEW SHARED SPACE
                        </Text>
                        <Text style={page1Styles.spaceTypeSubtitle}>
                            Create a new space and invite someone special to be part of it
                        </Text>                    
                    </View>
                </TouchableOpacity>
            </View>

            <View>
                <Button title='NEXT' onPress={_submit} 
                    buttonStyle={{...page1Styles.button, ...Theme.palette.button}}                     
                />
                <Button title='CANCEL' onPress={cancel} 
                    buttonStyle={{...page1Styles.button, ...Theme.palette.button}}
                />
            </View>

        </>
    )
}

const page2Styles = EStyleSheet.create({
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
                borderWidth: 0.5,
                borderColor: 'purple',
                borderRadius: '8 rem',
                color: 'black',                 
            },
        fieldText: {
            fontSize: '14 rem',
            color: 'grey',
        }
})

const ReminderValues = {
    NoNeed: 'I don\'t need reminders',
    EveryMorning: 'Every morning',
    EveryNight: 'Every night',
    EveryWeek: 'Every week',
    EveryOtherWeek: 'Every other week',
    EveryMonth: 'Every month'
}
type ReminderValue = $Keys<typeof ReminderValues>

const AddPersonPage2 = ({submit, cancel} : 
    {submit: (?string, string, ReminderValue) => void, cancel: () => void}) => {

    /* State */
    const [shortName, setShortName] = useState<?string>(null)
    const [color, setColor] = useState<string>(Theme.colors.spaceColors[0])
    const [reminderValue, setReminderValue]= useState<?ReminderValue>(null)

    /* Functions */
    function _submit() {
        if (reminderValue) {
            submit(shortName, color, reminderValue)
        }        
    }

    /* Render */
    return (
        <>
            <View style={ page2Styles.container }>                

                <View style={ page2Styles.basicInfoContainer }>

                    <View style={ page2Styles.basicInfoField }>
                        <Text style={ page2Styles.fieldText }>Short Name (optional)</Text>
                        <Input 
                            inputContainerStyle={{ marginHorizontal: -10 }}
                            placeholder="e.g. 'Dad', 'big Bro', 'BFF'"    
                            value={ shortName }
                            onChangeText={val => setShortName(val)}                
                        />
                    </View>

                    <View style={ page2Styles.basicInfoField }>                    
                        <Text style={ page2Styles.fieldText }>
                            Color (visual cue for the space)
                        </Text>
                        <View style={ page2Styles.colorsContainer }>
                        {
                            Theme.colors.spaceColors.map( item => 
                                <TouchableOpacity key={item} 
                                    activeOpacity={1}
                                    onPress={() => setColor(item)}
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

                    <View style={page2Styles.previewContainer}>
                        <Profile id='-1' width={0.5}
                            profile={shortName}                            
                            color={color}
                        />                        
                    </View>
                </View>                

                <View style={page2Styles.remindersContainer}>

                    <Text style={page2Styles.remindersTitle}>
                        How often would you like to be reminded to write something to this person?
                    </Text>
                    <RNPickerSelect 
                        style={{
                            inputIOS: page2Styles.remindersPickerIOS,
                            inputAndroid: page2Styles.remindersPickerAndroid,
                        }}
                        onValueChange={(value) => setReminderValue(value)}
                        items={ 
                            Object.keys(ReminderValues).map( key =>
                                { return { label: ReminderValues[key], value: key } }
                            )
                        }
                    />
                </View>
            </View>

            <View>
                <Button title='CREATE' onPress={ _submit } 
                    buttonStyle={{...page1Styles.button, ...Theme.palette.button}}                         
                />
                <Button title='CANCEL' onPress={ cancel } 
                    buttonStyle={{...page1Styles.button, ...Theme.palette.button}}
                />
            </View>
        </>
    )
}

export default AddPerson