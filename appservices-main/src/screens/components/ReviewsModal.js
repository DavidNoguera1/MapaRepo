import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { getServiceReviews, createReview, updateReview, deleteReview } from '../../api/services';
import { useUser } from '../../contexts/UserContext';

export default function ReviewsModal({ visible, service, onClose }) {
  const { token, user } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    if (visible && service) {
      fetchReviews();
    }
  }, [visible, service]);

  const fetchReviews = async () => {
    if (!service) return;
    try {
      setLoading(true);
      const data = await getServiceReviews(token, service.id);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar las reviews',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async () => {
    // Prevent service owners from creating reviews
    if (user && user.id === service.user_id) {
      Toast.show({
        type: 'error',
        text1: 'No permitido',
        text2: 'Como propietario del servicio, no puedes escribir reviews.',
      });
      return;
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El rating debe estar entre 1 y 5',
      });
      return;
    }

    try {
      await createReview(token, {
        service_id: service.id,
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      });

      Toast.show({
        type: 'success',
        text1: 'Review creada',
        text2: 'Tu review fue publicada exitosamente',
      });

      setFormData({ rating: 5, title: '', comment: '' });
      setShowCreateForm(false);
      fetchReviews();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo crear la review',
      });
      console.error('Error creating review:', error);
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'El rating debe estar entre 1 y 5',
      });
      return;
    }

    try {
      await updateReview(token, editingReview.id, {
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment
      });

      Toast.show({
        type: 'success',
        text1: 'Review actualizada',
        text2: 'Tu review fue actualizada exitosamente',
      });

      setEditingReview(null);
      setFormData({ rating: 5, title: '', comment: '' });
      fetchReviews();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo actualizar la review',
      });
      console.error('Error updating review:', error);
    }
  };

  const handleDeleteReview = (review) => {
    Alert.alert(
      'Eliminar review',
      '¿Estás seguro de que quieres eliminar esta review?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteReview(token, review.id);
              Toast.show({
                type: 'success',
                text1: 'Review eliminada',
                text2: 'La review fue eliminada exitosamente',
              });
              fetchReviews();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar la review',
              });
              console.error('Error deleting review:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || ''
    });
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setFormData({ rating: 5, title: '', comment: '' });
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => onRatingChange && onRatingChange(star)}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={20}
              color={star <= rating ? '#FFD700' : '#CBD5E1'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReviewForm = (isEditing = false) => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {isEditing ? 'Editar Review' : 'Crear Review'}
      </Text>

      <Text style={styles.label}>Rating:</Text>
      {renderStars(formData.rating, true, (rating) => setFormData({ ...formData, rating }))}

      <Text style={styles.label}>Título (opcional):</Text>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
        placeholder="Título de la review"
        maxLength={100}
      />

      <Text style={styles.label}>Comentario (opcional):</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.comment}
        onChangeText={(text) => setFormData({ ...formData, comment: text })}
        placeholder="Escribe tu comentario..."
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#6B7280' }]}
          onPress={() => {
            if (isEditing) cancelEdit();
            else setShowCreateForm(false);
          }}
        >
          <Text style={styles.btnText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#10B981' }]}
          onPress={isEditing ? handleUpdateReview : handleCreateReview}
        >
          <Text style={styles.btnText}>
            {isEditing ? 'Actualizar' : 'Publicar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewItem = (review) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.user_name}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.created_at).toLocaleDateString()}
          </Text>
        </View>
        {renderStars(review.rating)}
      </View>

      {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
      {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}

      {user && user.id === review.user_id && (
        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => startEdit(review)}
          >
            <Ionicons name="create-outline" size={16} color="#3B82F6" />
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDeleteReview(review)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={[styles.actionText, { color: '#EF4444' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (!service) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Reviews de {service.title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {loading ? (
              <Text style={styles.loadingText}>Cargando reviews...</Text>
            ) : (
              <>
                {reviews.length > 0 ? (
                  reviews.map(renderReviewItem)
                ) : (
                  <Text style={styles.noReviewsText}>No hay reviews aún</Text>
                )}
              </>
            )}

            {editingReview && renderReviewForm(true)}
          </ScrollView>

          <View style={styles.footer}>
            {!showCreateForm && !editingReview && user && user.id !== service.user_id && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#10B981' }]}
                onPress={() => setShowCreateForm(true)}
              >
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.btnText}>Escribir Review</Text>
              </TouchableOpacity>
            )}

            {!showCreateForm && !editingReview && user && user.id === service.user_id && (
              <Text style={styles.ownerMessage}>Como propietario del servicio, no puedes escribir reviews.</Text>
            )}

            {showCreateForm && renderReviewForm(false)}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  loadingText: { textAlign: 'center', color: '#64748B', fontSize: 16, marginVertical: 20 },
  noReviewsText: { textAlign: 'center', color: '#64748B', fontSize: 16, marginVertical: 20 },

  reviewItem: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },

  formContainer: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },

  footer: {
    marginTop: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  ownerMessage: { textAlign: 'center', color: '#64748B', fontSize: 14, marginTop: 8 },
});
