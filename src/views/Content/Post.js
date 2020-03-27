/**
 * @flow
 */

import React from 'react'
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { Dimensions } from 'react-native'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { useNavigation, useRoute } from '@react-navigation/native'

import type { Post, Attachment } from 'Reconnect/src/services/content'
import Theme from 'Reconnect/src/theme/Theme'

import { NavigationRoutes } from './index'


export const PostDetail = () => {
    const route = useRoute()
    const { post, headerColor } = route.params

    return <PostView post={post} headerColor={headerColor} fullscreenMode={true} />
}

const PostView = ({ post, headerColor, fullscreenMode } 
    : { post: Post, headerColor: string, fullscreenMode: boolean } ) => {

    /* Hooks */
    const navigation = useNavigation()
    
    /* Functions */
    function _onPress() {          
        navigation.navigate( NavigationRoutes.PostDetail, 
                { post: post, headerColor: headerColor } )
    }

    /* Render */
    function _render() {
        return (<>
            {/* TOP IMAGE */}
            <Image        
                style={{
                    width: Dimensions.get('window').width * 0.92,
                    height: (Dimensions.get('window').width * 0.92) * (152.0/1262.0)
                }}                
                resizeMode='cover' 
                defaultSource={ Theme.images.topPost }                
                source={ Theme.images.topPost }                
            />

            {/* POST CONTENT */}
            <View style={{ 
                backgroundColor: 'white', 
                height: fullscreenMode ? '96%' : undefined
            }}>                               
                <View style={{ 
                    borderWidth: 2.25, 
                    borderTopWidth: 0, 
                    borderColor: Theme.colors.contentBorders,
                    height: fullscreenMode ? '100%' : undefined
                }}>

                    {/* HEADER */}
                    <View style={{flex: 0}}>
                        <PostHeader post={post} color={headerColor} />
                    </View>

                    {/* TEXT */}
                    {
                        fullscreenMode ? 
                            <View style={{ flex: 1 }}>
                                <PostTextScrollable text={post.text}/> 
                            </View>
                        : 
                            <View style={{flex: 0}}>
                                <PostText text={post.text}/>
                            </View>
                    }

                    {/* ATTACHMENTS */} 
                    <View style={{flex: 0}}>
                    { 
                        post.attachments && post.attachments.length > 0 ? (
                            <PostAttachments attachments={post.attachments} />
                        ) : ( 
                            <></> 
                        )
                    }
                    </View>
                </View>
            </View>
        </>)
    }

    return (        
        <View style={{ marginTop: '8%', paddingHorizontal: '4%' }}>   
        {
            fullscreenMode ?      
                <View style={{height: '100%'}}>          
                    {_render()}
                </View>
            : (
                <TouchableOpacity activeOpacity={1} onPress={_onPress}>        
                    {_render()}
                </TouchableOpacity>
            )
        }            
        </View>        
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
            marginTop: '3%', 
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
        <View style={{ margin: '5%', marginBottom: 0}}>
            <ScrollView alwaysBounceVertical={false} style={{marginBottom: '5%'}}>
                <Text style={{ fontSize: 13, fontFamily: 'the girl next door' }}>
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

const PostAttachments = ({ attachments } : { attachments: Array<Attachment> }) => {
    return (
        <View style={{                         
            borderColor: Theme.colors.contentBorders, 
            borderTopWidth: 2, 
            paddingHorizontal: '5%', 
            paddingVertical: 20
        }}>                        
            <FlatList horizontal 
                style={{ height: Dimensions.get('window').width * 0.25 }}                            
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => (
                    <View style={{ width: 15, height: Dimensions.get('window').width * 0.25 }}/>
                )}
                data={ attachments }                        
                keyExtractor={ attachment => attachment.id }
                renderItem={ ({ item }) => (<AttachmentView attachment={item}/>)}
            />
            
            <EvilIcons name='paperclip' size={56} style={{color: Theme.colors.contentBorders, position: 'absolute', right: '-2%', bottom: '-5%'}}/>
        </View>
    )
}

const AttachmentView = ({ attachment: Attachment }) => {
    return (
        <Image resizeMode='cover' 
            style={{
                width: Dimensions.get('window').width * 0.25,  
                aspectRatio: 1,
            }}
            source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/morning.jpeg?alt=media&token=7244e078-0ae3-4839-a363-07d0881ecf03' }}                                 
        />
    )
}

export default PostView