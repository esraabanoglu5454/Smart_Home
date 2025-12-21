import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const AiAgentScreen = ({ onNavigate }) => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Merhaba! Ben sizin akıllı ev asistanınızım. Size nasıl yardımcı olabilirim?',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const flatListRef = useRef();

    const handleSendMessage = () => {
        if (inputText.trim() === '') return;

        const newUserMessage = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputText('');

        // Simüle edilmiş AI cevabı
        setTimeout(() => {
            const aiResponse = {
                id: (Date.now() + 1).toString(),
                text: 'Anladım. İsteğiniz üzerinde çalışıyorum...',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, aiResponse]);
        }, 1000);
    };

    const toggleListening = () => {
        setIsListening(!isListening);
        // Gerçek bir uygulamada burada ses tanıma başlatılır
    };

    const renderMessage = ({ item }) => (
        <View
            style={[
                styles.messageContainer,
                item.sender === 'user' ? styles.userMessage : styles.aiMessage,
            ]}
        >
            <View
                style={[
                    styles.messageBubble,
                    item.sender === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
            >
                <Text
                    style={[
                        styles.messageText,
                        item.sender === 'user' ? styles.userText : styles.aiText,
                    ]}
                >
                    {item.text}
                </Text>
                <Text
                    style={[
                        styles.timestamp,
                        item.sender === 'user' ? styles.userTimestamp : styles.aiTimestamp,
                    ]}
                >
                    {item.timestamp}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>AI Asistan</Text>
                    <View style={styles.onlineStatus}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Çevrimiçi</Text>
                    </View>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isListening && (
                <View style={styles.listeningOverlay}>
                    <Text style={styles.listeningText}>Dinliyorum...</Text>
                    <View style={styles.listeningWaves}>
                        {[1, 2, 3].map((i) => (
                            <View key={i} style={styles.wave} />
                        ))}
                    </View>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputArea}>
                    <TouchableOpacity
                        style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
                        onPress={toggleListening}
                    >
                        <Text style={styles.voiceIcon}>{isListening ? '🛑' : '🎤'}</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Mesajınızı yazın..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSendMessage}
                        disabled={!inputText.trim()}
                    >
                        <Text style={styles.sendIcon}>➔</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    backButtonText: {
        fontSize: 24,
        color: '#44436A',
        fontWeight: 'bold',
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 6,
    },
    onlineText: {
        fontSize: 12,
        color: '#666',
    },
    chatContent: {
        padding: 16,
        paddingBottom: 32,
    },
    messageContainer: {
        marginBottom: 16,
        flexDirection: 'row',
        width: '100%',
    },
    userMessage: {
        justifyContent: 'flex-end',
    },
    aiMessage: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    userBubble: {
        backgroundColor: '#44436A',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: '#FFFFFF',
    },
    aiText: {
        color: '#333333',
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    userTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    aiTimestamp: {
        color: '#999',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F2F5',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        maxHeight: 100,
        fontSize: 15,
    },
    voiceButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F2F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceButtonActive: {
        backgroundColor: '#FF5252',
    },
    voiceIcon: {
        fontSize: 20,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#44436A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#BDBDBD',
    },
    sendIcon: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    listeningOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(68, 67, 106, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    listeningText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    listeningWaves: {
        flexDirection: 'row',
        height: 40,
        alignItems: 'center',
    },
    wave: {
        width: 4,
        height: 20,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 2,
        borderRadius: 2,
    },
});

export default AiAgentScreen;
