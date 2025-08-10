import { registerRootComponent } from 'expo';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import App from './App';
import { material3DarkTheme } from './theme';

// Focus app style - always use dark theme
function Root() {
	return (
		<PaperProvider theme={material3DarkTheme}>
			<StatusBar style="light" backgroundColor="#1A1A1A" />
			<App />
		</PaperProvider>
	);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(Root);
