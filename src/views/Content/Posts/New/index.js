/**
 * @flow
 */

import React, { useLayoutEffect, useState, useRef } from 'react'
import { View, ScrollView, TextInput, BackHandler, Alert, Modal } from 'react-native'
import { Button } from 'react-native-elements'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native'
import { HeaderBackButton } from '@react-navigation/stack'

import Theme from 'Reconnect/src/theme/Theme'
import { showSuccessMessage, showErrorMessage, stringNotEmpty } from 'Reconnect/src/lib/utils'
import type { Attachment } from 'Reconnect/src/services/posts'
import SpacesManager from 'Reconnect/src/services/spaces'
import PostsManager from 'Reconnect/src/services/posts'
import NotificationsManager from 'Reconnect/src/services/notifications'
import { } from 'Reconnect/src/lib/utils'

import type { UploadModalProps } from './upload'
import UploadModal from './upload'
import AddAttachments from './attachment'
import { PostEnvelope } from './../Components'


const NewPostView = () => {

    /* State */
    const [content, setContent] = useState<string>('')
    const [publishing, setPublishing] = useState<boolean>(false)

    /* Variables */
    //$FlowExpectedError: not null
    const textRef = useRef<TextInput>(null)    

    const attachmentsRef = useRef<Array<Attachment>>([])
    const [uploadModalProps, setUploadModalProps] = useState<?UploadModalProps>()

    /* Hooks */
    const navigation = useNavigation()
    const route = useRoute()

    /* Properties */
    const { space } = route.params

    useLayoutEffect( () => {
        navigation.setOptions({
            headerRight: () => (
                <Button title='PUBLISH' type='clear' 
                    loading={publishing}
                    loadingProps={{color: 'darkgrey'}}
                    titleStyle={{color: 'black'}}                     
                    onPress={_save}                    
                    containerStyle={{paddingRight: 8}}                    
                />
            ),
            headerLeft: () => (
                <HeaderBackButton 
                    labelVisible={false} 
                    tintColor='black' 
                    onPress={_dismiss} 
                />                
            )
        })
    }, [navigation, content, publishing] )

    useFocusEffect( _androidBackHandler, [])
    function _androidBackHandler() {
        const onBackPress = () => {            
            _dismiss()
            return true
        }

        BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }    
    
    /* Helper Functions */

    function _addingAttachment(adding) {
        // prevent publishing while adding
        setPublishing(adding)
    }

    function _attachmentsUpdated(attachments: Array<Attachment>) {
        attachmentsRef.current = attachments
    }

    function _dismiss() {            
        if (stringNotEmpty(content) || attachmentsRef.current?.length > 0) {  

            Alert.alert('Post wasn\'t published', 'Dismiss post without publishing?', [{
                    text: 'Don\'t dismiss',
                    style: 'cancel'
                }, {
                    text: 'Dismiss Post',
                    onPress: navigation.goBack
                },                
            ], {
                cancelable: true,
            })
        } else {
            navigation.goBack()
        }
    }

    function _save() {
        const doSendPost = async (attachments) => {
            try { 
                await PostsManager.addPost({ 
                    spaceId: space.id, 
                    text: content, 
                    attachments
                })

                navigation.goBack()
                showSuccessMessage('Post published')
                SpacesManager.notifyUserPublishedNewPost(space)
            } catch {
                showErrorMessage('Post could not be published')
                setPublishing(false) 
            }
        }  

        if (stringNotEmpty(content)) {
            setPublishing(true)            

            if (attachmentsRef.current.length == 0) {      
                doSendPost([])
            } else {
                setUploadModalProps({
                    spaceId: space.id, 
                    attachments: attachmentsRef.current,
                    success: async (attachments) => { 
                        setUploadModalProps(null)                       
                        doSendPost(attachments)
                    },
                    error: (e) => {
                        if (e != 'upload-cancelled') {
                            showErrorMessage('Post could not be published')                      
                        }                        
                        setPublishing(false)
                        setUploadModalProps(null)
                    },
                })
            }
        } else {
            showErrorMessage('Can not publish an empty post')
        }     
    }

    /* Render */
    return (  
        <>    
            <Modal animationType='fade' visible={uploadModalProps != null}>
                <UploadModal {...uploadModalProps} />
            </Modal>  
            <>
                {/* TEXT */}
                <View style={{ flex: 1, backgroundColor: 'white' }}>
 
                    <TextInput                         

                        ref={ref => textRef.current = ref}                          
                        autoFocus={true}
                        onChangeText={ val => setContent(val) }
                        multiline={ true }     
                        placeholder='Share your thoughts'
                        placeholderTextColor='grey'
                        style={{                            
                            flex: 1,                            
                            backgroundColor: 'white',
                            paddingHorizontal: '5%',
                            fontSize: 13, 
                            fontFamily: 'the girl next door', 
                            textAlignVertical: 'top'
                        }}                         
                        value={content}                        
                    />
                    
                </View>

                {/* ATTACHMENTS */} 
                <View style={{flex: 0}}>
                    <AddAttachments 
                        addingAttachmentListener={_addingAttachment} 
                        attachmentListener={_attachmentsUpdated}/>
                </View>
                
            </>

            <KeyboardSpacer/>
        </>     
    )
}

export default NewPostView