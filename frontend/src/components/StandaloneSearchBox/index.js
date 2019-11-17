import React from 'react'
import { GOOGLE_MAPS_URL, GOOGLE_MAP_DEFAULT_KEY } from '../../config/app'

import { compose, withProps, lifecycle } from 'recompose'
import {
  withScriptjs
} from 'react-google-maps'
import { StandaloneSearchBox } from 'react-google-maps/lib/components/places/StandaloneSearchBox'
import { get } from '../../lib/storage'

const PlacesWithStandaloneSearchBox = compose(
  withProps({
    googleMapURL: GOOGLE_MAPS_URL + (get('googleMapAPIkey') || GOOGLE_MAP_DEFAULT_KEY),
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />
  }),
  lifecycle({
    componentWillMount () {
      const refs = {}

      this.setState({
        places: [],
        onSearchBoxMounted: ref => {
          refs.searchBox = ref
        },
        onPlacesChanged: () => {
          const places = refs.searchBox.getPlaces()
          this.setState({
            places
          }, () => this.props.onPlacesSearched(this.state.places))
        }
      })
    }
  }),
  withScriptjs
)(props =>
  <div data-standalone-searchbox=''>
    <StandaloneSearchBox
      ref={props.onSearchBoxMounted}
      bounds={props.bounds}
      onPlacesChanged={props.onPlacesChanged}
    >
      <div className='field'>
        {props.element ? props.element : <div className='field-wrapper'><label htmlFor={props.fieldname}>{props.label}</label><input
          name={props.fieldname}
          value={props.value}
          type='text'
          placeholder={props.placeholder ? props.placeholder : ''}
          onFocus={props.onFocusFunction ? props.onFocusFunction : null}
          onChange={props.onChange && (e => {
            props.onChange(e)
          })}
          onBlur={props.onBlurFunction ? props.onBlurFunction : null}
          required={props.required ? props.required : false}
        /></div>}
      </div>
    </StandaloneSearchBox>
  </div>
)

export default PlacesWithStandaloneSearchBox
