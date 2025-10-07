import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

/**
 * EJEMPLO MÍNIMO - Ubicación con expo-location
 * 
 * Este ejemplo muestra los conceptos básicos de geolocalización:
 * 1. Solicitar permisos de ubicación
 * 2. Obtener coordenadas actuales
 * 3. Mostrar latitud y longitud
 * 4. Seguimiento en tiempo real (opcional)
 */
export default function EjemploUbicacion() {
    // Estado para almacenar las coordenadas
    const [coords, setCoords] = useState(null);
    // Estado para mostrar si está obteniendo ubicación
    const [obteniendo, setObteniendo] = useState(false);
    // Estado para el seguimiento en tiempo real
    const [siguiendo, setSiguiendo] = useState(false);
    // Variable para almacenar la suscripción
    const [suscripcion, setSuscripcion] = useState(null);

    /**
     * Solicita permisos de ubicación
     */
    const solicitarPermiso = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
            return false;
        }
        return true;
    };

    /**
     * Obtiene la ubicación actual UNA SOLA VEZ
     */
    const obtenerUbicacion = async () => {
        const permiso = await solicitarPermiso();
        if (!permiso) return;

        setObteniendo(true);
        try {
            const ubicacion = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            
            setCoords(ubicacion.coords);
            console.log('📍 Ubicación obtenida:', ubicacion.coords.latitude, ubicacion.coords.longitude);
            
        } catch (error) {
            console.error('Error al obtener ubicación:', error);
            Alert.alert('Error', 'No se pudo obtener la ubicación');
        } finally {
            setObteniendo(false);
        }
    };

    /**
     * Inicia o detiene el seguimiento en TIEMPO REAL
     */
    const toggleSeguimiento = async () => {
        if (siguiendo) {
            // DETENER seguimiento
            if (suscripcion) {
                suscripcion.remove();
                setSuscripcion(null);
            }
            setSiguiendo(false);
            Alert.alert('✅ Seguimiento detenido');
        } else {
            // INICIAR seguimiento
            const permiso = await solicitarPermiso();
            if (!permiso) return;

            try {
                const sub = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 3000,      // Cada 3 segundos
                        distanceInterval: 5,     // Cada 5 metros
                    },
                    (ubicacion) => {
                        setCoords(ubicacion.coords);
                        console.log('🎯 Ubicación actualizada:', ubicacion.coords.latitude, ubicacion.coords.longitude);
                    }
                );
                
                setSuscripcion(sub);
                setSiguiendo(true);
                Alert.alert('🎯 Seguimiento iniciado', 'La ubicación se actualizará automáticamente');
                
            } catch (error) {
                console.error('Error en seguimiento:', error);
                Alert.alert('Error', 'No se pudo iniciar el seguimiento');
            }
        }
    };

    /**
     * Limpia las coordenadas
     */
    const limpiarUbicacion = () => {
        setCoords(null);
        if (suscripcion) {
            suscripcion.remove();
            setSuscripcion(null);
        }
        setSiguiendo(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>📍 Ejemplo de Ubicación</Text>
            
            {/* Mostrar coordenadas si las tenemos */}
            <View style={styles.coordsContainer}>
                {coords ? (
                    <>
                        <Text style={styles.coordsTitle}>📍 Tu ubicación:</Text>
                        <Text style={styles.coordText}>
                            🔴 Latitud: {coords.latitude.toFixed(6)}
                        </Text>
                        <Text style={styles.coordText}>
                            🔵 Longitud: {coords.longitude.toFixed(6)}
                        </Text>
                        <Text style={styles.coordText}>
                            🎯 Precisión: {coords.accuracy?.toFixed(2)} metros
                        </Text>
                        {siguiendo && (
                            <Text style={styles.statusText}>🔄 Actualizando en tiempo real...</Text>
                        )}
                    </>
                ) : (
                    <Text style={styles.noLocationText}>
                        {obteniendo ? '⏳ Obteniendo ubicación...' : '❓ Sin ubicación'}
                    </Text>
                )}
            </View>

            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={obtenerUbicacion}
                    disabled={obteniendo}
                >
                    <Text style={styles.buttonText}>
                        {obteniendo ? '⏳ Obteniendo...' : '📍 Obtener Ubicación'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, siguiendo ? styles.stopButton : styles.startButton]} 
                    onPress={toggleSeguimiento}
                >
                    <Text style={styles.buttonText}>
                        {siguiendo ? '⏹️ Detener Seguimiento' : '🎯 Seguir Ubicación'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.clearButton} 
                    onPress={limpiarUbicacion}
                >
                    <Text style={styles.buttonText}>🗑️ Limpiar</Text>
                </TouchableOpacity>
            </View>

            {/* Instrucciones */}
            <View style={styles.instructions}>
                <Text style={styles.instructionTitle}>💡 Instrucciones:</Text>
                <Text style={styles.instructionText}>📍 Obtener: Ubicación una sola vez</Text>
                <Text style={styles.instructionText}>🎯 Seguir: Actualización automática</Text>
                <Text style={styles.instructionText}>🗑️ Limpiar: Borrar coordenadas</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#343a40',
        textAlign: 'center',
    },
    coordsContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 30,
        minWidth: '90%',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    coordsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#495057',
    },
    coordText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#6c757d',
        fontFamily: 'monospace',
    },
    statusText: {
        fontSize: 14,
        color: '#28a745',
        fontWeight: '500',
        marginTop: 10,
    },
    noLocationText: {
        fontSize: 16,
        color: '#6c757d',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    buttonsContainer: {
        width: '90%',
        gap: 12,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#28a745',
    },
    stopButton: {
        backgroundColor: '#dc3545',
    },
    clearButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    instructions: {
        marginTop: 30,
        backgroundColor: '#e9ecef',
        padding: 15,
        borderRadius: 8,
        width: '90%',
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#495057',
    },
    instructionText: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 5,
    },
});