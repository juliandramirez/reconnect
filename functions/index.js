
const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()


//--------------------------------------------------------------------------
// AUTH TOKEN
//--------------------------------------------------------------------------

exports.tokenFromUID = functions.https.onCall( async (data, context) => {    
    const { uid } = data

    try {
        return await admin.auth().createCustomToken(uid)
    }catch(error) {
        console.log('Error creating custom token: ', error)
        throw new functions.https.HttpsError('internal', error ? error.message : '')
    }
})

//--------------------------------------------------------------------------
// REMOTE NOTIFICATIONS
//--------------------------------------------------------------------------

const ANDROID_CHANNEL_ID = 'remote_posts'
const PushNotificationActions = {
    draftReceived: 'draft-received',
}

exports.sendPushNotification = functions.https.onCall( (data, context) => {

    // request must be authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!')
    }    

    // get input parmenters
    const { token, title, message, extra } = data
    _sendPushNotification({ token, title, message, extra })    
})

async function _sendPushNotification({ token, title, message, extra }) {
    if (!token) {
        return
    }

    // assemble notification message
    const notifObj = {
        token,
        data: extra,        
        notification: {
            title,
            body: message,
        },
        android: {
            priority: 'high',
            notification: {
                channelId: ANDROID_CHANNEL_ID,
                priority: 'max'
            }

        }
    }

    // send message
    return await admin.messaging().send(notifObj)
        .catch((error) => {
            console.log('Error sending message to device with token ' + token + ' :', error)
        })
}

//--------------------------------------------------------------------------
// DRAFT FROM EMAIL
//--------------------------------------------------------------------------

exports.receiveDraftFromEmail = functions.https.onRequest( async (req, res) => {
    
    const { from, toEncoded, text } = req.body

    // try first on real env, then on dev end (inbound mail hook + DNS does not have 2 envs after all)        
    const result = await _processEmailMessage(from, toEncoded, text, false)
    if (result) {
        res.status(200).end()
    } else {
        const devResult = await _processEmailMessage(from, toEncoded, text, true)
        if (devResult) {
            res.status(200).end()
        } else {
            res.status(404).end()
        }            
    }       
})


// address = <formattedId>+<spaceInvitationCode><hostDigit>@<domain>
    // formattedId: First and last characters of space id, lower cased
    // hostDigit = 1 for host ... everything else for guest    
const toFormattedId = (str) => (str[0] + str[1] + str[str.length - 1]).toLowerCase()    
    // draftID: <spaceId>-('host'|'guest')
const draftID = (spaceId, isHost) => spaceId + '-' + (isHost ? 'host' : 'guest')

async function _processEmailMessage(from, toEncoded, text, isDev) {
    const SPACES_COLLECTION_ID = isDev ? 'dev-spaces' : 'spaces'
    const DRAFTS_COLLECTION_ID = isDev ? 'dev-drafts' : 'drafts'
    const USERS_COLLECTION_ID = isDev ? 'dev-users' : 'users'

    const SPACES_COLLECTION_REF = admin.firestore().collection(SPACES_COLLECTION_ID)
    const DRAFTS_COLLECTION_REF = admin.firestore().collection(DRAFTS_COLLECTION_ID)
    const USERS_COLLECTION_REF = admin.firestore().collection(USERS_COLLECTION_ID)

    const content = text.trim()

    // address = <formattedId>+<invitationCode><hostDigit>@<domain>
    const to = toEncoded.substring(0, toEncoded.indexOf('@'))
    const formattedId = to.split('+')[0].trim().toLowerCase()
    const secondComponent = to.split('+')[1]
    if (!secondComponent) {
        return false
    }
    const spaceInvitationCode = secondComponent.substring(0, secondComponent.length - 1)
    const isHost = secondComponent[secondComponent.length - 1] == '1'        
       
    // look for invitation code space (1.5 secs execution approx)
    const matchesRef = await SPACES_COLLECTION_REF
        .where('invitationCode', '==', spaceInvitationCode).get()
    const matches = matchesRef.docs
       
    // space was not found ... reply 404
    if (matches.length == 0) {
        console.log((isDev ? 'DEV: ' : '') + 'No matching space found for: ' + toEncoded)        
        return false
    }
       
    // see if spaces with same invitation code (collisions) have a match with space id (formatted)
    const filteredMatches = matches.filter(doc => toFormattedId(doc.id) == formattedId)
    const match = filteredMatches.length == 1 ? filteredMatches[0] : null

    if (!match) {
        console.log((isDev ? 'DEV: ' : '') + 'Space code found, but no match for guest/host for: ' + toEncoded)
        return false
    }            

    const draftId = draftID(match.id, isHost)
    // finally, add the draft!
    await DRAFTS_COLLECTION_REF.doc(draftId).set({
        id: draftId,
        content,
        from,
        created: admin.firestore.FieldValue.serverTimestamp()
    })

    // send a notification to the user
    const fieldIdentifier = isHost ? 'hostConfiguration' : 'guestConfiguration'
    const userId = match.data()[fieldIdentifier].userId
    const userDoc = await USERS_COLLECTION_REF.doc(userId).get()

    if (userDoc.exists) {
        const token = userDoc.data().notificationToken
        const title = 'Your draft is ready to use'
        const message = 'Your draft just arrived from your mail provider'
        const extra = {
            spaceId: match.id,
            action: PushNotificationActions.draftReceived
        }
        await _sendPushNotification({ token, title, message, extra })
    }
       
    // inform that everything went ok!
    return true
}