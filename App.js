import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import DeviceControlScreen from './src/screens/DeviceControlScreen';
import SensorScreen from './src/screens/SensorScreen';
import ModesScreen from './src/screens/HomeScreen';
import NavigationBar from './src/components/NavigationBar';
import AiToggleButton from './src/components/AiToggleButton';
import AiAgentScreen from './src/screens/AiAgentScreen';
import { connectMQTT } from './src/services/mqttService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  useEffect(() => {
    const client = connectMQTT();

    const handleMessage = (topic, message) => {
      // Gaz uyarısı
      if (topic === "home/gas/warning") {
        Alert.alert(
          '🚨 GAZ UYARISI!',
          'Gaz sensörü tetiklendi! Lütfen kontrol edin.',
          [
            {
              text: 'Tamam',
              style: 'destructive'
            }
          ],
          { cancelable: false }
        );
      }

      // Alt kat hareket uyarısı
      else if (topic === "home/pir/warning") {
        Alert.alert(
          '⚠️ HAREKET ALGILANDI!',
          'Alt katta hareket algılandı!',
          [
            {
              text: 'Tamam',
              style: 'default'
            }
          ]
        );
      }

      // Üst kat hareket uyarısı
      else if (topic === "home/pir2/warning") {
        Alert.alert(
          '⚠️ HAREKET ALGILANDI!',
          'Üst katta hareket algılandı!',
          [
            {
              text: 'Tamam',
              style: 'default'
            }
          ]
        );
      }

      // Su uyarısı
      else if (topic === "home/water/warning") {
        Alert.alert(
          '💧 SU UYARISI!',
          'Su sensörü tetiklendi! Yağmur başlıyor olabilir!',
          [
            {
              text: 'Tamam',
              style: 'destructive'
            }
          ],
          { cancelable: false }
        );
      }
    };

    client.on("message", handleMessage);

    return () => {
      client.off("message", handleMessage);
    };
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'devices':
        return <DeviceControlScreen onNavigate={setCurrentScreen} />;
      case 'sensors':
        return <SensorScreen onNavigate={setCurrentScreen} />;
      case 'modes':
        return <ModesScreen onNavigate={setCurrentScreen} />;
      case 'ai':
        return <AiAgentScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      {currentScreen !== 'ai' && (
        <AiToggleButton onPress={() => setCurrentScreen('ai')} />
      )}
      <NavigationBar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});