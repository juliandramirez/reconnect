

import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-elements'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Entypo from 'react-native-vector-icons/Entypo'

import ProfileSwiper from './ProfileSwiper'
import DayContent from './DayContent'


const Container = () => {
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>

            {/* PROFILES */}
            <ProfileSwiper />
            
            {/* DATE NAVIGATOR */}
            <View style={{ flexDirection: 'column' }}>

                <View style={{ 
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#ffe5ee'                        
                    }}>

                    <View style={{flexGrow:1}}>
                        <Button type='clear' icon={
                            <Ionicons name='ios-arrow-back' size={28}/>
                        }/>
                    </View>

                    <Text style={{
                            fontFamily: 'Cochin',
                            fontSize: 18,
                            letterSpacing: 0.5,                            
                            fontWeight: 'bold'
                        }}>
                        Wed, 30 September 2019
                    </Text>

                    <View style={{flexGrow:1}}>
                        <Button type='clear' icon={
                            <Ionicons name='ios-arrow-forward' size={28}/>
                        }/>
                    </View>                    
                </View>
            </View>


            {/* TIMELINE */}
            <DayContent />

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
                    <Button type='clear' icon={
                        <MaterialCommunityIcons name='calendar-search' size={30}/>
                    }/>
                </View>
                
                <View style={{flex:1, flexGrow:1}}>
                    <Button type='clear' icon={
                        <Ionicons name='ios-add-circle-outline' size={34}/>
                    }/>
                </View>
                
                <View style={{flex:1, flexGrow:1}}>
                    <Button type='clear' icon={
                        <Ionicons name='ios-log-out' size={30}/>
                    }/>
                </View>
            </View>
        </View>
    );
};

export default Container;
