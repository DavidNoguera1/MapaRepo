import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { getProfile, updateProfile, updatePassword, deleteAccount } from '../api/user';

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
      const updated = await updateProfile(token, formData);
      updateUser(updated);
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

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.header}>Configuración</Text>
        <Text style={styles.subheader}>Perfil y preferencias</Text>
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
          <Text style={styles.label}>Cédula</Text>
          <TextInput
            style={styles.input}
            value={formData.cedula}
            onChangeText={value => handleChange('cedula', value)}
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
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount} disabled={loading}>
          <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
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
});
