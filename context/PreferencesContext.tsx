import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage  from "@react-native-async-storage/async-storage"
import { setGestureState } from 'react-native-reanimated'

const GENDER_MODE_KEY = 'snips_gender_mode'
const DARK_MODE_KEY = 'snips_dark_mode'
const MEASUREMENT_UNIT_KEY = 'snips_measurement_unit'
const TAILOR_NAME_KEY = 'snips_tailor_name'
const SHOP_NAME_KEY = 'snips_shop_name'
const TAILOR_PHONE_KEY = 'snips_tailor_phone'

export type GenderMode = 'male' | 'female' | 'both'
export type MeasurementUnit = 'inches' | 'cm'

export type PreferencesContextType = {
  genderMode: GenderMode
  setGenderMode: (mode: GenderMode) => void
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
  measurementUnit: MeasurementUnit
  setMeasurementUnit: (unit: MeasurementUnit) => void
  tailorName: string
  setTailorName: (name: string) => void
  shopName: string
  setShopName: (name: string) => void
  tailorPhone: string
  setTailorPhone: (phone: string) => void
}

export const PreferencesContext = createContext<PreferencesContextType | null>(null)

export function usePreferences( ){
    const context = useContext(PreferencesContext)
    if (!context) {
        throw new Error("usePreferences MUST be used inside PreferencesProvider")
    }
    return context
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [genderMode, setGenderModeState] = useState<GenderMode>('both')
  const [isDarkMode, setIsDarkModeState] = useState(false)
  const [measurementUnit, setMeasurementUnitState] = useState<MeasurementUnit>('inches')
  const [tailorName, setTailorNameState] = useState('')
  const [shopName, setShopNameState] = useState('')
  const [tailorPhone, setTailorPhoneState] = useState('')

  useEffect(() => {
    async function loadPreferences() {
      const [
        storedGender,
        storedDark,
        storedUnit,
        storedName,
        storedShop,
        storedPhone,
      ] = await Promise.all([
        AsyncStorage.getItem(GENDER_MODE_KEY),
        AsyncStorage.getItem(DARK_MODE_KEY),
        AsyncStorage.getItem(MEASUREMENT_UNIT_KEY),
        AsyncStorage.getItem(TAILOR_NAME_KEY),
        AsyncStorage.getItem(SHOP_NAME_KEY),
        AsyncStorage.getItem(TAILOR_PHONE_KEY),
      ])

      if (storedGender) setGenderModeState(storedGender as GenderMode)
      if (storedDark) setIsDarkModeState(storedDark === 'true')
      if (storedUnit) setMeasurementUnitState(storedUnit as MeasurementUnit)
      if (storedName) setTailorNameState(storedName)
      if (storedShop) setShopNameState(storedShop)
      if (storedPhone) setTailorPhoneState(storedPhone)
    }
    loadPreferences()
  }, [])

  function setGenderMode(mode: GenderMode) {
    setGenderModeState(mode)
    AsyncStorage.setItem(GENDER_MODE_KEY, mode)
  }

  function setIsDarkMode(value: boolean) {
    setIsDarkModeState(value)
    AsyncStorage.setItem(DARK_MODE_KEY, String(value))
  }

  function setMeasurementUnit(unit: MeasurementUnit) {
    setMeasurementUnitState(unit)
    AsyncStorage.setItem(MEASUREMENT_UNIT_KEY, unit)
  }

  function setTailorName(name: string) {
    setTailorNameState(name)
    AsyncStorage.setItem(TAILOR_NAME_KEY, name)
  }

  function setShopName(name: string) {
    setShopNameState(name)
    AsyncStorage.setItem(SHOP_NAME_KEY, name)
  }

  function setTailorPhone(phone: string) {
    setTailorPhoneState(phone)
    AsyncStorage.setItem(TAILOR_PHONE_KEY, phone)
  }

  return (
    <PreferencesContext.Provider value={{
      genderMode, setGenderMode,
      isDarkMode, setIsDarkMode,
      measurementUnit, setMeasurementUnit,
      tailorName, setTailorName,
      shopName, setShopName,
      tailorPhone, setTailorPhone,
    }}>
      {children}
    </PreferencesContext.Provider>
  )
}
