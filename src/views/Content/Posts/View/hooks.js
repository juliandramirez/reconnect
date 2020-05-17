/**
 * @flow
 */

import { useNavigation } from '@react-navigation/native'
import { Alert } from 'react-native'

import type { Post } from 'Reconnect/src/services/posts'
import type { Space } from 'Reconnect/src/services/spaces'
import { NavigationRoutes } from 'Reconnect/src/views/Content/index'
import AuthManager from 'Reconnect/src/services/auth'


type PostConfiguration = {|
    userIsAuthor: boolean,
    headerConfig: {|
        color: string,
        title: string,
        subtitle: string,
        from: string,
    |},
    actionConfig: {|
        label: string,
        action: Function
    |}
|}

export function usePostConfiguration({ space, post } : { space: Space, post: Post }) : PostConfiguration {
    
    /* Hooks */
    const navigation = useNavigation()

    /* Properties */
    const userIsAuthor = post.authorId == AuthManager.currentUserId()
    const title = `~~ ${post.title ?? 'untitled'} ~~`
    const subtitle = `${post.created.format('dddd, MMM DD @ h:mm a')}`

    const configuration = userIsAuthor ? {
        userIsAuthor,
        headerConfig: {
            color: 'white',
            title,
            subtitle,
            from: 'you'
        },
        actionConfig: {
            label: 'EDIT LETTER',
            action: () => {
                Alert.alert('Edit Letter', 'Do you want to edit this letter?', [ {
                        text: 'Confirm',
                        onPress: () => navigation.navigate( NavigationRoutes.NewPost, { space, editPost: post } )
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',                    
                    }
                ], {
                    cancelable: true
                })
            }
        }
    } : {
        userIsAuthor,
        headerConfig: {
            color: space.configuration?.color ?? 'transparent',
            title,
            subtitle,
            from: space.configuration?.shortName ?? 'them'
        },
        actionConfig: {
            label: 'OPEN LETTER',
            action: () => navigation.navigate( NavigationRoutes.PostDetail, { post, space } )
        }        
    }

    return configuration
}