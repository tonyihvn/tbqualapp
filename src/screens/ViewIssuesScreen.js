import React, { useState, useEffect } from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewIssuesScreen = ({ route, navigation }) => {
    const { reportId } = route.params;
    const [savedReports, setSavedReports] = useState([]);
    console.log("Report ID: "+reportId)

    useEffect(() => {
        const fetchSavedReports = async () => {
            try {
                const savedReportsJSON = await AsyncStorage.getItem('savedReportsIssues');
                if (savedReportsJSON) {
                    const savedReportsData = JSON.parse(savedReportsJSON);

                    if (reportId === "All" || reportId==="") {

                        const syncedReportTitles = await Promise.all(savedReportsData.map(async report => {
                            const syncQueueRecord = await AsyncStorage.getItem("syncQueue");
                            const syncQueueData = JSON.parse(syncQueueRecord);
                            const syncedRecord = syncQueueData.find(item => item.appid === report.reportId);
                            return { ...report, title: syncedRecord ? syncedRecord.title : "Title Not Found" };
                        }));
                        setSavedReports(syncedReportTitles);

                        console.log("All Reports"+syncedReportTitles);
                    } else {
                        const filteredReports = savedReportsData.filter(report => report.reportId === reportId);
                        const syncedReportTitles = await Promise.all(filteredReports.map(async report => {
                            const syncQueueRecord = await AsyncStorage.getItem("syncQueue");
                            const syncQueueData = JSON.parse(syncQueueRecord);
                            const syncedRecord = syncQueueData.find(item => item.appid === report.reportId);
                            return { ...report, title: syncedRecord ? syncedRecord.title : "Title Not Found" };
                        }));
                        setSavedReports(syncedReportTitles);
                        console.log("Filtered Report"+syncedReportTitles);
                    }
                }
            } catch (error) {
                console.error('Error fetching saved reports:', error);
            }
        };

        fetchSavedReports();
    }, [reportId]);

    // Function to format date string with ordinal suffix

    return (
        <View>
            {savedReports.length > 0 ? (
                <FlatList
                    data={savedReports}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            // onPress={() => navigation.navigate('CollectData', { reportData: item })}
                            style={[styles.reportItem]}
                        >


                            <View style={styles.row}>
                                <View style={styles.detailContainer}>
                                    <Text>Report Title:</Text>
                                    <Text style={styles.reportTitleText}> {item.title}</Text>
                                </View>
                                <View style={styles.detailContainer}>
                                    <Text>Indicator Number:</Text>
                                    <Text style={styles.reportTitleText}> {item.indicatorNo}</Text>
                                </View>
                            </View>
                            <Text style={styles.reportTitleText}>Issues: </Text>
                            <View style={styles.reportDetail}>
                                    <Text>{item.issues}</Text>
                            </View>

                            <View style={styles.hr}></View>
                            <Text style={styles.reportTitleText}>Admin Comments: </Text>
                            <View style={styles.reportDetail}>
                                <Text>The Admin will appear here.</Text>
                            </View>


                            <View style={styles.hr}></View>
                            <View style={styles.buttonGroup}>

                                <View style={styles.buttonContainer}>
                                    { item.status!=="Synced" ?
                                    <Button style={styles.buttonSuccess} title="Sync Data" onPress={() => navigation.navigate('ReportIssues', { reportId:item.appid, reportTitle:item.title })} />
                                    : <Text>Synced</Text>}

                                </View>

                                <View style={styles.buttonContainer}>
                                    <Button title="Add QI Activity" onPress={() => navigation.navigate('ReportIssues', { reportId:item.appid, reportTitle:item.title })} />
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
        fontSize: 13,
        color: 'brown',
        fontWeight: "bold"
    },
    row:
    {
        flexDirection: "row",
        justifyContent: "space-around",
        borderBottomColor: "brown"
    },
    reportDetail: {
        justifyContent: "space-around",

    },
    detailContainer: {
        width: '50%',
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
    buttonSuccess: {
        backgroundColor: "green"
    },
    hr: {
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        marginVertical: 10,
    }
});


export default ViewIssuesScreen;
