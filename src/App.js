/**
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { StyleSheet, SafeAreaView, StatusBar, Dimensions } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import EStyleSheet from 'react-native-extended-stylesheet'
import FlashMessage from 'react-native-flash-message'

import { useCodePush } from 'Reconnect/src/lib/codepush'
import { hideLoadingScreen } from 'Reconnect/src/lib/utils'
import NotificationsManager from 'Reconnect/src/services/notifications'
import { REM_SCALE } from 'Reconnect/src/theme/palette'
import Theme, { SkinProvider, useSkin } from 'Reconnect/src/theme/Theme'
import AuthManager from 'Reconnect/src/services/auth'
import SpacesManager from 'Reconnect/src/services/spaces'
import CrashReportManager from 'Reconnect/src/lib/crashreports'
import AnalyticsManager from 'Reconnect/src/lib/analytics'
import Constants from 'Reconnect/src/Constants'
import runMigrations from 'Reconnect/src/lib/migrations'

import Loading from 'Reconnect/src/lib/Loading'
import Onboarding from './views/Onboarding'
import Content from './views/Content'


const Stack = createStackNavigator()
const App = () => {

    /* State */
    const [initializing, setInitializing] = useState<boolean>(true)

    /* Hooks */
    useCodePush(_init) 

    /* Functions */    
    function _init() {         
        // we don't need to wait for these...
        NotificationsManager.init()
        SpacesManager.init()

        // we need to wait for these...
        Promise.all([
                initializeStyles(), 
                Constants.init(), 
                CrashReportManager.init(),
                AnalyticsManager.init()
            ])
            .then(runMigrations)
            .then(() => {
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
            hideLoadingScreen()
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
                        <Stack.Screen name="Onboarding" component={ Onboarding } />
                    )
                }                        
                </Stack.Navigator>
            </NavigationContainer>
            
            <FlashMessage position="top" />
        </SafeAreaView>        
    )
}

export default App
