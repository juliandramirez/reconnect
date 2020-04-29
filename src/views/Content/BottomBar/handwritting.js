/**
 * @flow
 */

import { Alert } from 'react-native'
import ImagePicker from 'react-native-image-picker'
import vision from '@react-native-firebase/ml-vision'

import type { Attachment, PostInput } from 'Reconnect/src/services/posts'
import { goToSettingsAlert, wait, showErrorMessage } from 'Reconnect/src/lib/utils'


export function useHandwrittenPost(): () => Promise<?PostInput> {

    /* Helper Functions */
    async function _takePhotos(): Promise<?Array<Attachment>> {

        // function for recursive calling
        const doTakePhotos = (previousPhotos: Array<Attachment>): Promise<?Array<Attachment>> => {
            return new Promise<?Array<Attachment>>( resolve => {
                _takePhoto().then( (photo) => {
                    // if user cancels for any photo, cancel the complete flow
                    if(!photo) {
                        resolve(null)
                    } else {
                        Alert.alert('Add more content', 'Is there more handwritten content for your letter?', [{
                                text: 'Photograph more content',
                                onPress: () => {
                                    // recursive call...
                                    doTakePhotos([...previousPhotos, photo]).then( (photos) => resolve(photos) )
                                }
                            }, {
                                text: 'No more content',
                                style: 'cancel',
                                onPress: () => resolve([...previousPhotos, photo])
                            }
                        ], {
                            cancelable: false
                        })
                    }
                })
            })            
        }

        return await doTakePhotos([])
    }

    async function _takePhoto(): Promise<?Attachment> {
        // handler function for image picker response...
        const _onSelectedMedia = async (response) : Promise<?Attachment> => {
            if (response.didCancel) {
                return null
            }    
            if (response.error) {
                if (response.error.toLowerCase().includes('permission')) {
                    await goToSettingsAlert({
                        title: 'Permissions disabled',
                        message: 'To take photos you must enable camera permissions in settings', 
                        cancelButtonText: 'Cancel'
                    })                
                } else {
                    showErrorMessage('Selected photo can not be processed')            
                }
                return null                       
            }            
            // libary is buggy :( need to give it a second or so to process
            await wait(1000)
    
            const attachment = {
                metadata: {
                    latitude: response.latitude,
                    longitude: response.longitude,
                    timestamp: response.timestamp,
                },
                url: response.uri,
                type: 'image',
                // library does work with ios well...on android it can not detect it
                mediaType: response.type ?? 'image/jpeg'
            }
    
            return attachment
        }

        return new Promise<?Attachment>( (resolve, reject) => {
            ImagePicker.launchCamera({
                    mediaType: 'photo',                                    
                    allowsEditing: false,
                    noData: true,
                    quality: 0.8,
                }, (response) => { 
                    _onSelectedMedia(response).then( (attachment) => {
                        resolve(attachment)
                    })                    
                }            
            )  
        })          
    }

    async function _processPhotos(photos: Array<Attachment>): Promise<string> {
        const PARAGRAPH_SEPARATOR = ' '
        const BLOCK_SEPARATOR = ' \n'
        const PHOTO_SEPARATOR = '\n\n'

        const processedPhotosText = await Promise.all(
            photos.map( (photo) => new Promise<string>( resolve => {
                    vision().cloudDocumentTextRecognizerProcessImage(photo.url)
                    .then( processed => { 

                        const result = processed.blocks.reduce( (accumBlock, block) => { 

                            const processedBlock = block.paragraphs.reduce( (accumParagraph, paragraph) => {
                                    const newParagraph = paragraph.text.trim().replace(/(\r\n|\n|\r)/gm, ' ')
                                    return `${accumParagraph}${PARAGRAPH_SEPARATOR}${newParagraph.trim()}`
                            }, '')
                            
                            return `${accumBlock}${BLOCK_SEPARATOR}${processedBlock.trim()}`
                        }, '')

                        resolve(result.trim())
                    })
                })
            )
        )

        const resultText = processedPhotosText.reduce((accumulator, currentValue) => {
            return `${accumulator}${PHOTO_SEPARATOR}${currentValue}`
        }, '')

        return resultText.trim()
    }    

    /* Public API */

    async function newHandwrittenPost() : Promise<?PostInput> {

        const start = await new Promise<boolean>( resolve => {
            Alert.alert('Prepare camera', 'Make sure to have good lighting and to focus the text while taking the photos', [{
                    text: 'Start',
                    onPress: () => {
                        resolve(true)
                    }
                }, {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => { 
                        resolve(false)
                    }
                }
            ], {
                cancelable: false
            })
        })

        if (!start) {
            return
        }

        const photos = await _takePhotos()
        if (!photos) {
            return null
        } else {
            const content = await _processPhotos(photos)

            return await new Promise<PostInput>( resolve => {
                Alert.alert('Attach photos to letter', 'Do you want to include the photos in your letter?', [{
                        text: 'Attach photos',
                        onPress: () => {
                            resolve({ content, photos })
                        }
                    }, {
                        text: 'Delete photos',
                        style: 'cancel',
                        onPress: () => { 
                            resolve({ content, photos: [] })
                        }
                    }
                ], {
                    cancelable: false
                })
            })
        }
    }

    return newHandwrittenPost
}