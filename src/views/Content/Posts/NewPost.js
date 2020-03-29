/**
 * @flow
 */

import React from 'react'
import { View, Image, TextInput } from 'react-native'
import { Dimensions } from 'react-native'
import KeyboardSpacer from 'react-native-keyboard-spacer'

import { PostEnvelope } from './Components'

import Theme from 'Reconnect/src/theme/Theme'


const NewPostView = () => {

    /* Render */
    return (  
        <>      
            <PostEnvelope>
                {/* TEXT */}
                <View style={{ flex: 1 }}>
                    <TextInput multiline={true}                 
                        
                        style={{ 
                            marginHorizontal: '5%',
                            fontSize: 13, 
                            fontFamily: 'the girl next door',                                   
                        }}                    
                    />
                </View>

                {/* ATTACHMENTS */} 
                <View style={{flex: 0}}>
                </View>
                
            </PostEnvelope>

            <KeyboardSpacer />
        </>     
    )
}


export default NewPostView