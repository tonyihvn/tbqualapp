import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage for storing user authentication status
import { useNavigation } from '@react-navigation/native';

const AuthLoadingScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        // Check the user's authentication status using AsyncStorage or any other method
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            // Example: Check if a user token or authentication status is stored in AsyncStorage
            const userToken = await AsyncStorage.getItem('userToken');

            // If a user token is present, the user is logged in
            // You might have a more sophisticated check based on your authentication method
            if (userToken) {
                // Navigate to Authenticated screens
                navigation.navigate('Auth');
            } else {
                // Navigate to screens before login (Login and Register)
                navigation.navigate('AuthStack');
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AuthLoadingScreen;
