import React, { Component } from 'react'
import './style.css'
import { setLocale, getLocale, getSupportedLanguages } from '../../lib/translator'
import { DropDown, DropDownItem } from '../DropDown'
import { withRouter } from 'react-router-dom'
import ArrowIcon from './arrow.svg'

class PublicLanguageSelector extends Component {
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
    let additionalClassName = this.props.className ? this.props.className : ''
    const currentLangText = options.filter(option => option.isoCode === currentLang)[0].language
    return (
      <div className={`PublicLanguageSelector ${additionalClassName}`} >
        <DropDown icon={<img src={ArrowIcon} alt='' />} value={currentLangText}>
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

export default withRouter(PublicLanguageSelector)
