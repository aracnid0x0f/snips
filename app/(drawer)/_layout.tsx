import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {Image } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Drawer } from 'expo-router/drawer'
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer'
import { MaterialIcons } from '@expo/vector-icons'

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme'
import FAB from '@/components/FAB'

const DRAWER_ITEMS = [
  { label: 'Queue', route: 'index', icon: 'schedule' as const },
  { label: 'Customers', route: 'customers/index', icon: 'people-alt' as const },
  { label: 'Collections', route: 'collections/index', icon: 'inventory-2' as const },
] as const

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerPosition: 'right',
          swipeEnabled: true,
          swipeEdgeWidth: 140,
          swipeMinDistance: 24,
          drawerStyle: {
            backgroundColor: Colors.brand.background,
            width: 284,
          },
          sceneStyle: {
            backgroundColor: Colors.brand.background,
          },
        }}
      >
        <Drawer.Screen name='index' options={{ drawerLabel: 'Queue' }} />
        <Drawer.Screen name='customers/index' options={{ drawerLabel: 'Customers' }} />
        <Drawer.Screen name='customers/create' options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name='collections/index' options={{ drawerLabel: 'Collections' }} />
        <Drawer.Screen name='collections/create' options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name='settings' options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name='customers/[id]' options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name='collections/[id]' options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name='cloths/create' options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name='cloths/[id]' options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
      <FAB />
    </GestureHandlerRootView>
  )
}

function CustomDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const activeKey = state.routeNames[state.index]

  return (
    <View style={styles.drawerRoot}>
      <DrawerContentScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.drawerHeader}>
          {/* <View style={styles.logoBadge}>
            <MaterialIcons name='content-cut' size={20} color='#FFFFFF' />
          </View> */}
          <Image
                source={require('@/assets/images/logo.png')}
                style={{ width: 30, height: 30, borderRadius: 6 }}
              />
          <View style={styles.headerText}>
            <Text style={styles.brandTitle}>Snips</Text>
            <Text style={styles.brandSubtitle}>Tailor flow, organized.</Text>
          </View>
        </View>

        <View style={styles.navGroup}>
          {DRAWER_ITEMS.map((item) => {
            const isActive = activeKey === item.route

            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.navItem, isActive ? styles.navItemActive : null]}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={[styles.iconWrap, isActive ? styles.iconWrapActive : null]}>
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={isActive ? '#FFFFFF' : Colors.brand.text}
                  />
                </View>
                <View style={styles.navTextWrap}>
                  <Text style={[styles.navLabel, isActive ? styles.navLabelActive : null]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.navHint, isActive ? styles.navHintActive : null]}>
                    {getNavHint(item.route)}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navItem, styles.settingsItem, activeKey === 'settings' ? styles.navItemActive : null]}
          onPress={() => navigation.navigate('settings')}
        >
          <View style={[styles.iconWrap, activeKey === 'settings' ? styles.iconWrapActive : null]}>
            <MaterialIcons
              name='settings'
              size={20}
              color={activeKey === 'settings' ? '#FFFFFF' : Colors.brand.text}
            />
          </View>
          <View style={styles.navTextWrap}>
            <Text style={[styles.navLabel, activeKey === 'settings' ? styles.navLabelActive : null]}>
              Settings
            </Text>
            <Text style={[styles.navHint, activeKey === 'settings' ? styles.navHintActive : null]}>
              Preferences and profile
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function getNavHint(route: (typeof DRAWER_ITEMS)[number]['route']) {
  switch (route) {
    case 'index':
      return 'Jobs and due dates'
    case 'customers/index':
      return 'Profiles and measures'
    case 'collections/index':
      return 'Grouped pickups'
  }
}

const styles = StyleSheet.create({
  drawerRoot: {
    flex: 1,
    backgroundColor: Colors.brand.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.xl,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: '#FBF6DE',
    // borderWidth: 1,
    // borderColor: Colors.brand.border,`
  },
  logoBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.primary,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  brandTitle: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.brand.text,
  },
  brandSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: 'rgba(45, 40, 37, 0.72)',
  },
  navGroup: {
    gap: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#FCE3E3',
    borderColor: '#F3B7B7',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF6DE',
    borderWidth: 1,
    borderColor: Colors.brand.border,
  },
  iconWrapActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  navTextWrap: {
    flex: 1,
    gap: 2,
  },
  navLabel: {
    fontFamily: Fonts.display,
    fontSize: 24,
    color: Colors.brand.text,
  },
  navLabelActive: {
    color: Colors.brand.primary,
  },
  navHint: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(45, 40, 37, 0.64)',
  },
  navHintActive: {
    color: 'rgba(228, 54, 54, 0.78)',
  },
  footer: {
    marginTop: 'auto',
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.brand.border,
  },
  settingsItem: {
    backgroundColor: '#FBF6DE',
    // borderColor: Colors.brand.border,
  },
})
