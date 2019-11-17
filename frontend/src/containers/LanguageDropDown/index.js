import React, { Component } from 'react'
import { DropDown, DropDownItem } from '../../components/DropDown'
import icon from './drop-down-arrow.svg'
import { withRouter } from 'react-router-dom'
import { isExtensionEnabled, getExtensionDetails } from '../../lib/auth'
import { getLanguages } from '../../lib/commonlyused'
import API from '../../lib/api'
import './style.css'

const eng = {id: 0, name: 'English', code: 'en'}
const emptyArr = []

class LanguageSelector extends Component {
  constructor (props) {
    super(props)
    this.state = {
      language: eng.code
    }
  }
  changeLanguage (code) {
    if (code) {
      window.localStorage.setItem('dataLang', code)
    }
    const { history, location } = this.props
    history.replace(location.pathname)
  }
  componentDidMount () {
    let currentLang = window.localStorage.getItem('dataLang')
    currentLang && this.setState({language: currentLang})
    const extension = getExtensionDetails('MultiLingualSupport')
    const id = extension && extension.id
    if (id) {
      const api = new API({ url: `/account-service/extension/${id}` })
      api.get().then(response => {
        let availableLangs = [eng]
        let savedLangs = response.data.extension.config.globalConfig.languages
        savedLangs && savedLangs.map((lng, i) => {
          let language = getLanguages().find(lang => lang.code === lng)
          if (language && language.name !== 'english') {
            availableLangs.push({id: i + 1, ...language})
          }
          return null
        })
        this.setState({ availableLangs })
      })
    }
  }
  componentWillMount () {
    if (isExtensionEnabled('MultiLingualSupport')) {
      let allSubmenus = document.querySelectorAll('#menu ul.menu-items li .submenu')
      if (allSubmenus.length) {
        [].forEach.call(allSubmenus, (submenu) => {
          submenu.style.top = '108px'
        })
      }
      let userHoverSubmenu = document.querySelector('.user-hover .submenu')
      if (userHoverSubmenu) {
        userHoverSubmenu.style.top = '108px'
      }
    }
  }

  render () {
    let selectedLanguage = ''
    if (isExtensionEnabled('MultiLingualSupport')) {
      let allSubmenus = document.querySelectorAll('#menu ul.menu-items li .submenu')
      if (allSubmenus.length) {
        [].forEach.call(allSubmenus, (submenu) => {
          submenu.style.top = '108px'
        })
      }
      let userHoverSubmenu = document.querySelector('.user-hover .submenu')
      if (userHoverSubmenu) {
        userHoverSubmenu.style.top = '108px'
      }
      selectedLanguage = (this.state.availableLangs || emptyArr).find(lang => lang.code === this.state.language)
      selectedLanguage = selectedLanguage && selectedLanguage.name
    }
    return (
      isExtensionEnabled('MultiLingualSupport') && <div className='language-selector'>
        <div className='selected-language'>{selectedLanguage || eng.name}</div>
        <DropDown icon={<img src={icon} alt='v' />} drop>
          {(this.state.availableLangs || emptyArr).map(({id, name, code}) => (
            <DropDownItem
              className={code === this.state.language ? 'selected' : ''}
              key={`language${id}`}
              onClick={() => this.changeLanguage(code)}
            >
              {name}
            </DropDownItem>
          ))}
        </DropDown>
      </div>
    )
  }
}

export default withRouter(LanguageSelector)
