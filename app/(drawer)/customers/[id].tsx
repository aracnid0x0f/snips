import { useCallback, useMemo, useState, useRef } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as Haptics from 'expo-haptics'

import DrawerScreen from '@/components/DrawerScreen'
import MeasurementField from '@/components/MeasurementField'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { femaleMeasurements as FEMALE_FIELDS, maleMeasurements as MALE_FIELDS } from '@/constants/measurements'
import {
  DeleteCustomer,
  GetClothByCustomer,
  GetCustomer,
  UpdateCustomer,
  getMeasurment,
  upsertMeasurment,
} from '@/db/helpers'

type CustomerRecord = {
  id: number
  name: string
  phone: string | null
  gender: 'female' | 'male'
  age_group: 'adult' | 'child'
  created_at: string
}

type MeasurementRecord = Record<string, any>

type ClothRecord = {
  id: number
  title: string
  status: 'untouched' | 'cut' | 'sewn' | 'ready' | 'overdue'
  due_date: string | null
}

const STATUS_COLORS: Record<ClothRecord['status'], { bg: string; text: string }> = {
  untouched: { bg: '#E5E7EB', text: '#374151' },
  cut: Colors.status.cut,
  sewn: Colors.status.sewn,
  ready: Colors.status.ready,
  overdue: Colors.status.overdue,
}

export default function CustomerProfile() {
  const params = useLocalSearchParams<{ id?: string | string[] }>()
  const customerId = Number(Array.isArray(params.id) ? params.id[0] : params.id)

  const [customer, setCustomer] = useState<CustomerRecord | null>(null)
  const [measurements, setMeasurements] = useState<MeasurementRecord | null>(null)
  const [measurementInputs, setMeasurementInputs] = useState<Record<string, string>>({})
  
  const [customerNameInput, setCustomerNameInput] = useState('')
  const [customerPhoneInput, setCustomerPhoneInput] = useState('')
  const [customerGenderInput, setCustomerGenderInput] = useState<CustomerRecord['gender']>('female')
  const [customerAgeGroupInput, setCustomerAgeGroupInput] = useState<CustomerRecord['age_group']>('adult')
  
  const [cloths, setCloths] = useState<ClothRecord[]>([])

  const inputRefs = useRef<Record<string, TextInput | null>>({})

  const loadCustomerProfile = useCallback(() => {
    if (!Number.isFinite(customerId)) return

    const nextCustomer = GetCustomer(customerId) as CustomerRecord | null
    if (!nextCustomer) {
      setCustomer(null)
      return
    }

    setCustomer(nextCustomer)
    const table = nextCustomer.gender === 'female' ? 'female_measurements' : 'male_measurements'
    const nextMeasurements = getMeasurment(table, customerId) as MeasurementRecord | null
    
    setMeasurements(nextMeasurements)
    
    // Build initial inputs
    const fields = nextCustomer.gender === 'female' ? FEMALE_FIELDS : MALE_FIELDS
    const initialInputs: Record<string, string> = {}
    fields.forEach(f => {
      initialInputs[f.key] = nextMeasurements?.[f.key] != null ? String(nextMeasurements[f.key]) : ''
    })
    setMeasurementInputs(initialInputs)

    setCustomerNameInput(nextCustomer.name)
    setCustomerPhoneInput(nextCustomer.phone ?? '')
    setCustomerGenderInput(nextCustomer.gender)
    setCustomerAgeGroupInput(nextCustomer.age_group)
    setCloths((GetClothByCustomer(customerId) as ClothRecord[]) ?? [])
  }, [customerId])

  useFocusEffect(
    useCallback(() => {
      loadCustomerProfile()
    }, [loadCustomerProfile])
  )

  const sortedFields = useMemo(() => {
    if (!customer) return []
    const fields = customer.gender === 'female' ? FEMALE_FIELDS : MALE_FIELDS
    
    const filled = fields.filter(f => measurementInputs[f.key] !== '')
    const blank = fields.filter(f => measurementInputs[f.key] === '')
    
    return [...filled, ...blank]
  }, [customer, measurementInputs])

  const handleMeasurementChange = (key: string, value: string) => {
    setMeasurementInputs(prev => ({ ...prev, [key]: value }))
  }

  const saveMeasurement = (key: string) => {
    if (!customer) return
    const table = customer.gender === 'female' ? 'female_measurements' : 'male_measurements'
    const value = measurementInputs[key].trim()
    const numericValue = value === '' ? null : Number(value)

    // Only update if value changed to save DB cycles
    if (measurements?.[key] === numericValue) return

    upsertMeasurment(table, customer.id, { [key]: numericValue })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const focusNextField = (index: number) => {
    const nextField = sortedFields[index + 1]
    if (nextField) {
      inputRefs.current[nextField.key]?.focus()
    }
  }

  function handleDeleteCustomer() {
    if (!customer) return
    Alert.alert('Delete customer', `Delete ${customer.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        DeleteCustomer(customer.id)
        router.replace('/(drawer)/customers')
      }}
    ])
  }

  function handleSaveCustomerDetails() {
    if (!customer) return
    UpdateCustomer(customer.id, customerNameInput.trim(), customerPhoneInput.trim(), customerGenderInput, customerAgeGroupInput)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    loadCustomerProfile()
  }

  if (!customer) return null

  return (
    <DrawerScreen title={customer.name}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <TextInput
            value={customerNameInput}
            onChangeText={setCustomerNameInput}
            style={styles.nameInput}
            placeholder="Name"
          />
          <TextInput
            value={customerPhoneInput}
            onChangeText={setCustomerPhoneInput}
            style={styles.phoneInput}
            placeholder="Phone"
            keyboardType="phone-pad"
          />
          <View style={styles.headerPills}>
            <TouchableOpacity 
              onPress={handleSaveCustomerDetails}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Measurement Section */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Measurements ({customer.gender})</Text>
          <View style={styles.measurementList}>
            {sortedFields.map((field, index) => (
              <MeasurementField
                key={field.key}
                ref={el => (inputRefs.current[field.key] = el)}
                label={field.label}
                value={measurementInputs[field.key]}
                onChangeText={val => handleMeasurementChange(field.key, val)}
                onBlur={() => saveMeasurement(field.key)}
                onSubmitEditing={() => focusNextField(index)}
                last={index === sortedFields.length - 1}
              />
            ))}
          </View>
        </View>

        {/* Cloths Section */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Cloths</Text>
          {cloths.map(cloth => (
            <TouchableOpacity key={cloth.id} style={styles.clothRow} onPress={() => router.push(`/(drawer)/cloths/${cloth.id}`)}>
              <Text style={styles.clothTitle}>{cloth.title}</Text>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[cloth.status].bg }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[cloth.status].text }]}>{cloth.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addClothBtn} onPress={() => router.push('/cloths/create')}>
            <Text style={styles.addClothText}>+ New Cloth</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteCustomer}>
          <Text style={styles.deleteBtnText}>Delete Customer</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </DrawerScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FBF6DE',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.brand.border,
  },
  nameInput: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.brand.text,
    marginBottom: Spacing.xs,
  },
  phoneInput: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  measurementList: {
    marginTop: -Spacing.md,
  },
  clothRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.brand.border,
  },
  clothTitle: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
  },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  addClothBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  addClothText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.brand.primary,
  },
  saveBtn: {
    backgroundColor: Colors.brand.text,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  saveBtnText: {
    fontFamily: Fonts.body,
    color: Colors.brand.background,
    fontSize: 14,
  },
  headerPills: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  deleteBtnText: {
    fontFamily: Fonts.body,
    color: '#E43636',
    fontSize: 16,
  },
})
