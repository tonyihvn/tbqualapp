import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {clearAsyncStorage, localServerAddress} from "../utility/storage";

const FacilitiesScreen = () => {
    const [facilities, setFacilities] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        loadFacilities();
    }, []);

    const loadFacilities = async () => {
        // await clearAsyncStorage();
        // await AsyncStorage.removeItem('facilities');

        try {
            // Load facilities from AsyncStorage
            const facilitiesData = await AsyncStorage.getItem('facilities');

            if (facilitiesData  && facilitiesData.length > 0) {
                setFacilities(JSON.parse(facilitiesData));
                alert("LOCAL FACILITIES: "+facilities);

            } else {
                // If not available in AsyncStorage, fetch from API and save to AsyncStorage
                const response = await fetch(`${localServerAddress}/tbqual/api/facilities`); // Replace with your API endpoint

                const facilitiesFromApi = await response.json();
                setFacilities(facilitiesFromApi);
                alert("API FACI: "+ facilitiesData)

                await AsyncStorage.setItem('facilities',facilitiesFromApi);
            }
        } catch (error) {
            console.error('Error loading facilities:', error.message);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.facilityItem} onPress={() => handleFacilityPress(item)}>
            <Text>{item.label}</Text>
            <Text style={styles.facilityStateText}>{item.state}</Text>
        </TouchableOpacity>
    );

    const handleFacilityPress = (facility) => {
        // Handle navigation or any other action when a facility is pressed
        console.log('Facility pressed:', facility.label);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={facilities}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        padding: 16,
    },
    facilityItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        marginBottom: 10,
        backgroundColor: '#fff', // Background color
        borderRadius: 8, // Border radius
        elevation: 3, // Android elevation for shadow
        // flexDirection: 'row'
    },
    facilityText: {
        fontSize: 18,
        color: '#333',
    },
    facilityStateText: {
        fontSize: 14,
        color: 'red',
    },
});

export default FacilitiesScreen;
