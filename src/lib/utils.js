/**
 * @flow
 */

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Keyboard, Platform } from 'react-native'
import { showMessage, hideMessage } from 'react-native-flash-message'

import Theme, { useSkin, initialSkin } from 'Reconnect/src/theme/Theme'


/* MARK: - Helper functions */

export function stringNotEmpty(str: ?string) {
    return str != null && str !== undefined && str.trim() !== ''
}

export function wait(milliseconds: number) {
    return new Promise<void>(resolve => setTimeout(resolve, milliseconds))
}

/* MARK: - UI Utils */

export function hideFlashMessage() {
    hideMessage()
}

export function showSuccessMessage(text: string) {
    showMessage({
        message: text,
        // icon: 'success',
        backgroundColor: Theme.colors.successNotification,
        titleStyle: { ...Theme.palette.h6, color: Theme.colors.textNotification },
    })
}

export function showErrorMessage(text: string) {
    showMessage({
        message: text,
        // icon: 'danger',
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
