import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';

const Profile = ({profile, id}) => {
  return <View style={styles.profile}></View>;
};

const DATA = [
  {
    profile: 'hi',
    id: 1,
  },
  {
    profile: 'hi',
    id: 2,
  },
];

const ProfileSwiper = () => {
  return (
    <FlatList
      horizontal
      data={DATA}
      renderItem={({item}) => <Profile {...item} />}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  profile: {
    borderRadius: 50,
    backgroundColor: '#000',
    height: 50,
    width: 50,
    marginLeft: 10,
  },
  list: {
    height: 80,
    width: '100%',
    alignItems: 'center',
    borderBottomColor: '#dedede',
    borderBottomWidth: 1,
  },
});

export default ProfileSwiper;
