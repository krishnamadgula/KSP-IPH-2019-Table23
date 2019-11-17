import React from 'react'
import { Input, Select, BaseForm, Phone, VALIDATION_TYPES } from '../../../../components/Form'
import { getMessage } from '../../../../lib/translator'
import deleteIcon from './delete.svg'

import './style.css'

export default class UserShiftForm extends BaseForm {
  constructor (props) {
    super(props)
    this.state.allSelected = false
    this.delete = this.delete.bind(this)
    this.handleSelectAll = this.handleSelectAll.bind(this)
  }

  handleSelectAll (value) {
    let currState = JSON.parse(JSON.stringify(this.state))
    let { values } = currState
    if (value) {
      values.storeIds = (this.props.options.stores || []).map(store => store.id)
      this.props.options.stores && this.setState({values, allSelected: true})
    } else {
      values.storeIds = []
      this.setState({values, allSelected: false})
    }
  }

  componentDidMount () {
    let { state, props } = this
    let shiftStart, shiftEnd
    let { values } = state
    let newState = Object.assign({}, this.state.values)
    if (this.props && this.props.value) {
      shiftStart = this.props.value.shiftStart
      shiftEnd = this.props.value.shiftEnd
    }
    if (shiftStart && shiftEnd) {
      shiftStart = shiftStart.split(':').splice(0, 2).join(':')
      shiftEnd = shiftEnd.split(':').splice(0, 2).join(':')
      newState.shiftStart = shiftStart
      newState.shiftEnd = shiftEnd
    }
    if (values.stores && values.stores.length > 0) {
      let stores = values.stores
      let storeIds = stores.map(store => {
        return store.id
      })
      newState.storeIds = storeIds
    }
    if (values.designation && values.designation) {
      newState.designationId = values.designation.id
    }
    this.setState({
      values: newState
    }, () => {
      if (props.method === 'edit') {
        let currState = JSON.parse(JSON.stringify(this.state))
        let { values } = currState
        let { storeIds } = values
        if (props.options.stores && props.options.stores.every(store => (storeIds || []).find(id => id === store.id))) {
          this.setState({allSelected: true})
        }
      }
    })
    this.stores = this.props.options.multiStoreEnabled && (this.props.options.stores || [])

    this.designationOptions = 
      [{
        text: 'SP',
        value: '1'
      }, {
        text: 'DSP',
        value: '2'
      }, {
        text: 'CI',
        value: '3'
      }, {
        text: 'SI',
        value: '4'
      }]
  }

  delete () {
    this.props.onDelete()
  }
  render () {
    const { SubmitButton, CancelButton } = this.buttons
    const { Form } = this.components
    const { isoCode } = this.props.options
    return (
      <div className={'user-shifts-form'}>
        <Form>
          <div className='flex'>
            <Input
              label={getMessage('shifts.form.name')}
              placeholder={getMessage('shifts.form.name.placeholder')}
              name='name'
              required
              {...this.generateStateMappers({
                stateKeys: ['name'],
                validationType: VALIDATION_TYPES.ONSUBMIT,
                loseEmphasisOnFill: true
              })}
            />
            <Phone
              label={getMessage('shifts.form.phone')}
              placeholder={getMessage('shifts.phone.placeholder')}
              country={isoCode}
              name='phone'
              // Hack. Modify the Phone component for solving this issue
              required={!this.state.values.id}
              {...this.generateStateMappers({
                stateKeys: ['phones', 0, 'phone'],
                loseEmphasisOnFill: true
              })}
            />
          </div>
          <div className='flex'>
            <Input
              label={getMessage('shifts.form.email')}
              placeholder={getMessage('shifts.form.email.placeholder')}
              required
              type='text'
              {...this.generateStateMappers({
                stateKeys: ['emails', 0, 'email'],
                loseEmphasisOnFill: true
              })}
            />
            <Select
              label={getMessage('shifts.designation')}
              placeholder={getMessage('shifts.designation.placeholder')}
              name='designation'
              options={this.designationOptions}
              {...this.generateStateMappers({
                stateKeys: ['designationId'],
                loseEmphasisOnFill: true
              })}
            />
          </div>
          <div className='flex'>
            <Input
              label='Age'
              placeholder='Age'
              required
              type='text'
              {...this.generateStateMappers({
                stateKeys: ['age'],
                loseEmphasisOnFill: true
              })}
            />
          </div>
          <div className={`form-actions ${this.props.method}`}>
            {(this.props.method && this.props.method === 'edit') && <button className='delete-button' type='button' onClick={this.delete}><img src={deleteIcon} alt='delete' /><span>{getMessage('brand.form.deleteText')}</span></button>}
            <CancelButton>{getMessage('shifts.form.cancel')}</CancelButton>
            <SubmitButton>{getMessage('shifts.form.submitText')}</SubmitButton>
          </div>
        </Form>
      </div>
    )
  }
}
