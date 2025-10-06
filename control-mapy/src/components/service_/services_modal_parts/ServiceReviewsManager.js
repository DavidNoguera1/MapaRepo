import React, { useState, useEffect } from 'react';
import reviewService from '../../../services/apiReviews';
import { authService } from '../../../services/api';
import './css/ServiceReviewsManager.css';

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span key={i} className="star full-star">★</span>
    );
  }

  // Half star
  if (hasHalfStar) {
    stars.push(
      <span key="half" className="star half-star">★</span>
    );
  }

  // Empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <span key={`empty-${i}`} className="star empty-star">☆</span>
    );
  }

  return <div className="star-rating">{stars}</div>;
};

const ReviewItem = ({ review, isAdmin, onDelete, onMarkForDeletion, onUnmarkForDeletion, isMarkedForDeletion }) => {
  // Safety check to prevent errors if review is undefined or invalid
  if (!review || !review.id || !review.user_name || typeof review.rating !== 'number') {
    console.error('ReviewItem received invalid review:', review);
    return null;
  }

  const handleDeleteClick = () => {
    if (isMarkedForDeletion) {
      // If already marked for deletion, unmark it
      onUnmarkForDeletion(review.id);
    } else {
      // Mark for deletion
      onMarkForDeletion(review.id);
    }
  };

  return (
    <div className={`review-item ${isMarkedForDeletion ? 'marked-for-deletion' : ''}`}>
      <div className="review-header">
        <div className="review-user">
          <strong>{review.user_name}</strong>
          <StarRating rating={review.rating} />
        </div>
        {isAdmin && (
          <button
            className={`delete-review-btn ${isMarkedForDeletion ? 'marked' : ''}`}
            onClick={handleDeleteClick}
            title={isMarkedForDeletion ? "Cancelar eliminación" : "Marcar para eliminar"}
          >
            {isMarkedForDeletion ? '↶' : '🗑️'}
          </button>
        )}
      </div>

      {review.title && (
        <div className="review-title">
          <strong>{review.title}</strong>
        </div>
      )}

      {review.comment && (
        <div className="review-comment">
          {review.comment}
        </div>
      )}

      <div className="review-date">
        {new Date(review.created_at).toLocaleDateString('es-ES')}
      </div>
    </div>
  );
};

const ServiceReviewsManager = ({
  serviceId,
  onReviewsUpdate,
  reviews,
  pendingReviewDeletions,
  markReviewForDeletion,
  unmarkReviewForDeletion
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    loadReviews();
  }, [serviceId]);

  const loadReviews = async () => {
    // Safety check: don't load if serviceId is undefined
    if (!serviceId) {
      console.warn('ServiceReviewsManager: serviceId is undefined, skipping load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getReviewsForService(serviceId);

      // Validate response structure and filter out invalid reviews
      const reviewsData = response.reviews || [];
      const validReviews = reviewsData.filter(review =>
        review &&
        review.id &&
        typeof review.rating === 'number' &&
        review.user_name
      );

      console.log('ServiceReviewsManager: Loaded reviews:', validReviews.length, 'valid reviews out of', reviewsData.length, 'total');

      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Error al cargar las reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reviews-section">
        <h3>Reviews</h3>
        <div className="loading">Cargando reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-section">
        <h3>Reviews</h3>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h3>Reviews ({pagination?.total || 0})</h3>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No hay reviews para este servicio aún.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews
            .filter(review => !pendingReviewDeletions.includes(review.id))
            .map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                isAdmin={isAdmin}
                onMarkForDeletion={markReviewForDeletion}
                onUnmarkForDeletion={unmarkReviewForDeletion}
                isMarkedForDeletion={pendingReviewDeletions.includes(review.id)}
              />
            ))}
        </div>
      )}

      {pendingReviewDeletions.length > 0 && (
        <div className="pending-deletions-info">
          <p>{pendingReviewDeletions.length} review{pendingReviewDeletions.length > 1 ? 's' : ''} marcada{pendingReviewDeletions.length > 1 ? 's' : ''} para eliminar</p>
        </div>
      )}

      {pagination && pagination.total > reviews.length && (
        <div className="reviews-pagination">
          <button
            className="load-more-btn"
            onClick={loadReviews}
          >
            Cargar más reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceReviewsManager;
