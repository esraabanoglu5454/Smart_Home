import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

const AiToggleButton = ({ onPress }) => {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={styles.icon}>🤖</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        right: 20,
        bottom: 90, // NavigationBar'ın üzerinde durması için
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#44436A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    icon: {
        fontSize: 30,
    },
});

export default AiToggleButton;
