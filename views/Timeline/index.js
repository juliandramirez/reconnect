import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import ProfileSwiper from './ProfileSwiper';
import DateSwiper from './DateSwiper';
import moment from 'moment';

const Timeline = () => {
  return (
    <View style={styles.container}>
      <ProfileSwiper />
      <DateSwiper date={moment()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default Timeline;
