import React from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ImageBackground, Pressable } from 'react-native';

const image = require('../assets/BackgroundImage.png')

export default class Start extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      color: '',
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={image} style={styles.image}>

          {/* title box container */}
          <View style={styles.titleBox}>
            <Text style={styles.title}>Chat App</Text>
          </View>

          {/* lower box container for name, color choice, chat button */}
          <View style={styles.loginBox}>
            <TextInput
              style={styles.nameInput}
              onChangeText={(name) => this.setState({ name })}
              value={this.state.name}
              placeholder='Enter your name'
            />
            {/* color choice container */}
            <View style={styles.colorChoiceBox}>
              <Text style={styles.colorChoiceText}>Choose background color:</Text>
              {/* sets color choice to state for use in chat screen */}
              <View style={styles.colorChoiceOptions}>
                {/* pressable over Button or TouchableOpacity for additional options */}
                <Pressable
                  onPress={() => this.setState({ color: '#090C08' })}
                  style={[styles.colorButton, styles.colorChoice1]}
                />
                <Pressable
                  onPress={() => this.setState({ color: '#474056' })}
                  style={[styles.colorButton, styles.colorChoice2]}
                />
                <Pressable
                  onPress={() => this.setState({ color: '#8A95A5' })}
                  style={[styles.colorButton, styles.colorChoice3]}
                />
                <Pressable
                  onPress={() => this.setState({ color: '#B9C6AE' })}
                  style={[styles.colorButton, styles.colorChoice4]}
                />
              </View>
            </View>

            {/* start chatting button container - passes name and color choice as props via navigation */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.startChattingButton}
                title="Start chatting"
                onPress={() => {
                  this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color })
                }}
              >
                <Text style={styles.startChattingText}>Start chatting</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  titleBox: {
    flex: 60,
    width: '88%',
  },

  title: {
    fontSize: 45,
    marginTop: '24%',
    textAlign: 'center',
    fontWeight: '600',
    color: '#FFF',
  },

  loginBox: {
    flex: 40,
    backgroundColor: 'white',
    width: '88%',
    marginBottom: '6%',
    flexDirection: 'column',
    padding: '6%',
  },

  nameInput: {
    fontSize: 16,
    paddingLeft: '6%',
    borderWidth: 1,
    borderColor: '#757083',
    paddingVertical: 10,
  },

  colorChoiceBox: {
    justifyContent: 'center',
    marginVertical: 20,
  },

  colorChoiceText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083'
  },

  colorChoiceOptions: {
    flexDirection: 'row',
  },

  colorButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    margin: 15,
  },

  colorChoice1: {
    backgroundColor: '#090C08',
  },

  colorChoice2: {
    backgroundColor: '#474056',
  },

  colorChoice3: {
    backgroundColor: '#8A95A5',
  },

  colorChoice4: {
    backgroundColor: '#B9C6AE',
  },

  buttonContainer: {
    fontWeight: '600',
    fontSize: 16,
    height: 60,
  },

  startChattingButton: {
    flex: 1,
    backgroundColor: '#757083',
    justifyContent: 'center',
    height: '100%'
  },

  startChattingText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },

  image: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  }
});
