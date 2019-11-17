import React, { Component } from 'react'
import './style.css'

export default class Tabs extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeTab: props.default || props.active || 0
    }
  }

  componentWillReceiveProps (newProps) {
    if (Number.isInteger(newProps.active) && newProps.active !== this.state.activeTab) {
      this.setState({
        activeTab: newProps.active
      })
    }
  }

  render () {
    const props = this.props
    const { nameKey, valueKey } = props
    const state = this.state
    const align = props.align ? props.align : ''
    const component = (nameKey && valueKey)
      ? <div className={'tabs ' + align}>
        {props.items.map((item) => {
          return (
            <a key={item[valueKey]} className={((state.activeTab === item[valueKey]) ? 'active ' : '') + (state.activeTab - 1 === item[valueKey] ? 'previous ' : '') + 'tab'} onClick={e => {
              if (this.state.activeTab !== item[valueKey]) {
                this.setState({
                  activeTab: item[valueKey]
                })
                props.onClick && props.onClick(item[valueKey])
              }
            }}>{item[nameKey]}</a>
          )
        })}
      </div>
      : <div className={'tabs ' + align}>
        {props.items.map((item, index) => {
          return (
            <a key={index} className={((state.activeTab === index) ? 'active ' : '') + (state.activeTab - 1 === index ? 'previous ' : '') + 'tab'} onClick={e => {
              if (this.state.activeTab !== index) {
                this.setState({
                  activeTab: index
                })
                props.onClick && props.onClick(index)
              }
            }}>{item}</a>
          )
        })}
      </div>
    return component
  }
}
