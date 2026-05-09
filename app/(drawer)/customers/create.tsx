import React, { useState } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Haptics from 'expo-haptics'
import { 
  ArrowLeft, 
  Save, 
  Venus, 
  Mars, 
  UserRound, 
  Baby 
} from 'lucide-react-native'

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { CreateCustomer } from '@/db/helpers'
import TopBar from '@/components/TopBar'

type Gender = 'female' | 'male'
type AgeGroup = 'adult' | 'child'

export default function CreateCustomerPage() {
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<Gender>('female')
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult')

  function handleCreateCustomer() {
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName) {
      Alert.alert('Missing name', 'Enter a customer name before saving.')
      return
    }

    try {
      const id = Number(CreateCustomer(trimmedName, trimmedPhone, gender, ageGroup))
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
          <ArrowLeft size={28} color={Colors.brand.text} />
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

          <View style={styles.selectorsRow}>
            <View style={styles.selectorGroup}>
              {(['female', 'male'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setGender(option)
                  }}
                  style={[styles.selectorBtn, gender === option && styles.selectorBtnActive]}
                >
                  {option === 'female' ? (
                    <Venus size={24} color={gender === option ? Colors.brand.background : Colors.brand.text} />
                  ) : (
                    <Mars size={24} color={gender === option ? Colors.brand.background : Colors.brand.text} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.selectorGroup}>
              {(['adult', 'child'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setAgeGroup(option)
                  }}
                  style={[styles.selectorBtn, ageGroup === option && styles.selectorBtnActive]}
                >
                  {option === 'adult' ? (
                    <UserRound size={24} color={ageGroup === option ? Colors.brand.background : Colors.brand.text} />
                  ) : (
                    <Baby size={24} color={ageGroup === option ? Colors.brand.background : Colors.brand.text} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateCustomer}>
            <Save size={28} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.primaryButtonText}>Create Customer</Text>
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
    fontSize: 32,
    color: Colors.brand.text,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  input: {
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.border,
    fontSize: 22,
    color: Colors.brand.text,
    fontFamily: Fonts.body,
    paddingVertical: Spacing.xs,
  },
  selectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  selectorGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  selectorBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.border,
  },
  selectorBtnActive: {
    backgroundColor: Colors.brand.text,
    borderColor: Colors.brand.text,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#166534', // Green for Save/Create
    borderRadius: Radius.md,
    minHeight: 60,
    marginTop: Spacing.md,
  },
  primaryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 22,
    color: '#FFFFFF',
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0,0,0,0.4)',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  }
})
