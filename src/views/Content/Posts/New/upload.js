/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, Platform, Text, Alert } from 'react-native'
import { Button } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker'
import * as Progress from 'react-native-progress'

import { showSuccessMessage, showErrorMessage, goToSettingsAlert, wait } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'
import type { Attachment } from 'Reconnect/src/services/posts'
import PostsManager from 'Reconnect/src/services/posts'


/* Types */
export type UploadModalProps = {| 
    spaceId : string, 
    attachments: Array<Attachment>,
    success: (Array<Attachment>) => any,
    error: Function,
|}
export const UploadModal = ({ spaceId, attachments, success, error } : UploadModalProps ) => {

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
                progress={ progress.total ?? 0 / 100.0 } 
                animated={true}
                size={50}
                color={'red'}
            />
            {
                progress.each.map( (item, index) => <Progress.Bar key={index} progress={ item ?? 0 / 100.0 } />)
            }

            <Button title='CANCEL' disabled={finished}
                onPress={_cancel} 
            />
        </View>
    )
}

export const AddAttachments = ({ addingAttachmentListener, attachmentListener } : { 
        addingAttachmentListener: (boolean) => any, 
        attachmentListener: (Array<Attachment>) => any }) => {
    
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
        const showImagePicker = (mediaType) => {
                ImagePicker.showImagePicker({
                    takePhotoButtonTitle: 'Use camera',
                    title: '',
                    mediaType: mediaType,                                    
                    allowsEditing: false,
                    noData: true,
                    quality: 0.8,
                    videoQuality: Platform.OS == 'ios' ? 'medium' : 'high'
                }, (response) => {                    
                    _onSelectedMedia(response)
                    setAdding(false)
                    addingAttachmentListener(false)
                }            
            )
        }

        setAdding(true)
        addingAttachmentListener(true)

    // WE NEED AN INTERMEDIATE STEP...MIXED CONTENT IS BUGGY AS HELL :(
        Alert.alert('Media type', 'What type of media would you like to add?', [ {
                text: 'Video',
                onPress: () => showImagePicker('video')
            }, {
                text: 'Image',
                onPress: () => showImagePicker('image')
            }
        ], {
            cancelable: true,
            onDismiss: () => { 
                setAdding(false)
                addingAttachmentListener(false)
            }
        }) 
    }

    async function _onSelectedMedia(response) {
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

        // libary is buggy :( need to give it a second or so to process
        await wait(1000)
console.log(response.type)
        const type = response.height && response.width ? 'image' : 'video'
        const attachment = {
            metadata: {
                latitude: response.latitude,
                longitude: response.longitude,
                timestamp: response.timestamp,
            },
            url: response.uri,
            type,
            // library does work with ios well...on android it can not detect it
            mediaType: response.type ?? type == 'video' ? 'video/mp4' : 'image/jpeg'
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
            borderTopWidth: 1
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