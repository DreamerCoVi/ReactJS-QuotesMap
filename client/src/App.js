import React, {Component} from 'react';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup} from 'react-leaflet';
import {Card,
        Button,
        CardTitle, 
        CardText,
        Form,
        FormGroup,
        Label,
        Input} from 'reactstrap';

import './App.css';

var greenIcon = L.icon({
	iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
	shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',

	iconSize:     [38, 95], // size of the icon
	shadowSize:   [50, 64], // size of the shadow
	iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
	shadowAnchor: [4, 62],  // the same for the shadow
	popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

class App extends Component {
  state = {
    lat: 51.505,
    lng: -0.09,
    haveUsersLocation: false,
    zoom: 3,
    userMessage:{
      name: '',
      quote: ''
    }

  }
  componentDidMount() {
    navigator.geolocation.getCurrentPosition( (position) => { // Set a pin in a user location
      this.setState({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        haveUsersLocation: true // to place a pin
      })
    }, () => { // if user is declained an default location
      fetch('https://ipapi.co/json') // service to convert ip to coords
        .then(res => res.json()) // json format
        .then(location => {
          this.setState({
            lat: location.latitude,
            lng: location.longitude,
            zoom: 6,
          })
        })
      }
    )
    
  }

  formSubmitted = (e) => {
      e.preventDefault();
  }

  onTextChange = (e) => {
    const name = e.target.name;
    const text = e.target.value;
    this.setState((prevState) => ({
      userMessage:{
        ...prevState.userMessage,
        [name]: text
      }
    }))

  }


  
  render() { 
    const position = [this.state.lat, this.state.lng]
    return ( 
      <div className='map'>
        <Map className='map' center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.state.haveUsersLocation 
            ? <Marker 
                position={position}
                icon={greenIcon}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            : null
          }

        </Map>
        <Card body className="message-form">
          <CardTitle>CardTitle</CardTitle>
          <CardText>
            Leave a message with any great qoutes
          </CardText>
          <Form onSubmit={this.formSubmitted}>
            <FormGroup>
              <Label for = "name">Name</Label>
              <Input type="textarea"
                     id="name"
                     name='name'
                     placeholder='Name'
                     onChange={this.onTextChange}/>
            </FormGroup>
            <FormGroup>
              <Label for="quote">Quote</Label>
              <Input type="textarea"
                     id="quote"
                     name='quote'
                     placeholder='Quote'
                     onChange={this.onTextChange}/>
            </FormGroup>
            <Button type="submit"
                     color="info"
                     disabled={!this.state.haveUsersLocation}>
                       Submit
            </Button>
          </Form>
        </Card>
      </div>
     );
  }
}
 
export default App;