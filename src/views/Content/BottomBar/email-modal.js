/**
 * @flow
 */

import React from 'react'
import { View, Text, TouchableOpacity, Clipboard } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import { showInfoMessage } from 'Reconnect/src/lib/utils'
import Constants from 'Reconnect/src/Constants'
import DraftsManager from 'Reconnect/src/services/drafts'
import Theme from 'Reconnect/src/theme/Theme'
import type { Space } from 'Reconnect/src/services/spaces'


const styles = EStyleSheet.create({ 
    modalContainer: { 
        flex: 0,  
        padding: '18 rem',        
        backgroundColor: Theme.colors.appBackground
    },
        modalTitle: {
            textAlign: 'center', 
            fontSize: '28 rem', 
            color: '#000'
        },
        modalMainSection: { 
            marginTop: '15 rem',
            marginBottom: '15 rem'
        },
            modalFirstText: {
                textAlign: 'center', 
                fontSize: '15 rem', 
                color: '#555' 
            },
            modalAddressContainer: {
                backgroundColor: 'white', 
                borderWidth: '1 rem', 
                marginTop: '12 rem', 
                marginBottom: '16 rem', 
                padding: '8 rem'
            },
                modalAddressText: {
                    textAlign: 'center', 
                    fontSize: '14 rem', 
                    color: '#000', 
                    fontWeight: 'bold'
                },
            modalSecondText: {
                textAlign: 'center', 
                fontSize: '15 rem', 
                color: '#555'
            },
        modalThirdText: {
            textAlign: 'justify', 
            color: '#555', 
            fontSize: '13 rem', 
            marginTop: '15 rem'
        }
})

const Modal = ({ space, onDismiss } : { space: Space, onDismiss: Function }) => {

    /* Helper Functions */

    function _adressPressed() {
        const draftAddress = `${DraftsManager.getDraftAddress(space)}@${Constants.draftMailDomain}`
        Clipboard.setString(draftAddress)
        showInfoMessage('Address copied to the clipboard')
        onDismiss()
    }

    /* Render */
    return (
        <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>
                Draft long letters using your email
            </Text>

            <View style={styles.modalMainSection}>
                <Text style={styles.modalFirstText}>
                    Send an email <Text >without attachments</Text> to this address:
                </Text>

                <TouchableOpacity onPress={_adressPressed} style={styles.modalAddressContainer}>
                    <Text style={styles.modalAddressText}>
                        {`${DraftsManager.getDraftAddress(space)}\n@${Constants.draftMailDomain}`}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.modalSecondText}>
                    A draft will appear inside this space for you to use
                </Text>
            </View>

            <Text style={styles.modalThirdText}>
                * Speed of delivery varies depending on your email service provider. If you are not notified after a few minutes, re-check the address.
            </Text>
        </View>  
    )
}

export default Modal