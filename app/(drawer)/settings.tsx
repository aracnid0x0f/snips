import { View, Text } from 'react-native'
import TopBar from '@/components/TopBar'
import { Colors, Fonts } from '@/constants/theme'

export default function Settings() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand.background }}>
      <TopBar />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: Fonts.body, fontSize: 20 }}>Settings</Text>
      </View>
    </View>
  )
}