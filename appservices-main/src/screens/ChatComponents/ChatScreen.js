import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { getChatMessages, sendMessage, markMessageAsRead, deleteMessage } from '../../api/chats';
import Toast from 'react-native-toast-message';

const ChatScreen = ({ route, navigation }) => {
  const { token, user } = useUser();
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (token && chatId) {
        loadMessages();
      }
    }, [token, chatId])
  );

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getChatMessages(token, chatId);
      const formattedMessages = response.messages.map(msg => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.sender_id === user.id ? 'me' : 'other',
        timestamp: msg.created_at
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los mensajes',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enviar mensaje
  const handleSend = async () => {
    if (inputText.trim() === "" || !token || !chatId || sending) return;

    try {
      setSending(true);
      const response = await sendMessage(token, chatId, inputText.trim());

      // Agregar el mensaje enviado a la lista local
      const newMessage = {
        id: response.message.id.toString(),
        text: response.message.content,
        sender: 'me',
        timestamp: response.message.created_at
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText("");
    } catch (error) {
      console.error('Error sending message:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo enviar el mensaje',
      });
    } finally {
      setSending(false);
    }
  };

  // ✅ Eliminar mensaje
  const handleDeleteMessage = (id) => {
    Alert.alert("Eliminar mensaje", "¿Seguro que quieres eliminar este mensaje?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMessage(token, id);
            setMessages((prev) => prev.filter((m) => m.id !== id));
            Toast.show({
              type: 'success',
              text1: 'Mensaje eliminado',
              text2: 'El mensaje fue eliminado correctamente',
            });
          } catch (error) {
            console.error('Error deleting message:', error);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'No se pudo eliminar el mensaje',
            });
          }
        }
      },
    ]);
  };

  // ✅ Mostrar mensaje (base visual ya lista)
  const renderMessage = ({ item }) => (
    <TouchableOpacity
      onLongPress={() => handleDeleteMessage(item.id)} // ← Acción eliminar
      activeOpacity={0.8}
      style={[
        styles.messageBubble,
        item.sender === "me" ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={[styles.messageText, item.sender === "me" && { color: "#fff" }]}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 🧭 Encabezado del chat */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#10B981" />
        </TouchableOpacity>
        <Text style={styles.chatName}>{route.params?.chatName || "Chat"}</Text>
      </View>

      {/* 💬 Contenedor principal del chat */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* 📜 Mostrar mensajes */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          inverted
        />

        {/* ✏️ Caja para escribir y enviar mensajes */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    elevation: 2,
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 10,
  },
  chatArea: {
    flex: 1,
    justifyContent: "space-between",
  },
  messageList: {
    padding: 14,
    paddingBottom: 80,
  },
  messageBubble: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginVertical: 4,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  myMessage: {
    backgroundColor: "#10B981",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#E5E5EA",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "#111",
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: "#F3F4F6",
    color: "#111",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#10B981",
    borderRadius: 24,
    padding: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
});
