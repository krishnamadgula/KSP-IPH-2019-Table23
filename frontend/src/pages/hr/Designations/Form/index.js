import React from 'react'
import { BaseForm, Searchable, Input, VALIDATION_TYPES } from '../../../../components/Form'
import { getMessage } from '../../../../lib/translator'

import deleteIcon from './delete.svg'

export default class DesignationForm extends BaseForm {
  constructor (props) {
    super(props)
    this.delete = this.delete.bind(this)
  }
  delete () {
    this.props.onDelete()
  }

  render () {
    const { SubmitButton, CancelButton } = this.buttons
    const { Form } = this.components
    return (
      <Form className='designation-form'>
        <Input
          type='text'
          label={getMessage('designations.form.name')}
          placeholder={getMessage('designations.form.name.placeholder')}
          name='name'
          required
          {...this.generateStateMappers({
            stateKeys: ['name'],
            validationType: VALIDATION_TYPES.ONSUBMIT,
            loseEmphasisOnFill: true
          })}
        />
        <Searchable
          label={getMessage('designations.form.roles')}
          placeholder={getMessage('designations.form.roles.placeholder')}
          name='roles'
          type='text'
          searchUrl='https://api.myjson.com/bins/9q216'
          valueKey='id'
          searchKey='name'
          multiple
          transformResponse={response => response.data}
          {...this.generateStateMappers({
            stateKeys: ['roles'],
            loseEmphasisOnFill: true
          })}
        />
        <div className={`form-actions ${this.props.method}`} >
          {(this.props.method && this.props.method === 'edit') && <button className='delete-button' type='button' onClick={this.delete}><img src={deleteIcon} alt='delete' /><span>{getMessage('brand.form.deleteText')}</span></button>}
          <CancelButton>{getMessage('designations.form.cancel')}</CancelButton>
          <SubmitButton>{getMessage('designations.form.save')}</SubmitButton>
        </div>
      </Form>
    )
  }
}
