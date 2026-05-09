import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { ArrowLeft, Save } from 'lucide-react-native'
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
          <ArrowLeft size={28} color={Colors.brand.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Cloth</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholder}>Cloth creation flow coming soon...</Text>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => console.log('Save cloth')}
        >
          <Save size={28} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.primaryButtonText}>Save Cloth</Text>
        </TouchableOpacity>
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
    fontSize: 32,
    color: Colors.brand.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  placeholder: {
    fontFamily: Fonts.body,
    fontSize: 22,
    color: Colors.brand.text,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#166534',
    borderRadius: Radius.md,
    minHeight: 60,
    width: '100%',
  },
  primaryButtonText: {
    fontFamily: Fonts.body,
    fontSize: 22,
    color: '#FFFFFF',
  },
})
