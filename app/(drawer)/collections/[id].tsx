import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Colors, Fonts } from '@/constants/theme'

export default function CollectionDetail() {
  const { id } = useLocalSearchParams()
  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontFamily: Fonts.body, fontSize: 20 }}>Collection {id}</Text>
    </View>
  )
}