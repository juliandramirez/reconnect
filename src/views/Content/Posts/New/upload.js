/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, Platform, Text, Alert, Keyboard } from 'react-native'
import { Button } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker'
import * as Progress from 'react-native-progress'

import { showSuccessMessage, showErrorMessage, goToSettingsAlert, wait } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'
import type { Attachment } from 'Reconnect/src/services/posts'
import PostsManager from 'Reconnect/src/services/posts'
import EStyleSheet from 'react-native-extended-stylesheet'


/* Types */
export type UploadModalProps = {| 
    spaceId : string, 
    attachments: Array<Attachment>,
    success: (Array<Attachment>) => any,
    error: Function,
|}

const modalStyles = EStyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Theme.colors.appBackground        
    },
    pie: {
        fontSize: '125 rem',
        padding: '8 rem'
    },  
    pieContainer: {
        marginBottom: '10 rem'
    },
    itemsContainer: {
        marginBottom: '5 rem'
    },
        barProgress: {
            marginTop : 10
        },
        bar: {
            height: '8 rem'
        },
    button: {
        fontSize: '18 rem',
        color: '#333',  
        letterSpacing: '1 rem'
    }
    
})

const PIE_COLOR = 'black'
const BAR_COLOR = '#bbb'

export const UploadModal = ({ spaceId, attachments, success, error } : UploadModalProps ) => {

    /* State */
    const [progress, setProgress] = useState<{total: number, each: Array<number>}>({total: 0, each:[0]})
    const [finished, setFinished] = useState<boolean>(false)
    const [cancelling, setCancelling] = useState<boolean>(false)

    /* References */
    const cancelHookRef = useRef<Function>(() => {})

    /* Effects */
    useEffect(_init, [])

    /* Functions */
    function _init() {
        Keyboard.dismiss()

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
        setCancelling(true)
        cancelHookRef.current()        
    }

    /* Render */
    return (
        <View style={ modalStyles.container }>

            <View style={ modalStyles.pieContainer }>
                <Progress.Circle 
                    showsText={true}
                    progress={ !progress.total ? 0 : 
                        progress.total == 100 ? 0.99 : progress.total / 100.0 } 
                    animated={true}
                    size={ modalStyles._pie.fontSize }
                    thickness={ modalStyles._pie.padding }
                    color={ PIE_COLOR }
                />
            </View>

            {
                progress.each.length > 1 ?
                    <View style={ modalStyles.itemsContainer }>
                    {
                        progress.each.map( (item, index) => 
                            <Progress.Bar key={index} 
                                progress={ ( item ?? 0 ) / 100.0 } 
                                height={ modalStyles._bar.height }
                                style={ modalStyles.barProgress }
                                color={ BAR_COLOR }
                            />)
                    }
                    </View>
                : 
                    <></>
            }
            
            { 
                finished ? <></> :
                    <View>
                        <Button title='CANCEL' type='clear' 
                            loading={cancelling}
                            loadingProps={{color: 'darkgrey'}}
                            disabled={finished}
                            onPress={_cancel} 
                            titleStyle={ modalStyles.button }
                        />
                    </View>            
            }
            

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