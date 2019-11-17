import React from 'react'
import menuIcon from './hamburger.svg'

export default function NavigationDrawer (props) {
  return (
    <label className='navigationDrawer' htmlFor='sidebar-toggle'>
      <a><img src={menuIcon} alt='menu' /></a>
    </label>
  )
}