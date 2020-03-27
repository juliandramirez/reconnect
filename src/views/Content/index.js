/**
 * @flow
 */

import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Theme from 'Reconnect/src/theme/Theme'

import Container from './Container'
import Post, { PostDetail } from './Post'
import NewPost from './NewPost'


export const NavigationRoutes = {
    Main: 'Main',
    PostDetail: 'PostDetail',
    NewPost: 'NewPost'
}

const Stack = createStackNavigator()
const NavigationContainer = () => (
    <Stack.Navigator screenOptions={{ 
        headerTintColor: 'black',
        headerBackTitleVisible: false,
        headerStyle: {
            backgroundColor: Theme.colors.appBackground,
            borderColor: Theme.colors.contentSeparator,
            borderBottomWidth: 1,
        },
        cardStyle: {
            backgroundColor: Theme.colors.appBackground
        }
    }}>
        <Stack.Screen 
            name={ NavigationRoutes.Main } 
            component={ Container } 
            options={{ headerShown: false }}/> 

        <Stack.Screen 
            name={ NavigationRoutes.PostDetail } 
            component={ PostDetail }             
            options={{ headerTitle: 'Post detail' }}
        />

        <Stack.Screen name={ NavigationRoutes.NewPost } component={ NewPost } />
    </Stack.Navigator>
)

export default NavigationContainer
