import React, {useEffect} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import useOnboarding from './index.hooks';
import OnboardingSwiper from './OnboardingSwiper';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import AuthManager from '../../services/auth';

const Onboarding = ({navigation}) => {
  useEffect(AuthManager.signIn, [])
  const hook = useOnboarding(() => {
    navigation.navigate('Timeline');
    AuthManager.getUser();
  });

  return (
    <View style={styles.view}>
      <ImageBackground
        style={styles.background}
        source={require('./img/plant-side.jpg')}>
        <View style={styles.overlay} />
        <View style={styles.info}>
          <OnboardingSwiper tab={hook.tab} swiped={hook.swiped} />
        </View>

        <TouchableOpacity onPress={hook.onPress} style={styles.buttonWrapper}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>{hook.buttonText}</Text>
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    top: 0,
    left: 0,
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    width: '100%',
  },
  button: {
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: '#5aac88',
    color: '#fff',
    width: '90%',
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Avenir',
    fontWeight: 'bold',
  },
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
  },
});

export default Onboarding;
