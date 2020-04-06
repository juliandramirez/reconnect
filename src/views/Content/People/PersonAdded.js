/**
 * @flow
 */

import React from 'react'
import { View, Share } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'

import { useModalBackground } from 'Reconnect/src/lib/utils'


const PersonAdded = () => {
    const COLOR = 'snow'

    /* Hooks */
    const navigation = useNavigation()
    const modalDismiss = useModalBackground(COLOR)

    /* Functions */
    function _cancel() {
        modalDismiss()
        navigation.goBack()
    }

    /* Render */
    return (
        <View style={{ flex: 1}}>
            <Button title='SHARE' onPress={() => { 
                Share.share({ message: '1. Download app here: http://google.com\n2. Use invitation code AWNSD' })
            }}/>
        </View>
    )
}

export default PersonAdded