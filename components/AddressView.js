import React, { Component } from 'react';
import {
  Alert,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableHighlight,
  StatusBar,
  TextInput,
  Image,
  Dimensions,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import TabNavigator from 'react-native-tab-navigator';
import { NavigationActions } from 'react-navigation'

import realm from '../realm';
import BaseView from './BaseView';
import ItemCardView from './android/ItemCardView';
import IOSDivider from './ios/Divider';

const win = Dimensions.get('window');

export default class AddressView extends Component {
  static navigationOptions = ({navigation}) => {
    let options = {}

    options.title = navigation.state.params.address && navigation.state.params.address.street;
    options.headerRight =
      <Icon style={
          {
            color: '#ffffff',
            padding: 10,
            textShadowColor: '#000000',
            textShadowOffset: {width: 1, height: 1},
            textShadowRadius: 0,
          }
        }
        name="md-trash"
        size={30}
        onPress={navigation.state.params.deleteAddressPrompt}
      />;

    return options;
  };

  componentWillMount() {
    let address = realm.objects('Address').filtered('id = $0', this.props.navigation.state.params.addressId);

    if (address) {
      address = address[0];
    }

    this.props.navigation.setParams({
      deleteAddressPrompt: this.deleteAddressPrompt.bind(this),
      address,
      ...this.props.navigation.params
    });
  }

  deleteAddressPrompt() {
    Alert.alert(
      'Delete Address?',
      null,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: this.deleteAddress.bind(this)},
      ],
      { cancelable: false }
    );
  }

  deleteAddress() {
    const { addressId } = this.props.navigation.state.params;
    const neighborhood = address.neighborhood;

    realm.write(() => {
      realm.delete(realm.objects('Tag').filtered('address = $0', addressId));
      realm.delete(address);
    });

    const addressListing = NavigationActions.reset({
      index: 1,
      actions: [
        NavigationActions.navigate({ routeName: 'Home'}),
        NavigationActions.navigate({ routeName: 'AddressList', params: {neighborhood}}),
      ]
    })

    this.props.navigation.dispatch(addressListing);
  }

  addTag() {
    const { navigate, state } = this.props.navigation;
    const { address } = state.params;

    navigate('TagPhoto', { address: address.id, neighborhood: address.neighborhood });
  }

  deleteTagConfirm(tag) {
    Alert.alert(
      'Delete Tag?',
      null,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', onPress: () => {this.deleteTag(tag)}},
      ],
      { cancelable: false }
    );
  }

  deleteTag(tag) {
    realm.write(() => {
      realm.delete(tag);
      this.forceUpdate();
    });
  }

  renderTagComponent(tag) {
    return (
      <View style={{padding: 10}}>
        <TouchableHighlight
          onPress={() => {this.props.navigation.navigate('TagView', {tag})}}
        >
          <Image 
            style={{width: win.width - 20, height: 200}} 
            source={{uri: tag.img}} 
          />
        </TouchableHighlight>
        <View 
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <Text style={{
            flex: 1, 
            justifyContent: 'center',
            marginTop: 5}}
          >
            {tag.description}
          </Text>
          <Icon style={
              {
                color: '#FF0505',
                alignSelf: 'flex-end',
              }
            }
            name="md-trash"
            size={30}
            onPress={() => {this.deleteTagConfirm(tag)}}
          />
        </View>
      </View>
    )
  }

  render() {
    const { addressId } = this.props.navigation.state.params;
    const stylesHash = {
      mainTitle: {
        fontSize: 34,
        marginBottom: 10,
      },
      title: {
        fontSize: 28,
        marginBottom: 10,
        marginTop: 5,
      },
      bodyText: {
        fontSize: 20,
        marginBottom: 20,
      }
    };


    const styles = StyleSheet.create(stylesHash);
    let tags = realm.objects('Tag').filtered('address = $0', addressId);

    return (
      <View style={{flex: 1}}>
        <ScrollView>
          {tags.map(this.renderTagComponent.bind(this))}
          <View style={{height: 50}}></View>
        </ScrollView>
        <TabNavigator
          unselectedTintColor="yellow"
          tintColor="white"
          barTintColor="black"
          >
          <TabNavigator.Item
            title="Add Tag"
            onPress={this.addTag.bind(this)}
            renderIcon={
              () => <Icon name="ios-camera" size={30} style={{backgroundColor: '#00000000'}} />
            }
            >
          </TabNavigator.Item>
        </TabNavigator>
      </View>
    );
  }
}
