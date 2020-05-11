/**
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native'
import { Image } from 'react-native-elements'
import { Dimensions } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Video from 'react-native-video'

import type { Attachment } from 'Reconnect/src/services/posts'
import { useModalBackground } from 'Reconnect/src/lib/utils'
import Theme from 'Reconnect/src/theme/Theme'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'


export const AttachmentThumbnail = ({ attachment } : { attachment: Attachment }) => {

    /* Hooks */
    const navigation = useNavigation()

    /* Properties */
    const source = attachment.type == 'image' ? 
        { uri: attachment.url } : 
        Theme.images.videoPlaceholder

    /* Functions */

    function _onPress() {
        navigation.navigate( NavigationRoutes.AttachmentDetail, { attachment })
    }

    /* Render */

    function _render() {
        return (
            <Image resizeMode='cover' 
                style={{
                    width: Dimensions.get('window').width * 0.25,  
                    height: Dimensions.get('window').width * 0.25,
                }}
                source={source}
                PlaceholderContent={<ActivityIndicator color='white'/>}                               
            />
        )
    }
    
    return (      
        <TouchableOpacity activeOpacity={1} onPress={_onPress}>
            {_render()}
        </TouchableOpacity>
    )
}

export const AttachmentDetailView = () => {

    /* State */
    const [loading, setLoading] = useState<boolean>(true)    

    /* Hooks */
    const navigation = useNavigation()
    const route = useRoute()
    const dismissModalBackground = useModalBackground('black')

    /* Properties */
    const { attachment } = route.params

    /* Functions */
    function _dismiss() {
        dismissModalBackground()
        navigation.goBack()
    }

    /* Render */
    function _renderComponent() {
        if (attachment.type == 'image') {
            return ( 
                <Image 
                    resizeMode='contain'
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    source={{uri: attachment.url}}
                />
            )
        } else if (attachment.type == 'video') {
            return (
                <>
                    <Video 
                        style={{
                            width: '100%',
                            height: '100%',
                            left: 0,
                        }}
                        source={{uri: attachment.url}}
                        controls={false}
                        onReadyForDisplay={() => setLoading(false)}
                        onError={() => { alert('Invalid video'); _dismiss() }}
                        onEnd={_dismiss}
                    />
                    <ActivityIndicator 
                        color='white' 
                        size='large' 
                        animating={loading} 
                        style={{position: 'absolute', top: '50%', left: '45%'}}                            
                    />
                </>
            )
        } else {
            return <></>
        }
    }

    return (
        <>
            <StatusBar hidden/>
            <TouchableOpacity activeOpacity={1} onPress={_dismiss} 
                style={{ 
                    flex: 1, 
                    backgroundColor: 'black'                    
                }}
            >            
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    {_renderComponent()}
                </View>
            </TouchableOpacity>
        </>
    )
}