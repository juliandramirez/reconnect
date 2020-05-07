/**
 * @flow
 */

import analytics from '@react-native-firebase/analytics'
import { AppState } from 'react-native'

import AuthManager from 'Reconnect/src/services/auth'
import SpacesManager from 'Reconnect/src/services/spaces'
import PostsManager from 'Reconnect/src/services/posts'
import type { DataMap } from 'Reconnect/src/lib/utils'


const AnalyticsManager = {}

AnalyticsManager.init = async () => {
    const analyticsEnabled = !__DEV__
    await analytics().setAnalyticsCollectionEnabled(analyticsEnabled)  
    
    await _setUserProperties()

    const changeAppStateListener = state => {
        if (state === 'active') {
            analytics().logAppOpen()
        }
    }
    AppState.addEventListener('change', changeAppStateListener)
    // return clean up function
    return () => AppState.removeEventListener('change', changeAppStateListener)
}

AnalyticsManager.logLogin = async (method: string) => {
    await analytics().logLogin({ method })
    await _setUserProperties()
}

AnalyticsManager.logEvent = async ( name: string, params: DataMap ) => {
    if (params) { 
        await analytics().logEvent(name, params)
    } else {
        await analytics().logEvent(name)
    }    
}

AnalyticsManager.updateNumberOfPosts = async () => {
    const userId = AuthManager.currentUserId()
    if (userId) {
        const result = await PostsManager.getNumberOfUserPosts()
        await analytics().setUserProperty('number_of_posts', result.toString(10))
    }
}

AnalyticsManager.updateNumberOfSpaces = async () => {
    const userId = AuthManager.currentUserId()
    if (userId) {
        const result = await SpacesManager.getNumberOfUserSpaces()
        await analytics().setUserProperty('number_of_spaces', result.toString(10))
    }
}

async function _setUserProperties() {
    const userId = AuthManager.currentUserId()

    if (userId) {
        await analytics().setUserId(userId)

        SpacesManager.getNumberOfUserSpaces().then( number => 
            analytics().setUserProperty('number_of_spaces', number.toString(10))
        )
        PostsManager.getNumberOfUserPosts().then( number => 
            analytics().setUserProperty('number_of_posts', number.toString(10))
        )
    }    
}


export default AnalyticsManager