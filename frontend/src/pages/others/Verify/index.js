import React from 'react'
import PublicPage from '../../../containers/PublicPage/index'
import { Link } from 'react-router-dom'
import VerifiedImage from './images/verified.svg'
import './verify.css'

export default function Verify (props) {
  return (
    <PublicPage className='eazy-page'>
      <div className='verify'>
        <img src={VerifiedImage} alt='verified' />
        <header className='header'>
          <h1 className='heading'>Your email has been verified!</h1>
          <h2 className='subheading'>Your account password has been sent to your mobile.</h2>
        </header>
        <Link to='/login' className='button'>Login</Link>
      </div>
    </PublicPage>
  )
}
