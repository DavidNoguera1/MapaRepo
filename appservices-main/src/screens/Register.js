import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { register as apiRegister } from '../api/auth';
import { useUser } from '../contexts/UserContext';


const Register = () => {
  const navigation = useNavigation();
  const { login } = useUser();
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  const [user_name, setUserName] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (!user_name || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }
    try {
      const data = await apiRegister({
        user_name,
        email,
        password,
        phone: telefono,
        cedula,
      });
      await login(data.user, data.token);
      // On success, navigate to MainTabs
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient
      colors={["#7EC8E3", "#43C6AC"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* Icono eliminado */}
      <Text style={styles.title}>Apprueba</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.buttonInactive} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonTextInactive}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonActive}>
          <Text style={styles.buttonTextActive}>Crear Cuenta</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Nombre de usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre de usuario"
          value={user_name}
          onChangeText={setUserName}
        />
        <View style={styles.row}>
          <View style={styles.inputGroupHalf}>
            <Text style={styles.label}>Número de cédula</Text>
            <TextInput
              style={styles.input}
              placeholder="12345678"
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroupHalf}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="300 000 0000"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Introduce tu contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Vuelve a escribir tu contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Crear Cuenta</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.privacyText}>
        Al continuar aceptas los Términos y la Política de Privacidad.
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginLeft: 10,
  },
  buttonInactive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonTextActive: {
    color: '#43C6AC',
    fontWeight: 'bold',
  },
  buttonTextInactive: {
    color: '#fff',
    fontWeight: 'bold',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroupHalf: {
    flex: 1,
    marginRight: 10,
    marginBottom: 15,
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
    marginBottom: 10,
    color: '#43C6AC',
    backgroundColor: '#F7F7F7',
  },
  registerButton: {
    backgroundColor: '#43C6AC',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
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

export default Register;
