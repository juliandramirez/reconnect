/**
 * @flow
 */

import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Theme from 'Reconnect/src/theme/Theme'

import Container from './Container'
import Post, { PostDetail } from './Posts/ViewPost'
import NewPost from './Posts/NewPost'
import { AttachmentDetailView } from './Posts/Attachment'


export const NavigationRoutes = {
    Main: 'Main',
    PostDetail: 'PostDetail',
    AttachmentDetail: 'AttachmentDetail',
    NewPost: 'NewPost'
}


const RootStack = createStackNavigator()
const RootStackScreen = () => (
    <RootStack.Navigator mode="modal" screenOptions={{ headerShown: false }}>
        <RootStack.Screen
            name='Root'
            component={ NavigationContainer }
        />

        <Stack.Screen 
            name={ NavigationRoutes.AttachmentDetail } 
            component={ AttachmentDetailView } 
        />
    </RootStack.Navigator>    
)


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

        <Stack.Screen 
            name={ NavigationRoutes.NewPost } 
            component={ NewPost } 
            options={{ headerTitle: 'New Post' }}
        />
    </Stack.Navigator>
)

export default RootStackScreen
