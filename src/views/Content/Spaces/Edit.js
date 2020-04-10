/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, Text } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import EStyleSheet from 'react-native-extended-stylesheet'

import NotificationsManager from 'Reconnect/src/services/notifications'
import { useModalBackground } from 'Reconnect/src/lib/utils'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'
import SpacesManager from 'Reconnect/src/services/spaces'
import type { Space, SpaceConfiguration } from 'Reconnect/src/services/spaces'
import Theme from 'Reconnect/src/theme/Theme'

import Page2 from './Add/Page2'


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

const EditSpace = () => { 

    /* Hooks */
    const navigation = useNavigation()
    const route = useRoute()
    const modalDismiss = useModalBackground(Theme.colors.addSpaceBackground)
    
    /* Properties */
    const { space } = route.params

    /* Functions */    
    async function _submit( configuration: SpaceConfiguration) {
        await SpacesManager.editSpaceConfiguration({ id: space.id, configuration: configuration })
        _cancel()
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
                    Edit space
                </Text>
            </View>     

            <View style={{ ...styles.page }}>
                <Page2 
                    submitLabel='SAVE'
                    initialConfiguration={space.configuration} 
                    submit={_submit} cancel={_cancel}                        
                /> 
            </View>
        </View>
    )
}

export default EditSpace