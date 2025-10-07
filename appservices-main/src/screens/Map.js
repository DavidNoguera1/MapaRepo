import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

const mockServices = [
  {
    id: 1,
    title: 'Manitas Express',
    description: 'Instalaciones y arreglos en el día.',
    latitude: 4.710989,
    longitude: -74.072092,
  },
  {
    id: 2,
    title: 'Taller El Rápido',
    description: 'Mecánica ligera a domicilio.',
    latitude: 4.712989,
    longitude: -74.070092,
  },
];

export default function Map() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoading(false);
    })();
  }, []);


  if (loading) {
    return (
  <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1bc47d" />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
  <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{errorMsg}</Text>
      </SafeAreaView>
    );
  }

  // Construye la URL de OpenStreetMap centrada en la ubicación del usuario
  const lat = location.latitude;
  const lon = location.longitude;
  const zoom = 15;
  // Puedes agregar marcadores usando la API de OSM Static Maps o con un servicio propio
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.01}%2C${lon+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
  <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mapa</Text>
        <Text style={styles.subtitle}>Servicios cercanos a tu ubicación</Text>
      </View>
      <WebView
        source={{ uri: mapUrl }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fcff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 18,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#7a8ca3',
    marginBottom: 8,
  },
  map: {
    height: 320,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fcff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1bc47d',
  },
});
