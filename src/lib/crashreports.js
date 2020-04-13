/**
 * @flow
 */

import crashlytics from '@react-native-firebase/crashlytics'

const CrashReportManager = {}

CrashReportManager.init = () => {
    CrashReportManager.setAttribute('DEV_ENV', __DEV__.toString() )
}

CrashReportManager.setUserId = async (userId: ?string) => {
    if (userId) {                    
        crashlytics().setUserId(userId)
    }                
}

CrashReportManager.setAttribute = async (name: string, value: string) => {
    crashlytics().setAttribute(name, value)
}

CrashReportManager.log = (message : string) => {
    console.log(message)
    crashlytics().log(message)
}

CrashReportManager.recordError = (error: Error) => {
    crashlytics().recordError(error)
}

export default CrashReportManager