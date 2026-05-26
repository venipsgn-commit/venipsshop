import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CatalogueScreen from '../screens/CatalogueScreen';
import ProductScreen from '../screens/ProductScreen';
import CartScreen from '../screens/CartScreen';
import AccountScreen from '../screens/AccountScreen';
import WishlistScreen from '../screens/WishlistScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useCart } from '../context/CartContext';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>;
}

function CartIcon({ icon, focused }: { icon: string; focused: boolean }) {
  const { totalItems } = useCart();
  return (
    <View>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
      {totalItems > 0 && (
        <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: '#14b8a6', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{totalItems > 9 ? '9+' : totalItems}</Text>
        </View>
      )}
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Connexion"   component={LoginScreen} />
      <Stack.Screen name="Inscription" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#f3f4f6', height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#14b8a6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -2 },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }}
      />
      <Tab.Screen
        name="Catalogue"
        component={CatalogueScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🔍" focused={focused} /> }}
      />
      <Tab.Screen
        name="Panier"
        component={CartScreen}
        options={{ tabBarIcon: ({ focused }) => <CartIcon icon="🛒" focused={focused} /> }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="❤️" focused={focused} /> }}
      />
      <Tab.Screen
        name="Compte"
        component={AccountStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Venips', headerStyle: { backgroundColor: '#020B3A' }, headerTintColor: '#00D8D8', headerTitleStyle: { fontWeight: '900', fontSize: 22 } }} />
      <Stack.Screen name="Produit" component={ProductScreen} options={{ title: '', headerStyle: { backgroundColor: '#fff' }, headerShadowVisible: false }} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MonCompte" component={AccountScreen} options={{ title: 'Mon Compte', headerStyle: { backgroundColor: '#020B3A' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: '700' } }} />
      <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false, presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Auth" component={AuthStack} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Produit" component={ProductScreen} options={{ headerShown: true, title: '', headerStyle: { backgroundColor: '#fff' }, headerShadowVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
