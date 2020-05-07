/**
 * @flow
 */

import crashlytics from '@react-native-firebase/crashlytics'

import AuthManager from 'Reconnect/src/services/auth'


const CrashReportManager = {}

CrashReportManager.init = async () => {
    await CrashReportManager.setAttribute('DEV_ENV', __DEV__.toString())
    await _setUserProperties()
}

CrashReportManager.logLogin = async () => {
    await _setUserProperties()
}

CrashReportManager.setAttribute = async (name: string, value: string) => {
    await crashlytics().setAttribute(name, value)
}

CrashReportManager.report = ({ message, cause } : { message: string, cause: Error }) => {
    console.log(message)

    crashlytics().log(message)    
    crashlytics().recordError(cause)
}

async function _setUserProperties() {
    const userId = AuthManager.currentUserId()
    
    if (userId) {
        await crashlytics().setUserId(userId)
    } 
}

export default CrashReportManager