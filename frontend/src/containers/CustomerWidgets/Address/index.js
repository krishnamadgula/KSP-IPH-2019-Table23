import React, { Component } from 'react'
import { Popup } from '../../../components/Popup'
import { BaseForm } from '../../../components/Form'
import Map from '../AddressMap'
import './style.css'

class AddressForm extends BaseForm {
  constructor (props) {
    super(props)
    this.state = {
      formError: ''
    }
    this.showError = this.showError.bind(this)
  }

  showError (error) {
    this.setState({
      formError: error
    })
  }

  render () {
    let { Form } = this.components
    const { address } = this.props
    return (
      <div className='address-form'>
        <Form>
          <p>{this.props.address}</p>
          {this.state.formError && <div className='form-error'>{this.state.formError}</div>}
          <Map address={address}
            showError={this.showError}
            />
        </Form>
      </div>
    )
  }
}

class Address extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showForm: false
    }
    this.showPopup = this.showPopup.bind(this)
    this.hidePopup = this.hidePopup.bind(this)
  }

  showPopup () {
    this.setState({
      showForm: true
    })
  }

  hidePopup () {
    this.setState({
      showForm: false
    })
  }

  render () {
    return (
      <div className='CustomerAddressWidget'>
        <Popup show={this.state.showForm}
          className='editPopup map-address'
          heading='Address'
          close={this.hidePopup}
        >
          <AddressForm address={this.props.address} />
        </Popup>
        <button
          className='address-icon'
          alt='address'
          onClick={this.showPopup}
        />
      </div>
    )
  }
}
Address.defaultProps = {
  address: []
}

export default Address
