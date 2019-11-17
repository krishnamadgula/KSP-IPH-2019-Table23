import React, { Component } from 'react'
import moment from 'moment'
import { SingleDatePicker, Input, MultiSelect, Searchable, Select } from '../Form'
import API from '../../lib/api'
import { getMessage } from '../../lib/translator'
import { camelToReading, storeSelection } from '../../lib/commonlyused'
import DeleteIcon from '../../pages/catalogue/Categories/delete.svg'

import './style.css'

const Components = {
  'datetime': {
    component: SingleDatePicker
  },
  'int': {
    component: Input,
    type: 'number'
  },
  'float': {
    component: Input,
    type: 'number',
    step: '0.01'
  },
  'string': {
    component: Input,
    type: 'text'
  },
  'CSV': {
    component: MultiSelect
  },
  'CustomersMappedToTag': {
    component: Searchable,
    config: {
      label: getMessage('product.filters.tag.heading'),
      placeholder: getMessage('product.filters.tag.placeholder'),
      searchUrl: '/customer-service/tag',
      valueKey: 'id',
      nameKey: 'name',
      searchKey: 'name',
      multiple: true,
      transformResponse: response => response.data.tag
    }
  }
}

export function formatDataBeforeSubmit (data, isDel) {
  const values = JSON.parse(JSON.stringify(data))
  let userSet = values.userSet
  if (userSet) {
    userSet.type = 'SEGMENTS'
  }
  if (userSet && userSet.data) {
    userSet.data.forEach(segment => {
      if (segment.id === 'CustomersMappedToTag') {
        segment.tagId = Array.isArray(segment.tags) ? segment.tags.map(tag => tag.id).join(',') : segment.tagId
        !isDel && delete segment.tags
      }
    })
    values.userSet = userSet
  }
  return values
}

class SegmentsForm extends Component {
  constructor (props) {
    super(props)
    this.selectSegment = this.selectSegment.bind(this)
    this.getTagDetails = this.getTagDetails.bind(this)
    this.deleteSegment = this.deleteSegment.bind(this)
  }

  componentWillUnmount () {
    this.tagAPi && this.tagAPi.cancel()
    this.segmentsApi && this.segmentsApi.cancel()
  }

  componentDidMount () {
    let parent = this.props._this
    this.setState({
      segmentsLoaded: false
    })
    const values = parent.state.values
    if (values && values.userSet && values.userSet.data) {
      this.getTagDetails()
    } else {
      this.setState({
        tagsLoaded: true
      })
    }
    // TODO: Use search by name after API starts supporting it instead of getting first 20 segments
    this.segmentsApi = new API({ url: '/promo-service/segment' })
    this.segmentsApi.get().then(
      response => {
        const segments = response.data.segment || []
        this.segments = {}
        this.segmentOptions = segments.map(segment => {
          this.segments[segment.name] = segment.variables
          return {
            text: getMessage(camelToReading(segment.name)),
            value: segment.name
          }
        })
        this.setState({
          segmentsLoaded: true
        })
      }
    )
  }

  getTagDetails () {
    let parent = this.props._this
    let values = JSON.parse(JSON.stringify(parent.state.values))
    values = formatDataBeforeSubmit(values, true)

    let params = ''
    let tags = values && values.userSet && values.userSet.data && values.userSet.data.filter(segment => segment.id === 'CustomersMappedToTag')
    tags && tags.forEach(tag => {
      tag.tagId && tag.tagId.split(',').forEach(tagId => {
        params += `id=${Number(tagId)}&`
      })
    })
    this.tagAPi = new API({ url: `/customer-service/tag?${params}` })
    if (params) {
      this.tagAPi.get().then(
        response => {
          let tags = response.data.tag || []
          if (tags.length > 0) {
            values && values.userSet && values.userSet.data && values.userSet.data.forEach(segment => {
              if (segment.id === 'CustomersMappedToTag') {
                let tagDetails = []
                let tagIds = segment.tagId && segment.tagId.split(',')
                tagDetails = tagIds && tagIds.map(id => {
                  let tagD = tags.filter(tag => tag.id === Number(id))[0]
                  return tagD
                }).filter(Boolean)
                segment.tags = tagDetails
                delete segment.tagId
              }
            })
            parent.setState({
              values
            })
            this.setState({
              tagsLoaded: true
            })
          }
        }
      )
    } else {
      this.setState({
        tagsLoaded: true
      })
    }
  }

  selectSegment (segment) {
    let parent = this.props._this
    let values = Object.assign({}, parent.state.values)
    let newSegment = {}
    newSegment.id = segment
    if (values && values.userSet && values.userSet.data) {
      values.userSet.data.splice(0, 0, newSegment)
    } else {
      if (values && !values.userSet) {
        values.userSet = {}
      }
      values.userSet.data = [newSegment]
    }
    parent.setState({
      values
    })
  }

  deleteSegment (index) {
    const parent = this.props._this
    const values = Object.assign({}, parent.state.values)
    let validations = Object.assign({}, parent.state.validations)
    validations && validations.userSet && validations.userSet.data && validations.userSet.data.splice(index, 1)
    values && values.userSet && values.userSet.data.splice(index, 1)
    parent.setState({
      values,
      validations
    })
  }

  render () {
    const _this = this.props._this
    const { state } = this
    const { tagsLoaded, segmentsLoaded } = state || {}
    const userSet = _this.state && _this.state.values && Object.assign({}, _this.state.values.userSet)
    const data = userSet ? userSet.data : ''
    return (
      <div className='segments-form'>
        <div className='subheading'>{getMessage('Segments')}</div>
        <div className='coupon-section coupon-selection'>
          <Select
            name='segment-selector'
            label={getMessage('segment')}
            placeholder={getMessage('Select Segment')}
            options={this.segmentOptions}
            onChange={(e) => this.selectSegment(e)}
          />
        </div>
        <div />
        {segmentsLoaded && tagsLoaded && data && data.map((segment, segmentIndex) => {
          const id = segment.id
          const variables = this.segments[id]
          if (variables) {
            return <div className='segment-container' key={`${segmentIndex}-container`}>
              <div className='segment-type'>
                <div>{getMessage(camelToReading(id))}</div>
                <button className='delete-button' type='button' onClick={() => this.deleteSegment(segmentIndex)}><img src={DeleteIcon} alt='delete' /><span>{getMessage('deleteText')}</span></button>
              </div>
              <div className='coupon-segment grid'>
                {Object.entries(variables).reverse().map(([key, type], index) => {
                  let extraProps = {}
                  if (key === 'endDate') {
                    extraProps = {
                      allowAllDates: true
                    }
                  } else {
                    extraProps = {isOutsideRange: day => (moment().diff(day) < 0)}
                  }
                  const obj = Components[id] || Components[type]
                  const config = obj.config || {}
                  if (obj) {
                    const Component = obj.component
                    return <div key={`${key} ${type} ${segmentIndex} div`}>
                      <Component
                        name={`${key} ${type} ${segmentIndex}`}
                        label={getMessage(`${camelToReading(key)}`)}
                        placeholder={getMessage(`Enter ${camelToReading(key)}`)}
                        type={obj.type}
                        key={`${key} ${type} ${segmentIndex}`}
                        options={storeSelection()}
                        min={0}
                        required
                        step={obj.step || 1}
                        {...extraProps}
                        openDirection='up'
                        {...config}
                        {..._this.generateStateMappers({
                          stateKeys: ['userSet', 'data', segmentIndex, key === 'tagId' ? 'tags' : key],
                          loseEmphasisOnFill: true
                        })}
                      /></div>
                  }
                  return null
                }).filter(Boolean)}
              </div>
            </div>
          } else {
            return (
              <div className='segment-container' key={`${segmentIndex}-div`}>
                <div className='segment-type'>
                  <div>{getMessage(camelToReading(id))}</div>
                  <button className='delete-button' type='button' onClick={() => this.deleteSegment(segmentIndex)}><img src={DeleteIcon} alt='delete' /><span>{getMessage('deleteText')}</span></button>
                </div>
              </div>
            )
          }
        })}
      </div>
    )
  }
}

export default SegmentsForm
