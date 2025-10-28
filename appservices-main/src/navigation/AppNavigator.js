import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import Home from '../screens/Home';
import Chats from '../screens/Chats';
import ChatScreen from '../screens/ChatComponents/ChatScreen';
import Map from '../screens/Map';
import Myservices from '../screens/Myservices';
import Settings from '../screens/Settings';
import Login from '../screens/Login';
import ProfilePhoto from '../screens/ProfilePhoto';
import Register from '../screens/Register';
import RecContrasenia from '../screens/RecContrasenia';


import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarShowIcon: true,
        tabBarIndicatorStyle: { backgroundColor: '#1bc47d' },
        tabBarActiveTintColor: '#1bc47d',
        tabBarInactiveTintColor: '#b0b7c3',
        tabBarLabelStyle: { fontWeight: 'bold', fontSize: 12 },
        tabBarStyle: { backgroundColor: '#fff', elevation: 4 },
        tabBarIcon: ({ color }) => {
          switch (route.name) {
            case 'Home':
              return <MaterialCommunityIcons name="home" size={22} color={color} />;
            case 'Chats':
              return <MaterialCommunityIcons name="message-text-outline" size={22} color={color} />;
            case 'Map':
              return <MaterialCommunityIcons name="map-marker-outline" size={22} color={color} />;
            case 'MyServices':
              return <MaterialCommunityIcons name="briefcase-outline" size={22} color={color} />;
            case 'Settings':
              return <Ionicons name="settings-outline" size={22} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Chats" component={Chats} options={{ tabBarLabel: 'Chats' }} />
      <Tab.Screen name="Map" component={Map} options={{ tabBarLabel: 'Mapa' }} />
      <Tab.Screen name="MyServices" component={Myservices} options={{ tabBarLabel: 'Mis servicios' }} />
      <Tab.Screen name="Settings" component={Settings} options={{ tabBarLabel: 'Ajustes' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="RecContrasenia" component={RecContrasenia} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ProfilePhoto" component={ProfilePhoto} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
