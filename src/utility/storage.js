// storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

export const localServerAddress = 'http://172.16.12.39:90'; //localServerAddress
// export const localServerAddress = 'http://41.223.44.116:90' // onlineServerAddress

// export const localServerAddress = 'http://tb.qual' // onlineServerAddress


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

export const syncCollectedData = async () => {
    try {
        const locallyStoredData = await AsyncStorage.getItem('collectedData');

        if (locallyStoredData) {
            // Send the locally stored data to the server
            const csrfToken = await getCsrfToken();
            const response = await axios.post(`${localServerAddress}/tbqual/api/syncmobiledata`, {
                ...JSON.parse(locallyStoredData),
            }, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                },
            });

            // Remove the locally stored data upon successful sync
            await AsyncStorage.removeItem('collectedData');

            // Optionally, show a success message or update UI
        }
    } catch (error) {
        console.error('Sync failed:', error);
    }
};

