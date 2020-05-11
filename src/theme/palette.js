/**
 * @flow
 */

import EStyleSheet from 'react-native-extended-stylesheet'
import colors from './colors'


export const REM_SCALE = 320.0

const palette = EStyleSheet.create({
    title:{
        fontSize: '28 rem',  
        color: colors.titleColor,
    },
    button: {
        height: '40 rem',  
        backgroundColor: 'black',
        borderRadius: 5, 
    },
    clearButton: {
        height: '40 rem', 
        borderColor: colors.clearButtonTextColor,
    },
    clearButtonText: {        
        
    },
    h6: {
        fontSize: '16 rem',
        fontWeight: 'normal',
        lineHeight: '20 rem'
    },    
})

export default palette
