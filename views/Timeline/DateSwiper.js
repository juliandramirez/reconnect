import React from 'react';
import Swiper from 'react-native-swiper';
import {View, Text, StyleSheet, TextInput} from 'react-native';

const FORMAT = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'DD/MM/YYYY',
};

const DateSwiper = ({date}) => {
  return (
    <Swiper>
      <View style={styles.slide}>
        <Text>{date.calendar(FORMAT)}</Text>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: '100%',
  },
});

export default DateSwiper;
