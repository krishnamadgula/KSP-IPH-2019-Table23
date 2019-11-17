import React, { Component } from 'react'
import Loader from '../../../../components/Loader'
import searchIcon from './icon-search.svg'
import './style.css'
import API from '../../../../lib/api'
import debounce from '../../../../lib/debounce'
import { isEqual } from 'lodash'
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from 'react-sortable-hoc'

function getValidationObj (props, value) {
  let valueMissing = props.required && !value
  if (props.required && props.multiple) {
    valueMissing = valueMissing || !value || !value.length
  }
  let result = {
    valueMissing,
    valid: !valueMissing
  }
  return result
}

const SortableItem = SortableElement(props => {
  return (<div className='tag-value'>
    <span className='tag-value-label'><small>{props.displaySelectedValue ? props.displaySelectedValue(props.value) : props.value[props.nameKey]}</small></span>
    <button type='button' className='tag-value-icon' onClick={() => { props.onSelect(props.value) }} />
  </div>)
})

const SortableList = SortableContainer((props) => {
  const items = props.items || []
  return (
    <ul>
      {items && Array.isArray(items) && items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} nameKey={props.nameKey} valueKey={props.valueKey} displaySelectedValue={props.displaySelectedValue} onSelect={props.onSelect} />
      ))}
    </ul>
  )
})

class Searchable extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.runValidation = this.runValidation.bind(this)
    this.state = {
      options: [],
      searchText: '',
      selectedValue: props.value,
      loading: false,
      creating: false
    }
    this.api = new API({ url: props.searchUrl })
    this.selectSearch = debounce(this.selectSearch.bind(this), 300)
    this.search = this.selectSearch
    this.onSelect = this.onSelect.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSortEnd = this.onSortEnd.bind(this)
  }

  onSortEnd ({oldIndex, newIndex}) {
    this.setState(({selectedValue}) => ({
      selectedValue: arrayMove(selectedValue, oldIndex, newIndex)
    }), () => {
      this.props.onChange(this.state.selectedValue)
    })
  }

  runValidation (value) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, value))
  }

  onSelect (option) {
    let selectedValue = option
    if (this.props.multiple) {
      selectedValue = [...(this.state.selectedValue || [])]
      // This should toggle the option from selectedValue
      let index = selectedValue.findIndex(listOption => listOption[this.props.valueKey] === option[this.props.valueKey])
      if (index > -1) {
        selectedValue.splice(index, 1)
      } else {
        selectedValue = [...selectedValue, option]
      }
    }
    this.setState({
      options: [],
      lastRequest: '',
      searchText: '',
      pressedEnter: false
    }, () => {
      this.props.onChange(selectedValue)
      this.runValidation(selectedValue)
    }) // When props.multiple === false
  }

  componentDidMount () {
    this.runValidation(this.state.selectedValue)
  }

  componentDidUpdate (prevProps) {
    if (!isEqual(prevProps.value, this.props.value)) {
      this.runValidation(this.state.selectedValue)
    }
  }

  addNewItem (name) {
    this.setState({ creating: true }, () => {
      this.api.post({ name })
        .then(response => { this.onSelect(response.data[this.props.responseKey] || response.data['name']) })
        .then(() => { this.setState({ creating: false }) })
    })
  }

  selectSearch (api, value, searchkey, searchUrl) {
    let paramsDefault = {}
    paramsDefault[searchkey] = value
    const params = this.props.transformRequest ? this.props.transformRequest(this.state.searchText, paramsDefault) : paramsDefault
    if (value !== '') {
      api.get(params).then((response) => {
        let data = []
        if (this.props.asyncTransform) {
          data = this.props.transformResponse ? this.props.transformResponse(response).then(data => {
            this.setState({
              options: data,
              lastRequest: value
            })
          }) : response.data
        } else {
          data = this.props.transformResponse ? this.props.transformResponse(response) : response.data
          if (this.props.selectOnEnter && this.state.pressedEnter && data && data.length > 0) {
            this.onSelect(data[0])
          } else {
            this.setState({
              options: data,
              lastRequest: value
            })
          }
        }
      }).catch(error => {
        if (error.code === 401) throw error
        this.setState({error: error.message || 'Something went wrong, please try again later'})
      })
    }
  }

  onKeyDown (e) {
    if (!this.props.multiple && (e.keyCode === 8 || e.keyCode === 46)) {
      if (this.state.selectedValue) {
        this.onSelect('')
      }
    }
    if (this.props.selectOnEnter && this.state.searchText && e.keyCode === 13) {
      e.preventDefault()
      this.setState({
        pressedEnter: true
      })
    } else if (this.state.pressedEnter) {
      this.setState({
        pressedEnter: false
      })
    }
  }

  handleChange (e) {
    e.preventDefault()
    const { searchKey, searchUrl } = this.props
    this.setState({
      searchText: e.target.value,
      error: null
    })
    const searchkey = searchKey || 'term'
    this.search(this.api, e.target.value, searchkey, searchUrl)
  }

  componentWillReceiveProps (nextProps) {
    var newValue, oldValue
    if (this.props.multiple) {
      newValue = nextProps.value
      oldValue = this.props.value
    } else {
      newValue = nextProps.value ? nextProps.value[this.props.nameKey] || nextProps.value['name'] || '' : ''
      oldValue = this.props.value ? this.props.value[this.props.nameKey] || this.props.value['name'] || '' : ''
    }
    if (oldValue !== newValue) {
      this.setState({
        searchText: '',
        selectedValue: nextProps.value || (this.props.multiple ? [] : '')
      })
    }
  }

  render () {
    const { type, name, placeholder, required, valueKey, nameKey, createButton = false, readOnly } = this.props
    let options = this.state.options || []
    let selectableValues = options.length
      ? (options.map((suggestion, index) => {
        var suggestionAllowed
        if (this.props.multiple) {
          suggestionAllowed = this.state.selectedValue && this.state.selectedValue.length
            ? (this.state.selectedValue.findIndex(option => suggestion[valueKey] === option[valueKey]) === -1)
            : true
        } else {
          suggestionAllowed = this.state.selectedValue ? (this.state.selectedValue[valueKey] !== suggestion[valueKey]) : true
        }
        return suggestionAllowed ? (
          this.props.renderListElement ? this.props.renderListElement(suggestion, valueKey, nameKey, this.onSelect)
            : <li className='select-option' key={suggestion[valueKey]} onClick={(e) => this.onSelect(suggestion)}>
              {suggestion[nameKey]}
            </li>
        ) : ''
      })) : ''
    return (
      <div className={`Searchable ${this.state.creating ? 'creating' : ''}`.trim()}>
        <div className='input'>
          <input
            id={name}
            name={name}
            type={type || 'text'}
            value={
              this.state.searchText || (
                this.state.selectedValue && (
                  (this.props.displaySelectedValue && this.props.displaySelectedValue(this.state.selectedValue)) || this.state.selectedValue[nameKey] || this.state.selectedValue['name']
                )
              ) || ''}
            placeholder={placeholder}
            required={required}
            onChange={this.handleChange}
            autoComplete='off'
            readOnly={readOnly}
            onKeyDown={this.onKeyDown}
            className={readOnly ? 'focus-none' : ''}
          />
          <img src={searchIcon} className='select-field-icon' alt='' />
        </div>
        {this.state.error && <div className='form-error'>{this.state.error}</div>}
        {this.state.searchText && <div className='select-field-dropdown-container'>
          <ul className={`select-field-dropdown ${this.state.lastRequest !== this.state.searchText ? 'hidden' : ''}`.trim()}>
            {createButton && this.state.options.findIndex(option => option[nameKey].toLowerCase() === this.state.searchText.toLowerCase()) === -1 ? (
              <li className='select-option unselectable'>
                {this.state.searchText}
                {this.state.creating ? (
                  <Loader size='sm' />
                ) : (
                  <button type='button' className='add-button' onClick={() => { this.addNewItem(this.state.searchText) }}>
                    + {createButton || 'Create'}
                  </button>
                )}
              </li>
            ) : null}
            {selectableValues}
          </ul>
        </div>}
        {this.props.multiple ? this.props.draggable ? (
          <div className='tag-values draggable-values'>
            <SortableList items={this.state.selectedValue} onSortEnd={this.onSortEnd} nameKey={nameKey} valueKey={valueKey} displaySelectedValue={this.props.displaySelectedValue} onSelect={this.onSelect} axis={'xy'} pressDelay={200} helperClass='sortableHelper' />
          </div>
        ) : (this.state.selectedValue || []).map(value => (
          <div className='tag-value' key={value[this.props.valueKey]}>
            <span className='tag-value-label'><small>{this.props.displaySelectedValue ? this.props.displaySelectedValue(value) : value[nameKey]}</small></span>
            {!readOnly && <button type='button' className='tag-value-icon' onClick={() => { this.onSelect(value) }} />}
          </div>
        ))
          : null}
      </div>
    )
  }
}

Searchable.defaultProps = {
  nameKey: 'name',
  valueKey: 'value',
  draggable: false
}

export default Searchable
