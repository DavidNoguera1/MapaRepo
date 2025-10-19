
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { login as apiLogin } from '../api/auth';
import { useUser } from '../contexts/UserContext';


const Login = () => {
  const navigation = useNavigation();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }
    try {
      const data = await apiLogin({ email, password });
      await login(data.user, data.token);
      // On success, navigate to MainTabs
      navigation.replace('MainTabs');
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
          <View style={styles.iconContainer}>
            {/* Aquí puedes poner tu icono, por ejemplo usando react-native-vector-icons */}
          </View>
          <Text style={styles.title}>Apprueba</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.buttonActive}>
              <Text style={styles.buttonTextActive}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonInactive} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.buttonTextInactive}>Crear Cuenta</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
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
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
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
  iconContainer: {
    marginBottom: 20,
    // Aquí va el icono
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
    backgroundColor: '#43C6AC',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginRight: 10,
  },
  buttonInactive: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  buttonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonTextInactive: {
    color: '#43C6AC',
    fontWeight: 'bold',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    marginBottom: 20,
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
    marginBottom: 15,
    color: '#43C6AC',
    backgroundColor: '#F7F7F7',
  },
  loginButton: {
    backgroundColor: '#43C6AC',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    color: '#43C6AC',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  privacyText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Login;
