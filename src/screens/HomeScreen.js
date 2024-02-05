// screens/HomeScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import { PaperProvider } from "react-native-paper";

const HomeScreen = ({ navigation }) => {
  return (
    <PaperProvider>
      <View>
        <Text>Home Screen</Text>
        <Button title="Add Contact" onPress={() => navigation.navigate('AddContact')} />
      </View>
    </PaperProvider>
  );
};

export default HomeScreen;
