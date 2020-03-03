import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';


const AuthManager = {};

AuthManager.getUser = async () => {
    const user = auth().currentUser;     

    if (user === null) {
        return null;
    }
    
    const ref = firestore().collection('users').doc(user.uid);
    const profile = await ref.get();


    console.log({
        id: user.uid,
        name: user.displayName,
        phone: profile.data().phone
    })

    return {
        id: user.uid,
        name: user.displayName,
        phone: profile.data().phone
    }
}


AuthManager.signOut = async () => {
    await auth().signOut();
}

AuthManager.signIn = async (name, phone) => {
    try {
        const account = await auth().signInAnonymously();
        const user = account.user;

        await user.updateProfile({displayName: name})

        const ref = firestore().collection('users').doc(user.uid);
        await ref.set({
            phone: phone
        })

        return {
            id: user.uid,
            phone: phone,
            name: name
        }
    } catch (e) {
        switch (e.code) {
            default:
                console.error(e);
                break;
        }
    }
}


export default AuthManager;