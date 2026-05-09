import { Text, StyleSheet } from 'react-native'

import DrawerScreen from '@/components/DrawerScreen'
import { Colors, Fonts } from '@/constants/theme'

export default function Collections() {
  return (
    <DrawerScreen title='Collections'>
      <Text style={styles.body}>Track grouped pickups and delivery status here.</Text>
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
