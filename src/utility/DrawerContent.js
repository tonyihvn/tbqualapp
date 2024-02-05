// DrawerContent.js
import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { removeTokenFromAsyncStorage } from "./storage";

const DrawerContent = ({ navigation, ...rest }) => {
    const handleLogout = async () => {
        await removeTokenFromAsyncStorage();
        navigation.navigate('Login');
    };

    return (
        <DrawerContentScrollView {...rest}>
            <View style={styles.headerContainer}>
                {/* Your logo component */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                {/* Your app name */}
                <Text style={styles.appName}>Menu</Text>
            </View>

            <DrawerItemList  navigation={navigation} {...rest} />

            <TouchableWithoutFeedback onPress={handleLogout}>
                <View style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </View>
            </TouchableWithoutFeedback>
        </DrawerContentScrollView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'column',
        alignItems: 'left',
    },

    logoContainer: {
        marginRight: 16,
    },
    logo: {
        width: 100,
        height: 50,
    },

    appName: {
        fontSize: 18,
        color: '#555',
    },
    logoutButton: {
        marginTop: 'auto',
        padding: 16,
    },
    logoutButtonText: {
        fontSize: 18,
        color: 'red',
    },
});

export default DrawerContent;
