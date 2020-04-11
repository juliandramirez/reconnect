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
import PostsManager from 'Reconnect/src/services/posts'
import { } from 'Reconnect/src/lib/utils'

import type { UploadModalProps } from './upload'
import { UploadModal, AddAttachments } from './upload'
import { PostEnvelope } from './../Components'


const NewPostView = () => {

    /* State */
    const [content, setContent] = useState<string>('1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20')
    const [publishing, setPublishing] = useState<boolean>(false)

    /* Variables */
    //$FlowExpectedError: not null
    const textRef = useRef<TextInput>(null)    

    const attachmentsRef = useRef<Array<Attachment>>([])
    const [uploadModalProps, setUploadModalProps] = useState<?UploadModalProps>(null)

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
        }      
    }

    /* Render */
    return (  
        <>    
            <Modal visible={uploadModalProps != null} transparent={true}>
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