/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'
import { Image, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native'
import { Button } from 'react-native-elements'
import EStyleSheet from 'react-native-extended-stylesheet'
import Zocial from 'react-native-vector-icons/Zocial'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'

import type { Space } from 'Reconnect/src/services/spaces'
import type { Post } from 'Reconnect/src/services/posts'
import type { Draft } from 'Reconnect/src/services/drafts'
import PostsManager from 'Reconnect/src/services/posts'
import SpacesManager from 'Reconnect/src/services/spaces'
import DraftsManager from 'Reconnect/src/services/drafts'
import AuthManager from 'Reconnect/src/services/auth'
import Loading from 'Reconnect/src/lib/Loading'
import Theme from 'Reconnect/src/theme/Theme'
import { shareInstallApp, showInfoMessage } from 'Reconnect/src/lib/utils'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'

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
            textTransform: 'uppercase' 
        },
    postsContainer: {
        marginTop: '5 rem',
        flex: 1
    },
    draftContainer: {
        alignItems: 'center', 
        justifyContent: 'center',                 
        backgroundColor: '#ffffff', 
        paddingTop: '4 rem', 
        paddingBottom: '7 rem',
        flexDirection: 'row',  

        borderColor: '#b2b2b2', 
        marginTop: '14 rem',
        borderWidth: 0,
        marginHorizontal: '14 rem'   
    },
        draftIcon: {
            fontSize: '25 rem',
            color: '#999',  
        },
        newDraftText: {
            marginLeft: '10 rem', 
            fontSize: '16 rem', 
            letterSpacing: '1 rem',
            color: '#333',
            fontWeight: 'normal',
        },
        newDraftFromText: {
            fontSize: '11 rem', 
            color: '#333', 
            fontWeight: 'normal',
            
            alignSelf: 'center'
        },
        deleteDraftContainer: { 
            position: 'absolute',
            right: '12 rem',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '40 rem'
        }
})

const PostList = ({ space } : { space: Space }) => {

    /* Hooks */
    const navigation = useNavigation()

    /* State */
    const [posts, setPosts] = useState<Array<Post>>([])
    const [draft, setDraft] = useState<?Draft>(null)
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
        setDraft(null)
        setInitializing(true)
        setWaitingForGuest(space.guestId == null)

        const spaceChangesUnsubscribe = PostsManager.subscribeToChanges({ spaceId: space.id, listener: updatedPosts => {
                setInitializing(false)
                setPosts(updatedPosts)                    

                if (listRef.current) {
                    listRef.current.scrollToOffset({ offset: 0, animated: true })
                }
            }
        })

        const isHost = AuthManager.currentUserId() == space.hostId
        const draftChangesUnsubscribe = DraftsManager.subscribeToDraftUpdates({ spaceId: space.id, isHost, listener: updatedDraft => {
                setDraft(updatedDraft)
            }
        })

        return () => {
            spaceChangesUnsubscribe()
            draftChangesUnsubscribe()
        }
    }

    function _onDraftDelete() {
        Alert.alert('Delete Draft', 'Are you sure you want to delete the draft?', [ {
                text: 'Delete',
                onPress: () => { 
                    if (draft) {
                        DraftsManager.deleteDraft(draft.id)
                    }
                }
            },
            {
                text: 'Cancel',
                style: 'cancel',                    
            }
        ], {
            cancelable: true
        })
    }

    function _onDraftSelected() {
        navigation.navigate(NavigationRoutes.NewPost, { space, draft })
    }
    
    /* Render */
    return initializing  ? <Loading /> : ( <>

        {/* WAITING FOR */}
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

        {/* DRAFT */}
        {
            draft ? 
                <TouchableOpacity onPress={_onDraftSelected} style={styles.draftContainer}>
                    
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <Zocial name='email' color={styles._draftIcon.color} size={styles._draftIcon.fontSize}/>                
                            <Text style={styles.newDraftText}>NEW DRAFT</Text>                
                        </View>
                        <View>                
                            <Text style={styles.newDraftFromText}>
                                {`From ${draft.created.format('MMMM D')} @ ${draft.created.format('h:mm a')}`}
                            </Text>
                        </View>
                    </View>
                    
                    <TouchableOpacity style={styles.deleteDraftContainer} onPress={_onDraftDelete}>
                        <MaterialIcons name='remove-circle' size={styles._draftIcon.fontSize * 1.25} color={'#d98977'} />
                    </TouchableOpacity>

                </TouchableOpacity>
            :
                <></>
        }
        
        {/* POSTS */}
        {
            posts.length > 0 ?  
                <View style={styles.postsContainer}>
                    <FlatList
                        data={posts}
                        renderItem={ ({item}) => <PostView post={item} space={space}/> }
                        keyExtractor={ item => item.id }
                        ref={ ref => listRef.current = ref }
                    />
                </View>
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