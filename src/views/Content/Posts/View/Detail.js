/**
 * @flow
 */

import React, { useRef } from 'react'
import { View, ScrollView, Text, Dimensions, FlatList } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { HeaderBackButton } from '@react-navigation/stack'
import EStyleSheet from 'react-native-extended-stylesheet'

import Theme from 'Reconnect/src/theme/Theme'
import type { Attachment } from 'Reconnect/src/services/posts'
import { wait } from 'Reconnect/src/lib/utils'
import { AttachmentThumbnail } from 'Reconnect/src/views/Content/Posts/Attachment'

import { usePostConfiguration } from './hooks'


const styles = EStyleSheet.create({
    headerContainer: {
        flex: 0, 
        flexDirection: 'row',
        height: 66,                        
        alignItems: 'center',
        borderBottomWidth: 2,
        borderTopWidth: 1,
        borderColor: Theme.colors.contentBorders
    },
        headerTextContainer: {
            position: 'absolute', 
            width: '100%',
            paddingVertical: 8,
            marginHorizontal: '0.1%',                           
            paddingHorizontal: '5%',
        },
            headerTitle: {
                fontSize: 14, 
                textTransform: 'uppercase', 
                fontWeight: 'bold', 
                textAlign: 'center', 
                color: 'black'
            },
            headerSubtitle: {
                fontSize: 14, 
                paddingTop: 2, 
                textAlign: 'center'
            },
    textContainer: { 
        flex: 1, 
        backgroundColor: 'white' 
    },
        textScrollContainer: {
            marginBottom: '5%', 
            flex: 1 
        },
            innerTextContainer: {
                margin: '5%', 
                flex: 1
            },
                text: {
                    flex: 1, 
                    fontSize: 14, 
                    fontFamily: 'the girl next door'
                }
})

const PostDetail = () => {

    /* Hooks */
    const navigation = useNavigation()
    const route = useRoute()

    const { post, space } = route.params
    const configuration = usePostConfiguration({ space, post })
    
    /* Render */
    return (
        <>            
            {/* HEADER */}
            <View style={{ ...styles.headerContainer,   
                backgroundColor: configuration.headerConfig.color }}>
                
                <View style={ styles.headerTextContainer}>
                    <Text style={ styles.headerTitle }>
                        {configuration.headerConfig.title}
                    </Text>

                    <Text style={ styles.headerSubtitle }>
                        {configuration.headerConfig.subtitle}
                    </Text>
                </View>
                
                <HeaderBackButton 
                    labelVisible={false} tintColor='#333' onPress={navigation.goBack} />
            </View>

            {/* TEXT */}
            <View style={ styles.textContainer }>
                <ScrollView alwaysBounceVertical={false} style={ styles.textScrollContainer }>
                    <View style={ styles.innerTextContainer }>            
                        <Text style={ styles.text }>
                            {post.content}
                        </Text>            
                    </View> 
                </ScrollView>                
            </View>

            {/* ATTACHMENTS */} 
            <View style={{flex: 0}}>
                <PostAttachments attachments={post.attachments} />
            </View>
        </>
    )
}

const PostAttachments = ({ attachments } : { 
        attachments: Array<Attachment>
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
                keyExtractor={ attachment => attachment.url }
                renderItem={ ({ item }) => <AttachmentThumbnail attachment={item} /> }
                
                ref={ ref => scrollView.current = ref }
                onLayout={ _initialScroll }
                onScrollToIndexFailed={() => {
                    wait(500).then(_initialScroll)
                }}
            />
        </View>
    )
}

export default PostDetail