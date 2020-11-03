import React from 'react';
import {
  View,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  LogBox,
} from 'react-native';
import PropTypes from 'prop-types';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

/**
 * @module Chat
 */

const firebase = require('firebase');
require('firebase/firestore');

// Style sheet configures basic container & text box only
const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
  },
  textBox: {
    backgroundColor: 'white',
  },
});

export default class Chat extends React.Component {
  constructor(props) {
    super(props);

    // suppresses warnings caused by libraries
    LogBox.ignoreLogs(['Setting a timer', 'Animated']);

    this.state = {
      messages: [],
      uid: '',
      isConnected: false,
    };
    // firebase configuration
    const firebaseConfig = {
      apiKey: 'AIzaSyDAgvR2u0hXwC61-TrQUgrPgwusF44vzzY',
      authDomain: 'test-6be76.firebaseapp.com',
      databaseURL: 'https://test-6be76.firebaseio.com',
      projectId: 'test-6be76',
      storageBucket: 'test-6be76.appspot.com',
      messagingSenderId: '577953195015',
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.referenceMessages = firebase.firestore().collection('messages');
  }

  /**
   * Checcks if the user is online;
   * Authenticates the user with Firebase;
   * Calls {@link Chat#onCollectionUpdate};
   * @function componentDidMount
   */

  componentDidMount() {
    NetInfo.fetch().then((connection) => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });

        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          try {
            if (!user) {
              await firebase.auth().signInAnonymously();
            }
            const { route } = this.props;
            const { name } = route.params;
            this.setState({
              uid: user.uid,
              user: {
                _id: user.uid,
                name,
                avatar: 'https://placeimg.com/140/140/any',
              },
            });
            // references the active user's documents
            const { uid } = this.state;
            this.referenceMessagesUser = firebase.firestore().collection('messages').where('uid', '==', uid);

            // listens for collection updates for the current user
            this.unsubscribeMessageUser = this
              .referenceMessagesUser
              .onSnapshot(this
                .onCollectionUpdate);
          } catch (error) {
            console.error(error.message);
          }
        });

        // listener for messages collection update
        this.unsubscribe = this
          .referenceMessages
          .onSnapshot(this.onCollectionUpdate);
      } else {
        this.setState({ isConnected: false });
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribe();
  }

  /**
   * Updates message state with new message data
   * @function onCollectionUpdate
   * @param {array} querySnapshot - A snapshot of the messages collection
   * @param {object} doc - A message document
   * @param {string} _id - The ID for a given message document
   * @param {string} text - The text of a given message document
   * @param {date} createdAt - The created date for a given message document
   * @param {object} user - The user who created a given message document
   * @param {string} image - The image URL contained in a given message document
   * @param {object} location - The latitude and longitude data included with a messag document
   */
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image,
        location: data.location,
      });
    });
    messages.sort((a, b) => b.createdAt - a.createdAt);
    this.setState({
      messages,
    });
  }

  /**
   * Sends new messages
   * @function onSend
   * @param {array} messages
   */
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessage();
        this.saveMessages();
      },
    );
  }

  /**  Creates a custom view to display a map when a message contains location data
   * @function renderCustomView
   * @param {object} currentMessage - the currently displayed message
   * @returns {MapView}
  */
  renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <View>
          <MapView
            style={{
              width: 150,
              height: 100,
              borderRadius: 13,
              margin: 3,
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

  /**
 * Makes CustomActions available to chat interface.
 * For sending the user's location, a new photo, or a saved photo.
 * @function renderCustomActions
 * @param {*} props
 * @returns {CustomActions}
 * */
  renderCustomActions = (props) => <CustomActions {...props} />

  /**
   * Adds a new message to the Firebase collection.
   * @function addMessage
   * @param {string} _id - Message ID
   * @param {string} text - Message text
   * @param {date} createdAt - Message created date
   * @param {object} user - Message sender
   * @param {string} image - Image URL
   * @param {object} location - Coordinates sent with the message, including latitude and longitude
   * */
  addMessage = () => {
    const { messages } = this.state;
    const message = messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });
  };

  /**
   * Saves stringified messages to AsyncStorage
   * @async
   * @function saveMessages
   * @param {array} messages - Messages array taken from the state
   */
  saveMessages = async () => {
    try {
      const { messages } = this.state;
      await AsyncStorage.setItem('messages', JSON.stringify(messages));
    } catch (error) {
      console.error(error.message);
    }
  }

  /**
   * Retrieves messages string from local AsyncStorage, parses to JSON, and sets state
   * @async
   * @function getMessages
   * @param {string} messages - messages in AsyncStorage
   */
  getMessages = async () => {
    let messages = [];
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  /**
   * Removes messages from AsyncStorage
   * @async
   * @function deleteMessages
   * @param {string} messages - messages in AsyncStorage
   */
  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
    } catch (error) {
      console.error(error.message);
    }
  }

  /**
   * Only returns input toolbar if the user is online, else returns null
   * @function renderInputToolbar
   * @param {*} props
   * @returns {InputToolbar} - Or, returns null if user is offline
   */
  renderInputToolbar(props) {
    const { isConnected } = this.state;
    if (isConnected !== false) {
      return <InputToolbar {...props} />;
    }
    return null;
  }

  render() {
    const { messages, user } = this.state;
    return (
      <View style={styles.chatContainer}>
        <GiftedChat
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          messages={messages}
          onSend={(newMessages) => this.onSend(newMessages)}
          user={user}
        />
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    );
  }
}

Chat.propTypes = {
  route: PropTypes.shape.isRequired,
};
