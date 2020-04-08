/**
 * @flow
 */

import { wait } from 'Reconnect/src/lib/utils'

import AuthenticationManager from  './auth'


/* MARK: - Types */

export type Post = {
    id: string,
    text: string,
    attachments: Array<Attachment>
}

export type Attachment = {
    id: string,
    type: 'image' | 'video',
    url: string
}

/* MARK: - Services */

const PostsManager = {}

export default PostsManager