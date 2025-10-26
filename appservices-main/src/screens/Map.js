import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { getServicesNearMe, getTags } from '../api/services';
import { useUser } from '../contexts/UserContext';
import ServiceDetailsModal from './components/ServiceDetailsModal';
import ReviewsModal from './components/ReviewsModal';
import { SERVER_BASE_URL } from '../api/config';

export default function Map() {
  const { user } = useUser();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [services, setServices] = useState([]);
  const [zoneCenter, setZoneCenter] = useState(null);
  const [zoneRadius, setZoneRadius] = useState(1000);
  const [mapRegion, setMapRegion] = useState({
    latitude: 4.711,
    longitude: -74.0721,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showAllServices, setShowAllServices] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetailsVisible, setServiceDetailsVisible] = useState(false);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  useEffect(() => {
    loadCachedLocation();
    requestLocationPermission();
    loadTags();
  }, []);

  useEffect(() => {
    if (zoneCenter && !showAllServices) loadServicesNearZone();
  }, [zoneCenter, zoneRadius, showAllServices]);

  const loadCachedLocation = async () => {
    try {
      const cachedLat = await AsyncStorage.getItem('cachedLat');
      const cachedLng = await AsyncStorage.getItem('cachedLng');
      const cachedRadius = await AsyncStorage.getItem('cachedRadius');
      if (cachedLat && cachedLng) {
        const coords = { latitude: parseFloat(cachedLat), longitude: parseFloat(cachedLng) };
        setZoneCenter(coords);
        setMapRegion({ ...mapRegion, latitude: coords.latitude, longitude: coords.longitude });
      }
      if (cachedRadius) {
        setZoneRadius(parseFloat(cachedRadius));
      }
    } catch {}
  };

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setLocation(coords);
      setZoneCenter(coords);
      setMapRegion({ ...mapRegion, latitude: coords.latitude, longitude: coords.longitude });
      await AsyncStorage.setItem('cachedLat', coords.latitude.toString());
      await AsyncStorage.setItem('cachedLng', coords.longitude.toString());
      setLoading(false);
    } catch {
      setErrorMsg('Error obteniendo ubicación');
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const data = await getTags(user.token);
      setAvailableTags(data.tags || []);
    } catch {}
  };

  const loadServicesNearZone = async () => {
    if (!zoneCenter) return;
    setLoading(true);
    try {
      const data = await getServicesNearMe(zoneCenter.latitude, zoneCenter.longitude, zoneRadius / 1000, 100, 0);
      setServices(data.services || []);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los servicios cercanos');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = useCallback(async (event) => {
    const coords = event.nativeEvent.coordinate;
    setZoneCenter(coords);
    await AsyncStorage.setItem('cachedLat', coords.latitude.toString());
    await AsyncStorage.setItem('cachedLng', coords.longitude.toString());
  }, []);

  const addTag = (tag) => {
    if (!selectedTags.includes(tag.id)) setSelectedTags((prev) => [...prev, tag.id]);
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagId) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = searchQuery === '' || (service.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tagId) => service.tags?.some((tag) => tag.id === tagId));
    return matchesSearch && matchesTags;
  });

  if (loading)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1bc47d" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </SafeAreaView>
    );

  if (errorMsg)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{errorMsg}</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mapa y botones */}
        <View style={styles.mapWrapper}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {filteredServices.filter(service => service.is_active).map((service) => (
              <Marker
                key={service.id}
                coordinate={{
                  latitude: service.latitude || service.lat,
                  longitude: service.longitude || service.lng,
                }}
                title={service.title}
                description={service.description}
                onPress={() => {
                  setSelectedService(service);
                  setServiceDetailsVisible(true);
                }}
              />
            ))}
            {zoneCenter && !showAllServices && (
              <Circle
                center={zoneCenter}
                radius={zoneRadius}
                strokeColor="#1bc47d"
                fillColor="rgba(27,196,125,0.15)"
                strokeWidth={2}
              />
            )}
          </MapView>

          <View style={styles.mapButtons}>
            <TouchableOpacity style={styles.mapButton} onPress={requestLocationPermission}>
              <Text style={styles.mapButtonText}>📍 Mi ubicación</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton} onPress={() => setShowAllServices(!showAllServices)}>
              <Text style={styles.mapButtonText}>
                {showAllServices ? 'Zona actual' : 'Ver todos'}
              </Text>
            </TouchableOpacity>
          </View>

          {!showAllServices && (
            <View style={styles.radiusControl}>
              <Text style={styles.sliderLabel}>Control Zona de interés</Text>
              <Slider
                style={styles.slider}
                minimumValue={1000}
                maximumValue={100000}
                step={1000}
                value={zoneRadius}
                onValueChange={setZoneRadius}
                onSlidingComplete={async (value) => {
                  await AsyncStorage.setItem('cachedRadius', value.toString());
                  loadServicesNearZone();
                }}
                minimumTrackTintColor="#1bc47d"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#1bc47d"
              />
              <Text style={styles.radiusValue}>{(zoneRadius / 1000).toFixed(1)} km</Text>
            </View>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filtersBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9aa5b1"
          />
          <Text style={styles.tagsTitle}>Filtrar por tags:</Text>

          <TextInput
            style={styles.tagSearchBar}
            placeholder="Escribir tag a buscar"
            placeholderTextColor="#9aa5b1"
            value={tagSearchQuery}
            onChangeText={setTagSearchQuery}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.availableTagsScroll}>
            {availableTags.filter(tag => tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase())).map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[styles.availableTagChip, selectedTags.includes(tag.id) && styles.availableTagChipSelected]}
                onPress={() => (selectedTags.includes(tag.id) ? removeTag(tag.id) : addTag(tag))}
              >
                <Text style={[styles.availableTagText, selectedTags.includes(tag.id) && styles.availableTagTextSelected]}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Lista de servicios */}
        <View style={styles.servicesList}>
          <Text style={styles.listTitle}>Servicios encontrados</Text>
          <FlatList
            horizontal
            data={filteredServices}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.serviceCard}
                onPress={() => {
                  setSelectedService(item);
                  setServiceDetailsVisible(true);
                }}
              >
                <Image
                  source={{
                    uri: item.cover_image_url
                      ? `${SERVER_BASE_URL}${item.cover_image_url}`
                      : 'https://via.placeholder.com/150x100?text=No+Image',
                  }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.tagsRow}>
                    {item.tags?.slice(0, 2).map((tag) => (
                      <View key={tag.id} style={styles.smallTag}>
                        <Text style={styles.smallTagText}>{tag.name}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.cardAddress} numberOfLines={1}>
                    📍 {item.address_text}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        <ServiceDetailsModal
          visible={serviceDetailsVisible}
          service={selectedService}
          onClose={() => setServiceDetailsVisible(false)}
        />
        <ReviewsModal
          visible={reviewsVisible}
          service={selectedService}
          onClose={() => setReviewsVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fcff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fcff' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#1bc47d' },

  mapWrapper: { height: 400, margin: 16, borderRadius: 16, overflow: 'hidden', elevation: 3, backgroundColor: '#fff', borderWidth: 0 },
  map: { flex: 1, borderRadius: 16, borderWidth: 0 },
  mapButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, borderWidth: 0 },
  mapButton: {
    backgroundColor: '#1bc47d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  mapButtonText: { color: 'white', fontWeight: '700' },

  radiusControl: { alignItems: 'center', marginVertical: 10 },
  sliderLabel: { fontSize: 15, color: '#1e293b', fontWeight: '700', marginBottom: 6 },
  slider: { width: 240, height: 40 },
  radiusValue: { fontSize: 13, color: '#1bc47d', fontWeight: '700', marginTop: 4 },

  filtersBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    elevation: 2,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e6eef5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#f7faf9',
    marginBottom: 10,
  },
  tagsTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  tagSearchBar: {
    borderWidth: 1,
    borderColor: '#e6eef5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#f7faf9',
    marginBottom: 8,
  },
  availableTagsScroll: { flexDirection: 'row' },
  availableTagChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  availableTagChipSelected: { backgroundColor: '#1bc47d' },
  availableTagText: { color: '#222' },
  availableTagTextSelected: { color: '#fff' },

  servicesList: { marginTop: 16, paddingHorizontal: 16 },
  listTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginRight: 12,
    width: 200,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 110 },
  cardContent: { padding: 10 },
  cardTitle: { fontWeight: '700', fontSize: 15, color: '#222' },
  cardDescription: { color: '#64748b', fontSize: 13, marginVertical: 4 },
  cardAddress: { color: '#1bc47d', fontSize: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'nowrap', marginTop: 4, overflow: 'hidden' },
  smallTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  smallTagText: { fontSize: 10, color: '#1bc47d', fontWeight: '500' },
  customMarker: {
    backgroundColor: '#1bc47d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  customMarkerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

