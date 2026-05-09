import { Text, StyleSheet } from 'react-native'

import DrawerScreen from '@/components/DrawerScreen'
import { Colors, Fonts } from '@/constants/theme'

export default function Settings() {
  return (
    <DrawerScreen title='Settings'>
      <Text style={styles.body}>Preferences, tailoring details, and app controls belong here.</Text>
    </DrawerScreen>
  )
}

const styles = StyleSheet.create({
  body: {
    fontFamily: Fonts.body,
    fontSize: 22,
    color: Colors.brand.text,
  },
})
