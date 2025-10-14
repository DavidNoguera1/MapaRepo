import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import AddServiceModal from './components/AddServiceModal';
import ServiceDetailsModal from './components/ServiceDetailsModal';

export default function MyServices() {
  const [services, setServices] = useState([
    {
      id: '1',
      title: 'Cerámica Luna',
      description: 'Piezas únicas hechas a mano',
      address_text: 'Calle 10 #45 - 12',
      location_geog: '6.2518, -75.5636',
      is_active: true,
    },
    {
      id: '2',
      title: 'Costuras Ana',
      description: 'Ajustes y confecciones personalizadas',
      address_text: 'Cra 25 #12 - 30',
      location_geog: '4.6097, -74.0817',
      is_active: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleAddService = (service) => {
    if (isEditing && selectedService) {
      setServices((prev) =>
        prev.map((item) => (item.id === selectedService.id ? { ...service } : item))
      );
      setIsEditing(false);
    } else {
      setServices((prev) => [...prev, service]);
    }
  };

  const handleOpenDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setIsEditing(true);
    setShowDetailsModal(false);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    setServices((prev) => prev.filter((item) => item.id !== id));
    setShowDetailsModal(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleOpenDetails(item)}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={36} color="#94A3B8" />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Mis servicios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setIsEditing(false);
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={28} color="#10B981" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={services}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal para agregar/editar */}
      <AddServiceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddService}
        isEditing={isEditing}
        existingService={selectedService}
      />
      

      {/* Modal de detalles */}
      <ServiceDetailsModal
        visible={showDetailsModal}
        service={selectedService}
        onClose={() => setShowDetailsModal(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  addButton: {
    padding: 4,
  },
  list: {
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    padding: 10,
    alignItems: 'flex-start',
    elevation: 2,
    minWidth: 150,
    maxWidth: '48%',
  },
  imagePlaceholder: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    color: '#64748B',
  },
});
