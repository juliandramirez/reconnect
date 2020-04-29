/**
 * @flow
 */

import React from 'react'
import { View, ActivityIndicator, Text } from 'react-native'


const LoadingView = ({ text } : { text? : string }) => (
    <View style={{ flex:1, justifyContent: 'center' }}>
        <ActivityIndicator size='large' color='darkgrey' />
        { text ? <Text style={{color: 'darkgrey', textAlign: 'center'}}>{text}</Text> : <></>}
    </View>
)

export default LoadingView