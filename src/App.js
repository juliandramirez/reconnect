/**
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Theme, { SkinProvider, useSkin } from 'Reconnect/src/theme/Theme'
import AuthManager, { AuthProvider, useAuthStore } from 'Reconnect/src/services/auth'
import type { User } from 'Reconnect/src/services/auth'

import Loading from './Loading'
import Onboarding from './views/Onboarding'
import Content from './views/Content'


const Stack = createStackNavigator()
const App = () => {

    /* State */
    const [user, setUser] = useState<?User>(null)
    const [initializing, setInitializing] = useState<boolean>(true)

    /* Effects */
    useEffect(_init, [])

    /* Functions */
    function _init() {
        AuthManager.getUser().then(user => {
            setUser(user)
            setInitializing(false)            
        })
    }

    /* Render */
    return initializing ? <Loading /> : (
        <AuthProvider user={user}>   
            <SkinProvider>
                <MainUI />
            </SkinProvider>                    
        </AuthProvider>
    )
}

const MainUI = () => {
    /* Hooks */
    const [skin, _] = useSkin()
    const user = useAuthStore()

    /* Render */
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: skin.safeAreaBackground}}>
            <StatusBar hidden={false} barStyle='dark-content' backgroundColor={skin.safeAreaBackground} animated={false}/>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                {
                    user == null ? (
                        <Stack.Screen name="Onboarding" component={ Content } />
                    ) : (
                        <Stack.Screen name="Timeline" component={ Content } />
                    )
                }                        
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaView>        
    )
}

export default App
