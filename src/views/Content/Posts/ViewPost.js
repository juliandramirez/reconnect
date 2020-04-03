/**
 * @flow
 */

import React, { useEffect, useRef } from 'react'
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { Dimensions } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { HeaderBackButton } from '@react-navigation/stack'
import EStyleSheet from 'react-native-extended-stylesheet'

import type { Post, Attachment } from 'Reconnect/src/services/content'
import Theme from 'Reconnect/src/theme/Theme'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'
import { wait } from 'Reconnect/src/lib/utils'
import { useModalBackground } from 'Reconnect/src/lib/utils'

import { AttachmentThumbnail, AttachmentDetailView } from './Attachment'
import { PostEnvelope, AttachmentEnvelope } from './Components'


const PostDetailStyles = EStyleSheet.create({
    headerContainer: {
        height: '66 rem',                        
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

    /* Properties */    
    const { post, headerColor } = route.params

    /* Render */
    return (
        <>            
            {/* HEADER */}
            <View style={{ flex: 0, flexDirection: 'row', 
                ...PostDetailStyles.headerContainer,   
                backgroundColor: headerColor,               
            }}>
                
                <View style={{position: 'absolute', width: '100%'}}>
                    <PostHeader post={post} color={headerColor}/>
                </View>
                
                <HeaderBackButton 
                    labelVisible={false} tintColor='black' onPress={navigation.goBack} />
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


const PostHeaderStyles = EStyleSheet.create({
    headerContainer: {
        paddingVertical: '8 rem',
    },
    headerText: {
        fontSize: '14 rem'
    }
})
const PostHeader = ({ post, color } : { post: Post, color: string }) => {

    function _renderDate() {
        return 'Wednesday, Sep 30 - 2020'
    }

    function _renderHeaderSubtitle() {
        return 'From GF @ 7:30 pm'
    }

    return (
        <View style={{ 
            ...PostHeaderStyles.headerContainer,
            marginHorizontal: '0.1%',                           
            paddingHorizontal: '5%', 
            backgroundColor: color            
        }}>
            <Text style={{ ...PostHeaderStyles.headerText, textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', color: 'black' }}>
                {_renderDate()}
            </Text>

            <Text style={{ ...PostHeaderStyles.headerText, paddingTop: 2, textAlign: 'center' }}>
                {_renderHeaderSubtitle()}
            </Text>
        </View>
    )
}

const PostTextScrollable = ({ text } : { text: string }) => {
    
    return (
        <ScrollView alwaysBounceVertical={false} style={{marginBottom: '5%', flex: 1, }}>
            <View style={{ margin: '5%', flex: 1, }}>            
                <Text style={{ flex: 1, fontSize: 13, fontFamily: 'the girl next door' }}>
                    {text}
                </Text>            
            </View> 
        </ScrollView>
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

    // $FlowExpectedError: Always intialized before use
    const scrollView = useRef<FlatList>()

    function _initialScroll() {
        if (attachments.length > 3) {
            scrollView.current.scrollToIndex({
                 index: 0.55,
                 animated: true
            })
        }
    }

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
                
                ref={ref => scrollView.current = ref}
                onLayout={_initialScroll}
                onScrollToIndexFailed={() => {
                    wait(500).then(_initialScroll)
                }}
            />
        </AttachmentEnvelope>
    )
}

export default PostView