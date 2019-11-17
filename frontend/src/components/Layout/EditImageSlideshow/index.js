import React from 'react'
import { BaseForm, Input, Upload } from '../../../components/Form'
import Tabs from '../../../components/Tabs'
import './style.css'

class ConfigForm extends BaseForm {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <form className='form'>
        <div className='form-sections'>
          <div className='form-section'>
            <Upload
              label='image'
              placeholder='click here to upload or drag your banners'
              onChange={e => {
                console.log(e)
              }} />
          </div>
          <div className='form-section'>
            <Input
              label='text'
              placeholder='enter your description here' />
            <Input
              label='link'
              placeholder='enter your link' />
          </div>
        </div>
      </form>
    )
  }
}

export default (props) => {
  console.log(props.data)
  const slides = props.data.images
  const currentSlide = props.currentSlide
  return (
    <div>
      <Tabs
        items={slides.map((slide, index) => `slide ${index + 1}`)}
        onClick={e => {
          props.onChange(e)
        }} />
      <div className='EditImageslideshow'>
        <ConfigForm />
      </div>
    </div>
  )
}
