import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const categories = [
  { label: 'Reparaciones', icon: <FontAwesome5 name="wrench" size={24} color="#3b82f6" />, bg: '#eaf3ff' },
  { label: 'Mecánica', icon: <Feather name="settings" size={24} color="#1bc47d" />, bg: '#eafaf3' },
  { label: 'Artesanía', icon: <MaterialCommunityIcons name="fire" size={24} color="#fb8500" />, bg: '#fff5ec' },
  { label: 'Sastrería', icon: <MaterialCommunityIcons name="scissors-cutting" size={24} color="#38bdf8" />, bg: '#eaf6ff' },
];

const newServices = [
  {
    title: 'Manitas Express',
    desc: 'Instalaciones y arreglos en el día.',
    gradient: ['#eaf3ff', '#fff5ec'],
  },
  {
    title: 'Taller El Rápido',
    desc: 'Mecánica ligera a domicilio.',
    gradient: ['#eafaf3', '#fff5ec'],
  },
];

const featured = [
  { title: 'Cerámica Luna', desc: 'Piezas únicas hechas a mano.' },
  { title: 'Costuras Ana', desc: 'Ajustes y arreglos rápidos.' },
  { title: 'Obras&Co', desc: 'Pequeñas reformas del hogar.' },
  { title: 'AutoCare', desc: 'Lavado y detallado móvil.' },
];

export default function Home() {
  const navigation = require('@react-navigation/native').useNavigation();
  return (
  <SafeAreaView style={styles.container}>
      {/* Fixed Navigation Bar at Top */}
      {/* <View style={[styles.navBar, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }]}> 
        <MaterialCommunityIcons name="home" size={22} color="#1bc47d" />
        <Text style={styles.navLabel}>Inicio</Text>
        <MaterialCommunityIcons name="message-text-outline" size={22} color="#b0b7c3" />
        <Text style={styles.navLabel}>Chats</Text>
        <MaterialCommunityIcons name="map-marker-outline" size={22} color="#b0b7c3" />
        <Text style={styles.navLabel}>Mapa</Text>
        <MaterialCommunityIcons name="heart-outline" size={22} color="#b0b7c3" />
        <Text style={styles.navLabel}>Favoritos</Text>
        <Ionicons name="settings-outline" size={22} color="#b0b7c3" />
        <Text style={styles.navLabel}>Ajustes</Text>
      </View> */}
      {/* Add top padding to avoid navBar overlap */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 60 }}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Bienvenido de vuelta, Usuario</Text>
          <Text style={styles.appTitle}>Apprueba</Text>
          <Text style={styles.subtitle}>Descubre lo que tus alrededores tienen para ofrecerte</Text>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchBar}
              placeholder="Buscar servicios, oficios..."
              placeholderTextColor="#b0b7c3"
            />
            <Feather name="search" size={22} color="#b0b7c3" style={styles.searchIcon} />
          </View>
        </View>

        {/* Categories Section */}
        <Text style={styles.sectionTitle}>Categorías</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((cat, idx) => (
            <View key={cat.label} style={[styles.categoryCard, { backgroundColor: cat.bg }]}> 
              <View style={styles.categoryIcon}>{cat.icon}</View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* New Services Section */}
        <Text style={styles.sectionTitle}>Nuevos Servicios</Text>
        <Text style={styles.sectionSubtitle}>Dale la bienvenida y la oportunidad a estos emprendedores.</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesScroll}>
          {newServices.map((service, idx) => (
            <LinearGradient
              key={service.title}
              colors={service.gradient}
              style={styles.serviceCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.serviceImagePlaceholder} />
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceDesc}>{service.desc}</Text>
              <TouchableOpacity style={styles.serviceBtn}>
                <Text style={styles.serviceBtnText}>Ver más</Text>
              </TouchableOpacity>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Featured Nearby Section */}
        <Text style={styles.sectionTitle}>Destacados cercanos a ti</Text>
        <View style={styles.featuredGrid}>
          {featured.map((item, idx) => (
            <View key={item.title} style={styles.featuredCard}>
              <View style={styles.featuredImagePlaceholder} />
              <Text style={styles.featuredTitle}>{item.title}</Text>
              <Text style={styles.featuredDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
   </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fcff',
    paddingTop: 36,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaf3ff',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#eaf3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    color: '#b0b7c3',
    marginTop: 2,
    fontWeight: '500',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 15,
    color: '#b0b7c3',
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#7a8ca3',
    marginBottom: 16,
  },
  searchBarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 44,
    fontSize: 15,
    color: '#222',
    shadowColor: '#eaf3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#eaf3ff',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 20,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7a8ca3',
    marginLeft: 20,
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  categoryCard: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#eaf3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#eaf3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 13,
    color: '#222',
    fontWeight: '500',
  },
  servicesScroll: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  serviceCard: {
    width: 180,
    borderRadius: 20,
    marginRight: 16,
    padding: 16,
    shadowColor: '#eaf3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: '#fff',
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: 60,
    borderRadius: 14,
    backgroundColor: '#f3f6fa',
    marginBottom: 10,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 13,
    color: '#7a8ca3',
    marginBottom: 10,
  },
  serviceBtn: {
    backgroundColor: '#1bc47d',
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  serviceBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  featuredCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#eaf3ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f3f6fa',
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  featuredDesc: {
    fontSize: 12,
    color: '#7a8ca3',
  },
});
