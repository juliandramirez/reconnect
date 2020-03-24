
import React, { useState } from 'react'
import { View, FlatList } from 'react-native'


const NewPost = () => {
    const [content, setContent] = useState([])

    function _renderBlock({type, content}) {
        if (type === 'text') {

        } else if (type === 'image') {

        } if (type === 'video') {

        }

        return <></>
    }

    return (
        <View style={{flex: 1}}>
            <FlatList
                    data={content}
                    renderItem={ ({item}) => _renderBlock(item)}
                    keyExtractor={ item => item.id }

                    contentContainerStyle={{
                    }}
                    style={{                    
                    }}
                />
        </View>

    )
}

export default NewPost