import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { usePreferences } from '@/context/PreferencesContext'
import type { GenderMode } from '@/context/PreferencesContext'
import { Colors, Fonts, Spacing, Radius } from '@/constants/theme'

export default function Onboarding() {
  const { setGenderMode } = usePreferences()
  const [selected, setSelected] = useState<GenderMode | null>(null)

  async function handleDone() {
    if (!selected) return
    setGenderMode(selected)
    await AsyncStorage.setItem('onboarding_done', 'true')
    router.replace('/(drawer)')
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.logo}>Snips</Text>
        <Text style={styles.subtitle}>Who do you sew for?</Text>
      </View>

      <View style={styles.options}>
        {(['female', 'male', 'both'] as GenderMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.option, selected === mode && styles.optionSelected]}
            onPress={() => setSelected(mode)}
          >
            <Text style={[styles.optionText, selected === mode && styles.optionTextSelected]}>
              {mode === 'female' ? 'Women only' : mode === 'male' ? 'Men only' : 'Both'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleDone}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Get started</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.background,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  top: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    fontFamily: Fonts.display,
    fontSize: 48,
    color: Colors.brand.text,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  options: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  option: {
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: Colors.brand.text,
    borderColor: Colors.brand.text,
  },
  optionText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
  },
  optionTextSelected: {
    color: Colors.brand.background,
  },
  button: {
    backgroundColor: Colors.brand.primary,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: '#fff',
  },
})
