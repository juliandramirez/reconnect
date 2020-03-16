/**
 * @flow
 */

import React, { useEffect, useState } from 'react'
import { StyleSheet, SafeAreaView } from 'react-native'

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Loading from './Loading'
import Onboarding from './views/Onboarding'
import Timeline from './views/Timeline'

import AuthManager, { AuthProvider } from './services/auth'


const Stack = createStackNavigator()
const App = () => {

    const [user, setUser] = useState(null)
    const [initializing, setInitializing] = useState(true)

    useEffect(_init, [])

    function _init() {
        AuthManager.getUser().then(user => {
            setUser(user)
            setInitializing(false)            
        })
    }

    return (
        <AuthProvider user={user}>
            <SafeAreaView style={{flex: 1}}>
                <NavigationContainer>
                {
                    initializing ? 
                        <Loading /> 
                    : (
                        <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {
                            user == null ? (
                                <Stack.Screen name="Onboarding" component={Timeline} />
                            ) : (
                                <Stack.Screen name="Timeline" component={Timeline} />
                            )
                        }                        
                        </Stack.Navigator>                            
                    )
                }
                </NavigationContainer>
            </SafeAreaView>
        </AuthProvider>
    );
};

export default App;
