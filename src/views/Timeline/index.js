

import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-elements'
import { createStackNavigator } from '@react-navigation/stack'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

import Theme from 'Reconnect/src/theme/Theme'

import ProfileSwiper from './ProfileSwiper'
import DayContent from './DayContent'
import PostList from './PostList'
import NewPost from './NewPost'


const Stack = createStackNavigator()
const NavigationContainer = () => (
    <Stack.Navigator>
        <Stack.Screen name="Main" component={Container} options={{headerShown: false}}/> 
        <Stack.Screen name="NewPost" component={NewPost} />
    </Stack.Navigator>
)

const Container = ({ navigation }) => {
    return (
        <View style={{ flex: 1, backgroundColor: Theme.colors.appBackground }}>

            {/* PROFILES */}
            <ProfileSwiper />


            {/* TIMELINE */}
            <PostList navigation={navigation}/>

            {/* BOTTOM BAR */}
            <View style={{
                flexDirection: 'row',
                height: 50,                
                justifyContent: 'space-evenly',
                borderColor: 'black',
                borderTopWidth: 0,
                alignItems: 'center'
            }}>
                <View style={{flex:1, flexGrow:1}}>

                </View>
                
                <View style={{flex:1, flexGrow:1}}>
                    <Button type='clear' icon={
                        <SimpleLineIcons name='pencil' size={32}/>
                    } onPress={() => navigation.navigate('NewPost')}/>
                </View>
                
                <View style={{flex:1, flexGrow:1, alignItems: 'flex-end'}}>
                    <Button type='clear' style={{ marginRight: 12 }} icon={
                        <AntDesign name='logout' size={26}/>
                    }/>
                </View>
            </View>
        </View>
    );
};

export default NavigationContainer;
