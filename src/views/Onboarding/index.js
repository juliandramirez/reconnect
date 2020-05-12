/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, Text, Image, Dimensions, Platform } from 'react-native'
import { Button } from 'react-native-elements'
import Swiper from 'react-native-swiper'
import EStyleSheet from 'react-native-extended-stylesheet'
import { useNavigation } from '@react-navigation/native'

import AuthServices from 'Reconnect/src/services/auth'
import { wait, showErrorMessage, showInfoMessage } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'
import { useModalBackground } from 'Reconnect/src/lib/utils'


const NUMBER_OF_PAGES = 7

const styles = EStyleSheet.create({
    firstScreenContainer: {
        flex:1, 
        justifyContent: 'center', 
        alignContent: 'center', 
        paddingBottom: '40 rem',
        marginHorizontal: '20 rem',
    },
    firstMessage: {
        fontSize: '22 rem',
        letterSpacing: '1 rem',
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: '30 rem',
        fontWeight: 'normal',
        color: '#777',
        fontFamily: 'courier'        
    },

    container: {
        flex: 1, 
        backgroundColor: 'snow',          
        paddingVertical: '12 rem'
    },
    heading: {
        marginTop: '20 rem',
    },
    headingText: {
        fontFamily: 'Didot',
        fontSize: '34 rem',
        fontWeight: 'normal',        
        textAlign: 'center',       
        flex: 0, 
    },
    stepContainer: {
        flex: 1, 
        marginBottom: '45 rem', 
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 1, 
        justifyContent: 'center',
        marginHorizontal: '20 rem',
    },
    subtitleContainer: {
        paddingVertical: '15 rem',
        marginHorizontal: '20 rem',
    },
    subtitle: {
        fontSize: '15 rem',
        letterSpacing: '0.5 rem',
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: '22 rem',
        fontWeight: 'normal',
        color: '#666',
    },
    button: {
        marginHorizontal: '20 rem',
    }
})

const Onboarding = () => {

    /* Hooks */
    const modalDismiss = useModalBackground('snow')    

    /* State */
    const [finished, setFinished] = useState<boolean>(false)
    const [submitting, setSubmitting] = useState<boolean>(false)

    /* Refs */
    //$FlowExpectedError: not null
    const swiperRef = useRef<typeof Swiper>(null)

    /* Functions */
    function _onIndexChanged(index) {
        if (index == (NUMBER_OF_PAGES - 1)) {
            setFinished(true)
        }
    }

    async function _nextPressed() {
        if (!submitting) {
            if(!finished) {
                swiperRef.current.scrollBy(1, true)
            } else {            
                setSubmitting(true)
                
                try {
                    await AuthServices.signIn({
                        androidAccountSelectionMessage: 'Reconnect uses an account name to identify you.\n\nThis doesn\'t give the application access to the account\n'
                    })
                    modalDismiss()
                } catch(e) {
                    if (e === 'no-uid-available') {
                        if (Platform.OS === 'ios') {
                            showInfoMessage('Configure an iCloud account in settings first')
                        } else if (Platform.OS === 'android') {
                            showErrorMessage('You need to select an account to start')
                        }
                    } else {
                        showErrorMessage('Check your internet connection')
                    }

                    setSubmitting(false)
                }                
            }   
        }     
    }

    /* Render */
    return (        
        <View style={styles.container}>
            <View style={styles.heading}>
                <Text style={styles.headingText}>
                    Re: connect
                </Text>
            </View>
            
            {/* $FlowExpectedError: wtf */}
            <Swiper onIndexChanged={_onIndexChanged} loop={false} ref={ ref => swiperRef.current = ref}>

                <View style={styles.firstScreenContainer}>
                    <Text style={styles.firstMessage}>
                        {'Get closer to the people you care about' + '\n\n' + 'rediscover the power of words'}
                    </Text>
                </View>

                <OnboardingPage 
                    image={Theme.images.onboarding.letters}
                    text={'exchange letters with your close ones'} />

                <OnboardingPage 
                    image={Theme.images.onboarding.memories}
                    text={'create invaluable memories'} />

                <OnboardingPage 
                    image={Theme.images.onboarding.spaces}
                    text={'multiple spaces' + '\n' + 'a space for each relationship'} />

                <OnboardingPage 
                    image={Theme.images.onboarding.notifications}
                    text={'\n ' + 'set reminders to reconnect \n\n get notified of new\nletters' } 
                    />

                <OnboardingPage 
                    image={Theme.images.onboarding.mail}
                    text={'\nuse your email to write long letters' + '\n\n' + 'attach photos and videos in your phone'} 
                    />

                <OnboardingPage 
                    image={Theme.images.onboarding.handwriting}
                    text={'go for a walk. get inspired\nhandwrite a letter' + '\n\nphotograph and send'} 
                    />
            </Swiper>

            <Button title={finished? 'START!' : 'NEXT'} onPress={_nextPressed} loading={submitting}
                    buttonStyle={{...styles.button, ...Theme.palette.button}} />
        </View>
    )
}

const OnboardingPage = ({ image, text } : { image: any, text: string }) => {
    return (
        <View style={styles.stepContainer}>    
            <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>
                    {text}
                </Text> 
            </View>                
            <View style={styles.imageContainer}>
                <Image 
                    style={{                            
                        flex: 1,                       
                        maxWidth: Dimensions.get('window').width - (2 * styles._imageContainer.marginHorizontal),
                    }}
                    resizeMode='contain' 
                    source={image}
                    defaultSource={image} 
                /> 
            </View> 
        </View>
    )
}

export default Onboarding