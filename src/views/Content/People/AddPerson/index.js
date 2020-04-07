/**
 * @flow
 */

import React, { useState, useRef } from 'react'
import { View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import EStyleSheet from 'react-native-extended-stylesheet'

import { useModalBackground } from 'Reconnect/src/lib/utils'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'
import ContentManager from 'Reconnect/src/services/content'
import type { Space, ReminderValue } from 'Reconnect/src/services/content'

import Page1 from './Page1'
import Page2 from './Page2'


const styles = EStyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: '20 rem',
        paddingBottom: '8 rem',        
        justifyContent: 'flex-end',
    },
        titleContainer: {
            flex: 1, 
            justifyContent: 'flex-end'
        },
            title: {
                fontSize: '28 rem',  
                textTransform: 'capitalize',
                color: '#555555',
            },
        page: {
            flex: 0,
            height: '466 rem',            
        },
})

const AddPerson = () => { 
    const COLOR = 'snow'

    /* Hooks */
    const navigation = useNavigation()
    const modalDismiss = useModalBackground(COLOR)

    /* State */
    const [pageNumber, setPageNumber] = useState<number>(1)

    /* Variables */
    const spaceRef = useRef<?Space>(null)
    
    /* Functions */
    function _submitPage1(space: ?Space) {
        spaceRef.current = space
        setPageNumber(2)
    }
    
    async function _submitPage2(shortName: ?string, color: string, reminderValue: ReminderValue) {

        if (spaceRef.current != null) {
            await ContentManager.attachToSpace( spaceRef.current, {
                shortName, color, reminderValue
            })
        } else {
            await ContentManager.createSpace({ shortName, color, reminderValue })
        }

        _cancel()
        navigation.navigate( NavigationRoutes.PersonAdded )
    }

    function _cancel() {
        modalDismiss()
        navigation.goBack()
    }

    /* Render */
    return (
        <View style={{ backgroundColor: COLOR, ...styles.container }}>

            <View style={{ ...styles.titleContainer }}>
                <Text style={styles.title}>
                    {pageNumber === 1 ? 'Add a new space' : 'Personal touches'}
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

export default AddPerson