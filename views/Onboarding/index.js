import React from 'react';
import {ScrollView, View, Text, Button, StyleSheet} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import AuthManager from '../../services/auth'
const Onboarding = ({navigation}) => {
  return (
    <View style={styles.view}>
      <View style={styles.info}>
        <Text style={styles.heading}>Re:Connect</Text>
        <Text style={styles.tagline}>
          no accounts, no registrations, no social networks…
        </Text>
        <Text style={styles.tagline}>
          just a journal for you and your loved ones
        </Text>
      </View>

      <Button
        style={styles.login}
        title="Login"
        onPress={() => {navigation.navigate('Timeline'); AuthManager.getUser()}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    backgroundColor: Colors.lighter,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tagline: {
    fontSize: 12,
    textAlign: 'center',
  },
  login: {
    marginBottom: 20,
  },
});

export default Onboarding;
