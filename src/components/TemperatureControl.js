// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// const TemperatureControl = ({ device, onToggle, onTemperatureChange }) => {
//   const handleDecrease = () => {
//     if (device.temperature > 16) {
//       onTemperatureChange(device.temperature - 1);
//     }
//   };

//   const handleIncrease = () => {
//     if (device.temperature < 30) {
//       onTemperatureChange(device.temperature + 1);
//     }
//   };

//   return (
//     <View style={[styles.card, device.status && styles.cardActive]}>
//       <View style={styles.header}>
//         <View style={styles.leftSection}>
//           <Text style={styles.icon}>{device.icon}</Text>
//           <View style={styles.info}>
//             <Text style={styles.name}>{device.name}</Text>
//             <Text style={styles.room}>{device.room}</Text>
//           </View>
//         </View>
//         <TouchableOpacity
//           style={[
//             styles.toggleButton,
//             device.status && styles.toggleButtonActive,
//           ]}
//           onPress={onToggle}
//         >
//           <Text style={styles.toggleText}>{device.status ? 'Açık' : 'Kapalı'}</Text>
//         </TouchableOpacity>
//       </View>

//       {device.status && (
//         <View style={styles.controlSection}>
//           <TouchableOpacity
//             style={styles.tempButton}
//             onPress={handleDecrease}
//             disabled={device.temperature <= 16}
//           >
//             <Text style={styles.tempButtonText}>−</Text>
//           </TouchableOpacity>

//           <View style={styles.temperatureDisplay}>
//             <Text style={styles.temperatureValue}>{device.temperature}</Text>
//             <Text style={styles.temperatureUnit}>°C</Text>
//           </View>

//           <TouchableOpacity
//             style={styles.tempButton}
//             onPress={handleIncrease}
//             disabled={device.temperature >= 30}
//           >
//             <Text style={styles.tempButtonText}>+</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardActive: {
//     borderLeftWidth: 4,
//     borderLeftColor: '#4caf50',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   leftSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   icon: {
//     fontSize: 32,
//     marginRight: 12,
//   },
//   info: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 4,
//   },
//   room: {
//     fontSize: 14,
//     color: '#666',
//   },
//   toggleButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#e0e0e0',
//   },
//   toggleButtonActive: {
//     backgroundColor: '#4caf50',
//   },
//   toggleText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   controlSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   tempButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#1976d2',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tempButtonText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#ffffff',
//   },
//   temperatureDisplay: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//     marginHorizontal: 24,
//   },
//   temperatureValue: {
//     fontSize: 48,
//     fontWeight: 'bold',
//     color: '#1976d2',
//   },
//   temperatureUnit: {
//     fontSize: 24,
//     color: '#666',
//     marginLeft: 4,
//   },
// });

// export default TemperatureControl;

