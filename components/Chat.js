import React from 'react';
import { View, Platform, KeyboardAvoidingView, StyleSheet, LogBox } from 'react-native';
import { Bubble, GiftedChat } from 'react-native-gifted-chat';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    LogBox.ignoreLogs(['Setting a timer']);
    this.state = {
      messages: [],
      uid: '',
    }
    // firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyDAgvR2u0hXwC61-TrQUgrPgwusF44vzzY",
      authDomain: "test-6be76.firebaseapp.com",
      databaseURL: "https://test-6be76.firebaseio.com",
      projectId: "test-6be76",
      storageBucket: "test-6be76.appspot.com",
      messagingSenderId: "577953195015",
    }

    // configure firebase if not already set up
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    // referenecs messages collection in firebase
    this.referenceMessages = firebase.firestore().collection('messages');
  };

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // loop through each document from returned query data
    querySnapshot.forEach((doc) => {
      let data = doc.data();
      // pushes returned DB data to messages array, in prep for pushing to state
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    // sorts messages array by createdAt
    messages.sort((a, b) => b.createdAt - a.createdAt);
    // sets messages array to state to be displayed
    this.setState({
      messages,
    });
  }

  componentDidMount() {
    // listener for messages collection update
    this.unsubscribe = this.referenceMessages.onSnapshot(this.onCollectionUpdate);
    // sets user
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }

      this.setState({
        uid: user.uid,
        loggedInText: 'Hello!',
        user: {
          _id: user.uid,
          name: this.props.route.params.name,
          avatar: 'https://placeimg.com/140/140/any',
        }
      });
    });

    // references the active user's documents
    this.referenceMessagesUser = firebase.firestore().collection('messages').where("uid", "==", this.state.uid);

    // listens for collection updates for the current user
    this.unsubscribeListUser = this.referenceMessagesUser.onSnapshot(this.onCollectionUpdate);
  }

  // adds new message to firebase messages collection
  addMessage = () => {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user,
    });
  };

  componentWillUnmount() {
    this.unsubscribe();
    this.authUnsubscribe();
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

  // appends new message to messages array on send and calls addMessage function
  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
      }
    );
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
          user={this.state.user}
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