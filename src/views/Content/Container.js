/**
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Iosicons from 'react-native-vector-icons/Ionicons'

import LoadingView from 'Reconnect/src/lib/Loading'
import Theme from 'Reconnect/src/theme/Theme'
import type { Post } from 'Reconnect/src/services/posts'
import type { Space } from 'Reconnect/src/services/spaces'
import SpacesManager from 'Reconnect/src/services/spaces'

import SpaceListContainer from './Spaces/List'
import PostView from './Posts/View'
import PostList from './Posts/List'
import NewPost from './Posts/New'
import { NavigationRoutes } from './index'


const Container = () => {

    /* State */
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
                        <PostList space={space} />                        
                    </View>

                    <View style={{ flex: 0 }}>
                        <BottomBar space={space} />
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