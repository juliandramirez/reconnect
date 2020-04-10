/**
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { View, FlatList } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Iosicons from 'react-native-vector-icons/Ionicons'

import Theme from 'Reconnect/src/theme/Theme'
import type { Post } from 'Reconnect/src/services/posts'
import type { Space } from 'Reconnect/src/services/spaces'
import SpacesManager from 'Reconnect/src/services/spaces'

import SpaceListContainer from './Spaces/List'
import PostView from './Posts/ViewPost'
import NewPost from './Posts/NewPost'
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
    }

    function _onSelectSpace(space: Space) {
        setSpace(space)
    }

    /* Render */

    return (
        <View style={{ flex: 1, backgroundColor: Theme.colors.appBackground }}>

            <View style={{ flex: 0 }}>
                <SpaceListContainer onSelectSpace={_onSelectSpace}/>
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
                <BottomBar space={space}/>
            </View>

        </View>
    )
}

/* MARK: - UI Components */

const BottomBar = ( { space } : { space: ?Space }) => {

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
            <View style={{flex:1, flexGrow:1, alignItems: 'flex-start'}}>
                <Button type='clear' style={{ marginLeft: 14 }} 
                    icon={
                        <Iosicons name='ios-arrow-up' size={30}/>
                    }
                    onPress={ () => {
                        if (space) {
                            navigation.navigate( NavigationRoutes.EditSpace, { space: space } )
                        }                        
                    }}/>                        
            </View>

            <View style={{ flex:1, flexGrow:1 }}>
                <Button 
                    type='clear' 
                    icon={
                        <SimpleLineIcons name='pencil' size={32}/>
                    } 
                    onPress={ () => {
                        if (space) {
                            navigation.navigate( NavigationRoutes.NewPost )
                        }
                    }}/>
            </View>

            <View style={{flex:1, flexGrow:1, alignItems: 'flex-end'}}>                
            </View>
        </View>        
    )
}

export default Container