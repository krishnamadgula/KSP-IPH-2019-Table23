import React, {Component } from 'react'
import { getMessage } from '../../../lib/translator'
import './style.css'
import ViewIcon from './view-icon.svg'
import { getSession } from '../../../lib/auth'
import { get } from '../../../lib/storage'

class WebsiteLink extends Component {
  constructor (props) {
    super(props)
    this.getSiteUrl = this.getSiteUrl.bind(this)
    this.state = {
      siteUrl: ''
    }
  }

  getSiteUrl () {
    const organization = getSession().organization
    let url = organization && organization.domain
    if (url) {
      let isHttpsEnabled = JSON.parse(get('organization')).httpsEnabled
      let protocol = isHttpsEnabled ? 'https://' : 'http://'
      this.setState({
        siteUrl: protocol + url
      })
    }
  }

  componentDidMount () {
    this.getSiteUrl()
  }

  render () {
    if (this.state.siteUrl) {
      return (
        <a className='WebsiteLink' href={this.state.siteUrl} target='_blank' >
          <div className='link-description'>
            <div className='title-image'>
              <div className='link-title'>{getMessage('menu.item.website-link')} </div>
              <img src={ViewIcon} alt='' />
            </div>
            <div className='link-url text-muted'>{this.state.siteUrl.split('/')[2]}</div>
          </div>
        </a>
      )
    }
    return null
  }
}

export default WebsiteLink
