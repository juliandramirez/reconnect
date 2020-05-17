/**
 * @flow
 */

import * as React from 'react'
import { View, TouchableOpacity, Text, Image } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import LinearGradient from 'react-native-linear-gradient'

import Theme from 'Reconnect/src/theme/Theme'
import type { Post } from 'Reconnect/src/services/posts'
import type { Space } from 'Reconnect/src/services/spaces'
import { getHighlightColor } from 'Reconnect/src/lib/utils'

import { usePostConfiguration } from './hooks'


const styles = EStyleSheet.create({
    container: {
        flex: 1,
        marginTop: '20 rem', 
        marginHorizontal: '15 rem',   
    },
        content: {
            marginHorizontal: '18 rem',
            marginTop: '14 rem',
            marginBottom: '12 rem'
        },
            headingContainer: {
                marginBottom: '30 rem'
            },
                heading: {
                    fontSize: '14 rem', 
                    textTransform: 'uppercase', 
                    fontWeight: 'bold', 
                    color: '#444',                     
                },
                subheading: { 
                    fontSize: '13 rem', 
                    paddingTop: '4 rem', 
                    fontWeight: 'normal', 
                    color: '#444',                    
                    textTransform: 'uppercase',                     
                },
            labelContainer: {
                backgroundColor: '#fafafd', 
                paddingVertical: '8 rem',
                paddingHorizontal: '10 rem',
                borderRadius: '15 rem', 
                borderWidth: '0.5 rem', 
                borderColor: '#555',
            },
                textContainer: {
                    borderRightWidth: '1.5 rem', 
                    borderColor: '#999', 
                    paddingRight: '20 rem'
                },
                    text: {
                        fontSize: '13.5 rem', 
                        textAlign: 'right', 
                        fontWeight: 'normal', 
                        color: '#000', 
                        marginTop: '2 rem',
                        fontFamily: 'Courier'
                    },
                    imageContainer: { 
                        flexDirection: 'row',
                        opacity: 0.66, 
                        marginLeft: '17 rem',
                    },
                        image: {
                            alignSelf: 'center',
                            width: '47 rem', 
                            height: '47 rem', 
                            tintColor: '#000'
                        },
            actionLabel: { 
                textAlign:'right', 
                color: '#000', 
                fontWeight: 'normal', 
                fontSize: '13 rem', 
                letterSpacing: '0.5 rem', 
                marginTop: '10 rem', 
                marginRight: '6 rem' 
            },
    backgroundLayer: {                     
        width: '100%', 
        height: '100%',  
        position: 'absolute',        
        opacity: 0.5,
        borderWidth: 0.5,
        borderStyle: 'solid',
        borderRadius: 1
    }   
})

const EnvelopeView = ({ post, space } : { post: Post, space: Space } ) => {
    
    /* Hooks */  
    const configuration = usePostConfiguration({ space, post })

    /* Properties */  
    const color = configuration.headerConfig.color
    const highlightColor = getHighlightColor(color)

    /* Functions */  
    function _numberOfWords() {
        const words = post.content.split(' ').length
        if (words == 1) {
            return `${words} WORD`
        } else {
            return `${words} WORDS`
        }
    }

    function _numberOfImages() {
        const images = post.attachments ? post.attachments.filter(item => item.type == 'image').length : 0
        if (images == 0) {
            return 'NO IMAGES'
        } else if (images == 1) {
            return `${images} IMAGE`
        } else {
            return `${images} IMAGES`
        }
    }

    function _numberOfVideos() {
        const videos = post.attachments ? post.attachments.filter(item => item.type == 'video').length : 0
        if (videos == 0) {
            return 'NO VIDEOS'
        } else if (videos == 1) {
            return `${videos} VIDEO`
        } else {
            return `${videos} VIDEOS`
        }
    }

    /* Render */    
    return (
        <TouchableOpacity style={{ ...styles.container }} 
            activeOpacity={1} 
            onPress={ configuration.actionConfig.action } >

            {/* BACKGROUND */}
            <LinearGradient colors={[
                '#fafafa',                 
                color,                                                                            
            ]} 
                style={{ ...styles.backgroundLayer, 
                    borderColor: highlightColor,
                }}                
                locations={[0, 0.66]}
                useAngle={true}
                angle={15} 
                angleCenter={{ x: 0.33, y: 0.15 }}
            />

            <View style={ styles.content }>        

                {/* HEADER */}
                <View style={ styles.headingContainer }>
                    <Text style={ styles.heading }>
                        { configuration.headerConfig.title }
                    </Text>
                    <Text style={ styles.subheading }>
                        <Text style={{ fontWeight: 'normal'}}>FROM:</Text> { configuration.headerConfig.from }
                    </Text>                    
                    <Text style={ styles.subheading }>
                        { configuration.headerConfig.subtitle }
                    </Text>                    
                </View>

                {/* TEXT */}                    
                <View style={{ flexDirection: 'row-reverse' }}>
                    <View style={{ flexDirection: 'row', ...styles.labelContainer }}>

                        <View style={ styles.textContainer }>
                            <Text style={ styles.text }>
                                {_numberOfWords()}
                            </Text>
                            <Text style={ styles.text }>
                                {_numberOfImages()}
                            </Text>
                            <Text style={ styles.text }>
                                {_numberOfVideos()}
                            </Text>
                        </View>

                        <View style={ styles.imageContainer }>
                            <Image resizeMode='contain' 
                                style={{ ...styles.image, tintColor: highlightColor }} 
                                source={ Theme.images.stamp } 
                                defaultSource={ Theme.images.stamp }                                    
                            />
                        </View>
                    </View>
                </View>

                {/* ACTION LABEL */}
                <Text style={ styles.actionLabel }>
                    {configuration.actionConfig.label}
                </Text>

            </View>
        </TouchableOpacity>  
    ) 
}


export default EnvelopeView