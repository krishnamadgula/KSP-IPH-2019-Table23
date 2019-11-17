import React, { Component } from 'react'
import GoogleMaps, { Marker, SearchBox, Polygon } from '../../../components/GoogleMaps'
import { getMessage } from '../../../lib/translator'
import SearchIcon from './icon-search.svg'
import {isExtensionEnabled} from '../../../lib/auth'
import { drawCircle } from '../../../pages/settings/DeliveryArea/Maps/RadialMapComponent/index'
import PinCode from './pincode/pincode'
import StoreMarker from './store-marker.svg'

const DeliveryAreas = (props) => {
  const { deliveryAreas, stores } = props
  const defaultOptions = {
    strokeColor: '#7ac8ed',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#7ac8ed',
    fillOpacity: 0.35
  }
  return deliveryAreas.length && deliveryAreas.map((deliveryArea, index) => {
    if (deliveryArea.configType === 'RADIAL') {
      let { endRadius, startRadius } = deliveryArea.area
      return stores && stores.length && stores.map((store, radialIndex) => {
        let lat = Number(store.latitude)
        let lng = Number(store.longitude)
        return <Polygon key={'radial' + index + radialIndex}
          paths={[drawCircle({ lat, lng }, endRadius * 1000, 1),
            drawCircle({lat, lng}, startRadius * 1000, -1)]}
          defaultOptions={defaultOptions}
        />
      })
    } else if (deliveryArea.configType === 'POLYGON') {
      const { locations } = deliveryArea.area
      let locationsArray = locations.map((location) => {
        let { latitude: lat, longitude: lng } = location
        return { lat: Number(lat), lng: Number(lng) }
      })
      return <Polygon key={'polygon' + index}
        path={locationsArray}
        defaultOptions={defaultOptions}
      />
    } else if (deliveryArea.configType === 'PINCODE') {
      return <PinCode key={'pincode' + index} index={index} pincodes={{ pincodes: deliveryArea.area.pincodes }} />
    } else {
      return null
    }
  })
}

export default class Map extends Component {
  constructor (props) {
    super(props)
    this.state = {
      location: props.coor,
      mapMounted: !!window.google,
      pincodeLocations: []
    }
    this._isMounted = true
    this.geocodeAddress = this.geocodeAddress.bind(this)
    this.onMapMounted = this.onMapMounted.bind(this)
    this.onPlacesChanged = this.onPlacesChanged.bind(this)
    this.onSearchBoxMounted = this.onSearchBoxMounted.bind(this)
    this.setFitBounds = this.setFitBounds.bind(this)
    this.getLatLngPoints = this.getLatLngPoints.bind(this)
    this.getGeoCodeAddress = this.getGeoCodeAddress.bind(this)
  }

  componentWillUnmount () {
    this._isMounted = false
  }
  onMapMounted (ref) {
    this.map = ref
    if (this._isMounted && !this.state.location) {
      this.geocodeAddress()
    }
    if (this.props.searchBox) {
      this.setState({
        mapMounted: true
      })
    }
    let {deliveryAreas, isTripPlannerPage} = this.props
    const isDeliveryAreaExtensionEnabled = isExtensionEnabled('DeliveryAreaSupport')
    if (isDeliveryAreaExtensionEnabled && isTripPlannerPage) {
      let pincodesArray = deliveryAreas && deliveryAreas.length && deliveryAreas.map((deliveryArea) => {
        if (deliveryArea.configType === 'PINCODE') {
          return deliveryArea.area.pincodes
        } else {
          return null
        }
      }).filter((pincode) => pincode !== null).reduce((acc, current) => acc.concat(...current), [])
      this.getGeoCodeAddress({pincodes: pincodesArray})
      this.setFitBounds()
    }
  }

  onSearchBoxMounted (ref) {
    this.searchBox = ref
  }

  onPlacesChanged () {
    const places = this.searchBox.getPlaces()
    const bounds = new window.google.maps.LatLngBounds()

    places.forEach(place => {
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport)
      } else {
        bounds.extend(place.geometry.location)
      }
    })
    const nextMarkers = places.map(place => ({
      position: place.geometry.location
    }))
    if (nextMarkers[0] && nextMarkers[0]['position']) {
      this.props.setNewLocation(nextMarkers[0].position.lat(), nextMarkers[0].position.lng())
    }
  }

  geocodeAddress () {
    let geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ 'address': this.props.address }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        this.setState({
          location: results[0].geometry.location
        })
        if (this.props.setNewLocation) {
          this.props.setNewLocation(results[0].geometry.location.lat(), results[0].geometry.location.lng())
        }
      } else if (status === window.google.maps.GeocoderStatus.ZERO_RESULTS) {
        this.props.showError(getMessage('googleMaps.zeroResults.error'))
        this.setState({
          location: null
        })
      } else {
        this.props.showError('error.generic')
        this.setState({
          location: null
        })
      }
    })
  }

  getGeoCodeAddress (props) {
    const { pincodes } = props
    if (window.google) {
      let geocoder = new window.google.maps.Geocoder()
      let pincodeLocations = []
      let promises = []
      pincodes && pincodes.forEach((pincode) => {
        let promise = new Promise((resolve) => {
          geocoder.geocode({ 'address': pincode.pincode.toString() }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK) {
              pincodeLocations.push({ 'location': results[0].geometry.location })
            }
            resolve()
          })
        })
        promises.push(promise)
      })
      Promise.all(promises).then(() => {
        if (this._isMounted) {
          this.setState({
            pincodeLocations
          })
        }
      })
    }
  }

  getLatLngPoints () {
    let {deliveryAreas, stores, storeId, coor} = this.props
    let {location} = this.state
    let points = []
    if (coor || location) {
      points.push(coor || location)
    }
    if (deliveryAreas && stores && deliveryAreas.length && stores.length) {
      let store = stores.filter((store) => store.id === storeId)
      let { latitude: lat, longitude: lng } = store.length && store[0]
      points.push({lat: Number(lat), lng: Number(lng)})
      let deliveryAreasPoints = deliveryAreas.map((deliveryArea) => {
        if (deliveryArea.configType === 'POLYGON') {
          const { locations } = deliveryArea.area
          let locationsArray = locations.map((location) => {
            let { latitude: lat, longitude: lng } = location
            return { lat: Number(lat), lng: Number(lng) }
          })
          return locationsArray
        } else {
          return undefined
        }
      }).filter((point) => point !== undefined)
      points = points.concat(...deliveryAreasPoints)
      let pincodes = this.state.pincodeLocations && this.state.pincodeLocations.map(({location}) => {
        return location
      })
      points = points.concat(...pincodes)
    }
    return points
  }
  setFitBounds () {
    if (window.google) {
      let bounds = new window.google.maps.LatLngBounds()
      let points = this.getLatLngPoints()
      for (let i = 0; i < points.length; i++) {
        bounds.extend(points[i])
      }
      this.map && this.map.fitBounds(bounds)
    }
  }

  render () {
    const { location } = this.state
    let { setNewLocation, draggable = false, searchBox, bounds, coor, isTripPlannerPage, stores, deliveryAreas, storeId } = this.props
    stores = stores && stores.length && stores.filter(store => {
      return store.id === storeId
    })
    let storesWithLatLng = stores && stores.filter(store => store.latitude && store.longitude)
    let defaultLatLngs = storesWithLatLng ? { lat: Number(storesWithLatLng[0].latitude), lng: Number(storesWithLatLng[0].longitude) } : { lat: 12.9178429, lng: 77.6451166 }
    const isDeliveryAreaExtensionEnabled = isExtensionEnabled('DeliveryAreaSupport')
    // this.map && this.map.panTo(coor || location || defaultLatLngs)
    return (
      <GoogleMaps
        zoom={15}
        onMapMounted={this.onMapMounted}
        containerClassName='address-map'
        center={coor || location || defaultLatLngs}
      >
        {<Marker
          position={coor || location || defaultLatLngs}
          draggable={draggable}
          onDragEnd={(e) => { setNewLocation(e.latLng.lat(), e.latLng.lng()) }}
        />}
        {searchBox && this.state.mapMounted && <SearchBox
          ref={this.onSearchBoxMounted}
          bounds={bounds}
          controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
          onPlacesChanged={this.onPlacesChanged}
        >
          <div className='places-search'>
            <input
              type='text'
              placeholder={getMessage('radial.form.searchLocation.placeholder')}
              className='places-search-input'
            />
            <img className='search-icon' src={SearchIcon} alt='' />
          </div>
        </SearchBox>}
        {isTripPlannerPage && isDeliveryAreaExtensionEnabled && <DeliveryAreas deliveryAreas={deliveryAreas || []} coor={coor} location={location} stores={stores || []} />}
        {isTripPlannerPage && isDeliveryAreaExtensionEnabled && stores && stores.length && stores.map((store, index) => <Marker key={'marker' + index}
          icon={StoreMarker}
          position={{ lat: Number(store.latitude), lng: Number(store.longitude) }}
        />)}
      </GoogleMaps>
    )
  }
}

Map.defaultProps = {
  deliveryAreas: [],
  stores: []
}
