
import EStyleSheet from 'react-native-extended-stylesheet'
import colors from './colors'


export const REM_SCALE = 320.0

const palette = EStyleSheet.create({
    button: {
        height: '40 rem',  
        backgroundColor: 'black',
        borderRadius: 5, 
    },
    h6: {
        fontSize: '16 rem',
        fontWeight: 'normal'
    },    
})

export default palette
