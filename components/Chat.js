import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


export default class Chat extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { name, color } = this.props.route.params;
    return (
      /* sets background color based on user input from start screen */
      <View style={[styles.chatContainer, { backgroundColor: color }]}>
        {/* text box with white background - dev only */}
        <View style={styles.textBox}>
          <Text>Hello {name}! Background color: {color}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
  },
  textBox: {
    backgroundColor: 'white',
  },
});