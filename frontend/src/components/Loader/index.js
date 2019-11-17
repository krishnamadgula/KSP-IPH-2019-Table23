import React from 'react'
import PropTypes from 'prop-types'

import './style.css'

const Loader = function (props) {
  let radiusMapping = {
    'sm': 10,
    'md': 15,
    'lg': 25
  }
  let size = (props.size && (props.size in radiusMapping) ? props.size : 'lg')
  let r = radiusMapping[size]
  return (
    <div className='loader'>
      <svg className={'loader-spinner loader-' + size} width={2 * r} height={2 * r} version='1.1' >
        <circle cx={r} cy={r} r={r - 3} />
      </svg>
    </div>
  )
}

Loader.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

export default Loader
