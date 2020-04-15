/**
 * @flow
 */

import React, { useEffect, useState, useRef } from 'react'
import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { Avatar } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'

import { showInfoMessage } from 'Reconnect/src/lib/utils'
import NotificationsManager from 'Reconnect/src/services/notifications'
import SpacesManager, { PushNotificationActions } from 'Reconnect/src/services/spaces'
import type { Space } from 'Reconnect/src/services/spaces'
import Theme from 'Reconnect/src/theme/Theme'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'


const SpaceListContainer = ( { onSelectSpace } : { onSelectSpace: (Space) => any }) => {

    /* State */
    const [selectedSpace, setSelectedSpace] = useState<?Space>(null)

    useEffect(_selectedSpaceUpdated, [selectedSpace])
    function _selectedSpaceUpdated() {
        if(selectedSpace) {
            onSelectSpace(selectedSpace)
        }
    }

    /* Navigation Param Update */
    const navigation = useNavigation()

    useEffect(_initNavigationListener, [])
    function _initNavigationListener() {
        return navigation.addListener('state', event => {
            //$FlowExpectedError: unsupported feature
            const routes = event?.data?.state?.routes?.filter(r => r.name == NavigationRoutes.Main)
            if (routes && routes.length == 1) {
                const space = routes[0]?.params?.selectedSpace
                if (space) {
                    setSelectedSpace(space)
                }
            }
        })
    }


    /* Remote Notification Handling */
    useEffect(_setUpRemoteNotificationListener, [])
    function _setUpRemoteNotificationListener() {
        return NotificationsManager.subscribeToRemoteNotifications( (data, receivedOnBackground) => {
            if (data && data.space) {                
                if (receivedOnBackground) {                    
                    const space = JSON.parse(data.space)
                    setSelectedSpace(space)
                }
                else {                    
                    if (data.action == PushNotificationActions.postSent) {                        
                        showInfoMessage(`You just received a new post!`)
                    } else if (data.action == PushNotificationActions.spaceJoined) {
                        showInfoMessage('Your invitation has been accepted!')
                    }
                }                       
            }
        })
    }        

    /* Render */
    return <SpaceList selectedId={selectedSpace?.id} onSelectSpace={setSelectedSpace} />
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        alignItems: 'center',
        borderColor: Theme.colors.contentSeparator,
        borderBottomWidth: 1,
        paddingHorizontal: 10
    },
    spaceContainer: {                    
        height: 80, 
        maxHeight: 80
    },
        spaceContentContainer: {
            alignItems: 'center',
            borderBottomColor: '#dedede',
            borderBottomWidth: 1, 
            flexGrow: 1
        }
})

const SpaceList = ({ selectedId, onSelectSpace } 
        : { selectedId: ?string, onSelectSpace: (Space) => any }) => {

    /* Hooks */
    const navigation = useNavigation()

    /* References */
    //$FlowExpectedError: always initialized
    const listRef = useRef<FlatList<?Space>>()
    const selectedIdRef = useRef<?string>(selectedId)

    /* State */
    const [spaces, setSpaces] = useState<Array<Space>>([])
    
    /* Effects */
    useEffect(_init, [])   
    useEffect(_scrollToSelectedId, [spaces, selectedId]) 
    useEffect(_updateCurrentIdRef, [selectedId])

    /* Functions */
    function _init() {        
        return SpacesManager.subscribeToUserSpacesChanges(spaces => {
            setSpaces(spaces)   
            
            // initial selection...
            if (!selectedIdRef.current && spaces.length > 0) {
                // ...inform about selection
                onSelectSpace(spaces[0])
            }
        })
    }

    function _updateCurrentIdRef() {
        selectedIdRef.current = selectedId
    }

    function _scrollToSelectedId() {         
        if (selectedId) {
            // scroll to index...
            const index = spaces.findIndex(item => item?.id == selectedId)
            if (index != -1) {
                listRef.current.scrollToIndex({ index, animated: true })
            }              
        }      
    }

    function _spacePressed(space: ?Space) {
        if (space) {
            onSelectSpace(space)
        } else {            
            navigation.navigate( NavigationRoutes.AddSpace, { dismissable: true } )
        }
    }

    /* Render */
    return (
        <View style={styles.container}>        
            <FlatList horizontal
                data={[ null, ...spaces ]}
                renderItem={ ({ item, index }) => 
                    <TouchableOpacity onPress={ () => _spacePressed( item ) }>
                        <SpaceView 
                            space={ item } 
                            isSelected={ index == 0 ? false : selectedId === item?.id }
                        /> 
                    </TouchableOpacity>
                }
                keyExtractor={ item => item == null ? 'ADD' : item.id }
                ItemSeparatorComponent={() => <View style={{width: 10}} />}
                contentContainerStyle={styles.spaceContentContainer}
                style={styles.spaceContainer}
                getItemLayout={(data, index) => (
                    {length: 60, offset: 60 * index, index}
                )}

                ref={ref => listRef.current = ref}
            />
        </View>
    )
}

export const SpaceView = ({ space, isSelected, previewMode = false } 
        : { space: ?Space, isSelected: boolean, previewMode?: boolean }) => {

    /* Properties */
    const props = space == null ? {
        title: '+',
        borderWidth: 0.5,
        backgroundColor: 'white'
    } : {
        title: space.configuration?.shortName ?? '',
        borderWidth: previewMode ? 0.5 : isSelected ? 1 : 0,
        backgroundColor: space.configuration?.color ?? 'white'
    }

    /* Render */
    return (        
        <Avatar rounded
            size={50}
            title={props.title} 
            titleStyle={{
                fontSize: 14,
                color: '#444444',
                fontWeight: 'bold'
            }}
            containerStyle={{
                borderWidth: props.borderWidth,
                borderColor: 'black',                                       
                backgroundColor: 'white'
            }}                
            overlayContainerStyle={{
                backgroundColor: props.backgroundColor
            }}                
        />
    )
}

export default SpaceListContainer