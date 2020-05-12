/**
 * @flow
 */

import perf from '@react-native-firebase/perf'

import AuthManager from 'Reconnect/src/services/auth'


const PerformanceManager = {}

PerformanceManager.init = async () => {
    const performanceEnabled = !__DEV__
    await perf().setPerformanceCollectionEnabled(performanceEnabled)    
}

PerformanceManager.startTrace = async (name: string) => {
    const trace = await perf().startTrace(name)

    const userId = AuthManager.currentUserId()    
    if (userId) {
        trace.putAttribute('userId', userId)
    }

    return trace
}

export default PerformanceManager