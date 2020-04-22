/**
 * @flow
 */

import firestore from '@react-native-firebase/firestore'
import moment from 'moment'

import type { DataMap } from 'Reconnect/src/lib/utils'
import Constants from 'Reconnect/src/Constants'
import CrashReportManager from 'Reconnect/src/lib/crashreports'

import AuthManager from './auth'
import type { Space } from './spaces'


/* MARK: - Constants */

const COLLECTION_REF = firestore().collection(Constants.storageRefs.drafts)
export const PushNotificationActions = {
    draftReceived: 'draft-received',
}

/* MARK: - Types */

export type Moment = Object // flow and typescript do not bide well
export type Draft = {|
    id: string,
    content: string,
    created: Moment,
|}

// MUST BE THE SAME AS THE ONE IN THE CLOUD FUNCTIONS FILE !!
const getDraftId = (spaceId: string, isHost: boolean) => spaceId + '-' + (isHost ? 'host' : 'guest')
const toFormattedId = (str) => (str[0] + str[1] + str[str.length - 1]).toLowerCase()    

/* MARK: - Services */

const DraftsManager = {}

DraftsManager.getDraftAddress = (space: Space) => {    
    const isHost = AuthManager.currentUserId() == space.hostId
    return `${toFormattedId(space.id)}+${space.invitationCode}${isHost ? '1' : '2'}`
}

DraftsManager.deleteDraft = async (draftId: string) => {
    await COLLECTION_REF.doc(draftId).delete()
}

DraftsManager.subscribeToDraftUpdates = ({ spaceId, isHost, listener } : { 
        spaceId: string, 
        isHost: boolean, 
        listener: (?Draft) => any }) => {

    return COLLECTION_REF.where('id', '==', getDraftId(spaceId, isHost))
        .onSnapshot( 
            (draftRefs) => {
                if (draftRefs.size != 1) {
                    listener(null)
                } else {
                    const draftDoc = draftRefs.docs[0]
                    const draft = _dataToDraftObject(draftDoc.id, draftDoc.data())
                    listener(draft)
                }                
            }, 
            (error) => {
                CrashReportManager.report({ 
                    message: `Error listening to changes of draft for ${isHost? 'host' : 'guest'} of space ${spaceId}`,
                    cause: error
                })
            }
        )
}

/* MARK: - Helper Functions */

function _dataToDraftObject(id: string, data: DataMap): Draft {
    //$FlowExpectedError: not yet supported
    const createdMillis = data.created?.toMillis() ?? moment()
    
    return {
        id,
        content: data.content,
        created: moment(createdMillis)
    }
}

export default DraftsManager