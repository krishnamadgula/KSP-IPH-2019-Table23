import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { getMessage } from '../../lib/translator'

function createSlugFromName (name) {
  return name.replace(/\s+/g, '-').toLowerCase()
}

function mouseEventListener (event) {
  let receivedElementName = event.target.nodeName
  let hiddenSubmenuUlOffsetHeight = document.querySelector('#menu #hidden-menu .submenu ul') ? parseInt(document.querySelector('#menu #hidden-menu .submenu ul').offsetHeight, 10) : 0
  let hiddenSubmenuUl = document.querySelector('#menu #hidden-menu .submenu ul')
  let hiddenSubmenu = document.querySelector('#menu #hidden-menu .submenu')
  if (receivedElementName === 'LI') {
    if (event.target.querySelector('.submenu ul')) {
      let hoverSubmenuHeight = event.target.querySelector('.submenu ul') ? parseInt(event.target.querySelector('.submenu ul').offsetHeight, 10) : 0
      let item = event.target.querySelector('.submenu ul') ? event.target.querySelector('.submenu ul').cloneNode(true) : null
      if (item && hiddenSubmenuUlOffsetHeight < hoverSubmenuHeight) {
        hiddenSubmenuUl.remove()
        hiddenSubmenu.appendChild(item)
      }
    }
  } else if (receivedElementName === 'A') {
    let parent = event.target.parentElement
    if (parent) {
      let hoverSubmenuHeight = parent.querySelector('.submenu ul') ? parseInt(parent.querySelector('.submenu ul').offsetHeight, 10) : 0
      let item = parent.querySelector('.submenu ul') ? parent.querySelector('.submenu ul').cloneNode(true) : null
      if (item && hiddenSubmenuUlOffsetHeight < hoverSubmenuHeight) {
        hiddenSubmenuUl.remove()
        hiddenSubmenu.appendChild(item)
      }
    }
  }
}

export default class MenuItem extends Component {
  /*
        TODO - It may be easier to use NavLink instead of Link, if we can refactor the html/css to use markup
        such that active class is added on links instead of list. If we can do this, then we can remove the higher
        order component WithRouter from Menu, as that is used just for active links calculation - NavLink directly
        provides this method.

     */
  constructor (props) {
    super(props)
    this.getSubmenu = this.getSubmenu.bind(this)
  }

  getSubmenu (activeText) {
    const {props} = this
    const active = props.active.split('/')
    return (
      <div className={`submenu`}>
        {props.info && <props.info />}
        {<ul>
          {props.subMenu && props.subMenu.map(text =>
            <li className={((props.text === 'user-hover') || (activeText === 'home')) ? (createSlugFromName(text) === active[2]) ? 'active' : '' : (createSlugFromName(props.text) === active[1] && createSlugFromName(text) === active[2]) ? 'active' : ''} key={text}>
              <Link to={'/' + createSlugFromName(text)}>{getMessage(`menu.item.${text}`)}</Link>
            </li>
          )}
        </ul>}
      </div>
    )
  }

  render () {
    const { props } = this
    let text = props.text
    if (!text) {
      text = 'home'
    }
    const className = 'icon-' + createSlugFromName(text)
    const active = props.active.split('/')
    const submenu = this.getSubmenu(text)

    return (
      <li onMouseEnter={mouseEventListener} className={(text === 'user-hover' ? 'user-hover' : '') + (text === 'home' ? 'home-menu' : '') + (createSlugFromName(props.text) === active[1] ? 'active' : '') + ((createSlugFromName(props.text) === 'user') ? ' user' : '') + (((text !== 'user-hover') && (text !== 'home') && (createSlugFromName(props.text) !== 'user')) ? ` ${createSlugFromName(text)}` : '')}>
        <Link className={className} to={'/' + createSlugFromName(props.text)}>{props.text ? getMessage(`menu.item.${props.text}`) : 'home'}</Link>
        {submenu}
      </li>
    )
  }
}
