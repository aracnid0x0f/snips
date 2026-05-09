import { useCallback, useMemo, useState } from 'react'
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

import DateFieldRow from '@/components/DateFieldRow'
import DrawerScreen from '@/components/DrawerScreen'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import {
  CreateCloth,
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
  gender: 'female' | 'male' | 'both'
  age_group: 'adult' | 'child'
  created_at: string
}

type MeasurementRecord = Record<string, string | number | null>

type ClothRecord = {
  id: number
  title: string
  status: 'untouched' | 'cut' | 'sewn' | 'ready' | 'overdue'
  due_date: string | null
}

const FEMALE_MEASUREMENT_FIELDS = [
  'bust',
  'waist',
  'hip',
  'shoulder_width',
  'sleeve_length',
  'back_length',
  'dress_length',
  'neck',
  'blouse_length',
  'under_bust',
  'arm_round',
] as const

const MALE_MEASUREMENT_FIELDS = [
  'chest',
  'waist',
  'shoulder_width',
  'sleeve_length',
  'neck',
  'trouser_length',
  'shirt_length',
  'arm_round',
  'ankle',
] as const

const MEASUREMENT_LABELS: Record<string, string> = {
  bust: 'Bust',
  waist: 'Waist',
  hip: 'Hip',
  shoulder_width: 'Shoulder width',
  sleeve_length: 'Sleeve length',
  back_length: 'Back length',
  dress_length: 'Dress length',
  neck: 'Neck',
  blouse_length: 'Blouse length',
  under_bust: 'Under bust',
  arm_round: 'Arm round',
  chest: 'Chest',
  trouser_length: 'Trouser length',
  shirt_length: 'Shirt length',
  ankle: 'Ankle',
}

const STATUS_COLORS: Record<ClothRecord['status'], { bg: string; text: string }> = {
  untouched: { bg: '#E5E7EB', text: '#374151' },
  cut: Colors.status.cut,
  sewn: Colors.status.sewn,
  ready: Colors.status.ready,
  overdue: Colors.status.overdue,
}

const NEW_CLOTH_STATUSES: ClothRecord['status'][] = ['untouched', 'cut', 'sewn', 'ready']

export default function CustomerProfile() {
  const params = useLocalSearchParams<{ id?: string | string[] }>()
  const customerId = Number(Array.isArray(params.id) ? params.id[0] : params.id)

  const [customer, setCustomer] = useState<CustomerRecord | null>(null)
  const [femaleMeasurements, setFemaleMeasurements] = useState<MeasurementRecord | null>(null)
  const [maleMeasurements, setMaleMeasurements] = useState<MeasurementRecord | null>(null)
  const [femaleMeasurementInputs, setFemaleMeasurementInputs] = useState<Record<string, string>>({})
  const [maleMeasurementInputs, setMaleMeasurementInputs] = useState<Record<string, string>>({})
  const [customerNameInput, setCustomerNameInput] = useState('')
  const [customerPhoneInput, setCustomerPhoneInput] = useState('')
  const [customerGenderInput, setCustomerGenderInput] = useState<CustomerRecord['gender']>('female')
  const [customerAgeGroupInput, setCustomerAgeGroupInput] = useState<CustomerRecord['age_group']>('adult')
  const [cloths, setCloths] = useState<ClothRecord[]>([])
  const [isAddingCloth, setIsAddingCloth] = useState(false)
  const [clothTitle, setClothTitle] = useState('')
  const [clothDueDate, setClothDueDate] = useState('')
  const [clothStatus, setClothStatus] = useState<ClothRecord['status']>('untouched')

  const loadCustomerProfile = useCallback(() => {
    if (!Number.isFinite(customerId)) {
      setCustomer(null)
      setFemaleMeasurements(null)
      setMaleMeasurements(null)
      setCloths([])
      return
    }

    const nextCustomer = GetCustomer(customerId) as CustomerRecord | null

    if (!nextCustomer) {
      setCustomer(null)
      setFemaleMeasurements(null)
      setMaleMeasurements(null)
      setCloths([])
      return
    }

    setCustomer(nextCustomer)
    setFemaleMeasurements(
      nextCustomer.gender === 'female' || nextCustomer.gender === 'both'
        ? (getMeasurment('female_measurements', customerId) as MeasurementRecord | null)
        : null
    )
    setMaleMeasurements(
      nextCustomer.gender === 'male' || nextCustomer.gender === 'both'
        ? (getMeasurment('male_measurements', customerId) as MeasurementRecord | null)
        : null
    )
    const nextFemaleMeasurements =
      nextCustomer.gender === 'female' || nextCustomer.gender === 'both'
        ? (getMeasurment('female_measurements', customerId) as MeasurementRecord | null)
        : null
    const nextMaleMeasurements =
      nextCustomer.gender === 'male' || nextCustomer.gender === 'both'
        ? (getMeasurment('male_measurements', customerId) as MeasurementRecord | null)
        : null
    setFemaleMeasurements(nextFemaleMeasurements)
    setMaleMeasurements(nextMaleMeasurements)
    setFemaleMeasurementInputs(buildMeasurementInputs(FEMALE_MEASUREMENT_FIELDS, nextFemaleMeasurements))
    setMaleMeasurementInputs(buildMeasurementInputs(MALE_MEASUREMENT_FIELDS, nextMaleMeasurements))
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

  const title = customer?.name ?? 'Customer profile'

  const measurementSections = useMemo(() => {
    if (!customer) return []

    const sections: {
      title: string
      table: 'female_measurements' | 'male_measurements'
      data: MeasurementRecord | null
      inputs: Record<string, string>
    }[] = []

    if (customer.gender === 'female' || customer.gender === 'both') {
      sections.push({
        title: customer.gender === 'both' ? 'Female measurements' : 'Measurements',
        data: femaleMeasurements,
        table: 'female_measurements',
        inputs: femaleMeasurementInputs,
      })
    }

    if (customer.gender === 'male' || customer.gender === 'both') {
      sections.push({
        title: customer.gender === 'both' ? 'Male measurements' : 'Measurements',
        data: maleMeasurements,
        table: 'male_measurements',
        inputs: maleMeasurementInputs,
      })
    }

    return sections
  }, [customer, femaleMeasurementInputs, femaleMeasurements, maleMeasurementInputs, maleMeasurements])

  function resetClothForm() {
    setClothTitle('')
    setClothDueDate('')
    setClothStatus('untouched')
    setIsAddingCloth(false)
  }

  function handleDeleteCustomer() {
    if (!customer) return

    Alert.alert(
      'Delete customer',
      `Delete ${customer.name} and all linked records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            DeleteCustomer(customer.id)
            router.replace('/(drawer)/customers')
          },
        },
      ]
    )
  }

  function handleSaveCustomerDetails() {
    if (!customer) return

    const trimmedName = customerNameInput.trim()
    const trimmedPhone = customerPhoneInput.trim()

    if (!trimmedName) {
      Alert.alert('Missing customer name', 'Enter a customer name before saving.')
      return
    }

    UpdateCustomer(
      customer.id,
      trimmedName,
      trimmedPhone,
      customerGenderInput,
      customerAgeGroupInput
    )

    loadCustomerProfile()
    Alert.alert('Saved', 'Customer details updated.')
  }

  function handleCreateCloth() {
    if (!customer) return

    const trimmedTitle = clothTitle.trim()

    if (!trimmedTitle) {
      Alert.alert('Missing cloth title', 'Enter a cloth title before saving.')
      return
    }

    const measurementSnapshot = buildMeasurementSnapshot(
      customer,
      parseMeasurementInputs(femaleMeasurementInputs),
      parseMeasurementInputs(maleMeasurementInputs)
    )
    const clothId = Number(
      CreateCloth(customer.id, trimmedTitle, clothStatus, clothDueDate.trim(), measurementSnapshot)
    )

    if (clothStatus !== 'untouched') {
      router.push({
        pathname: '/(drawer)/cloths/[id]',
        params: { id: String(clothId), nextStatus: clothStatus },
      })
    } else {
      router.push(`/(drawer)/cloths/${clothId}`)
    }

    resetClothForm()
  }

  function handleMeasurementChange(
    table: 'female_measurements' | 'male_measurements',
    key: string,
    value: string
  ) {
    if (table === 'female_measurements') {
      setFemaleMeasurementInputs((current) => ({ ...current, [key]: value }))
      return
    }

    setMaleMeasurementInputs((current) => ({ ...current, [key]: value }))
  }

  function handleSaveMeasurements(table: 'female_measurements' | 'male_measurements') {
    if (!customer) return

    const inputs =
      table === 'female_measurements' ? femaleMeasurementInputs : maleMeasurementInputs
    const fields = parseMeasurementInputs(inputs)

    upsertMeasurment(table, customer.id, fields)
    loadCustomerProfile()
    Alert.alert('Saved', 'Measurements updated.')
  }

  if (!Number.isFinite(customerId)) {
    return (
      <DrawerScreen title='Customer profile'>
        <Text style={styles.message}>This customer ID is invalid.</Text>
      </DrawerScreen>
    )
  }

  if (!customer) {
    return (
      <DrawerScreen title='Customer profile'>
        <Text style={styles.message}>Customer not found.</Text>
      </DrawerScreen>
    )
  }

  return (
    <DrawerScreen title={title}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={28}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.card}>
          <View style={styles.headerBlock}>
            <View style={styles.nameRow}>
              <TextInput
                value={customerNameInput}
                onChangeText={setCustomerNameInput}
                placeholder='Customer name'
                placeholderTextColor='rgba(0, 0, 0, 0.35)'
                style={styles.nameInput}
              />
              <View style={styles.headerPills}>
                {(['female', 'male', 'both'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.headerTogglePill,
                      customerGenderInput === option && styles.headerTogglePillActive,
                    ]}
                    onPress={() => setCustomerGenderInput(option)}
                  >
                    <Text
                      style={[
                        styles.headerTogglePillText,
                        customerGenderInput === option && styles.headerTogglePillTextActive,
                      ]}
                    >
                      {option === 'female' ? '♀ Female' : option === 'male' ? '♂ Male' : '♀♂ Both'}
                    </Text>
                  </TouchableOpacity>
                ))}
                {(['adult', 'child'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.headerTogglePill,
                      customerAgeGroupInput === option && styles.headerTogglePillActive,
                    ]}
                    onPress={() => setCustomerAgeGroupInput(option)}
                  >
                    <Text
                      style={[
                        styles.headerTogglePillText,
                        customerAgeGroupInput === option && styles.headerTogglePillTextActive,
                      ]}
                    >
                      {capitalize(option)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TextInput
              value={customerPhoneInput}
              onChangeText={setCustomerPhoneInput}
              placeholder='Phone number'
              placeholderTextColor='rgba(0, 0, 0, 0.35)'
              keyboardType='phone-pad'
              style={styles.phoneInput}
            />
          </View>

          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>Profile</Text>
            <TouchableOpacity
              style={styles.saveSectionButton}
              onPress={handleSaveCustomerDetails}
            >
              <Text style={styles.saveSectionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileRows}>
            <FieldRow label='Phone' value={customerPhoneInput || 'Not added yet'} />
            <FieldRow label='Gender mode' value={capitalize(customerGenderInput)} />
            <FieldRow label='Age group' value={capitalize(customerAgeGroupInput)} />
            <FieldRow label='Created' value={formatDate(customer.created_at)} last />
          </View>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteCustomer}>
            <Text style={styles.deleteButtonText}>Delete customer</Text>
          </TouchableOpacity>
        </View>

        {measurementSections.map((section) => (
          <View key={section.title} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>{section.title}</Text>
              <TouchableOpacity
                style={styles.saveSectionButton}
                onPress={() => handleSaveMeasurements(section.table)}
              >
                <Text style={styles.saveSectionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
            <View>
              {getMeasurementFieldKeys(section.table).map((key, index, list) => (
                <MeasurementInputRow
                  key={key}
                  label={MEASUREMENT_LABELS[key] ?? prettifyKey(key)}
                  value={section.inputs[key] ?? ''}
                  onChangeText={(value) => handleMeasurementChange(section.table, key, value)}
                  last={index === list.length - 1}
                />
              ))}
            </View>
            {section.data ? (
              <Text style={styles.measurementHint}>
                Last saved values are shown above. Clear a field to remove it.
              </Text>
            ) : (
              <Text style={styles.emptyText}>No measurements saved yet.</Text>
            )}
          </View>
        ))}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>Cloths</Text>
            <Text style={styles.countText}>{cloths.length} total</Text>
          </View>

          {cloths.length === 0 ? (
            <Text style={styles.emptyText}>No cloth jobs linked to this customer yet.</Text>
          ) : (
            <View>
              {cloths.map((cloth, index) => (
                <TouchableOpacity
                  key={cloth.id}
                  style={[
                    styles.clothRow,
                    index === cloths.length - 1 && !isAddingCloth ? styles.clothRowLast : null,
                  ]}
                  onPress={() => router.push(`/(drawer)/cloths/${cloth.id}`)}
                >
                  <View style={styles.clothText}>
                    <Text style={styles.clothTitle}>{cloth.title}</Text>
                    <Text
                      style={[
                        styles.clothMeta,
                        cloth.status === 'overdue' ? styles.overdueMeta : null,
                      ]}
                    >
                      {cloth.due_date ? `${formatDate(cloth.due_date)}${cloth.status === 'overdue' ? ' · overdue' : ''}` : 'Due date not set'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: STATUS_COLORS[cloth.status].bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: STATUS_COLORS[cloth.status].text },
                      ]}
                    >
                      {capitalize(cloth.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isAddingCloth ? (
            <View style={styles.addClothForm}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>New cloth</Text>
                <TouchableOpacity onPress={resetClothForm}>
                  <Text style={styles.formCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
              <FieldInput
                label='Cloth type'
                placeholder='e.g. Kaftan, Suit...'
                value={clothTitle}
                onChangeText={setClothTitle}
              />
              <DateFieldRow
                label='Due date'
                value={clothDueDate}
                onChange={setClothDueDate}
              />
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldKey}>Status</Text>
                <View style={styles.pillRow}>
                  {NEW_CLOTH_STATUSES.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.togglePill,
                        clothStatus === status && styles.togglePillActive,
                      ]}
                      onPress={() => setClothStatus(status)}
                    >
                      <Text
                        style={[
                          styles.togglePillText,
                          clothStatus === status && styles.togglePillTextActive,
                        ]}
                      >
                        {capitalize(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCreateCloth}>
                <Text style={styles.primaryButtonText}>Save cloth</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addClothRow} onPress={() => setIsAddingCloth(true)}>
              <View style={styles.addCircle}>
                <Text style={styles.addCircleText}>+</Text>
              </View>
              <Text style={styles.addClothText}>Add cloth</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAwareScrollView>
    </DrawerScreen>
  )
}

function FieldRow({
  label,
  value,
  last = false,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <View style={[styles.fieldRow, last ? styles.fieldRowLast : null]}>
      <Text style={styles.fieldKey}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  )
}

function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder: string
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldKey}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor='rgba(0, 0, 0, 0.4)'
        style={styles.fieldInput}
      />
    </View>
  )
}

function MeasurementInputRow({
  label,
  value,
  onChangeText,
  last = false,
}: {
  label: string
  value: string
  onChangeText: (value: string) => void
  last?: boolean
}) {
  return (
    <View style={[styles.fieldRow, last ? styles.fieldRowLast : null]}>
      <Text style={styles.fieldKey}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder='--'
        placeholderTextColor='rgba(0, 0, 0, 0.35)'
        keyboardType='numeric'
        style={styles.fieldInput}
        textAlignVertical='center'
      />
    </View>
  )
}

function buildMeasurementSnapshot(
  customer: CustomerRecord,
  femaleMeasurements: Record<string, number | null>,
  maleMeasurements: Record<string, number | null>
) {
  return JSON.stringify({
    customerGender: customer.gender,
    female: femaleMeasurements,
    male: maleMeasurements,
    capturedAt: new Date().toISOString(),
  })
}

function buildMeasurementInputs(
  keys: readonly string[],
  data: MeasurementRecord | null
) {
  return Object.fromEntries(
    keys.map((key) => [key, data?.[key] == null ? '' : String(data[key])])
  )
}

function parseMeasurementInputs(inputs: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(inputs).map(([key, value]) => {
      const trimmed = value.trim()
      return [key, trimmed === '' ? null : Number(trimmed)]
    })
  )
}

function getMeasurementFieldKeys(table: 'female_measurements' | 'male_measurements') {
  return table === 'female_measurements'
    ? [...FEMALE_MEASUREMENT_FIELDS]
    : [...MALE_MEASUREMENT_FIELDS]
}

function prettifyKey(value: string) {
  return value
    .split('_')
    .map((part) => capitalize(part))
    .join(' ')
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  message: {
    fontFamily: Fonts.body,
    fontSize: 22,
    color: Colors.brand.text,
  },
  card: {
    backgroundColor: '#FBF6DE',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerBlock: {
    gap: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    display: 'none',
    fontFamily: Fonts.display,
    fontSize: 30,
    color: Colors.brand.text,
  },
  nameInput: {
    minWidth: 180,
    flexShrink: 1,
    paddingVertical: 0,
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.brand.text,
  },
  headerPills: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  headerTogglePill: {
    backgroundColor: '#FFFBEF',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  headerTogglePillActive: {
    backgroundColor: Colors.brand.text,
    borderColor: Colors.brand.text,
  },
  headerTogglePillText: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.82)',
  },
  headerTogglePillTextActive: {
    color: Colors.brand.background,
  },
  phoneInput: {
    paddingVertical: 0,
    fontFamily: Fonts.body,
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.82)',
  },
  profileRows: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 221, 180, 0.8)',
    paddingTop: Spacing.sm,
  },
  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.72)',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: '#991B1B',
  },
  saveSectionButton: {
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#FFFBEF',
  },
  saveSectionButtonText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 221, 180, 0.8)',
  },
  fieldRowLast: {
    borderBottomWidth: 0,
  },
  fieldKey: {
    width: 110,
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.74)',
  },
  fieldValue: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  fieldInput: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 22,
    color: 'rgba(0, 0, 0, 0.78)',
  },
  measurementHint: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.68)',
    marginTop: Spacing.xs,
  },
  countText: {
    fontFamily: Fonts.body,
    fontSize: 19,
    color: 'rgba(0, 0, 0, 0.78)',
  },
  clothRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 221, 180, 0.8)',
  },
  clothRowLast: {
    borderBottomWidth: 0,
  },
  clothText: {
    flex: 1,
    gap: 2,
  },
  clothTitle: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  clothMeta: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.72)',
  },
  overdueMeta: {
    color: '#A32D2D',
  },
  statusPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 15,
  },
  addClothRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  addCircle: {
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.brand.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCircleText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.55)',
  },
  addClothText: {
    fontFamily: Fonts.body,
    fontSize: 19,
    color: 'rgba(0, 0, 0, 0.76)',
  },
  addClothForm: {
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 221, 180, 0.8)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formTitle: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  formCancel: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.72)',
  },
  fieldBlock: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  togglePill: {
    backgroundColor: '#FFFBEF',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  togglePillActive: {
    backgroundColor: Colors.brand.text,
    borderColor: Colors.brand.text,
  },
  togglePillText: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.8)',
  },
  togglePillTextActive: {
    color: Colors.brand.background,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  primaryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: '#FFFFFF',
  },
})
