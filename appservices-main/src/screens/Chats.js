import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { getUserChats } from '../api/chats';
import Toast from 'react-native-toast-message';

const accent = '#1bc47d';
const neutral = '#b0b7c3';

export default function Chats({ navigation }) {
  const { token } = useUser();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (token) loadChats();
    }, [token])
  );

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await getUserChats(token);
      setChats(response.chats || []);
    } catch (error) {
      console.error('Error loading chats:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los chats',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return date.toLocaleDateString('es-ES', { weekday: 'short' });
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() =>
        navigation.navigate('ChatScreen', {
          chatId: item.id,
          chatName: item.other_participant_name || item.creator_name || 'Chat',
          participants: item.participants || [],
        })
      }
    >
      <View style={styles.avatarBox}>
        <Ionicons name="person-circle-outline" size={56} color={accent} />
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
        <Text style={styles.chatName} numberOfLines={1}>
          {item.other_participant_name || item.creator_name || 'Chat'}
        </Text>
          <Text style={styles.chatTime}>
            {item.last_message_time ? formatTime(item.last_message_time) : ''}
          </Text>
        </View>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {item.last_message_content || 'Sin mensajes aún'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={90} color={neutral} />
      <Text style={styles.emptyTitle}>No hay conversaciones</Text>
      <Text style={styles.emptySubtitle}>
        Cuando inicies un chat con un prestador de servicios, aparecerá aquí.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#f9fcff', '#ffffff']} style={styles.bg}>
        <View style={styles.header}>
          <Text style={styles.title}>Chats</Text>
          <Text style={styles.subtitle}>Tus conversaciones recientes</Text>
        </View>

        <FlatList
          data={chats}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[accent]}
              tintColor={accent}
            />
          }
          contentContainerStyle={
            chats.length === 0 ? styles.emptyListContent : styles.listContent
          }
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fcff',
  },
  bg: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#e6f7ee',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    maxWidth: '70%',
  },
  chatPreview: {
    fontSize: 14,
    color: '#7a8ca3',
    marginTop: 3,
  },
  chatTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
});

