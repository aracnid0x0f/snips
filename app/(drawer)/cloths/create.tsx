import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import TopBar from '@/components/TopBar'

export default function CreateClothPage() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <TopBar />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.brand.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Cloth</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>Cloth creation flow coming soon...</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.brand.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
  },
})
