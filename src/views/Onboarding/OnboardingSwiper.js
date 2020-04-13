import React, {useEffect, useRef} from 'react';
import Swiper from 'react-native-swiper';
import {View, Text, StyleSheet, TextInput} from 'react-native';
import useOnboardingSwiper from './OnboardingSwiper.hooks';
import {TouchableOpacity} from 'react-native-gesture-handler';

const OnboardingSwiper = ({tab, swiped}) => {
  const swiper = useRef(null);
  const hook = useOnboardingSwiper();
  useEffect(() => {
    if (swiper.current) {
      hook.setScrolling(true);
      swiper.current.scrollBy(tab, true);
    }
  }, [tab]);

  return (
    <Swiper
      ref={swiper}
      index={0}
      onIndexChanged={i => {
        if (hook.scrolling) {
          hook.setScrolling(false);
        } else {
          swiped(i);
        }
      }}
      loop={false}>
      <View style={styles.slide}>
        <Text style={styles.heading}>Re: Connect</Text>
        <Text style={styles.tagline}>
          no accounts, no registrations, no social networks…
        </Text>
        <Text style={styles.tagline}>
          just a journal for you and your loved ones
        </Text>
      </View>
      <View style={styles.slide}>
        <Text style={styles.subheading}>What's your name?</Text>
        <TextInput
          style={styles.input}
          onChangeText={hook.setName}
          value={hook.name}
          placeholder="Please enter your name"
        />
      </View>
      <View style={styles.slide}>
        <Text style={styles.subheading}>What's your mobile number?</Text>
        <Text style={styles.tagline}>
          This will help us find people who have already created journals with
          you
        </Text>
        <TextInput
          style={styles.input}
          onChangeText={hook.validatePhoneNumber}
          value={hook.phoneNumber}
          placeholder="Please enter your mobile number"
        />
      </View>
      <View style={styles.slide}>
        <Text style={styles.subheading}>
          Select one person you want to start re:connecting with
        </Text>
        <Text style={styles.tagline}>
          You can add more people later but it's important for you to do this
          with one person at a time... we want deep connections and for you to
          feel comfortable sharing your life with them
        </Text>
        <TouchableOpacity>
          <View style={styles.add}>
            <Text>Add from contacts</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    top: 0,
    left: 0,
    width: '100%',
  },
  heading: {
    fontFamily: 'Didot',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
  },
  subheading: {
    fontFamily: 'Didot',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 5,
  },
  tagline: {
    fontFamily: 'Avenir',
    fontSize: 12,
    textAlign: 'left',
    color: '#6B6B6B',
  },
  slide: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#dedede',
    borderRadius: 5,
    marginTop: 20,
    paddingHorizontal: 15,
    fontFamily: 'Avenir',
  },
  text: {},
  add: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderColor: '#6B6B6B',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 25,
  },
});

export default OnboardingSwiper;
