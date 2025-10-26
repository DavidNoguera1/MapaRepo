// components/AddServiceModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getTags, getServiceContacts, createServiceContact, updateServiceContact, deleteServiceContact } from '../../api/services';
import { useUser } from '../../contexts/UserContext';
import GalleryModal from './GalleryModal';

export default function AddServiceModal({ visible, onClose, onSave, isEditing = false, existingService }) {
  const { token } = useUser();
  const [form, setForm] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    address_text: '',
    lat: '',
    lng: '',
    is_active: true,
    tags: [],
    contacts: [],
  });
  const [selectedCoverUri, setSelectedCoverUri] = useState(null);

  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactInput, setContactInput] = useState({ contact_type: 'phone', contact_value: '', label: '' });
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (isEditing && existingService) {
      setForm({
        title: existingService.title || '',
        description: existingService.description || '',
        cover_image_url: existingService.cover_image_url || '',
        address_text: existingService.address_text || '',
        lat: existingService.lat ? existingService.lat.toString() : '',
        lng: existingService.lng ? existingService.lng.toString() : '',
        is_active: existingService.is_active !== undefined ? existingService.is_active : true,
        tags: existingService.tags || [],
        contacts: [],
      });
      if (existingService.lat && existingService.lng) {
        setMapRegion({
          latitude: existingService.lat,
          longitude: existingService.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      // Load contacts if editing
      if (existingService.id) {
        fetchContacts(existingService.id);
      }
    } else {
      setForm({
        title: '',
        description: '',
        cover_image_url: '',
        address_text: '',
        lat: '',
        lng: '',
        is_active: true,
        tags: [],
        contacts: [],
      });
      setMapRegion({
        latitude: 19.4326,
        longitude: -99.1332,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setContacts([]);
    }
  }, [visible, isEditing, existingService]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos de galería para seleccionar fotos.');
      }
    })();
  }, []);

  // Cargar tags disponibles
  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await getTags(token);
        setAvailableTags(data.tags || []);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    if (visible && token) {
      loadTags();
    }
  }, [visible, token]);

  // Filtrar tags basado en input
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !form.tags.some(existingTag => existingTag.name.toLowerCase() === tag.name.toLowerCase())
      );
      setFilteredTags(filtered);
      setShowTagSuggestions(filtered.length > 0);
    } else {
      setFilteredTags([]);
      setShowTagSuggestions(false);
    }
  }, [tagInput, availableTags, form.tags]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addTag = (tagName) => {
    if (tagName && !form.tags.some(tag => tag.name.toLowerCase() === tagName.toLowerCase())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, { name: tagName }]
      }));
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const selectTag = (tag) => {
    addTag(tag.name);
  };

  const removeTag = (tagName) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag.name !== tagName)
    }));
  };

  const fetchContacts = async (serviceId) => {
    try {
      const data = await getServiceContacts(token, serviceId);
      setContacts(data.contacts || []);
      setForm(prev => ({ ...prev, contacts: data.contacts || [] }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los contactos',
      });
    }
  };

  const addContact = async () => {
    if (!contactInput.contact_value.trim()) {
      alert('Por favor, ingresa un valor para el contacto.');
      return;
    }

    try {
      const newContact = {
        contact_type: contactInput.contact_type,
        contact_value: contactInput.contact_value.trim(),
        label: contactInput.label.trim() || null,
      };

      await createServiceContact(token, existingService.id, newContact);
      setContactInput({ contact_type: 'phone', contact_value: '', label: '' });
      setShowContactForm(false);
      fetchContacts(existingService.id);
      Toast.show({
        type: 'success',
        text1: 'Contacto añadido',
        text2: 'El contacto fue añadido correctamente',
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo añadir el contacto',
      });
    }
  };

  const updateContact = async (contactId, updatedContact) => {
    try {
      await updateServiceContact(token, existingService.id, contactId, updatedContact);
      fetchContacts(existingService.id);
      Toast.show({
        type: 'success',
        text1: 'Contacto actualizado',
        text2: 'El contacto fue actualizado correctamente',
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo actualizar el contacto',
      });
    }
  };

  const deleteContact = async (contactId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este contacto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteServiceContact(token, existingService.id, contactId);
              fetchContacts(existingService.id);
              Toast.show({
                type: 'success',
                text1: 'Contacto eliminado',
                text2: 'El contacto fue eliminado correctamente',
              });
            } catch (error) {
              console.error('Error deleting contact:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar el contacto',
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getContactIcon = (contactType) => {
    switch (contactType) {
      case 'email':
        return 'mail-outline';
      case 'phone':
        return 'call-outline';
      case 'whatsapp':
        return 'logo-whatsapp';
      case 'facebook':
        return 'logo-facebook';
      case 'instagram':
        return 'logo-instagram';
      case 'enlace':
        return 'link-outline';
      case 'otros':
        return 'information-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMapRegion(prev => ({
      ...prev,
      latitude,
      longitude,
    }));
    handleChange('lat', latitude.toString());
    handleChange('lng', longitude.toString());
  };

  const goToCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos de ubicación para usar esta función.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      handleChange('lat', latitude.toString());
      handleChange('lng', longitude.toString());
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Error al obtener la ubicación actual.');
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.description) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    // Crear objeto del servicio con solo los campos permitidos
    const serviceData = {
      title: form.title,
      description: form.description,
      cover_image_url: form.cover_image_url,
      address_text: form.address_text,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      is_active: form.is_active,
      tags: form.tags,
    };

    // Guardar el servicio
    onSave(serviceData);

    // Cerrar modal
    onClose();
  };

  const pickCoverPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedCoverUri(uri);
      handleChange('cover_image_url', uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? 'Editar servicio' : 'Crear servicio'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Título del servicio"
              value={form.title}
              onChangeText={(t) => handleChange('title', t)}
            />

            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Descripción del servicio"
              value={form.description}
              onChangeText={(t) => handleChange('description', t)}
              multiline
            />

            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              placeholder="Dirección del servicio"
              value={form.address_text}
              onChangeText={(t) => handleChange('address_text', t)}
            />

            <Text style={styles.label}>Ubicación</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                region={mapRegion}
                onPress={handleMapPress}
              >
                {form.lat && form.lng && (
                  <Marker
                    coordinate={{
                      latitude: parseFloat(form.lat),
                      longitude: parseFloat(form.lng),
                    }}
                    title="Ubicación del servicio"
                  />
                )}
              </MapView>
              <TouchableOpacity style={styles.locationButton} onPress={goToCurrentLocation}>
                <Ionicons name="locate" size={20} color="#fff" />
                <Text style={styles.locationButtonText}>Mi ubicación</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Buscar o añadir tag"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={() => addTag(tagInput)}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={() => addTag(tagInput)}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {showTagSuggestions && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={filteredTags.slice(0, 5)}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => selectTag(item)}
                    >
                      <Text style={styles.suggestionText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                />
              </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScrollContainer}>
              <View style={styles.tagsContainer}>
                {form.tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => removeTag(tag.name)}
                  >
                    <Text style={styles.tagText}>{tag.name}</Text>
                    <Ionicons name="close" size={14} color="#10B981" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Ubicación Exacta</Text>
              <Switch
                value={form.is_active}
                onValueChange={(v) => handleChange('is_active', v)}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={pickCoverPhoto}>
              <Text style={styles.btnText}>{form.cover_image_url ? 'Cambiar Foto de Portada' : 'Seleccionar Foto de Portada'}</Text>
            </TouchableOpacity>

            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={() => {
                    if (!existingService?.id) {
                      alert('Guarda el servicio primero antes de gestionar la galería.');
                      return;
                    }
                    setGalleryVisible(true);
                  }}
                >
                  <Ionicons name="images-outline" size={18} color="#3B82F6" />
                  <Text style={styles.galleryButtonText}>Gestionar Galería de Fotos</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Contactos</Text>
                <TouchableOpacity style={styles.addContactButton} onPress={() => setShowContactForm(true)}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addContactText}>Añadir Contacto</Text>
                </TouchableOpacity>

                {contacts.map((contact) => (
                  <View key={contact.id} style={styles.contactItem}>
                    <Ionicons name={getContactIcon(contact.contact_type)} size={20} color="#10B981" />
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactValue}>{contact.contact_value}</Text>
                      {contact.label && <Text style={styles.contactLabel}>{contact.label}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => deleteContact(contact.id)}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                {showContactForm && (
                  <View style={styles.contactForm}>
                    <Text style={styles.subLabel}>Tipo de contacto</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactTypeScrollContainer}>
                      <View style={styles.contactTypeContainer}>
                        {[
                          { key: 'phone', label: 'Teléfono' },
                          { key: 'email', label: 'Email' },
                          { key: 'whatsapp', label: 'WhatsApp' },
                          { key: 'facebook', label: 'Facebook' },
                          { key: 'instagram', label: 'Instagram' },
                          { key: 'enlace', label: 'Enlace' },
                          { key: 'otros', label: 'Otros' },
                        ].map(({ key, label }) => (
                          <TouchableOpacity
                            key={key}
                            style={[
                              styles.contactTypeButton,
                              contactInput.contact_type === key && styles.contactTypeButtonActive,
                            ]}
                            onPress={() => setContactInput(prev => ({ ...prev, contact_type: key }))}
                          >
                            <Ionicons name={getContactIcon(key)} size={16} color={contactInput.contact_type === key ? '#fff' : '#10B981'} />
                            <Text style={[
                              styles.contactTypeText,
                              contactInput.contact_type === key && styles.contactTypeTextActive,
                            ]}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>

                    <TextInput
                      style={styles.input}
                      placeholder={
                        contactInput.contact_type === 'email' ? 'correo@ejemplo.com' :
                        contactInput.contact_type === 'phone' ? '+52 55 1234 5678' :
                        contactInput.contact_type === 'whatsapp' ? 'Número de WhatsApp' :
                        contactInput.contact_type === 'facebook' ? 'https://facebook.com/tu-pagina' :
                        contactInput.contact_type === 'instagram' ? 'https://instagram.com/tu-usuario' :
                        contactInput.contact_type === 'enlace' ? 'https://tu-sitio-web.com' :
                        'Información de contacto'
                      }
                      value={contactInput.contact_value}
                      onChangeText={(value) => setContactInput(prev => ({ ...prev, contact_value: value }))}
                      keyboardType={
                        contactInput.contact_type === 'email' ? 'email-address' :
                        contactInput.contact_type === 'phone' ? 'phone-pad' :
                        'default'
                      }
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Etiqueta (opcional)"
                      value={contactInput.label}
                      onChangeText={(value) => setContactInput(prev => ({ ...prev, label: value }))}
                    />

                    <View style={styles.contactFormButtons}>
                      <TouchableOpacity style={styles.cancelButton} onPress={() => setShowContactForm(false)}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.saveContactButton} onPress={addContact}>
                        <Text style={styles.saveContactText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.infoMessageContainer}>
                <Text style={styles.infoMessageText}>
                  Una vez hayas registrado tu servicio, podrás añadir tus líneas de contacto y galería ;)
                </Text>
              </View>
            )}

            {form.cover_image_url && <Image source={{ uri: form.cover_image_url }} style={styles.coverPhoto} />}

          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
            <Text style={styles.saveText}>{isEditing ? 'Guardar cambios' : 'Guardar servicio'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <GalleryModal
        visible={galleryVisible}
        serviceId={existingService?.id}
        onClose={() => setGalleryVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  input: {
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10,
    marginVertical: 8,
    fontSize: 14,
  },
  label: { fontWeight: 'bold', color: '#334155', marginTop: 12 },
  mapContainer: { height: 200, marginTop: 8, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  map: { flex: 1 },
  locationButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationButtonText: { color: '#fff', fontSize: 12, marginLeft: 4 },
  tagInputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  addTagButton: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#334155',
  },
  tagsScrollContainer: { marginTop: 8 },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: { color: '#10B981', fontSize: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  switchLabel: { fontSize: 15, color: '#1E293B' },
  saveBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btn: {
    backgroundColor: '#2563EB',
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  coverPhoto: { width: '100%', height: 200, borderRadius: 12, marginVertical: 8 },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  galleryButtonText: { color: '#3B82F6', fontWeight: 'bold', marginLeft: 8 },
  addContactButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  addContactText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactInfo: { flex: 1, marginLeft: 8 },
  contactValue: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  contactLabel: { fontSize: 12, color: '#64748B' },
  contactForm: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subLabel: { fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  contactTypeScrollContainer: { marginBottom: 12 },
  contactTypeContainer: { flexDirection: 'row', gap: 8 },
  contactTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
    backgroundColor: '#fff',
  },
  contactTypeButtonActive: { backgroundColor: '#10B981' },
  contactTypeText: { fontSize: 12, color: '#10B981', marginLeft: 4 },
  contactTypeTextActive: { color: '#fff' },
  contactFormButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelText: { color: '#374151', fontWeight: 'bold' },
  saveContactButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveContactText: { color: '#fff', fontWeight: 'bold' },
  infoMessageContainer: {
    backgroundColor: '#F1F5F9',
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoMessageText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
