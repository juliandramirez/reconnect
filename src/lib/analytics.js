/**
 * @flow
 */

import analytics from '@react-native-firebase/analytics'

const AnalyticsManager = {}

AnalyticsManager.init = async () => {
    const analyticsEnabled = !__DEV__
    await analytics().setAnalyticsCollectionEnabled(analyticsEnabled)    
}

AnalyticsManager.logLogin = async (method: string) => {
    await analytics().logLogin({ method})
}


export default AnalyticsManager