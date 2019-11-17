import React from 'react'
import { BaseForm, Input, Select, CheckboxGroup } from '../../Form'
import './style.css'

class OptionsForm extends BaseForm {
  constructor (props) {
    super(props)
  }

  render () {
    const { SubmitButton, CancelButton } = this.buttons
    const { Form } = this.components
    return (
      <Form>
        <Input
          label='title'
          placeholder='enter your title here'
        />
        <Select
          label='categories'
          placeholder='select categories'
        />
        <Select
          label='brands'
          placeholder='Select Brands'
        />
        <Select
          label='sort by'
        />
        <CheckboxGroup
          label=''
          options={[
            {
              text: 'Lol',
              value: 'a'
            },
            {
              text: 'Lola',
              value: 'b'
            }
          ]}
        />
        <SubmitButton disabled={this.state.submitting}>submit</SubmitButton>
        <CancelButton disabled={this.state.submitting}>cancel</CancelButton>
      </Form>
    )
  }
}

export default function EditProductCollection (props) {
  console.log(props.data)
  return (
    <div>
      <OptionsForm />
    </div>
  )
}
