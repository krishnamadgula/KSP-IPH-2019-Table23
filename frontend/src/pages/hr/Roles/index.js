import React, { Component } from 'react'
import ListingPage, { TABLE_ACTIONS } from '../../../containers/ListingPage'
import { Row, Cell } from '../../../components/Table'
import { DropDown, DropDownItem, ICONS } from '../../../components/DropDown'

import RoleForm from './Form'
import RolesFilter from './Filters'

import { getMessage } from '../../../lib/translator'

import EmptyIcon from '../UserShifts/employeeEmpty.svg'
import './style.css'

const EmptyState = {
  icon: EmptyIcon,
  message: getMessage('role.empty.message'),
  actions: ({ onAction }) => (
    <button className='primary button' onClick={() => { onAction(TABLE_ACTIONS.ADD) }}>+ {getMessage('role.add')}</button>
  )
}

const TableProperties = {
  headers: [
    getMessage('role.name'),
    getMessage('role.action')
  ],
  row: ({
    id,
    name,
    editable,
    onAction
  }) => (
    <Row>
      <Cell><span className='role-name' onClick={() => onAction(TABLE_ACTIONS.EDIT, { id })}>{name.toLowerCase()}</span></Cell>
      <Cell>
        {editable && <DropDown icon={<img src={ICONS.VELLIP} alt='⋮' />} >
          <DropDownItem onClick={() => onAction(TABLE_ACTIONS.EDIT, { id })}>
            {getMessage('role.edit')}
          </DropDownItem>
          <DropDownItem onClick={() => onAction(TABLE_ACTIONS.DELETE, { id })}>{getMessage('role.delete')}</DropDownItem>
        </DropDown>}
      </Cell>
    </Row>
  )
}

export default class Roles extends Component {
  render () {
    const { props } = this
    return (
      <ListingPage
        menu={props.menu}
        className='roles-page'
        addHeading={getMessage('role.add.heading')}
        editHeading={getMessage('role.edit.heading')}
        title={getMessage('role.heading')}
        api={{
          url: '/account-service/role',
          transform: response => response.data.role
        }}
        tableProperties={TableProperties}
        emptyState={EmptyState}
        headerActions={({ onAction }) => <button className='primary button' onClick={() => { onAction(TABLE_ACTIONS.ADD) }}>{`+ ${getMessage('role.add')}`}</button>}
        form={{
          component: RoleForm
        }}
        filters={{
          component: RolesFilter,
          transformSubmit: formData => {
            let modifiedData = Object.assign({}, formData)
            if (modifiedData.name) {
              modifiedData.name = modifiedData.name.name
            }
            return modifiedData
          }
        }}
      />
    )
  }
}
