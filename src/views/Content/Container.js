/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import LoadingView from 'Reconnect/src/lib/Loading'
import Theme from 'Reconnect/src/theme/Theme'
import type { Post } from 'Reconnect/src/services/posts'
import type { Space } from 'Reconnect/src/services/spaces'
import SpacesManager from 'Reconnect/src/services/spaces'

import SpaceListContainer from './Spaces/List'
import PostList from './Posts/List'
import { NavigationRoutes } from './index'
import BottomBar from './BottomBar'


const Container = () => {      

    /* Hooks */
    const navigation = useNavigation()

    /* State */
    const [space, setSpace] = useState<?Space>()

    /* Refs */
    const unsubscribeRef = useRef<?Function>()
    const spaceRef = useRef<?Space>()

    /* Effects */
    useEffect(_init, []) 

    /* Functions */    
    function _init() {
        SpacesManager.getNumberOfUserSpaces()
            .then( total => {
                if (total == 0) {
                    navigation.navigate( NavigationRoutes.AddSpace, { dismissable: false } )
                }
            })
    }

    function _spaceChanged(spaceId: string) {
        if (spaceId != space?.id) { 
        // unsubscribe
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
            }            

        // subscribe to space changes
            unsubscribeRef.current = SpacesManager.subscribeToSpaceChanges({ spaceId, 
                listener: updatedSpace => {

                // listen to this properties...
                    const spaceChanged = 
                        spaceRef.current?.hostId !== updatedSpace.hostId ||
                        spaceRef.current?.guestId !== updatedSpace.guestId ||
                        spaceRef.current?.configuration?.shortName !== updatedSpace.configuration?.shortName ||
                        spaceRef.current?.configuration?.color !== updatedSpace.configuration?.color ||
                        spaceRef.current?.configuration?.reminderValue !== updatedSpace.configuration?.reminderValue

                     if (spaceChanged) {
                        spaceRef.current = updatedSpace
                        setSpace(updatedSpace)
                    }                    
                }
            })
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

export default Container