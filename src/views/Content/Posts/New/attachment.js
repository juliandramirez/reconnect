/**
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { View, Platform, Text, Alert } from 'react-native'
import { Button } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker'

import { showSuccessMessage, showErrorMessage, goToSettingsAlert, wait } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'
import type { Attachment } from 'Reconnect/src/services/posts'


const AddAttachments = ({ clearAttachmentsListener, previousAttachments, addingAttachmentListener, attachmentListener } : { 
    clearAttachmentsListener: () => any,
    previousAttachments: Array<Attachment>,
    addingAttachmentListener: (boolean) => any, 
    attachmentListener: (Array<Attachment>) => any }) => {

    /* State */
    const [attachments, setAttachments] = useState<Array<Attachment>>(previousAttachments)
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
        const doClear = () => {
            showSuccessMessage(`media attachments removed`)
            setAttachments([])
            clearAttachmentsListener()
        }

        if (previousAttachments.length > 0) {
            Alert.alert('Remove all media', 'Are you sure you want to remove ALL media attached to this post?', [{
                        text: 'No',
                        style: 'cancel'                        
                    }, {
                        text: 'Yes',
                        onPress: doClear
                    }
                ], {
                    cancelable: false,
                })            
        } else {
            doClear()
        }        
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
)}

export default AddAttachments