import React from 'react';
import PropTypes from 'prop-types';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import firebase from 'firebase';
import 'firebase/firestore';

/**
 * @module CustomActions
 */

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

export default class CustomActions extends React.Component {
  /**
   *  Defines custom actions for when a user taps the + button for more options
   * @function onActionPress
   *  */
  onActionPress = () => {
    const options = ['Choose from Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    const { context } = this;
    context.actionSheet().showActionSheetWithOptions(
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
            break;
          default:
        }
      },
    );
  }

  /**
   * Uploads image to firebase - called for new or existing images
   * @async
   * @function uploadImage
   * @param {string} uri - The URI of the image to upload
   * @return {Promise<string>} The URL of the uploaded image
   */
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
      console.error(error.message);
      return null;
    }
  }

  /**
   * Picks an image from local device storage after asking permission,
   *  then calls {@link uploadImage} and calls {@link onSend}
   * @async
   * @function pickImage
   */
  pickImage = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

      if (status === 'granted') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
        }).catch((error) => console.error(error));

        if (!result.cancelled) {
          const { props } = this;
          const imageUrl = await this.uploadImage(result.uri);
          props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  /**
   * Uses the device camera to take a new photo after asking permission,
   *  then calls {@link uploadImage} and {@link onSend}
   * @async
   * @function takePhoto
   */
  takePhoto = async () => {
    try {
      const { status } = await Permissions.askAsync(
        Permissions.CAMERA,
        Permissions.CAMERA_ROLL,
      );
      if (status === 'granted') {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'Images',
        }).catch((error) => console.error(error));

        if (!result.cancelled) {
          const { props } = this;
          const imageUrl = await this.uploadImage(result.uri);
          props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  /**
   * Gets the device's location after asking permission, then calls {@link onSend}
   * @async
   * @function getLocation
   */
  getLocation = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);

      if (status === 'granted') {
        try {
          const result = await Location.getCurrentPositionAsync({});

          if (result) {
            const { props } = this;
            props.onSend({
              location: {
                longitude: result.coords.longitude,
                latitude: result.coords.latitude,
              },
            });
          }
        } catch (error) {
          console.error(error.message);
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  // renders custom actions button & menu
  render() {
    const { wrapperStyle, iconTextStyle } = this.props;
    return (
      <Pressable
        style={[styles.container]}
        onPress={this.onActionPress}
        // eslint-disable-next-line react/jsx-boolean-value
        accessible={true}
        accessibilityLabel="More options"
        accessibilityHint="Send an image, new photo, or your location"
        accessibilityRole="button"
      >
        <View style={[styles.wrapper, wrapperStyle]}>
          <Text style={[styles.iconText, iconTextStyle]}>
            +
          </Text>
        </View>
      </Pressable>
    );
  }
}

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};

CustomActions.propTypes = {
  onSend: PropTypes.func.isRequired,
  wrapperStyle: PropTypes.shape.isRequired,
  iconTextStyle: PropTypes.shape.isRequired,
};
