import React, { Component } from 'react'
import { DropDown, DropDownItem } from '../../DropDown'
import { Link, Redirect } from 'react-router-dom'
import { getMessage } from '../../../lib/translator'
import { getSession, saveSession, isEnterprise } from '../../../lib/auth'
import API from '../../../lib/api'
import userImage from '../images/customer-image-placeholder.svg'
import { Upload } from '../../Form'

import './style.css'

function UserActions (props) {
  const className = (props.active.split('/')[1] === 'user') ? 'active' : ''
  const user = getSession().user
  const enterprise = isEnterprise()
  if (!user) {
    return <Redirect to='/user/logout' />
  }
  let styles = {}
  if (user.imageUrl) {
    styles = {
      backgroundImage: `url(${user.imageUrl})`,
      backgroundSize: '28px'
    }
  }

  return (
    <div style={styles} className={`UserActions icon-profile-image menu-toggle-container ${className} `}>
      <DropDown>
        {props.userMenu && (props.userMenu.length > 1) && <DropDownItem><Link to={enterprise && (props.userMenu.indexOf('change-password') > -1) ? '/user/change-password' : '/user'}>{getMessage('menu.item.my-account')}</Link></DropDownItem>}
        <DropDownItem><Link to='/user/logout'>{getMessage('menu.item.logout')}</Link></DropDownItem>
      </DropDown>
    </div>
  )
}

class UserInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: false
    }
    this.saveUser = this.saveUser.bind(this)
  }
  saveUser (value, error) {
    if (error) {
      console.error(error)
    }
    const userAPI = new API({url: '/account-service/me'})
    userAPI.put({
      imageUrl: value
    })
      .then(
        (response) => {
          saveSession({
            user: response.data.user
          })
          this.setState({
            showModal: false
          })
        },
        (error) => { console.error(error) }
      )
  }
  render () {
    const user = getSession().user
    if (!user) {
      return <Redirect to='/user/logout' />
    }
    const email = user && user.emails && !!user.emails.length && user.emails[0].email
    return (
      <div className='submenu-info userinfo'>
        <div className='userinfo-image'>
          <img src={user.imageUrl || userImage} width='110' height='110' alt='Avatar' />
          <label htmlFor='profile-image-input' className='userinfo-image-edit' />
          <Upload
            name='profile-image-input'
            onChange={this.saveUser}
          />
        </div>
        <div className='userinfo-name'>{user.name}</div>
        {email && <div className='userinfo-email'>{email}</div>}
      </div>
    )
  }
}

export {
  UserActions,
  UserInfo
}
