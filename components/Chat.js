import React from 'react';
import { View, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';


export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
    }
  }

  componentDidMount() {
    // accesses user name from start screen input via navigation parameter
    let name = this.props.route.params.name;
    // sets state with sample message and system welcome message
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Hello developer',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        {
          _id: 2,
          text: name + ' has entered the chat. Welcome!',
          createdAt: new Date(),
          system: true,
        },
      ],
    })
  }

  renderBubble(props) {
    // sets color of user text bubble to black
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }

  // appends new message to messages array on send
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }


  render() {
    return (
      // renders view using chatContainer style - flex 1
      <View style={styles.chatContainer}>
        <GiftedChat
          // binds render bubble with custom color to chat bubble
          renderBubble={this.renderBubble.bind(this)}
          // pulls messages array from state
          messages={this.state.messages}
          // on send, triggers onSend function to append new message to messages in state
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {/* if OS is android, adds KeyboardAvoidingView to prevent keyboard from covering input box */}
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
        }
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