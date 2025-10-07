import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const favorites = [
  {
    id: '1',
    name: 'Cerámica Luna',
    description: 'Piezas únicas',
    image: require('../../assets/adaptive-icon.png'), // Placeholder image
  },
  {
    id: '2',
    name: 'Costuras Ana',
    description: 'Ajustes rápidos',
    image: require('../../assets/adaptive-icon.png'), // Placeholder image
  },
];

const FavoriteCard = ({ item }) => (
  <View style={styles.card}>
    <Image source={item.image} style={styles.image} />
    <Text style={styles.title}>{item.name}</Text>
    <Text style={styles.desc}>{item.description}</Text>
  </View>
);

export default function Favourites() {
  return (
  <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Favoritos</Text>
      <Text style={styles.subheader}>Tus servicios guardados</Text>
      <FlatList
        data={favorites}
        renderItem={FavoriteCard}
        keyExtractor={item => item.id}
        horizontal={false}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1E293B',
  },
  subheader: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 18,
  },
  list: {
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    padding: 10,
    alignItems: 'flex-start',
    elevation: 2,
    minWidth: 150,
    maxWidth: '48%',
  },
  image: {
    width: 120,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    color: '#64748B',
  },
});
