import { useMemo, useState } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { MaterialIcons } from '@expo/vector-icons'

import { Fonts, Spacing } from '@/constants/theme'

type DateFieldRowProps = {
  label: string
  value: string
  onChange: (value: string) => void
  last?: boolean
}

export default function DateFieldRow({
  label,
  value,
  onChange,
  last = false,
}: DateFieldRowProps) {
  const [showPicker, setShowPicker] = useState(false)

  const selectedDate = useMemo(() => parseIsoDate(value), [value])

  function handleChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS !== 'ios') {
      setShowPicker(false)
    }

    if (event.type !== 'set' || !nextDate) {
      return
    }

    onChange(formatIsoDate(nextDate))
  }

  return (
    <View style={[styles.row, last ? styles.rowLast : null]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueWrap}>
        <TouchableOpacity style={styles.valueButton} onPress={() => setShowPicker(true)}>
          <MaterialIcons name='calendar-month' size={18} color='rgba(0, 0, 0, 0.52)' />
          <Text style={[styles.valueText, !value ? styles.placeholderText : null]}>
            {value ? formatDisplayDate(value) : 'Select date'}
          </Text>
        </TouchableOpacity>
        {value ? (
          <TouchableOpacity onPress={() => onChange('')}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {showPicker ? (
        <DateTimePicker
          value={selectedDate}
          mode='date'
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      ) : null}
    </View>
  )
}

function parseIsoDate(value: string) {
  if (!value) {
    return new Date()
  }

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return new Date()
  }

  return new Date(year, month - 1, day)
}

function formatIsoDate(value: Date) {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return value
  }

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 221, 180, 0.8)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.74)',
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  valueButton: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: 0,
  },
  valueText: {
    fontFamily: Fonts.body,
    fontSize: 19,
    color: 'rgba(0, 0, 0, 0.78)',
  },
  placeholderText: {
    color: 'rgba(0, 0, 0, 0.45)',
  },
  clearText: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: 'rgba(0, 0, 0, 0.68)',
  },
})
