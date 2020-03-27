/**
 * @flow
 */

const ContentManager = {}

export type Post = {
    id: string,
    text: string,
    attachments: Array<Attachment>
}

export type Attachment = {
    id: string
}

export type Person = {
    id: string
}

export default ContentManager