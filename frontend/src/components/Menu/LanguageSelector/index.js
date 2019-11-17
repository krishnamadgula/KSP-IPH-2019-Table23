import React, { Component } from 'react'
import { DropDown, DropDownItem } from '../../DropDown'
import { setLocale, getLocale, getSupportedLanguages, getMessage } from '../../../lib/translator'
import './style.css'
import { withRouter } from 'react-router-dom'

class LanguageSelector extends Component {
  changeLanguage (value) {
    setLocale({
      language: value
    })
    const { history, location } = this.props
    history.replace(location.pathname)
  }

  render () {
    let currentLang = getLocale()['language']
    let options = getSupportedLanguages()
    const dropdownHeading = <div className='language-header'>{getMessage('menu.selectLanguage.heading')}</div>

    return (
      <div className='LanguageSelector icon-language menu-toggle-container'>
        <DropDown dropdownHeading={dropdownHeading}>
          <div>
            {options.map((option, index) => (
              <DropDownItem key={index} className={(option.isoCode === currentLang) ? 'selected' : ''} onClick={this.changeLanguage.bind(this, option.isoCode)}>{option.language}</DropDownItem>
            ))}
          </div>
        </DropDown>
      </div>
    )
  }
}
export default withRouter(LanguageSelector)
