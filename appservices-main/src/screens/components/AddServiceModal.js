// components/AddServiceModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';

export default function AddServiceModal({ visible, onClose, onSave, isEditing = false, existingService }) {
  const [tagsText, setTagsText] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    cover_image_url: '',
    address_text: '',
    location_geog: '',
    is_active: true,
    price: existingService?.price || '',
    coverPhoto: existingService?.coverPhoto || null,
    gallery: existingService?.gallery || [],
    tags: [],
  });

  useEffect(() => {
  if (isEditing && existingService) {
    setForm(existingService);
    setTagsText(existingService.tags?.join(', ') || ''); // 👈 muestra los tags en el input
  } else {
    setForm({
      title: '',
      description: '',
      cover_image_url: '',
      address_text: '',
      location_geog: '',
      is_active: true,
      tags: [],
    });
    setTagsText(''); 
  }
}, [visible]);


  useEffect(() => {
  (async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesitan permisos de galería para seleccionar fotos.');
    }
  })();
}, []);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
  if (!form.title || !form.description) {
    alert('Por favor, completa los campos obligatorios.');
    return;
  }

  // Crear objeto del servicio (nuevo o existente)
  const newService = {
    id: existingService?.id || Date.now().toString(),
    title: form.title,
    description: form.description,
    // puedes agregar más campos si los hay
  };

  // Guardar el servicio
  onSave(newService);

  // Mostrar mensaje según sea nuevo o editado
  if (existingService) {
    Toast.show({
      type: 'info',
      text1: 'Servicio actualizado',
      text2: 'Los cambios se guardaron correctamente ✨',
    });
  } else {
    Toast.show({
      type: 'success',
      text1: 'Servicio agregado',
      text2: 'El servicio se añadió correctamente 👌',
    });
  }

  // Cerrar modal
  onClose();
};

  const pickCoverPhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true, // opcional, permite recortar
    quality: 0.7,
  });
  if (!result.canceled) {
    setForm({ ...form, coverPhoto: result.assets[0].uri });
  }
};


const pickGalleryPhotos = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    quality: 0.7,
  });
  if (!result.canceled) {
    const uris = result.assets.map(asset => asset.uri);
    setForm({ ...form, gallery: [...form.gallery, ...uris] });
  }
};


  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? 'Editar servicio' : 'Nuevo servicio'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginTop: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Título del servicio"
              value={form.title}
              onChangeText={(t) => handleChange('title', t)}
            />

            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Descripción"
              multiline
              value={form.description}
              onChangeText={(t) => handleChange('description', t)}
            />

            <TextInput
              style={styles.input}
              placeholder="URL de imagen o portada"
              value={form.cover_image_url}
              onChangeText={(t) => handleChange('cover_image_url', t)}
            />

            <TextInput
              style={styles.input}
              placeholder="Dirección del servicio"
              value={form.address_text}
              onChangeText={(t) => handleChange('address_text', t)}
            />

            <TextInput
              style={styles.input}
              placeholder="Coordenadas (lat, lon)"
              value={form.location_geog}
              onChangeText={(t) => handleChange('location_geog', t)}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Servicio activo</Text>
              <Switch
                value={form.is_active}
                onValueChange={(v) => handleChange('is_active', v)}
                trackColor={{ false: '#CBD5E1', true: '#10B981' }}
              />
            </View>

            <TextInput
              placeholder="Precio"
              value={form.price}
              onChangeText={text => setForm({ ...form, price: text })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
  style={styles.input}
  placeholder="Etiquetas (separa con comas)"
  value={tagsText}
  onChangeText={(text) => {
    setTagsText(text); // 👈 actualiza el texto visible
    const tagsArray = text
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setForm({ ...form, tags: tagsArray });
  }}
/>

{Array.isArray(form.tags) && form.tags.length > 0 && (
  <View style={styles.tagsContainer}>
    {form.tags.map((tag, index) => (
      <View key={index} style={styles.tag}>
        <Text style={styles.tagText}>#{tag}</Text>
      </View>
    ))}
  </View>
)}



            <TouchableOpacity style={styles.btn} onPress={pickCoverPhoto}>
              <Text style={styles.btnText}>{form.coverPhoto ? 'Cambiar Foto de Portada' : 'Seleccionar Foto de Portada'}</Text>
            </TouchableOpacity>

            {form.coverPhoto && <Image source={{ uri: form.coverPhoto }} style={styles.coverPhoto} />}

            <TouchableOpacity style={styles.btn} onPress={pickGalleryPhotos}>
              <Text style={styles.btnText}>Agregar Fotos a la Galería</Text>
            </TouchableOpacity>

            <FlatList
              data={form.gallery}
              horizontal
              keyExtractor={(uri, index) => index.toString()}
              renderItem={({ item }) => <Image source={{ uri: item }} style={styles.galleryPhoto} />}
            />

          </ScrollView>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
            <Text style={styles.saveText}>{isEditing ? 'Guardar cambios' : 'Guardar servicio'}</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  // ---- NUEVOS ESTILOS PARA FOTOS ----
  btn: {
    backgroundColor: '#2563EB',
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  coverPhoto: { width: '100%', height: 200, borderRadius: 12, marginVertical: 8 },
  galleryPhoto: { width: 100, height: 100, borderRadius: 10, marginRight: 8, marginVertical: 4 },
});

