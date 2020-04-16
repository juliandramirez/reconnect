/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import Iosicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'

import AuthServices from 'Reconnect/src/services/auth'
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

/* MARK: - UI Components */

const BottomBar = ( { space } : { space: Space }) => {

    /* Hooks */
    const navigation = useNavigation()

    /* Properties */
    const highlightColor = 
        Theme.colors.highlightColors[
            Theme.colors.spaceColors.findIndex(val => 
                //$FlowExpectedError: space configuration is not null here
                val == space.configuration.color
            )
        ]

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
                        <Iosicons style={{ paddingHorizontal: 8 }} name='ios-arrow-up' size={30} 
                            color={highlightColor}                             
                            />
                    }
                    onPress={ () => navigation.navigate(NavigationRoutes.EditSpace, { space: space }) }/>
            </View>

            <View style={{ flex:1, flexGrow:1 }}>
                <Button 
                    type='clear' 
                    icon={
                        <SimpleLineIcons name='pencil' size={32} 
                            color={highlightColor}                                
                            />
                    } 
                    onPress={ () => navigation.navigate(NavigationRoutes.NewPost, { space: space }) }
                />
            </View>

            
            <View style={{flex:1, flexGrow:1, alignItems: 'flex-end'}}>
            { 
                __DEV__ ? 
                    <Button onPress={AuthServices.signOut} type='clear' style={{ marginRight: 12 }} icon={
                        <AntDesign color={highlightColor} name='logout' size={26}/>
                    }/> 
                :
                    <></>
            }                
            </View>
        </View>        
    )
}

export default Container