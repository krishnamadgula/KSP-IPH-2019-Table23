import React, {Component} from 'react'
import Upload from '../../Form/Inputs/Upload'
import Form, { Input } from '../../../components/Form'
import './style.css'

class EditImageWithText extends Component {
  render () {
    return (
      <div className='EditImageWithText'>
        <Form primary='save cancel'>
          <div className='file'>
            <Upload label='Image' name='image' placeholder='Click here to upload or drag your image' />
          </div>
          <div className='text'>
            <Input
              type='text'
              label='Title'
              name='title'
              placeholder='Enter your title here'
              value={this.props.title}
              onChange={this.props.onTitleChange} />
            <Input
              type='text'
              label='Description'
              name='description'
              value={this.props.description}
              onChange={this.props.onDescriptionChange}
              placeholder='Enter your description here' />
            <Input
              type='text'
              label='Link'
              name='link'
              value={this.props.link}
              onChange={this.props.onLinkChange}
              placeholder='Enter your link here' />
          </div>
        </Form>
      </div>
    )
  }
}
export default EditImageWithText
