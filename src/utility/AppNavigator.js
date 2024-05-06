
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DrawerContent from './DrawerContent';
import DashboardScreen from '../../src/screens/DashboardScreen';
import CollectDataScreen from '../../src/screens/CollectDataScreen';
import ViewDataScreen from '../../src/screens/ViewDataScreen';
// import FacilitiesScreen from '../../src/screens/FacilitiesScreen';
import LoginScreen from '../../src/screens/LoginScreen';
import RegisterScreen from '../../src/screens/RegisterScreen';
import AuthLoadingScreen from "../screens/AuthLoadingScreen";
import ReportIssuesScreen from "../screens/ReportIssuesScreen";

import ViewIssuesScreen from "../screens/ViewIssuesScreen";
import FacilitiesScreen from "../screens/FacilitiesScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
// Create the stack navigator for authenticated screens
let reportData = [];
const AuthStack = () => (

        <Drawer.Navigator drawerContent={(props) => <DrawerContent navigation={props.navigation} {...props} />}>
            <Drawer.Screen name="Dashboard" component={DashboardScreen} />
            <Drawer.Screen name="CollectData" component={CollectDataScreen} options={{ title: 'Enter Report' }} initialParams={{ reportData }}/>
            <Drawer.Screen name="ViewData" component={ViewDataScreen} options={{ title: 'Saved Reports' }} />
            <Drawer.Screen name="ViewIssues" component={ViewIssuesScreen}  options={{ title: 'View Issues' }}  initialParams={{ reportData }} />
            <Drawer.Screen name="Facilities" component={FacilitiesScreen} options={{ title: 'My Facilities' }} />
            <Drawer.Screen name="ReportIssues" component={ReportIssuesScreen}  options={{ drawerLabel: () => null }}  initialParams={{ reportData }} />

            {/*<Drawer.Screen name="Facilities" component={FacilitiesScreen} />*/}
        </Drawer.Navigator>
);

// Create the switch navigator for handling the authentication flow
const AppNavigator = () => (

    <NavigationContainer >
        <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="AuthStack" component={LoginRegisterStack} />
            {/*<Stack.Screen name="ReportIssues" component={ReportIssuesScreen}  />*/}
            {/*options={{ title: 'Report Issues' }}  initialParams={{ reportData }}*/}
            {/*<Stack.Screen name="Facilities" component={FacilitiesScreen} />*/}

        </Stack.Navigator>
    </NavigationContainer>
);

const LoginRegisterStack = () => (
    <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

export default AppNavigator;
