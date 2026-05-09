import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation, DrawerActions } from '@react-navigation/native'
import { Colors, Fonts, Spacing } from '@/constants/theme'

export default function TopBar() {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Snips</Text>
      <View style={styles.right}>
        <TouchableOpacity style={styles.searchBar}>
          <Text style={styles.searchText}>Search customers, cloths...</Text>
        </TouchableOpacity>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.brand.border,
    backgroundColor: Colors.brand.background,
    gap: Spacing.md,
  },
  logo: {
    fontFamily: Fonts.display,
    fontSize: 20,
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
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.brand.text,
    opacity: 0.5,
  },
  hamburger: {
    gap: 4,
    padding: Spacing.xs,
  },
  line: {
    width: 20,
    height: 1.5,
    backgroundColor: Colors.brand.text,
    borderRadius: 2,
  },
})