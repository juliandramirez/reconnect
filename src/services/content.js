/**
 * @flow
 */

import { wait } from 'Reconnect/src/lib/utils'
import NotificationsManager from 'Reconnect/src/services/notifications'

/* MARK: - Types */

export const ReminderValues = {
    NoNeed: 'I don\'t need reminders',
    EveryMorning: 'Every morning',
    EveryNight: 'Every night',
    EveryWeek: 'Every week',
    EveryMonth: 'Every month',
}
export type ReminderValue = $Keys<typeof ReminderValues>

export type SpaceConfiguration = {|
    shortName?: ?string,
    color: string,
    reminderValue: ReminderValue    
|}

export type Space = {
    id: string,
    invitationCode: string,
    configuration?: ?SpaceConfiguration
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
    
    if (code.toLowerCase() == 'valid') {
        return {
            id: 'pre-id',
            invitationCode: code,
            configuration: null
        }
    } else {
        return null
    }
}

ContentManager.createSpace = async (configuration : SpaceConfiguration) : Promise<Space> => {
    await wait(600)

    // create space
    const space = {
        id: 'id',
        invitationCode: 'CODE',
        configuration: configuration
    }

    // configure local notifications
    NotificationsManager.configureLocalNotification(space)

    return space
}

ContentManager.attachToSpace = async (space: Space, configuration: SpaceConfiguration) : Promise<Space> => {
    await wait(600)
    
// add user configuration to existing space
    const updatedSpace = {
        id: space.id,
        invitationCode: space.invitationCode,
        configuration: configuration
    } 

// configure local notifications
    NotificationsManager.configureLocalNotification(space)

    return updatedSpace
}

export default ContentManager