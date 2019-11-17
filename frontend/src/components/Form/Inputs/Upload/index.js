import React, { Component } from 'react'
import { Popup } from '../../../Popup'
import API from '../../../../lib/api'
import './style.css'

function getValidationObj (props, image) {
  let valueMissing = props.required && (!image)
  let result = {
    valueMissing,
    valid: !valueMissing
  }
  return result
}

class Upload extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showImagePreviewModal: false,
      fileUploading: false,
      file: '',
      fileBlob: '',
      showError: false,
      errorMessage: ''
    }
    this.readURL = this.readURL.bind(this)
    this.handleModalClose = this.handleModalClose.bind(this)
    this.confirmFileUpload = this.confirmFileUpload.bind(this)
    this.runValidation = this.runValidation.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  runValidation (image) {
    this.props.onValidation && this.props.onValidation(getValidationObj(this.props, image))
  }

  componentDidMount () {
    this.runValidation(this.props.value)
  }

  handleBlur (e) {
    e.preventDefault()
    this.props.onBlur && this.props.onBlur()
  }

  readURL (e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      let reader = new window.FileReader()
      reader.onloadend = () => {
        let state = {
          fileBlob: reader.result,
          showImagePreviewModal: true,
          file: file
        }
        // file validations
        if (file.size > this.props.maxFileSize || !this.props.accept.split(',').includes(file.type)) {
          state['showError'] = true
          state['errorMessage'] = (file.size > this.props.maxFileSize) ? this.props.validationStrings.fileSizeExeeded
            : this.props.validationStrings.invalidFileType
        } else {
          state['showError'] = false
        }
        this.setState(state)
      }
      reader.readAsDataURL(file)
    }
  }

  handleClick () {
    this.uploadInputRef.value = null
  }

  handleModalClose () {
    this.setState({
      showImagePreviewModal: false,
      showError: false
    })
  }

  confirmFileUpload (e) {
    e.preventDefault()
    this.setState({
      fileUploading: true
    })
    const file = this.state.file
    let data = new window.FormData()
    data.append('imageUpload', file)
    if (this.props.resize === false) {
      data.append('resize', false)
    }
    const api = new API({ url: '/media-service/image-upload' })
    api.post(data).then(
      (response) => {
        this.props.onChange(response.data.imageUpload.url)
        this.setState({
          showImagePreviewModal: false,
          showError: false,
          fileUploading: false
        })
        this.runValidation(response.data.imageUpload.url)
      },
      (error) => {
        if (error.code === 401) {
          throw error
        }
        this.setState({ showError: true, errorMessage: error.message, fileUploading: false })
      })
  }

  render () {
    const { name, required, placeholder, value: imageUrl, accept } = this.props
    return (
      <div className='Upload'>
        <Popup
          heading='Confirm Image'
          show={this.state.showImagePreviewModal}
          close={this.handleModalClose}
        >
          {this.state.showError && <div className='imageModal form-error'>{this.state.errorMessage}</div>}
          <img className='image-preview-popup' id={name} src={this.state.fileBlob} alt='' />
          <div className='actions'>
            <button
              className='button'
              onClick={this.handleModalClose}
              disabled={this.state.fileUploading}>Close</button>
            <button
              className='primary button'
              onClick={this.confirmFileUpload}
              disabled={this.state.fileUploading || this.state.showError}>
              {this.state.fileUploading ? '...' : 'Confirm'}
            </button>
          </div>
        </Popup>
        <div className='input'>
          <input
            type='file'
            id={name}
            name={name}
            required={required}
            onChange={this.readURL}
            accept={accept}
            ref={node => { this.uploadInputRef = node }}
            onClick={this.handleClick}
          />
          <div className='image-upload-div'>
            {imageUrl ? (
              <img id={name} src={imageUrl} alt='' />
            ) : (
              <div className='file-label'>{placeholder || 'Click here to upload or drag your logo'}</div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

Upload.defaultProps = {
  accept: 'image/jpeg,image/jpg,image/png',
  maxFileSize: '20971520'
}

export default Upload
