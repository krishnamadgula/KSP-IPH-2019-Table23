import React from 'react'

import './style.css'
import leftArrow from './icon-left-arrow.svg'
import rightArrow from './icon-right-arrow.svg'

/* TODO: Logic to selectively show page numbers if there are too many pages */

const noop = () => {}

export default function Pagination (props) {
  let { total, current } = props
  if (!Number.isInteger(total) || !Number.isInteger(current)) {
    return null
  }
  let pageNumbers = Array(total).fill(0).map((_, index) => index + 1)
  let spliced = pageNumbers.splice(1, current - 3)
  if (spliced.length) {
    pageNumbers.splice(1, 0, '...')
  }
  spliced = pageNumbers.splice(5, pageNumbers.length - 6)
  if (spliced.length) {
    pageNumbers.splice(5, 0, '...')
  }
  let leftDisabled = (current === 1)
  let rightDisabled = (current === total)
  let clickHandler = props.onSelect || noop
  let ellipsis = <span>&#8230;</span>

  let pageNumberNotEditable = Boolean(props.pageNumberNotEditable) // Props for unwanted page number edit

  const visitPageDirectly = (e) => {
    if (e.which === 13) {
      if (e.target.value >= 1 && e.target.value <= total) {
        clickHandler(e.target.value)
      }
    }
  }

  return (
    <div className='pagination'>
      <a className={'pagination-button' + (leftDisabled ? ' pagination-button-disabled' : '')}
        onClick={!leftDisabled ? () => { clickHandler(current - 1) } : noop}
      >
        <img className='navigation-icon' src={leftArrow} alt='Previous' />
      </a>
      {pageNumbers.map((number, index) => (
        <a key={Number.isFinite(number) ? number : 'hellip' + String(index)}
          className={'pagination-button' +
            (current === number ? ' pagination-button-highlighted' : '') +
            (Number.isFinite(number) ? '' : ' pagination-button-disabled')
          }
          onClick={pageNumberNotEditable ? (Number.isFinite(number) ? () => { clickHandler(number) } : null)
            : (Number.isFinite(number) && current !== number ? () => { clickHandler(number) } : null)}
        >
          {
            Number.isFinite(number)
              ? (
                number === current && !pageNumberNotEditable
                  ? <input className='current-page-number' type='number' defaultValue={number} min={1} max={total} onKeyDown={visitPageDirectly} />
                  : number
              )
              : ellipsis
          }
        </a>
      ))}
      <a className={'pagination-button' + (rightDisabled ? ' pagination-button-disabled' : '')}
        onClick={!rightDisabled ? () => { clickHandler(current + 1) } : noop}
      >
        <img className='navigation-icon' src={rightArrow} alt='Next' />
      </a>
    </div>
  )
}
