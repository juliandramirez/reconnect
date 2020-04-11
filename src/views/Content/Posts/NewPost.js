/**
 * @flow
 */

import React, { useLayoutEffect, useState, useEffect, useRef } from 'react'
import { View, Image, TextInput, Platform, Dimensions, Text, Keyboard, BackHandler, Alert, Modal } from 'react-native'
import { Button } from 'react-native-elements'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import ImagePicker from 'react-native-image-picker'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native'
import { HeaderBackButton } from '@react-navigation/stack'
import { showSuccessMessage, showErrorMessage, goToSettingsAlert } from 'Reconnect/src/lib/utils'
import * as Progress from 'react-native-progress'

import Theme from 'Reconnect/src/theme/Theme'
import type { Attachment } from 'Reconnect/src/services/posts'
import PostsManager from 'Reconnect/src/services/posts'
import { KeyboardShown, stringNotEmpty } from 'Reconnect/src/lib/utils'

import { PostEnvelope } from './Components'


const NewPostView = () => {

    /* State */
    const [content, setContent] = useState<string>('')
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

    function _attachmentsUpdated(attachments: Array<Attachment>) {
        attachmentsRef.current = attachments
    }

    function _dismiss() {            
        if (stringNotEmpty(content) || attachmentsRef.current?.length > 0) {            
            Alert.alert('Post wasn\'t published', 'Dismiss post without publishing?', [{
                    text: 'Cancel',
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
        const doSendPost = async () => {
            try { 
                await PostsManager.addPost({ 
                    spaceId: space.id, 
                    text: content, 
                    attachments: []
                })

                navigation.goBack()
                showSuccessMessage('Post published')
            } catch {
                showErrorMessage('Post could not be published')
                setPublishing(false) 
            }
        }  

        if (stringNotEmpty(content)) {
            Keyboard.dismiss()
            setPublishing(true)            

            if (attachmentsRef.current.length == 0) {      
                doSendPost()
            } else {
                setUploadModalProps({
                    spaceId: space.id, 
                    attachments: attachmentsRef.current,
                    success: async (attachments) => { 
                        setUploadModalProps(null)                       
                        doSendPost()
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
                        ref={ref => textRef.current = ref}
                        value={content}
                        onChangeText={val => setContent(val)}          
                    />

                    <KeyboardShown>
                        <Button 
                            onPress={() => { 
                                textRef.current.focus()
                                Keyboard.dismiss()
                            }} 
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
                    <AddAttachments attachmentListener={_attachmentsUpdated}/>
                </View>
                
            </>

            <KeyboardSpacer/>
        </>     
    )
}

type UploadModalProps = {| 
    spaceId : string, 
    attachments: Array<Attachment>,
    success: (Array<Attachment>) => any,
    error: Function,
|}
const UploadModal = ({ spaceId, attachments, success, error } : UploadModalProps ) => {

    /* State */
    const [progress, setProgress] = useState<{total: number, each: Array<number>}>({total: 0, each:[0]})
    const [finished, setFinished] = useState<boolean>(false)

    /* References */
    const cancelHookRef = useRef<Function>(() => {})

    /* Effects */
    useEffect(_init, [])

    /* Functions */
    function _init() {
        const progressListener = (total, each) => {
            setProgress({total, each})
        }

        const addPostFuture = PostsManager.uploadAttachments({ 
            spaceId,
            attachments,
            progressListener
        })

        cancelHookRef.current = addPostFuture.cancelHook

        addPostFuture.promise.then( (attachments) => {
            setFinished(true)
            success(attachments)
        }).catch((e) => error(e))
    }

    function _cancel() {
        cancelHookRef.current()
    }

    /* Render */
    return (
        <View style={{flex: 1,
            justifyContent: "center",
            alignItems: "center"}}>

            <Progress.Circle 
                showsText={true}
                progress={progress.total / 100.0} 
                animated={true}
                size={50}
                color={'red'}
            />
            {
                progress.each.map(i=><Progress.Bar progress={i/100.0} />)
            }

            <Button title='CANCEL' disabled={finished}
                onPress={_cancel} 
            />
        </View>
    )
}

const AddAttachments = ({ attachmentListener } : { attachmentListener: (Array<Attachment>) => any }) => {
    
    /* State */
    const [attachments, setAttachments] = useState<Array<Attachment>>([])
    const [adding, setAdding] = useState<boolean>(false)

    /* Effects */
    useEffect(_notifyAttachmentChange, [attachments])

    /* Functions */
    function _notifyAttachmentChange() {
        attachmentListener(attachments)
    }

    function _addMedia() {
        Keyboard.dismiss()
        setAdding(true)
        ImagePicker.showImagePicker({
                takePhotoButtonTitle: 'Take Photo or Video',
                title: '',
                mediaType: 'mixed',                                    
                allowsEditing: false,
                noData: true,
                quality: 0.8,
                videoQuality: Platform.OS == 'ios' ? 'medium' : 'high'
            }, (response) => {
                _onSelectedMedia(response)
                setAdding(false)
            }            
        )        
    }

    function _onSelectedMedia(response) {
        if (response.didCancel) {
            return
        }

        if (response.error) {
            if (response.error.toLowerCase().includes('permission')) {
                goToSettingsAlert({
                    title: 'Permissions disabled',
                    message: 'To attach media you must enable media permissions in settings', 
                    cancelButtonText: 'I don\'t want attachments'
                })
            } else {
                showErrorMessage('Selected media can not be attached')            
            }
            
            return
        }        

        const type = response.height && response.width ? 'image' : 'video'
        const attachment = {
            metadata: {
                latitude: response.latitude,
                longitude: response.longitude,
                timestamp: response.timestamp,
            },
            url: response.uri,
            type
        }

        setAttachments([...attachments, attachment])

        showSuccessMessage(`${type} attached to the post`)
    }

    function _numberOfAtachments(): string {
        const numberOfImages = attachments.filter( attachment => attachment.type == 'image' ).length
        const numberOfVideos = attachments.filter( attachment => attachment.type == 'video' ).length

        return `${numberOfImages} images added | ${numberOfVideos} videos added`
    }

    function _clearAttachments() {
        showSuccessMessage(`media attachments removed`)
        setAttachments([])
    }

    /* Render */
    return (
        <View style={{                         
            borderColor: Theme.colors.contentBorders, 
            borderTopWidth: 1, 
        }}>
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>

                <View style={{ paddingTop: '3%' }}>
                    <Text style={{ fontSize: 18, color: Theme.colors.contentBorders, textAlignVertical: 'center' }}>
                        {_numberOfAtachments()}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'stretch'}}>

                    <View style={{ flex: 1 }}>
                        <Button
                            title='ADD MEDIA' 
                            loading={adding}
                            loadingProps={{color: 'darkgrey'}}
                            type='clear'                            
                            titleStyle={{ color: 'black', letterSpacing: 0.5, fontWeight: '400' }}
                            
                            onPress={_addMedia}
                        />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Button disabled={attachments.length == 0}
                            title='CLEAR MEDIA' 
                            type='clear'
                            titleStyle={{ color: '#E57369', letterSpacing: 0.5, fontWeight: '400' }}
                            onPress={_clearAttachments}
                        />
                    </View>
                    
                </View>

            </View>
        </View>
    )
}

export default NewPostView