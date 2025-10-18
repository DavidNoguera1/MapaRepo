import React, { useState } from 'react';
import { 
  View, Text, TextInput, FlatList, TouchableOpacity, 
  Image, StyleSheet, Modal, ScrollView 
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

const SearchSection = () => {
  const [query, setQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const newServices = [
    {
      title: 'Manitas Express',
      desc: 'Instalaciones y arreglos en el día.',
      price: '$50.000',
      image: 'https://placekitten.com/400/300',
      tags: ['arreglos', 'hogar'],
      location: 'Medellín',
      contact: '3104567890',
      email: 'manitas@correo.com',
      date: '2025-10-18',
    },
    {
      title: 'Taller El Rápido',
      desc: 'Mecánica ligera a domicilio.',
      price: '$80.000',
      image: 'https://placekitten.com/401/300',
      tags: ['mecánica', 'autos'],
      location: 'Bogotá',
      contact: '3119876543',
      email: 'taller@correo.com',
      date: '2025-10-17',
    },
    {
      title: 'Belleza Total',
      desc: 'Cortes, tintes y maquillaje profesional.',
      price: '$100.000',
      image: 'https://placekitten.com/402/300',
      tags: ['belleza', 'spa'],
      location: 'Cali',
      contact: '3126549870',
      email: 'belleza@correo.com',
      date: '2025-10-16',
    },
  ];

  const categories = [
    { title: 'Hogar', icon: 'home-outline', color: '#60a5fa' },
    { title: 'Autos', icon: 'car-outline', color: '#f97316' },
    { title: 'Tecnología', icon: 'laptop-outline', color: '#10b981' },
    { title: 'Belleza', icon: 'cut-outline', color: '#ec4899' },
    { title: 'Construcción', icon: 'hammer-outline', color: '#facc15' },
  ];

  const handleSearch = (text) => {
    setQuery(text);
    const filtered = newServices.filter(
      (service) =>
        service.title.toLowerCase().includes(text.toLowerCase()) ||
        service.desc.toLowerCase().includes(text.toLowerCase()) ||
        service.tags.some((tag) => tag.toLowerCase().includes(text.toLowerCase())) ||
        service.location.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const recentServices = [...newServices].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Encabezado y barra de búsqueda */}
      <Text style={styles.welcomeText}>Bienvenido de vuelta, Usuario</Text>
      <Text style={styles.appTitle}>Apprueba</Text>
      <Text style={styles.subtitle}>Descubre lo que tus alrededores tienen para ofrecerte</Text>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar servicios, oficios..."
          placeholderTextColor="#b0b7c3"
          value={query}
          onChangeText={handleSearch}
        />
        <Feather name="search" size={22} color="#b0b7c3" style={styles.searchIcon} />
      </View>

      {/* Resultados de búsqueda */}
      {query.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Resultados</Text>
          <FlatList
            data={filteredServices}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedService(item)} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                  <Text style={styles.cardPrice}>{item.price}</Text>
                  <Text style={styles.cardLocation}>📍 {item.location}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noResults}>No se encontraron servicios</Text>
            }
          />
        </>
      )}

      {/* Categorías */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Categorías populares</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.categoryCard, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={26} color={item.color} />
              <Text style={[styles.categoryText, { color: item.color }]}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Nuevos servicios agregados */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Nuevos servicios agregados</Text>
        <FlatList
          horizontal
          data={recentServices}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedService(item)} style={styles.recentCard}>
              <Image source={{ uri: item.image }} style={styles.recentImage} />
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentPrice}>{item.price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Modal de detalles */}
      <Modal visible={!!selectedService} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedService?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedService(null)}>
                <Ionicons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <Image source={{ uri: selectedService?.image }} style={styles.modalImage} />
            <Text style={styles.modalDesc}>{selectedService?.desc}</Text>
            <Text style={styles.modalPrice}>{selectedService?.price}</Text>
            <Text style={styles.modalLocation}>📍 {selectedService?.location}</Text>

            <View style={styles.tagContainer}>
              {selectedService?.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Contacto</Text>
              <Text style={styles.contactText}>📞 {selectedService?.contact}</Text>
              <Text style={styles.contactText}>✉️ {selectedService?.email}</Text>

              <TouchableOpacity style={styles.chatButton}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
                <Text style={styles.chatButtonText}>Chatear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  welcomeText: { fontSize: 18, color: '#333' },
  appTitle: { fontSize: 26, fontWeight: 'bold', marginVertical: 5 },
  subtitle: { color: '#777', marginBottom: 15 },
  searchBarContainer: { position: 'relative', marginBottom: 15 },
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
  searchIcon: { position: 'absolute', left: 16, top: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#1E293B' },

  // Categorías
  categorySection: { marginTop: 20 },
  categoryCard: {
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginRight: 12,
    minWidth: 90,
  },
  categoryText: { marginTop: 6, fontSize: 14, fontWeight: '600' },

  // Nuevos servicios
  recentSection: { marginTop: 20 },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginRight: 12,
    padding: 10,
    elevation: 3,
    width: 160,
  },
  recentImage: { width: '100%', height: 100, borderRadius: 10 },
  recentTitle: { fontWeight: 'bold', marginTop: 6, color: '#333' },
  recentPrice: { color: '#16a34a', fontWeight: 'bold', marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '90%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  modalImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 10 },
  modalDesc: { color: '#475569', fontSize: 15, marginBottom: 8 },
  modalPrice: { fontWeight: 'bold', fontSize: 16, color: '#16a34a' },
  modalLocation: { color: '#555', fontStyle: 'italic', marginBottom: 10 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { backgroundColor: '#e0f2fe', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, margin: 4 },
  tagText: { color: '#0369a1', fontSize: 12 },
  contactSection: { marginTop: 10 },
  contactTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 6, color: '#1E293B' },
  contactText: { color: '#475569', fontSize: 14, marginBottom: 4 },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  chatButtonText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
});

export default SearchSection;
