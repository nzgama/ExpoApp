import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { File, Directory, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * FilesScreen - Sistema de cámara y gestión de archivos
 * 
 * Esta pantalla permite:
 * - Tomar fotos con la cámara del dispositivo
 * - Importar fotos desde la galería del dispositivo
 * - Guardar las fotos en el sistema de archivos local
 * - Mostrar una galería de fotos tomadas/importadas
 * - Eliminar fotos del almacenamiento
 * 
 * Conceptos que aprenderán los estudiantes:
 * - Uso de expo-camera con CameraView y useCameraPermissions
 * - Uso de expo-image-picker para seleccionar fotos de la galería
 * - Gestión moderna de permisos con hooks
 * - Uso de expo-file-system con las nuevas clases File, Directory y Paths
 * - Trabajo con referencias (useRef) para componentes
 * - Manejo de estados para mostrar/ocultar la cámara
 * 
 * APIs actualizadas utilizadas:
 * - CameraView: Nuevo componente de cámara
 * - useCameraPermissions: Hook para gestión de permisos
 * - ImagePicker: Para seleccionar fotos de la galería
 * - File, Directory, Paths: Nueva API moderna de sistema de archivos
 */
export default function FilesScreen() {
    // Estado para controlar si se muestra la cámara
    const [showCamera, setShowCamera] = useState(false);
    // Estado para almacenar las fotos tomadas
    const [photos, setPhotos] = useState([]);
    // Hook para permisos de cámara (nueva API)
    const [permission, requestPermission] = useCameraPermissions();
    // Referencia al componente de cámara
    const cameraRef = useRef(null);

    /**
     * Al montar el componente, cargamos fotos existentes
     */
    useEffect(() => {
        loadPhotos();
    }, []);

    /**
     * Carga las fotos existentes del directorio de documentos
     */
    const loadPhotos = async () => {
        try {
            // Crear directorio usando la nueva API
            const photosDir = new Directory(Paths.document, 'photos');

            // Verificar si el directorio existe
            if (photosDir.exists) {
                // Listar archivos en el directorio
                const files = photosDir.list();
                const photoFiles = files
                    .filter(item => item instanceof File && item.extension === '.jpg')
                    .map(file => file.name);
                setPhotos(photoFiles);
            }
        } catch (error) {
            console.error('Error loading photos:', error);
        }
    };

    /**
     * Toma una foto y la guarda en el sistema de archivos
     */
    const takePhoto = async () => {
        if (cameraRef.current) {
            try {
                // Tomar la foto
                const photo = await cameraRef.current.takePictureAsync();

                // Crear directorio de fotos usando la nueva API
                const photosDir = new Directory(Paths.document, 'photos');
                photosDir.create({ intermediates: true, idempotent: true });

                // Generar nombre único para la foto
                const fileName = `photo_${Date.now()}.jpg`;

                // Crear archivo de destino
                const destinationFile = new File(photosDir, fileName);

                // Copiar la foto del temporal al permanente
                const tempFile = new File(photo.uri);
                tempFile.copy(destinationFile);

                // Actualizar la lista de fotos
                setPhotos(prevPhotos => [...prevPhotos, fileName]);
                setShowCamera(false);

                Alert.alert('¡Éxito!', 'Foto guardada correctamente');
            } catch (error) {
                console.error('Error taking photo:', error);
                Alert.alert('Error', 'No se pudo tomar la foto');
            }
        }
    };

    /**
     * Permite al usuario seleccionar una foto de la galería
     */
    const pickImageFromGallery = async () => {
        try {
            // Solicitar permisos para acceder a la galería
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Error', 'Se necesitan permisos para acceder a la galería');
                return;
            }

            // Abrir selector de imágenes
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                // Crear directorio de fotos si no existe
                const photosDir = new Directory(Paths.document, 'photos');
                photosDir.create({ intermediates: true, idempotent: true });

                // Generar nombre único para la foto importada
                const fileName = `imported_${Date.now()}.jpg`;

                // Crear archivo de destino
                const destinationFile = new File(photosDir, fileName);

                // Copiar la foto seleccionada al directorio de la app
                const sourceFile = new File(result.assets[0].uri);
                sourceFile.copy(destinationFile);

                // Actualizar la lista de fotos
                setPhotos(prevPhotos => [...prevPhotos, fileName]);

                Alert.alert('¡Éxito!', 'Foto importada correctamente');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'No se pudo importar la foto');
        }
    };

    /**
     * Elimina una foto del sistema de archivos
     */
    const deletePhoto = async (fileName) => {
        try {
            // Crear referencia al archivo usando la nueva API
            const photosDir = new Directory(Paths.document, 'photos');
            const photoFile = new File(photosDir, fileName);

            // Eliminar el archivo
            photoFile.delete();

            // Actualizar el estado
            setPhotos(prevPhotos => prevPhotos.filter(photo => photo !== fileName));
            Alert.alert('¡Eliminado!', 'Foto eliminada correctamente');
        } catch (error) {
            console.error('Error deleting photo:', error);
            Alert.alert('Error', 'No se pudo eliminar la foto');
        }
    };

    /**
     * Confirma antes de eliminar una foto
     */
    const confirmDelete = (fileName) => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que quieres eliminar esta foto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => deletePhoto(fileName) },
            ]
        );
    };

    /**
     * Renderiza cada foto en la galería
     */
    const renderPhoto = ({ item }) => {
        // Crear referencia al archivo de la foto
        const photosDir = new Directory(Paths.document, 'photos');
        const photoFile = new File(photosDir, item);
        const photoUri = photoFile.uri;

        return (
            <View style={styles.photoItem}>
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(item)}
                >
                    <MaterialIcons name="delete" size={24} color="white" />
                </TouchableOpacity>
            </View>
        );
    };

    // Si no tenemos información de permisos de cámara aún
    if (!permission) {
        return (
            <View style={styles.container}>
                <Text>Cargando permisos de cámara...</Text>
            </View>
        );
    }

    // Si no tenemos permisos de cámara
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.noPermissionText}>Se necesita acceso a la cámara</Text>
                <Text style={styles.permissionMessage}>
                    Para tomar fotos, necesitamos permisos de cámara
                </Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Solicitar permisos</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Si se está mostrando la cámara
    if (showCamera) {
        return (
            <View style={styles.cameraContainer}>
                <CameraView style={styles.camera} ref={cameraRef} />
                {/* Controles superpuestos con posicionamiento absoluto */}
                <View style={styles.cameraControls}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setShowCamera(false)}
                    >
                        <MaterialIcons name="close" size={32} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // Pantalla principal con galería de fotos
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Mis Fotos</Text>

            {/* Botones de acción */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={() => setShowCamera(true)}
                >
                    <MaterialIcons name="camera-alt" size={24} color="white" />
                    <Text style={styles.buttonText}>Tomar Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.galleryButton}
                    onPress={pickImageFromGallery}
                >
                    <MaterialIcons name="photo-library" size={24} color="white" />
                    <Text style={styles.buttonText}>Importar</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.photoCount}>
                {photos.length} {photos.length === 1 ? 'foto' : 'fotos'} guardadas
            </Text>

            <FlatList
                data={photos}
                renderItem={renderPhoto}
                keyExtractor={(item) => item}
                numColumns={2}
                style={styles.photoGrid}
                contentContainerStyle={styles.photoGridContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    cameraButton: {
        backgroundColor: '#007BFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        flex: 1,
    },
    galleryButton: {
        backgroundColor: '#28A745',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        flex: 1,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    noPermissionText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#FF6B6B',
    },
    permissionMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
        paddingHorizontal: 20,
    },
    photoCount: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
        color: '#666',
    },
    photoGrid: {
        flex: 1,
    },
    photoGridContent: {
        paddingBottom: 20,
    },
    photoItem: {
        flex: 1,
        margin: 5,
        position: 'relative',
    },
    photoImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    deleteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        borderRadius: 15,
        padding: 5,
    },
    cameraContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    cameraControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 30,
        paddingBottom: 50,
    },
    cancelButton: {
        padding: 15,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
    },
});