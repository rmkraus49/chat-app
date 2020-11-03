import React, { Component } from 'react';
import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Start from './components/Start';
import Chat from './components/Chat';

const Stack = createStackNavigator();

// eslint-disable-next-line react/prefer-stateless-function
class App extends Component {
  render() {
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Start"
        >
          <Stack.Screen
            name="Start"
            component={Start}
          />
          {/* passes the user's name as an option to set the screen title */}
          <Stack.Screen
            name="Chat"
            component={Chat}
            options={({ route }) => ({ title: route.params.name })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
