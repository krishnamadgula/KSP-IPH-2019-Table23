import React, { Component } from 'react'
import debounce from '../../../../lib/debounce'
import searchIcon from './icon-search.svg'

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

class SelectSearch extends Component {
  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.runValidation = this.runValidation.bind(this)
    const options = props.options || []
    const selectedOption = options.filter(opt => opt[props.valueKey] === props.value)[0]
    const searchText = selectedOption ? selectedOption[props.nameKey] : ''
    this.state = {
      options: options,
      searchText: searchText,
      selectedValue: props.value,
      loading: false,
      selectableOptions: props.defaultSelectableOptions ? props.options : []
    }
    this.selectSearch = debounce(this.selectSearch.bind(this), 300)
    this.search = this.selectSearch
    this.onSelect = this.onSelect.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  handleChange (e) {
    e.preventDefault()
    this.setState({
      searchText: e.target.value
    })
    this.search(e.target.value)
  }

  runValidation (value) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, value))
  }

  selectSearch (value) {
    const options = this.state.options
    let searchKey = this.props.valueKey
    if (this.props.searchByName) {
      searchKey = this.props.nameKey
    }
    let searchOptions = options.filter(opt => opt[searchKey].toLowerCase().includes(value.toLowerCase()))
    this.setState({
      selectableOptions: searchOptions,
      lastSearch: value
    })
  }

  componentWillReceiveProps (nextProps) {
    var newValue, oldValue
    const options = this.state.options || []
    const selectedOption = options.filter(opt => opt[this.props.valueKey] === nextProps.value)[0]
    const name = selectedOption ? selectedOption[this.props.nameKey] : ''
    if (this.props.multiple) {
      newValue = nextProps.value
      oldValue = this.props.value
    } else {
      newValue = nextProps.value ? nextProps.value || '' : ''
      oldValue = this.props.value ? this.props.value || '' : ''
    }
    if (oldValue !== newValue) {
      let searchText
      if (this.props.multiple) {
        searchText = ''
      } else {
        searchText = name
      }
      this.setState({
        searchText: searchText,
        selectedValue: nextProps.value || (this.props.multiple ? [] : '')
      })
    }
  }

  onSelect (option) {
    let selectedValue = option
    if (this.props.multiple) {
      selectedValue = [...(this.state.selectedValue || [])]
      let index = selectedValue.findIndex(listOption => listOption[this.props.valueKey] === option[this.props.valueKey])
      if (index > -1) {
        selectedValue.splice(index, 1)
      } else {
        selectedValue = [...selectedValue, option]
      }
    }
    this.setState({
      selectableOptions: [],
      searchText: option && !this.props.multiple ? option[this.props.nameKey] : '',
      lastSearch: '',
      selectedValue
    }, () => {
      this.props.onChange(this.props.multiple ? selectedValue : selectedValue[this.props.valueKey])
      this.runValidation(selectedValue)
    })
  }

  onKeyDown (e) {
    if (!this.props.multiple && (e.keyCode === 8 || e.keyCode === 46)) {
      if (this.state.selectedValue) {
        this.onSelect('')
      }
    }
  }

  render () {
    const { name, placeholder, required, renderListElement, type, nameKey, valueKey, readOnly, autoFocus, defaultSelectableOptions, dontDisplaySelected } = this.props
    let { selectableOptions, searchText, selectedValue, error, lastSearch } = this.state
    let selectableValues = selectableOptions.length
      ? (selectableOptions.map((suggestion, index) => {
        let suggestionAllowed
        if (this.props.multiple) {
          suggestionAllowed = selectedValue && selectedValue.length
            ? (selectedValue.findIndex(option => suggestion[valueKey] === option[valueKey]) === -1)
            : true
        } else {
          suggestionAllowed = selectedValue ? (selectedValue[valueKey] !== suggestion[valueKey]) : true
        }
        return suggestionAllowed
          ? (renderListElement ? renderListElement(suggestion, this.onSelect)
            : <li className='select-option' key={suggestion[valueKey]} onClick={(e) => this.onSelect(suggestion)}>{suggestion[nameKey]}</li>
          ) : ''
      })) : ''
    return (
      <div className={`Searchable`}>
        <div className='input'>
          <input
            id={name}
            name={name}
            type={type || 'text'}
            value={searchText}
            placeholder={placeholder}
            required={required}
            readOnly={readOnly}
            onChange={this.handleChange}
            onKeyDown={this.onKeyDown}
            autoFocus={autoFocus}
          />
          <img src={searchIcon} className='select-field-icon' alt='' />
        </div>
        {error && <div className='error-message'>{error}</div>}
        {searchText && !defaultSelectableOptions && <div className='select-field-dropdown-container'>
          <ul className={`select-field-dropdown ${lastSearch !== searchText ? 'hidden' : ''}`.trim()}>
            {selectableValues}
          </ul>
        </div>}
        {defaultSelectableOptions && <div className='select-field-dropdown-container'>
          <ul className={`select-field-dropdown`.trim()}>
            {selectableValues}
          </ul>
        </div>}
        {!dontDisplaySelected && this.props.multiple ? (
          <div>
            {(this.state.selectedValue || []).map(value => (
              <div className='tag-value' key={value[nameKey]}>
                <span className='tag-value-label'><small>{value[nameKey]}</small></span>
                <button type='button' className='tag-value-icon' onClick={() => { this.onSelect(value) }} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }
}
SelectSearch.defaultProps = {
  nameKey: 'text',
  valueKey: 'value',
  defaultSelectableOptions: false
}
export default SelectSearch
