/**
 * @flow
 */

import * as React from 'react'
import { useState } from 'react'

import images from './images'
import colors from './colors'
import palette from './palette'

const Theme = {
    images,
    colors,
    palette
}

export default Theme


/* MARK: - App Skin */

export type Skin = {|
    safeAreaBackground : string
|}

export const initialSkin: Skin = {
    safeAreaBackground: colors.appBackground
}

// $FlowExpectedError: Always intialized before use
const SkinContext = React.createContext<[Skin, (Skin) => void]>()

export const SkinProvider = ({ children } : { children: React.Node }) => {
    /* State */
    const [skin, setSkin] = useState<Skin>(initialSkin)

    /* Render */
    return (
        <SkinContext.Provider value={[skin, setSkin]}>
            {children}
        </SkinContext.Provider>
    )
}

export function useSkin(): [Skin, (Skin) => void] {
    return React.useContext(SkinContext)
}
