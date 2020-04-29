/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, Text, Image, Dimensions, Platform, StatusBar } from 'react-native'
import { Button } from 'react-native-elements'
import Swiper from 'react-native-swiper'
import EStyleSheet from 'react-native-extended-stylesheet'
import { useNavigation } from '@react-navigation/native'

import AuthServices from 'Reconnect/src/services/auth'
import { wait, showErrorMessage, showInfoMessage } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'
import { useModalBackground } from 'Reconnect/src/lib/utils'


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
        color: '#333',
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
        fontSize: '19 rem',
        letterSpacing: '1.5 rem',
        textTransform: 'uppercase',
        textAlign: 'center',
        //lineHeight: '22 rem',
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        marginHorizontal: '20 rem',
    }
})

const Onboarding = () => {
    /* Refs */
    //$FlowExpectedError: not null
    const swiperRef = useRef<typeof Swiper>(null)

    /* Render */
    return (        
        <View style={styles.container}> 
            <StatusBar hidden={true} />
            {/* $FlowExpectedError: wtf */}
            <Swiper loop={false} ref={ ref => swiperRef.current = ref}>
                <>
                    <View style={styles.heading}>
                        <Text style={styles.headingText}>
                            Re: connect
                        </Text>
                    </View>
                    <View style={styles.firstScreenContainer}>
                        <Text style={styles.firstMessage}>
                            {'Get closer to the people you care about' + '\n\n' + 'rediscover the power of words'}
                        </Text>
                    </View>
                </>

                <OnboardingPage 
                    image={Theme.images.onboarding.post}
                    text={'exchange letters with your close ones\n\ncreate invaluable memories'} />

                <OnboardingPage 
                    image={Theme.images.onboarding.spaces}
                    text={'\nmultiple spaces' + '\n\n' + 'a space for each relationship'} />

                <OnboardingPage 
                    image={Theme.images.onboarding.notifications}
                    text={'\n ' + 'set reminders to reconnect \n\n get notified of new content' + '' } 
                    />

                <OnboardingPage 
                    image={Theme.images.onboarding.mail}
                    text={'\n' + 'use your email to write long letters' + '\n\n' + 'attach photos and videos in your phone'} 
                    />

                <OnboardingPage 
                    image={Theme.images.onboarding.handwriting}
                    text={'go for a walk\nget inspired\n\nhandwrite a letter\n\n' + '\nphotograph and send'} 
                    />
            </Swiper>
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