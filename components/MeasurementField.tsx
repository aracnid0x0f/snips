import React, { forwardRef } from 'react'
import { StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'

interface MeasurementFieldProps extends TextInputProps {
  label: string
  last?: boolean
}

const MeasurementField = forwardRef<TextInput, MeasurementFieldProps>(
  ({ label, last = false, ...props }, ref) => {
    return (
      <View style={[styles.container, last && styles.last]}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={styles.input}
          placeholder="—"
          placeholderTextColor="rgba(0,0,0,0.3)"
          keyboardType="decimal-pad"
          returnKeyType={last ? 'done' : 'next'}
          textAlignVertical="center"
          {...props}
        />
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.brand.border,
    gap: Spacing.md,
  },
  last: {
    borderBottomWidth: 0,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: 'rgba(0,0,0,0.5)',
    width: 120,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.brand.text,
    padding: 0,
  },
})

export default MeasurementField
