/**
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { View, FlatList } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

import Theme from 'Reconnect/src/theme/Theme'
import type { Post } from 'Reconnect/src/services/posts'

import SpaceList from './Spaces/List'
import PostView from './Posts/ViewPost'
import NewPost from './Posts/NewPost'
import { NavigationRoutes } from './index'


const Container = () => {

    /* State */
    const [posts, setPosts] = useState<?Array<Post>>(null)

    /* Effects */
    useEffect( _init, [] )

    /* Hooks */
    const navigation = useNavigation()

    /* Functions */
    
    function _init() {
        const text = 'This week I had to do the same thing we did when we were working together.\n\nI felt really good about it and it reminded me of how much you helped me back then!'
        const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/breakfast.jpg?alt=media&token=31a56a22-cd51-4614-ae75-8ecb81bfa9b4'
        const videoUrl = 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/DAVE%20Concert.MP4?alt=media&token=e1a7470b-13e9-485b-a1a8-a8e02f477012'
        const POSTS = [
            {id: '2', text: text + text, content: [], attachments: [{id: '1', type: 'video', url: videoUrl }, {id: '2', type: 'video', url: videoUrl}, {id: '3', type: 'image', url: imageUrl}, {id: '4', type: 'image', url: imageUrl}]},
            {id: '1', text: 'This week I had to do the same thing we did when we were working together', content: [], attachments: []},            
        ]

        setPosts(POSTS)
    }

    function _onPersonSelect(person: any) {

    }

    /* Render */

    return (
        <View style={{ flex: 1, backgroundColor: Theme.colors.appBackground }}>

            <View style={{ flex: 0 }}>
                <SpaceList onPersonSelect={_onPersonSelect}/>
            </View>

            <View style={{ flex: 1 }}>
                <FlatList
                    data={posts}
                    renderItem={ ({item}) => 
                        <PostView post={item} headerColor={Theme.colors.spaceColors[5]}/> 
                    }
                    keyExtractor={ item => item.id }
                />
            </View>

            <View style={{ flex: 0 }}>
                <BottomBar />
            </View>

        </View>
    )
}

/* MARK: - UI Components */

const BottomBar = () => {

    /* Hooks */
    const navigation = useNavigation()
  
    /* Render */
    return (
        <View style={{ 
            flexDirection: 'row', 
            height: 50, 
            justifyContent: 'space-evenly', 
            alignItems: 'center'
        }}>
            <View style={{ flex:1, flexGrow:1 }}>
                <Button 
                    type='clear' 
                    icon={
                        <SimpleLineIcons name='pencil' size={32}/>
                    } 
                    onPress={ () => navigation.navigate( NavigationRoutes.NewPost )}/>
            </View>
        </View>        
    )
}

export default Container