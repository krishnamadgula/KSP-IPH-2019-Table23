import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import ListingPage from './index'
import AuthenticatedPage from '../AuthenticatedPage'
import Loader from '../../components/Loader'
import API from '../../lib/api'
import { getMessage } from '../../lib/translator'
import { Dialog } from '../../components/Popup'

class FormContainer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      data: null,
      errorDialog: {
        shown: false,
        message: ''
      },
      notFoundError: null
    }
    if (props.url) {
      this.api = new API({
        url: this.props.url + (this.props.resourceId ? '/' + this.props.resourceId : '')
      })
    }
    this._transformResponse = response => response

    /* Default hooks */
    // Method to extract data from the API call made
    this._transformResponse = response => response
    this._transformSubmit = form => form

    /* Hook overrides */
    if (props.transformResponse) {
      this._transformResponse = props.transformResponse
    }
    if (props.transformSubmit) {
      this._transformSubmit = props.transformSubmit
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.hideErrorDialog = this.hideErrorDialog.bind(this)
  }
  componentDidMount () {
    if (this.api && this.props.resourceId) {
      this.setState({
        loading: true
      })
      let params = this.props.apiParams
      this.api.get(params).then((response) => {
        this.setState({
          data: this._transformResponse(response)
        }, () => {
          this.setState({
            loading: false
          })
        })
      }).catch(error => {
        if (error.code === 404) {
          this.setState({
            notFoundError: error.message,
            loading: false
          })
        } else {
          throw error
        }
      })
    }
  }
  handleSubmit (data) {
    this.setState({loading: true})
    let api = new API({
      url: this.props.url + (this.props.resourceId ? '/' + this.props.resourceId : '')
    })
    let method = (this.props.resourceId ? 'put' : 'post')
    let { overwriteWithApiParams } = this.props
    let dataToSubmit = overwriteWithApiParams === false ? Object.assign({}, this.props.apiParams, this._transformSubmit(data)) : Object.assign({}, this._transformSubmit(data), this.props.apiParams)
    // let dataToSubmit = Object.assign(this._transformSubmit(data), this.props.apiParams)
    Object.assign(this._transformSubmit(data), this.props.apiParams)
    api[method](dataToSubmit).then(
      (response) => { this.props.afterSubmit && this.props.afterSubmit(response) },
      (error) => {
        if (error.code === 400) {
          const errorDialog = { ...this.state.errorDialog }
          errorDialog.shown = true
          errorDialog.message = error.message.split(':').slice(1).join(':') || error.message
          this.setState({
            errorDialog,
            loading: false
          })
        } else {
          throw error
        }
      }
    )
  }
  handleDelete () {
    let api = new API({
      url: this.props.url + (this.props.resourceId ? '/' + this.props.resourceId : '')
    })
    api.delete().then(this.props.afterSubmit)
  }

  hideErrorDialog () {
    const errorDialog = { ...this.state.errorDialog }
    errorDialog.shown = false
    errorDialog.message = ''
    this.setState({
      errorDialog
    })
  }

  render () {
    const Form = this.props.form
    const { errorDialog } = this.state
    if (this.state.loading) {
      return <Loader />
    } else if (!this.state.data && this.props.method === 'edit') {
      return this.state.notFoundError ? <p>{this.state.notFoundError}</p> : null
    }
    return (
      <div>
        <Form
          onCancel={this.props.onCancel}
          value={this.state.data}
          options={this.props.options}
          onSubmit={this.handleSubmit}
          onDelete={this.handleDelete}
          method={this.props.method}
          resourceId={this.props.resourceId}
        />
        {errorDialog.shown &&
          <Dialog
            show={errorDialog.shown}
            information={getMessage(errorDialog.message)}
            close={this.hideErrorDialog}
            closeText={getMessage('dialog.okText')}
          />
        }
      </div>
    )
  }
}

class ListingPageWithRoutes extends Component {
  render () {
    const { router, form } = this.props
    const { overwriteWithApiParams } = form
    const action = router.match.params.action
    let WrapperComponent = this.props.menu ? AuthenticatedPage : ({ menu, ...props }) => <div {...props} />
    if ((action === 'add') && form && form.component) {
      const Form = form.component
      const { api: { url, params = {} } } = this.props
      return (
        <WrapperComponent menu={this.props.menu} showLanguageDropDown={this.props.showLanguageDropDown}>
          <h1 className='title'>{this.props.addHeading || 'Add'}</h1>
          <FormContainer
            form={Form}
            url={url}
            method='add'
            overwriteWithApiParams={overwriteWithApiParams}
            options={this.props.form && this.props.form.options}
            apiParams={params}
            transformSubmit={form.transformSubmit}
            transformResponse={form.transformResponse}
            afterSubmit={(response) => {
              this.props.form && this.props.form.afterSubmit && this.props.form.afterSubmit(response)
              router.history.push(router.location.pathname.replace(/(\/add)|(\/edit\/.*)$/, ''))
            }}
            onCancel={() => {
              router.history.push(router.location.pathname.replace(/(\/add)|(\/edit\/.*)$/, ''))
            }}
          />
        </WrapperComponent>
      )
    } else if ((action === 'edit') && form && form.component) {
      const Form = form.component
      const { api: { url, params = {} } } = this.props
      return (
        <WrapperComponent menu={this.props.menu} showLanguageDropDown={this.props.showLanguageDropDown}>
          <h1 className='title'>{this.props.editHeading || 'Edit'}</h1>
          <FormContainer
            form={Form}
            url={url}
            method='edit'
            resourceId={router.match.params.id}
            options={form.options}
            apiParams={params}
            transformSubmit={form.transformSubmit}
            transformResponse={form.transformResponse}
            afterSubmit={() => {
              router.history.push(router.location.pathname.replace(/(\/add)|(\/edit\/.*)$/, ''))
            }}
            onCancel={() => {
              router.history.push(router.location.pathname.replace(/(\/add)|(\/edit\/.*)$/, ''))
            }}
          />
        </WrapperComponent>
      )
    } else if ((action === 'view') && form && form.component) {
      const Details = form.component
      const { api: { url, transform } } = this.props
      return (
        <WrapperComponent menu={this.props.menu} storeDependent={this.props.storeDependent}>
          <Details form={Details}
            url={url}
            method='view'
            resourceId={router.match.params.id}
            transform={transform}
            options={form.options}
          />
        </WrapperComponent>
      )
    }
    return (
      <ListingPage {...this.props} />
    )
  }
}

export default withRouter(({ location, history, match, ...props }) => (
  <ListingPageWithRoutes router={{ location, history, match }} {...props} />
))
