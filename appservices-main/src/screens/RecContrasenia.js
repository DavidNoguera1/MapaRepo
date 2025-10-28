import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const RecContrasenia = () => {
  const navigation = useNavigation();
  const [cedula1, setCedula1] = useState('');
  const [cedula2, setCedula2] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleContinue = async () => {
    if (!cedula1 || !cedula2) {
      Alert.alert('Error', 'Por favor ingresa tu número de cédula en ambos campos');
      return;
    }
    if (cedula1 !== cedula2) {
      Alert.alert('Error', 'Los números de cédula no coinciden');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const { resetPassword } = await import('../api/auth');
      await resetPassword({ cedula1, cedula2, newPassword });
      Alert.alert('Éxito', 'Contraseña actualizada exitosamente');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#7EC8E3' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#7EC8E3", "#43C6AC"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.container}
        >
          <Text style={styles.title}>Recuperar Contraseña</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Número de cédula</Text>
            <TextInput
              style={styles.input}
              placeholder="12345678"
              value={cedula1}
              onChangeText={setCedula1}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Repetir número de cédula</Text>
            <TextInput
              style={styles.input}
              placeholder="12345678"
              value={cedula2}
              onChangeText={setCedula2}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Introduce la nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.privacyText}>
            Al continuar aceptas los Términos y la Política de Privacidad.
          </Text>
        </LinearGradient>
      </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#43C6AC',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    color: '#43C6AC',
    backgroundColor: '#F7F7F7',
  },
  continueButton: {
    backgroundColor: '#43C6AC',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  privacyText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RecContrasenia;
