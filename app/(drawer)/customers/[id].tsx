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
import { 
  Save, 
  Trash2, 
  UserRound, 
  Baby, 
  Venus, 
  Mars, 
  PlusCircle 
} from 'lucide-react-native'

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
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
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
            </View>
            <TouchableOpacity 
              onPress={handleSaveCustomerDetails}
              style={styles.iconActionBtn}
            >
              <Save size={28} color="#166534" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <View style={styles.selectorsRow}>
            <View style={styles.selectorGroup}>
              {(['female', 'male'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    setCustomerGenderInput(option)
                  }}
                  style={[styles.selectorBtn, customerGenderInput === option && styles.selectorBtnActive]}
                >
                  {option === 'female' ? (
                    <Venus size={22} color={customerGenderInput === option ? Colors.brand.background : Colors.brand.text} />
                  ) : (
                    <Mars size={22} color={customerGenderInput === option ? Colors.brand.background : Colors.brand.text} />
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
                    setCustomerAgeGroupInput(option)
                  }}
                  style={[styles.selectorBtn, customerAgeGroupInput === option && styles.selectorBtnActive]}
                >
                  {option === 'adult' ? (
                    <UserRound size={22} color={customerAgeGroupInput === option ? Colors.brand.background : Colors.brand.text} />
                  ) : (
                    <Baby size={22} color={customerAgeGroupInput === option ? Colors.brand.background : Colors.brand.text} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Measurement Section */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Measurements</Text>
          <View style={styles.measurementList}>
            {sortedFields.map((field, index) => (
              <MeasurementField
                key={field.key}
                ref={(el) => (inputRefs.current[field.key] = el)}
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
          <View style={styles.headerRow}>
            <Text style={styles.sectionLabel}>Cloths</Text>
            <TouchableOpacity onPress={() => router.push('/cloths/create')}>
              <PlusCircle size={28} color={Colors.brand.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {cloths.map(cloth => (
            <TouchableOpacity key={cloth.id} style={styles.clothRow} onPress={() => router.push(`/(drawer)/cloths/${cloth.id}`)}>
              <Text style={styles.clothTitle}>{cloth.title}</Text>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[cloth.status].bg }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[cloth.status].text }]}>{cloth.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.deleteIconButton} onPress={handleDeleteCustomer}>
          <Trash2 size={24} color="#E43636" strokeWidth={2} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.brand.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  nameInput: {
    fontFamily: Fonts.display,
    fontSize: 40,
    color: Colors.brand.text,
    marginBottom: 0,
  },
  phoneInput: {
    fontFamily: Fonts.body,
    fontSize: 22,
    color: Colors.brand.secondary,
    marginBottom: Spacing.md,
  },
  iconActionBtn: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.brand.border,
  },
  selectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: Colors.brand.border,
    paddingTop: Spacing.md,
  },
  selectorGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  selectorBtn: {
    width: 42,
    height: 42,
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
  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  measurementList: {
    marginTop: Spacing.xs,
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
    fontSize: 22,
    color: Colors.brand.text,
  },
  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  deleteIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  deleteBtnText: {
    fontFamily: Fonts.body,
    color: '#E43636',
    fontSize: 18,
  },
})
