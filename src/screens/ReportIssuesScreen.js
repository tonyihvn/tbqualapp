import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView,
    StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {getCsrfToken, getFromAsyncStorage, localServerAddress, saveToAsyncStorage} from "../utility/storage";
import RNPickerSelect from "react-native-picker-select";
import {v4 as uuidv4} from "uuid";

// Get today's date
const today = new Date();
const date = today.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
// Generate a unique id for new records
const appid = uuidv4();

const ReportIssuesScreen = ({ route }) => {
    const { reportId } = route.params;
    const { reportTitle } = route.params;
    const { appID } = route.params;

    const [indicatorNo, setIndicatorNo] = useState('');
    const [issues, setIssues] = useState('');
    const saveReportLocally = async () => {
        try {

            // Save the report locally
            const reportIssues = { reportId, indicatorNo, issues, date, appid };
            let savedReportsIssues = await AsyncStorage.getItem('savedReportsIssues');
            savedReportsIssues = savedReportsIssues ? JSON.parse(savedReportsIssues) : [];
            savedReportsIssues.push(reportIssues);
            await AsyncStorage.setItem('savedReportsIssues', JSON.stringify(savedReportsIssues));
            console.log("Issue"+JSON.stringify(savedReportsIssues))
            Alert.alert('Report saved locally successfully.');
        } catch (error) {
            console.error('Error saving report locally:', error);
            Alert.alert('Failed to save report locally.');
        }
    };

    const submitReport = async () => {
        try {
            // Check internet connection
            const connectionInfo = await NetInfo.fetch();

            if (connectionInfo.isConnected) {

                // Save the report locally
                const csrfToken = await getCsrfToken();
                const authToken = await AsyncStorage.getItem('authToken');
                const response = await axios.post(`${localServerAddress}/tbqual/api/save-aggreport-issue`, {
                    reportId,
                    indicatorNo,
                    issues,
                    date,
                    appid
                }, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                });
                await saveReportLocally();
                Alert.alert('Report submitted successfully.');
            } else {
                // Save report locally if no internet connection
                await saveReportLocally();
                Alert.alert('No internet connection. Report saved locally.');
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            Alert.alert('Failed to submit report.');
        }
    };

    const loadAdminComments = async () => {
        try {
            const response = await fetch(`${localServerAddress}/tbqual/api/admin-comments`);
            const adminComments = await response.json();

            if (Array.isArray(adminComments) && adminComments.length > 0) {
                // Retrieve savedReportsIssues from AsyncStorage
                let savedReportsIssues = await AsyncStorage.getItem('savedReportsIssues');
                // Parse the JSON string to an array of objects
                savedReportsIssues = JSON.parse(savedReportsIssues);

                // Iterate through each comment in adminComments
                adminComments.forEach(async (adminComment) => {
                    const { comments, appid } = adminComment;

                    // Find the index of the record with the matching appid
                    const indexToUpdate = savedReportsIssues.findIndex(issue => issue.appid === appid);

                    // Check if the record with the given appid exists
                    if (indexToUpdate !== -1) {
                        // Update the record at the found index
                        savedReportsIssues[indexToUpdate] = {
                            ...savedReportsIssues[indexToUpdate],
                            comments: comments // Assuming comments is the fetched comments data
                        };

                        // Save the updated records back to AsyncStorage
                        await AsyncStorage.setItem('savedReportsIssues', JSON.stringify(savedReportsIssues));

                        console.log('Record updated successfully.' + savedReportsIssues);
                    } else {
                        console.log('Record with appid', appid, 'not found.');
                    }
                });
            } else {
                console.log('No admin comments found.');
            }
        } catch (error) {
            console.error('Error loading admin comments:', error.message);
        }
    };

    useEffect(() => {
        loadAdminComments();

    }, []); // Empty dependency array to run the effect only once

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.titleBox}>
                    <Text>{reportId}</Text>
                    <Text>Report Title:</Text>
                    <Text style={styles.titleText}>{reportTitle}</Text>
                </View>
                <View style={styles.groupContainer}>
                    <Text>Select Indicator:</Text>
                    <RNPickerSelect
                        placeholder={{ label: 'Select an Indicator', value: null }}
                        onValueChange={(value) => setIndicatorNo(value)}
                        items={[
                            { label: 'DSTB Indicator 1', value: '1' },
                            { label: 'DSTB Indicator 2', value: '2' },
                            { label: 'DSTB Indicator 3', value: '3' },
                            { label: 'DSTB Indicator 4', value: '4' },
                            { label: 'DSTB Indicator 5', value: '5' },
                            { label: 'DSTB Indicator 6', value: '6' },
                            { label: 'DSTB Indicator 7', value: '7' },
                            { label: 'DSTB Indicator 8', value: '8' },
                            { label: 'DRTB Indicator 1', value: '9' },
                            { label: 'DRTB Indicator 2', value: '10' },
                            { label: 'DRTB Indicator 3', value: '11' },
                            { label: 'DRTB Indicator 4', value: '12' },
                            { label: 'PAEDIATRICS Indicator 1', value: '13' },
                            { label: 'PAEDIATRICS Indicator 2', value: '14' },
                            { label: 'PAEDIATRICS Indicator 3', value: '15' },
                            { label: 'FACILITY Indicator 1', value: '16' },
                            { label: 'FACILITY Indicator 2', value: '17' },
                        ]}
                    />
                </View>
                <View style={styles.groupContainer}>
                    <Text>Issues:</Text>
                    <TextInput
                        style={{ borderWidth: 1, borderColor: 'gray', padding: 10, marginBottom: 20 }}
                        multiline
                        value={issues}
                        onChangeText={setIssues}
                    />
                </View>

                <View style={styles.buttonGroup}>
                    <View style={styles.buttonContainer}>
                        <Button title="Save" onPress={saveReportLocally} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="Send to Server" onPress={submitReport} />
                    </View>
                </View>

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleText: {
        fontWeight: "bold",
        marginBottom: 10,
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 5,
        width: '100%',
    },
    buttonContainer: {
        flex: 1,
        marginHorizontal: 5,
    },
    groupContainer: {
        borderColor: 'green',
        borderStyle: "solid",
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 3,
    },
    titleBox: {

        padding: 5,

        margin: 10,

    },
});
export default ReportIssuesScreen;
