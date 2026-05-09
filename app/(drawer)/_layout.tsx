import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Drawer } from 'expo-router/drawer'
import { Colors, Fonts } from '@/constants/theme'

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerPosition: 'right',
          drawerStyle: {
            backgroundColor: Colors.brand.background,
            width: 240,
          },
          drawerLabelStyle: {
            fontFamily: Fonts.body,
            fontSize: 16,
            color: Colors.brand.text,
          },
        }}
      >
        <Drawer.Screen name="index" options={{ drawerLabel: 'Queue' }} />
        <Drawer.Screen name="customers/index" options={{ drawerLabel: 'Customers' }} />
        <Drawer.Screen name="collections/index" options={{ drawerLabel: 'Collections' }} />
      </Drawer>
    </GestureHandlerRootView>
  )
}