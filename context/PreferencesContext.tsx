import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage  from "@react-native-async-storage/async-storage"
import { setGestureState } from 'react-native-reanimated'

const GENDER_MODE_KEY = 'snips_gender_mode'
const DARK_MODE_KEY = 'snips_dark_mode'

export type GenderMode = 'male' | 'female' | 'both'

export type PreferencesContextType = {
    genderMode: GenderMode,
    setGenderMode: ( mode: GenderMode ) => void,
    isDarkMode: boolean,
    setIsDarkMode: ( value: boolean ) => void
}

export const PreferencesContext = createContext<PreferencesContextType | null>(null)

export function usePreferences( ){
    const context = useContext(PreferencesContext)
    if (!context) {
        throw new Error("usePreferences MUST be used inside PreferencesProvider")
    }
    return context
}

export function PreferencesProvider(
    { children }: { children: ReactNode },
) {
    const [genderMode, setGenderModeState] = useState<GenderMode>('both')
    const [isDarkMode, setIsDarkModeState] = useState(false)

    useEffect(() => {
        const loadPreferences = async ( ) => {
            const storedGender = await AsyncStorage.getItem(GENDER_MODE_KEY)
            const storedDarkMode = await AsyncStorage.getItem(DARK_MODE_KEY)

            if (storedGender) setGenderModeState(storedGender as GenderMode)
            if (storedDarkMode) setIsDarkModeState(storedDarkMode === 'true')
        }
        loadPreferences()
    }, [])

    function setGenderMode( mode: GenderMode ) {
        setGenderModeState(mode)
        AsyncStorage.setItem(GENDER_MODE_KEY, mode)
    }

    function setIsDarkMode( value: boolean ) {
        setIsDarkModeState(value)
        AsyncStorage.setItem(DARK_MODE_KEY, String(value))
    } 

    return (
        <PreferencesContext.Provider value={{ genderMode, setGenderMode, isDarkMode, setIsDarkMode }}>
            {children}
        </PreferencesContext.Provider>
    )
}

