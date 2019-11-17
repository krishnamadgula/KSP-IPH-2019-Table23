import React from 'react'
import { SelectSearch, MultiSelect } from '../Form'
import { getMessage } from '../../lib/translator'

export default function SelectStoresSearch (props) {
  let { _this, stores, stateKey, label, placeholder, secondaryLabel, readOnly, dontDisplaySelected, required } = props
  let formattedStores = stores.map(store => {
    return {
      text: store.name,
      value: store.id
    }
  })

  if (stores.length < 5) {
    return <MultiSelect
      label={label || getMessage('shifts.stores')}
      name='belongsToStores'
      placeholder={placeholder || getMessage('shifts.stores.placeholder')}
      options={formattedStores}
      {..._this.generateStateMappers({
        stateKeys: [stateKey],
        loseEmphasisOnFill: true
      })}
      required={required}
      readOnly={readOnly}
      dontDisplaySelected={dontDisplaySelected}
      secondaryLabel={secondaryLabel}
    />
  } else if (stores.length >= 5) {
    return <SelectSearch
      name='search-store'
      required={required}
      readOnly={readOnly}
      dontDisplaySelected={dontDisplaySelected}
      label={label || getMessage('shifts.stores')}
      placeholder={placeholder || getMessage('shifts.stores.placeholder')}
      multiple
      options={formattedStores}
      nameKey='text'
      valueKey='value'
      searchByName
      secondaryLabel={secondaryLabel}
      {..._this.generateStateMappers({
        stateKeys: [stateKey],
        loseEmphasisOnFill: true
      })}
      onChange={selectedValue => {
        let values = JSON.parse(JSON.stringify(_this.state.values))
        values = {...values, [stateKey]: selectedValue.map(el => el.value)}
        _this.setState({values})
      }}
      value={(_this.state.values[stateKey] || []).map(id => formattedStores.find(opt => opt.value === id)).filter(Boolean)}
    />
  }
}
