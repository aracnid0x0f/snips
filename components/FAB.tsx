import React, { useEffect } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Pressable,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { 
  Plus, 
  Scissors, 
  Ruler, 
  UserPlus, 
  LayoutGrid 
} from 'lucide-react-native'
import { useFAB } from '@/context/FABContext'
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'

const FAB_OPTIONS = [
  { id: 'cloth', label: 'Cloth', icon: Scissors, route: '/cloths/create' },
  { id: 'measurement', label: 'Measurement', icon: Ruler, route: '/customers' },
  { id: 'customer', label: 'Customer', icon: UserPlus, route: '/customers/create' },
  { id: 'collection', label: 'Collection', icon: LayoutGrid, route: '/collections/create' },
]

export default function FAB() {
  const router = useRouter()
  const { isFABVisible, isFABExpanded, setFABExpanded } = useFAB()
  const animation = React.useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(animation, {
      toValue: isFABExpanded ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start()
  }, [isFABExpanded])

  if (!isFABVisible) return null

  const toggleFAB = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setFABExpanded(!isFABExpanded)
  }

  const handleOptionPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setFABExpanded(false)
    router.push(route as any)
  }

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  return (
    <>
      {isFABExpanded && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setFABExpanded(false)}
        >
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          />
        </Pressable>
      )}

      <View style={styles.container}>
        <View style={styles.optionsContainer}>
          {FAB_OPTIONS.map((option, index) => {
            const translateY = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -10 * (index + 1) - 52 * (index + 1)],
            })

            const scale = animation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.5, 1],
            })

            const opacity = animation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            })

            const Icon = option.icon

            return (
              <Animated.View
                key={option.id}
                style={[
                  styles.optionWrapper,
                  {
                    opacity,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.optionLabel}
                  onPress={() => handleOptionPress(option.route)}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionIcon}
                  onPress={() => handleOptionPress(option.route)}
                >
                  <Icon
                    size={20}
                    color={Colors.brand.text}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </Animated.View>
            )
          })}
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleFAB}
          style={styles.fabButton}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Plus size={32} color="#FFFFFF" strokeWidth={2.5} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  container: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    alignItems: 'flex-end',
  },
  optionWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  optionLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 0.5,
    borderColor: Colors.brand.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionText: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.brand.text,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: Colors.brand.border,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.brand.text,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
})
