// Import necessary libraries
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity, Alert
} from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import from the new package
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import RNPickerSelect from 'react-native-picker-select';
import {
    saveToAsyncStorage,
    getFromAsyncStorage,
    getCsrfToken,
    checkInternetConnection,
    localServerAddress
} from "../utility/storage";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from 'date-fns'; // Import date-fns for date formatting

const CollectDataScreen = ({route}) => {

    // Extract reportData from route params
    const { reportData } = route.params;

    const [fields, setFields] = useState({
        appid: '',
        id: 0,
        title: '',
        facility: '',
        from: new Date(),
        to: new Date(),
        ndstb1u15: '',
        ddstb1: '',
        ndstb2u15: '',
        ddstb2: '',
        ndstb3u: '',
        ddstb3: '',
        ndstb4u: '',
        ddstb4: '',
        ndstb5u: '',
        ddstb5: '',
        ndstb6u: '',
        ddstb6: '',
        ndstb7u: '',
        ddstb7: '',
        ndstb8u: '',
        ddstb8: '',
        ndstb9u: '',
        ddstb9: '',
        ndstb10u: '',
        ddstb10: '',
        ndstb11u: '',
        ddstb11: '',
        ndstb12u: '',
        ddstb12: '',
        ndstb13u: '',
        ddstb13: '',
        ndstb14u: '',
        ddstb14: '',
        ndstb15u: '',
        ddstb15: '',
        ndstb16u: '',
        ddstb16: '',
        ndstb17u: '',
        ddstb17: '',
        ndstb18u: '',
        ddstb18: '',
        ndstb19u: '',
        ddstb19: '',
        entered_by: '',
        status: 'Open',
    });
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const handleDateChange = (field, event, date) => {

        setShowFromPicker(false);
        setShowToPicker(false);
        if(date){
            const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
            setFields({ ...fields, [field]: formattedDate });
        }

    };
    const [facilities, setFacilities] = useState([]);
    // const [states, setStates] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(fields.from);
    const [selectedToDate, setSelectedToDate] = useState(fields.to);


    const loadStatesAndFacilities = async () => {
        // await clearAsyncStorage()
        try {

            const facilitiesData = getFromAsyncStorage('facilities');
            if (facilitiesData  && facilitiesData.length > 0) {
                // console.log("Local Facilities:", JSON.stringify(facilitiesData));
                setFacilities(facilitiesData);
                console.log("Local Facilities: "+facilitiesData);
            }  else {

                const response = await fetch(`${localServerAddress}/tbqual/api/facilities`);
                const facilitiesFromApi = await response.json();
                setFacilities(facilitiesFromApi);
                console.log("Api Facilities:", facilitiesFromApi);

                await saveToAsyncStorage('facilities', facilitiesFromApi);
            }
        } catch (error) {
            console.error('Error loading states and facilities:', error.message);
        }
    };

    useEffect(() => {
        loadStatesAndFacilities();
        if (reportData) {
            setFields(reportData);
        }
    }, [reportData]); // Empty dependency array to run the effect only once
    const syncQueueKey = 'syncQueue';

    const submitCollectedData = async () => {
        try {
            // Check internet connection
            const isConnected = await checkInternetConnection();

            if (!isConnected) {
                // Save the data locally to AsyncStorage
                await saveDataLocally();
                Alert.alert("Your data has been saved offline. Please sync when you have an internet connection.");
                return;
            }

            // If internet connection is available, proceed with online data transfer
            const locallyStoredData = await AsyncStorage.getItem(syncQueueKey);
            if (locallyStoredData) {
                const csrfToken = await getCsrfToken();
                let syncQueue = JSON.parse(locallyStoredData); // Make a copy of the syncQueue

                const authToken = await AsyncStorage.getItem('authToken');
                console.log(authToken);

                for (const item of syncQueue) {
                    try {
                        const response = await axios.post(`${localServerAddress}/tbqual/api/newAPIAggReport`, {
                            ...item,
                        }, {
                            headers: {
                                'X-CSRF-TOKEN': csrfToken,
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`,
                            },
                        });

                        // Extract the ID from the response
                        const { id } = response.data;
                        console.log("The ID is: " + id);

                        // Update the item with the received ID and set status to "Synced"
                        const updatedItem = { ...item, id, status: 'Synced' };

                        // Update the item in the syncQueue
                        syncQueue = syncQueue.map(queueItem => queueItem.appid === updatedItem.appid ? updatedItem : queueItem);

                        console.log("Successful: " + response.data.message);
                    } catch (error) {
                        console.error('Error syncing item:', error);
                        Alert.alert("Error syncing item");
                    }
                }

                // Save the updated syncQueue to AsyncStorage
                await AsyncStorage.setItem('syncQueue', JSON.stringify(syncQueue));
                console.log(syncQueue);
                Alert.alert("Successful: All items have been synced to the Server!");
            }
        } catch (error) {
            console.error('Sending to Server Failed failed:', error);
            // Handle error
            Alert.alert("Error sending data to the server. Please try again later.");
        }
    };

    const saveDataLocally = async () => {
        try {
            let updatedQueue = [];
            const syncQueue = await AsyncStorage.getItem(syncQueueKey) || '[]';
            const existingQueue = JSON.parse(syncQueue);

            // If an id is provided, update the existing record
            if (fields.appid && fields.appid !== "") {
                updatedQueue = existingQueue.map(item => {
                    if (item.appid === fields.appid) {
                        return { ...item, ...fields };
                    }
                    return item;
                });
            } else {
                // Generate a unique id for new records
                const newRecord = { ...fields, appid: uuidv4() };
                updatedQueue = [...existingQueue, newRecord];
            }

            // Save the updated queue to AsyncStorage
            await AsyncStorage.setItem(syncQueueKey, JSON.stringify(updatedQueue));
        } catch (error) {
            console.error('Save failed:', error);
            Alert.alert("Error Saving Data: " + error);
        }
    };

    const saveCollectedData = async () => {
        try {
            let updatedQueue = [];
            const syncQueue = await AsyncStorage.getItem(syncQueueKey) || '[]';
            const existingQueue = JSON.parse(syncQueue);

            // If an id is provided, update the existing record
            if (fields.appid && fields.appid!=="") {
                updatedQueue = existingQueue.map(item => {
                    if (item.appid === fields.appid) {
                        return { ...item, ...fields };
                    }
                    return item;
                });
            } else {
                // Generate a unique id for new records
                const newRecord = { ...fields, appid: uuidv4() };
                updatedQueue = [...existingQueue, newRecord];
            }

            // Save the updated queue to AsyncStorage
            await AsyncStorage.setItem(syncQueueKey, JSON.stringify(updatedQueue));

            Alert.alert("Your Data has been saved offline.");
        } catch (error) {
            console.log('Save failed:', error);
            Alert.alert("Error Saving Data: "+ error);
        }
    };

    return (
        <PaperProvider theme={DefaultTheme}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView>
                    <View style={styles.container}>
                        {/* Register Form */}
                        <View style={styles.formContainer}>
                            <Text>Title - AppID: {fields.id}</Text>
                            <TextInput
                                style={styles.GenericTextInput}
                                placeholder="Enter Report Title"
                                value={fields.title}
                                onChangeText={(text) => setFields({ ...fields, title: text })} />

                            <Text>Select Facility:</Text>
                            <RNPickerSelect
                                placeholder={{ label: 'Select a facility', value: null }}
                                items={facilities}
                                onValueChange={(value) => setFields({...fields, facility: value})}
                                value={fields.facility}
                                useNativeAndroidPickerStyle={false}
                                style={pickerSelectStyles}
                            />

                            <Text>From (Date)</Text>
                            <TouchableOpacity onPress={() => setShowFromPicker(true)}>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Select From Date"
                                    value={fields.from ? new Date(fields.from).toDateString() : new Date().toDateString()}
                                    editable={false}
                                />
                            </TouchableOpacity>
                            {showFromPicker && (
                                <DateTimePicker
                                    value={fields.from ? new Date(fields.from) : new Date()}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, date) => {
                                        handleDateChange('from', event, date);
                                        setSelectedFromDate(date);
                                    }}
                                />
                            )}

                            <Text>To (Date)</Text>
                            <TouchableOpacity onPress={() => setShowToPicker(true)}>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Select To Date"
                                    value={fields.to ? new Date(fields.to).toDateString() : new Date().toDateString()}
                                    editable={false}
                                />
                            </TouchableOpacity>
                            {showToPicker && (
                                <DateTimePicker
                                    value={fields.to ? new Date(fields.to) : new Date()}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, date) => {
                                        handleDateChange('to', event, date);
                                        setSelectedToDate(date);
                                    }}
                                />
                            )}

                            <Text style={styles.categoryText}>DSTB Indicators</Text>
                            <View style={styles.groupContainer}>

                                <Text style={styles.Question}>1. Proportion of hospital attendees within the review period who were symptomatically screened for TB - <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text> Number of hospital attendees within the review period who were symptomatically screened for TB(Facility OPD Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb1u15}
                                    onChangeText={(text) => setFields({ ...fields, ndstb1u15: text })} />

                                <Text><Text style={styles.Question}>Denominator: </Text> Total number of hospital attendees within the review period (Facility OPD Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb1}
                                    onChangeText={(text) => setFields({ ...fields, ddstb1: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>2. Proportion of presumptive TB cases identified within the review period evaluated for TB using WHO Rapid Diagnostics (Xpert MTB RIF assay, TB LAMP, TrueNat). -
                                    <Text style={styles.benchmark}>Benchmark: 75%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text> Number of presumptive TB cases identified within the review period evaluated for TB using WHO Rapid Diagnostics (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb2u15}
                                    onChangeText={(text) => setFields({ ...fields, ndstb2u15: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text> Total number of presumptive TB cases identified within the review period evaluated (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb2}
                                    onChangeText={(text) => setFields({ ...fields, ddstb2: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>3. Proportion of presumptive TB cases identified within the review period whose sputum specimen were sent to GeneXpert Lab and had their results received within 72 hrs of sending sputum specimen to Lab -
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text> Number of presumptive TB cases identified within the review period whose sample (sputum/stool specimen) were sent to GeneXpert Lab and had their results received within 72 hrs of sending sputum specimen to Lab. (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb3u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb3u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text> Total number of presumptive TB cases identified within the review period whose sample (sputum/stool specimen) were received (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb3}
                                    onChangeText={(text) => setFields({ ...fields, ddstb3: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>4. Proportion of confirmed TB cases diagnosed within the review period that have initiated treatment for TB within two days of diagnosis
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text> Number of confirmed TB cases diagnosed within the review period that have initiated treatment for TB within two days of diagnosis (Treatment Register/Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb4u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb4u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text> Total number of confirmed TB cases within the review period. (Presumptive Register))</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb4}
                                    onChangeText={(text) => setFields({ ...fields, ddstb4: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>5. Proportion of DS-TB cases with positive baseline sputum smear or Xpert MTB/RIF started on treatment within the review period who are due for and with documented (2, 5 or 6) follow-up test.
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text> Number of DS-TB cases with positive baseline sputum smear or Xpert MTB/RIF started on treatment in the 6 months prior to the review period with documented follow-up sputum smear AFB within the recommended time frame (2,5 & 6 months). (Treatment Register/Treatment Card)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb5u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb5u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text> Total number of DS-TB cases with positive baseline sputum smear or Xpert MTB/RIF started on treatment in the 6 months prior to the review period (Treatment Register/Treatment Card)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb5}
                                    onChangeText={(text) => setFields({ ...fields, ddstb5: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>6. Proportion of DS-TB patients started on treatment within the review period with complete documentation in the treatment card and the TB facility (treatment) register.
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text> Number of DS-TB patients started on treatment within the review period with complete documentation in the treatment card and the TB facility (treatment) register. (Treatment Card and Treatment Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb6u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb6u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Number of DS-TB patients started on treatment within the review period. (Treatment Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb6}
                                    onChangeText={(text) => setFields({ ...fields, ddstb6: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>7. Proportion of bacteriologically diagnosed index TB patients during the review period who had their household contacts traced within one month of treatment initiation.
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of bacteriologically diagnosed index TB patients during the review period who had their household contacts traced within one month of treatment initiation. (Contact Investigation Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb7u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb7u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Total number of bacteriologically diagnosed index TB patients during the review period. (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb7}
                                    onChangeText={(text) => setFields({ ...fields, ddstb7: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>8. Proportion of eligible contacts of bacteriologically positive TB cases who were initiated on TPT
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Total number of eligible contacts of bacteriologically positive TB cases initiated on TPT (Contact Investigation Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb8u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb8u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Total number of contacts of bacteriologically positive TB cases eligible for TPT(Contact Investigation Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb8}
                                    onChangeText={(text) => setFields({ ...fields, ddstb8: text })} />
                            </View>

                            <Text style={styles.categoryText}>DRTB Indicators</Text>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>1. Proportion of all DR-TB cases diagnosed during the review period who initiated treatment for DR-TB within two weeks of diagnosis.
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of all DR-TB cases diagnosed during the review period who initiated treatment for DR-TB within two weeks of diagnosis. (DRTB Treatment Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb9u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb9u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Number of all DR-TB cases diagnosed during the review period. (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb9}
                                    onChangeText={(text) => setFields({ ...fields, ddstb9: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>2. Proportion of patients started on second-line TB treatment within the review period who have their baseline (LPA, X-ray, AFB, HIV test, EUCr, Pregnancy test, LFT, TFT, FBS, FBC, HBV, HCV, Urinalysis, ECG) results documented after 2 weeks of sample collection.
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of patients started on second-line TB treatment within the review period who have their baseline (LPA, X-ray, AFB, HIV test, EUCr, Pregnancy test, LFT, TFT, FBS, FBC, HBV, HCV, Urinalysis, ECG) results documented after 2 weeks of sample collection. (DRTB Treatment Register/DRTB Treatment Card)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb10u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb10u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Number of patients started on second-line TB treatment within the review period. (DRTB Treatment Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb10}
                                    onChangeText={(text) => setFields({ ...fields, ddstb10: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>3. Proportion of patients started on second-line TB treatment 9 or 12 months within the review period (i.e. 9 or 12 months after the closing day of the cohort) who have their follow-up examinations (AFB, Culture, EUCr, ECG done monthly during the intensive phase within the review period.
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of patients started on second-line TB treatment 19 or 12 months within the review period (i.e. 9 or 12 months after the closing day of the cohort) who have their follow-up examinations (AFB, Culture, EUCr, ECG done monthly during the intensive phase within the review period.(DRTB Treatment Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb11u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb11u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Number of patients started on second-line TB treatment 19 or 12 months within the review period. (DRTB Treatment Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb11}
                                    onChangeText={(text) => setFields({ ...fields, ddstb11: text })} />
                            </View>

                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>4. Proportion of DR-TB patients started on treatment 6 months within the review period with complete documentation in the treatment card and the DR-TB facility (treatment) register
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of DR-TB patients started on treatment 6 months prior to the review period with complete documentation in the treatment card and the DR-TB facility (treatment) register. (DRTB Treatment Register/DRTB Treatment Card)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb12u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb12u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Number of DR-TB patients started on treatment 6 months prior to the review period. (DRTB Treatment Register/DRTB Treatment Card)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb12}
                                    onChangeText={(text) => setFields({ ...fields, ddstb12: text })} />
                            </View>
                            <Text style={styles.categoryText}>PEDIATRICS Indicators</Text>
                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>1. Proportion of presumptive paediatric TB cases under 15 years identified within the review period who had access to either chest X-ray and/or Xpert MTB/RIF and/or stool depending on the age
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of presumptive paediatric TB cases under 15 years identified within the review period who had access to either chest X-ray and/or Xpert MTB?RIF and/or stool depending on the age. (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb13u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb13u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Total Number of presumptive paediatric TB cases under 15 years identified within the review period. (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb13}
                                    onChangeText={(text) => setFields({ ...fields, ddstb13: text })} />
                            </View>
                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>2. Proportion of children under 15 years diagnosed with TB within the review period.
                                    <Text style={styles.benchmark}>Benchmark: 15%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of children under 15 years diagnosed with TB within the review period. (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb15u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb15u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Total Number of diagnosed TB cases within the review period. (Presumptive Register15</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb15}
                                    onChangeText={(text) => setFields({ ...fields, ddstb15: text })} />
                            </View>
                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>3. Proportion of patients under 15 years among confirmed TB cases diagnosed within the review period that have initiated treatment for TB within two days of diagnosis.
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of patients under 15 years among confirmed TB cases diagnosed within the review period that have initiated treatment for TB within two days of diagnosis. (Presumptive Register/DSTB Treatment Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb16u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb16u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Number of patients under 15 years among confirmed TB cases within the review period. (Presumptive Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb16}
                                    onChangeText={(text) => setFields({ ...fields, ddstb16: text })} />
                            </View>
                            <Text style={styles.categoryText}>FACILITY Performance</Text>
                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>1. Proportion of health care workers (HCW) in the DOT and laboratory clinics who were screened for TB 12 months within the review period.
                                    <Text style={styles.benchmark}>Benchmark: 100%</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of healthcare workers working in the DOT and laboratory clinics who were screened for TB 12 months prior to the review period. (Facility OPD Register)</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb18u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb18u: text })} />

                                <Text><Text style={styles.Question}>Denominator:</Text>Number of health care workers in the DOCT and laboratory clinics participating in review period.</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb18}
                                    onChangeText={(text) => setFields({ ...fields, ddstb18: text })} />
                            </View>
                            <View style={styles.groupContainer}>
                                <Text style={styles.Question}>2. Proportion of infection control strategies in place at the facility (i.e. IPC plan and policy, IPC guidelines, IPC focal person, IPC committee [minutes of meeting], IEC materials, evidence of use of IPC checklist to monitor implementation monthly)
                                    <Text style={styles.benchmark}>Benchmark: 100% (All 6 strategies should be in place)</Text></Text>
                                <Text><Text style={styles.Question}>Numerator: </Text>Number of infection control strategies in place at the facility (i.e. IPC plan and policy, IPC guidelines, IPC focal person, IPC committee [minutes of meeting], IEC materials, evidence of use of IPC checklist to monitor implementation monthly).</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Numerator" keyboardType="numeric"
                                    value={fields.ndstb19u}
                                    onChangeText={(text) => setFields({ ...fields, ndstb19u: text })} />
                                <Text><Text style={styles.Question}>Denominator:</Text>Number of infection control strategies (i.e. IPC plan and policy, IPC guidelines, IPC focal person, IPC committee [minutes of meeting], IEC materials, evidence of use of IPC checklist to monitor implementation monthly).</Text>
                                <TextInput
                                    style={styles.GenericTextInput}
                                    placeholder="Enter Denominator" keyboardType="numeric"
                                    value={fields.ddstb19}
                                    onChangeText={(text) => setFields({ ...fields, ddstb19: text })} />
                            </View>

                            <View style={styles.buttonGroup}>
                                <View style={styles.buttonContainer}>
                                    <Button title="Save" onPress={saveCollectedData} />
                                </View>
                                <View style={styles.buttonContainer}>
                                    <Button title="Submit" onPress={submitCollectedData} />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

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
        marginTop: 20,
    },

    GenericTextInput: {
        borderColor: "green",
        borderStyle: "solid",
        borderWidth: 1,
        padding: 4
    },

    Question: {
        fontWeight: "bold",
        marginBottom: 5
    },

    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingLeft: 8,
    },

    groupContainer: {
        borderColor: 'green',
        borderStyle: "solid",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        marginBottom: 10,
        backgroundColor: '#fff', // Background color
        borderRadius: 8, // Border radius
        elevation: 3, // Android elevation for shadow
    },

    benchmark:{
        fontSize: 12,
        color: 'red',
        fontStyle: "italic",
    },

    buttonGroup:{
        flexDirection: "row",
        justifyContent: "space-between", // This will evenly distribute the buttons
        paddingHorizontal: 16, // Optional: Add padding to the sides for spacing
    },

    buttonContainer: {
        flex: 1,
        margin: 5
    },
    categoryText: {
        textAlign: "center",
        fontWeight: "bold",
        color: 'green',
        flex: 1
    }
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: 'green',
        color: 'black',
        paddingLeft: 8 // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderWidth: 0.5,
        borderColor: 'green',
        color: 'black',
        paddingLeft: 4,
        marginBottom: 8,
    }
});

export default CollectDataScreen;
