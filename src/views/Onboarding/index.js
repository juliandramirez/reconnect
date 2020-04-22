/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, Text, Image, Dimensions } from 'react-native'
import { Button } from 'react-native-elements'
import Swiper from 'react-native-swiper'
import EStyleSheet from 'react-native-extended-stylesheet'
import { useNavigation } from '@react-navigation/native'

import AuthServices from 'Reconnect/src/services/auth'
import { wait } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'
import { useModalBackground } from 'Reconnect/src/lib/utils'


const styles = EStyleSheet.create({
    firstScreenContainer: {
        flex:1, 
        justifyContent: 'center', 
        alignContent: 'center', 
        paddingBottom: '40 rem'
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
        paddingHorizontal: '7%', 
        paddingVertical: '12 rem'
    },
    heading: {
        marginTop: '20 rem'
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
        justifyContent: 'center'
    },
    imageContainer: {
        flex: 1, 
        justifyContent: 'center',
    },
    subtitleContainer: {
        paddingVertical: '15 rem'
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
    disclaimerText:{
        color: '#ccc',
        fontSize: '13 rem'
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
        if (index == 4) {
            setFinished(true)
            // swiper goes crazy here on state changes (re-renders)...
            wait(1).then(() => swiperRef.current.scrollBy(1, false))
        }
    }

    function _nextPressed() {
        if (!submitting) {
            if (!finished) {
                swiperRef.current.scrollBy(1, true)
            } else {            
                setSubmitting(true)
    
                // swiper goes crazy here on state changes (re-renders)...
                wait(1).then(() => swiperRef.current.scrollBy(1, false))
                
                AuthServices.signIn()
                modalDismiss()
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
                    image={Theme.images.onboarding.post}
                    text='create a history of letters with your close ones' />

                <OnboardingPage 
                    image={Theme.images.onboarding.spaces}
                    text={'multiple spaces' + '\n' + 'a space for each relationship'} />
            {/*}
                <OnboardingPage 
                    image={Theme.images.onboarding.controls}
                    text={'simple and intuitive controls'} />
            {*/}
                <OnboardingPage 
                    image={Theme.images.onboarding.notifications}
                    text={'\n' + 'set reminders to reconnect and get notified of new content' + '\n' } 
                    />

                <OnboardingPage 
                    image={Theme.images.onboarding.mail}
                    text={'\n' + 'use your email to write long letters' + '\n\n' + 'attach photos and videos in your phone'} 
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
                        maxWidth: Dimensions.get('window').width * 0.86,
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