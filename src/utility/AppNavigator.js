
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import DrawerContent from './DrawerContent';
import DashboardScreen from '../../src/screens/DashboardScreen';
import CollectDataScreen from '../../src/screens/CollectDataScreen';
import ViewDataScreen from '../../src/screens/ViewDataScreen';
import FacilitiesScreen from '../../src/screens/FacilitiesScreen';
import UsersScreen from '../../src/screens/UsersScreen';
import LoginScreen from '../../src/screens/LoginScreen';
import RegisterScreen from '../../src/screens/RegisterScreen';
import AuthLoadingScreen from "../screens/AuthLoadingScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Create the stack navigator for authenticated screens
const AuthStack = () => (
    <Drawer.Navigator drawerContent={(props) => <DrawerContent navigation={props.navigation} {...props} />}>
        <Drawer.Screen name="Dashboard" component={DashboardScreen} />
        <Drawer.Screen name="CollectData" component={CollectDataScreen} />
        <Drawer.Screen name="ViewData" component={ViewDataScreen} />
        <Drawer.Screen name="Facilities" component={FacilitiesScreen} />
        <Drawer.Screen name="Users" component={UsersScreen} />
    </Drawer.Navigator>
);

// Create the switch navigator for handling the authentication flow
const AppNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
            <Stack.Screen name="Auth" component={AuthStack} />
            <Stack.Screen name="AuthStack" component={LoginRegisterStack} />
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
