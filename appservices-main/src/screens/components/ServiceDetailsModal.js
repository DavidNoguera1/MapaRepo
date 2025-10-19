import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import MapView, { Marker } from 'react-native-maps';
import { SERVER_BASE_URL } from '../../api/config';
import GalleryModal from './GalleryModal';
import ReviewsModal from './ReviewsModal';
import { getServiceContacts, createServiceContact, updateServiceContact, deleteServiceContact } from '../../api/services';
import { useUser } from '../../contexts/UserContext';

export default function ServiceDetailsModal({ visible, service, onClose, onEdit, onDelete }) {
  const { token } = useUser();
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (visible && service) {
      fetchContacts();
    }
  }, [visible, service]);

  const fetchContacts = async () => {
    if (!service) return;
    try {
      setLoadingContacts(true);
      const data = await getServiceContacts(token, service.id);
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los contactos',
      });
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleContactPress = (contact) => {
    // Handle clicking on contact - copy value or open appropriate app
    // For now, just show a toast with the value
    Toast.show({
      type: 'info',
      text1: 'Contacto copiado',
      text2: contact.contact_value,
    });
  };

  const getContactIcon = (contactType) => {
    switch (contactType) {
      case 'email':
        return 'mail-outline';
      case 'phone':
        return 'call-outline';
      case 'whatsapp':
        return 'logo-whatsapp';
      default:
        return 'information-circle-outline';
    }
  };

  if (!service) return null;

  // 🗑️ Función con confirmación y toast
  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(id); // llama la función de eliminación que viene como prop

              Toast.show({
                type: 'error',
                text1: 'Servicio eliminado',
                text2: 'El servicio fue eliminado correctamente 🗑️',
              });

              onClose(); // cierra la modal
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error al eliminar',
                text2: 'No se pudo eliminar el servicio 😕',
              });
              console.error('Error eliminando servicio:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{service.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {service.cover_image_url && (
              <Image
                source={{ uri: `${SERVER_BASE_URL}${service.cover_image_url}` }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.label}>Descripción:</Text>
            <Text style={styles.text}>{service.description}</Text>

            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.text}>{service.address_text}</Text>

            <Text style={styles.label}>Ubicación:</Text>
            {service.lat && service.lng ? (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: service.lat,
                    longitude: service.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  rotateEnabled={true}
                >
                  <Marker
                    coordinate={{
                      latitude: service.lat,
                      longitude: service.lng,
                    }}
                    title={service.title}
                    description={service.address_text}
                  />
                </MapView>
              </View>
            ) : (
              <Text style={styles.text}>Ubicación no disponible</Text>
            )}

            <Text style={styles.label}>Tags:</Text>
            <View style={styles.tagsContainer}>
              {service.tags && service.tags.map((tag, index) => (
                <Text key={tag.id || index} style={styles.tag}>
                  {tag.name}
                </Text>
              ))}
            </View>

            <Text style={styles.label}>Contactos:</Text>
            {loadingContacts ? (
              <Text style={styles.text}>Cargando contactos...</Text>
            ) : (
              <View style={styles.contactsContainer}>
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <TouchableOpacity
                      key={contact.id}
                      style={styles.contactItem}
                      onPress={() => handleContactPress(contact)}
                    >
                      <Ionicons name={getContactIcon(contact.contact_type)} size={20} color="#10B981" />
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactValue}>{contact.contact_value}</Text>
                        {contact.label && <Text style={styles.contactLabel}>{contact.label}</Text>}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.text}>No hay contactos registrados</Text>
                )}
              </View>
            )}

            <Text style={styles.label}>Activo:</Text>
            <Text style={styles.text}>{service.is_active ? 'Sí' : 'No'}</Text>

            <Text style={styles.label}>Propietario:</Text>
            <Text style={styles.text}>{service.owner_name || 'No disponible'}</Text>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => setGalleryVisible(true)}
            >
              <Ionicons name="images-outline" size={18} color="#3B82F6" />
              <Text style={styles.galleryButtonText}>Ver Galería de Fotos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reviewsButton}
              onPress={() => setReviewsVisible(true)}
            >
              <Ionicons name="star-outline" size={18} color="#F59E0B" />
              <Text style={styles.reviewsButtonText}>Ver Reviews</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#3B82F6' }]}
              onPress={() => onEdit(service)}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#EF4444' }]}
              onPress={() => handleDelete(service.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.btnText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <GalleryModal
        visible={galleryVisible}
        serviceId={service.id}
        onClose={() => setGalleryVisible(false)}
        isEditable={false}
      />

      <ReviewsModal
        visible={reviewsVisible}
        service={service}
        onClose={() => setReviewsVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  label: { fontWeight: 'bold', color: '#334155', marginTop: 12 },
  text: { color: '#475569', fontSize: 14, marginTop: 4 },
  mapContainer: { height: 150, marginTop: 8, borderRadius: 8, overflow: 'hidden' },
  map: { flex: 1 },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  footer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  coverImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  galleryButtonText: { color: '#3B82F6', fontWeight: 'bold', marginLeft: 8 },
  reviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewsButtonText: { color: '#F59E0B', fontWeight: 'bold', marginLeft: 8 },
  contactsContainer: {
    marginTop: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
