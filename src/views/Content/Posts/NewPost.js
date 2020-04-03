/**
 * @flow
 */

import React, { useLayoutEffect } from 'react'
import { View, Image, TextInput, Platform, Dimensions, Text, Keyboard } from 'react-native'
import { Button } from 'react-native-elements'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import ImagePicker from 'react-native-image-picker'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'

import Theme from 'Reconnect/src/theme/Theme'
import { KeyboardShown } from 'Reconnect/src/lib/utils'

import { PostEnvelope } from './Components'


const NewPostView = () => {
    /* Hooks */
    const navigation = useNavigation()

    /* Effects */
    useLayoutEffect( () => {
        navigation.setOptions({
            headerRight: () => (
                <Button title='Save' type='clear' titleStyle={{color: 'black'}} />
            ),
        })
    }, [navigation] )

    /* Render */
    return (  
        <>      
            <>
                {/* TEXT */}
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <TextInput multiline={true}                 
                        placeholder='Share your thoughts'
                        placeholderTextColor='grey'
                        style={{ 
                            flex: 1,
                            marginHorizontal: '5%',
                            fontSize: 13, 
                            fontFamily: 'the girl next door', 
                            textAlignVertical: 'top'
                        }}           
                    />

                    <KeyboardShown>
                        <Button 
                            onPress={Keyboard.dismiss} 
                            type='clear' 
                            containerStyle={{ position: 'absolute', bottom: 0, right: 0 }} 
                            icon={
                                <MaterialIcons
                                    name='keyboard-hide'
                                    size={28}
                                    color="grey"
                                />
                            }
                        />
                    </KeyboardShown>
                </View>

                {/* ATTACHMENTS */} 
                <View style={{flex: 0}}>
                    <AddAttachments />
                </View>
                
            </>

            { Platform.OS === 'ios' ? <KeyboardSpacer/> : <></>}            
        </>     
    )
}

const AddAttachments = () => {
    return (
        <View style={{                         
            borderColor: Theme.colors.contentBorders, 
            borderTopWidth: 1, 
        }}>
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>

                <View style={{ paddingTop: '3%' }}>
                    <Text style={{ fontSize: 18, color: Theme.colors.contentBorders, textAlignVertical: 'center' }}>
                        0 images added | 0 videos added
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'stretch'}}>

                    <View style={{ flex: 1 }}>
                        <Button
                            title='ADD MEDIA' 
                            type='clear'                            
                            titleStyle={{ color: 'black', letterSpacing: 0.5, fontWeight: '400' }}
                            
                            onPress={() => {
                                ImagePicker.showImagePicker({
                                    takePhotoButtonTitle: 'Take Photo or Video',
                                    title: '',
                                    tintColor: 'black',
                                    mediaType: 'mixed',
                                    quality: 0.8,
                                    allowsEditing: false,
                                    noData: true
                                }, (response) => {

                                })
                            }}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Button disabled
                            title='CLEAR MEDIA' 
                            type='clear'                            
                            titleStyle={{ color: '#E57369', letterSpacing: 0.5, fontWeight: '400' }}
                        />
                    </View>
                    
                </View>

            </View>
        </View>
    )
}

export default NewPostView