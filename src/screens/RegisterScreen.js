// Import necessary libraries
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

import RNPickerSelect from 'react-native-picker-select';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveToAsyncStorage,
  getFromAsyncStorage,
  getCsrfToken,
  clearAsyncStorage,
  localServerAddress,
  checkAsyncStorageKeys
} from "../utility/storage";

import axios from "axios";

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [facility, setFacility] = useState('');
  const [password, setPassword] = useState('');

  const [facilities, setFacilities] = useState([]);
  const [states, setStates] = useState([]);
  // const [selectedFacility, setSelectedFacility] = useState('');
  // const [selectedState, setSelectedState] = useState('');

  useEffect(() => {

    // clearAsyncStorage();
    //
    checkAsyncStorageKeys();

    const loadStatesAndFacilities = async () => {
      try {
        // Retrieve the stringified statesData from AsyncStorage
        const statesDataString = await getFromAsyncStorage('states');

        // Parse the stringified data back into an array
        const statesData = statesDataString ? JSON.parse(statesDataString) : [];

        if (statesData && statesData.length > 0) {
          console.log("Local States:", JSON.stringify(statesData));
          setStates(statesData);
        } else {
          const response = await fetch(`${localServerAddress}/tbqual/api/states`);
          const statesFromApi = await response.json();

          setStates(statesFromApi);
          console.log("Api States:" +statesFromApi);
          await saveToAsyncStorage('states', statesFromApi);
        }

        const facilitiesDataString = await getFromAsyncStorage('facilities');

        // Parse the stringified data back into an array
        const facilitiesData = facilitiesDataString ? JSON.parse(facilitiesDataString) : [];

        if (facilitiesData  && facilitiesData.length > 0) {
          console.log("Local Facilities:", JSON.stringify(facilitiesData));
          setFacilities(facilitiesData);
        } else {

          const response = await fetch(`${localServerAddress}/tbqual/api/facilities`);
          const facilitiesFromApi = await response.json();
          setFacilities(facilitiesFromApi);
          console.log("Api Facilities:" +JSON.stringify(facilitiesFromApi));

          await saveToAsyncStorage('facilities', facilitiesFromApi);
        }
      } catch (error) {
        console.error('Error loading states and facilities:', error.message);
      }
    };

    loadStatesAndFacilities();
  }, []); // Empty dependency array to run the effect only once


  // const saveToAsyncStorage = async (key, newData) => {
  //   try {
  //
  //     // console.log(`Key ${key} cleared successfully`);
  //     // Load existing data from AsyncStorage
  //     const existingDataString = await AsyncStorage.getItem(key);
  //     let existingData = existingDataString ? JSON.parse(existingDataString) : [];
  //
  //     // Filter out duplicates and merge with existing data
  //     const uniqueData = Array.from(new Set([...existingData, ...newData]));
  //
  //     // Save merged data back to AsyncStorage
  //     await AsyncStorage.setItem(key, JSON.stringify(uniqueData));
  //   } catch (error) {
  //     console.error(`Error saving ${key} to AsyncStorage:`, error.message);
  //   }
  // };


  const handleRegister = async () => {
    try {
      const csrfToken = await getCsrfToken();

      console.log(csrfToken);

        // const response = await axios.post('http://41.223.44.116:90/tbqual/api/register-user', {

        const response = await axios.post(`${localServerAddress}/tbqual/api/register-user`, {
        name,
        phone_number,
        email,
        state,
        facility,
        password
      }, {
        headers: {
          'X-CSRF-TOKEN': csrfToken,
          'Content-Type': 'application/json', // You may adjust the content type as needed
        },
      });

      // Assuming your backend sends an authentication token upon successful registration
      const authToken = response.data.token;

      // Store the token securely (you may use AsyncStorage or other secure storage)
      // Navigate to the home screen or any other screen upon successful registration
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
      <PaperProvider theme={DefaultTheme}>
        <View style={styles.container}>
          {/* Register Form */}
          <View style={styles.formContainer}>

            <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={(text) => setName(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone_number}
                onChangeText={(text) => setPhoneNumber(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
            />
            <Text>Select State:</Text>
            <RNPickerSelect
                placeholder={{ label: 'Select a state', value: null }}
                items={states}
                onValueChange={(value) => setState(value)}
                value={state}
                useNativeAndroidPickerStyle={false}
                style={pickerSelectStyles}
            />

            <Text>Select Facility:</Text>
            <RNPickerSelect
                placeholder={{ label: 'Select a facility', value: null }}
                items={facilities}
                onValueChange={(value) => setFacility(value)}
                value={facility}
                useNativeAndroidPickerStyle={false}
                style={pickerSelectStyles}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
            />

            <Button title="Register" onPress={handleRegister} />
          </View>
        </View>
      </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    flexDirection: "row",
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
  },

});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    color: 'black',
    paddingLeft: 8 // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    color: 'black',
    paddingLeft: 30,
    marginBottom: 8,
  }
});

export default RegisterScreen;
