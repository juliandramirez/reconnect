/**
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Alert } from 'react-native'
import { Dimensions } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { HeaderBackButton } from '@react-navigation/stack'
import EStyleSheet from 'react-native-extended-stylesheet'

import type { Post, Attachment } from 'Reconnect/src/services/posts'
import type { Space } from 'Reconnect/src/services/spaces'
import Theme from 'Reconnect/src/theme/Theme'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'
import AuthManager from 'Reconnect/src/services/auth'
import SpacesManager from 'Reconnect/src/services/spaces'

import { PostEnvelope, PostHeader, PostAttachments, PostTextScrollable, PostText } from './Components'


/* Hooks */

type PostConfiguration = {|
    headerColor: string,
    authorLabel: string,
    actionLabel: string,
    action: Function
|}
function usePostConfiguration({ space, post } : { space: Space, post: Post }) : PostConfiguration {
    
    /* Hooks */
    const navigation = useNavigation()

    /* Properties */
    const userIsAuthor = post.authorId == AuthManager.currentUserId()

    const configuration = userIsAuthor ? {
        headerColor: Theme.colors.appBackground,
        authorLabel: 'You',
        actionLabel: 'EDIT LETTER',
        action: () => {
            Alert.alert('Edit Letter', 'Do you want to edit this letter?', [ {
                    text: 'Confirm',
                    onPress: () => navigation.navigate( NavigationRoutes.NewPost, { space, editPost: post } )
                },
                {
                    text: 'Cancel',
                    style: 'cancel',                    
                }
            ], {
                cancelable: true
            })
        }
    } : {
        headerColor: space.configuration?.color ?? 'white',
        authorLabel: space.configuration?.shortName ?? 'Them',
        actionLabel: 'READ LETTER',
        action: () => navigation.navigate( NavigationRoutes.PostDetail, { post, space } )        
    }

    return configuration
}

/* Components */

const PostDetailStyles = EStyleSheet.create({
    headerContainer: {
        height: 66,                        
        alignItems: 'center',
        borderBottomWidth: 2,
        borderTopWidth: 1,
        borderColor: Theme.colors.contentBorders
    }
})

export const PostDetail = () => {

    /* Hooks */
    const navigation = useNavigation()
    const route = useRoute()

    const { post, space } = route.params
    const configuration = usePostConfiguration({ space, post })
    
    /* Render */
    return (
        <>            
            {/* HEADER */}
            <View style={{ flex: 0, flexDirection: 'row', 
                ...PostDetailStyles.headerContainer,   
                backgroundColor: configuration.headerColor,               
            }}>
                
                <View style={{position: 'absolute', width: '100%'}}>
                    <PostHeader 
                        postDate={ post.created } 
                        color={ configuration.headerColor } 
                        postAuthorLabel={ configuration.authorLabel }
                    />
                </View>
                
                <HeaderBackButton 
                    labelVisible={false} tintColor='black' onPress={navigation.goBack} />
            </View>

            {/* TEXT */}
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <PostTextScrollable text={post.content}/> 
            </View>

            {/* ATTACHMENTS */} 
            <View style={{flex: 0}}>
                <PostAttachments 
                    showClip={false} 
                    attachments={post.attachments} 
                    interactive={true}/>
            </View>
        </>
    )
}

const PostView = ({ post, space } : { post: Post, space: Space } ) => {

    /* Hooks */  
    const configuration = usePostConfiguration({ space, post })

    /* Render */    
    return (
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={ configuration.action }>        
            <PostEnvelope>
                {/* HEADER */}
                <View style={{flex: 0}}>
                    <PostHeader 
                        postDate={ post.created } 
                        color={ configuration.headerColor } 
                        postAuthorLabel={ configuration.authorLabel }
                    />
                </View>

                {/* TEXT */}
                <View style={{flex: 0}}>
                    <PostText 
                        content={post.content} 
                        actionLabel={ configuration.actionLabel }/>
                </View>

                {/* ATTACHMENTS */} 
                <View style={{flex: 0}}>
                    <PostAttachments 
                        showClip={true} 
                        attachments={post.attachments} 
                        interactive={true}                            
                    />
                </View>
            </PostEnvelope>
        </TouchableOpacity>  
    ) 
}

//$FlowExpectedError: not typed
export default React.memo(PostView, (prevProps, nextProps) => {
    const prevPost = prevProps.post
    const nextPost = nextProps.post

    const equalAttachments = 
        prevPost.attachments.length == nextPost.attachments.length &&
        prevPost.attachments.reduce((accum, item, index) => 
            accum && item.url == nextPost.attachments[index].url, true)
            
    const contentIsEqual = prevPost.content == nextPost.content && equalAttachments

    // space, post.author and  post.created do not change over time, no need check them...
    return prevPost.id == nextPost.id && contentIsEqual
})