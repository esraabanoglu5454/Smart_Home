import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import apiService from '../services/api';
import DeviceCard from '../components/DeviceCard';
import SensorCard from '../components/SensorCard';

const HomeScreen = ({ onNavigate }) => {
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [devicesResponse, sensorsResponse] = await Promise.all([
        apiService.getDevices(),
        apiService.getSensors(),
      ]);

      if (devicesResponse.success) {
        setDevices(devicesResponse.data);
      }
      if (sensorsResponse.success) {
        setSensors(sensorsResponse.data);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // const activeDevices = devices.filter(d => d.status).length;
  // const totalDevices = devices.length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Akıllı Evim</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <>
          {/* İstatistikler */}
          {/* <View style={styles.statsContainer}> */}
            {/* <View style={styles.statCard}>
              <Text style={styles.statValue}>{activeDevices}/{totalDevices}</Text>
              <Text style={styles.statLabel}>Aktif Cihazlar</Text>
            </View> */}
            {/* <View style={styles.statCard}>
              <Text style={styles.statValue}>{sensors.length}</Text>
              <Text style={styles.statLabel}>Sensörler</Text>
            </View>
          </View> */}

          {/* Hızlı Erişim */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
            <View style={styles.quickAccess}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => onNavigate('devices')}
              >
                <Text style={styles.quickIcon}>🎮</Text>
                <Text style={styles.quickLabel}>Modlar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => onNavigate('sensors')}
              >
                <Text style={styles.quickIcon}>🎛️</Text>
                <Text style={styles.quickLabel}>Sensörler</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Son Sensör Verileri */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aktif Cihazlar</Text>
            {sensors.slice(0, 3).map(sensor => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );

  async function handleToggleDevice(deviceId) {
    const response = await apiService.toggleDevice(deviceId);
    if (response.success) {
      setDevices(prevDevices =>
        prevDevices.map(device =>
          device.id === deviceId
            ? { ...device, status: response.data.status }
            : device
        )
      );
    }
  }
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e3f2fd',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickAccess: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontSize: 14,
  },
});

export default HomeScreen;

