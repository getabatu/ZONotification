import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Dimensions,
  ScrollView,
  View,
  Image,
  ImageBackground,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import OneSignal from 'react-native-onesignal';
import { Container, Content, Form, Item, Input, Button, Icon, Label } from 'native-base';
import { Overlay, ActionSheet, ListRow } from 'teaset';

var dateFormat = require('dateformat');
let date = new Date();
var dateFormatted = dateFormat(date, "yyyy-mm-dd");

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      displayTemplate: '',
      templateId: '',
      userEmail: '',
      userName: '',
      deviceId: '',
      segments: [],
      segmentsName: [],
      userDevice: [],
      userNotifications: [],
      refreshing: false,
    };
  }

  componentWillMount() {
    this.globalGet();
  }

  componentDidMount() {
    OneSignal.configure({});
    OneSignal.addEventListener('ids', this.onIds);
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('ids', this.onIds);
  }

  onIds = (device) => {
    this.setState({ deviceId: device.userId })
  }

  globalGet() {
    this.getDevices();
    this.getNotifications();
  }

  getDevices() {
    // fetch('https://onesignal.com/api/v1/players?app_id=3f086164-3a8f-4120-9123-facbdbfcffa4&limit=300&offset=0', { // ZO
    fetch('https://onesignal.com/api/v1/players?app_id=b86c026a-8a6f-4018-b821-f32c44975830&limit=300&offset=0', { // Testing
      method: 'GET',
      dataType: 'json',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Authorization": "Basic ZjgzNjM0NGQtMDQxMC00YmI5LTllYjAtN2E5NTUxMTZhOTQ1" // ZO
        "Authorization": "Basic NzhhOGU3YzUtOGYyNy00Mjk0LThkMmQtMDE2ZmIyNjdkMWFh" //Testing
      }
    }).then(response => {
      response.json().then(data => {
        this.setState({ userDevice: data.players, refreshing: false });
      });
    })
  }

  getNotifications() {
    fetch('https://onesignal.com/api/v1/notifications?app_id=b86c026a-8a6f-4018-b821-f32c44975830&limit=50&offset=0', { // Testing
      method: 'GET',
      dataType: 'json',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Authorization": "Basic ZjgzNjM0NGQtMDQxMC00YmI5LTllYjAtN2E5NTUxMTZhOTQ1" // ZO
        "Authorization": "Basic NzhhOGU3YzUtOGYyNy00Mjk0LThkMmQtMDE2ZmIyNjdkMWFh" //Testing
      }
    }).then(response => {
      response.json().then(data => {
        console.log('NOTIFICATIONS', JSON.stringify(data));
        this.setState({ userNotifications: data.notifications, refreshing: false });
      });
    })
  }

  sendNotification() {
    var overdueUsers = (this.state.segments.indexOf("Overdue More Than One") > -1);
    fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      dataType: 'json',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic NzhhOGU3YzUtOGYyNy00Mjk0LThkMmQtMDE2ZmIyNjdkMWFh" //Testing
      },
      body: JSON.stringify({
        "app_id": "b86c026a-8a6f-4018-b821-f32c44975830", // Testing
        "data": { "foo": "bar" },
        "included_segments": this.state.segments,
        "template_id": this.state.templateId,
        "contents": { "en": this.state.message },
        "headings": { "en": "Hello {{ user_name | default: 'There'}} !" },
      })
    }).then(response => {
      response.json().then(data => {
        alert('berhasil')
        console.log('BETUL')
      });
    })
  }

  putDevice() {
    fetch('https://onesignal.com/api/v1/players/' + this.state.deviceId, {
      method: 'PUT',
      dataType: 'json',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic NzhhOGU3YzUtOGYyNy00Mjk0LThkMmQtMDE2ZmIyNjdkMWFh"
      },
      body: JSON.stringify({
        "app_id": "b86c026a-8a6f-4018-b821-f32c44975830",
        "tags": {
          "user_name": this.state.userName,
          "user_email": this.state.userEmail,
        }
      })
    }).then(response => {
      response.json().then(data => {
        alert('berhasil')
        this.overlayPopViewConfig.close()
      });
    })
  }

  renderDevices(obj, index) {
    return (
      <View key={index} style={{ height: 60, alignItems: 'center', borderBottomColor: '#d3d3d3', borderBottomWidth: 1, justifyContent: 'center' }} >
        <Text>{obj.device_model}</Text>
        <Text>{obj.device_type === 1 ? 'Android' : 'iOS'} ({obj.device_os}) </Text>
      </View>
    )
  }

  renderNotifications(obj, index) {
    return (
      <View key={index} style={{ marginHorizontal: 40, width: width - 80, borderBottomColor: '#d3d3d3', borderBottomWidth: 1, justifyContent: 'space-between', flexDirection: 'row' }} >
        <View style={{ height: 60, justifyContent: 'center' }} >
          <Text style={{ marginLeft: 10, marginTop: 10 }} >{obj.headings.en}</Text>
          <Text style={{ alignSelf: 'center', textAlign: 'center' }} >{obj.contents.en}</Text>
        </View>
        <Button danger >
          <Icon style={{ color: 'white', marginHorizontal: 10 }} name='ios-trash-outline' />
        </Button>
      </View>
    )
  }

  popUpDevice() {
    let overlayView = (
      <Overlay.PopView
        ref={v => this.overlayPopViewDevice = v}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ backgroundColor: 'white', width: width - 20, height: height }} >
          <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => this.overlayPopViewDevice.close()} >
            <Icon name='ios-close-circle' style={{ margin: 20, color: '#d3d3d3', fontSize: 30 }} />
          </TouchableOpacity>
          <ScrollView>
            {this.state.userDevice.map((obj, index) => this.renderDevices(obj, index))}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </Overlay.PopView>
    );
    Overlay.show(overlayView);
  }

  popUpNotif() {
    let overlayView = (
      <Overlay.PopView
        ref={v => this.overlayPopViewNotif = v}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ backgroundColor: 'white', width: width - 20, height: height - 20 }} >
          <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => this.overlayPopViewNotif.close()} >
            <Icon name='ios-close-circle' style={{ margin: 20, color: '#d3d3d3', fontSize: 30 }} />
          </TouchableOpacity>
          <ScrollView>
            {this.state.userNotifications.map((obj, index) => this.renderNotifications(obj, index))}
            <View style={{ height: 100, width: 1 }} />
          </ScrollView>
        </View>
      </Overlay.PopView>
    );
    Overlay.show(overlayView);
  }

  popUpConfig() {
    let overlayView = (
      <Overlay.PopView
        ref={v => this.overlayPopViewConfig = v}
        style={{ flex: 1 }}
      >
        <View style={{ backgroundColor: 'white', height: height, width: width }} >
          <ScrollView style={{ flex: 1, padding: 20 }}>
            <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => this.overlayPopViewConfig.close()} >
              <Icon name='ios-close-circle' style={{ color: '#d3d3d3', fontSize: 30 }} />
            </TouchableOpacity>
            <Form>
              <Item floatingLabel>
                <Label>User Name</Label>
                <Input onChangeText={(text) => this.setState({ userName: text })} />
              </Item>
              <Item floatingLabel>
                <Label>User Email</Label>
                <Input onChangeText={(text) => this.setState({ userEmail: text })} />
              </Item>
            </Form>
            <Button style={{ marginTop: 30 }} block success onPress={() => this.putDevice()}>
              <Text style={{ color: 'white' }} >Configure User Settings</Text>
            </Button>
          </ScrollView>
          <View style={{ flex: 1, marginBottom: 25 }} >
            <Image style={{ bottom: 0, width: width, height: '70%', position: 'absolute' }} source={require('./src/img/backG.png')} />
          </View>
        </View>
      </Overlay.PopView>
    );
    Overlay.show(overlayView);
  }

  renderSegments(obj, index) {
    return (
      <View key={index} style={{ height: 30, backgroundColor: 'lightgray', justifyContent: 'center', alignItems: 'center' }} >
        <Text> {obj} </Text>
      </View>
    )
  }

  _onRefresh = () => {
    this.setState({ refreshing: true }, () => {
      this.globalGet();
    })
  }

  render() {
    let Segments = [
      {
        title: 'All Users',
        onPress: () => {
          this.state.segmentsName.push('All Users')
          this.state.segments.push('All')
          this.forceUpdate()
        }
      },
      {
        title: 'Active Users',
        onPress: () => {
          this.state.segmentsName.push('Active Users')
          this.state.segments.push('Active Users')
          this.forceUpdate()
        }
      },
      {
        title: 'Inactive Users',
        onPress: () => {
          this.state.segmentsName.push('Inactive Users')
          this.state.segments.push('Three Days Inactive ZO Mobile')
          this.forceUpdate()
        }
      },
      {
        title: 'Engaged Users',
        onPress: () => {
          this.state.segmentsName.push('Engaged Users')
          this.state.segments.push('Engaged Users')
          this.forceUpdate()
        }
      },
      {
        title: 'Reset Segments',
        onPress: () => {
          this.setState({
            segments: [],
            segmentsName: []
          });
        }
      },
    ];

    let Template = [
      {
        title: 'Default Template',
        onPress: () => {
          this.setState({ displayTemplate: 'Default Template', templateId: '5ff253fb-fba0-4ee7-ac61-240f805ae16a' })
          this.forceUpdate()
        }
      },
      {
        title: 'Promo Template 001',
        onPress: () => {
          this.setState({ displayTemplate: 'Promo Template 001', templateId: '3c10ed7a-8942-4e8c-a81e-ff4f96a00909' })
          this.forceUpdate()
        }
      }
    ];

    return (
      <View style={styles.container}>
        <View style={{ zIndex: 1, alignSelf: 'flex-end', flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => this.popUpDevice()} >
            <Icon name='ios-phone-portrait-outline' style={{ margin: 20, color: 'white', fontSize: 30 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.popUpNotif()} >
            <Icon name='ios-notifications' style={{ margin: 20, color: 'white', fontSize: 30 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.popUpConfig()} >
            <Icon name='ios-cog' style={{ margin: 20, color: 'white', fontSize: 30 }} />
          </TouchableOpacity>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
            />
          }
          style={{ zIndex: 1, backgroundColor: 'transparent' }} >
          <View style={{ height: height - 100, padding: 20, justifyContent: 'center' }} >
            <Image style={{ marginBottom: 20 }} source={require('./src/img/zahironlinex.png')} />

            <Button style={{ marginBottom: this.state.displayTemplate ? 0 : 20 }} onPress={() => ActionSheet.show(Template)} block light>
              <Text>Template</Text>
            </Button>
            {
              this.state.displayTemplate ?
                <View style={{ marginBottom: 20, height: 30, backgroundColor: 'lightgray', justifyContent: 'center', alignItems: 'center' }} >
                  <Text> {this.state.displayTemplate} </Text>
                </View>
                :
                null
            }


            <Button onPress={() => ActionSheet.show(Segments)} block light>
              <Text>Segments</Text>
            </Button>


            {this.state.segmentsName.map((obj, index) => this.renderSegments(obj, index))}
            <Item style={{ backgroundColor: 'white', marginTop: 20 }} regular>
              <Input numberOfLines={2} multiline={true} onChangeText={(text) => this.setState({ message: text })} value={this.state.message} placeholder='Message' />
            </Item>


            {this.state.message && this.state.segments.length > 0 && this.state.templateId ?
              <Button onPress={() => this.sendNotification()} style={{ marginTop: 30 }} block success>
                <Text style={{ color: 'white' }} >Send Notification</Text>
              </Button>
              :
              <Button style={{ marginTop: 30 }} block success onPress={() => alert('Message or Segments should not be Empty')}>
                <Text style={{ color: 'white' }} >Send Notification</Text>
              </Button>
            }

          </View>
        </ScrollView>
        <Image style={{ position: 'absolute', bottom: 0, width: width, height: '60%', }} source={require('./src/img/splash_screen.png')} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003046',
  },
});
