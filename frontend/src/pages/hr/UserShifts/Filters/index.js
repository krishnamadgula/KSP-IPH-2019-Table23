import React from 'react'
import { BaseForm, Searchable, Select, VALIDATION_TYPES } from '../../../../components/Form'

import { getMessage } from '../../../../lib/translator'

export default class UserShiftForm extends BaseForm {
  render () {
    const { SubmitButton, ClearButton } = this.buttons
    const { Form } = this.components
    const { stores, multiStoreEnabled } = this.props.options
    return (
      <Form>
        <div className='form-fields'>
          <Searchable
            label={getMessage('shifts.designation')}
            placeholder={getMessage('shifts.designation.placeholder')}
            name='designation'
            searchUrl='/account-service/designation'
            valueKey='id'
            nameKey='name'
            searchKey='name'
            transformResponse={response => response.data.designation}
            {...this.generateStateMappers({
              stateKeys: ['designation'],
              validationTypes: VALIDATION_TYPES.ONSUBMIT,
              loseEmphasisOnFill: true
            })}
          />
          <Searchable
            label={getMessage('shifts.employee')}
            placeholder={getMessage('shifts.employee.placeholder')}
            name='employee'
            searchUrl='/account-service/employee'
            valueKey='id'
            nameKey='name'
            searchKey='name'
            transformResponse={response => response.data.employee}
            {...this.generateStateMappers({
              stateKeys: ['employee'],
              loseEmphasisOnFill: true
            })}
          />
        </div>
        {multiStoreEnabled && stores && <div className='form-fields'>
          <Select
            label={getMessage('shifts.stores')}
            placeholder={getMessage('shifts.stores.placeholder')}
            name='store'
            options={(stores || []).map(store => {
              return {
                text: store.name,
                value: store.id
              }
            })}
            {...this.generateStateMappers({
              stateKeys: ['storeId'],
              loseEmphasisOnFill: true
            })}
          />
        </div>}
        <SubmitButton>{getMessage('shifts.filters.submitText')}</SubmitButton>
        <ClearButton>{getMessage('shifts.filters.clearFiltersText')}</ClearButton>
      </Form>
    )
  }
}
