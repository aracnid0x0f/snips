import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Menu } from 'lucide-react-native'
import { Colors, Fonts, Spacing } from '@/constants/theme'
import { Image } from 'react-native'


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
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: 30, height: 30, borderRadius: 6 }}
      />
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
          <Menu size={28} color={Colors.brand.text} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 24,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  searchInput: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
    padding: 0,
  },
  hamburger: {
    padding: Spacing.xs,
  },
})
