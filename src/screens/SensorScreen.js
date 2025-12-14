import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import apiService from '../services/api';
import SensorCard from '../components/SensorCard';

const SensorScreen = ({ onNavigate }) => {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadSensors();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadSensors();
      }, 5000); // Her 5 saniyede bir güncelle
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadSensors = async () => {
    try {
      const response = await apiService.getSensors();
      if (response.success) {
        setSensors(response.data);
      }
    } catch (error) {
      console.error('Sensör yükleme hatası:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSensors();
  };

  const rooms = ['all', ...new Set(sensors.map(s => s.room))];
  const filteredSensors =
    selectedRoom === 'all'
      ? sensors
      : sensors.filter(s => s.room === selectedRoom);

  const groupedSensors = filteredSensors.reduce((acc, sensor) => {
    if (!acc[sensor.room]) {
      acc[sensor.room] = [];
    }
    acc[sensor.room].push(sensor);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensör Verileri</Text>
      </View>

     

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Object.keys(groupedSensors).map(room => (
            <View key={room} style={styles.roomSection}>
              <Text style={styles.roomTitle}>{room}</Text>
              {groupedSensors[room].map(sensor => (
                <SensorCard key={sensor.id} sensor={sensor} />
              ))}
            </View>
          ))}
          {filteredSensors.length === 0 && (
            <Text style={styles.emptyText}>
              Bu odada sensör bulunamadı
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#44436A',
    padding: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  autoRefreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  autoRefreshText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#1976d2',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  roomSection: {
    marginBottom: 24,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 40,
    fontSize: 16,
  },
});

export default SensorScreen;

