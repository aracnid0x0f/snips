import React, { useState } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Haptics from 'expo-haptics'

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { CreateCustomer } from '@/db/helpers'
import TopBar from '@/components/TopBar'

const GENDER_OPTIONS = [
  { label: 'Women', value: 'female' },
  { label: 'Men', value: 'male' },
  { label: 'Both', value: 'both' },
] as const

const AGE_GROUP_OPTIONS = [
  { label: 'Adult', value: 'adult' },
  { label: 'Child', value: 'child' },
] as const

export default function CreateCustomerPage() {
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<(typeof GENDER_OPTIONS)[number]['value']>('female')
  const [ageGroup, setAgeGroup] = useState<(typeof AGE_GROUP_OPTIONS)[number]['value']>('adult')

  function handleCreateCustomer() {
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName) {
      Alert.alert('Missing name', 'Enter a customer name before saving.')
      return
    }

    try {
      const id = Number(CreateCustomer(trimmedName, trimmedPhone, gender as any, ageGroup))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      
      setName('')
      setPhone('')
      setGender('female')
      setAgeGroup('adult')
      
      router.replace(`/(drawer)/customers/${id}`)
    } catch (error) {
      console.error('Failed to create customer:', error)
      Alert.alert('Error', 'Failed to create customer record.')
    }
  }

  return (
    <View style={styles.container}>
      <TopBar />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.brand.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Customer</Text>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={100}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.card}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder='Customer name'
            placeholderTextColor='rgba(0, 0, 0, 0.45)'
            style={styles.input}
            autoFocus
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder='Phone number'
            placeholderTextColor='rgba(0, 0, 0, 0.45)'
            keyboardType='phone-pad'
            style={styles.input}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender mode</Text>
            <View style={styles.pillRow}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pill,
                    gender === option.value && styles.pillSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setGender(option.value)
                  }}
                >
                  <Text
                    style={[
                      styles.pillText,
                      gender === option.value && styles.pillTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Age group</Text>
            <View style={styles.pillRow}>
              {AGE_GROUP_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pill,
                    ageGroup === option.value && styles.pillSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setAgeGroup(option.value)
                  }}
                >
                  <Text
                    style={[
                      styles.pillText,
                      ageGroup === option.value && styles.pillTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateCustomer}>
            <Text style={styles.primaryButtonText}>Create Customer →</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.hint}>
          Measurements and cloths can be added from the customer profile after creation.
        </Text>
      </KeyboardAwareScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.brand.text,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: '#FBF6DE',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F6EFD2', 
    fontSize: 16,
    color: Colors.brand.text,
    fontFamily: Fonts.body,
  },
  fieldGroup: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFBEF',
  },
  pillSelected: {
    backgroundColor: Colors.brand.text,
    borderColor: Colors.brand.text,
  },
  pillText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
  },
  pillTextSelected: {
    color: Colors.brand.background,
  },
  primaryButton: {
    marginTop: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.text,
    borderRadius: Radius.md,
    minHeight: 50,
    paddingHorizontal: Spacing.lg,
  },
  primaryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: '#FFFFFF',
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  }
})
