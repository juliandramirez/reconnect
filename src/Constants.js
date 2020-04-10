/**
 * @flow
 */

export default {
    appUrl: 'http://google.com',
    storageRefs: {
        users: __DEV__ ? 'dev-users' : 'users',
        spaces: __DEV__ ? 'dev-spaces' : 'spaces',
        posts: __DEV__ ? 'dev-posts' : 'posts'
    },
    errorCodes: {
        notFound: 'not-found',
        unauthenticated: 'unauthenticated',
        unauthorized: 'unauthorized'
    },
  
    // overwrite with explicitly passed values
    ...process.env
}