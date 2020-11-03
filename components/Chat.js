import React from 'react';
import { View, Platform, KeyboardAvoidingView, StyleSheet, LogBox, Pressable } from 'react-native';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    LogBox.ignoreLogs(['Setting a timer', 'Animated']);
    this.state = {
      messages: [],
      uid: '',
      isConnected: false,
      image: null,
      location: null,
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

  onCollectionUpdate = (querySnapshot = []) => {
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
        image: data.image,
        location: data.location,
      });
    });
    // sorts messages array by createdAt
    messages.sort((a, b) => b.createdAt - a.createdAt);
    // sets messages array to state to be displayed
    this.setState({
      messages,
    });
  }

  getMessages = async () => {
    let messages = [];
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  saveMessages = async () => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
    } catch (error) {
      console.log(error.message)
    }
  }

  // adds new message to firebase messages collection
  addMessage = () => {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
  };

  componentDidMount() {
    // check if user is online
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        // handle online operations
        console.log('online');
        this.setState({ isConnected: true });

        // sets user
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          try {
            if (!user) {
              await firebase.auth().signInAnonymously();
            };
            const name = this.props.route.params.name;
            this.setState({
              uid: user.uid,
              loggedInText: `${name} has entered the chat.`,
              user: {
                _id: user.uid,
                name,
                avatar: 'https://placeimg.com/140/140/any',
              },
            });
            // references the active user's documents
            this.referenceMessagesUser = firebase.firestore().collection('messages').where("uid", "==", this.state.uid);

            // listens for collection updates for the current user
            this.unsubscribeMessageUser = this.referenceMessagesUser.onSnapshot(this.onCollectionUpdate);
          } catch (error) {
            console.log(error.message);
          }
        });

        // listener for messages collection update
        this.unsubscribe = this.referenceMessages.onSnapshot(this.onCollectionUpdate);

      } else {
        console.log('offline');
        this.setState({ isConnected: false });
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  // sets color of user text bubble to black
  renderBubble(props = []) {
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

  // disables input if offline
  renderInputToolbar(props = []) {
    if (this.state.isConnected == false) {
    } else {
      return (
        <InputToolbar
          {...props}
        />
      );
    }
  }

  renderCustomActions = (props = []) => {
    return <CustomActions {...props} />;
  }

  renderCustomView = (props = []) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <View>
          <MapView
            style={{
              width: 150,
              height: 100,
              borderRadius: 13,
              margin: 3
            }}
            region={{
              latitude: currentMessage.location.latitude,
              longitude: currentMessage.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
      );
    }
    return null;
  }

  // appends new message to messages array on send and calls addMessage function
  onSend(messages = []) {
    this.setState(
      previousState => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
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
          // enables hiding input if offline - based on function
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          // enables additional actions including sending photos and location
          renderActions={this.renderCustomActions.bind(this)}
          // renders custom view for locations
          renderCustomView={this.renderCustomView.bind(this)}
          // pulls messages array from state
          messages={this.state.messages}
          // on send, triggers onSend function to append new message to messages in state
          onSend={messages => this.onSend(messages)}
          user={this.state.user}
        />
        {this.state.image &&
          <Image
            source={{ uri: this.state.image.uri }}
            style={{ width: 200, height: 200 }}
          />
        }
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