import React, { useEffect, useState } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { StyleSheet, View, Text, Image, ImageBackground, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';

const Home = () => {

    interface UfAPI {
        sigla: string
        nome: string;
    }

    interface CityAPI {
        nome: string;
    }

    interface SelectPicker {
        value: string;
        label: string;
    }

    const navigation = useNavigation();

    const [ufs, setUfs] = useState<SelectPicker[]>([]);
    const [selectedUf, setSelectedUf] = useState('');
    const [cities, setCities] = useState<SelectPicker[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');

    useEffect(() => {

        axios.get<UfAPI[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(response => {
                const states = response.data.map(item => {
                    return { value: item.sigla, label: item.sigla }
                });
                setUfs(states);
            })
            .catch(e => alert('Erro ao cerregar as UF: ' + e));
    }, []);

    useEffect(() => {

        if (selectedUf === '0') return;

        axios.get<CityAPI[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(item => {
                    return { value: item.nome, label: item.nome }
                });
                setCities(cityNames);
            })
            .catch(e => alert('Erro ao cerregar as cidades: ' + e));
    }, [selectedUf]);

    const handleNavigatePoint = () => {
        if (selectedUf === undefined || selectedUf === '' || selectedCity === undefined || selectedCity === '') {
            Alert.alert('Ooops...', 'Selecione o estado!');
            return;
        }
        navigation.navigate('Points', { uf: selectedUf, city: selectedCity });
    }

    return (
        <ImageBackground style={styles.container}
            source={require('../../assets/home-background.png')}
            imageStyle={{ width: 274, height: 368 }}>
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrem pontos de coleta de forma eficiente.</Text>
            </View>

            <View style={{ paddingBottom: 50 }}>
                <RNPickerSelect
                    placeholder={{ label: 'Selecione o estado' }}
                    value={selectedUf}
                    onValueChange={(value) => setSelectedUf(value)}
                    items={ufs}
                />
            </View>

            <View style={{ paddingBottom: 50, }}>
                <RNPickerSelect
                    placeholder={{ label: 'Selecione a cidade' }}
                    value={selectedCity}
                    onValueChange={(value) => setSelectedCity(value)}
                    items={cities}
                />
            </View>

            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={handleNavigatePoint}>
                    <View style={styles.buttonIcon}>
                        <Text> <Icon name="arrow-right" color="#FFF" size={20} /> </Text>
                    </View>
                    <Text style={styles.buttonText}>
                        Entrar
                    </Text>
                </RectButton>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {},

    select: {},

    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },

    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    }
});

export default Home;