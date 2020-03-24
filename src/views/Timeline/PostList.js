
import React from 'react'
import { View, Text,  FlatList, Image } from 'react-native'
import { Button } from 'react-native-elements'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { Dimensions } from 'react-native'

import Theme from 'Reconnect/src/theme/Theme'


const DATA = [{id: '1', content: [], attachments: [{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}]},
    {id: '2', content: [], attachments: [{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}]}]

const Post = ({item, navigation}) => {

    return (
        <View style={{marginTop: '8%', paddingHorizontal: '4%'}}>        
            <Image        
                    style={{
                        width: Dimensions.get('window').width * 0.92,
                        height: (Dimensions.get('window').width * 0.92) * (152.0/1262.0)
                    }}                
                    resizeMode='cover' 
                    defaultSource={Theme.images.topPost}                
                    source={Theme.images.topPost}                
            />

            <View style={{backgroundColor: 'white'}}>               
                
                <View style={{borderWidth: 2.25, borderTopWidth: 0, borderColor: Theme.colors.contentBorders}}>

                    <View style={ item.id == '1' ? { 
                        marginHorizontal: '0.1%', 
                        marginTop: '3%', 
                        paddingVertical: '4%', 
                        paddingHorizontal: '5%', 
                        backgroundColor: '#ffe5ee' } : { 
                        marginHorizontal: '0.1%', 
                        marginTop: '5%', 
                        paddingVertical: '2%', 
                        paddingHorizontal: '5%',                         
                        }
                        
                        }>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', }}>
                            Wednesday, Sep 30 - 2020
                        </Text>
                        <Text style={{ fontSize: 15, paddingTop: '2%' }}>
                            {item.id == '1' ? "From GF @ 7:30 pm" : "From YOU @ 3:00 pm"}
                        </Text>
                    </View>

                    <View style={{ margin: '5%', marginVertical: '5%' }}>
                        <Text numberOfLines={6} style={{ fontSize: 13, fontFamily: 'the girl next door' }}>                            
                            This week I had to do the same thing we did when we were working together.{"\n"}{"\n"}
                            I felt really good about it and it reminded me of how much you helped me back then!  
                        </Text>
                        <Text style={{ textAlign:'left', color: 'black', fontWeight: 'bold', fontSize: 12, letterSpacing: 0.5, marginTop: '5%'}} onPress={() => navigation.navigate('NewPost')}>
                            READ POST
                        </Text>
                    </View>


                    <View style={{ 
                        
                        borderColor: Theme.colors.contentBorders, 
                        borderTopWidth: 2, 
                        paddingHorizontal: '5%', 
                        paddingVertical: 20
                    }}>
                        

                        <FlatList horizontal 
                            style={{ height: Dimensions.get('window').width * 0.25,}}
                            showsHorizontalScrollIndicator={false}
                            ItemSeparatorComponent={() => (<View style={{width: 15, height: Dimensions.get('window').width * 0.25}}/>)}
                            data={item.attachments}                        
                            keyExtractor={item => item.id}
                            renderItem={ ({item, index}) => (
                                <Image resizeMode='cover' 
                                    style={{
                                        width: Dimensions.get('window').width * 0.25,  
                                        aspectRatio: 1,
                                    }}
                                    source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/reconnect-eddf2.appspot.com/o/morning.jpeg?alt=media&token=7244e078-0ae3-4839-a363-07d0881ecf03' }}                                 
                                />
                            )}
                        />
                        

                        <EvilIcons name='paperclip' size={56} style={{color: Theme.colors.contentBorders, position: 'absolute', right: '-2%', bottom: '-5%'}}/>
                    </View>

                </View>
            </View>
        </View>
    )
}

const PostList = ({navigation}) => {
    return (
        <View style={{flex: 1 }}>
            <FlatList
                data={DATA}
                renderItem={({item}) => <Post item={item} navigation={navigation} />}
                keyExtractor={item => item.id}

                contentContainerStyle={{                    
                }}
                style={{                    
                }}
            />
        </View>
    )
}

export default PostList;