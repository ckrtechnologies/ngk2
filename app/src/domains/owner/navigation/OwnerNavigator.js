import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OwnerTabNavigator from './OwnerTabNavigator';
import OwnerProfileScreen from '../screens/OwnerProfileScreen';
import MyGarageScreen from '../screens/MyGarageScreen';
import PartsFinderScreen from '../../shared/screens/PartsFinderScreen';
import VerifiedPartsScreen from '../../shared/screens/VerifiedPartsScreen';
import TechnicalEnquiryScreen from '../../shared/screens/TechnicalEnquiryScreen';
import MyEnquiriesScreen from '../../shared/screens/MyEnquiriesScreen';
import DealerLocatorScreen from '../../shared/screens/DealerLocatorScreen';
import MyFavoritesScreen from '../screens/MyFavoritesScreen';
import Notification from '../../shared/screens/Notification';
import VehiclesListScreen from '../../shared/screens/vehiclesListScreen';
import ModalsScreen from '../../shared/screens/modalsScreen';
import SuccessScreen from '../../shared/screens/SuccessScreen';
import CustomDrawer from '../../shared/screens/CustomDrawer';

const Stack = createNativeStackNavigator();

export default function OwnerNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="OwnerHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OwnerHome" component={OwnerTabNavigator} />
      <Stack.Screen name="Profile" component={OwnerProfileScreen} />
      <Stack.Screen name="MyGarage" component={MyGarageScreen} />
      <Stack.Screen name="PartsFinder" component={PartsFinderScreen} />
      <Stack.Screen name="CatalogSearch" component={PartsFinderScreen} />
      <Stack.Screen name="VerifiedParts" component={VerifiedPartsScreen} />
      <Stack.Screen name="TechnicalEnquiry" component={TechnicalEnquiryScreen} />
      <Stack.Screen name="MyEnquiries" component={MyEnquiriesScreen} />
      <Stack.Screen name="DealerLocator" component={DealerLocatorScreen} />
      <Stack.Screen name="DealerLocatorScreen" component={DealerLocatorScreen} />
      <Stack.Screen name="Watchlist" component={MyFavoritesScreen} />
      <Stack.Screen name="Notifications" component={Notification} />
      <Stack.Screen name="VehiclesList" component={VehiclesListScreen} />
      <Stack.Screen name="vehiclesListScreen" component={VehiclesListScreen} />
      <Stack.Screen name="ModalsScreen" component={ModalsScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
      <Stack.Screen name="CustomDrawer" component={CustomDrawer} />
    </Stack.Navigator>
  );
}
