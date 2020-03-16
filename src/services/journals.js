import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import AuthManager from './auth'


const JournalsManager = {};

/** contentType : 'text' | 'image' | 'video' **/
/** content : text | asset_url **/
/** returns : {
 * cancelMediaUpload : () => (),
 * uploadCompleted : () => 
 * 
 * } **/

 // import JournalsManager from '../../services/journals'
// import AuthManager from '../../services/auth'
            // AuthManager.signIn('Julian', '+132434')

// const handle = JournalsManager.addPost();
// handle.then( (url) => {
//     console.log(url)
// }).catch( (error) => {
//     console.log(error)
// });

// handle.cancelHook();

JournalsManager.addPost = (contentType, content, tag, date, journalIdList, percentageUpdateListener) => {

    const fileRef = storage().ref('sample.png');

    const uploadTask = fileRef.putString('PEZvbyBCYXI+', storage.StringFormat.BASE64, {
        cacheControl: 'no-store', // disable caching
    });

    let lastPercentage = 0;
    uploadTask.on('state_changed', (snapshot) => {
        const percentage = Math.trunc((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

        if (percentageUpdateListener && lastPercentage != percentage) {
            percentageUpdateListener(percentage);
            lastPercentage = percentage;
        }                
    });

    const uploadPromise = new Promise( (resolve, reject) => {

        uploadTask.then(() => {            
            fileRef.getDownloadURL().then( (url) => {
                console.log(url);

                // TODO: add post to firebase tree and resolve the promise with the post ID...post object perhaps ??
                resolve(url);
            })
        })
        .catch((error) => {
            reject(error.message);
        });

    });

    uploadPromise.cancelHook = () => { uploadTask.cancel() }

    return uploadPromise;
}

/** requires user to be signed in **/
JournalsManager.createJournal = async (requesteePhoneNumber) => {
    const user = await AuthManager.getUser();

    const ref = firestore().collection('journals').add({
        requester: user.phone,
        requestee: requesteePhoneNumber,
        posts: []
    });
}

JournalsManager.getJournals = async () => {
    const user = await AuthManager.getUser();

    firestore().collection('journals')
        .where('requester', '==', user.phone)
}

JournalsManager.getJournalPage = async (date, requestee) => {
    const user = await AuthManager.getUser();

    const journalRef = firestore().collection('journals');    
        // .where('requester', '==', user.phone)
        // .where('requestee', '==', requestee)

    const queryResult = await journalRef.get()
    for (let doc of queryResult.docs)
    {
        const journalRef = doc.ref
        const journalId = doc.id
        const journalData = doc.data()

        const postsRef = journalRef.collection('posts')
        const postsQueryResult = await postsRef.get()

        for (let post of postsQueryResult.docs) {
            console.log("POST FOUND:" + JSON.stringify(post.data()))
        }

        postsRef.onSnapshot({
            error: (e) => console.error(e),
            next: (query) => {

                const posts = query.docs.map((document) => { return {
                        ...document.data(),
                        key: document.id
                    }
                });

                console.log(posts)
            },
          })
    }

    

    // get ref 'journals'
    // where requester == myPhone
    // orderBy == posts/timestamp
    // startAt post.Timestamp start of day
    // endAt post.Timestamp end of day

    return [
        {            
        }
    ]
}



export default JournalsManager;