import React, { useState, useEffect } from "react";
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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "../../contexts/UserContext";
import {
  getChatMessages,
  sendMessage,
  deleteMessage,
} from "../../api/chats";
import Toast from "react-native-toast-message";

const ChatScreen = ({ route, navigation }) => {
  const { token, user } = useUser();
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (token && chatId) loadMessages();
    }, [token, chatId])
  );

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await getChatMessages(token, chatId);
      const formattedMessages = response.messages.map((msg) => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.sender_id === user.id ? "me" : "other",
        timestamp: msg.created_at,
        file: msg.file || null, // si backend retorna archivo
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudieron cargar los mensajes",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensaje de texto
  const handleSend = async () => {
    if (inputText.trim() === "" || !token || !chatId || sending) return;

    try {
      setSending(true);
      const response = await sendMessage(token, chatId, inputText.trim());
      const newMessage = {
        id: response.message.id.toString(),
        text: response.message.content,
        sender: "me",
        timestamp: response.message.created_at,
      };
      setMessages((prev) => [newMessage, ...prev]);
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No se pudo enviar el mensaje",
      });
    } finally {
      setSending(false);
    }
  };

  // Eliminar mensaje
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
              type: "success",
              text1: "Mensaje eliminado",
            });
          } catch (error) {
            console.error("Error deleting message:", error);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "No se pudo eliminar el mensaje",
            });
          }
        },
      },
    ]);
  };

  // Subir imagen desde galería
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const newMessage = {
        id: Date.now().toString(),
        sender: "me",
        image: uri,
        text: null,
      };
      setMessages((prev) => [newMessage, ...prev]);
    }
  };

  // Subir archivo (PDF, DOC, etc.)
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (result.type === "success") {
      const newMessage = {
        id: Date.now().toString(),
        sender: "me",
        file: result,
        text: null,
      };
      setMessages((prev) => [newMessage, ...prev]);
    }
  };

  // Render de mensaje
  const renderMessage = ({ item }) => {
    const isMine = item.sender === "me";
    const timestamp = new Date(item.timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        onLongPress={() => handleDeleteMessage(item.id)}
        activeOpacity={0.8}
        style={[
          styles.messageBubble,
          isMine ? styles.myMessage : styles.otherMessage,
        ]}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : item.file ? (
          <View style={styles.fileContainer}>
            <MaterialIcons name="insert-drive-file" size={28} color="#fff" />
            <Text
              style={[
                styles.fileName,
                { color: isMine ? "#fff" : "#111" },
              ]}
              numberOfLines={1}
            >
              {item.file.name || "Archivo adjunto"}
            </Text>
          </View>
        ) : (
          <Text
            style={[
              styles.messageText,
              isMine && { color: "#fff" },
            ]}
          >
            {item.text}
          </Text>
        )}
        <Text
          style={[
            styles.timestamp,
            isMine ? styles.myTimestamp : styles.otherTimestamp,
          ]}
        >
          {timestamp}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🧭 Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#10B981" />
        </TouchableOpacity>
        <Text style={styles.chatName}>{route.params?.chatName || "Chat"}</Text>
      </View>

      {/* 💬 Chat principal */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={[...messages].reverse()}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        {/* ✏️ Input + botones */}
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handlePickImage} style={styles.plusButton}>
            <Ionicons name="image" size={22} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickFile} style={styles.plusButton}>
            <Ionicons name="attach" size={22} color="#10B981" />
          </TouchableOpacity>

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
  },
  messageBubble: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginVertical: 6,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
  imagePreview: {
    width: 180,
    height: 180,
    borderRadius: 10,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fileName: {
    fontSize: 14,
    flexShrink: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  plusButton: {
    padding: 6,
    marginRight: 4,
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
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  myTimestamp: {
    color: "#E0F2F1",
    textAlign: "right",
  },
  otherTimestamp: {
    color: "#9CA3AF",
    textAlign: "left",
  },
});
