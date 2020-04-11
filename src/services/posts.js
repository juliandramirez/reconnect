/**
 * @flow
 */

import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

import type { StringMap } from 'Reconnect/src/lib/utils'
import Constants from 'Reconnect/src/Constants'

import AuthManager from  './auth'


/* MARK: - Constants */

const COLLECTION_REF = firestore().collection(Constants.storageRefs.posts)

/* MARK: - Types */

export type Post = {|
    id: string,
    text: string,
    attachments: Array<Attachment>
|}

export type Attachment = {|
    type: 'image' | 'video',
    url: string,
    metadata: StringMap
|}

type UploadPromise<T> = {
    promise: Promise<T>,
    cancelHook?: ?(() => void)
}

export type PostError = 'upload-failed' | 'upload-cancelled'

/* MARK: - Services */

const PostsManager = {}

PostsManager.addPost = ({ spaceId, text, attachments, progressListener } 
        : { spaceId: string, 
            text: string, 
            attachments?: Array<Attachment>,
            progressListener?: (total: number, each: Array<number>) => any
        }) : UploadPromise<void> => {

    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    if (attachments && attachments.length > 0) {
        const attachmentsPromise = _uploadAttachments({ userId, spaceId, attachments, progressListener })
        const res = attachmentsPromise.promise.then((attachments) => _createPost({ userId, spaceId, text, attachments }))

        return { promise: res, cancelHook: attachmentsPromise.cancelHook }
    } else {
        const res = _createPost({ userId, spaceId, text, attachments: [] })
        return { promise: res, cancelHook: null }
    }    
}

async function _createPost({ userId, spaceId, text, attachments } : {
        userId: string,
        spaceId: string,
        text: string,
        attachments: Array<Attachment>
    }) {
    await COLLECTION_REF.add({
        spaceId,
        created: firestore.FieldValue.serverTimestamp(),
        content: text,
        authorId: userId,
        attachments
    })
}

function _uploadAttachments({ userId, spaceId, attachments, progressListener } : { 
        userId: string,
        spaceId: string, 
        attachments: Array<Attachment>,
        progressListener?: (total: number, each: Array<number>) => any
    }) : UploadPromise<Array<Attachment>> {

    // keep track of all cancel hooks and progress of every attachment
    let cancelHookArray = Array(attachments.length).fill(undefined)
    let progressArray = Array(attachments.length).fill(0)

    const signalProgressChange = () => {
        const totalSum = progressArray.reduce((a,b) => a + b, 0)
        const total = Math.floor(totalSum / attachments.length)

        if (progressListener) {            
            progressListener(total, progressArray)
        }
    }   

    // start all uploads
    const promise = Promise.all(
        attachments.map((attachment, index) => {
            // each progress listener reports to the 'global' progress listener
            const attachmentProgressListener = !progressListener ? null : (progress) => {
                progressArray[index] = progress
                signalProgressChange()
            }

            // get each cancel hook reference
            const attachmentPromise = _uploadAttachment({ 
                userId, spaceId, attachment, progressListener: attachmentProgressListener})

            cancelHookArray[index] = attachmentPromise.cancelHook
            
            // return the promise
            return attachmentPromise.promise
        })
    )

    // 'global' cancel cancels all uploads
    const cancelHook = () => cancelHookArray.forEach(cancelHook => cancelHook())

    return { promise, cancelHook }
}

// resolves with file url
function _uploadAttachment({ userId, spaceId, attachment, progressListener}
         : { userId: string,
             spaceId: string, 
             attachment: Attachment, 
             progressListener?: ?((number) => any) })
    : UploadPromise<Attachment> { 
                   
    const uniqueId = uuidv4()
    const fileRef = storage().ref(`${Constants.storageRefs.attachments}/${spaceId}/${userId}/${uniqueId}`)

    const metadata = {
        contentType: attachment.type == 'image' ? 'image/*' : 'video/*',
        cacheControl: Constants.attachmentCacheControlHeader
    }

    const uploadTask = fileRef.putFile(attachment.url, metadata)
    
    const uploadPromise = new Promise( (resolve, reject) => {        

        let lastPercentage = 0
        uploadTask.on('state_changed', 
            (snapshot) => {
                const percentage = Math.trunc((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        
                if (progressListener && lastPercentage != percentage) {
                    progressListener(percentage)
                    lastPercentage = percentage
                }                
            }, 
            (error) => {
                if (error.message && error.message.includes('cancelled')) {
                    reject('upload-cancelled')
                } else {
                    reject('upload-failed')
                }                
            },
            () => {
                fileRef.getDownloadURL().then( (url) => {
                    const uploadedAttachment = {
                        type: attachment.type,
                        metadata: attachment.metadata,
                        url,
                    }
                    
                    resolve(uploadedAttachment)
                })
            }
        )
    })

    return { promise: uploadPromise, cancelHook: () => uploadTask.cancel() }
}

export default PostsManager