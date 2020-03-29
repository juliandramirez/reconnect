/**
 * @flow
 */

import * as React from 'react'
import { View, Image } from 'react-native'
import { Dimensions } from 'react-native'

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
