/**
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { View, FlatList } from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation } from '@react-navigation/native'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

import Theme from 'Reconnect/src/theme/Theme'
import type { Post, Person } from 'Reconnect/src/services/content'

import PeopleList from './PeopleList'
import PostView from './Post'
import NewPost from './NewPost'
import { NavigationRoutes } from './index'


const Container = () => {

    /* State */
    const [posts, setPosts] = useState<?Array<Post>>(null)

    /* Effects */
    useEffect( _init, [] )

    /* Hooks */
    const navigation = useNavigation()

    /* Functions */
    
    function _init() {
        const text = 'This week I had to do the same thing we did when we were working together.\n\nI felt really good about it and it reminded me of how much you helped me back then!'
        const POSTS = [
            {id: '2', text: text + text, content: [], attachments: [{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}]},
            {id: '1', text: 'This week I had to do the same thing we did when we were working together', content: [], attachments: [{id: '1'}, {id: '2'}, {id: '3'}, {id: '4'}]},            
        ]

        setPosts(POSTS)
    }

    function _onPersonSelect(person: Person) {

    }

    /* Render */

    return (
        <View style={{ flex: 1, backgroundColor: Theme.colors.appBackground }}>

            <PeopleList onPersonSelect={_onPersonSelect}/>

            <View style={{ flex: 1 }}>
                <FlatList                
                    data={posts}
                    renderItem={ ({item}) => 
                        <PostView post={item} fullscreenMode={false} headerColor='#ffe5ee'/> 
                    }
                    keyExtractor={ item => item.id }
                />
            </View>

            <BottomBar />

        </View>
    )
}

/* MARK: - UI Components */

const BottomBar = () => {

    /* Hooks */
    const navigation = useNavigation()
  
    /* Render */
    return (
        <View style={{ 
            flexDirection: 'row', 
            height: 50, 
            justifyContent: 'space-evenly', 
            alignItems: 'center'
        }}>
            <View style={{ flex:1, flexGrow:1 }}>
                <Button 
                    type='clear' 
                    icon={
                        <SimpleLineIcons name='pencil' size={32}/>
                    } 
                    onPress={ () => navigation.navigate( NavigationRoutes.NewPost )}/>
            </View>
        </View>        
    )
}

export default Container