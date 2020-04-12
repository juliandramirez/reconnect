/**
 * @flow
 */

import * as React from 'react'
import { useRef } from 'react'
import { View, Image, ScrollView, Text, FlatList } from 'react-native'
import { Dimensions } from 'react-native'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import EStyleSheet from 'react-native-extended-stylesheet'

import Theme from 'Reconnect/src/theme/Theme'
import type { Moment } from 'Reconnect/src/services/posts'
import type { Attachment } from 'Reconnect/src/services/posts'
import { wait } from 'Reconnect/src/lib/utils'

import { AttachmentThumbnail, AttachmentDetailView } from './Attachment'


export const PostEnvelope = ({ children } : { children: React.Node }) => (

    <View style={{ flex: 1, margin: Dimensions.get('window').width * 0.04 }}> 
        {/* TOP IMAGE */}
        <Image        
            style={{
                flex: 0,                
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
            flex: 1,            
        }}>                               
            <View style={{ 
                borderWidth: 2.25, 
                borderTopWidth: 0, 
                borderColor: Theme.colors.contentBorders,
                flex: 1,  
                paddingTop: '1%',              
            }}>
                {children}
            </View>
        </View>            
    </View>                    
)


const PostHeaderStyles = EStyleSheet.create({
    headerContainer: {
        paddingVertical: '8 rem',
    },
    headerText: {
        fontSize: '14 rem'
    }
})
export const PostHeader = ({ postDate, postAuthorLabel, color } : { 
        postDate: Moment, 
        postAuthorLabel: string, 
        color: string }) => {

    function _renderDate() {
        return postDate.format('dddd, MMM D - YYYY')
    }

    function _renderHeaderSubtitle() {
        return `From ${postAuthorLabel} @ ${postDate.format('h:mm a')}`
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

export const PostTextScrollable = ({ text } : { text: string }) => {
    
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

export const PostText = ({ content, actionLabel } : { content: string, actionLabel: string }) => {
    return (
        <View style={{ margin: '5%'}}>
            <Text numberOfLines={6} style={{ fontSize: 13, fontFamily: 'the girl next door' }}>                            
                {content}
            </Text>
            <Text style={{ textAlign:'left', color: 'black', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5, marginTop: '5%' }}>
                {actionLabel}
            </Text>
        </View>
    )
}

export const PostAttachments = ({ showClip, attachments, interactive } : { 
        showClip: boolean, 
        attachments: Array<Attachment>,
        interactive: boolean
    }) => {

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
                keyExtractor={ attachment => attachment.url }
                renderItem={ ({ item }) => (<AttachmentThumbnail attachment={item} tappable={interactive}/>)}
                
                ref={ref => scrollView.current = ref}
                onLayout={_initialScroll}
                onScrollToIndexFailed={() => {
                    wait(500).then(_initialScroll)
                }}
            />
        </AttachmentEnvelope>
    )
}

export const AttachmentEnvelope = ({ showClip, children } : { showClip: boolean, children: React.Node }) => (
    <View style={{                         
        borderColor: Theme.colors.contentBorders, 
        borderTopWidth: 2, 
        paddingHorizontal: '5%', 
        paddingVertical: 20
    }}>                        
        {children}  
        
        {showClip ? (
            <EvilIcons name='paperclip' size={56} style={{color: Theme.colors.contentBorders, position: 'absolute', right: '-2%', bottom: '-5%'}}/>
        ) : <></>}      
        
    </View>    
)
