import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { uploadProfileImage } from '../api/profile';

const ProfilePhotoScreen = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();
  const { token } = useUser();

  // Pedir permiso y abrir galería
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Necesitas otorgar acceso a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Confirmar y continuar con o sin imagen
  const handleContinue = async () => {
    if (image) {
      setUploading(true);
      try {
        await uploadProfileImage(image, token);
        Alert.alert('Éxito', 'Imagen de perfil subida correctamente');
      } catch (error) {
        Alert.alert('Error', error.message);
        return; // Don't navigate if upload failed
      } finally {
        setUploading(false);
      }
    }
    navigation.replace('MainTabs');
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#7EC8E3", "#43C6AC"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.container}
      >
        <Text style={styles.title}>Foto de perfil</Text>
        <Text style={styles.subtitle}>Puedes agregar una imagen o saltar este paso</Text>

        {/* Vista previa de la imagen */}
        <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Ionicons name="person-circle-outline" size={120} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Botón para añadir foto */}
        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
          <Text style={styles.addButtonText}>
            {image ? 'Cambiar foto' : 'Añadir foto de perfil'}
          </Text>
        </TouchableOpacity>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} disabled={uploading}>
            <Text style={styles.continueText}>
              {uploading ? 'Subiendo...' : 'Guardar y continuar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={uploading}>
            <Text style={styles.skipText}>Omitir este paso y crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    color: '#f0f0f0',
    textAlign: 'center',
    marginBottom: 30,
  },
  imageBox: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 100,
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 30,
  },
  addButtonText: {
    color: '#43C6AC',
    fontWeight: 'bold',
  },
  actions: {
    alignItems: 'center',
    width: '100%',
  },
  continueButton: {
    backgroundColor: '#43C6AC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    marginBottom: 12,
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default ProfilePhotoScreen;
