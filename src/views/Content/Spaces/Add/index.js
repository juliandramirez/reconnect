/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, Text, BackHandler } from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
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
        paddingBottom: '20 rem',        
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
    const route = useRoute()
    const modalDismiss = useModalBackground(Theme.colors.addSpaceBackground)    

    /* Properties */
    const { dismissable } = route.params

    /* State */
    const [pageNumber, setPageNumber] = useState<number>(1)

    /* Variables */
    const spaceRef = useRef<?Space>(null)
    
    /* Back handler */
    useFocusEffect( _androidBackHandler, [pageNumber, dismissable])
    function _androidBackHandler() {
        const onBackPress = () => {            
            if (pageNumber == 2) {
                _back()
                return true
            } else {              
                // consider even handled (ignore hardware press) when it is not dismissable
                return !dismissable
            }
        }

        BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }

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
            modalDismiss()
            navigation.navigate( NavigationRoutes.Main, { selectedSpace: updatedSpace } )

            showSuccessMessage('Welcome to your shared space')
        } else {
            navigation.navigate( NavigationRoutes.SpaceAdded, { space: updatedSpace, isNewSpace, notificationPermissions } )
        }        
    }

    function _cancel() {
        modalDismiss()
        navigation.goBack()
    }

    function _back() {
        setPageNumber(1)
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
                    <Page1 
                        submit={_submitPage1} 
                        cancel={_cancel} dismissable={dismissable} 
                    /> 
                : 
                    <Page2 
                        submitLabel='CREATE' submit={_submitPage2} 
                        cancelLabel='BACK' cancelOrBack={ dismissable ? _cancel : _back }
                    /> 
            }
            </View>
        </View>
    )
}

export default AddSpace