import { useCallback, useMemo, useState } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { 
  Contact, 
  ChevronUp, 
  ChevronDown, 
  PlusCircle, 
  Venus, 
  Mars 
} from 'lucide-react-native'

import DrawerScreen from '@/components/DrawerScreen'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import { GetAllCustomers, GetClothByCustomer } from '@/db/helpers'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

type CustomerRecord = {
  id: number
  name: string
  phone: string | null
  gender: 'female' | 'male'
  age_group: 'adult' | 'child'
}

type ClothRecord = {
  id: number
  title: string
  status: 'untouched' | 'cut' | 'sewn' | 'ready' | 'overdue'
  due_date: string | null
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  untouched: { bg: '#E5E7EB', text: '#374151' },
  cut: Colors.status.cut,
  sewn: Colors.status.sewn,
  ready: Colors.status.ready,
  overdue: Colors.status.overdue,
}

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [activeCloths, setPlatformActiveCloths] = useState<Record<number, ClothRecord[]>>({})

  const loadCustomers = useCallback(() => {
    const rows = GetAllCustomers() as CustomerRecord[]
    setCustomers(rows)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadCustomers()
    }, [loadCustomers])
  )

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return customers

    return customers.filter((customer) =>
      [customer.name, customer.phone ?? '', customer.gender, customer.age_group]
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [customers, search])

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    if (expandedId === id) {
      setExpandedId(null)
    } else {
      setExpandedId(id)
      const cloths = GetClothByCustomer(id) as ClothRecord[]
      const onlyActive = cloths.filter(c => c.status !== 'ready')
      setPlatformActiveCloths(prev => ({ ...prev, [id]: onlyActive }))
    }
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
                ? 'Add your first customer using the FAB button below.'
                : 'Try another name, phone number, or filter term.'}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredCustomers.map((customer) => (
              <View key={customer.id} style={styles.customerCard}>
                <TouchableOpacity
                  style={styles.customerRow}
                  onPress={() => toggleExpand(customer.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.customerText}>
                    <Text style={styles.customerName}>{customer.name}</Text>
                    <View style={styles.metaRow}>
                       {customer.gender === 'female' ? (
                         <Venus size={16} color={Colors.brand.secondary} />
                       ) : (
                         <Mars size={16} color={Colors.brand.secondary} />
                       )}
                      <Text style={styles.customerMeta}>
                        {formatMeta(customer.gender, customer.age_group, customer.phone)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity 
                        onPress={() => router.push(`/(drawer)/customers/${customer.id}`)}
                        style={styles.iconCircleBtn}
                    >
                        <Contact size={26} color={Colors.brand.text} strokeWidth={1.5} />
                    </TouchableOpacity>
                    {expandedId === customer.id ? (
                      <ChevronUp size={28} color={Colors.brand.text} />
                    ) : (
                      <ChevronDown size={28} color={Colors.brand.text} />
                    )}
                  </View>
                </TouchableOpacity>

                {expandedId === customer.id && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.subLabel}>Active Cloths</Text>
                    {(activeCloths[customer.id]?.length ?? 0) === 0 ? (
                      <Text style={styles.emptySubText}>No active jobs for this customer.</Text>
                    ) : (
                      activeCloths[customer.id].map(cloth => (
                        <TouchableOpacity 
                          key={cloth.id} 
                          style={styles.clothItem}
                          onPress={() => router.push(`/(drawer)/cloths/${cloth.id}`)}
                        >
                          <Text style={styles.clothTitle}>{cloth.title}</Text>
                          <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[cloth.status]?.bg ?? '#eee' }]}>
                            <Text style={[styles.statusText, { color: STATUS_COLORS[cloth.status]?.text ?? '#333' }]}>
                              {cloth.status.toUpperCase()}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                    <TouchableOpacity 
                      style={styles.addClothSmall}
                      onPress={() => router.push('/cloths/create')}
                    >
                      <PlusCircle size={24} color={Colors.brand.primary} strokeWidth={2} />
                      <Text style={styles.addClothSmallText}>New Cloth</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </KeyboardAwareScrollView>
    </DrawerScreen>
  )
}

function formatMeta(gender: string, ageGroup: string, phone: string | null) {
  const parts = [capitalize(ageGroup)]
  if (phone) parts.push(phone)
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
  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.brand.text,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  countText: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.secondary,
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyTitle: {
    fontFamily: Fonts.display,
    fontSize: 26,
    color: Colors.brand.text,
  },
  emptyBody: {
    fontFamily: Fonts.body,
    fontSize: 22,
    color: Colors.brand.text,
  },
  list: {
    gap: Spacing.md,
  },
  customerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  customerText: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontFamily: Fonts.display,
    fontSize: 30,
    color: Colors.brand.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customerMeta: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.secondary,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircleBtn: {
    padding: 4,
  },
  expandedContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    borderTopWidth: 0.5,
    borderTopColor: Colors.brand.border,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  subLabel: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.brand.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  clothItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(226, 221, 180, 0.8)',
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
  },
  emptySubText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.secondary,
    fontStyle: 'italic',
  },
  addClothSmall: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  addClothSmallText: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.primary,
  }
})
