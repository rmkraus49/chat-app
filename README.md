# SuperChat

SuperChat is a React Native chat app powered by Google Firestore and viewed in Expo.

## Getting Started

### Setting Up Firestore
1. Navigate to [Google Firebase](https://console.firebase.google.com/)
2. Click "Sign In"
3. Click "Go to Console," then "Create Project"
4. Name the project
5. Keep the default settings, and click "Create Project"
6. Click "Develop" in the left-hand navigation menu, then click "Database"
7. Click "Create Database"
8. Select the option for a Firestore Database, not a Realtime Database

### Setting up Expo
1. Install Expo's command line tools:
```
$ npm install -g expo-cli
```
2. Initialize the Expo project:
```
$ expo init chat-app
```
3. Start the app via Expo. From the project directory, run:
```
$ expo start
```
4. Install Expo on your mobile device
5. Open Expo, then open SuperChat if you are logged in to Expo on both devices
6. If you are not logged in, scan the QR code shown in the Expo CLI to open the app on your mobile device

### Dependencies

The following dependencies are necessary to run SuperChat:

```
@react-native-community/async-storage: ~1.12.0
@react-native-community/masked-view: 0.1.10
@react-native-community/netinfo: 5.9.6
@react-navigation/native: ^5.7.5
@react-navigation/stack: ^5.9.2
expo: ~39.0.2
expo-image-picker: ~9.1.0
expo-location: ~9.0.0
expo-permissions: ~9.3.0
expo-status-bar: ~1.0.2
firebase: ^7.24.0
prop-types: ^15.7.2
react: ^16.13.1
react-dom: 16.13.1
react-native: https://github.com/expo/react-native/archive/sdk-39.0.3.tar.gz
react-native-gesture-handler: ~1.7.0
react-native-gifted-chat: ^0.16.3
react-native-maps: 0.27.1
react-native-reanimated: ~1.13.0
react-native-safe-area-context: 3.1.4
react-native-screens: ~2.10.1
react-native-web: ~0.13.12
react-navigation: ^4.4.2
```

### Dev Dependencies

Want to edit the code? The following tools were used to create SuperChat:

```
@babel/core: ~7.9.0
babel-eslint: ^10.1.0
eslint: ^7.12.1
eslint-config-airbnb: ^18.2.0
eslint-plugin-import: ^2.22.1
eslint-plugin-jsx-a11y: ^6.4.1
eslint-plugin-react: ^7.21.5
eslint-plugin-react-hooks: ^4.2.0
eslint-plugin-react-native: ^3.10.0
```

### Trello

Want to see some of the creation process? View our [Trello board](https://trello.com/b/QDNwyw85/native-mobile-chat-app)
