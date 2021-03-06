/**
 * @flow
 */

import 'react-native-gesture-handler'
import React from 'react'
import { AppRegistry } from 'react-native'

import App from './src/App'
import { name as appName } from './app.json'


function HeadlessCheck({ isHeadless }) {
    if (isHeadless) {
      // App has been launched in the background by iOS push notification remote service, ignore
        return null
    } else {
        return <App />
    }
}


AppRegistry.registerComponent( appName, () => HeadlessCheck )
