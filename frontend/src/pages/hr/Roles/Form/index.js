import React from 'react'
import { BaseForm, Input } from '../../../../components/Form'

import { getMessage } from '../../../../lib/translator'

class RolesForm extends BaseForm {
  render () {
    const { Form } = this.components
    const { SubmitButton, CancelButton } = this.buttons
    return (
      <Form>
        <Input
          type='text'
          name='name'
          label={getMessage('role.name')}
          placeholder={getMessage('role.name.placeholder')}
          {...this.generateStateMappers({
            stateKeys: ['name'],
            loseEmphasisOnFill: true
          })}
        />
        <div className='form-actions'>
          <SubmitButton>{getMessage('role.submit')}</SubmitButton>
          <CancelButton>{getMessage('role.cancel')}</CancelButton>
        </div>
      </Form>
    )
  }
}

export default RolesForm
