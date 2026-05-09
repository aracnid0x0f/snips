import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Caveat_400Regular } from '@expo-google-fonts/caveat'

import { PreferencesProvider } from '@/context/PreferencesContext'
import { initDatabase } from '@/db/helpers'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    const [dbReady, setDbReady] = useState(false)
    const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
    
    const [fontsLoaded] = useFonts({
        BorderWall: require('../assets/fonts/BorderWall-font.otf'),
        Caveat_400Regular,
    })

    useEffect(() => {
        async function prepare() {
            try {
                initDatabase()
                const value = await AsyncStorage.getItem('onboarding_done')
                setOnboardingDone(value === 'true')
                setDbReady(true)
            } catch (e) {
                console.error("Failed to load the DB", e) // TODO: change thi to an error in the app
            }
        }
        prepare()
    }, [])

    useEffect(() => {
        if (fontsLoaded && dbReady) {
            SplashScreen.hideAsync()
        }
    }, [fontsLoaded, dbReady])

    if (!fontsLoaded || !dbReady) return null

    return (
        <PreferencesProvider>
            <Stack screenOptions={{ headerShown: false}}>
                {
                    onboardingDone
                        ? ( <Stack.Screen name='(drawer)' />)
                        : (<Stack.Screen name='onboarding'/>) 
                }
            </Stack>
        </PreferencesProvider>
    )
}
