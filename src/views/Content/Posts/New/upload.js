/**
 * @flow
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, Keyboard } from 'react-native'
import { Button } from 'react-native-elements'
import * as Progress from 'react-native-progress'

import Theme from 'Reconnect/src/theme/Theme'
import type { Attachment } from 'Reconnect/src/services/posts'
import PostsManager from 'Reconnect/src/services/posts'
import EStyleSheet from 'react-native-extended-stylesheet'


/* Types */
export type UploadModalProps = {| 
    spaceId : string, 
    attachments: Array<Attachment>,
    success: (Array<Attachment>) => any,
    error: Function,
|}

const modalStyles = EStyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Theme.colors.appBackground        
    },
    pie: {
        fontSize: '125 rem',
        padding: '8 rem'
    },  
    pieContainer: {
        marginBottom: '10 rem'
    },
    itemsContainer: {
        marginBottom: '5 rem'
    },
        barProgress: {
            marginTop : 10
        },
        bar: {
            height: '8 rem'
        },
    button: {
        fontSize: '18 rem',
        color: '#333',  
        letterSpacing: '1 rem'
    }
    
})

const PIE_COLOR = 'black'
const BAR_COLOR = '#bbb'

const UploadModal = ({ spaceId, attachments, success, error } : UploadModalProps ) => {

    /* State */
    const [progress, setProgress] = useState<{total: number, each: Array<number>}>({total: 0, each:[0]})
    const [finished, setFinished] = useState<boolean>(false)
    const [cancelling, setCancelling] = useState<boolean>(false)

    /* References */
    const cancelHookRef = useRef<Function>(() => {})

    /* Effects */
    useEffect(_init, [])

    /* Functions */
    function _init() {
        Keyboard.dismiss()

        const progressListener = (total, each) => {
            setProgress({total, each})
        }

        const addPostFuture = PostsManager.uploadAttachments({ 
            spaceId,
            attachments,
            progressListener
        })

        cancelHookRef.current = addPostFuture.cancelHook

        addPostFuture.promise.then( (attachments) => {
            setFinished(true)
            success(attachments)
        }).catch((e) => error(e))
    }

    function _cancel() {
        setCancelling(true)
        cancelHookRef.current()        
    }

    /* Render */
    return (
        <View style={ modalStyles.container }>

            <View style={ modalStyles.pieContainer }>
                <Progress.Circle 
                    showsText={true}
                    progress={ !progress.total ? 0 : 
                        progress.total == 100 ? 0.99 : progress.total / 100.0 } 
                    animated={true}
                    size={ modalStyles._pie.fontSize }
                    thickness={ modalStyles._pie.padding }
                    color={ PIE_COLOR }
                />
            </View>

            {
                progress.each.length > 1 ?
                    <View style={ modalStyles.itemsContainer }>
                    {
                        progress.each.map( (item, index) => 
                            <Progress.Bar key={index} 
                                progress={ ( item ?? 0 ) / 100.0 } 
                                height={ modalStyles._bar.height }
                                style={ modalStyles.barProgress }
                                color={ BAR_COLOR }
                            />)
                    }
                    </View>
                : 
                    <></>
            }
            
            { 
                finished ? <></> :
                    <View>
                        <Button title='CANCEL' type='clear' 
                            loading={cancelling}
                            loadingProps={{color: 'darkgrey'}}
                            disabled={finished}
                            onPress={_cancel} 
                            titleStyle={ modalStyles.button }
                        />
                    </View>            
            }
            

        </View>
    )
}

export default UploadModal