import React from 'react'
import { SelectSearch, Input, Textarea, Select, MultiSelect, Checkbox, SingleDatePicker, DateTime } from '../Form'
import { getMessage } from '../../lib/translator'
import { getCountryList } from '../../lib/commonlyused'

function commonGenerateStateMappers (_this, key, stateVar, loseEmphasisOnFill = false) {
  let stateKeys = stateVar || ['metaData']
  stateKeys = stateKeys.slice()
  stateKeys.push(key)
  return _this.generateStateMappers ? _this.generateStateMappers({
    stateKeys,
    loseEmphasisOnFill
  }) : {}
}

export default function MetaDataFormFields (props) {
  let { metaDataWithType, title, className, _this, readOnly, metaData, onChange, noContainer, stateKeys, preserveSequence } = props
  let arr = []

  let tempArr = []
  metaDataWithType && Object.entries(metaDataWithType).map(([key, details], i) => {
    if (!details) {
      return null
    }
    if (details.type === 'string') {
      let data = (<Input
        key={`metaData-${i}`}
        className='string'
        type='text'
        label={key}
        readOnly={readOnly}
        required={details.required}
        placeholder={`${getMessage('product.form.enter')} ${key}`}
        {...commonGenerateStateMappers(_this, key, stateKeys, true)}
        value={metaData ? metaData[key] : commonGenerateStateMappers(_this, key, stateKeys).value}
        onChange={onChange ? (e) => onChange(key, e) : commonGenerateStateMappers(_this, key, stateKeys).onChange}
      />)
      preserveSequence ? arr.push(data) : tempArr.unshift(data)
    } else if (details.type === 'number') {
      let data = (<Input
        type='number'
        className='number'
        key={`metaData-${i}`}
        label={key}
        readOnly={readOnly}
        required={details.required}
        placeholder={`${getMessage('product.form.enter')} ${key}`}
        {...commonGenerateStateMappers(_this, key, stateKeys, true)}
        value={metaData ? metaData[key] : commonGenerateStateMappers(_this, key, stateKeys).value}
        onChange={onChange ? (e) => onChange(key, e) : commonGenerateStateMappers(_this, key, stateKeys).onChange}
      />)
      preserveSequence ? arr.push(data) : arr.unshift(data)
    } else if (details.type === 'boolean') {
      let data = (<div className='field field-checkbox' key={`metadata-${i}`}><Checkbox
        inlineLabel={key}
        name={`metaData-${i}`}
        readOnly={readOnly}
        required={details.required}
        placeholder={`${getMessage('product.form.enter')} ${key}`}
        {...commonGenerateStateMappers(_this, key, stateKeys)}
        value={metaData ? metaData[key] : commonGenerateStateMappers(_this, key, stateKeys).value}
        onChange={onChange ? (e) => onChange(key, e) : commonGenerateStateMappers(_this, key, stateKeys).onChange}
      /></div>)
      preserveSequence ? arr.push(data) : arr.unshift(data)
    } else if (details.type === 'enum' || details.type === 'multiValued Enum') {
      let Comp = details.type === 'enum' ? Select : MultiSelect
      let data = (<Comp
        label={key}
        name={`metaData-${i}`}
        readOnly={readOnly}
        placeholder={`${getMessage('product.form.enter')} ${key}`}
        key={`metaData-${i}`}
        className='enum'
        required={details.required}
        options={(details.typeMeta && details.typeMeta.allowedValue ? details.typeMeta.allowedValue : []).map(opt => {
          return {
            text: opt,
            value: opt
          }
        })}
        {...commonGenerateStateMappers(_this, key, stateKeys, true)}
        value={metaData ? metaData[key] : commonGenerateStateMappers(_this, key, stateKeys).value}
        onChange={onChange ? (e) => onChange(key, e) : commonGenerateStateMappers(_this, key, stateKeys).onChange}
      />)
      preserveSequence ? arr.push(data) : arr.unshift(data)
    } else if (details.type === 'country') {
      let data = (<SelectSearch
        name={`metaData-${i}`}
        label={key}
        readOnly={readOnly}
        className='country'
        nameKey='name'
        valueKey='name'
        key={`metaData-${i}`}
        required={details.required}
        options={getCountryList()}
        placeholder={`${getMessage('product.form.enter')} ${key}`}
        {...commonGenerateStateMappers(_this, key, stateKeys, true)}
        value={metaData ? metaData[key] : commonGenerateStateMappers(_this, key, stateKeys).value}
        onChange={onChange ? (e) => onChange(key, e) : commonGenerateStateMappers(_this, key, stateKeys).onChange}
      />)
      preserveSequence ? arr.push(data) : arr.unshift(data)
    } else if (details.type === 'date') {
      let data = (
        <SingleDatePicker
          key={`metadata-${key}-${i}`}
          name={`metadata-${key}-${i}`}
          readOnly={readOnly}
          label={key}
          required={details.required}
          placeholder={`${getMessage('order.select')} ${key}`}
          {...commonGenerateStateMappers(_this, key)}
          value={metaData ? metaData[key] : commonGenerateStateMappers(_this, key, stateKeys).value}
          onChange={onChange ? (e) => onChange(key, e) : commonGenerateStateMappers(_this, key, stateKeys).onChange}
        />
      )
      preserveSequence ? arr.push(data) : arr.push(data)
    } else if (details.type === 'dateTime') {
      let data = (
        <DateTime
          key={`metadata-${key}-${i}`}
          name={`metadata-${key}-${i}`}
          label={key}
          readOnly={readOnly}
          required={details.required}
          placeholder={`${getMessage('order.select')} ${key}`}
          {...commonGenerateStateMappers(_this, key, stateKeys)}
          value={metaData ? metaData[key] : commonGenerateStateMappers(_this, key, stateKeys).value}
          onChange={onChange ? (e) => onChange(key, e) : commonGenerateStateMappers(_this, key, stateKeys).onChange}
        />
      )
      preserveSequence ? arr.push(data) : arr.push(data)
    } else if (details.type === 'text') {
      let data = (<Textarea
        key={`metaData-${i}`}
        label={key}
        readOnly={readOnly}
        className='text'
        type='text'
        placeholder={`${getMessage('product.form.enter')} ${key}`}
        {...commonGenerateStateMappers(_this, key, stateKeys)}
        value={metaData ? metaData[key] : commonGenerateStateMappers(_this, key, stateKeys).value}
        onChange={onChange ? (e) => onChange(key, e) : commonGenerateStateMappers(_this, key, stateKeys).onChange}
      />)
      preserveSequence ? arr.push(data) : tempArr.push(data)
    }
    return null
  })
  arr = arr.concat(tempArr)
  return !noContainer ? (<div className={className}>
    {(arr.length > 0) && title && <title />}
    {arr}
  </div>)
    : (<React.Fragment>
      {(arr.length > 0) && title && <title />}{arr}
    </React.Fragment>)
}

MetaDataFormFields.defaultProps = {
  preserveSequence: false
}
