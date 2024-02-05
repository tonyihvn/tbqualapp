// screens/LoginScreen.js
import axios from 'axios';
// Import necessary libraries
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import {TouchableOpacity} from "react-native-gesture-handler";
import { useNavigation } from '@react-navigation/native'
import {getCsrfToken, saveToAsyncStorage, localServerAddress, onlineServerAddress} from "../utility/storage";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";

const LoginScreen = () => {
  const navigation = useNavigation();
  // console.log({localServerAddress});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (validateEmail(email)) {
      // Email is valid, proceed with login logic
      console.log('Email:', email);
      // Add your login logic here

      try {
        const csrfToken = await getCsrfToken();
        const response = await axios.post(`${localServerAddress}/tbqual/api/login`, {
          email,
          password,
        }, {
          headers: {
            'X-CSRF-TOKEN': csrfToken,
            'Content-Type': 'application/json', // You may adjust the content type as needed
          },
        });

        const authToken = response.data.token;
        await asyncStorage.setItem('authToken', authToken);
        // Save the token to local storage or app state for later use
        // localStorage.setItem('authToken', authToken);
        console.log('Login successful. Token:', authToken);
        navigation.navigate('Auth');
      } catch (error) {
        //error.response.data.message
        let addedInfo = "";
        if(error.response.data.message){
          addedInfo = " Please, check your username and password";
        }
        Alert.alert('Login failed: ' + error.response.data.message + addedInfo);
        console.error('Login failed:', error.response.data.message);
      }
    } else {
      // Display an alert for invalid email
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }

  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const validateEmail = (text) => {
    // Regular expression for validating an Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };
  return (
      <PaperProvider theme={DefaultTheme}>
        <View style={styles.container}>
          {/* Logo and Heading */}
          <View style={styles.logoContainer}>
            <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.heading}>TBQual Mobile App</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
          </View>

          {/* Register Link */}
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.registerLink}>Don't have an account? Register here.</Text>
          </TouchableOpacity>
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
  formContainer: {
    width: '100%',
    marginTop: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
  },

  registerLink: {
    marginTop: 16,
    color: 'red',
    textDecorationLine: 'underline',
  },

});

export default LoginScreen;
