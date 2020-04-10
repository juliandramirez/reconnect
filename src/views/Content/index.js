/**
 * @flow
 */

import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Theme from 'Reconnect/src/theme/Theme'

import Container from './Container'
import AddSpace from './Spaces/Add'
import AddSpaceSuccess from './Spaces/Add/Success'
import Post, { PostDetail } from './Posts/ViewPost'
import NewPost from './Posts/NewPost'
import { AttachmentDetailView } from './Posts/Attachment'


export const NavigationRoutes = {
    Main: 'Main',
    PostDetail: 'PostDetail',
    AttachmentDetail: 'AttachmentDetail',
    NewPost: 'NewPost',
    AddSpace: 'AddSpace',
    SpaceAdded: 'SpaceAdded'
}


const RootStack = createStackNavigator()
const RootStackScreen = () => (
    <RootStack.Navigator mode="modal" screenOptions={{ headerShown: false }}>
        <RootStack.Screen
            name='Root'
            component={ PostsContainer }
        />

        <Stack.Screen 
            name={ NavigationRoutes.AddSpace } 
            component={ AddSpace } 
        />

        <Stack.Screen 
            name={ NavigationRoutes.SpaceAdded } 
            component={ AddSpaceSuccess } 
        />

        <Stack.Screen 
            name={ NavigationRoutes.AttachmentDetail } 
            component={ AttachmentDetailView } 
        />
    </RootStack.Navigator>    
)

const Stack = createStackNavigator()
const PostsContainer = () => (
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
            options={{ headerShown: false }} 
            initialParams={{ spaceId: null }}               
        /> 

        <Stack.Screen 
            name={ NavigationRoutes.PostDetail } 
            component={ PostDetail }             
            options={{ headerShown: false }} 
        />

        <Stack.Screen 
            name={ NavigationRoutes.NewPost } 
            component={ NewPost } 
            options={{ headerTitle: 'New Post' }}
        />
    </Stack.Navigator>
)

export default RootStackScreen
