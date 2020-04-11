/**
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { View, FlatList } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Iosicons from 'react-native-vector-icons/Ionicons'

import LoadingView from 'Reconnect/src/Loading'
import Theme from 'Reconnect/src/theme/Theme'
import type { Post } from 'Reconnect/src/services/posts'
import type { Space } from 'Reconnect/src/services/spaces'
import SpacesManager from 'Reconnect/src/services/spaces'

import SpaceListContainer from './Spaces/List'
import PostView from './Posts/ViewPost'
import NewPost from './Posts/New'
import { NavigationRoutes } from './index'


const Container = () => {

    /* State */
    const [posts, setPosts] = useState<Array<Post>>([])
    const [space, setSpace] = useState<?Space>()

    /* Effects */
    useEffect(_init, [])       

    /* Hooks */
    const navigation = useNavigation()

    /* Functions */    
    function _init() {
        SpacesManager.getNumberOfSpaces()
        .then( total => {
            if (total == 0) {
                navigation.navigate( NavigationRoutes.AddSpace, { dismissable: false } )
            }
        })

        const text = 'This week I had to do the same thing we did when we were working together.\n\nI felt really good about it and it reminded me of how much you helped me back then!'
        const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/dev-attachments%2F8Am6shu9EzXB66PLO9cx%2F768a4cde-43ef-4825-a7db-8f2f8144f887?alt=media&token=bd05194a-e990-48e1-9b00-f8d136ccc676'
        const videoUrl = 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/dev-attachments%2F8Am6shu9EzXB66PLO9cx%2F66ab9a75-ecb2-4c3b-9d97-9ae6890b8f68?alt=media&token=23c74a13-c82c-4bc1-85df-deef3256fcbd'
        const POSTS = [
            {id: '2', text: text + text, content: [], attachments: [{id: '1', type: 'video', url: videoUrl }, {id: '2', type: 'video', url: videoUrl}, {id: '3', type: 'image', url: imageUrl}, {id: '4', type: 'image', url: imageUrl}]},
            {id: '1', text: 'This week I had to do the same thing we did when we were working together', content: [], attachments: []},            
        ]

        setPosts(POSTS)        
    }

    function _spaceChanged(newSpace: Space) {
        if (newSpace && newSpace.id != space?.id) {            
            setSpace(newSpace)
        }        
    }

    /* Render */
    return (
        <View style={{ flex: 1, backgroundColor: Theme.colors.appBackground }}>

            <View style={{ flex: 0 }}>
                <SpaceListContainer onSelectSpace={_spaceChanged}/>
            </View>
            {
                !space ? <LoadingView /> : <>
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
                        <BottomBar space={space}/>
                    </View>
                </>
            }
        </View>
    )
}

/* MARK: - UI Components */

const BottomBar = ( { space } : { space: Space }) => {

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
            <View style={{flex:1, flexGrow:1, alignItems: 'flex-start' }}>
                <Button type='clear' 
                    icon={
                        <Iosicons style={{ paddingHorizontal: 8 }} name='ios-arrow-up' size={30}/>
                    }
                    onPress={ () => navigation.navigate(NavigationRoutes.EditSpace, { space: space }) }/>
            </View>

            <View style={{ flex:1, flexGrow:1 }}>
                <Button 
                    type='clear' 
                    icon={
                        <SimpleLineIcons name='pencil' size={32}/>
                    } 
                    onPress={ () => navigation.navigate(NavigationRoutes.NewPost, { space: space }) }
                />
            </View>

            <View style={{flex:1, flexGrow:1, alignItems: 'flex-end'}}>                
            </View>
        </View>        
    )
}

export default Container