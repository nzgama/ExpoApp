import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';

/**
 * Pantalla de perfil de usuario con estado único para el formulario, validaciones básicas y geolocalización.
 */
export default function ProfileScreen() {
    // Estado único para todos los campos del formulario
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        edad: '',
        descripcion: '',
        latitud: '',
        longitud: '',
    });
    // Estado para guardar el formulario inicial
    const [formInicial, setFormInicial] = useState({
        nombre: '',
        apellido: '',
        edad: '',
        descripcion: '',
        latitud: '',
        longitud: '',
    });
    // Estado para mostrar si está cargando los datos
    const [loading, setLoading] = useState(true);
    // Estado para mostrar mensajes de éxito o error
    const [mensaje, setMensaje] = useState('');
    // Estado para saber si el perfil existe en la base de datos
    const [perfilExiste, setPerfilExiste] = useState(false);
    // Estado para errores de validación
    const [errores, setErrores] = useState({});
    // Estado para el seguimiento de ubicación en tiempo real
    const [watchingLocation, setWatchingLocation] = useState(false);
    // Estado para almacenar la suscripción de ubicación
    const [locationSubscription, setLocationSubscription] = useState(null);

    /**
     * Obtiene los datos del perfil desde Firestore y los carga en el formulario.
     */
    const obtenerPerfil = async () => {
        const uid = await SecureStore.getItemAsync('userToken');
        if (!uid) return;
        try {
            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const datos = docSnap.data();
                const nuevoForm = {
                    nombre: datos.nombre || '',
                    apellido: datos.apellido || '',
                    edad: datos.edad ? String(datos.edad) : '',
                    descripcion: datos.descripcion || '',
                    latitud: datos.latitud ? String(datos.latitud) : '',
                    longitud: datos.longitud ? String(datos.longitud) : '',
                };
                setForm(nuevoForm);
                setFormInicial(nuevoForm);
                setPerfilExiste(true);
            } else {
                setPerfilExiste(false);
                setFormInicial({ nombre: '', apellido: '', edad: '', descripcion: '', latitud: '', longitud: '' });
            }
        } catch (error) {
            console.error('Error al obtener el perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Borra el perfil del usuario en Firestore y limpia los campos.
     */
    const handleDelete = async () => {
        const uid = await SecureStore.getItemAsync('userToken');
        if (!uid) return;
        try {
            await deleteDoc(doc(db, 'usuarios', uid));
            setForm({ nombre: '', apellido: '', edad: '', descripcion: '', latitud: '', longitud: '' });
            setPerfilExiste(false);
            setMensaje('Perfil borrado exitosamente.');
        } catch (error) {
            setMensaje('Error al borrar el perfil. Intenta nuevamente.');
        }
        setTimeout(() => setMensaje(''), 3000);
    };

    /**
     * Solicita permisos de ubicación al usuario
     */
    const solicitarPermisoUbicacion = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Se necesita permiso de ubicación para obtener las coordenadas');
            return false;
        }
        return true;
    };

    /**
     * Obtiene la ubicación actual del usuario una sola vez
     */
    const obtenerUbicacionActual = async () => {
        const permiso = await solicitarPermisoUbicacion();
        if (!permiso) return;

        try {
            setMensaje('Obteniendo ubicación...');
            const ubicacion = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const lat = ubicacion.coords.latitude.toString();
            const lon = ubicacion.coords.longitude.toString();

            setForm(prev => ({
                ...prev,
                latitud: lat,
                longitud: lon
            }));

            setMensaje('¡Ubicación obtenida exitosamente!');
            setTimeout(() => setMensaje(''), 3000);

        } catch (error) {
            console.error('Error al obtener ubicación:', error);
            setMensaje('Error al obtener la ubicación');
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    /**
     * Inicia o detiene el seguimiento de ubicación en tiempo real
     */
    const toggleSeguimientoUbicacion = async () => {
        if (watchingLocation) {
            // Detener seguimiento
            if (locationSubscription) {
                locationSubscription.remove();
                setLocationSubscription(null);
            }
            setWatchingLocation(false);
            setMensaje('Seguimiento de ubicación detenido');
        } else {
            // Iniciar seguimiento
            const permiso = await solicitarPermisoUbicacion();
            if (!permiso) return;

            try {
                const subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000, // Actualizar cada 5 segundos
                        distanceInterval: 10, // Actualizar cada 10 metros
                    },
                    (ubicacion) => {
                        const lat = ubicacion.coords.latitude.toString();
                        const lon = ubicacion.coords.longitude.toString();

                        setForm(prev => ({
                            ...prev,
                            latitud: lat,
                            longitud: lon
                        }));
                    }
                );

                setLocationSubscription(subscription);
                setWatchingLocation(true);
                setMensaje('Seguimiento de ubicación iniciado');
            } catch (error) {
                console.error('Error al iniciar seguimiento:', error);
                setMensaje('Error al iniciar seguimiento de ubicación');
            }
        }
        setTimeout(() => setMensaje(''), 3000);
    };

    // Limpiar suscripción al desmontar el componente
    useEffect(() => {
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [locationSubscription]);

    // Cargar los datos del perfil al montar el componente
    useEffect(() => {
        obtenerPerfil();
    }, []);

    /**
     * Validaciones básicas de los campos
     */
    const validarCampos = () => {
        const nuevosErrores = {};
        if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
        if (!form.apellido.trim()) nuevosErrores.apellido = 'El apellido es obligatorio.';
        if (!form.edad.trim()) {
            nuevosErrores.edad = 'La edad es obligatoria.';
        } else if (isNaN(Number(form.edad)) || Number(form.edad) <= 0) {
            nuevosErrores.edad = 'La edad debe ser un número mayor a 0.';
        }
        return nuevosErrores;
    };

    /**
     * Guarda los cambios realizados en el perfil.
     */
    const handleSave = async () => {
        const erroresVal = validarCampos();
        setErrores(erroresVal);
        if (Object.keys(erroresVal).length > 0) return;
        const uid = await SecureStore.getItemAsync('userToken');
        const datos = {
            nombre: form.nombre,
            apellido: form.apellido,
            edad: Number(form.edad),
            descripcion: form.descripcion,
            latitud: form.latitud ? Number(form.latitud) : null,
            longitud: form.longitud ? Number(form.longitud) : null,
        };
        try {
            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await updateDoc(docRef, datos);
            } else {
                await setDoc(docRef, datos);
            }
            setMensaje('¡Perfil guardado exitosamente!');
        } catch (error) {
            setMensaje('Error al guardar el perfil. Intenta nuevamente.');
        }
        setTimeout(() => setMensaje(''), 3000);
    };

    // Handler para actualizar el estado del formulario
    const handleChange = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    // Mostrar pantalla de carga mientras se obtienen los datos
    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Cargando perfil...</Text>
            </View>
        );
    }

    const hayCambios = JSON.stringify(form) !== JSON.stringify(formInicial);

    // Renderizar el formulario de perfil
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Edita tu perfil aquí</Text>
            {mensaje ? (
                <Text style={{ color: mensaje.includes('exitosamente') ? 'green' : 'red', marginBottom: 10 }}>{mensaje}</Text>
            ) : null}
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={form.nombre}
                onChangeText={valor => handleChange('nombre', valor)}
            />
            {errores.nombre && <Text style={styles.error}>{errores.nombre}</Text>}
            <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={form.apellido}
                onChangeText={valor => handleChange('apellido', valor)}
            />
            {errores.apellido && <Text style={styles.error}>{errores.apellido}</Text>}
            <TextInput
                style={styles.input}
                placeholder="Edad"
                value={form.edad}
                onChangeText={valor => handleChange('edad', valor)}
                keyboardType="numeric"
            />
            {errores.edad && <Text style={styles.error}>{errores.edad}</Text>}
            <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={form.descripcion}
                onChangeText={valor => handleChange('descripcion', valor)}
                multiline
            />

            {/* Sección de Ubicación */}
            <View style={styles.locationSection}>
                <Text style={styles.locationTitle}>📍 Ubicación</Text>

                <View style={styles.coordinatesContainer}>
                    <View style={styles.coordinateRow}>
                        <Text style={styles.coordinateLabel}>Latitud:</Text>
                        <TextInput
                            style={styles.coordinateInput}
                            placeholder="Latitud"
                            value={form.latitud}
                            onChangeText={valor => handleChange('latitud', valor)}
                            keyboardType="numeric"
                            editable={!watchingLocation}
                        />
                    </View>

                    <View style={styles.coordinateRow}>
                        <Text style={styles.coordinateLabel}>Longitud:</Text>
                        <TextInput
                            style={styles.coordinateInput}
                            placeholder="Longitud"
                            value={form.longitud}
                            onChangeText={valor => handleChange('longitud', valor)}
                            keyboardType="numeric"
                            editable={!watchingLocation}
                        />
                    </View>
                </View>

                <View style={styles.locationButtons}>
                    <TouchableOpacity style={styles.locationButton} onPress={obtenerUbicacionActual}>
                        <Text style={styles.locationButtonText}>📍 Obtener Ubicación</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.locationButton, watchingLocation ? styles.stopButton : styles.startButton]}
                        onPress={toggleSeguimientoUbicacion}
                    >
                        <Text style={styles.locationButtonText}>
                            {watchingLocation ? '⏹️ Detener Seguimiento' : '🎯 Seguir Ubicación'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button title="Guardar Cambios" color="#007BFF" onPress={handleSave} disabled={!hayCambios} />
                </View>
                {perfilExiste && (
                    <View style={styles.buttonWrapper}>
                        <Button title="Borrar Perfil" color="#dc3545" onPress={handleDelete} />
                    </View>
                )}
            </View>
        </View>
    );
}

// Estilos para la pantalla de perfil
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    text: {
        fontSize: 18,
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: 5,
    },
    error: {
        color: 'red',
        fontSize: 13,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    locationSection: {
        width: '100%',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#495057',
    },
    coordinatesContainer: {
        marginBottom: 12,
    },
    coordinateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    coordinateLabel: {
        width: 80,
        fontSize: 14,
        fontWeight: '500',
        color: '#6c757d',
    },
    coordinateInput: {
        flex: 1,
        height: 40,
        borderColor: '#ced4da',
        borderWidth: 1,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        fontSize: 14,
    },
    locationButtons: {
        gap: 8,
    },
    locationButton: {
        backgroundColor: '#007BFF',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#28a745',
    },
    stopButton: {
        backgroundColor: '#dc3545',
    },
    locationButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
});
