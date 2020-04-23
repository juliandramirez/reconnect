/**
 * @flow
 */

import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'

import AuthManager from 'Reconnect/src/services/auth'
import Constants from 'Reconnect/src/Constants'
import { showInfoMessage } from 'Reconnect/src/lib/utils'


async function runMigrations() {
    await migrateAnonymousUser()
}

async function migrateAnonymousUser() {
    const currentUser = auth().currentUser
    if (currentUser && currentUser.isAnonymous) {        
        try{ 
            const previousId = currentUser.uid
            const newId = await AuthManager.signIn({
                    androidAccountSelectionMessage: 'Sync your content with an account to prevent data loss.\n\nThis doesn\'t give the application access to the account\n',
                    androidAccountType: null
                }
            )

            await _migrateContent(previousId, newId)
        } catch (e) {   }
    }
}

async function _migrateContent(previousId: string, newId: string) {
    const batch = firestore().batch()

    const SPACES_COLLECTION_REF = firestore().collection(Constants.storageRefs.spaces)
    const POSTS_COLLECTION_REF = firestore().collection(Constants.storageRefs.posts)
    const USERS_COLLECTION_REF = firestore().collection(Constants.storageRefs.users)

    // 1. change id in all spaces (hostConfiguration.userId or guestConfiguration.userId)
    const hostResults = await SPACES_COLLECTION_REF.where('hostConfiguration.userId', '==', previousId).get()
    hostResults.docs.forEach(result => batch.update(result.ref, {
            hostConfiguration: {
                ...result.data().hostConfiguration,
                userId: newId                
            }
        }
    ))

    const guestResults = await SPACES_COLLECTION_REF.where('guestConfiguration.userId', '==', previousId).get()
    guestResults.docs.forEach(result => batch.update(result.ref, {
            guestConfiguration: {
                ...result.data().guestConfiguration,
                userId: newId                
            }
        }
    ))

    // 2. change id in all posts where it is an author
    const postsResults = await POSTS_COLLECTION_REF.where('authorId', '==', previousId).get()
    postsResults.docs.forEach(result => batch.update(result.ref, {
            authorId: newId
        }
    ))

    // 3. delete previous user document    
    batch.delete(USERS_COLLECTION_REF.doc(previousId))
    
    // 4. commit operations
    await batch.commit()
}

export default runMigrations