import { ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import TopBar from '@/components/TopBar'
import { Colors, Fonts, Spacing } from '@/constants/theme'

type DrawerScreenProps = {
  title: string
  children?: ReactNode
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export default function DrawerScreen({
  title,
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}: DrawerScreenProps) {
  return (
    <View style={styles.screen}>
      <TopBar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 32,
    color: Colors.brand.text,
  },
})
