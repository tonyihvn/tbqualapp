// DashboardScreen.js
import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {removeTokenFromAsyncStorage} from "../utility/storage"; // Use an appropriate icon library

// admin@nigeriaqualtb.com @@superadmin
const DashboardScreen = ({ navigation }) => {

    const [reportData, setreportData] = useState([]);
    const navigateToScreen = (screenName, params) => {
        navigation.navigate(screenName, params);
    };
    const handleLogout = async () => {
        await removeTokenFromAsyncStorage();
        // navigation.navigate('Login');
        navigation.navigate('AuthStack', { screen: 'Login' });
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.heading}>TBQual Mobile App</Text>
                </View>
            </View>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.box, { backgroundColor: '#3498db' }]} onPress={() => navigation.navigate('CollectData', { reportData })}>
                    <Icon name="edit" size={50} color="#fff" />
                    <Text style={styles.boxText}>Collect Data</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.box, { backgroundColor: '#2ecc71' }]} onPress={() => navigateToScreen('ViewData')}>
                    <Icon name="eye" size={50} color="#fff" />
                    <Text style={styles.boxText}>Saved Reports</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <TouchableOpacity style={[styles.box, { backgroundColor: '#e74c3c' }]} onPress={() => navigateToScreen('ViewIssues',{reportId: "All"})}>
                    <Icon name="building" size={50} color="#fff" />
                    <Text style={styles.boxText}>Report Issues</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.box, { backgroundColor: '#f39c12' }]} onPress={() => navigateToScreen('Facilities')}>
                    <Icon name="home" size={50} color="#fff" />
                    <Text style={styles.boxText}>My Facilities</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <TouchableOpacity style={[styles.button, { backgroundColor: 'purple' }]} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        width: 100, // Adjust the width as needed
        height: 100, // Adjust the height as needed
    },
    heading: {
        fontSize: 24,
        marginTop: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    box: {
        width: 150,
        height: 150,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    boxText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
    button: {
        width: 150,
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    buttonText: {
        color: '#fff',
        marginTop: 5,
        fontSize: 16,
    },
});

export default DashboardScreen;
