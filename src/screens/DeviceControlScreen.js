import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Switch,
    Alert,
    Image
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { connectMQTT } from "../services/mqttService";

const formatBackendTime = (raw) => {
    if (!raw) return "";

    const iso = raw.replace(" ", "T").slice(0, 23);
    const date = new Date(iso);

    return date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// Modlar tanımları - Component dışında
const availableModes = [
    {
        id: "vacation",
        name: "Tatil Modu",
        icon: "airplane",
        color: "#FF6B6B",
        description: "Hareket algılandığında bildirim gönderir",
        sensors: ["motion"],
        actions: [
            "Hareket algılandığında bildirim gönder",
            "Tüm ışıkları kapat",
        ],
    },
    {
        id: "sleep",
        name: "Uyku Modu",
        icon: "moon",
        color: "#4ECDC4",
        description: "Gece için optimal ayarlar",
        sensors: ["motion", "light"],
        actions: ["Tüm ışıkları kapat", "Perdeleri kapat"],
    },
    {
        id: "away",
        name: "Evde Değilim",
        icon: "lock-closed",
        color: "#95E1D3",
        description: "Güvenlik öncelikli mod",
        sensors: ["motion", "gas", "water"],
        actions: [
            "Hareket algılandığında bildirim",
            "Gaz kaçağında bildirim ve alarm",
            "Su kaçağında ana vana kapatma uyarısı",
        ],
    },
    {
        id: "morning",
        name: "Günaydın Modu",
        icon: "sunny",
        color: "#FFD93D",
        description: "Sabah rutini",
        sensors: ["yellow", "navy", "temperature"],
        actions: ["Perdeleri aç", "Işıkları aç"],
    },
];

const ModesScreen = ({ onNavigate }) => {
    const [activeMode, setActiveMode] = useState(null); // Artık sadece tek bir mod aktif olacak
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Sensör state'leri
    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const [temperatureTime, setTemperatureTime] = useState("");
    const [pir, setPir] = useState(false);
    const [pirTime, setPirTime] = useState("");
    const [pir2, setPir2] = useState(false);
    const [pirTime2, setPirTime2] = useState("");
    const [gas, setGas] = useState(false);
    const [gasTime, setGasTime] = useState("");

    useEffect(() => {
        const client = connectMQTT();
        loadModes();

        const handleMessage = (topic, message) => {
            if (topic == "home/temperature/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setTemperature(data.temperature);
                setHumidity(data.humidity);
                setTemperatureTime(data.time);
            } else if (topic == "home/pir/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setPir(data.miniPirValue);
                setPirTime(data.time);

                // Hareket algılandığında mod kontrolü
                if (data.miniPirValue) {
                    checkMotionAlert();
                }
            } else if (topic == "home/pir2/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setPir2(data.miniPir2Value);
                setPirTime2(data.time);

                // Hareket algılandığında mod kontrolü
                if (data.miniPir2Value) {
                    checkMotionAlert();
                }
            } else if (topic == "home/gas/value") {
                const raw = message.toString();
                const data = JSON.parse(raw);

                setGas(data.gasValue);
                setGasTime(data.time);

                // Gaz algılandığında mod kontrolü
                if (data.gasValue === 0) {
                    checkGasAlert();
                }
            }
        };

        client.on("message", handleMessage);
        return () => {
            client.off("message", handleMessage);
        };
    }, [activeMode]); // activeMode'u dependency'ye ekledik

    const loadModes = () => {
        const client = connectMQTT();
        setLoading(true);
        try {
            client.publish("home/value/temperature", "GET");
            client.publish("home/value/pir", "GET");
            client.publish("home/value/pir2", "GET");
            client.publish("home/value/gas", "GET");
        } catch (error) {
            console.error("Mod yükleme hatası:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const checkMotionAlert = () => {
        if (!activeMode) return;

        const mode = availableModes.find((m) => m.id === activeMode);
        if (!mode) return;

        if (
            mode.id === "vacation" ||
            mode.id === "away" ||
            mode.id === "security"
        ) {
            sendAlert(
                "⚠️ Hareket Algılandı",
                "Evinizde hareket tespit edildi!"
            );
        }
    };

    const checkGasAlert = () => {
        if (!activeMode) return;

        const mode = availableModes.find((m) => m.id === activeMode);
        if (!mode) return;

        if (mode.id === "away" || mode.id === "security") {
            sendAlert("🚨 GAZ ALGILANDI!", "Gaz sensörü tetiklendi!");
        }
    };

    const sendAlert = (title, message) => {
        Alert.alert(title, message, [{ text: "Tamam", style: "default" }]);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadModes();
    };

    // Mod aktivasyon fonksiyonları
    const activateVacationMode = () => {
        console.log("🏖️ Tatil Modu Aktif");
        const client = connectMQTT();
        client.publish("home/pir", "ON");
        client.publish("home/pir2", "ON");
        client.publish("home/gas", "ON");
        client.publish("home/water", "ON");

        client.publish("home/yellow", "OFF");
        client.publish("home/navy", "OFF");
        client.publish("home/curtain", "OFF");

    };

    const activateSleepMode = () => {
        console.log("🌙 Uyku Modu Aktif");
        const client = connectMQTT();
        client.publish("home/yellow", "OFF");
        client.publish("home/navy", "OFF");
        client.publish("home/curtain", "OFF");

        client.publish("home/pir", "ON");
        client.publish("home/pir2", "ON");
        client.publish("home/gas", "ON");
        client.publish("home/water", "ON");

    };

    const activateAwayMode = () => {
        console.log("🔒 Evde Değilim Modu Aktif");
        const client = connectMQTT();
        client.publish("home/pir", "ON");
        client.publish("home/pir2", "ON");
        client.publish("home/gas", "ON");
        client.publish("home/water", "ON");

        client.publish("home/yellow", "OFF");
        client.publish("home/navy", "OFF");
        client.publish("home/curtain", "OFF");
    };

    const activateMorningMode = () => {
        console.log("☀️ Günaydın Modu Aktif");
        const client = connectMQTT();
        client.publish("home/yellow", "OFF");
        client.publish("home/navy", "OFF");

        client.publish("home/curtain", "ON");
        client.publish("home/pir", "ON");
        client.publish("home/pir2", "ON");
        client.publish("home/gas", "ON");
        client.publish("home/water", "ON");
    };

    const deactivateMode = (modeId) => {
        console.log(`❌ ${modeId} Modu Deaktif`);
        const client = connectMQTT();
        client.publish("home/pir", "ON");
        client.publish("home/pir2", "ON");
        client.publish("home/gas", "ON");
        client.publish("home/water", "ON");
        client.publish("home/yellow", "ON");
        client.publish("home/navy", "ON");
        client.publish("home/curtain", "OFF");
    };

    // Mod değişikliklerini dinle ve ilgili fonksiyonu çalıştır
    useEffect(() => {
        if (activeMode === null) {
            // Tüm modlar kapalı
            return;
        }

        // Aktif mod değiştiğinde ilgili fonksiyonu çalıştır
        switch (activeMode) {
            case "vacation":
                activateVacationMode();
                break;
            case "sleep":
                activateSleepMode();
                break;
            case "away":
                activateAwayMode();
                break;
            case "morning":
                activateMorningMode();
                break;
            default:
                console.log("Bilinmeyen mod:", activeMode);
        }

        // Cleanup function - önceki mod kapanırken
        return () => {
            if (activeMode) {
                deactivateMode(activeMode);
            }
        };
    }, [activeMode]);

    const handleToggleMode = (modeId) => {
        // Eğer aynı mod tekrar seçilirse kapat, değilse yeni modu aç
        if (activeMode === modeId) {
            setActiveMode(null);
        } else {
            setActiveMode(modeId);
        }
    };

    const renderSensorStatus = () => {
        return (
            <View style={styles.sensorContainer}>
                <Text style={styles.sectionTitle}>Sensör Durumu</Text>

                <View style={styles.sensorGrid}>
                    {/* Alt Kat Hareket Sensörü */}
                    <View style={styles.sensorCard}>
                        <Ionicons
                            name={pir ? "walk-outline" : "walk"}
                            size={24}
                            color={pir ? "#008000" : "#800080"}
                        />
                        <Text style={styles.sensorLabel}>Alt Kat</Text>
                        <Text
                            style={[
                                styles.sensorValue,
                            ]}
                        >
                            {formatBackendTime(pirTime)}
                        </Text>
                    </View>

                    {/* Üst Kat Hareket Sensörü */}
                    <View style={styles.sensorCard}>
                        <Ionicons
                            name={"walk"}
                            size={24}
                            color={pir2 ? "#008000" : "#800080"}
                        />
                        <Text style={styles.sensorLabel}>Üst Kat</Text>
                        <Text
                            style={[
                                styles.sensorValue,
                            ]}
                        >
                            {formatBackendTime(pirTime2)}
                        </Text>
                    </View>

                    {/* Gaz Sensörü */}
                    <View style={styles.sensorCard}>
                        <MaterialCommunityIcons name="smoke-detector" size={24} color="black" />
                        <Text style={styles.sensorLabel}>Gaz</Text>
                        <Text
                            style={[
                                styles.sensorValue,
                                gas === 0 && styles.sensorAlert,
                            ]}
                        >
                            {formatBackendTime(gasTime)}
                        </Text>
                    </View>

                    {/* Sıcaklık */}
                    <View style={styles.sensorCard}>
                        <Ionicons
                            name="thermometer-outline"
                            size={24}
                            color="#F38181"
                        />
                        <Text style={styles.sensorLabel}>Sıcaklık</Text>
                        <Text style={styles.sensorValue}>{temperature}°C</Text>
                    </View>

                    {/* Su sensörü */}
                    <View style={styles.sensorCard}>
                        <Ionicons
                            name="water"
                            size={24}
                            color="#0E87CC"
                        />
                        <Text style={styles.sensorLabel}>Su</Text>
                        <Text style={styles.sensorValue}>{temperature}°C</Text>
                    </View>

                    {/* Nem */}
                    <View style={styles.sensorCard}>
                        <Image
                            source={require("../../assets/humidity.png")}
                            style={{ width: 24, height: 24 }}
                            resizeMode="contain"
                        />
                        <Text style={styles.sensorLabel}>Nem</Text>
                        <Text style={styles.sensorValue}>%{humidity}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderModeCard = (mode) => {
        const isActive = activeMode === mode.id;

        return (
            <View key={mode.id} style={styles.modeCard}>
                <View style={styles.modeHeader}>
                    <View style={styles.modeIconContainer}>
                        <View
                            style={[
                                styles.modeIcon,
                                { backgroundColor: mode.color },
                            ]}
                        >
                            <Ionicons name={mode.icon} size={28} color="#fff" />
                        </View>
                        <View style={styles.modeInfo}>
                            <Text style={styles.modeName}>{mode.name}</Text>
                            <Text style={styles.modeDescription}>
                                {mode.description}
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={isActive}
                        onValueChange={() => handleToggleMode(mode.id)}
                        trackColor={{ false: "#D1D1D1", true: mode.color }}
                        thumbColor="#fff"
                    />
                </View>

                {isActive && (
                    <View style={styles.modeDetails}>
                        <Text style={styles.actionsTitle}>
                            Aktif Aksiyonlar:
                        </Text>
                        {mode.actions.map((action, index) => (
                            <View key={index} style={styles.actionItem}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={mode.color}
                                />
                                <Text style={styles.actionText}>{action}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Modlar</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    {renderSensorStatus()}

                    <View style={styles.modesContainer}>
                        <Text style={styles.sectionTitle}>Otomatik Modlar</Text>
                        {availableModes.map((mode) => renderModeCard(mode))}
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons
                            name="information-circle"
                            size={20}
                            color="#666"
                        />
                        <Text style={styles.infoText}>
                            Bir mod aktif ettiğinizde diğer modlar otomatik olarak kapanır.
                            Sensörler izlenir ve belirlenen aksiyonlar gerçekleştirilir.
                        </Text>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        backgroundColor: "#44436A",
        padding: 20,
        paddingTop: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#ffffff",
        opacity: 0.8,
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
    },
    sensorContainer: {
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    sensorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    sensorCard: {
        width: "31%",
        backgroundColor: "#f9f9f9",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: "center",
    },
    sensorLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 8,
        marginBottom: 4,
    },
    sensorValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    sensorAlert: {
        color: "#FF6B6B",
        fontWeight: "bold",
    },
    modesContainer: {
        backgroundColor: "#fff",
        padding: 16,
    },
    modeCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    modeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modeIconContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    modeIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    modeInfo: {
        flex: 1,
    },
    modeName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    modeDescription: {
        fontSize: 13,
        color: "#666",
    },
    modeDetails: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    actionsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    actionItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    actionText: {
        fontSize: 13,
        color: "#555",
        marginLeft: 8,
        flex: 1,
    },
    infoBox: {
        flexDirection: "row",
        backgroundColor: "#fff",
        padding: 16,
        marginTop: 2,
        alignItems: "flex-start",
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#666",
        marginLeft: 8,
        lineHeight: 18,
    },
});

export default ModesScreen;