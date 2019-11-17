import React from 'react'
import { BaseForm, Searchable } from '../../../../components/Form'
import { getMessage } from '../../../../lib/translator'

export default class DesignationFilter extends BaseForm {
  render () {
    const { SubmitButton, ClearButton } = this.buttons
    const { Form } = this.components
    return (
      <div className='designation-filters'>
        <Form>
          <div className='form-fields'>
            <Searchable
              label={getMessage('designations.form.name')}
              placeholder={getMessage('designations.form.name.placeholder')}
              name='name'
              type='text'
              searchUrl='/account-service/designation'
              valueKey='id'
              searchKey='name'
              transformResponse={response => response.data.designation}
              {...this.generateStateMappers({
                stateKeys: ['name'],
                loseEmphasisOnFill: true
              })}
            />
            <Searchable
              label={getMessage('designations.form.manager')}
              placeholder={getMessage('designations.form.manager.placeholder')}
              name='manager'
              type='text'
              searchUrl='/account-service/designation'
              valueKey='id'
              searchKey='name'
              transformResponse={response => response.data.designation}
              {...this.generateStateMappers({
                stateKeys: ['manager'],
                loseEmphasisOnFill: true
              })}
            />
          </div>
          <SubmitButton>{getMessage('designations.form.submit')}</SubmitButton>
          <ClearButton>{getMessage('designations.form.clearFiltersText')}</ClearButton>
        </Form>
      </div>
    )
  }
}
