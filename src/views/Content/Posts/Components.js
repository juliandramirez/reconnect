/**
 * @flow
 */

import * as React from 'react'
import { View, Image } from 'react-native'
import { Dimensions } from 'react-native'
import EvilIcons from 'react-native-vector-icons/EvilIcons'

import Theme from 'Reconnect/src/theme/Theme'


export const PostEnvelope = ({ children } : { children: React.Node }) => (

    <View style={{ flex: 1, margin: Dimensions.get('window').width * 0.04 }}> 
        {/* TOP IMAGE */}
        <Image        
            style={{
                flex: 0,
                width: Dimensions.get('window').width * 0.92,
                height: (Dimensions.get('window').width * 0.92) * (152.0/1262.0)
            }}                
            resizeMode='cover' 
            defaultSource={ Theme.images.topPost }                
            source={ Theme.images.topPost }                
        />

        {/* POST CONTENT */}
        <View style={{ 
            backgroundColor: 'white', 
            flex: 1
        }}>                               
            <View style={{ 
                borderWidth: 2.25, 
                borderTopWidth: 0, 
                borderColor: Theme.colors.contentBorders,
                flex: 1
            }}>
                {children}
            </View>
        </View>            
    </View>                    
)

export const AttachmentEnvelope = ({ children } : { children: React.Node }) => (
    <View style={{                         
        borderColor: Theme.colors.contentBorders, 
        borderTopWidth: 2, 
        paddingHorizontal: '5%', 
        paddingVertical: 20
    }}>                        
        {children}        
        <EvilIcons name='paperclip' size={56} style={{color: Theme.colors.contentBorders, position: 'absolute', right: '-2%', bottom: '-5%'}}/>
    </View>    
)
