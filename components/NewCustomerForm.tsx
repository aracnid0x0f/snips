import React, { useState, useRef, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { CreateCustomer } from '@/db/helpers'
import { useFAB } from '@/context/FABContext'

type Gender = 'female' | 'male'
type AgeGroup = 'adult' | 'child'

export default function NewCustomerForm() {
  const router = useRouter()
  const { closeFlow } = useFAB()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<Gender>('female')
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult')

  const phoneRef = useRef<TextInput>(null)

  const handleCreate = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }

    try {
      const customerId = CreateCustomer(name, phone, gender, ageGroup)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      closeFlow()
      router.push(`/customers/${customerId}`)
    } catch (error) {
      console.error('Failed to create customer:', error)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  }

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.form}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Name</Text>
          <TextInput
            style={styles.fieldVal}
            placeholder="Full name"
            placeholderTextColor="rgba(0,0,0,0.3)"
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Phone</Text>
          <TextInput
            ref={phoneRef}
            style={styles.fieldVal}
            placeholder="080..."
            placeholderTextColor="rgba(0,0,0,0.3)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Gender</Text>
          <View style={styles.pillContainer}>
            <TouchableOpacity
              style={[styles.pill, gender === 'female' && styles.pillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setGender('female')
              }}
            >
              <Text style={[styles.pillText, gender === 'female' && styles.pillTextActive]}>
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, gender === 'male' && styles.pillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setGender('male')
              }}
            >
              <Text style={[styles.pillText, gender === 'male' && styles.pillTextActive]}>
                Male
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldKey}>Age group</Text>
          <View style={styles.pillContainer}>
            <TouchableOpacity
              style={[styles.pill, ageGroup === 'adult' && styles.pillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setAgeGroup('adult')
              }}
            >
              <Text style={[styles.pillText, ageGroup === 'adult' && styles.pillTextActive]}>
                Adult
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pill, ageGroup === 'child' && styles.pillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                setAgeGroup('child')
              }}
            >
              <Text style={[styles.pillText, ageGroup === 'child' && styles.pillTextActive]}>
                Child
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.hint}>
          Measurements and cloths can be added from the customer profile.
        </Text>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCreate}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Create Customer →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.brand.border,
  },
  fieldKey: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(0,0,0,0.5)',
    width: 100,
  },
  fieldVal: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
    padding: 0,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    borderColor: Colors.brand.border,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pillActive: {
    backgroundColor: Colors.brand.text,
    borderColor: Colors.brand.text,
  },
  pillText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
  },
  pillTextActive: {
    color: Colors.brand.background,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(0,0,0,0.4)',
    marginTop: Spacing.md,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: Colors.brand.text,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitButtonText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.background,
    fontWeight: '500',
  },
})
