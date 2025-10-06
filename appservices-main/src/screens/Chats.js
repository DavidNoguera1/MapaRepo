// Nota: La ruta "ChatDetail" debe estar registrada en el stack de navegación.
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const accent = '#1bc47d';
const neutral = '#b0b7c3';

const chats = [
  {
    id: '1',
    name: 'Manitas Express',
    preview: '¡Hola! ¿En qué te ayudo?',
    time: '12:30',
    unread: true,
    avatar: null,
  },
  {
    id: '2',
    name: 'Taller El Rápido',
    preview: 'Puedo pasar mañana',
    time: 'Ayer',
    unread: false,
    avatar: null,
  },
];

export default function Chats({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatRow}
      onPress={() => navigation.navigate('ChatDetail', { chatId: item.id, chatName: item.name })}
      accessibilityLabel={`Open chat ${item.name}`}
    >
      <View style={styles.avatarBox}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImg} />
        ) : (
          <Ionicons name="person-circle-outline" size={48} color={neutral} />
        )}
        {item.unread && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.chatTextBox}>
        <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.chatPreview} numberOfLines={1} ellipsizeMode="tail">{item.preview}</Text>
      </View>
      <View style={styles.chatTimeBox}>
        <Text style={styles.chatTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#f9fcff", "#fff"]} style={styles.bg}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <Text style={styles.subtitle}>Conversaciones con prestadores de servicio</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="home" size={28} color={neutral} />
          <Text style={styles.navLabel}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="message-text-outline" size={28} color={accent} />
          <Text style={[styles.navLabel, { color: accent }]}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Map')}>
          <MaterialCommunityIcons name="map-marker-outline" size={28} color={neutral} />
          <Text style={styles.navLabel}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Favorites')}>
          <MaterialCommunityIcons name="heart-outline" size={28} color={neutral} />
          <Text style={styles.navLabel}>Favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={28} color={neutral} />
          <Text style={styles.navLabel}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    paddingTop: 36,
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#7a8ca3',
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#eaf3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarBox: {
    position: 'relative',
    marginRight: 14,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#eaf3ff',
  },
  unreadDot: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: accent,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatTextBox: {
    flex: 1,
    justifyContent: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  chatPreview: {
    fontSize: 14,
    color: '#b0b7c3',
    marginBottom: 0,
  },
  chatTimeBox: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 54,
  },
  chatTime: {
    fontSize: 13,
    color: '#7a8ca3',
    fontWeight: '500',
  },
  navBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eaf3ff',
    elevation: 8,
    shadowColor: '#eaf3ff',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    color: neutral,
    marginTop: 2,
    fontWeight: '500',
  },
});
