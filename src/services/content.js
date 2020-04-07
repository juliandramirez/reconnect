/**
 * @flow
 */

import { wait } from 'Reconnect/src/lib/utils'

/* MARK: - Types */

export const ReminderValues = {
    NoNeed: 'I don\'t need reminders',
    EveryMorning: 'Every morning',
    EveryNight: 'Every night',
    EveryWeek: 'Every week',
    EveryOtherWeek: 'Every other week',
    EveryMonth: 'Every month',
}
export type ReminderValue = $Keys<typeof ReminderValues>

export type SpaceConfiguration = {|
    shortName: ?string,
    color: string,
    reminderValue: ReminderValue
|}

export type Space = {
    id: string,
    invitationCode: string,
    configuration: SpaceConfiguration
}

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

export type Person = {
    id: string
}

/* MARK: - Services */

const ContentManager = {}

ContentManager.getSpaceWithInvitationCode = async (code: string) : Promise<?Space> => {
    await wait(600)
    return null
}

ContentManager.createSpace = async (configuration : SpaceConfiguration) : Promise<Space> => {
    await wait(600)

    return {
        id: 'id',
        invitationCode: 'CODE',
        configuration: configuration
    }
}

ContentManager.attachToSpace = async (space: Space, configuration: SpaceConfiguration) : Promise<Space> => {
    await wait(600)
    
    return {
        id: space.id,
        invitationCode: space.invitationCode,
        configuration: configuration
    } 
}

export default ContentManager