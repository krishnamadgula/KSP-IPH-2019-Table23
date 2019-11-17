import React from 'react'
import PublicPage from '../../../containers/PublicPage/index'

export default function MissingPage (props) {
  return (
    <PublicPage>
      <div className='box'>
        <h1 className='heading'>Missing Page</h1>
        <h2 className='subheading'>Are you lost?</h2>
      </div>
    </PublicPage>
  )
}
