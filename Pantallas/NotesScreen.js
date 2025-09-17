import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { db } from '../config/Firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';

// Colores disponibles para las notas
const COLORS = ['#FFD700', '#90EE90', '#87CEEB', '#FFB6C1', '#FFA07A', '#D3D3D3'];

/**
 * Pantalla de Notas: permite crear, listar, marcar como lista, eliminar y elegir color para cada nota.
 */
export default function NotesScreen() {
    // Estados para el formulario de nueva nota
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    // Estado para las notas del usuario
    const [notas, setNotas] = useState([]);
    // Estado para mostrar mensajes
    const [mensaje, setMensaje] = useState('');

    // Obtener UID del usuario
    const [uid, setUid] = useState(null);
    useEffect(() => {
        SecureStore.getItemAsync('userToken').then(setUid);
    }, []);

    // Obtener las notas del usuario al cargar la pantalla o cuando cambie el UID
    useEffect(() => {
        if (uid) obtenerNotas();
        // eslint-disable-next-line
    }, [uid]);

    /**
     * Obtiene todas las notas del usuario desde Firestore
     */
    const obtenerNotas = async () => {
        try {
            const q = query(collection(db, 'notas'), where('uid', '==', uid));
            const querySnapshot = await getDocs(q);
            const notasArray = [];
            querySnapshot.forEach(docSnap => {
                notasArray.push({ id: docSnap.id, ...docSnap.data() });
            });
            setNotas(notasArray);
        } catch (error) {
            setMensaje('Error al obtener las notas.');
        }
    };

    /**
     * Crea una nueva nota en Firestore
     */
    const crearNota = async () => {
        if (!titulo.trim() && !contenido.trim()) return;
        try {
            await addDoc(collection(db, 'notas'), {
                uid,
                titulo,
                contenido,
                color,
                completada: false,
                fecha: new Date()
            });
            setTitulo('');
            setContenido('');
            setColor(COLORS[0]);
            setMensaje('Nota creada correctamente.');
            obtenerNotas();
        } catch (error) {
            setMensaje('Error al crear la nota.');
        }
        setTimeout(() => setMensaje(''), 2000);
    };

    /**
     * Marca una nota como completada o no completada
     */
    const toggleCompletada = async (id, completada) => {
        try {
            await updateDoc(doc(db, 'notas', id), { completada: !completada });
            obtenerNotas();
        } catch (error) {
            setMensaje('Error al actualizar la nota.');
        }
    };

    /**
     * Elimina una nota
     */
    const eliminarNota = async (id) => {
        try {
            await deleteDoc(doc(db, 'notas', id));
            obtenerNotas();
        } catch (error) {
            setMensaje('Error al eliminar la nota.');
        }
    };

    // Render de cada nota
    const renderNota = ({ item }) => (
        <View style={[styles.nota, { backgroundColor: item.color }]}>
            <Text style={[styles.titulo, item.completada && styles.completada]}>{item.titulo}</Text>
            <Text style={item.completada && styles.completada}>{item.contenido}</Text>
            <View style={styles.notaBotones}>
                <Button
                    title={item.completada ? 'Desmarcar' : 'Completar'}
                    onPress={() => toggleCompletada(item.id, item.completada)}
                    color={item.completada ? '#FFA500' : '#28a745'}
                />
                <Button
                    title="Eliminar"
                    onPress={() => eliminarNota(item.id)}
                    color="#dc3545"
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tus Notas</Text>
            {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
            {/* Formulario para crear nota */}
            <TextInput
                style={styles.input}
                placeholder="Título"
                value={titulo}
                onChangeText={setTitulo}
            />
            <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Contenido"
                value={contenido}
                onChangeText={setContenido}
                multiline
            />
            <View style={styles.coloresContainer}>
                <Text style={{ marginRight: 8 }}>Color:</Text>
                {COLORS.map(c => (
                    <TouchableOpacity
                        key={c}
                        style={[styles.colorBox, { backgroundColor: c, borderWidth: color === c ? 2 : 0 }]}
                        onPress={() => setColor(c)}
                    />
                ))}
            </View>
            <Button title="Crear Nota" onPress={crearNota} color="#007BFF" />
            {/* Lista de notas */}
            <FlatList
                data={notas}
                keyExtractor={item => item.id}
                renderItem={renderNota}
                style={{ marginTop: 20, width: '100%' }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    mensaje: {
        color: 'green',
        marginBottom: 8,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
        width: '100%',
        height: 40,
    },
    coloresContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    colorBox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        marginHorizontal: 3,
        borderColor: '#333',
    },
    nota: {
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    titulo: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    completada: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    notaBotones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
});

