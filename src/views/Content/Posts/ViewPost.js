/**
 * @flow
 */

import React from 'react'
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { Dimensions } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

import type { Post, Attachment } from 'Reconnect/src/services/content'
import Theme from 'Reconnect/src/theme/Theme'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'

import { AttachmentThumbnail, AttachmentDetailView } from './Attachment'
import { PostEnvelope, AttachmentEnvelope } from './Components'


export const PostDetail = () => {

    /* Hooks */
    const route = useRoute()

    /* Properties */
    const { post, headerColor } = route.params

    /* Render */
    return (
        <>
            {/* HEADER */}
            <View style={{flex: 0}}>
                <PostHeader post={post} color={headerColor} />
            </View>

            {/* TEXT */}
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <PostTextScrollable text={post.text}/> 
            </View>

            {/* ATTACHMENTS */} 
            <View style={{flex: 0}}>
                <PostAttachments showClip={false} attachments={post.attachments} />
            </View>
        </>
    )
}

const PostView = ({ post, headerColor } : { post: Post, headerColor: string } ) => {

    /* Hooks */
    const navigation = useNavigation()
    
    /* Functions */
    function _onPress() {          
        navigation.navigate( NavigationRoutes.PostDetail, 
                { post, headerColor } )
    }

    /* Render */    
    return (
        <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={_onPress}>        
            <PostEnvelope>
                {/* HEADER */}
                <View style={{flex: 0}}>
                    <PostHeader post={post} color={headerColor} />
                </View>

                {/* TEXT */}
                <View style={{flex: 0}}>
                    <PostText text={post.text}/>
                </View>

                {/* ATTACHMENTS */} 
                <View style={{flex: 0}}>
                    <PostAttachments showClip={true} attachments={post.attachments} />
                </View>
            </PostEnvelope>
        </TouchableOpacity>  
    ) 
}


const PostHeader = ({ post, color } : { post: Post, color: string }) => {

    function _renderDate() {
        return 'Wednesday, Sep 30 - 2020'
    }

    function _renderHeaderSubtitle() {
        return 'From GF @ 7:30'
    }

    return (
        <View style={{ 
            marginHorizontal: '0.1%',              
            paddingVertical: '4%', 
            paddingHorizontal: '5%', 
            backgroundColor: color            
        }}>
            <Text style={{ fontSize: 15, fontWeight: 'bold' }}>
                {_renderDate()}
            </Text>

            <Text style={{ fontSize: 15, paddingTop: '2%' }}>
                {_renderHeaderSubtitle()}
            </Text>
        </View>
    )
}

const PostTextScrollable = ({ text } : { text: string }) => {
    return (
        <View style={{ margin: '5%', marginBottom: 0, flex: 1, }}>
            <ScrollView alwaysBounceVertical={false} style={{marginBottom: '5%', flex: 1, }}>
                <Text style={{ flex: 1, fontSize: 13, fontFamily: 'the girl next door' }}>
                    {text}
                </Text>
            </ScrollView>
        </View>
    )
}

const PostText = ({ text } : { text: string }) => {
    return (
        <View style={{ margin: '5%'}}>
            <Text numberOfLines={6} style={{ fontSize: 13, fontFamily: 'the girl next door' }}>                            
                {text}
            </Text>
            <Text style={{ textAlign:'left', color: 'black', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5, marginTop: '5%' }}>
                READ POST
            </Text>
        </View>
    )
}

const PostAttachments = ({ showClip, attachments } : { showClip: boolean, attachments: Array<Attachment> }) => {
    return attachments.length === 0 ? <></> : (
        <AttachmentEnvelope showClip={showClip}>                        
            <FlatList horizontal 
                style={{ height: Dimensions.get('window').width * 0.25 }}                            
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                    <View style={{ width: 15, height: Dimensions.get('window').width * 0.25 }}/>
                )}
                data={ attachments }                        
                keyExtractor={ attachment => attachment.id }
                renderItem={ ({ item }) => (<AttachmentThumbnail attachment={item}/>)}
            />
        </AttachmentEnvelope>
    )
}

export default PostView