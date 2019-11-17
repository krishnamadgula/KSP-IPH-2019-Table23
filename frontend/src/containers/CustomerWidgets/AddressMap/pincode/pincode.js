import React, { Component } from 'react'
import { Marker, InfoWindow } from 'react-google-maps'
import MarkerIcon from './icon-marker.svg'

class MarkerWithInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false
    }
    this.closeInfoWindow = this.closeInfoWindow.bind(this)
    this.openInfoWindow = this.openInfoWindow.bind(this)
  }

  closeInfoWindow () {
    this.setState({
      isOpen: false
    })
  }

  openInfoWindow () {
    this.setState({
      isOpen: true
    })
  }

  render () {
    const { location } = this.props
    return (
      <Marker icon={MarkerIcon} position={{lat: location.location.lat(), lng: location.location.lng()}} onMouseOver={this.openInfoWindow} onMouseOut={this.closeInfoWindow}>
        {this.state.isOpen && <InfoWindow defaultOptions={{ disableAutoPan: true }} onCloseClick={this.closeInfoWindow}>
          <div><strong>{location.pincode}</strong></div>
        </InfoWindow>
        }
      </Marker>
    )
  }
}

class PinCode extends Component {
  constructor (props) {
    super(props)
    this.state = {
      locations: []
    }
    this.geocodeAddress = this.geocodeAddress.bind(this)
  }
  geocodeAddress (props) {
    const { pincodes } = props
    let geocoder = new window.google.maps.Geocoder()
    let locations = []
    let promises = []
    pincodes.forEach((pincode) => {
      let promise = new Promise((resolve, reject) => {
        geocoder.geocode({ 'address': pincode.pincode.toString() }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK) {
            locations.push({ 'location': results[0].geometry.location, 'pincode': pincode.pincode })
          }
          resolve()
        })
      })
      promises.push(promise)
    })
    Promise.all(promises).then(() => {
      this.setState({
        locations
      })
    })
  }
  componentDidMount () {
    let {pincodes} = this.props
    if (pincodes) {
      this.geocodeAddress(pincodes)
    }
  }
  render () {
    let { locations } = this.state.locations.length && this.state
    let {index} = this.props
    if (locations) {
      let markersWithInfo = locations.length && locations.map((location, pincodeIndex) => {
        return <MarkerWithInfo key={'markerwithinfo' + index + pincodeIndex} location={location} />
      })
      return markersWithInfo
    } else {
      return null
    }
  }
}

export default PinCode
