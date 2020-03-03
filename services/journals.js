import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';


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
    const userId = auth().currentUser.uid;

}



export default JournalsManager;