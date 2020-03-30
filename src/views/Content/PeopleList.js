import React from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { Avatar, Badge } from 'react-native-elements'
import { Button } from 'react-native-elements'
import Ionicons from 'react-native-vector-icons/Ionicons'

import Theme from 'Reconnect/src/theme/Theme'


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
    width: 1
  },  
  {
    profile: 'BFF',
    id: '2',
    color: '#fdf5c9',
    width: 0
  },  
];


const PeopleList = () => {
    return (
        <View style={{
            flexDirection: 'row', 
            alignItems: 'center',
            borderColor: Theme.colors.contentSeparator,
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
    )
}

const Profile = ({profile, id, color, width}) => {
    return (
        <View>
            <Avatar rounded
                size={ id === '1' ? 50 : 50 }
                title={profile} 
                titleStyle={{
                    fontSize: 14,
                    color: '#444444',
                    fontWeight: 'bold'
                }}
                containerStyle={{
                    marginLeft: 10, 
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
                      top: 0, 
                      right: 0 
                  }}
              />
            )}
        </View>
    )
}

export default PeopleList
