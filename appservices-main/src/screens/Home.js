import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getServices, getServicesNearMe, getTags } from '../api/services';
import { useUser } from '../contexts/UserContext';
import { SERVER_BASE_URL } from '../api/config';
import ServiceDetailsModal from './components/ServiceDetailsModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function Home() {
  const { user } = useUser();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [zoneCenter, setZoneCenter] = useState(null);
  const [zoneRadius, setZoneRadius] = useState(1000);
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetailsVisible, setServiceDetailsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 🚀 Cada 5 segundos revisa si la zona cambió desde Map.js
  useEffect(() => {
    const interval = setInterval(async () => {
      const cachedLat = await AsyncStorage.getItem('cachedLat');
      const cachedLng = await AsyncStorage.getItem('cachedLng');
      const cachedRadius = await AsyncStorage.getItem('cachedRadius');
      if (cachedLat && cachedLng) {
        const newCenter = {
          latitude: parseFloat(cachedLat),
          longitude: parseFloat(cachedLng),
        };
        if (
          !zoneCenter ||
          newCenter.latitude !== zoneCenter.latitude ||
          newCenter.longitude !== zoneCenter.longitude ||
          parseFloat(cachedRadius) !== zoneRadius
        ) {
          setZoneCenter(newCenter);
          setZoneRadius(parseFloat(cachedRadius) || 1000);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [zoneCenter, zoneRadius]);

  useEffect(() => {
    loadCachedLocation();
    requestLocationPermission();
    loadTags();
  }, []);

  useEffect(() => {
    if (zoneCenter) {
      loadServicesNearZone();
    } else {
      loadServices();
    }
  }, [zoneCenter, zoneRadius]);

  const loadCachedLocation = async () => {
    try {
      const cachedLat = await AsyncStorage.getItem('cachedLat');
      const cachedLng = await AsyncStorage.getItem('cachedLng');
      const cachedRadius = await AsyncStorage.getItem('cachedRadius');
      if (cachedLat && cachedLng) {
        setZoneCenter({
          latitude: parseFloat(cachedLat),
          longitude: parseFloat(cachedLng),
        });
      }
      if (cachedRadius) setZoneRadius(parseFloat(cachedRadius));
    } catch (error) {
      console.error('Error loading cached location:', error);
    }
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
      await AsyncStorage.setItem('cachedLat', coords.latitude.toString());
      await AsyncStorage.setItem('cachedLng', coords.longitude.toString());
      setLoading(false);
    } catch (error) {
      setErrorMsg('Error obteniendo ubicación');
      setLoading(false);
    }
  };

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await getServices(100, 0, '');
      setServices(data.services || []);
      setAllServices(data.services || []);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
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

  const onRefresh = async () => {
    setRefreshing(true);
    if (zoneCenter) await loadServicesNearZone();
    else await loadServices();
    await loadTags();
    setRefreshing(false);
  };

  const loadTags = async () => {
    try {
      const data = await getTags(user.token);
      setAvailableTags(data.tags || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const addTag = (tag) => {
    if (!selectedTags.includes(tag.id)) setSelectedTags((prev) => [...prev, tag.id]);
    else setSelectedTags((prev) => prev.filter((id) => id !== tag.id));
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = query === '' || (service.title || '').toLowerCase().includes(query.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tagId) => service.tags?.some((tag) => tag.id === tagId));
    return matchesSearch && matchesTags;
  });

  const filteredRecentServices = allServices
    .filter((service) => {
      const matchesSearch = query === '' || (service.title || '').toLowerCase().includes(query.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 || selectedTags.some((tagId) => service.tags?.some((tag) => tag.id === tagId));
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const nearbyServices = filteredServices.slice(0, 4);
  const recentServices = filteredRecentServices.slice(0, 8);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1bc47d" />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1bc47d']} tintColor={'#1bc47d'} />
      }
    >
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>Bienvenido de vuelta</Text>
          <Text style={styles.appTitle}>ServiMapa</Text>
          <Text style={styles.subtitle}>Encuentra servicios y emprendimientos locales cerca de ti</Text>
          <View style={styles.metaRow}>
            <View style={styles.locationChip}>
              <Feather name="map-pin" size={14} color="#0f5132" />
              <Text style={styles.locationText}>
                {location ? 'Zona activa sincronizada' : 'Ubicación no disponible'}
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{services?.length || 0}</Text>
              <Text style={styles.countLabel}>servicios</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9aa5b1" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar servicios o negocios..."
          placeholderTextColor="#9aa5b1"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setQuery('')}>
            <Feather name="x" size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        <Text style={styles.tagsTitle}>Filtrar por tags</Text>

        <TextInput
          style={styles.tagSearchBar}
          placeholder="Buscar tag..."
          placeholderTextColor="#9aa5b1"
          value={tagSearchQuery}
          onChangeText={setTagSearchQuery}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.availableTagsScroll}>
          {availableTags
            .filter((tag) => tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()))
            .map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.availableTagChip, isSelected && styles.availableTagChipSelected]}
                  onPress={() => addTag(tag)}
                >
                  <Text style={[styles.availableTagText, isSelected && styles.availableTagTextSelected]}>
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Nearby Services */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Servicios Cercanos</Text>
          <Text style={styles.sectionAction}>{nearbyServices.length} encontrados</Text>
        </View>

        <FlatList
          horizontal
          data={nearbyServices}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 2 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                setSelectedService(item);
                setServiceDetailsVisible(true);
              }}
            >
              <Image
                source={{
                  uri: item.cover_image_url
                    ? `${SERVER_BASE_URL}${item.cover_image_url}`
                    : 'https://via.placeholder.com/300x180?text=No+Image',
                }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.description}
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.tagsRow}
                  contentContainerStyle={styles.tagsRowContent}
                >
                  {item.tags?.slice(0, 3).map((tag) => (
                    <View key={tag.id} style={styles.smallTag}>
                      <Text style={styles.smallTagText}>{tag.name}</Text>
                    </View>
                  ))}
                </ScrollView>
                <Text style={styles.cardLocation} numberOfLines={1}>
                  📍 {item.address_text || '—'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Recent Services */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Añadidos recientemente</Text>
          <Text style={styles.sectionAction}>{recentServices.length} nuevos</Text>
        </View>

        <View style={styles.gridContainer}>
          {recentServices.map((item) => (
            <TouchableOpacity
              key={item.id.toString()}
              style={styles.gridCard}
              onPress={() => {
                setSelectedService(item);
                setServiceDetailsVisible(true);
              }}
            >
              <Image
                source={{
                  uri: item.cover_image_url
                    ? `${SERVER_BASE_URL}${item.cover_image_url}`
                    : 'https://via.placeholder.com/300x180?text=No+Image',
                }}
                style={styles.gridImage}
                resizeMode="cover"
              />
              <View style={styles.gridInfo}>
                <Text style={styles.gridTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.gridTagsScroll}
                  contentContainerStyle={styles.gridTagsContent}
                >
                  <View style={styles.gridMeta}>
                    {item.tags?.slice(0, 3).map((tag) => (
                      <View key={tag.id} style={styles.smallTagGrid}>
                        <Text style={styles.smallTagTextGrid}>{tag.name}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ServiceDetailsModal
        visible={serviceDetailsVisible}
        service={selectedService}
        onClose={() => {
          setServiceDetailsVisible(false);
          setSelectedService(null);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 40, backgroundColor: '#f6fbfd' },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
    ...Platform.select({
      ios: { shadowColor: '#0a7b53', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 6 },
    }),
  },
  headerLeft: { flex: 1 },
  welcomeText: { fontSize: 14, color: '#394149', fontWeight: '500' },
  appTitle: { fontSize: 26, fontWeight: '900', color: '#1bc47d', marginTop: 4 },
  subtitle: { color: '#64748b', marginTop: 6, fontSize: 13 },
  metaRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'space-between' },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6fff3',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cff7df',
  },
  locationText: { marginLeft: 8, color: '#0f5132', fontSize: 12, fontWeight: '600' },
  countBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fffa',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6f8ef',
  },
  countText: { color: '#0b5a3b', fontWeight: '800', fontSize: 14 },
  countLabel: { color: '#0b5a3b', fontSize: 11 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f6fbfd' },
  loadingText: { marginTop: 10, fontSize: 15, color: '#64748b' },
  searchContainer: { marginBottom: 12, position: 'relative' },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingLeft: 44,
    paddingRight: 40,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eaf5f0',
  },
  searchIcon: { position: 'absolute', left: 14, top: 14 },
  clearButton: { position: 'absolute', right: 12, top: 12 },
  tagsContainer: { marginBottom: 8 },
  tagsTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  tagSearchBar: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#222',
    borderWidth: 1,
    borderColor: '#eef7f1',
    marginBottom: 10,
  },
  availableTagsScroll: { flexDirection: 'row', paddingBottom: 6 },
  availableTagChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eef7f1',
  },
  availableTagChipSelected: { backgroundColor: '#1bc47d', borderColor: '#19a86b' },
  availableTagText: { fontSize: 13, color: '#263238', fontWeight: '600' },
  availableTagTextSelected: { color: '#fff' },
  section: { marginTop: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  sectionAction: { fontSize: 13, color: '#64748b' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginRight: 14,
    width: 210,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#0a7b53', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 4 },
    }),
  },
  cardImage: { width: '100%', height: 120 },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#12343a' },
  cardDesc: { fontSize: 13, color: '#64748b', marginTop: 6 },
  tagsRow: { 
    flexDirection: 'row', 
    marginTop: 6,
    maxHeight: 32,
  },
  tagsRowContent: {
    flexGrow: 1,
  },
  smallTag: {
    backgroundColor: '#e8fbf2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#dff6eb',
  },
  smallTagText: { fontSize: 11, color: '#0b5a3b', fontWeight: '700' },
  cardLocation: { color: '#1bc47d', fontSize: 12, marginTop: 6, fontWeight: '600' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    width: CARD_WIDTH,
    padding: 10,
    ...Platform.select({
      ios: { shadowColor: '#0a7b53', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  gridImage: { width: '100%', height: 110, borderRadius: 10 },
  gridInfo: { marginTop: 8 },
  gridTitle: { fontWeight: '800', color: '#1e293b', fontSize: 14 },
  gridTagsScroll: {
    maxHeight: 28,
  },
  gridTagsContent: {
    flexGrow: 1,
  },
  gridMeta: { 
    flexDirection: 'row', 
    flexWrap: 'nowrap',
  },
  smallTagGrid: {
    backgroundColor: '#f0fbf7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#e6f7ef',
    flexShrink: 1,
  },
  smallTagTextGrid: { fontSize: 11, color: '#0f5132', fontWeight: '700' },
});