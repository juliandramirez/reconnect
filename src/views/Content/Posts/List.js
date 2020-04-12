/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'

import type { Space } from 'Reconnect/src/services/spaces'
import type { Post } from 'Reconnect/src/services/posts'
import { FlatList } from 'react-native-gesture-handler'
import PostsManager from 'Reconnect/src/services/posts'
import SpacesManager from 'Reconnect/src/services/spaces'
import Loading from 'Reconnect/src/lib/Loading'

import PostView from './View'


const PostList = ({ space } : { space: Space}) => {

    /* State */
    const [posts, setPosts] = useState<Array<Post>>([])
    const [initializing, setInitializing] = useState<boolean>(true)
    const [waitingForGuest, setWaitingForGuest] = useState<boolean>(space.guestId == null)

    /* Variables */
    const listRef = useRef<FlatList>()

    /* Effects */
    useEffect(_spaceSet, [space])
    useEffect(_initListenToSpace, [space])

    /* Functions */
    function _spaceSet() {               
        setPosts([])
        setWaitingForGuest(space.guestId == null)
        setInitializing(true)

        return PostsManager.subscribeToChanges({ space, listener: posts => {
                setPosts(posts)                
                setInitializing(false)

                if (listRef.current) {
                    listRef.current.scrollToOffset({ offset: 0, animated: true })
                }
            }
        })
    }

    function _initListenToSpace() {
        return SpacesManager.subscribeToSpaceChanges({ spaceId: space.id, listener: space => {
            if (waitingForGuest && space.guestId != null) {
                setWaitingForGuest(false)
            }
        }})
    }

    /* Render */
    return initializing  ? <Loading /> : ( <>
        
        <FlatList
            data={posts}
            renderItem={ ({item}) => <PostView post={item} space={space}/> }
            keyExtractor={ item => item.id }
            ref={ ref => listRef.current = ref }
        />
        
    </>)
}

export default PostList