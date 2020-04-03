/**
 * @flow
 */

import React, { useState } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { Button, Input } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import EStyleSheet from 'react-native-extended-stylesheet'

import Theme from 'Reconnect/src/theme/Theme'

const styles = EStyleSheet.create({
    titleContainer: {
        marginLeft: '20 rem',
        marginBottom: '30 rem'
    },
        title: {
            fontSize: '28 rem',  
            textTransform: 'capitalize',
            color: '#555555',
        },
    optionsContainer: {
        marginBottom: '20 rem'
    },
        spaceTypeCard: {
            flex: 0, 
            justifyContent: 'center',
            padding: '20 rem',
            margin: '20 rem',
            backgroundColor: 'white',
            borderColor: 'black',
            borderWidth: 1, 
            opacity: 0.5
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
        backgroundColor: 'black',
        marginTop: 1,
        height: '50 rem',  
        borderRadius: 0      
    }
})

const AddPerson = () => {    
    /* Hooks */
    const navigation = useNavigation()

    /* State */
    const spaceCode = useState<?string>(null)
    

    return (
        <View style={{ flex: 1, backgroundColor: 'snow' }}>
        
            <View style={{ flex: 1, justifyContent: 'flex-end', ...styles.titleContainer }}>
                <Text style={styles.title}>Add a new space</Text>
            </View>

            <View style={{ flex: 0, justifyContent: 'flex-end', ...styles.optionsContainer }}>
                <TouchableOpacity activeOpacity={1}>
                    <View style={styles.spaceTypeCard}>
                        <Text style={styles.spaceTypeTitle}>
                            I RECEIVED AN INVITATION CODE
                        </Text>

                        <Input placeholder='Enter the code'/>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={1}>
                    <View style={styles.spaceTypeCard}>
                        <Text style={styles.spaceTypeTitle}>
                            I WANT TO CREATE A NEW SHARED SPACE
                        </Text>
                        <Text style={styles.spaceTypeSubtitle}>
                            Create a new space and invite someone special to be part of it
                        </Text>                    
                    </View>
                </TouchableOpacity>
            </View>


            <View style={{ flex: 0 }}>
                <Button title='NEXT' buttonStyle={styles.button}/>
                <Button title='CANCEL' onPress={navigation.goBack} buttonStyle={styles.button}/>
            </View>

        </View>
    )
}

export default AddPerson