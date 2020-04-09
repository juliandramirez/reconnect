
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()


const ANDROID_CHANNEL_ID = 'remote_posts'

exports.sendPushNotification = functions.https.onCall( (data, context) => {

    // request must be authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!')
    }    

    // get input parmenters
    const { token, title, message, extra } = data

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
    admin.messaging().send(notifObj)
        .catch((error) => {
            console.log('Error sending message to device with token ' + token + ' :', error)
        })
})
