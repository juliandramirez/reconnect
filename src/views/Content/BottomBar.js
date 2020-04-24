/**
 * @flow
 */

import React, { useState } from 'react'
import { View, Modal, Text, TouchableOpacity, Clipboard, Platform } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Iosicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import EStyleSheet from 'react-native-extended-stylesheet'

import AuthManager from 'Reconnect/src/services/auth'
import { showInfoMessage } from 'Reconnect/src/lib/utils'
import Constants from 'Reconnect/src/Constants'
import DraftsManager from 'Reconnect/src/services/drafts'
import LoadingView from 'Reconnect/src/lib/Loading'
import Theme from 'Reconnect/src/theme/Theme'
import type { Space } from 'Reconnect/src/services/spaces'

import { NavigationRoutes } from './index'


const styles = EStyleSheet.create({
    modalBackground: { 
        flex: 1, 
        justifyContent: 'center', 
        alignContent: 'center', 
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContainer: { 
        flex: 0,  
        marginHorizontal: '18 rem', 
        padding: '18 rem',
        backgroundColor: 'snow'
    },
    modalTitle: {
        textAlign: 'center', 
        fontSize: '28 rem', 
        color: '#000'
    },
    modalMainSection: { 
        marginTop: '30 rem',
        marginBottom: '20 rem'
    },
    modalFirstText: {
        textAlign: 'center', 
        fontSize: '15 rem', 
        color: '#888' 
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
        color: '#888'
    },
    modalThirdText: {
        textAlign: 'justify', 
        color: '#888', 
        fontSize: '13 rem', 
        marginTop: '15 rem'
    }
})

const BottomBar = ( { space } : { space: Space }) => {

    /* Hooks */
    const navigation = useNavigation()

    /* State */
    const [modalShown, setModalShown] = useState<boolean>(false)

    /* Properties */
    const highlightColor = 
        Theme.colors.highlightColors[
            Theme.colors.spaceColors.findIndex(val => 
                //$FlowExpectedError: space configuration is not null here
                val == space.configuration.color
            )
        ]        

    /* Functions */
    function _adressPressed() {
        const draftAddress = `${DraftsManager.getDraftAddress(space)}@${Constants.draftMailDomain}`
        Clipboard.setString(draftAddress)
        showInfoMessage('Address copied to clipboard')
        setModalShown(false)
    }

    function _renderModal() {
        return (
            
            <Modal
                transparent={true} 
                animationType='slide' 
                visible={modalShown}
                presentationStyle='overFullScreen'
                onRequestClose={ () => setModalShown(false) }
            >
                <TouchableOpacity style={styles.modalBackground} 
                    activeOpacity={1} 
                    onPress={() => setModalShown(false)}>

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
                            * If the draft doesn't appear after one minute of being sent, re-check the address. Speed of delivery varies depending on your email service provider
                        </Text>
                    </View>

                </TouchableOpacity>
            </Modal>
            
        )
    }

    /* Render */
    return ( <>   
        {_renderModal()}

        <View style={{ 
            flexDirection: 'row', 
            height: 50, 
            justifyContent: 'space-evenly', 
            alignItems: 'center',
        }}>
            <View style={{flex:1, flexGrow:1, alignItems: 'flex-start' }}>
                <Button type='clear' 
                    icon={
                        <Iosicons style={{ paddingHorizontal: 8 }} name='ios-arrow-up' size={30} 
                            color={highlightColor}                             
                            />
                    }
                    onPress={ () => navigation.navigate(NavigationRoutes.EditSpace, { space: space }) }/>
            </View>            

            { __DEV__ ? <View style={{ flex:1, flexGrow:1 }} /> : <></>}

            <View style={{ flex:1, flexGrow:1 }}>
                <Button 
                    type='clear' 
                    icon={
                        <SimpleLineIcons name='pencil' size={32} 
                            color={highlightColor}                                
                            />
                    } 
                    onPress={ () => navigation.navigate(NavigationRoutes.NewPost, { space: space }) }
                />
            </View>            
            
            { __DEV__ ? <TouchableOpacity onPress={AuthManager.signOut} style={{ flex:1, flexGrow:1, width: '100%', height: '100%' }} /> : <></>}

            <View style={{flex:1, flexGrow:1, alignItems: 'flex-end'}}>
                <Button onPress={ () => setModalShown(!modalShown) } type='clear' style={{ marginRight: 12 }} icon={
                    <MaterialIcons style={{ paddingHorizontal: Platform.OS === 'ios' ? 0 : 8 }} color={highlightColor} name='important-devices' size={30}/>
                }/>
            </View>
        </View>        
    </>)
}

export default BottomBar