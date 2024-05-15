// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import {Alert} from "react-native";
import NetInfo from "@react-native-community/netinfo";

export const localServerAddress = 'http://172.16.12.39:90'; //localServerAddress
// export const localServerAddress = 'http://41.223.44.116:90' // onlineServerAddress

// export const localServerAddress = 'http://tb.qual' // onlineServerAddress

export const checkInternetConnection = async () => {
    try {
        const state = await NetInfo.fetch();
        return state.isConnected;
    } catch (error) {
        console.error('Error checking internet connection:', error);
        return false; // Default to false if there is an error
    }
};
export const saveToAsyncStorage = async (key, newData) => {
    try {
        // await clearAsyncStorage()
        // Load existing data from AsyncStorage
        const existingDataString = await AsyncStorage.getItem(key);
        let existingData = existingDataString ? JSON.parse(existingDataString) : [];
        // Concatenate existing data with the new data
        const updatedData = [...existingData, ...newData];
        // Save the concatenated data back to AsyncStorage after stringifying it
        await AsyncStorage.setItem(key, JSON.stringify(updatedData));
    } catch (error) {
        console.error(`Error saving ${key} to AsyncStorage:`, error.message);
    }
};
export const getFromAsyncStorage = async (key) => {
    try {
        // console.log(key+" : "+ value);
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error(`Error getting ${key} from AsyncStorage:`, error.message);
        return null;
    }
};
export const getCsrfToken = async () => {
    try {
        const response = await axios.get(`${localServerAddress}/tbqual/api/csrf-token`);

        // const response = await axios.get('http://41.223.44.116:90/tbqual/api/csrf-token');
        return response.data.csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        throw error; // You may want to handle this error in your UI
    }
};

export const removeTokenFromAsyncStorage = async () => {
    try {
        await AsyncStorage.removeItem('authToken');

    } catch (error) {
        console.error('AsyncStorage error:', error.message);
    }
};

export const clearAsyncStorage = async () => {
    try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared successfully.');
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error.message);
    }
};

export const checkAsyncStorageKeys = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        console.log('AsyncStorage keys:', keys);
    } catch (error) {
        console.error('Error checking AsyncStorage keys:', error.message);
    }
};

export const syncCollectedData = async (key,api_url) => {
    try {
        // Check internet connection
        const isConnected = await checkInternetConnection();

        if (!isConnected) {
            // Save the data locally to AsyncStorage
            Alert.alert("Your data has been saved offline. Please sync when you have an internet connection.");
            return;
        }

        // If internet connection is available, proceed with online data transfer
        const locallyStoredData = await AsyncStorage.getItem(key);
        if (locallyStoredData) {
            const csrfToken = await getCsrfToken();
            let localData = JSON.parse(locallyStoredData); // Make a copy of the syncQueue

            const authToken = await AsyncStorage.getItem('authToken');
            console.log(authToken);

            for (const item of key) {
                try {
                    const response = await axios.post(`${localServerAddress}/tbqual/api/${api_url}`, {
                        ...item,
                    }, {
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });

                    // Extract the ID from the response
                    const { appid } = response.data;
                    console.log("The App ID is: " + appid);

                    // Update the item with the received ID and set status to "Synced"
                    const updatedItem = { ...item, appid, status: 'Synced' };

                    if(key==="syncQueue"){
                        // Extract the ID from the response
                        const { id } = response.data;
                        console.log("The ID is: " + id);

                        // Update the item with the received ID and set status to "Synced"
                        const updatedItem = { ...item, id };
                    }

                    // Update the item in the syncQueue
                    localData = localData.map(queueItem => queueItem.appid === updatedItem.appid ? updatedItem : queueItem);

                    console.log("Successful: " + response.data.message);
                } catch (error) {
                    console.error('Error syncing item:', error);
                    Alert.alert("Error syncing item");
                }
            }

            // Save the updated syncQueue to AsyncStorage
            await AsyncStorage.setItem(key, JSON.stringify(localData));
            console.log(localData);
            Alert.alert("Successful: All items have been synced to the Server!");
        }
    } catch (error) {
        console.error('Sending to Server Failed failed:', error);
        // Handle error
        Alert.alert("Error sending data to the server. Please try again later.");
    }
};

