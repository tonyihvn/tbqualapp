// TopMobileMenu.js

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TopMobileMenu = ({ title }) => {
    const navigation = useNavigation();

    const navigateToReportIssues = () => {
        navigation.navigate('ReportIssues',{reportId: "All"});
    };

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <TouchableOpacity onPress={navigateToReportIssues}>
                <Text>Report Issues</Text>
            </TouchableOpacity>
            <Text>{title}</Text>
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                <Text>Menu</Text>
            </TouchableOpacity>
        </View>
    );
};

export default TopMobileMenu;