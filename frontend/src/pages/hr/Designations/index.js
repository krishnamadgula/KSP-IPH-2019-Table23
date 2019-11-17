import React from 'react'
import { Link } from 'react-router-dom'
import ListingPage, { TABLE_ACTIONS } from '../../../containers/ListingPage'
import { Row, Cell } from '../../../components/Table'
import { DropDown, DropDownItem, ICONS } from '../../../components/DropDown'

import EmptyIcon from './designation.svg'
import DesignationForm from './Form'
import './style.css'

import { getMessage } from '../../../lib/translator'

const EmptyState = {
  icon: EmptyIcon,
  message: getMessage('designations.empty.message'),
  actions: ({ onAction }) => <button className='primary button' onClick={() => { onAction(TABLE_ACTIONS.ADD) }}>+ {getMessage('designations.add')}</button>
}

const tableProperties = () => {
  return {
    headers: [
      getMessage('designations.header.name'),
      'Roles',
      getMessage('designations.header.actions')
    ],
    row: ({ id, name, roles, onAction }) => (
      <Row>
        <Cell><div className='designation-name' onClick={() => onAction(TABLE_ACTIONS.EDIT, { id })} ><span>{name}</span></div></Cell>
        <Cell>
          {roles && roles.map(role => role.name).join(', ')}
        </Cell>
        <Cell className='designation-actions'>
          <DropDown icon={<img src={ICONS.VELLIP} alt='⋮' />}>
            <DropDownItem onClick={() => { onAction(TABLE_ACTIONS.EDIT, { id }) }}>{getMessage('designations.edit')}</DropDownItem>
            <DropDownItem onClick={() => onAction(TABLE_ACTIONS.DELETE, { id })}>{getMessage('designations.delete')}</DropDownItem>
            <DropDownItem><Link to={`/employees?designationId=${id}`}>{getMessage('designations.view.employees')}</Link></DropDownItem>
          </DropDown>
        </Cell>
      </Row>
    )
  }
}

export default class Designations extends React.Component {
  render () {
    return (
      <ListingPage
        menu={this.props.menu}
        className='designations-page'
        title={getMessage('designations.title')}
        api={{
          url: '/account-service/designation',
          transform: response => response.data.designation
        }}
        emptyState={EmptyState}
        tableProperties={tableProperties()}
        headerActions={({ onAction }) => (
          <button className='primary button' onClick={() => { onAction(TABLE_ACTIONS.ADD) }}>+ {getMessage('designations.add')}</button>
        )}
        addHeading={getMessage('designations.addheader')}
        editHeading={getMessage('designations.editheader')}
        form={{
          component: DesignationForm,
          allowDelete: true,
          transformSubmit: formData => {
            let result = Object.assign({}, formData)
            if (formData.manager === '' || formData.manager === null) {
              result.managerId = ''
            } else if (formData.manager) {
              result.managerId = formData.manager.id
            }
            delete result.manager

            if (formData.roles) {
              let roleIds = formData.roles.map(role => role.id)
              result.roleIds = roleIds
              delete result.roles
            }
            return result
          }
        }}
      />
    )
  }
}
