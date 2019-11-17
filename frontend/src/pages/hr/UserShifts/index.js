import React, { Component } from 'react'
import ListingPage, { TABLE_ACTIONS } from '../../../containers/ListingPage'
import { Row, Cell } from '../../../components/Table'
import { DropDown, DropDownItem, ICONS } from '../../../components/DropDown'
import Image from '../../../components/Image'
import { Dialog, Popup } from '../../../components/Popup'
import customerImagePlaceholder from './customer-image-placeholder.svg'

import API from '../../../lib/api'
import { getMessage } from '../../../lib/translator'
import { isExtensionEnabled, hasPermissions } from '../../../lib/auth'

import UserShiftsForm from './Form'
import ResetPasswordForm from './Form/ResetPassword'

import './style.css'

import emptyIcon from './employeeEmpty.svg'
import { get } from '../../../lib/storage'

const emptyState = {
  icon: emptyIcon,
  message: getMessage('shifts.empty.message'),
  actions: ({ onAction }) => (
    <button className='primary button' onClick={() => { onAction(TABLE_ACTIONS.ADD) }}>+ {getMessage('employee.add')}</button>
  )
}

const checkIn = (id) => {
  const api = new API({ url: '/account-service/attendance' })
  return api.post({ userId: id }).then(
    response => {
      response = response.data.attendance
      return response
    },
    error => {
      if (error.code === 401) {
        throw error
      }
      return error
    }
  )
}

const checkOut = (id, userId) => {
  const api = new API({ url: `/account-service/attendance/${id}` })
  return api.put({ userId: userId }).then(
    response => {
      response = response.data.attendance
      return response
    },
    error => {
      if (error.code === 401) {
        throw error
      }
      return error
    }
  )
}

class TableActions extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showReset: false,
      showSuccess: false
    }
  }

  render () {
    const { onAction, id, name } = this.props
    const { showReset, showSuccess } = this.state
    return (
      <React.Fragment>
        {showSuccess && <Dialog
          className='success'
          show={this.state.showSuccess}
          title={getMessage('shifts.reset.success.title')}
          information={getMessage('shifts.reset.success.information')}
          closeText={getMessage('shifts.reset')}
          close={() => this.setState({ showSuccess: false })}
        />}
        {showReset && <Popup
          show={this.state.showReset}
          heading={`${getMessage('shifts.reset.title')} ${name}`}
          close={() => this.setState({ showReset: false })}
        >
          <ResetPasswordForm
            id={id}
            onSuccess={() => this.setState({ showReset: false, showSuccess: true })}
            close={() => this.setState({ showReset: false })} />
        </Popup>}
        <DropDown icon={<img src={ICONS.VELLIP} alt='⋮' />} >
          <DropDownItem onClick={() => onAction(TABLE_ACTIONS.EDIT, { id })}>
            {getMessage('shifts.edit')}
          </DropDownItem>
          <DropDownItem onClick={() => this.setState({ showReset: true })}>
            {getMessage('shifts.resetpassword')}
          </DropDownItem>
          {hasPermissions('account', 'employee', 'delete') && <DropDownItem onClick={() => onAction(TABLE_ACTIONS.DELETE, { id })}>
            {getMessage('shifts.delete')}
          </DropDownItem>}
        </DropDown>
      </React.Fragment>
    )
  }
}

const tableProperties = {
  headers: [
    getMessage('shifts.header.name'),
    'Email',
    'Phone',
    getMessage('shifts.header.actions')
  ],
  row: ({
    id,
    name,
    shiftStart,
    shiftEnd,
    imageUrl,
    weeklyOff,
    phones: [phone, ...otherPhones],
    emails: [email, ...otherEmails],
    designation,
    isCheckedIn,
    attendance,
    stores,
    onAction
  }) => (
    <Row>
      <Cell className='column-user-name'>
        <Image src={imageUrl || customerImagePlaceholder} size='sm' />
        <div className='user-details'>
          <div className='user-name' onClick={() => onAction(TABLE_ACTIONS.EDIT, { id })} >{name}</div>
          {designation && designation.name && <small className='text-muted'>{designation.name}</small>}
        </div>
      </Cell>
      <Cell className='user-off-days'>
        +91 - 9876543210
      </Cell>
      <Cell className='user-timings'>
        sample@gmai.com
      </Cell>
      <Cell>
        <div className='table-actions'>
          <TableActions
            id={id}
            onAction={onAction}
            name={name}
          />
        </div>
      </Cell>
    </Row>
  )
}

export default class UserShifts extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showFilterAction: false
    }
  }

  componentDidMount () {
    this.api = new API({ url: '/account-service/country' })
    this.api.get().then(
      response => {
        const isoCode = response.data.country.isoCode
        this.setState({
          isoCode: isoCode
        })
      }
    )
    this.designationApi = new API({ url: '/account-service/designation' })
    this.designationApi.get({ paginated: 'false' }).then(
      response => {
        let designations = response.data.designation
        this.setState({
          designations
        })
      }
    )
    if (isExtensionEnabled('MultiStoreSupport')) {
      this.setState({
        stores: JSON.parse(get('stores'))
      })
    }
  }

  componentWillUnmount () {
    this.api && this.api.cancel()
    this.storesApi && this.storesApi.cancel()
    this.designationApi && this.designationApi.cancel()
  }
  render () {
    let { props } = this
    return (
      <ListingPage
        menu={props.menu}
        modalClassName='shifts-form'
        className='user-shifts-page'
        addHeading={getMessage('employee.add')}
        editHeading={getMessage('shifts.edit.heading')}
        title={getMessage('shifts.heading')}
        api={{
          url: '/account-service/employee',
          transform: response => response.data.employee
        }}
        form={{
          component: UserShiftsForm,
          allowDelete: true,
          options: {
            multiStoreEnabled: isExtensionEnabled('MultiStoreSupport'),
            stores: this.state && this.state.stores,
            isoCode: this.state && this.state.isoCode,
            designations: this.state && this.state.designations
          },
          transformSubmit: formData => {
            let params = Object.assign({}, formData)
            if (params.phones) {
              params.phone = params.phones[0].phone
              delete params.phones
            }
            if (params.emails) {
              params.email = params.emails[0].email
              delete params.emails
            }
            params.hasToolAccess = 1
            if (params.designationId) {
              let selectedDesignation = this.state.designations.filter(des => Number(des.id) === Number(params.designationId))[0]
              if (selectedDesignation.timingType === 'FLEXI') {
                delete params.shiftStart
                delete params.shiftEnd
              } else {
                params.shiftStart = params.shiftStart + ':00'
                params.shiftEnd = params.shiftEnd + ':00'
              }
            }
            return params
          },
          transformResponse: response => {
            let employee = response.data.employee
            let newEmployee = Object.assign({}, employee)
            if (newEmployee.store.length > 0) {
              newEmployee.storeIds = (newEmployee.store || []).map(store => (
                {
                  text: store.name,
                  value: store.id
                }
              ))
            }
            return newEmployee
          }
        }}
        headerActions={({ onAction }) => <button className='primary button' onClick={() => { onAction(TABLE_ACTIONS.ADD) }}>{`+ ${getMessage('employee.add')}`}</button>}
        emptyState={emptyState}
        tableProperties={tableProperties}
      />
    )
  }
}

export {
  checkIn,
  checkOut
}
