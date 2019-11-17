import React, { Component } from 'react'
import './menu.css'
import MenuItem from './menuItem'
import { withRouter } from 'react-router'
import NavigationDrawer from './NavigationDrawer'
import { UserInfo } from './UserActions'
import { GIT_HASH, GIT_TAG } from '../../config/app'
import {get, set} from './../../lib/storage'
import {UserActions} from './UserActions'
import Notification from './Notification'

class Menu extends Component {
  componentDidMount () {
    const el = document.querySelector('.menu-items')
    const sidebar = document.querySelector('.sidebar-content')
    const activeLi = document.querySelector('.sidebar-content ul.menu-items>li.active')
    el.addEventListener('mouseover', (e) => {
      if (e.target.className === 'menu-items') {
        if (get('zopsmart-menu-collapse') === 'collapse-out') {
          sidebar.classList.toggle('shrink')
        } else {
          activeLi && activeLi.classList.toggle('showSubmenu')
        }
      }
    })
    el.addEventListener('mouseout', (e) => {
      if (e.target.className === 'menu-items') {
        if (get('zopsmart-menu-collapse') === 'collapse-out') {
          sidebar.classList.toggle('shrink')
        } else {
          activeLi && activeLi.classList.toggle('showSubmenu')
        }
      }
    })
  }
  render () {
    const activeText = this.props.location.pathname.split('/')[1]
    const activeSubMenu = this.props.items && this.props.items[activeText]
    const hoverSubmenuInfo = (activeText === 'user') ? UserInfo : null
    const { props } = this
    const menu = Object.keys(props.items).map(key => {
      const subMenuInfo = (key === 'user') ? UserInfo : null
      return <MenuItem text={key} subMenu={props.items[key]} key={key} active={props.location.pathname} info={subMenuInfo} />
    })

    const MENU_KEY = 'zopsmart-menu-collapse'

    return (
      <div id='menu'>
        <input
          id='sidebar-toggle'
          type='checkbox'
          defaultChecked={get(MENU_KEY) !== null ? get(MENU_KEY) === 'collapse-in' && window.innerWidth >= 1024 : window.innerWidth >= 1024}
          onClick={(e) => {
            set(
              MENU_KEY,
              e.target.checked ? 'collapse-in' : 'collapse-out'
            )
          }}
        />
        <div className='sidebar-content'>
          <ul className='menu-items' >
            <MenuItem text='' subMenu={activeSubMenu} active={props.location.pathname} info={hoverSubmenuInfo} />
            {menu}
          </ul>
          <div id='hidden-menu'><MenuItem text='' subMenu={activeSubMenu} active={props.location.pathname} info={hoverSubmenuInfo} />
          </div>
          <div className='build-version'>{GIT_TAG || GIT_HASH }</div>
          <div className='accountInfo'>
            <Notification />
            {/* <LanguageSelector /> */}
            <UserActions active={props.location.pathname} userMenu={props.items.user} />
            <ul><MenuItem active={props.location.pathname} subMenu={activeSubMenu} text='user-hover' info={hoverSubmenuInfo} /></ul>
          </div>
          {/* <div id='store-selector'>
            {props.showLanguageDropDown && <LanguageDropDown />}
            <ul><MenuItem active={props.location.pathname} subMenu={activeSubMenu} text='user-hover' info={hoverSubmenuInfo} /></ul>
          </div> */}
        </div>
      </div>
    )
  }
}

const MenuWithRouter = withRouter(Menu) // Using Higher-order component to add router properties like location.

export default MenuWithRouter

export { NavigationDrawer }
