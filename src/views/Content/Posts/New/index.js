/**
 * @flow
 */

import React, { useLayoutEffect, useState, useRef } from 'react'
import { View, ScrollView, TextInput, BackHandler, Alert, Modal, Platform } from 'react-native'
import { Button } from 'react-native-elements'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native'
import { HeaderBackButton } from '@react-navigation/stack'

import Theme from 'Reconnect/src/theme/Theme'
import { showSuccessMessage, showErrorMessage, stringNotEmpty } from 'Reconnect/src/lib/utils'
import type { Attachment, Post, PostInput, PostSource } from 'Reconnect/src/services/posts'
import type { Draft } from 'Reconnect/src/services/drafts'
import type { Space } from 'Reconnect/src/services/spaces'
import SpacesManager from 'Reconnect/src/services/spaces'
import DraftsManager from 'Reconnect/src/services/drafts'
import PostsManager from 'Reconnect/src/services/posts'
import NotificationsManager from 'Reconnect/src/services/notifications'
import DialogInput from 'Reconnect/src/lib/DialogInput'

import type { UploadModalProps } from './upload'
import UploadModal from './upload'
import AddAttachments from './attachment'


const NewPostView = () => {

    /* Hooks */
    const navigation = useNavigation()
    const route = useRoute()

    /* Properties */
    const { space, draft, editPost, postInput } : { 
        space: Space,
        draft?: Draft,        
        editPost?: Post,
        postInput?: PostInput
    } = route.params    

    const editMode = editPost != null
    //$FlowExpectedError: Not null
    const initialContent = editMode ? editPost.content : draft ? draft.content : postInput ? postInput.content : ''
    //$FlowExpectedError: Not null
    const initialTitle = editMode ? editPost.title : null
    //$FlowExpectedError: Not null
    const initialAttachments = editMode ? editPost.attachments : postInput ? postInput.photos : []    

    /* State */
    const [content, setContent] = useState<string>(initialContent)
    const [publishing, setPublishing] = useState<boolean>(false)
    const [uploadModalProps, setUploadModalProps] = useState<?UploadModalProps>(null)
    const [titleDialogVisible, setTitleDialogVisible] = useState<boolean>(false)    

    /* Variables */
    //$FlowExpectedError: not null
    const textRef = useRef<TextInput>()    
    const attachmentsRef = useRef<Array<Attachment>>(initialAttachments)
    const previousAttachmentsRef = useRef<Array<Attachment>>(editPost?.attachments ?? [])

    useLayoutEffect( () => {
        navigation.setOptions({
            headerTitle: editMode ? 'Edit Letter' : 
                space.configuration?.shortName ?
                //$FlowExpectedError: Not null 
                    `To: ${Platform.OS == 'ios' ? space.configuration.shortName.substring(0, 6) : space.configuration.shortName}` 
                : 'New Letter',
            headerRight: () => (
                <Button title={editMode ? 'SAVE' : 'SEND'} type='clear' 
                    loading={publishing}
                    loadingProps={{color: 'darkgrey'}}
                    titleStyle={{color: 'black'}}                     
                    onPress={ _startSend }                    
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
    }, [navigation, content, publishing, uploadModalProps] )

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

    function _newAttachments(): Array<Attachment> {
        const inPreviousAttachments = (attachment: Attachment) => {
            return previousAttachmentsRef.current.findIndex(item => item.url == attachment.url ) >= 0
        }

        return attachmentsRef.current.filter( attachment => !inPreviousAttachments(attachment))
    }

    function _clearAttachments() {
        previousAttachmentsRef.current = []
    }

    function _addingAttachment(adding: boolean) {
        // prevent publishing while adding
        setPublishing(adding)
    }

    function _attachmentsUpdated(attachments: Array<Attachment>) {
        attachmentsRef.current = attachments
    }

    function _dismiss() {
        if (uploadModalProps == null && !publishing) {
            if (
                (!editMode && stringNotEmpty(content)) || 
                (editMode && editPost?.content != content) ||
                _newAttachments().length > 0 || 
                //$FlowExpectedError: Not null
                (editMode && attachmentsRef.current.length < editPost.attachments.length) 
            ) {  
                
                const alertMessages = editMode ? {
                    title: 'Changes weren\'t saved',
                    message: 'Dismiss changes without saving?',
                    cancelButton: 'Don\'t dismiss',
                    continueButton: 'Dismiss changes'
                } : {
                    title: 'Letter was not sent',
                    message: 'Dismiss letter without sending?',
                    cancelButton: 'Don\'t dismiss',
                    continueButton: 'Dismiss Letter'
                }
    
                Alert.alert(alertMessages.title, alertMessages.message, [{
                        text: alertMessages.cancelButton,
                        style: 'cancel'
                    }, {
                        text: alertMessages.continueButton,
                        onPress: navigation.goBack
                    },                
                ], {
                    cancelable: true,
                })
            } else {
                navigation.goBack()
            }
        }        
    }

    function _startSend() {
        if (stringNotEmpty(content)) {
            setPublishing(true)
            setTitleDialogVisible(true)
        } else {
            showErrorMessage('Can not send an empty letter')
        } 
    }
    
    function _save(title: ?string) {
        const doSendPost = async (attachments) => {            
            try { 
                if (editMode) {                    
                    await PostsManager.editPost({ 
                        //$FlowExpectedError: Not null                       
                        id: editPost.id, 
                        content,
                        title: title ? title.trim() : null,
                        attachments
                    })
                } else {
                    await PostsManager.addPost({ 
                        source: draft ? 'email' : postInput ? 'handwritten' : 'device',
                        spaceId: space.id, 
                        content, 
                        title: title ? title.trim() : null,
                        attachments
                    })
                    SpacesManager.notifyUserPublishedNewPost(space)

                    if (draft) {
                        DraftsManager.deleteDraft(draft.id)
                    }

                    showSuccessMessage('Letter sent')
                }

                navigation.goBack()                
            } catch {
                showErrorMessage('Check your internet connection')
                setPublishing(false) 
            }
        }  

        const newAttachments = _newAttachments()
        if (newAttachments.length == 0) {      
            doSendPost([...previousAttachmentsRef.current])
        } else {                
            setUploadModalProps({
                spaceId: space.id, 
                attachments: newAttachments,
                success: async (attachments) => { 
                    setUploadModalProps(null)                    
                    doSendPost([...previousAttachmentsRef.current, ...attachments])
                },
                error: (e) => {
                    if (e != 'upload-cancelled') {
                        showErrorMessage('Check your internet connection')
                    }                        
                    setPublishing(false)
                    setUploadModalProps(null)
                },
            })
        }    
    }

    /* Render */
    return (  
        <>    
            <Modal animationType='fade' visible={uploadModalProps != null}>
                <UploadModal {...uploadModalProps} />
            </Modal>  

            <DialogInput isDialogVisible={titleDialogVisible}
                title={ 'Title your letter'}
                message={ 'Leave blank for untitled' }   

                submitText={ editMode ? 'Save letter' : 'Send letter' }
                cancelText={'Cancel'}

                submitInput={ (inputText) => {                         
                        setTitleDialogVisible(false)                            
                        _save(inputText)   
                    } 
                }
                closeDialog={ () => { 
                        setTitleDialogVisible(false)
                        setPublishing(false)
                    }}                
                initValueTextInput={initialTitle}
                modalStyle={{backgroundColor: 'rgba(0,0,0,0.62)'}}>
            </DialogInput>

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
                            fontSize: 14, 
                            fontFamily: 'the girl next door', 
                            textAlignVertical: 'top'
                        }}                         
                        value={content}  
                        editable={!publishing}                     
                    />
                    
                </View>

                {/* ATTACHMENTS */} 
                <View style={{flex: 0}}>
                    <AddAttachments 
                        addingAttachmentListener={_addingAttachment}
                        clearAttachmentsListener={_clearAttachments} 
                        attachmentListener={_attachmentsUpdated}
                        previousAttachments={attachmentsRef.current}
                    />
                </View>
                
            </>

            <KeyboardSpacer/>
        </>     
    )
}

export default NewPostView