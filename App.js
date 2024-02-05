import React from 'react';
import AppNavigator from "./src/utility/AppNavigator";
import NetInfo from '@react-native-community/netinfo';
import {syncCollectedData} from "./src/utility/storage";

NetInfo.addEventListener((state) => {
    if (state.isConnected) {
        // Device is online, sync collected data
        syncCollectedData();
    }
});
const App = () => {
    return <AppNavigator />;
};

export default App;
