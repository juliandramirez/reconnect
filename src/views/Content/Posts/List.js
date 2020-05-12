/**
 * @flow
 */

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Image, Text, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native'
import { Button } from 'react-native-elements'
import EStyleSheet from 'react-native-extended-stylesheet'
import Zocial from 'react-native-vector-icons/Zocial'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native'

import type { Space } from 'Reconnect/src/services/spaces'
import type { Post } from 'Reconnect/src/services/posts'
import type { Draft } from 'Reconnect/src/services/drafts'
import PostsManager from 'Reconnect/src/services/posts'
import SpacesManager from 'Reconnect/src/services/spaces'
import DraftsManager from 'Reconnect/src/services/drafts'
import AuthManager from 'Reconnect/src/services/auth'
import Loading from 'Reconnect/src/lib/Loading'
import PerformanceManager from 'Reconnect/src/lib/performance'
import Theme from 'Reconnect/src/theme/Theme'
import { shareInstallApp, showInfoMessage, getHighlightColor } from 'Reconnect/src/lib/utils'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'
import PostEnvelopeView from 'Reconnect/src/views/Content/Posts/View/Envelope'


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
            color: '#444', 
            textAlign: 'center', 
            textTransform: 'uppercase' 
        },
    scrollGuideContainer: {
        flexDirection: 'row',
        height: '35 rem',
        borderBottomWidth: '0 rem',
        borderColor: '#444'
    },
        scrollGuideMessage: {
            fontSize: '14 rem', 
            textAlign: 'center',
            textTransform: 'uppercase',
            color: '#444', 
            fontWeight: 'bold'
        },
        scrollGuideBackToTop: { 
            alignItems: 'center', 
            width: '50 rem',
            flex: 1,
            justifyContent: 'center' 
        },
    postsContainer: {        
        flex: 1, 
        backgroundColor: Theme.colors.postsContainer       
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
    const [scrollGuide, setScrollGuide] = useState<?string>(null)

    /* Variables */
    const listRef = useRef()

    /* Logic needed to detect end of list scrolling */
    const TRACE_ID = 'list-posts'
    const traceRef = useRef<any>(null)
    const postsRef = useRef<Array<Post>>([])
    const [lastItemIsViewable, setLastItemIsViewable] = useState<boolean>(false)    
    const onViewableItemsChangedRef = useRef(({ viewableItems, changed }) => {
        const viewableItemIndexes = viewableItems.map(item => item.index)

        // show scroll guide when the user has pased the first page...
        const firstItemVisible = viewableItemIndexes.includes(0)
        if (!firstItemVisible && viewableItemIndexes.length > 0) {  
            // $FlowExpectedError: not null  
            const postV = postsRef.current[viewableItemIndexes[viewableItemIndexes.length - 1]]
            setScrollGuide(postV.created.format('MMMM YYYY'))
        } else {
            setScrollGuide(null)
        }

        const lastItemVisible = viewableItemIndexes.includes(postsRef.current.length - 1)
        setLastItemIsViewable(lastItemVisible)

    // trace...
        if (traceRef.current) {
            traceRef.current.stop()
            traceRef.current = null
        }
    })
    
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
        postsRef.current = []
        traceRef.current = null
        setDraft(null)
        setInitializing(true)
        setScrollGuide(null)
        setWaitingForGuest(space.guestId == null)

    // start trace...
        PerformanceManager.startTrace(TRACE_ID).then(trace => traceRef.current = trace)
        const spaceChangesUnsubscribe = PostsManager.subscribeToChanges({ spaceId: space.id, listener: updatedPosts => {

                if (traceRef.current) {
                    const numberOfPosts = updatedPosts.length
                    traceRef.current.putMetric('numberOfPosts', numberOfPosts)

                    if (numberOfPosts == 0) {
                        traceRef.current.stop()
                    }
                }

                setInitializing(false)
                setPosts(updatedPosts) 
                postsRef.current = updatedPosts
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
                        <Text style={styles.waitingAction}>[ SEND INVITATION ]</Text>
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
            <>
                {
                    !waitingForGuest && scrollGuide ? 
                        <View style={{                         
                                ...styles.scrollGuideContainer,                                
                                //$FlowExpectedError: not null
                                backgroundColor: space.configuration.color 
                            }}>
                                <View style={{ flex: 1}} />
                                <View style={{ flex: 1, justifyContent: 'center' }}>
                                    <Text style={ styles.scrollGuideMessage }>
                                        {scrollGuide}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end'}}>
                                    <TouchableOpacity style={ styles.scrollGuideBackToTop }
                                        // $FlowExpectedError: not null
                                        onPress={() => listRef.current.scrollToIndex({ index: 0, animated: true })}>

                                        <FontAwesome name='angle-double-up'
                                            size={styles._scrollGuideMessage.fontSize * 2} color={'#444'}                             
                                        />
                                    </TouchableOpacity>
                                </View>
                        </View>
                    : 
                        <></>
                }
                <View style={styles.postsContainer}>
                    <FlatList
                        data={posts}
                        renderItem={ ({ item }) => <PostListItem post={item} space={space}/> }
                        keyExtractor={ item => item.id }
                        ref={ ref => listRef.current = ref }

                    // half default values...
                        initialNumToRender={5}
                        maxToRenderPerBatch={5}
                        updateCellsBatchingPeriod={50}
                        windowSize={11}

                        onViewableItemsChanged={onViewableItemsChangedRef.current}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={ lastItemIsViewable ? <></> : <ActivityIndicator size='small' color='darkgrey' /> }
                    />
                </View>
            </>
            :
                <View style={styles.emptyMessageContainer}>
                    <Text style={styles.emptyMessage}>
                        Nothing here{'\n'}You should write the first letter
                    </Text>
                </View>
        } 
    </>)
}

const PostListItem = React.memo(PostEnvelopeView, (prevProps, nextProps) => {
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

export default PostList