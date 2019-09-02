import React, {Component} from 'react';
import L from 'leaflet';
import Joi from 'joi';
import { Map, TileLayer, Marker, Popup} from 'react-leaflet';
import {Card,
        Button,
        CardTitle, 
        CardText,
        Form,
        FormGroup,
        Label,
        Input} from 'reactstrap';
import preloader from './831.svg';

import './App.css';

var greenIcon = L.icon({
	iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
	shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',

	iconSize:     [38, 95], // size of the icon
	shadowSize:   [40, 55], // size of the shadow
	iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
	shadowAnchor: [4, 62],  // the same for the shadow
	popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});


var redIcon = L.icon({
	iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
	shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',

	iconSize:     [30, 86], // size of the icon
	shadowSize:   [50, 64], // size of the shadow
	iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
	shadowAnchor: [4, 62],  // the same for the shadow
	popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

const schema = Joi.object().keys({ // validation
  name: Joi.string().regex(/^[a-zA-Z0-9 -_]{1,30}$/).required(),
  quote: Joi.string().regex(/^[a-zA-Z0-9`!'" -_]{1,30}$/).required()
});

const API_URL = window.location.hostname === 'localhost' 
                    ? 'http://localhost:80/api/v1/messages' 
                    : 'some-other-url-here';



class App extends Component {
  state = {
    lat: 51.505,
    lng: -0.09,
    haveUsersLocation: false, // when we find user
    zoom: 2,
    userMessage:{ 
      name: '',
      quote: ''
    },
    sendingQuote: false,
    quoteSent: false,
    quotes: [] // quotes from database

  }
  componentDidMount() {

    fetch(API_URL)
      .then(res => res.json())
      .then(quotes => {
        this.setState({
          quotes
        })
      })


    navigator.geolocation.getCurrentPosition( (position) => { // Set a pin in a user location
      this.setState({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        haveUsersLocation: true, // to place a pin
        zoom: 8
      })
    }, () => { // if user is declained an default location
      fetch('https://ipapi.co/json') // service to convert ip to coords
        .then(res => res.json()) // json format
        .then(location => {
          this.setState({
            lat: location.latitude,
            lng: location.longitude,
            zoom: 8,
          })
        })
      }
    )
  }

  formIsValid =() => {
    const userMessage = {
      name: this.state.userMessage.name,
      quote: this.state.userMessage.quote
    };
    const result = Joi.validate(userMessage, schema);
    
    return !result.error && this.state.haveUsersLocation ? true : false;
  }


  formSubmitted = (e) => {
      e.preventDefault();
      const userMessage = {
        name: this.state.userMessage.name,
        quote: this.state.userMessage.quote
      }
      const result = Joi.validate(userMessage, schema);
      if(this.formIsValid){
        this.setState({
          sendingMessage: true
        })
          fetch(API_URL, { // request to database
            method: 'POST',
            headers:{
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              name: this.state.userMessage.name,
              quote: this.state.userMessage.quote,
              latitude: this.state.lat,
              longitude: this.state.lng
            })
          }).then((message) => {
            this.setState({
              sendingQuote:false,
              quoteSent: true
            })
          })
      }
  }
  

  onTextChange = (e) => {
    const name = e.target.name;
    const text = e.target.value;
    this.setState((prevState) => ({
      userMessage:{
        ...prevState.userMessage,
        [name]: text
      }
    }));
  };


  
  render(){ 
    const position = [this.state.lat, this.state.lng]
    return ( 
      <div className='map'>
        <Map className='map' center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {this.state.haveUsersLocation &&
              <Marker 
                position={[this.state.lat, this.state.lng]}
                icon={greenIcon}>
                <Popup className='quoteWindow'>
                    <div className='author'><p>{this.state.userMessage.name}</p></div>
                    <div className='quote'><p>{this.state.userMessage.quote}</p></div>
                </Popup>
              </Marker>  
          }

          {this.state.quotes.map((quote) => {
                return (
                  <Marker 
                    position={[quote.latitude, quote.longitude]}
                    icon={redIcon}
                    key={quote._id}>
                      <Popup className='quoteWindow'>
                          <div className='author'><p>{quote.name}</p></div>
                          <div className='quote'><p>{quote.quote}</p></div>
                      </Popup>
                  </Marker>
              )
            })
          }

        </Map>
        <Card body className="message-form">
          {this.state.haveUsersLocation 
          ? <div>
              <CardTitle>CardTitle</CardTitle>
              <CardText>
                  Leave a message with any great qoutes
              </CardText>
              {!this.state.sendingQuote & !this.state.quoteSent 
                  ?<Form onSubmit={this.formSubmitted}>
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
                            disabled={!this.formIsValid}>
                              Submit
                    </Button>
                  </Form>
                  : this.state.quoteSent ? <CardText>Thanks for submitting quote!</CardText>
                                          : <CardText className="preloader"><img src={preloader} alt="Loading..."/></CardText>  
                }
          </div>
          : <CardText className="preloader"><img src={preloader} alt="Loading..."/></CardText>
          }
          
        </Card>
      </div>
     );
  }
};//
 
export default App;