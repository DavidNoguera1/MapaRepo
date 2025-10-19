import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from 'react-native-toast-message';

import { useUser } from '../contexts/UserContext';
import { getMyServices, createService, updateService, deleteService, addTagToService, removeTagFromService, getServiceTags, createOrFindTag, uploadCoverImage } from '../api/services';
import { SERVER_BASE_URL } from '../api/config';

import AddServiceModal from "./components/AddServiceModal";
import ServiceDetailsModal from "./components/ServiceDetailsModal";

export default function MyServices() {
  const { token } = useUser();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para controlar la visibilidad de los modales y el servicio seleccionado
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Cargar servicios al montar el componente
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getMyServices(token);
      setServices(data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los servicios',
      });
    } finally {
      setLoading(false);
    }
  };

  // Agrega un nuevo servicio
  const handleAddService = async (serviceData) => {
    try {
      // Procesar tags: crear o encontrar cada tag y obtener su ID
      const processedTags = [];
      if (serviceData.tags && serviceData.tags.length > 0) {
        for (const tag of serviceData.tags) {
          try {
            const tagData = await createOrFindTag(token, tag.name);
            processedTags.push({ id: tagData.tag.id, name: tag.name });
          } catch (error) {
            console.error('Error procesando tag:', tag.name, error);
          }
        }
      }

      // Manejar la subida de imagen de portada si es un archivo local
      let coverImageUrl = serviceData.cover_image_url;
      if (coverImageUrl && coverImageUrl.startsWith('file://')) {
        // Para creación, se subirá después de crear el servicio
      }

      // Crear objeto del servicio con solo los campos permitidos
      const servicePayload = {
        title: serviceData.title,
        description: serviceData.description,
        cover_image_url: coverImageUrl,
        address_text: serviceData.address_text,
        lat: serviceData.lat ? parseFloat(serviceData.lat) : null,
        lng: serviceData.lng ? parseFloat(serviceData.lng) : null,
        is_active: serviceData.is_active,
      };

      // Crear nuevo servicio
      const data = await createService(token, servicePayload);

      // Si hay una imagen seleccionada como archivo local, subirla después de crear el servicio
      if (serviceData.cover_image_url && serviceData.cover_image_url.startsWith('file://')) {
        try {
          const uploadResult = await uploadCoverImage(token, data.service.id, serviceData.cover_image_url);
          // Actualizar la URL de la imagen en el servicio
          data.service.cover_image_url = uploadResult.cover_image_url;
          // Actualizar el servicio en la base de datos con la nueva URL
          await updateService(token, data.service.id, { cover_image_url: uploadResult.cover_image_url });
        } catch (error) {
          console.error('Error subiendo imagen de portada:', error);
        }
      }

      // Después de crear el servicio, añadir los tags
      for (const tag of processedTags) {
        try {
          await addTagToService(token, data.service.id, tag.id);
        } catch (error) {
          console.error('Error añadiendo tag al nuevo servicio:', error);
        }
      }
      setServices((prev) => [...prev, { ...data.service, tags: processedTags }]);
      Toast.show({
        type: 'success',
        text1: 'Servicio creado',
        text2: 'El servicio se añadió correctamente',
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving service:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo guardar el servicio',
      });
    }
  };

  // Abre el modal de detalles para el servicio seleccionado
  const handleOpenDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  // Actualiza un servicio existente
  const handleEditService = async (serviceData) => {
    try {
      // Procesar tags: crear o encontrar cada tag y obtener su ID
      const processedTags = [];
      if (serviceData.tags && serviceData.tags.length > 0) {
        for (const tag of serviceData.tags) {
          try {
            const tagData = await createOrFindTag(token, tag.name);
            processedTags.push({ id: tagData.tag.id, name: tag.name });
          } catch (error) {
            console.error('Error procesando tag:', tag.name, error);
          }
        }
      }

      // Manejar la subida de imagen de portada si es un archivo local
      let coverImageUrl = serviceData.cover_image_url;
      if (coverImageUrl && coverImageUrl.startsWith('file://')) {
        // Para edición, subir la imagen primero si es nueva
        try {
          const uploadResult = await uploadCoverImage(token, selectedService.id, coverImageUrl);
          coverImageUrl = uploadResult.cover_image_url;
        } catch (error) {
          console.error('Error subiendo imagen de portada para edición:', error);
          // Mantener la imagen existente si falla la subida
          coverImageUrl = selectedService.cover_image_url;
        }
      }

      // Crear objeto del servicio con solo los campos permitidos
      const servicePayload = {
        title: serviceData.title,
        description: serviceData.description,
        cover_image_url: coverImageUrl,
        address_text: serviceData.address_text,
        lat: serviceData.lat ? parseFloat(serviceData.lat) : null,
        lng: serviceData.lng ? parseFloat(serviceData.lng) : null,
        is_active: serviceData.is_active,
      };

      // Actualizar servicio existente
      await updateService(token, selectedService.id, servicePayload);

      // Gestionar tags: remover tags existentes y añadir los nuevos
      if (selectedService.tags && selectedService.tags.length > 0) {
        for (const existingTag of selectedService.tags) {
          try {
            await removeTagFromService(token, selectedService.id, existingTag.id);
          } catch (error) {
            console.error('Error removiendo tag existente:', existingTag.name, error);
          }
        }
      }

      // Añadir los nuevos tags
      for (const tag of processedTags) {
        try {
          await addTagToService(token, selectedService.id, tag.id);
        } catch (error) {
          console.error('Error añadiendo tag al servicio editado:', error);
        }
      }

      setServices((prev) =>
        prev.map((item) =>
          item.id === selectedService.id ? { ...item, ...servicePayload, tags: processedTags } : item
        )
      );
      Toast.show({
        type: 'success',
        text1: 'Servicio actualizado',
        text2: 'Los cambios se guardaron correctamente',
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating service:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo actualizar el servicio',
      });
    }
  };

  // Abre el formulario en modo edición con los datos del servicio seleccionado
  const handleEdit = (service) => {
    setSelectedService(service);
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  // Elimina un servicio de la lista por su id
  const handleDelete = async (id) => {
    try {
      await deleteService(token, id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      Toast.show({
        type: 'success',
        text1: 'Servicio eliminado',
        text2: 'El servicio fue eliminado correctamente',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo eliminar el servicio',
      });
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
        uri: item.cover_image_url ? `${SERVER_BASE_URL}${item.cover_image_url}` : "https://via.placeholder.com/300x200?text=Sin+Imagen",
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScrollContainer}>
      <View style={styles.tagsContainer}>
        {item.tags && item.tags.slice(0, 3).map((tag, index) => (
          <Text key={tag.id || index} style={styles.tag}>
            {tag.name}
          </Text>
        ))}
      </View>
    </ScrollView>
  </TouchableOpacity>
);



  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado con título y botón para agregar nuevo servicio */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Mis servicios</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>No tienes servicios aún</Text>
            <Text style={styles.emptySubtext}>¡Crea tu primer servicio!</Text>
          </View>
        }
      />

      {/* Modal para agregar un servicio */}
      <AddServiceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddService}
        isEditing={false}
        existingService={null}
      />

      {/* Modal para editar un servicio */}
      <AddServiceModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditService}
        isEditing={true}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
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
  tagsScrollContainer: {
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    fontSize: 9,
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 5,
  },
});
