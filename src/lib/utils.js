/**
 * @flow
 */

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Keyboard, Platform, Linking, Alert, Share } from 'react-native'
import { showMessage, hideMessage } from 'react-native-flash-message'
import RNBootSplash from 'react-native-bootsplash'

import Constants from 'Reconnect/src/Constants'
import Theme, { useSkin, initialSkin } from 'Reconnect/src/theme/Theme'


/* MARK: - Type Alias */

export type StringMap = { [key: string]: string }
export type DataMap = { [key: string]: any }

/* MARK: - Helper functions */

export function stringNotEmpty(str: ?string) {
    return str != null && str !== undefined && str.trim() !== ''
}

export function wait(milliseconds: number) {
    return new Promise<void>(resolve => setTimeout(resolve, milliseconds))
}

export async function shareInstallApp(spaceInvitationCode: string) {
    const message = `1. Download app here: ${Constants.appUrl}\n2. Open the app and use the invitation code ${spaceInvitationCode}`
    await Share.share({ message })    
}

/* MARK: - UI Utils */

export function getHighlightColor(color: ?string): string {
    if (!color) {
        return '#444'
    }
    const index = Theme.colors.spaceColors.findIndex(val => val == color)
    return index != -1 ? Theme.colors.highlightColors[index] : '#444'
}

export function hideLoadingScreen() {
    RNBootSplash.hide()
}

export function goToSettingsAlert({ title, message, cancelButtonText, onCancel = () => {} } : { 
        title: string, 
        message: string, 
        cancelButtonText: string, 
        onCancel?: Function 
    }): Promise<void> {

    return new Promise<void>( resolve => {
        Alert.alert(title, message, [
                {
                    text: cancelButtonText,
                    onPress: () => {
                        onCancel()
                        resolve()
                    },
                    style: 'cancel'
                },
                {
                    text: 'Go to Settings',
                    onPress: () => {
                        Linking.openSettings().then(() => resolve())
                    },
                    style: 'default'
                }            
            ],
            {
                cancelable: false
            },
        )
    })    
}

export function hideFlashMessage() {
    hideMessage()
}

export function showSuccessMessage(text: string) {
    showMessage({
        message: text,
        backgroundColor: Theme.colors.successNotification,
        titleStyle: { ...Theme.palette.h6, color: Theme.colors.textNotification },
    })
}

export function showInfoMessage(text: string) {
    showMessage({
        message: text,
        backgroundColor: Theme.colors.infoNotification,
        titleStyle: { ...Theme.palette.h6, color: Theme.colors.textNotification },
    })
}

export function showErrorMessage(text: string) {
    showMessage({
        message: text,
        backgroundColor: Theme.colors.errorNotification,
        titleStyle: { ...Theme.palette.h6, color: Theme.colors.textNotification },        
    })
}

export function useModalBackground(backgroundColor: string): Function {
    /* Hooks */
    const [skin, setSkin] = useSkin()

    /* Effects */
    useEffect(_init, [])

    /* Functions */
    function _init() {
        setSkin({...initialSkin, safeAreaBackground: backgroundColor})
    }

    /* Functions */
    function dismiss() {
        setSkin(initialSkin)
    }

    /* Public API */
    return dismiss
}

export function useKeyboardListener(): boolean {
    /* State */
    const [keyboardShown, setKeyboardShown] = useState<boolean>(false)
  
    /* Effects */
    useEffect(Keyboard.dismiss, [])

    useEffect(() => {
        const showEventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
        const keyboardDidShowListener = Keyboard.addListener(showEventName, () =>
            setKeyboardShown(true)
        )
  
        const hideEventName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
        const keyboardDidHideListener = Keyboard.addListener(hideEventName, () =>
            setKeyboardShown(false)
        )
  
        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [])
  
    return keyboardShown
}

export const KeyboardHidden = ({ children }: { children: React.Node }) => {
    const keyboardShown = useKeyboardListener()
    return keyboardShown ? <></> : children
}

export const KeyboardShown = ({ children }: { children: React.Node }) => {
    const keyboardShown = useKeyboardListener()
    return keyboardShown ? children : <></>
}
