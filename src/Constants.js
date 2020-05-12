/**
 * @flow
 */

import remoteConfig from '@react-native-firebase/remote-config'


const ACTIVATION_TIMEOUT = 3000

/* Configuration */

export const RemoteConstants = {
    attachmentCacheControlHeader: 'attachmentCacheControlHeader'
}
const RemoteConstantsDefaults = {
    // TODO: play with this for bandwidth consumption: 'public, max-age=31536000'
    attachmentCacheControlHeader: 'no-store',
}

/* Constants */

const Constants = {
    appUrl: 'https://reconnectapp.co/links/install',
    draftMailDomain: 'drafts.reconnectapp.co',
    storageRefs: {
        users: __DEV__ ? 'dev-users' : 'users',
        spaces: __DEV__ ? 'dev-spaces' : 'spaces',
        posts: __DEV__ ? 'dev-posts' : 'posts',
        drafts: __DEV__ ? 'dev-drafts' : 'drafts',
        attachments: __DEV__ ? 'dev-attachments' : 'attachments',
    },
    errorCodes: {
        notFound: 'not-found',
        unauthenticated: 'unauthenticated',
        unauthorized: 'unauthorized'
    },    
  
    // overwrite with explicitly passed values
    ...process.env,
}

Constants.init = async () => {
    await remoteConfig().setConfigSettings({
        isDeveloperModeEnabled: __DEV__
    })    
    await remoteConfig().setDefaults(RemoteConstantsDefaults) 
    await Promise.race([
        remoteConfig().fetchAndActivate(), 
        new Promise(resolve => setTimeout(resolve, ACTIVATION_TIMEOUT))
    ])
}

Constants.getRemoteConstant = (key: string) => {
    const defaultValue = RemoteConstantsDefaults[key]
    return __DEV__ ? 
        defaultValue : 
        remoteConfig().getValue(key).value
}

export default Constants