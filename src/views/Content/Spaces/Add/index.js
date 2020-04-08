/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import EStyleSheet from 'react-native-extended-stylesheet'

import NotificationsManager from 'Reconnect/src/services/notifications'
import { showSuccessMessage } from 'Reconnect/src/lib/utils'
import { useModalBackground } from 'Reconnect/src/lib/utils'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'
import SpacesManager from 'Reconnect/src/services/spaces'
import type { Space, SpaceConfiguration } from 'Reconnect/src/services/spaces'
import Theme from 'Reconnect/src/theme/Theme'

import Page1 from './Page1'
import Page2 from './Page2'


const styles = EStyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '20 rem',
        paddingBottom: '8 rem',        
        justifyContent: 'flex-end',
        backgroundColor: Theme.colors.addSpaceBackground,
    },
        titleContainer: {
            flex: 1, 
            justifyContent: 'flex-end'
        },
        page: {
            flex: 0,
            height: '466 rem',            
        },
})

const AddSpace = () => { 

    /* Hooks */
    const navigation = useNavigation()
    const modalDismiss = useModalBackground(Theme.colors.addSpaceBackground)

    /* State */
    const [pageNumber, setPageNumber] = useState<number>(1)

    /* Variables */
    const spaceRef = useRef<?Space>(null)
    
    /* Functions */
    function _submitPage1(space: ?Space) {
        spaceRef.current = space
        setPageNumber(2)
    }
    
    async function _submitPage2(configuration: SpaceConfiguration) {

        let updatedSpace, isNewSpace
        if (spaceRef.current != null) {            
            updatedSpace = await SpacesManager.attachToSpace( spaceRef.current, configuration)
            isNewSpace = false
        } else {
            updatedSpace = await SpacesManager.createSpace(configuration)
            isNewSpace = true
        }
        
        /* if you don't need to send an invite code(the space already existed) 
        and your notifications are already enabled, no need to show the success screen, 
        just a success notification is enough... */
        const notificationPermissions = await NotificationsManager.getPermissions()
        if (!isNewSpace && notificationPermissions === 'enabled') {
            showSuccessMessage('Welcome to your shared space')

            modalDismiss()
            navigation.navigate( NavigationRoutes.Main, { spaceId: updatedSpace.id } )
        } else {
            navigation.navigate( NavigationRoutes.SpaceAdded, { space: updatedSpace, isNewSpace, notificationPermissions } )
        }        
    }

    function _cancel() {
        modalDismiss()
        navigation.goBack()
    }

    /* Render */
    return (
        <View style={ styles.container }>

            <View style={ styles.titleContainer }>
                <Text style={ Theme.palette.title }>
                    {pageNumber === 1 ? 'Add A New Space' : 'Personal Touches'}
                </Text>
            </View>     

            <View style={{ ...styles.page }}>
            { 
                pageNumber === 1 ? 
                    <Page1 submit={_submitPage1} cancel={_cancel}/> 
                : 
                    <Page2 submit={_submitPage2} cancel={_cancel}/> 
            }
            </View>
        </View>
    )
}

export default AddSpace