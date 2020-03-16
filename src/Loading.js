
import React from 'react'
import { View, ActivityIndicator } from 'react-native'


const LoadingView = () => (
    <View style={{flex:1, justifyContent: 'center'}}>
        <ActivityIndicator size='small' color='black'></ActivityIndicator>
    </View>
)

export default LoadingView