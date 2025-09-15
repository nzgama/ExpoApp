import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import * as SecureStore from 'expo-secure-store';

/**
 * Guarda o actualiza el perfil del usuario en Firestore.
 * Si el documento existe, actualiza solo los campos modificados.
 * Si no existe, lo crea con los datos proporcionados.
 */
const guardarPerfil = async (uid, datos) => {
    const docRef = doc(db, 'usuarios', uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await updateDoc(docRef, datos); // Actualiza solo los campos modificados
        } else {
            await setDoc(docRef, datos); // Crea el documento si no existe
        }
    } catch (error) {
        throw error;
    }
};

/**
 * Pantalla de perfil de usuario.
 * Permite editar, guardar y borrar los datos del perfil en Firestore.
 */
export default function ProfileScreen() {
    // Estados para los campos del perfil
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [edad, setEdad] = useState('');
    const [descripcion, setDescripcion] = useState('');
    // Estado para mostrar si está cargando los datos
    const [loading, setLoading] = useState(true);
    // Estado para mostrar mensajes de éxito o error
    const [mensaje, setMensaje] = useState('');
    // Estado para saber si el perfil existe en la base de datos
    const [perfilExiste, setPerfilExiste] = useState(false);

    /**
     * Obtiene los datos del perfil desde Firestore y los carga en los inputs.
     */
    const obtenerPerfil = async () => {
        const uid = await SecureStore.getItemAsync('userToken');
        if (!uid) return;
        try {
            const docRef = doc(db, 'usuarios', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const datos = docSnap.data();
                setNombre(datos.nombre || '');
                setApellido(datos.apellido || '');
                setEdad(datos.edad || '');
                setDescripcion(datos.descripcion || '');
                setPerfilExiste(true);
            } else {
                setPerfilExiste(false);
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
            setNombre('');
            setApellido('');
            setEdad('');
            setDescripcion('');
            setPerfilExiste(false);
            setMensaje('Perfil borrado exitosamente.');
        } catch (error) {
            setMensaje('Error al borrar el perfil. Intenta nuevamente.');
        }
        setTimeout(() => setMensaje(''), 3000);
    };

    // Cargar los datos del perfil al montar el componente
    useEffect(() => {
        obtenerPerfil();
    }, []);

    /**
     * Guarda los cambios realizados en el perfil.
     */
    const handleSave = async () => {
        const uid = await SecureStore.getItemAsync('userToken');
        const datos = { nombre, apellido, edad, descripcion };
        try {
            await guardarPerfil(uid, datos);
            setMensaje('¡Perfil guardado exitosamente!');
        } catch (error) {
            setMensaje('Error al guardar el perfil. Intenta nuevamente.');
        }
        setTimeout(() => setMensaje(''), 3000);
    };

    // Mostrar pantalla de carga mientras se obtienen los datos
    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Cargando perfil...</Text>
            </View>
        );
    }

    // Renderizar el formulario de perfil
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Edita tu perfil aquí</Text>
            {/* Mensaje de éxito o error */}
            {mensaje ? (
                <Text style={{ color: mensaje.includes('exitosamente') ? 'green' : 'red', marginBottom: 10 }}>{mensaje}</Text>
            ) : null}
            {/* Input para nombre */}
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
            />
            {/* Input para apellido */}
            <TextInput
                style={styles.input}
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
            />
            {/* Input para edad */}
            <TextInput
                style={styles.input}
                placeholder="Edad"
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
            />
            {/* Input para descripción */}
            <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
            />
            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
                <View style={styles.buttonWrapper}>
                    <Button title="Guardar Cambios" onPress={handleSave} color="#007BFF" />
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
});
