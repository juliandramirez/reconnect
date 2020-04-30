
var AWS = require('aws-sdk')
var s3 = new AWS.S3()
const MailParser = require('mailparser').MailParser
const htmlToText = require('html-to-text')
const axios = require('axios')
 
 
const bucketName = 'drafts.reconnect'
const cloudFunctionUrl = 'https://us-central1-reconnect-eddf2.cloudfunctions.net/receiveDraftFromEmail'

exports.handler = function(event, context, callback) {
    var sesNotification = event.Records[0].ses
    
    // Retrieve the email from your bucket
    s3.getObject({
            Bucket: bucketName,
            Key: sesNotification.mail.messageId
        }, function(err, s3Data) {
            if (err) {
                console.log(err, err.stack)
                // Rule execution continues (send bounce message)
                callback(null, null)
            } else {
                let parser = new MailParser({
                    skipImageLinks: true,
                    skipTextLinks: true
                })

                var html;
                parser.on('data', data => {
                    if (data.type === 'attachment') {
                        // ignore attachments...
                        data.release()
                    } else if (data.type === 'text') {
                        html = data.html
                    }
                })

                parser.on('end', mail => {

                    var from = sesNotification.mail.commonHeaders.from[0]
                    var toEncoded = sesNotification.mail.destination[0]
                    var text = htmlToText.fromString(html, {
                        noLinkBrackets: true,
                        ignoreImage: true,
                        ignoreHref: true,
                        wordwrap: false                        
                    })
                    
                    console.log('Calling cloud function.\nEmail received from: ' + from + '\nSending a draft to: ' + toEncoded)

                    axios.post(cloudFunctionUrl, { from, toEncoded, text }, { validateStatus: (status) => true })
                    .then(response => {
                        console.log('CLOUD FUNCTION CALL STATUS: ' + response.status)

                        // Everything went OK: Stop the rule (prevent sending the bounce message)
                        if (response.status >= 200 && response.status < 300) {                                                        
                            callback(null, {
                                disposition: 'STOP_RULE',
                            })
                        } else {
                            // On error, rule execution continues (send bounce message)
                            callback(null, null)
                        }
                    })
                    .catch(error => {
                        console.log(error, error.stack)
                        // Rule execution continues (send bounce message)
                        callback(null, null)
                    })
                })

                parser.write(s3Data.Body)
                parser.end()
            }
        })
}
