import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../contexts/UserContext';
import { getProfile, updateProfile, updatePassword, deleteAccount } from '../api/user';
import { uploadProfileImage } from '../api/profile';
import { SERVER_BASE_URL } from '../api/config';

export default function Settings() {
  const navigation = useNavigation();
  const { user, token, logout, updateUser } = useUser();

  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    phone: '',
    cedula: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());

  useEffect(() => {
    if (user) {
      setFormData({
        user_name: user.user_name || '',
        email: user.email || '',
        phone: user.phone || '',
        cedula: user.cedula || '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await updateProfile(token, formData);
      updateUser(response.user);
      // Update form data to reflect changes
      setFormData({
        user_name: response.user.user_name || '',
        email: response.user.email || '',
        phone: response.user.phone || '',
        cedula: response.user.cedula || '',
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      Alert.alert('Error', 'La nueva contraseña y su confirmación no coinciden');
      return;
    }
    if (!passwords.currentPassword || !passwords.newPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos de contraseña');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(token, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      Alert.alert('Éxito', 'Contraseña actualizada correctamente');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount(token);
              Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada correctamente');
              logout();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

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
      setUploadingImage(true);
      try {
        await uploadProfileImage(result.assets[0].uri, token);
        Alert.alert('Éxito', 'Imagen de perfil actualizada correctamente');
        // Refresh user data
        const updatedUser = await getProfile(token);
        updateUser(updatedUser);
        // Force image re-render
        setImageKey(Date.now());
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.header}>Configuración</Text>
        <Text style={styles.subheader}>Perfil y preferencias</Text>

        {/* Profile Image Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Foto de Perfil</Text>
          <View style={styles.profileImageContainer}>
            {user?.profile_picture_url ? (
              <Image
                key={imageKey}
                source={{ uri: `${SERVER_BASE_URL}${user.profile_picture_url}` }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person-circle-outline" size={80} color="#64748B" />
              </View>
            )}
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
              disabled={uploadingImage}
            >
              <Text style={styles.changeImageText}>
                {uploadingImage ? 'Subiendo...' : 'Cambiar foto'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput
            style={styles.input}
            value={formData.user_name}
            onChangeText={value => handleChange('user_name', value)}
            placeholder="Nombre de usuario"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={value => handleChange('email', value)}
            placeholder="tucorreo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={value => handleChange('phone', value)}
            placeholder="300 000 0000"
            keyboardType="phone-pad"
          />
          {/* Cédula no editable */}
          <Text style={styles.label}>Cédula</Text>
          <TextInput
            style={[styles.input, { backgroundColor: '#F0F0F0', color: '#999' }]}
            value={formData.cedula}
            editable={false}
            placeholder="12345678"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={loading}>
            <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
          <Text style={styles.label}>Contraseña actual</Text>
          <TextInput
            style={styles.input}
            value={passwords.currentPassword}
            onChangeText={value => handlePasswordChange('currentPassword', value)}
            placeholder="Contraseña actual"
            secureTextEntry
          />
          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={passwords.newPassword}
            onChangeText={value => handlePasswordChange('newPassword', value)}
            placeholder="Nueva contraseña"
            secureTextEntry
          />
          <Text style={styles.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={styles.input}
            value={passwords.confirmNewPassword}
            onChangeText={value => handlePasswordChange('confirmNewPassword', value)}
            placeholder="Confirmar nueva contraseña"
            secureTextEntry
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={loading}>
            <Text style={styles.saveButtonText}>{loading ? 'Cambiando...' : 'Cambiar Contraseña'}</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={loading}>
            <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1E293B',
  },
  subheader: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#1E293B',
    backgroundColor: '#F7F7F7',
  },
  saveButton: {
    backgroundColor: '#43C6AC',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  deleteButton: {
    backgroundColor: '#F87171',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 30,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#F87171',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeImageButton: {
    backgroundColor: '#43C6AC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeImageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bottomButtons: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    backgroundColor: '#F8FAFC',
  },
});
