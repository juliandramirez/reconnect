/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, Modal, Text, TouchableOpacity, Platform } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Iosicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Octicons from 'react-native-vector-icons/Octicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import EStyleSheet from 'react-native-extended-stylesheet'

import AuthManager from 'Reconnect/src/services/auth'
import LoadingView from 'Reconnect/src/lib/Loading'
import Theme from 'Reconnect/src/theme/Theme'
import type { Space } from 'Reconnect/src/services/spaces'
import type { PostInput } from 'Reconnect/src/services/posts'
import { NavigationRoutes } from 'Reconnect/src/views/Content'
import { getHighlightColor } from 'Reconnect/src/lib/utils'
import { showErrorMessage } from 'Reconnect/src/lib/utils'

import EmailModal from './email-modal'
import { useHandwrittenPost } from './handwritting'


const styles = EStyleSheet.create({
    modalBackground: { 
        flex: 1, 
        paddingHorizontal: '16 rem',
        justifyContent: 'center', 
        alignContent: 'center', 
        backgroundColor: 'rgba(0,0,0,0.66)'
    },
    bottomContainer: {
        flexDirection: 'row', 
        height: 50, 
        justifyContent: 'space-evenly', 
        alignItems: 'center',
    },
    centerIcon: {
        fontSize: 32
    },
    rightIcon: {
        fontSize: 40,
        paddingRight: '8 rem'
    },
    leftIcon: {
        fontSize: 36,
        paddingLeft: '8 rem'
    },
})

const mainModalStyles = EStyleSheet.create({ 
    optionContainer: {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        paddingHorizontal: '8 rem', 
        paddingVertical: '2 rem'
    },
        optionIcon: {
            flex: 1, 
            alignItems: 'center',
        },
            option1Icon: {
                fontSize: '38 rem'
            },
            option2Icon: {
                fontSize: '38 rem'
            },
            option3Icon: {
                fontSize: '40 rem'
            },    
        textOptionContainer: {
            flex: 4.5, 
            paddingVertical: '8 rem',
            paddingHorizontal: '10 rem' 
        },
            textOption1: {
                textAlign: 'left', 
                fontSize: '15 rem',
                fontWeight: 'bold', 
                marginTop: '2 rem',
                marginBottom: '4 rem'
            },
            textOption2: {
                textAlign: 'justify', 
                fontSize: '13 rem', 
                color: '#333'
            }
})

const BottomBar = ( { space } : { space: Space }) => {

    /* Hooks */
    const navigation = useNavigation()
    const startHandwrittenPost = useHandwrittenPost()

    /* State */
    const [modalShown, setModalShown] = useState<boolean>(false)
    const [emailModalShown, setEmailModalShown] = useState<boolean>(false)
    const [showEmptyModal, setShowEmptyModal] = useState<boolean>(false)

    /* Properties */
    const highlightColor = getHighlightColor(space.configuration?.color)

    /* Functions */
    function _resetModals() {
        if (showEmptyModal) {
            return
        }

        setModalShown(false)
        setEmailModalShown(false)
        setShowEmptyModal(false)
    }

    function _blankLetter() {
        navigation.navigate(NavigationRoutes.NewPost, { space })
        _resetModals()        
    }

    function _fromAnEmail() {
        setEmailModalShown(true)
    }

    async function _fromYourHandwriting() {  
        // need to do this because hiding the modal hides the alert dialog: https://github.com/facebook/react-native/pull/26839
        setShowEmptyModal(true)
        try {
            const postInput = await startHandwrittenPost()               
            if (postInput) {
                navigation.navigate(NavigationRoutes.NewPost, { space, postInput })
            }
        } catch(error) {
            showErrorMessage('Check your internet connection')
        } finally {
            setModalShown(false)
            setEmailModalShown(false)
            setShowEmptyModal(false)
        }          
    }

    /* Render */

    function _renderModal() {
        return (
            <Modal
                transparent={true} 
                animationType='fade' 
                visible={modalShown}
                presentationStyle='overFullScreen'
                onRequestClose={ _resetModals }
            >
                <TouchableOpacity style={styles.modalBackground} 
                        activeOpacity={1} 
                        onPress={ _resetModals }>
                    {
                        showEmptyModal ? 
                            <LoadingView text='Processing...'/> 
                            : 
                                emailModalShown ? 
                                    <EmailModal space={space} onDismiss={_resetModals} /> 
                                :                             
                                    _renderMainModal()
                    }                                                          
                </TouchableOpacity>
            </Modal>
        )
    }

    function _renderMainModal() {
        return (
            <View style={{ backgroundColor: 'white' }}>

                <View>
                    <TouchableOpacity onPress={ _blankLetter }
                        style={{ ...mainModalStyles.optionContainer }}>

                        <View style={ mainModalStyles.optionIcon }>
                            <Octicons 
                                size={mainModalStyles._option1Icon.fontSize}
                                name='device-mobile' color={ highlightColor }/>
                        </View>

                        <View style={ mainModalStyles.textOptionContainer }>
                            <Text style={{ ...mainModalStyles.textOption1, color: highlightColor }}>
                                BLANK LETTER
                            </Text>
                            <Text style={{ ...mainModalStyles.textOption2, color: '#666' }}>
                                Create a new letter here in your device
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={ _fromAnEmail }
                        style={{...mainModalStyles.optionContainer, borderTopWidth: 1, borderColor: highlightColor }}>

                        <View style={ mainModalStyles.optionIcon }>
                            <MaterialIcons 
                                size={ mainModalStyles._option2Icon.fontSize }
                                name='important-devices' color={ highlightColor }/>
                        </View>
                        <View style={ mainModalStyles.textOptionContainer }>
                            <Text style={{ ...mainModalStyles.textOption1, color: highlightColor }}>
                                FROM AN EMAIL
                            </Text>
                            <Text style={{ ...mainModalStyles.textOption2, color: '#666' }}>
                                Draft the text in your email. Add photos and videos here
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={ _fromYourHandwriting }
                        style={{...mainModalStyles.optionContainer, borderTopWidth: 1, borderColor: highlightColor}}>

                        <View style={ mainModalStyles.optionIcon }>
                            <MaterialCommunityIcons 
                                size={mainModalStyles._option3Icon.fontSize}
                                name='notebook' color={ highlightColor }/>
                        </View>
                        <View style={ mainModalStyles.textOptionContainer }>
                            <Text style={{ ...mainModalStyles.textOption1, color: highlightColor }}>
                                FROM YOUR HANDWRITING
                            </Text>
                            <Text style={{ ...mainModalStyles.textOption2, color: '#666' }}>
                                Photograph your handwriting and we’ll extract the text. The photos can be attached to your letter
                            </Text>
                        </View>
                    </TouchableOpacity>                            
                    
                </View> 
            </View>            
        )
    }

    return ( <>   

        {_renderModal()}

        <View style={ styles.bottomContainer }>
            <View style={{flex:1, flexGrow:1, justifyContent: 'center', alignItems: 'flex-start' }}>
                <Button type='clear'
                    icon={
                        <Iosicons style={{ paddingLeft: styles._leftIcon.paddingLeft }} 
                            name='ios-help-circle-outline' size={styles._leftIcon.fontSize} 
                            color={highlightColor}                             
                        />
                    }
                    onPress={ () => navigation.navigate(NavigationRoutes.FAQ) }                    
                />
            </View>            

            <View style={{ flex:1, flexGrow:1 }}>
                <Button 
                    type='clear' 
                    icon={
                        <SimpleLineIcons name='pencil' size={styles._centerIcon.fontSize} 
                            color={highlightColor}                                
                            />
                    } 
                    onPress={ () => setModalShown(true) }
                />
            </View>            
                    
            <View style={{flex:1, flexGrow:1, alignItems: 'flex-end', justifyContent: 'center'}}>
                <Button type='clear'
                    icon={
                        <Iosicons style={{ paddingRight: styles._rightIcon.paddingRight }} 
                            name='ios-cog' size={styles._rightIcon.fontSize} color={highlightColor}                             
                        />
                    }
                    onPress={ () => navigation.navigate(NavigationRoutes.EditSpace, { space: space }) }/>
            </View>
        </View>        
    </>)
}

export default BottomBar