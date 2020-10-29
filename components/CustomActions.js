import React from 'react';
import PropTypes from 'prop-types';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import firebase from 'firebase';
import 'firebase/firestore';

export default class CustomActions extends React.Component {

  onActionPress = () => {
    const options = ['Choose from Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            this.pickImage();
            return;
          case 1:
            this.takePhoto();
            return;
          case 2:
            this.getLocation();
          default:
        }
      },
    );
  }

  uploadImage = async (uri) => {
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (error) => {
          console.error(error);
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const uriParts = uri.split('/');
      const imageName = uriParts[uriParts.length - 1];

      const ref = firebase.storage().ref().child(imageName);

      const snapshot = await ref.put(blob);
      blob.close();

      const downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl;

    } catch (error) {
      console.log(error.message);
    }
  }


  pickImage = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status === 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
      }).catch(error => console.log(error));

      if (!result.cancelled) {
        const imageUrl = await this.uploadImage(result.uri);
        this.props.onSend({ image: imageUrl });
      }
    }
  }

  takePhoto = async () => {
    let { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === 'granted') {
      let { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === 'granted') {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'Images',
        }).catch(error => console.log(error));
        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    }
  }

  getLocation = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
      try {
        let result = await Location.getCurrentPositionAsync({});
        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  render() {
    return (
      <Pressable
        style={[styles.container]}
        onPress={this.onActionPress}
        accessible={true}
        accessibilityLabel='More options'
        accessibilityHint='Send an image, new photo, or your location'
        accessibilityRole='button'
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>
            +
          </Text>
        </View>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};