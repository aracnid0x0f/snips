import { useCallback, useEffect, useState } from 'react'
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
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { MaterialIcons } from '@expo/vector-icons'

import DateFieldRow from '@/components/DateFieldRow'
import DrawerScreen from '@/components/DrawerScreen'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import {
  DeleteCloth,
  GetClothById,
  GetCustomer,
  UpdateCloth,
  UpdateClothStatus,
} from '@/db/helpers'

type ClothRecord = {
  id: number
  customer_id: number
  title: string
  status: 'untouched' | 'cut' | 'sewn' | 'ready' | 'overdue'
  due_date: string | null
  fabric_photo_uri: string | null
  design_ref_uri: string | null
  measurement_snapshot: string | null
  created_at: string
}

type CustomerRecord = {
  id: number
  name: string
}

type SnapshotShape = {
  customerGender?: 'female' | 'male' | 'both'
  female?: Record<string, number | null>
  male?: Record<string, number | null>
  capturedAt?: string
}

const STATUS_OPTIONS: ClothRecord['status'][] = ['untouched', 'cut', 'sewn', 'ready', 'overdue']
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

export default function ClothDetail() {
  const params = useLocalSearchParams<{ id?: string | string[]; nextStatus?: string | string[] }>()
  const clothId = Number(Array.isArray(params.id) ? params.id[0] : params.id)
  const nextStatus = Array.isArray(params.nextStatus) ? params.nextStatus[0] : params.nextStatus

  const [cloth, setCloth] = useState<ClothRecord | null>(null)
  const [customer, setCustomer] = useState<CustomerRecord | null>(null)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<ClothRecord['status']>('cut')
  const [fabricPhotoUri, setFabricPhotoUri] = useState('')
  const [designRefUri, setDesignRefUri] = useState('')
  const [snapshotGender, setSnapshotGender] = useState<'female' | 'male' | 'both'>('both')
  const [femaleSnapshotInputs, setFemaleSnapshotInputs] = useState<Record<string, string>>({})
  const [maleSnapshotInputs, setMaleSnapshotInputs] = useState<Record<string, string>>({})

  const loadCloth = useCallback(() => {
    if (!Number.isFinite(clothId)) {
      setCloth(null)
      setCustomer(null)
      return
    }

    const nextCloth = GetClothById(clothId) as ClothRecord | null

    if (!nextCloth) {
      setCloth(null)
      setCustomer(null)
      return
    }

    setCloth(nextCloth)
    setCustomer((GetCustomer(nextCloth.customer_id) as CustomerRecord | null) ?? null)
    setTitle(nextCloth.title)
    setDueDate(nextCloth.due_date ?? '')
    setStatus(nextCloth.status)
    setFabricPhotoUri(nextCloth.fabric_photo_uri ?? '')
    setDesignRefUri(nextCloth.design_ref_uri ?? '')
    const snapshot = parseMeasurementSnapshot(nextCloth.measurement_snapshot)
    setSnapshotGender(snapshot.customerGender ?? inferSnapshotGender(snapshot))
    setFemaleSnapshotInputs(buildMeasurementInputs(FEMALE_MEASUREMENT_FIELDS, snapshot.female))
    setMaleSnapshotInputs(buildMeasurementInputs(MALE_MEASUREMENT_FIELDS, snapshot.male))
  }, [clothId])

  useFocusEffect(
    useCallback(() => {
      loadCloth()
    }, [loadCloth])
  )

  useEffect(() => {
    if (!nextStatus || !clothId || !STATUS_OPTIONS.includes(nextStatus as ClothRecord['status'])) {
      return
    }

    UpdateClothStatus(clothId, nextStatus as ClothRecord['status'])
    loadCloth()
  }, [nextStatus, clothId, loadCloth])

  function handleSave() {
    if (!cloth) return

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      Alert.alert('Missing cloth title', 'Enter a cloth title before saving.')
      return
    }

    UpdateCloth(
      cloth.id,
      trimmedTitle,
      status,
      dueDate.trim(),
      fabricPhotoUri,
      designRefUri,
      JSON.stringify({
        customerGender: snapshotGender,
        female: parseMeasurementInputs(femaleSnapshotInputs),
        male: parseMeasurementInputs(maleSnapshotInputs),
        capturedAt: new Date().toISOString(),
      })
    )

    loadCloth()
    Alert.alert('Saved', 'Cloth job updated.')
  }

  function handleDelete() {
    if (!cloth) return

    Alert.alert('Delete cloth', `Delete ${cloth.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          DeleteCloth(cloth.id)
          if (customer) {
            router.replace(`/(drawer)/customers/${customer.id}`)
            return
          }
          router.replace('/(drawer)')
        },
      },
    ])
  }

  function handlePhotoOptions(kind: 'fabric' | 'design') {
    Alert.alert(
      kind === 'fabric' ? 'Fabric photo' : 'Design reference',
      'Choose an image source.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => void pickImage(kind, 'camera') },
        { text: 'Library', onPress: () => void pickImage(kind, 'library') },
        ...(getPhotoUri(kind) ? [{ text: 'Remove', style: 'destructive' as const, onPress: () => setPhotoUri(kind, '') }] : []),
      ]
    )
  }

  async function pickImage(kind: 'fabric' | 'design', source: 'camera' | 'library') {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      Alert.alert('Permission required', `Allow ${source} access to attach images.`)
      return
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
          })

    if (result.canceled || !result.assets[0]?.uri) {
      return
    }

    setPhotoUri(kind, result.assets[0].uri)
  }

  function setPhotoUri(kind: 'fabric' | 'design', uri: string) {
    if (kind === 'fabric') {
      setFabricPhotoUri(uri)
      return
    }

    setDesignRefUri(uri)
  }

  function getPhotoUri(kind: 'fabric' | 'design') {
    return kind === 'fabric' ? fabricPhotoUri : designRefUri
  }

  if (!Number.isFinite(clothId)) {
    return (
      <DrawerScreen title='Cloth'>
        <Text style={styles.message}>This cloth ID is invalid.</Text>
      </DrawerScreen>
    )
  }

  if (!cloth) {
    return (
      <DrawerScreen title='Cloth'>
        <Text style={styles.message}>Cloth not found.</Text>
      </DrawerScreen>
    )
  }

  return (
    <DrawerScreen title='Cloth detail'>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={24}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>Overview</Text>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: STATUS_COLORS[status].bg },
              ]}
            >
              <Text style={[styles.statusText, { color: STATUS_COLORS[status].text }]}>
                {capitalize(status)}
              </Text>
            </View>
          </View>

          <FieldInput label='Cloth type' value={title} onChangeText={setTitle} placeholder='Cloth title' />
          <DateFieldRow label='Due date' value={dueDate} onChange={setDueDate} />
          <FieldRow label='Customer' value={customer?.name ?? 'Unknown customer'} last />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.pillRow}>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.togglePill,
                  status === option && styles.togglePillActive,
                ]}
                onPress={() => {
                  setStatus(option)
                  UpdateClothStatus(cloth.id, option)
                }}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    status === option && styles.togglePillTextActive,
                  ]}
                >
                  {capitalize(option)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Measurement snapshot</Text>
          {(snapshotGender === 'female' || snapshotGender === 'both') ? (
            <View style={styles.snapshotSection}>
              <Text style={styles.snapshotTitle}>
                {snapshotGender === 'both' ? 'Female measurements' : 'Measurements'}
              </Text>
              {FEMALE_MEASUREMENT_FIELDS.map((key, index) => (
                <MeasurementInputRow
                  key={key}
                  label={MEASUREMENT_LABELS[key]}
                  value={femaleSnapshotInputs[key] ?? ''}
                  onChangeText={(value) =>
                    setFemaleSnapshotInputs((current) => ({ ...current, [key]: value }))
                  }
                  last={index === FEMALE_MEASUREMENT_FIELDS.length - 1}
                />
              ))}
            </View>
          ) : null}
          {(snapshotGender === 'male' || snapshotGender === 'both') ? (
            <View style={styles.snapshotSection}>
              <Text style={styles.snapshotTitle}>
                {snapshotGender === 'both' ? 'Male measurements' : 'Measurements'}
              </Text>
              {MALE_MEASUREMENT_FIELDS.map((key, index) => (
                <MeasurementInputRow
                  key={key}
                  label={MEASUREMENT_LABELS[key]}
                  value={maleSnapshotInputs[key] ?? ''}
                  onChangeText={(value) =>
                    setMaleSnapshotInputs((current) => ({ ...current, [key]: value }))
                  }
                  last={index === MALE_MEASUREMENT_FIELDS.length - 1}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>References</Text>
          <PhotoField
            label='Fabric photo'
            uri={fabricPhotoUri}
            onPress={() => handlePhotoOptions('fabric')}
          />
          <PhotoField
            label='Design ref'
            uri={designRefUri}
            onPress={() => handlePhotoOptions('design')}
            last
          />
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
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

function PhotoField({
  label,
  uri,
  onPress,
  last = false,
}: {
  label: string
  uri: string
  onPress: () => void
  last?: boolean
}) {
  return (
    <TouchableOpacity style={[styles.photoRow, last ? styles.fieldRowLast : null]} onPress={onPress}>
      <Text style={styles.fieldKey}>{label}</Text>
      <View style={styles.photoContent}>
        {uri ? <Image source={{ uri }} style={styles.photoPreview} contentFit='cover' /> : null}
        <View style={styles.photoMeta}>
          <Text style={styles.fieldValue}>{uri ? 'Attached' : 'Add photo'}</Text>
          <Text style={styles.photoHint}>{uri ? 'Tap to change or remove' : 'Tap to open camera or library'}</Text>
        </View>
        <MaterialIcons name='photo-camera' size={20} color='rgba(45, 40, 37, 0.72)' />
      </View>
    </TouchableOpacity>
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
      />
    </View>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function parseMeasurementSnapshot(value: string | null): SnapshotShape {
  if (!value) {
    return {}
  }

  try {
    return JSON.parse(value) as SnapshotShape
  } catch {
    return {}
  }
}

function inferSnapshotGender(snapshot: SnapshotShape) {
  const hasFemale = Object.values(snapshot.female ?? {}).some((value) => value !== null)
  const hasMale = Object.values(snapshot.male ?? {}).some((value) => value !== null)

  if (hasFemale && hasMale) return 'both'
  if (hasFemale) return 'female'
  if (hasMale) return 'male'
  return 'both'
}

function buildMeasurementInputs(
  keys: readonly string[],
  data?: Record<string, number | null>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
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
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.58)',
  },
  fieldValue: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
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
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.68)',
  },
  togglePillTextActive: {
    color: Colors.brand.background,
  },
  statusPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: Fonts.body,
    fontSize: 13,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  snapshotSection: {
    gap: Spacing.xs,
  },
  snapshotTitle: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.72)',
    marginBottom: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  primaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.brand.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: '#FFFFFF',
  },
  deleteButton: {
    minHeight: 46,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  deleteButtonText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: '#991B1B',
  },
  photoRow: {
    gap: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 221, 180, 0.8)',
  },
  photoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  photoPreview: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: '#EFE7C8',
  },
  photoMeta: {
    flex: 1,
    gap: 2,
  },
  photoHint: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.6)',
  },
})
