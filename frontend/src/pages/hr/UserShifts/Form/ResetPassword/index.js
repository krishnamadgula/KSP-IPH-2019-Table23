import React from 'react'
import { BaseForm, Input, VALIDATION_TYPES } from '../../../../../components/Form'
import { getMessage } from '../../../../../lib/translator'
import API from '../../../../../lib/api'

class ResetPassword extends BaseForm {
  constructor (props) {
    super(props)
    this.state.submitting = false
  }

  onSubmit (formData) {
    this.setState({
      submitting: true
    })
    let data = Object.assign({}, formData)
    const api = new API({ url: `/account-service/employee/${this.props.id}/password` })
    api.put(data).then(
      response => this.props.onSuccess(),
      error => {
        this.setState({
          formError: error.message,
          submitting: false
        })
        if (error.code === 401) {
          throw error
        }
      }
    )
  }

  render () {
    const { Form } = this.components
    const { SubmitButton } = this.buttons
    return (
      <Form>
        {this.state.formError && <div className='form-error'>{this.state.formError}</div>}
        <Input
          type='password'
          label={getMessage('shifts.newPassword')}
          placeholder={getMessage('shifts.newPassword.placeholder')}
          name='new-password'
          required
          pattern={this.getState(['confirmPassword'])}
          {...this.generateStateMappers({
            stateKeys: ['newPassword'],
            loseEmphasisOnFill: true,
            validationType: VALIDATION_TYPES.ONSUBMIT
          })}
          validationStrings={{
            patternMismatch: getMessage('shifts.passwords.dont.match')
          }}
        />
        <Input
          readOnly={!this.getState(['newPassword'])}
          type='password'
          label={getMessage('shifts.confirmpassword')}
          placeholder={getMessage('shifts.confirmpassword.placeholder')}
          name='confirm-password'
          required
          pattern={this.getState(['newPassword'])}
          {...this.generateStateMappers({
            stateKeys: ['confirmPassword'],
            loseEmphasisOnFill: true,
            validationType: VALIDATION_TYPES.ONCHANGE
          })}
          validationStrings={{
            patternMismatch: getMessage('shifts.passwords.dont.match')
          }}
        />
        <div className='form-action'>
          <SubmitButton disabled={this.state.submitting}>{getMessage('shifts.form.submitText')}</SubmitButton>
          <button type='button' className='button' onClick={() => this.props.close()}>{getMessage('shifts.form.cancel')}</button>
        </div>
      </Form>
    )
  }
}

export default ResetPassword
