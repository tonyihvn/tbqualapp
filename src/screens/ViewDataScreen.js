import React, { useState, useEffect } from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewDataScreen = ({ navigation }) => {
    const [savedReports, setSavedReports] = useState([]);

    useEffect(() => {
        const fetchSavedReports = async () => {
            try {
                const savedReportsJSON = await AsyncStorage.getItem('syncQueue');
                if (savedReportsJSON) {
                    const savedReportsData = JSON.parse(savedReportsJSON);
                    setSavedReports(savedReportsData);
                    console.log("Fetched Data: "+savedReportsJSON)
                }
            } catch (error) {
                console.error('Error fetching saved reports:', error);
            }
        };

        fetchSavedReports();
    }, []);

    // Function to format date string with ordinal suffix
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day - (day % 10) !== 10) * day % 10];
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options).replace(/\d{1,2}(?=(th|st|nd|rd)?\b)/, `$&${suffix}`);
    };

    const handleDeleteRecord = async (appid) => {
        try {
            // Display a confirmation dialog
            Alert.alert(
                'Confirm Deletion',
                'Are you sure you want to delete this record?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: async () => {
                            // Fetch the current records from AsyncStorage
                            const syncQueue = await AsyncStorage.getItem('syncQueue') || '[]';
                            // alert(syncQueue.toString())
                            let updatedRecords = JSON.parse(syncQueue);

                            // Filter out the record with the specified id
                            updatedRecords = updatedRecords.filter(record => record.appid !== appid);
                            await AsyncStorage.removeItem('collectedData');

                            // Update the records in AsyncStorage
                            await AsyncStorage.setItem('syncQueue', JSON.stringify(updatedRecords));

                            // Update the state with the new records
                            setSavedReports(updatedRecords);

                            Alert.alert('Record deleted successfully');
                        },
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error deleting record:', error);
            Alert.alert('Error deleting record');
        }
    };

    return (
        <View>
            {savedReports.length > 0 ? (
                <FlatList
                    data={savedReports}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CollectData', { reportData: item })}
                            style={[styles.reportItem, item.status === 'Synced' || styles.syncedItem]}
                        >
                            <Text style={styles.reportTitleText}>{item.title}</Text>

                            <View style={styles.reportDetail}>
                                <View style={styles.detailContainer}>
                                    <Text>{formatDate(item.from)} to {formatDate(item.to)} - <Text  style={styles.syncedItemText}>{item.status}</Text></Text>
                                </View>

                                <TouchableOpacity style={item.status === 'Synced' ? styles.hiddenButton : styles.delButton}   onPress={() => handleDeleteRecord(item.appid)}>
                                    <Text>Delete</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.hr}></View>
                            <View style={styles.buttonGroup}>
                                <View style={styles.buttonContainer}>
                                    <Button title="Add Issues" onPress={() => navigation.navigate('ReportIssues', { reportId:item.appid, reportTitle:item.title })} />
                                </View>
                                <View style={styles.buttonContainer}>
                                    <Button title="View Issues" onPress={() => navigation.navigate('ViewIssues', { reportId:item.appid, reportTitle:item.title })}/>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            ) : (
                <Text>No saved reports found.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reportItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        margin: 5,
        backgroundColor: '#fff', // Background color
        borderRadius: 8, // Border radius
        elevation: 3, // Android elevation for shadow
    },
    syncedItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        marginBottom: 10,
        backgroundColor: "gray", // Background color
        borderRadius: 8, // Border radius
        elevation: 3, // Android elevation for shadow
    },
    syncedItemText: {
        textShadowRadius: 2,
        textAlign: "right",
        color: "green",
        backgroundColor: "yellow",
        borderRadius: 3,
    },
    reportTitleText: {
        fontSize: 18,
        color: 'brown',
        fontWeight: "bold"
    },
    reportDetail: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    detailContainer: {
        width: '80%',
    },
    reportStatus: {
        width: '20%',
    },
    delButton: {
        backgroundColor: "red",
        color: "white",
        height: 30,
        textTransform: "lowercase",
        borderRadius: 8,
        fontSize: 10,
        padding: 4,
    },
    hiddenButton: {
        display: 'none',
    },
    groupContainer: {
        borderColor: 'green',
        borderStyle: "solid",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginTop: 10,
    },
    buttonContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    hr: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        marginVertical: 10,
    },
});


export default ViewDataScreen;
