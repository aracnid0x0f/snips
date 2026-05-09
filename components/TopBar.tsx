import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Fonts, Spacing } from '@/constants/theme'

type TopBarProps = {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export default function TopBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search customers, cloths...',
}: TopBarProps) {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <Text style={styles.logo}>Snips</Text>
      <View style={styles.right}>
        <View style={styles.searchBar}>
          <TextInput
            value={searchValue}
            onChangeText={onSearchChange}
            placeholder={searchPlaceholder}
            placeholderTextColor='rgba(0, 0, 0, 0.5)'
            editable={Boolean(onSearchChange)}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.hamburger}
        >
          <View style={styles.line} />
          <View style={styles.line} />
          <View style={styles.line} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.border,
    backgroundColor: Colors.brand.background,
    gap: Spacing.md,
  },
  logo: {
    fontFamily: Fonts.display,
    fontSize: 30,
    color: Colors.brand.text,
  },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    backgroundColor: Colors.brand.border,
    borderRadius: 24,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  searchInput: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: Colors.brand.text,
    padding: 0,
  },
  hamburger: {
    gap: 5,
    padding: Spacing.sm,
  },
  line: {
    width: 24,
    height: 2.5,
    backgroundColor: Colors.brand.text,
    borderRadius: 2,
  },
})
