import React from 'react';
import Swiper from 'react-native-swiper';
import {View, Text, StyleSheet, TextInput} from 'react-native';

import Timeline from 'react-native-timeline-flatlist'
import Octicons from 'react-native-vector-icons/Octicons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Icon from 'react-native-vector-icons/FontAwesome';
import {Image} from 'react-native-elements';


const DateSwiper = () => {

    const data1 = [
        {
            content: 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/breakfast.jpg?alt=media&token=31a56a22-cd51-4614-ae75-8ecb81bfa9b4',
            contentType: 'image',
            text: 'yessss!',
            tag: '😋',
            time: '9:00 am'
        },
        {
            content: 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/breakfast.jpg?alt=media&token=31a56a22-cd51-4614-ae75-8ecb81bfa9b4',
            contentType: 'audio',
            text: "good nighhhht...",
            tag: '🥱',
            time: '8:00 pm'
        },    
    ]

    const data2 = [    
    {
        content: 'leaving this here to show you how much I appreciate you for supporting me',
        contentType: 'text',
        tag: '❤️',
        time: '8:00 am'
    },
    {
        content: 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/morning.jpeg?alt=media&token=7244e078-0ae3-4839-a363-07d0881ecf03',
        contentType: 'image',
        text: "morning!",
        tag: '😗',
        time: '8:00 am'
    },    
    {
        content: 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/dog.jpeg?alt=media&token=140485ce-94af-4ab4-bade-ca7ea65ab2b7',
        contentType: 'image',
        text: "afternoon break!",
        tag: '😗',
        time: '2:00 pm'
    },    
  ]

  return ( 
    <View style={{flex: 1, backgroundColor: '#fffafc'}}>   

        <View style={{
            flexDirection:'row', 
            justifyContent: 'space-around', 
                                                           
        }}>

            <Text style={{flex: 1, 
                textAlign: 'center', 
                fontWeight: 'bold', 
                fontFamily: 'Cochin', 
                letterSpacing: 1, 
                fontSize: 13,
                paddingTop: 20,
            paddingBottom: 10,                
                }}>
                YOUR DAY
            </Text>
            <View style={{backgroundColor: '#333333', width: 1}}></View>
            <Text style={{flex: 1, 
                textAlign: 'center', 
                fontWeight: 'bold', 
                fontFamily: 'Cochin', 
                letterSpacing: 1, 
                fontSize: 13,
                paddingTop: 20,
            paddingBottom: 10,                
                }}>
                LAURA'S DAY
            </Text>
        </View>   

        <View style={{
            flex: 1, 
            flexDirection:'row', 
            justifyContent: 'space-evenly', 
          }}>        
          <View style={{flex:1, marginRight: '3%'}}>
            <DailyTimeline data={data1} direction='left' />
          </View>
          <View style={{backgroundColor: '#333333', width: 1}}></View>

          <View style={{flex:1, marginLeft: '3%'}}>
            <DailyTimeline data={data2} direction='right' />
          </View>
        </View>
    </View>   
  );
};


const DailyTimeline = ({data, direction}) => {

    function _render(rowData, sectionID, rowID) {

        let content;
            if (rowData.contentType === 'text') {
                content = <Text numberOfLines={7} style={{ 
                    alignSelf: 'center', 
                    paddingTop: 10, 
                    paddingBottom: 10, 
                    textAlign: 'center', 
                    color: 'grey', 
                    lineHeight: 18, 
                    fontSize: 14, 
                    letterSpacing: 0.5}}>
                    {rowData.content}
                </Text>

        } else if (rowData.contentType === 'image') {
      content = (<>
        <Image resizeMode='cover' style={{
          aspectRatio: 1, 
          borderWidth: 1, 
          borderColor: 'grey'}} source={{ uri: rowData.content }} />
          <Text numberOfLines={7} style={{ 
            fontStyle: 'italic', 
            alignSelf: 'center', 
            paddingTop: 10, 
            paddingBottom: 10, 
            textAlign: 'center', 
            color: 'grey', 
            lineHeight: 20, 
            fontSize: 14}}>
          {rowData.text}
        </Text>
      </>)
    } else if (rowData.contentType === 'audio') {
      content = (<>
      <View style={{
        aspectRatio: 1.5, 
        borderRadius: 6,
        alignItems:'center', 
        justifyContent: 'center',
        backgroundColor: '#cfbcb5'
        }} >
        <AntDesign name='sound' size={40} color='white'/>
      </View>
      <Text numberOfLines={7} style={{ 
        fontStyle: 'italic', 
        alignSelf: 'center', 
        paddingTop: 10, 
        paddingBottom: 10, 
        textAlign: 'center', 
        color: 'grey', 
        lineHeight: 20, 
        fontSize: 14}}>
      {rowData.text}
        </Text>
      </>)      
    } else if (rowData.contentType === 'video') {
      content = (<>
      <View style={{aspectRatio: 1.5, borderWidth: 1, borderColor: 'grey', alignItems:'center', justifyContent: 'center'}} ><Octicons name='device-camera-video' size={40} color='grey'/></View>
      <Text numberOfLines={7} style={{ fontStyle: 'italic', alignSelf: 'center', paddingTop: 10, paddingBottom: 10, textAlign: 'center', color: 'grey', lineHeight: 20, fontSize: 14}}>
      {rowData.text}
        </Text>
        </>)      
    }

    return (
      <View>
        <View>
          {content}
        </View>

        <View>
          <Text style={{textAlign: 'center', fontWeight: '400', letterSpacing: 1}}>
            It's {rowData.time}
          </Text>
          <Text style={{textAlign: 'center', fontWeight: '400', letterSpacing: 1}}>
            Feeling {rowData.tag}
          </Text>       
        </View>
        
              
      </View>
    )
  }

  return (
    <Timeline
        data={data}
        showTime={false}
        renderFullLine={true}
        lineWidth={1}
        rowContainerStyle={{ alignItems: 'center'}}
        renderDetail={_render}

        innerCircle={'dot'}
        circleColor='black'
        lineColor='black'
        columnFormat={ direction === 'left' ? 'single-column-left' : 'single-column-right' }

        options={{showsVerticalScrollIndicator:false}}
        separator={true}
        separatorStyle={{
            borderTopWidth: 3,
            borderColor: 'grey',
            marginTop: 10,
            marginBottom: 15
        }}
    />
  )
}


export default DateSwiper;
