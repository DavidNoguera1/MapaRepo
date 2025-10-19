import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { getServicePhotos, uploadGalleryPhoto, deleteServicePhoto } from '../../api/services';
import { useUser } from '../../contexts/UserContext';
import { SERVER_BASE_URL } from '../../api/config';

export default function GalleryModal({ visible, serviceId, onClose, isEditable = true }) {
  const { token } = useUser();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && serviceId) {
      loadPhotos();
    }
  }, [visible, serviceId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await getServicePhotos(token, serviceId);
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar las fotos',
      });
    } finally {
      setLoading(false);
    }
  };

  const pickAndUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos de galería para seleccionar fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await uploadPhoto(uri);
      }
    } catch (error) {
      console.error('Error picking photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo seleccionar la foto',
      });
    }
  };

  const uploadPhoto = async (imageUri) => {
    try {
      setLoading(true);
      const position = photos.length;
      await uploadGalleryPhoto(token, serviceId, imageUri, position);
      Toast.show({
        type: 'success',
        text1: 'Foto subida',
        text2: 'La foto se ha subido correctamente',
      });
      loadPhotos(); // Recargar fotos
    } catch (error) {
      console.error('Error uploading photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo subir la foto',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = (photoId) => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePhoto(photoId),
        },
      ],
      { cancelable: true }
    );
  };

  const deletePhoto = async (photoId) => {
    try {
      setLoading(true);
      await deleteServicePhoto(token, photoId);
      Toast.show({
        type: 'success',
        text1: 'Foto eliminada',
        text2: 'La foto se ha eliminado correctamente',
      });
      loadPhotos(); // Recargar fotos
    } catch (error) {
      console.error('Error deleting photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo eliminar la foto',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPhoto = ({ item }) => (
    <View style={styles.photoContainer}>
      <Image
        source={{ uri: `${SERVER_BASE_URL}${item.photo_url}` }}
        style={styles.photo}
        resizeMode="cover"
      />
      {isEditable && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePhoto(item.id)}
        >
          <Ionicons name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Galería de Fotos ({photos.length})</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>

          {isEditable && (
            <TouchableOpacity style={styles.addButton} onPress={pickAndUploadPhoto} disabled={loading}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Agregar Foto</Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Cargando...</Text>
            </View>
          ) : photos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay fotos en la galería</Text>
            </View>
          ) : (
            <FlatList
              data={photos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPhoto}
              numColumns={2}
              contentContainerStyle={styles.photosGrid}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#64748B' },
  photosGrid: { paddingBottom: 20 },
  photoContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
