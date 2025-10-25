import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../contexts/UserContext";
import { getUserChats, deleteChat } from "../api/chats";
import { SERVER_BASE_URL } from "../api/config";
import Toast from "react-native-toast-message";
import { Swipeable } from "react-native-gesture-handler";

const accent = "#1bc47d";
const neutral = "#b0b7c3";

export default function Chats({ navigation }) {
  const { token } = useUser();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (token) loadChats();
    }, [token])
  );

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await getUserChats(token);
      const list = response.chats || [];
      setChats(list);
      setFilteredChats(list);
    } catch (error) {
      console.error("Error loading chats:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los chats",
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

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = chats.filter((chat) => {
      const participantName = (chat.other_participant_name || "").toLowerCase();
      const creatorName = (chat.creator_name || "").toLowerCase();
      const serviceName = (chat.service_name || "").toLowerCase();
      const query = text.toLowerCase();

      return participantName.includes(query) ||
             creatorName.includes(query) ||
             serviceName.includes(query);
    });
    setFilteredChats(filtered);
  };

  const handleDeleteChat = (id) => {
    Alert.alert("Eliminar chat", "¿Seguro que deseas eliminar este chat?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteChat(token, id);
            setChats((prev) => prev.filter((chat) => chat.id !== id));
            setFilteredChats((prev) => prev.filter((chat) => chat.id !== id));
            Toast.show({
              type: "success",
              text1: "Chat eliminado correctamente",
            });
          } catch (error) {
            console.error("Error deleting chat:", error);
            Toast.show({
              type: "error",
              text1: "Error al eliminar",
              text2: "No se pudo eliminar el chat",
            });
          }
        },
      },
    ]);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "Ahora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000)
      return date.toLocaleDateString("es-ES", { weekday: "short" });
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const renderRightActions = (item) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDeleteChat(item.id)}
    >
      <Ionicons name="trash-outline" size={26} color="#fff" />
      <Text style={styles.deleteText}>Eliminar</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() =>
          navigation.navigate("ChatScreen", {
            chatId: item.id,
            chatName:
              item.other_participant_name || item.creator_name || "Chat",
            participants: item.participants || [],
          })
        }
        onLongPress={() => handleDeleteChat(item.id)}
      >
        <View style={styles.avatarStack}>
          {/* Imagen del servicio */}
          {item.service_image ? (
            <Image
              source={{ uri: `${SERVER_BASE_URL}${item.service_image}` }}
              style={[styles.avatarImage, styles.serviceAvatar]}
            />
          ) : (
            <View
              style={[styles.avatarImage, styles.serviceAvatar, styles.avatarPlaceholder]}
            />
          )}

          {/* Imagen del dueño */}
          {item.other_participant_profile_picture ? (
            <Image
              source={{
                uri: `${SERVER_BASE_URL}${item.other_participant_profile_picture}`,
              }}
              style={[styles.avatarImage, styles.ownerAvatar]}
            />
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={58}
              color={accent}
              style={styles.ownerAvatar}
            />
          )}
        </View>

        <View style={styles.chatContent}>
        <View style={styles.chatTopRow}>
            <View style={styles.chatNameContainer}>
              <Text style={styles.chatName} numberOfLines={1}>
                {item.other_participant_name || item.creator_name || "Chat"}
              </Text>
              {item.service_name && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceNameScroll}>
                  <Text style={styles.serviceName} numberOfLines={1}>
                    {item.service_name}
                  </Text>
                </ScrollView>
              )}
            </View>
            <Text style={styles.chatTime}>
              {item.last_message_time ? formatTime(item.last_message_time) : ""}
            </Text>
          </View>
          <Text style={styles.chatPreview} numberOfLines={1}>
            {item.last_message_content || "Sin mensajes aún"}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
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
      <LinearGradient colors={["#f9fcff", "#ffffff"]} style={styles.bg}>
        <View style={styles.header}>
          <Text style={styles.title}>Chats</Text>
          <Text style={styles.subtitle}>Tus conversaciones recientes</Text>
        </View>

        {/* 🔍 Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Buscar chat o servicio..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <FlatList
          data={filteredChats}
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
            filteredChats.length === 0
              ? styles.emptyListContent
              : styles.listContent
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
    backgroundColor: "#f9fcff",
  },
  bg: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 15,
    color: "#111827",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarStack: {
    width: 60,
    height: 60,
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 30,
  },
  serviceAvatar: {
    position: "absolute",
    top: -5,
    left: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  ownerAvatar: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  avatarPlaceholder: {
    backgroundColor: "#e5f6ee",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatNameContainer: {
    flex: 1,
    maxWidth: "70%",
  },
  chatName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  serviceNameScroll: {
    marginTop: 2,
  },
  serviceName: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  chatPreview: {
    fontSize: 14,
    color: "#7a8ca3",
    marginTop: 3,
  },
  chatTime: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    marginVertical: 10,
    borderRadius: 16,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 100,
  },
});

