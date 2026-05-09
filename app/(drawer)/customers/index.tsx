import { useCallback, useState } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import DrawerScreen from '@/components/DrawerScreen'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { CreateCustomer, GetAllCustomers } from '@/db/helpers'

type CustomerRecord = {
  id: number
  name: string
  phone: string | null
  gender: string
  age_group: string
}

const GENDER_OPTIONS = [
  { label: 'Women', value: 'female' },
  { label: 'Men', value: 'male' },
  { label: 'Both', value: 'both' },
] as const

const AGE_GROUP_OPTIONS = [
  { label: 'Adult', value: 'adult' },
  { label: 'Child', value: 'child' },
] as const

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<(typeof GENDER_OPTIONS)[number]['value']>('female')
  const [ageGroup, setAgeGroup] = useState<(typeof AGE_GROUP_OPTIONS)[number]['value']>('adult')

  const loadCustomers = useCallback(() => {
    const rows = GetAllCustomers() as CustomerRecord[]
    setCustomers(rows)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadCustomers()
    }, [loadCustomers])
  )

  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return true
    }

    return [customer.name, customer.phone ?? '', customer.gender, customer.age_group]
      .some((value) => value.toLowerCase().includes(query))
  })

  function handleCreateCustomer() {
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedName) {
      Alert.alert('Missing name', 'Enter a customer name before saving.')
      return
    }

    const id = Number(CreateCustomer(trimmedName, trimmedPhone, gender, ageGroup))

    setName('')
    setPhone('')
    setGender('female')
    setAgeGroup('adult')
    loadCustomers()
    router.push(`/(drawer)/customers/${id}`)
  }

  return (
    <DrawerScreen
      title='Customers'
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder='Search customers by name or phone...'
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={24}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add customer</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder='Customer name'
            placeholderTextColor='rgba(0, 0, 0, 0.45)'
            style={styles.input}
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
                  onPress={() => setGender(option.value)}
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
                  onPress={() => setAgeGroup(option.value)}
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
            <Text style={styles.primaryButtonText}>Save customer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Customer list</Text>
          <Text style={styles.countText}>{filteredCustomers.length} total</Text>
        </View>

        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {customers.length === 0 ? 'No customers yet' : 'No matching customers'}
            </Text>
            <Text style={styles.emptyBody}>
              {customers.length === 0
                ? 'Add your first customer to start saving measurements and jobs.'
                : 'Try another name, phone number, or filter term.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredCustomers.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                style={styles.customerRow}
                onPress={() => router.push(`/(drawer)/customers/${customer.id}`)}
              >
                <View style={styles.customerText}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerMeta}>
                    {formatMeta(customer.gender, customer.age_group, customer.phone)}
                  </Text>
                </View>
                <Text style={styles.rowAction}>Open</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </KeyboardAwareScrollView>
    </DrawerScreen>
  )
}

function formatMeta(gender: string, ageGroup: string, phone: string | null) {
  const parts = [capitalize(gender), capitalize(ageGroup)]

  if (phone) {
    parts.push(phone)
  }

  return parts.join(' • ')
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: '#FBF6DE',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.brand.text,
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
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.md,
    minHeight: 50,
    paddingHorizontal: Spacing.lg,
  },
  primaryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: '#FFFFFF',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  countText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 251, 239, 0.7)',
  },
  emptyTitle: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.brand.text,
  },
  emptyBody: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
  },
  list: {
    gap: Spacing.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: '#FFFBEF',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
  },
  customerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  customerName: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.brand.text,
  },
  customerMeta: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.75)',
  },
  rowAction: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.primary,
  },
})
