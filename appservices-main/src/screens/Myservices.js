import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import AddServiceModal from "./components/AddServiceModal";
import ServiceDetailsModal from "./components/ServiceDetailsModal";

export default function MyServices() {
  const [services, setServices] = useState([
    {
      id: "1",
      title: "Cerámica Luna",
      description: "Piezas únicas hechas a mano",
      address_text: "Calle 10 #45 - 12",
      location_geog: "6.2518, -75.5636",
      is_active: true,
    },
    {
      id: "2",
      title: "Costuras Ana",
      description: "Ajustes y confecciones personalizadas",
      address_text: "Cra 25 #12 - 30",
      location_geog: "4.6097, -74.0817",
      is_active: false,
    },
  ]);

  // Estados para controlar la visibilidad de los modales y el servicio seleccionado
const [showAddModal, setShowAddModal] = useState(false);
const [showDetailsModal, setShowDetailsModal] = useState(false);
const [selectedService, setSelectedService] = useState(null);
const [isEditing, setIsEditing] = useState(false);

// Agrega un nuevo servicio o actualiza uno existente si está en modo edición
const handleAddService = (service) => {
  if (isEditing && selectedService) {
    setServices((prev) =>
      prev.map((item) =>
        item.id === selectedService.id ? { ...service } : item
      )
    );
    setIsEditing(false);
  } else {
    setServices((prev) => [...prev, service]);
  }
};

// Abre el modal de detalles para el servicio seleccionado
const handleOpenDetails = (service) => {
  setSelectedService(service);
  setShowDetailsModal(true);
};

// Abre el formulario en modo edición con los datos del servicio seleccionado
const handleEdit = (service) => {
  setSelectedService(service);
  setIsEditing(true);
  setShowDetailsModal(false);
  setShowAddModal(true);
};

// Elimina un servicio de la lista por su id
// 🗑️ Eliminar servicio (con actualización de estado)
  const handleDelete = async (id) => {
    try {
      // Simulamos eliminación local (en tu caso podría ser llamada a backend)
      const updatedServices = services.filter((s) => s.id !== id);
      setServices(updatedServices);
    } catch (error) {
      console.error('Error eliminando servicio:', error);
    }
  };

// Renderiza cada tarjeta de servicio en la lista
const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => handleOpenDetails(item)}
  >
    {/* Imagen del servicio */}
    <Image
      source={{
        uri:
          item.id === "1"
            ? "https://barriosyvecinos.com.co/wp-content/uploads/servicios-publicos-domiciliarios-1-2048.webp"
            : "https://th.bing.com/th/id/R.efff1114a2127d7b2d620682552104e7?rik=bfGYJhrpbNDefg&pid=ImgRaw&r=0",
      }}
      style={{
        width: "100%",
        height: 120,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
      resizeMode="cover"
    />

    {/* Información textual del servicio */}
    <Text style={styles.title}>{item.title}</Text>
    <Text style={styles.desc}>{item.description}</Text>
  </TouchableOpacity>
);



  return (
  <SafeAreaView style={styles.container}>
    {/* Encabezado con título y botón para agregar nuevo servicio */}
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

    {/* Lista de servicios mostrada en dos columnas */}
    <FlatList
      data={services}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />

    {/* Modal para agregar o editar un servicio */}
    <AddServiceModal
      visible={showAddModal}
      onClose={() => setShowAddModal(false)}
      onSave={handleAddService}
      isEditing={isEditing}
      existingService={selectedService}
    />

    {/* Modal que muestra los detalles del servicio seleccionado */}
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E293B",
  },
  addButton: {
    padding: 4,
  },
  list: {
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 8,
    padding: 10,
    alignItems: "flex-start",
    elevation: 2,
    minWidth: 150,
    maxWidth: "48%",
  },
  imagePlaceholder: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    color: "#64748B",
  },
});
