/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'

import type { Space } from 'Reconnect/src/services/spaces'
import type { Post } from 'Reconnect/src/services/posts'
import { FlatList } from 'react-native-gesture-handler'
import PostsManager from 'Reconnect/src/services/posts'
import SpacesManager from 'Reconnect/src/services/spaces'

import PostView from './View'


const PostList = ({ space } : { space: Space}) => {

    /* State */
    const [posts, setPosts] = useState<Array<Post>>([])
    const [waitingForGuest, setWaitingForGuest] = useState<boolean>(space.guestId == null)

    /* Variables */
    //$FlowExpectedError: always initialized before use    
    const listRef = useRef<FlatList>()

    /* Effects */
    useEffect(_init, [space])
    useEffect(_initListenToSpace, [space])

    /* Functions */
    function _init() {
        
        return PostsManager.subscribeToChanges({ space, listener: posts => {
                setPosts(posts)
                listRef.current.scrollToOffset({ offset: 0, animated: true })
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
    return (
        <FlatList
            data={posts}
            renderItem={ ({item}) => <PostView post={item} space={space}/> }
            keyExtractor={ item => item.id }
            ref={ ref => listRef.current = ref }
        />
    )
}

export default PostList