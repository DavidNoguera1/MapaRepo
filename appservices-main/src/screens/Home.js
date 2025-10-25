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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getServices, getTags } from '../api/services';
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
  const [zoneRadius] = useState(1000);
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [serviceDetailsVisible, setServiceDetailsVisible] = useState(false);

  useEffect(() => {
    loadCachedLocation();
    requestLocationPermission();
    loadTags();
    loadServices();
  }, []);

  const loadCachedLocation = async () => {
    try {
      const cachedLat = await AsyncStorage.getItem('cachedLat');
      const cachedLng = await AsyncStorage.getItem('cachedLng');
      if (cachedLat && cachedLng) {
        setZoneCenter({
          latitude: parseFloat(cachedLat),
          longitude: parseFloat(cachedLng),
        });
      }
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
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
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
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
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
    if (!selectedTags.includes(tag.id)) {
      setSelectedTags((prev) => [...prev, tag.id]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagId) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = query === '' || (service.title || '').toLowerCase().includes(query.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tagId) => service.tags?.some((tag) => tag.id === tagId));
    return matchesSearch && matchesTags;
  });

  const filteredRecentServices = allServices
    .filter((service) => {
      const matchesSearch = query === '' || (service.title || '').toLowerCase().includes(query.toLowerCase());
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tagId) => service.tags?.some((tag) => tag.id === tagId));
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
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenido de vuelta 👋</Text>
        <Text style={styles.appTitle}>ServiMapa</Text>
        <Text style={styles.subtitle}>Descubre y conecta con servicios cerca de ti</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9aa5b1" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar servicios, oficios..."
          placeholderTextColor="#9aa5b1"
          value={query}
          onChangeText={setQuery}
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios Cercanos</Text>
        <FlatList
          horizontal
          data={nearbyServices}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
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
                    : 'https://via.placeholder.com/150x100?text=No+Image',
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
                <View style={styles.tagsRow}>
                  {item.tags?.slice(0, 2).map((tag) => (
                    <View key={tag.id} style={styles.smallTag}>
                      <Text style={styles.smallTagText}>{tag.name}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.cardLocation} numberOfLines={1}>
                  📍 {item.address_text}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios Añadidos Recientemente</Text>
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
                    : 'https://via.placeholder.com/150x100?text=No+Image',
                }}
                style={styles.gridImage}
                resizeMode="cover"
              />
              <Text style={styles.gridTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.tagsRow}>
                {item.tags?.slice(0, 2).map((tag) => (
                  <View key={tag.id} style={styles.smallTag}>
                    <Text style={styles.smallTagText}>{tag.name}</Text>
                  </View>
                ))}
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
  container: { padding: 20, backgroundColor: '#f9fcff' },
  header: { marginBottom: 20 },
  welcomeText: { fontSize: 18, color: '#1e293b', fontWeight: '500' },
  appTitle: { fontSize: 28, fontWeight: '800', color: '#1bc47d', marginTop: 4 },
  subtitle: { color: '#64748b', marginTop: 2 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fcff' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#64748b' },

  searchContainer: { position: 'relative', marginBottom: 16 },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 40,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e6eef5',
    elevation: 2,
  },
  searchIcon: { position: 'absolute', left: 16, top: 12 },

  tagsTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 14, marginBottom: 8 },
  tagSearchBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#222',
    borderWidth: 1,
    borderColor: '#e6eef5',
    elevation: 2,
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
  availableTagText: { fontSize: 14, color: '#222' },
  availableTagTextSelected: { color: 'white' },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 14,
    width: 200,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 110 },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#222' },
  cardDesc: { fontSize: 13, color: '#64748b', marginVertical: 4 },
  cardLocation: { color: '#1bc47d', fontSize: 12, marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'nowrap', marginTop: 4, overflow: 'hidden' },
  smallTag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  smallTagText: { fontSize: 10, color: '#1bc47d', fontWeight: '500' },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    width: CARD_WIDTH,
    padding: 10,
    elevation: 3,
  },
  gridImage: { width: '100%', height: 110, borderRadius: 10 },
  gridTitle: { fontWeight: '700', color: '#1e293b', marginTop: 6, fontSize: 14 },
});
