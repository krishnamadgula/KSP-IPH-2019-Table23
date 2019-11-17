import React, { Component } from 'react'
import debounce from 'lodash.debounce'
import './style.css'
import img from './image.png'

export default class extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeSlide: props.data.activeIndex || 0
    }
    this.slideElements = []
    this.handleResize = debounce(this.handleResize.bind(this), 400)
  }

  slideTo (slideIndex) {
    this.setState({
      activeSlide: slideIndex
    })
  }
  handleResize () {
    this.setState(this.state)
  }

  componentDidMount () {
    this.slideTo(this.state.activeSlide)
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize)
  }

  componentWillReceiveProps (newProps) {
    this.setState({
      activeSlide: newProps.data.activeIndex
    })
  }

  render () {
    const { state, props, slideElements } = this
    if (!props.data.images) {
      return (
        <div>
          <img src={img} alt='' />
        </div>
      )
    }
    const slides = props.data.images
    const slideAmount = slideElements.slice(0, state.activeSlide).reduce((width, currentSlide) => width + currentSlide.offsetWidth, 0)
    const slideStyles = {
      transform: `translate3d(${-1 * slideAmount}px, 0, 0)`
    }
    return (
      <div className='Imageslideshow'>
        <div className='slides' style={slideStyles}>
          {slides.map((slide, index) => {
            return (
              <div ref={el => { slideElements[index] = el }} key={index} className={((Number(state.activeSlide) === index) ? 'active ' : '') + 'slide'}>
                <img src={slide.imageUrl} alt='' />
              </div>
            )
          })}
        </div>
        <div className='control'>
          {slides.map((slide, index) => {
            return (
              <span className={((Number(state.activeSlide) === index) ? 'active ' : '') + 'bullet'} key={index} onClick={() => {
                this.slideTo(index)
              }} />
            )
          })}
          {/* <button disabled={Number(state.activeSlide) === 0} onClick={(e) => {
            this.slideTo(state.activeSlide - 1)
          }}>prev</button>
          <button disabled={Number(state.activeSlide) === slideElements.length - 1} onClick={(e) => {
            this.slideTo(state.activeSlide + 1)
          }}>next</button> */}
        </div>
        <div>
          {slides.map((slide, index) => (
            <div key={index}>
              <h2>{slide.text}</h2>
              <h3>{slide.subtitle}</h3>
            </div>
          )
          )}
        </div>
      </div>
    )
  }
}
