/**
 * @flow
 */

import { wait, stringNotEmpty } from 'Reconnect/src/lib/utils'

import type { ReminderValue } from 'Reconnect/src/services/notifications'
import { ReminderValues } from 'Reconnect/src/services/notifications'

import NotificationsManager from './notifications'
import AuthenticationManager from  './auth'


/* MARK: - Types */

export type SpaceConfiguration = {|
    shortName?: ?string,
    color: string,
    reminderValue: ReminderValue    
|}

export type Space = {
    id: string,
    invitationCode: string,
    hostId: string,
    guestId?: ?string,
    configuration?: ?SpaceConfiguration
}

/* MARK: - Services */

const SpacesManager = {}

SpacesManager.getSpaces = async () : Promise<Array<Space>> => {    
    await wait(600)

    const userId = AuthenticationManager.currentUserId() ?? 'logged-in'

    const spaceHost = await SpacesManager.createSpace({shortName: 'Lau', color: '#FCE1E3', reminderValue: 'NoNeed'})
    const spaceGuest = await SpacesManager.attachToSpace({id: 'an-id', invitationCode: 'an-invite-code', hostId: userId}, {shortName: 'Gog', color: '#E5E9FC', reminderValue: 'NoNeed'})

    return [spaceHost, spaceGuest]
}

SpacesManager.getSpaceWithInvitationCode = async (code: string) : Promise<?Space> => {
    await wait(600)

    if (code.toLowerCase() == 'valid') {
        return {
            id: 'pre-id',
            invitationCode: code,
            configuration: null,
            hostId: 'other-user-id',
            guestId: null
        }
    } else {
        return null
    }
}

SpacesManager.createSpace = async (configuration : SpaceConfiguration) : Promise<Space> => {
    await wait(600)

    // create space
    const space = {
        id: 'id',
        invitationCode: 'CODE',
        configuration: configuration,
        hostId: AuthenticationManager.currentUserId() ?? 'logged-in',
        guestId: null
    }

    // configure local notifications
    _configureLocalNotifications(space)

    return space
}

SpacesManager.attachToSpace = async (space: Space, configuration: SpaceConfiguration) : Promise<Space> => {
    await wait(600)
    
    // add user configuration to existing space
    const updatedSpace = {
        id: space.id,
        invitationCode: space.invitationCode,
        configuration: configuration,
        hostId: 'other-user-id',
        guestId: AuthenticationManager.currentUserId()
    } 

    // configure local notifications
    _configureLocalNotifications(space)

    return updatedSpace
}

async function _configureLocalNotifications(space: Space) {

    const reminderValue = space.configuration?.reminderValue ?? 'NoNeed'
    const writeTo = stringNotEmpty(space.configuration?.shortName) ? `to ${space.configuration?.shortName ?? ''}` : ''
    const writeEvery = ReminderValues[reminderValue].toLowerCase()

    NotificationsManager.configureLocalNotification({
        id: space.id,
        title: 'Time to reconnect',
        message: `Just reminding you that you wanted to write ${writeEvery} ${writeTo}`,
        reminderValue
    })
}

export default SpacesManager