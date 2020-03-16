import React from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { Avatar, Badge } from 'react-native-elements'
import { Button } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'


const DATA = [
  {
    profile: '+',
    id: 'ADD',
    color: 'white',
    width: 0.5
  },
  {
    profile: 'Dad',
    id: '3',
    color: '#c2f2d0',
    width: 0
  },
  {
    profile: 'GF',
    id: '1',
    color: '#ffe5ee',
    width: 2
  },  
  {
    profile: 'BFF',
    id: '2',
    color: '#fdf5c9',
    width: 0
  },  
];

const Profile = ({profile, id, color, width}) => {
    return (
        <View>
            <Avatar rounded
                size={ id === '1' ? 70 : 50 }
                title={profile} 
                titleStyle={{
                    fontSize: 16,
                    color: '#444444',
                    fontWeight: 'bold'
                }}
                containerStyle={{
                    marginLeft: 12, 
                    borderWidth: width,
                    borderColor: 'black',                                       
                    backgroundColor: 'white'
                }}                
                overlayContainerStyle={{
                    backgroundColor: color
                }}                
            />

            {id != '2' ? <></> : (
              <Badge
                  status="primary"
                  value={id}
                  containerStyle={{ 
                      position: 'absolute', 
                      top: -4, 
                      right: -4 
                  }}
              />
            )}
        </View>
    );
}

const ProfileSwiper = () => {
    return (
        <View style={{
            flexDirection: 'row', 
            alignItems: 'center',
            borderColor: 'black',
            borderBottomWidth: 1,
            }}>        

            <FlatList horizontal
                data={DATA}
                renderItem={({item}) => <Profile {...item} />}
                keyExtractor={item => item.id}

                contentContainerStyle={{
                    alignItems: 'center',
                    borderBottomColor: '#dedede',
                    borderBottomWidth: 1, 
                    flexGrow: 1
                }}
                style={{                    
                    height: 80, 
                    maxHeight: 80
                }}
            />
        </View>
    );
};


export default ProfileSwiper;
