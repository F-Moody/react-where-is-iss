import React from 'react';
import './App.css';
import {Map, Marker, Popup, TileLayer} from 'react-leaflet'
import L from 'leaflet';
import LoadingScreen from './Components/LoadingScreen/LoadingScreen'

//"start": "react-scripts start",
const axios = require('axios');
const TLEJS = require('tle.js');
const tlejs = new TLEJS();

const IssPlaceHolder = new L.Icon({
    iconUrl: require('./assets/International_Space_Station.svg'),
    iconRetinaUrl: require('./assets/International_Space_Station.svg'),
    iconAnchor: null,
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: new L.Point(30, 35),
    className: 'leaflet-div-icon'
});

export default class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            position: [0, 0],
            loading: true,
            futurePath: [],
            currentPath: [],
            pastPath: []
        }
    }

    async componentDidMount() {
        await this._updateIssPosition()
        await this._getTleData()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.loading !== this.state.loading) {
            this.map = this.refs.map.leafletElement
            this._drawLine()
        }
    }

    _updateIssPosition = async () => {
        let firstLoad = true
        setInterval(async () => {
            const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544')
            const {name, latitude, longitude} = response.data
            this.setState({position: [latitude, longitude], loading: false})
            //center the map on ISS position only the first time
            if(firstLoad) {
                this.setState({initialPosition: [latitude, longitude]})
                firstLoad = false
            }

        }, 1000)

    }

    _getTleData = async () => {
        const {data} = await axios.get('https://api.wheretheiss.at/v1/satellites/25544/tles?format=text')
        const threeOrbitsArr = tlejs.getGroundTrackLatLng(data)
        this.setState({futurePath: threeOrbitsArr[2], currentPath: threeOrbitsArr[1], pastPath: threeOrbitsArr[0]})
    }

    _drawLine = () => {

        /*const pointA = new L.LatLng(45.0583445782418, 7.637005829375259);
        const pointB = new L.LatLng(-2.205208, 50.164638);
        const pointList = [pointA, pointB];*/

        const futureList = [...this.state.futurePath];
        const currentList = [...this.state.currentPath]
        const pastList = [...this.state.pastPath]

        const futurePolyline = new L.Polyline(futureList, {
            color: 'red',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        });


        const pastPolyline = new L.Polyline(pastList, {
            color: 'green',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        });

        const presentPolyline = new L.Polyline(currentList, {
            color: 'white',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
        });

        presentPolyline.addTo(this.map)
        futurePolyline.addTo(this.map)
        pastPolyline.addTo(this.map);
    }

    render() {
        return (
            <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <LoadingScreen loading={this.state.loading}/>
                <Map ref='map' center={this.state.initialPosition || [0, 0]} zoom={3} maxBounds={[[-90, -180], [90, 180]]}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                    />
                    { !this.state.loading && <Marker icon={IssPlaceHolder} position={this.state.position}>
                        <Popup>A pretty CSS3 popup.<br/>Easily customizable.</Popup>
                    </Marker>}
                </Map>
            </div>
        );

    }
}


