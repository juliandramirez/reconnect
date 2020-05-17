/**
 * @flow
 */

import React from 'react'
import { View, Text, Platform, ScrollView, Linking, TouchableOpacity } from 'react-native'
import AuthManager from 'Reconnect/src/services/auth'
import Iosicons from 'react-native-vector-icons/Ionicons'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import EStyleSheet from 'react-native-extended-stylesheet'

import { useModalBackground } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'


const styles = EStyleSheet.create({
    container: {
        flex: 1, 
        backgroundColor: 'white'
    },
        topContainer: { 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginTop: '10 rem', 
            marginBottom: '15 rem' 
        },
            titleContainer: { 
                flex: 1, 
                paddingLeft: '20 rem'
            },
            closeIcon: {
                paddingRight: '12 rem', 
                marginTop: '8 rem',
                fontSize: '26 rem'
            },
        contentContainer: {
            paddingHorizontal: '20 rem'
        },
            questionContainer: {
                marginBottom: 30
            },
                question: {
                    fontSize: 16, 
                    lineHeight: 22,
                    color: 'black', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase',
                    textAlign: 'justify'
                },
                answer: {
                    marginTop: 12, 
                    textAlign: 'justify', 
                    fontSize: 14, 
                    lineHeight: 22, 
                    color: 'black'
                },
        button: {
            marginBottom: '15 rem',
            marginBottom: '30 rem',
        }

})

const FAQ = () => {
    /* Hooks */
    const navigation = useNavigation()
    const modalDismiss = useModalBackground('white')

    /* Functions */
    function _back() {
        modalDismiss()
        navigation.goBack()
    }

    /* Render */
    return (
        <View style={ styles.container }>

            <View style={ styles.topContainer }>
                <View style={ styles.titleContainer }>
                    <Text style={{ ...Theme.palette.title, color: 'black'}}>
                        Common Questions
                    </Text>
                </View>

                <Button type='clear'
                    icon={
                        <Iosicons 
                            style={ styles.closeIcon } 
                            name='ios-arrow-down' size={ styles._closeIcon.fontSize } 
                            color={ Theme.colors.titleColor }                             
                        />
                    }
                    onPress={ _back }/>
            </View>

            <ScrollView contentContainerStyle={ styles.contentContainer }>

                <View style={ styles.questionContainer }>
                    <Text style={ styles.question }>
                        Are my letters private?
                    </Text>
                    <Text style={ styles.answer }>
                        They are. Your letters are sent and received through an encrypted secure channel (SSL) and your content is stored in secured infrastructure in the cloud.{'\n'}{'\n'}
                        No one accesses your content but you and the people in your shared spaces.
                    </Text>
                </View>


                <View style={ styles.questionContainer }>
                    <Text style={ styles.question }>
                        What happens to my letters if I lose or change my device?
                    </Text>
                    {
                        Platform.OS == 'ios' ? 
                            <Text style={ styles.answer }>
                                Your content is associated with the apple account configured in your device when you installed the app.{'\n'}
                                The content will be in the new device as long as you don't change your apple account.
                                {'\n'}{'\n'}
                                Deactivate your old device as soon as you can to prevent other people from accessing your letters.{'\n'}
                                For more information refer to
                                <Text style={{ color: '#4487d7', fontWeight: 'bold' }}onPress={ () => Linking.openURL('https://support.apple.com/en-us/HT201472') }>
                                    {' this article from apple'}
                                </Text>.
                            </Text>
                        :
                            <Text style={ styles.answer }>
                                Your content is associated with the google account you chose when you installed the app <Text style={{ fontWeight: 'bold'}}>({AuthManager.currentUserId()})</Text>{'\n'}
                                Make sure to configure the same google account in your new device and your content will be there.
                                {'\n'}{'\n'}
                                Deactivate your old device as soon as you can to prevent other people from accessing your letters.{'\n'}
                                For more information refer to
                                <Text style={{ color: '#4487d7', fontWeight: 'bold' }}onPress={ () => Linking.openURL('https://support.google.com/accounts/answer/6160491?hl=en') }>
                                    {' this article from google'}
                                </Text>.
                            </Text>
                    }
                </View>
                
                <View style={ styles.questionContainer }>
                    <Text style={ styles.question }>
                        How do I disable reminders without disabling app notifications?
                    </Text>
                    <Text style={ styles.answer }>
                        Configure reminders using the option to the right in the bottom bar (<Iosicons 
                            style={{  }} 
                            name='ios-cog' size={ styles._answer.fontSize } color={'black'}                             
                            /> option)
                    </Text>
                </View>

                <View style={ styles.questionContainer }>
                    <Text style={ styles.question }>
                        Will I ever have to pay to use the app?
                    </Text>
                    <Text style={ styles.answer }>
                        Paid premium features will be released in the future but you will always be able to access, send and receive your letters for free.
                    </Text>
                </View>

                <View style={ styles.questionContainer }>
                    <Text style={ styles.question }>
                        Is the app available for {Platform.OS == 'ios' ? 'Android' : 'Apple'} devices?
                    </Text>
                    <Text style={ styles.answer }>
                        Yes it is. When a user opens the invitation link you send when sharing a space, it redirects them to the appropriate app store
                    </Text>
                </View>

                <View style={ styles.questionContainer }>
                    <Text style={ styles.question }>
                        I would love if the app...
                    </Text>
                    <Text style={ styles.answer }>
                        Your opinion and feedback is very important. Send an email to <Text style={{ fontWeight: 'bold' }}>contact@reconnectapp.co</Text>
                    </Text>
                </View>

                <View style={ styles.button }>                    
                    <Button title='CLOSE' onPress={ _back } 
                        buttonStyle={ Theme.palette.button }
                    />
                </View>

            </ScrollView>
        </View>
    )
}

export default FAQ