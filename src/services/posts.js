/**
 * @flow
 */

import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

import CrashReportManager from 'Reconnect/src/lib/crashreports'
import type { StringMap, DataMap } from 'Reconnect/src/lib/utils'
import Constants, { RemoteConstants } from 'Reconnect/src/Constants'

import AuthManager from  './auth'
import type { Space } from './spaces'


/* MARK: - Constants */

const COLLECTION_REF = firestore().collection(Constants.storageRefs.posts)

/* MARK: - Types */

export type Moment = Object // flow and typescript do not bide well
export type Post = {|
    id: string,
    content: string,
    authorId: string,
    created: Moment,
    attachments: Array<Attachment>
|}

export type Attachment = {|
    type: 'image' | 'video',
    url: string,
    metadata: StringMap,
    mediaType? : ?string    
|}

export type UploadPromise<T> = {
    promise: Promise<T>,
    cancelHook?: ?(() => any)
}

export type PostError = 'upload-failed' | 'upload-cancelled'

/* MARK: - Services */

const PostsManager = {}

PostsManager.addPost = async ({ spaceId, content, attachments } : { 
            spaceId: string, 
            content: string, 
            attachments?: Array<Attachment>
    }) => {

    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    await COLLECTION_REF.add({
        spaceId,
        authorId: userId,
        authorUtcOffset: moment().utcOffset(),
        created: firestore.FieldValue.serverTimestamp(),        
        content,        
        attachments
    })  
}

PostsManager.uploadAttachments = ({ spaceId, attachments, progressListener } : { 
            spaceId: string, 
            attachments: Array<Attachment>,
            progressListener?: (total: number, each: Array<number>) => any
    }) : UploadPromise<Array<Attachment>> => {

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
                spaceId, attachment, progressListener: attachmentProgressListener})

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
function _uploadAttachment({ spaceId, attachment, progressListener } : { 
            spaceId: string, 
            attachment: Attachment, 
            progressListener?: ?((number) => any) 
    }) : UploadPromise<Attachment> { 
                   
    const uniqueId = uuidv4()
    const fileRef = storage().ref(`${Constants.storageRefs.attachments}/${spaceId}/${uniqueId}`)

    const metadata = {
        contentType: attachment.mediaType,
        cacheControl: Constants.getRemoteConstant(RemoteConstants.attachmentCacheControlHeader)
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

PostsManager.subscribeToChanges = ( { spaceId, listener } : { 
        spaceId: string, 
        listener: (Array<Post>) => any 
    }): Function => {

    return COLLECTION_REF
        .where('spaceId', '==', spaceId)
        .orderBy('created', 'desc')
        .onSnapshot( 
            (postRefs) => {
                const posts = postRefs.docs.map(item => 
                    _dataToPostObject(item.id, item.data()))                    
                listener(posts)
            }, 
            (error) => {
                CrashReportManager.log(`Error listening to changes of posts of space ${spaceId}`)
                CrashReportManager.recordError(error)
            }
        )
}

PostsManager.editPost = async ({ id, content, attachments } : { 
        id: string, 
        content: string,
        attachments: Array<Attachment> 
    }) => {

    const userId = AuthManager.currentUserId()
    if (!userId) {
        throw Constants.errorCodes.unauthenticated
    }

    await COLLECTION_REF.doc(id).update({ 
        content,
        attachments
    })
}

function _dataToPostObject(id: string, data: DataMap): Post {
    //$FlowExpectedError: not yet supported
    const createdMillis = data.created?.toMillis() ?? moment()
    const offset = data.authorUtcOffset
    
    return {
        id,
        content: data.content,
        authorId: data.authorId,
        created: moment(createdMillis).utcOffset(offset),
        attachments: (data.attachments:Array<Attachment>)
    }
}

export default PostsManager