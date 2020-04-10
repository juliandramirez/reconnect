/**
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { StyleSheet, SafeAreaView, StatusBar, Dimensions } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import EStyleSheet from 'react-native-extended-stylesheet'
import FlashMessage from 'react-native-flash-message'

import NotificationsManager from 'Reconnect/src/services/notifications'
import { REM_SCALE } from 'Reconnect/src/theme/palette'
import Theme, { SkinProvider, useSkin } from 'Reconnect/src/theme/Theme'
import AuthManager from 'Reconnect/src/services/auth'

import Loading from './Loading'
import Onboarding from './views/Onboarding'
import Content from './views/Content'


const Stack = createStackNavigator()
const App = () => {

    /* State */
    const [initializing, setInitializing] = useState<boolean>(true)

    /* Effects */
    useEffect(_init, [])    
    useEffect(NotificationsManager.init, [])

    /* Functions */    
    function _init() {         
        initializeStyles().then(() => {
            setInitializing(false)
        })        
    }

    function initializeStyles() {
        const { width } = Dimensions.get('window')
    
        EStyleSheet.build({
            $rem: width / REM_SCALE
        })
    
        // promise is resolved when styles are built...
        return new Promise<void>(resolve => EStyleSheet.subscribe('build', resolve))
    }

    /* Render */
    return initializing ? <Loading /> : (   
        <SkinProvider>
            <MainUI />
        </SkinProvider>                    
    )
}

const MainUI = () => {
    /* Hooks */
    const [skin, _] = useSkin()

    /* State */
    const [isSignedIn, setIsSignedIn] = useState<?boolean>(null)

    /* Effects */
    useEffect(_authInit, [])

    /* Functions */
    function _authInit() {
        const authListener = (userId: ?string) => {                                                    
            setIsSignedIn(userId !== null && userId !== undefined)        
        }
        return AuthManager.init(authListener)        
    }

    /* Render */
    return isSignedIn === null ? <Loading /> : (
        <SafeAreaView style={{flex: 1, backgroundColor: skin.safeAreaBackground}}>
            <StatusBar hidden={false} barStyle='dark-content' backgroundColor={skin.safeAreaBackground} animated={false}/>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                {
                    isSignedIn === true ? (
                        <Stack.Screen name="Timeline" component={ Content } />                        
                    ) : (
                        <Stack.Screen name="Onboarding" component={ Content } />
                    )
                }                        
                </Stack.Navigator>
            </NavigationContainer>
            
            <FlashMessage position="top" />
        </SafeAreaView>        
    )
}

export default App