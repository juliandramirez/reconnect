/**
 * @flow
 */

export default {
    appUrl: 'http://google.com',
    storageRefs: {
        users: __DEV__ ? 'dev-users' : 'users',
        spaces: __DEV__ ? 'dev-spaces' : 'spaces',
        posts: __DEV__ ? 'dev-posts' : 'posts',
        attachments: __DEV__ ? 'dev-attachments' : 'attachments',
    },
    errorCodes: {
        notFound: 'not-found',
        unauthenticated: 'unauthenticated',
        unauthorized: 'unauthorized'
    },
    // TODO: play with this for bandwidth consumption: 'public, max-age=31536000'
    attachmentCacheControlHeader: __DEV__ ? 'no-store' : 'no-store',
  
    // overwrite with explicitly passed values
    ...process.env
}