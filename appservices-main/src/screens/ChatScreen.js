import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const ChatScreen = ({route, navigation} ) => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hola, ¿en qué puedo ayudarte?", sender: "other" },
    { id: "2", text: "Hola, necesito más información sobre tu servicio.", sender: "me" },
    { id: "3", text: "Claro, ¿qué te gustaría saber?", sender: "other" },
    { id: "4", text: "¿Cuáles son tus tarifas?", sender: "me" },
    { id: "5", text: "Mis tarifas varían según el servicio. ¿Qué necesitas?", sender: "other" },
    { id: "6", text: "Necesito una reparación de plomería.", sender: "me" },
    { id: "7", text: "Perfecto, para reparaciones de plomería, mis tarifas comienzan en $50.", sender: "other" },
  ]);

  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  const renderMessage = ({ item }) => (
    <View
      style={{
        alignSelf: item.sender === "me" ? "flex-end" : "flex-start",
        backgroundColor: item.sender === "me" ? "#DCF8C6" : "#E5E5EA",
        borderRadius: 12,
        padding: 10,
        marginVertical: 4,
        maxWidth: "75%",
      }}
    >
      <Text style={{ color: "#000" }}>{item.text}</Text>
    </View>
  );

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
    {/* Encabezado del chat con botón de volver y nombre del contacto */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
      }}
    >
      {/* Botón de volver */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#10B981" />
      </TouchableOpacity>

      {/* Nombre del chat (desde los parámetros de navegación) */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          color: "#111827",
          marginLeft: 10,
        }}
      >
        {route.params?.chatName || "Chat"}
      </Text>
    </View>

    {/* Contenido principal del chat */}
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
>
  {/* Lista de mensajes */}
  <FlatList
    data={messages}
    renderItem={renderMessage}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{ padding: 12 }}
    showsVerticalScrollIndicator={false}
  />

  {/* Caja de entrada de texto */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      borderTopWidth: 1,
      borderColor: "#E5E7EB",
      backgroundColor: "#fff",
    }}
  >
    <TextInput
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
      }}
      placeholder="Escribe un mensaje..."
      value={inputText}
      onChangeText={setInputText}
      multiline
    />
    <TouchableOpacity onPress={handleSend}>
      <Ionicons name="send" size={24} color="#10B981" />
    </TouchableOpacity>
  </View>
</KeyboardAvoidingView>

  </SafeAreaView>
);

};

export default ChatScreen;
