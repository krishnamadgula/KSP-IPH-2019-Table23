import React from 'react'
import { BaseForm, Searchable } from '../../../../components/Form'

import { getMessage } from '../../../../lib/translator'

class RolesFilter extends BaseForm {
  render () {
    const { Form } = this.components
    const { SubmitButton } = this.buttons
    return (
      <Form>
        <div className='form-fields'>
          <Searchable
            type='text'
            name='name'
            label={getMessage('role.name')}
            placeholder={getMessage('role.name.placeholder')}
            searchKey='name'
            valueKey='id'
            nameKey='name'
            searchUrl='/account-service/role'
            transformResponse={response => response.data.role}
            {...this.generateStateMappers({
              stateKeys: ['name'],
              loseEmphasisOnFill: true
            })}
          />
        </div>
        <div className='form-actions'>
          <SubmitButton>{getMessage('role.submit')}</SubmitButton>
        </div>
      </Form>
    )
  }
}

export default RolesFilter
