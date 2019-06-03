import React from 'react';
import { Component } from 'react'
import './LoadingScreen.css'
const issIcon = require('../../assets/International_Space_Station.svg')

const LoadingScreen = (props) => props.loading ? (
    <div id="container">
        <div id="inner">
            <img id="loadingImg" src={issIcon} style={{width: 100, height: 100}}/>
            <h3> Contacting Iss... </h3>
        </div>
    </div>
) : null

export default LoadingScreen