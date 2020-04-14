/**
 * @flow
 */

import crashlytics from '@react-native-firebase/crashlytics'

const CrashReportManager = {}

CrashReportManager.init = async () => {
    await CrashReportManager.setAttribute('DEV_ENV', __DEV__.toString() )
}

CrashReportManager.setUserId = async (userId: ?string) => {
    if (userId) {                    
        await crashlytics().setUserId(userId)
    }                
}

CrashReportManager.setAttribute = async (name: string, value: string) => {
    await crashlytics().setAttribute(name, value)
}

CrashReportManager.report = ({ message, cause } : { message: string, cause: Error }) => {
    console.log(message)

    crashlytics().log(message)    
    crashlytics().recordError(cause)
}

export default CrashReportManager