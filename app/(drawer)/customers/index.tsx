import { View, Text } from 'react-native'
import { Colors, Fonts } from '@/constants/theme'

export default function Customers() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontFamily: Fonts.body, fontSize: 20 }}>Customers</Text>
    </View>
  )
}