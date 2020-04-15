/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'
import { Image, Text, View, TouchableOpacity, FlatList } from 'react-native'
import { Button } from 'react-native-elements'
import EStyleSheet from 'react-native-extended-stylesheet'

import type { Space } from 'Reconnect/src/services/spaces'
import type { Post } from 'Reconnect/src/services/posts'
import PostsManager from 'Reconnect/src/services/posts'
import SpacesManager from 'Reconnect/src/services/spaces'
import AuthManager from 'Reconnect/src/services/auth'
import Loading from 'Reconnect/src/lib/Loading'
import Theme from 'Reconnect/src/theme/Theme'
import { shareInstallApp, showInfoMessage } from 'Reconnect/src/lib/utils'

import PostView from './View'


const styles = EStyleSheet.create({
    emptyMessageContainer: {
        flex: 1, 
        alignItems: 'center', 
        marginTop: '23%'        
    },
        emptyMessage: {
            textAlign: 'center', 
            textTransform: 'uppercase', 
            color: '#888',
            fontSize: '22 rem',
            lineHeight: '40 rem',
            fontFamily: 'courier', 
            paddingHorizontal: '25 rem',
        },
    waitingContainer: {
        flexDirection: 'row', 
        paddingHorizontal: '18 rem', 
        paddingVertical: '3 rem',
        marginBottom: '5 rem'
    },
    waitingImage: {
        flex: 0,                
        width: '50 rem',
        height: '50 rem'
    },
    waitingMessageContainer: {
        flex: 0, 
        justifyContent: 'center', 
        alignItems: 'flex-end'
    },
    waitingMessage: {
        alignSelf: 'flex-start', 
        color: '#222', 
        fontSize: '15 rem',
        marginBottom: '5 rem'
    },
    waitingAction: {
        fontWeight: 'bold', 
        color: '#444', 
        fontSize: '14 rem'
    },
    notWaitingContainer: {
        paddingVertical: '8 rem'
    },
    notWaitingMessage: { 
        fontSize: '13 rem', 
        fontWeight: 'normal', 
        color: '#000', 
        textAlign: 'center', 
        textTransform: 'uppercase' }
})

const PostList = ({ space } : { space: Space }) => {

    /* State */
    const [posts, setPosts] = useState<Array<Post>>([])
    const [initializing, setInitializing] = useState<boolean>(true)
    const [waitingForGuest, setWaitingForGuest] = useState<boolean>(space.guestId == null)

    /* Variables */
    const listRef = useRef()

    /* Effects */    
/*  
   IMPORTANT: _init has to be recomputed when the space changes because 
   THE STATE OF THE COMPONENT DEPENDS ON THE INPUT OF RENDER (the space) 
   (state is persisted through re renders... the same components gets called with different properties on re renders)
*/
    useEffect(_init, [space])

    /* Functions */
    function _init() {  
    // every time space changes reset to defaults the values...
        setPosts([])
        setInitializing(true)
        setWaitingForGuest(space.guestId == null)

        return PostsManager.subscribeToChanges({ spaceId: space.id, listener: updatedPosts => {
                setInitializing(false)
                setPosts(updatedPosts)                    

                if (listRef.current) {
                    listRef.current.scrollToOffset({ offset: 0, animated: true })
                }
            }
        })
    }
    
    /* Render */
    return initializing  ? <Loading /> : ( <>
        {
            waitingForGuest ? 
                <TouchableOpacity
                    onPress={ () => shareInstallApp(space.invitationCode) }
                    style={{...styles.waitingContainer, 
                        //$FlowExpectedError: not null
                        backgroundColor: space.configuration.color
                    }}
                >
                    <Image 
                        style={styles.waitingImage}                
                        resizeMode='cover' 
                        defaultSource={Theme.images.waitingFor}
                        source={Theme.images.waitingFor}                 
                    />

                    <View style={styles.waitingMessageContainer}>
                        <Text style={styles.waitingMessage}>...waiting for them to get here</Text>
                        <Text style={styles.waitingAction}>SHARE CODE AGAIN</Text>
                    </View>
                </TouchableOpacity>   
            : 
                posts.length == 0 ? 
                    <View style={{                         
                        ...styles.notWaitingContainer,
                        //$FlowExpectedError: not null
                        backgroundColor: space.configuration.color 
                    }}>
                        <Text style={ styles.notWaitingMessage }>
                            You are both part of this space now
                        </Text>
                    </View>
                : 
                    <></>         
        }

        {
            posts.length > 0 ?            
                <FlatList
                    data={posts}
                    renderItem={ ({item}) => <PostView post={item} space={space}/> }
                    keyExtractor={ item => item.id }
                    ref={ ref => listRef.current = ref }
                />
            :
                <View style={styles.emptyMessageContainer}>
                    <Text style={styles.emptyMessage}>
                        Nothing here{'\n'}You should write the first post
                    </Text>
                </View>
        } 
    </>)
}

export default PostList