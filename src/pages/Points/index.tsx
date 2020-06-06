import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Image, Alert } from 'react-native';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import api from '../../services/api';

const Points = () => {

    const navigation = useNavigation();

    const handleNavigateBack = () => {
        navigation.goBack();
    }

    const handleNavigateToDetail = (id: number) => {
        navigation.navigate('Detail', {point_id: id});
    }

    interface Item {
        id: number;
        title: string;
        image_url: string;
    }

    interface Point {
        id: number;
        image: string;
        name: string;
        latitude: number;
        longitudade: number;
    }

    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<number[]>([]);
    const [points, setPoints] = useState<Point[]>([]);

    function handleSelectItem(id: number) {
        const ids = [...selectedItems];
        const index = ids.indexOf(id);
        if (ids.includes(id)) {
            ids.splice(index, 1);
        } else {
            ids.push(id);
        }
        setSelectedItems(ids);
    }

    useEffect(() => {
        api.get('/items')
            .then(response => {
                setItems(response.data);
            })
            .catch(e => alert(e));
    }, []);

    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Oooops...', 'precisamos de sua permissão para obter a localização!');
                return;
            }

            const location = await Location.getCurrentPositionAsync();
            const { latitude, longitude } = location.coords;
            setInitialPosition([latitude, longitude]);
        }
        loadPosition();
    }, []);

    useEffect(() => {
        api.get('/points', {
            params: {
                city: 'Belo Horizonte',
                uf: 'MG',
                items: [4]
            }
        })
            .then(response => setPoints(response.data))
            .catch(e => alert(e));
    }, []);


    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={25} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

                <View style={styles.mapContainer}>
                    {initialPosition[0] !== 0 &&
                        (
                            <MapView style={styles.map}
                                loadingEnabled={initialPosition[0] === 0}
                                initialRegion={
                                    {
                                        // -19.8382745 -43.9290489
                                        latitude: initialPosition[0],
                                        longitude: initialPosition[1],
                                        latitudeDelta: 0.014,
                                        longitudeDelta: 0.014
                                    }
                                }
                            >
                                {points.map((point,index) => {
                                    return (
                                        <Marker key={String(index)} style={styles.mapMarker}
                                            coordinate={{ latitude: -19.838520, longitude: (-43.929344 - (index/100)), }}
                                            onPress={() => handleNavigateToDetail(point.id)}>
                                            <View style={styles.mapMarkerContainer}>
                                                <Image style={styles.mapMarkerImage} source={{ uri: point.image }} />
                                                <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                            </View>
                                        </Marker>
                                    );
                                })}
                            </MapView>
                        )
                    }
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 20 }}
                    showsHorizontalScrollIndicator={false}>
                    {items.map(item => {
                        return (
                            <TouchableOpacity key={String(item.id)} style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]} onPress={() => { handleSelectItem(item.id) }} activeOpacity={0.5} >
                                <SvgUri width={42} height={42} uri={item.image_url} />
                                <Text style={styles.itemTitle}>{item.title}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
        color: '#322153',
    },

    description: {
        color: '#322153',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center',
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;