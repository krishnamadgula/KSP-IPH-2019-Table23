import React from 'react'

import { BaseForm, SingleDatePicker, Searchable, Select } from '../../../../components/Form'
import { getMessage } from '../../../../lib/translator'

export default class Filters extends BaseForm {
  render () {
    const { SubmitButton, ClearButton } = this.buttons
    const { Form } = this.components
    const { stores } = this.props.options

    return (
      <Form>
        <div className='form-fields'>
          <Searchable
            label={getMessage('attendance.summary.filter.form.employee.name')}
            placeholder={getMessage('attendance.summary.filter.form.employee.placeholder')}
            name='name'
            type='text'
            searchUrl='/account-service/employee'
            valueKey='id'
            searchKey='name'
            transformResponse={response => response.data.employee}
            {...this.generateStateMappers({
              stateKeys: ['user'],
              loseEmphasisOnFill: true
            })}
          />
          {
            stores && (
              <Select
                label={getMessage('shifts.stores')}
                placeholder={getMessage('shifts.stores.placeholder')}
                name='store'
                options={stores.map(store => {
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
            )
          }
        </div>
        <div className='form-fields' >
          <SingleDatePicker
            isOutsideRange
            label={getMessage('leaves.filter.fromdate')}
            placeholder={getMessage('leaves.filter.date')}
            displayFormat='YYYY-MM-DD'
            {...this.generateStateMappers({
              stateKeys: ['from'],
              loseEmphasisOnFill: true
            })}
          />
          <SingleDatePicker
            isOutsideRange
            label={getMessage('leaves.filter.todate')}
            placeholder={getMessage('leaves.filter.date')}
            displayFormat='YYYY-MM-DD'
            {...this.generateStateMappers({
              stateKeys: ['to'],
              loseEmphasisOnFill: true
            })}
          />
        </div>
        <SubmitButton>{getMessage('leaves.filter.submit')}</SubmitButton>
        <ClearButton>{getMessage('leaves.filter.clearFiltersText')}</ClearButton>
      </Form>
    )
  }
}
