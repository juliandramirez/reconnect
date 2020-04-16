/**
 * @flow
 */

import 'react-native-gesture-handler'
import React from 'react'
import { AppRegistry } from 'react-native'
import codePush from 'react-native-code-push'

import App from './src/App'
import { name as appName } from './app.json'


// Code push config
const codePushOptions = { 
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
    installMode: codePush.InstallMode.ON_NEXT_RESTART,
    mandatoryInstallMode: codePush.InstallMode.IMMEDIATE
}

function HeadlessCheck({ isHeadless }) {
    if (isHeadless) {
      // App has been launched in the background by iOS push notification remote service, ignore
        return null
    } else {
        const CpApp = codePush(codePushOptions)(App)
        return <CpApp />
    }
}


AppRegistry.registerComponent( appName, () => HeadlessCheck )
