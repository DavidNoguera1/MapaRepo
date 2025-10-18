import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ServiceDetailsModal({ visible, service, onClose, onEdit, onDelete }) {
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
            <Text style={styles.label}>Descripción:</Text>
            <Text style={styles.text}>{service.description}</Text>

            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.text}>{service.address_text}</Text>

            <Text style={styles.label}>Ubicación (lat/lon):</Text>
            <Text style={styles.text}>{service.location_geog}</Text>

            <Text style={styles.label}>Activo:</Text>
            <Text style={styles.text}>{service.is_active ? 'Sí' : 'No'}</Text>
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
});
