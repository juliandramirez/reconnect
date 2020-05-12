/**
 * @flow
 */

import React, { useEffect, useRef } from 'react'
import { AppState } from 'react-native'
import CodePush from 'react-native-code-push'


const INSTALLATION_TIMEOUT = 5000

/*
 * APP UPDATES
 *
 * BEFORE LOADING:
 - mandatory = immediate install
 - regular = immediate install
 *
 *
 * AFTER LOADING:
 - mandatory = go to background + back to foreground => immediate install
 - regular = go to background + back to foreground => on next restart install
 *
 */
export function useCodePush(initialize?: Function){

    /* References */
    const isCodePushSyncingRef = useRef<boolean>(false)

    /* Effects */
    useEffect(_init, []) 
    useEffect(_checkUpdateOnAppResume, [])
    
    /* Functions */    
    function _init() {     
        if (initialize) {
            _installUpdate().then(initialize)
        } else {
            _installUpdate()
        }        
    }

    function _checkUpdateOnAppResume() {
        if (!__DEV__) {
            const changeAppStateListener = state => {
                if (state === 'active' && !isCodePushSyncingRef.current) {
                    const installOptions = {
                        installMode: CodePush.InstallMode.ON_NEXT_RESTART,                    
                        mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE
                    } 
    
                    isCodePushSyncingRef.current = true
                    CodePush.sync(
                        installOptions,
                        status => {},
                      // Don't remove this function (github.com/Microsoft/react-native-code-push/issues/516)
                        progress => {}, 
                      // version mismath? just ignore and resolve the promise 
                        update => {}
                    ).finally(() => {
                        isCodePushSyncingRef.current = false
                    })
                }
            }        
    
            AppState.addEventListener('change', changeAppStateListener)
            return () => {
                AppState.removeEventListener('change', changeAppStateListener)
            }
        }        
    }

    function _installUpdate() {
        return new Promise( (resolve) => {
        // if DEV do not check for updates... resolve immediately
            if (__DEV__) {
                resolve()
            } else {
                const installOptions = {
                    installMode: CodePush.InstallMode.IMMEDIATE,
                    mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE
                }

                isCodePushSyncingRef.current = true
                CodePush.sync(
                    installOptions,
                    status => {},
                  // Don't remove this function (github.com/Microsoft/react-native-code-push/issues/516)
                    progress => {}, 
                  // version mismath? just ignore and resolve the promise 
                    update => resolve()
                )                
                .finally(() => {
                    isCodePushSyncingRef.current = false
                    resolve()
                })

              // resolve after a given timeout
                setTimeout(resolve, INSTALLATION_TIMEOUT)
            }
        })
    }
}