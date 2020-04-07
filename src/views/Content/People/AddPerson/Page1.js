/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Button, Input } from 'react-native-elements'
import EStyleSheet from 'react-native-extended-stylesheet'

import Theme from 'Reconnect/src/theme/Theme'
import { showErrorNotification, showSuccessNotification, hideNotification } from 'Reconnect/src/lib/utils'
import ContentManager from 'Reconnect/src/services/content'
import type { Space } from 'Reconnect/src/services/content'


const styles = EStyleSheet.create({
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

const Page1 = ({ submit, cancel } 
    : { submit: (?Space) => void, cancel: () => void }) => {

    /* Variables */
    const invitationCodeRef = useRef<Input>()

    /* State */
    const [submitting, setSubmitting] = useState<boolean>(false)
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

    async function _submit() {        
        if (!submitting && (invitationCode || newSpace)) {
            hideNotification()
            
            if (invitationCode) {
                setSubmitting(true)

                const space = await ContentManager.getSpaceWithInvitationCode(invitationCode)
                if (space == null) {
                    showErrorNotification('Invalid invitation code')                    
                    setSubmitting(false)
                } else {
                    submit(space)
                }                
            } else if (newSpace) {
                submit(null)
            }            
        }        
    }

    /* Render */
    return (
        <>
            <View style={{ ...styles.container }}>

                <TouchableOpacity activeOpacity={1} 
                    onPress={() => _setNewSpace(false)}
                >
                    <View style={{
                        ...styles.spaceTypeCard,
                        opacity: newSpace === false ? 1.0 : 0.4
                    }}>
                        <Text style={ styles.spaceTypeTitle }>
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
                        ...styles.spaceTypeCard,
                        opacity: newSpace === true ? 1.0 : 0.4
                    }}>
                        <Text style={styles.spaceTypeTitle}>
                            I WANT TO CREATE A NEW SHARED SPACE
                        </Text>
                        <Text style={styles.spaceTypeSubtitle}>
                            Create a new space and invite someone special to be part of it
                        </Text>                    
                    </View>
                </TouchableOpacity>
            </View>

            <View>
                <Button title='NEXT' onPress={_submit} loading={submitting}
                    buttonStyle={{...styles.button, ...Theme.palette.button}}                     
                />
                <Button title='CANCEL' onPress={cancel} 
                    buttonStyle={{...styles.button, ...Theme.palette.button}}
                />
            </View>

        </>
    )
}

export default Page1