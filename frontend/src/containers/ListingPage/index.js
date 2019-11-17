import React from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import AuthenticatedPage from '../AuthenticatedPage'
import WithoutMenuPage from '../WithoutMenuPage'
import EmptyState from '../../components/EmptyState'
import Table, { Header } from '../../components/Table'
import HelpCard from '../../components/HelpCard'
import HelpWidget from '../../components/HelpWidget'
import Loader from '../../components/Loader'
import Pagination from '../../components/Pagination'
import { Popup as Modal, Dialog } from '../../components/Popup'
import API from '../../lib/api'
import { getMessage } from '../../lib/translator'
import { get } from '../../lib/storage'
import { isExtensionEnabled, isEnterprise } from '../../lib/auth'
import { compareValues } from '../../lib/stateManagement'

import './style.css'

export const TABLE_ACTIONS = {
  ADD: 'ADD',
  EDIT: 'EDIT',
  VIEW: 'VIEW',
  DELETE: 'DELETE',
  FILTER: 'FILTER',
  REFRESH: 'REFRESH',
  UPDATE: 'UPDATE',
  SET_API_PARAMS: 'SET_API_PARAMS'
}

const NullComponent = () => null

class ListingPage extends React.Component {
  constructor (props) {
    super(props)
    let searchParams = Object.assign({}, ...this.props.router.location.search.slice(1).split('&').filter(Boolean).map(keystr => {
      keystr = keystr.split('=')
      return {
        [keystr[0]]: decodeURIComponent(keystr[1])
      }
    }))
    if (Object.keys(searchParams).length > 0) {
      let item = window.localStorage.getItem(this.props.className)
      if (!item) {
        window.localStorage.setItem(this.props.className, 1)
      }
    }
    let apiParams = {}
    if (props.api) {
      if (props.api.params) {
        apiParams = props.api.params
      }
    }
    this.state = {
      data: {
        items: null,
        paging: null,
        filters: searchParams || {}, // Corresponds to the filters applied to the API
        viewItems: null
      },
      filters: {
        // Corresponds to the state of the 'filters' view
        shown: Object.keys(searchParams).length > 0 || (this.props.filters && this.props.filters.showFiltersOnLoad)
      },
      apiParams: apiParams,
      loaders: {
        data: false,
        updatingApiParams: false
      },
      form: {
        shown: false,
        rowIndex: -1, // The row being edited
        data: null
      },
      deleteDialog: {
        shown: false,
        data: {}
      },
      errorDialog: {
        shown: false,
        message: '',
        title: ''
      },
      firstLoadDone: false // Indicate that we have gotten results from API at least once
    }

    this.primaryKey = this.props.primaryKey || 'id'

    if (props.api && props.api.url) {
      this.api = new API({ url: props.api.url })
    }

    /* Default hooks */
    // Method to extract data from the API call made
    this._transformResponse = response => response
    this._transformSubmit = form => form

    /* Hook overrides */
    if (props.api && props.api.transform) {
      this._transformResponse = props.api.transform
    }
    if (props.form && props.form.transformSubmit) {
      this._transformSubmit = props.form.transformSubmit
    }
    if (props.updateView) {
      this.updateView = this.updateView.bind(this)
    }

    this._showDataLoader = this._showDataLoader.bind(this)
    this._hideDataLoader = this._hideDataLoader.bind(this)
    this.changePage = this.changePage.bind(this)
    this.performAction = this.performAction.bind(this)
    this._showForm = this._showForm.bind(this)
    this._hideForm = this._hideForm.bind(this)
    this._showFilters = this._showFilters.bind(this)
    this._hideFilters = this._hideFilters.bind(this)
    this._toggleFilters = this._toggleFilters.bind(this)
    this.createResource = this.createResource.bind(this)
    this.modifyResource = this.modifyResource.bind(this)
    this.getResource = this.getResource.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.clearFilters = this.clearFilters.bind(this)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.throwError = this.throwError.bind(this)
    this._showDeleteDialog = this._showDeleteDialog.bind(this)
    this._hideDeleteDialog = this._hideDeleteDialog.bind(this)
    this._showErrorDialog = this._showErrorDialog.bind(this)
    this._hideErrorDialog = this._hideErrorDialog.bind(this)
    this.setApiParam = this.setApiParam.bind(this)
  }
  // Some data lookup methods
  _getRow (data) {
    let result = {
      data: null,
      index: -1
    }
    if (!data && this.props.noId) {
      return result
    }
    let { items } = this.state.data
    for (let i = 0, len = items.length; i < len; i++) {
      let item = items[i]
      let matched = true
      for (let key in data) {
        if (!(key in item) || (item[key] !== data[key])) {
          matched = false
          break
        }
      }
      if (matched) {
        result.data = item
        result.index = i
        break
      }
    }
    return result
  }
  // Some utility methods to manage states
  _showDataLoader () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.loaders.data = true
      return newState
    })
  }
  _hideDataLoader () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.loaders.data = false
      newState.loaders.updatingApiParams = false
      return newState
    })
  }
  _showForm (rowIndex, data) {
    // If rowIndex is specified, then a particular row is being edited
    if (this.props.form && this.props.form.component) {
      this.setState(prevState => {
        let newState = Object.assign({}, prevState)
        newState.form.shown = true
        newState.form.rowIndex = isFinite(rowIndex) ? rowIndex : -1
        if (data) {
          newState.form.data = data
        }
        return newState
      })
    }
  }
  _hideForm () {
    // Clear the form and hide it
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.form.shown = false
      newState.form.rowIndex = -1
      newState.form.data = null
      return newState
    })
  }
  _showFilters () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.filters.shown = true
      return newState
    })
  }
  _hideFilters () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.filters.shown = false
      return newState
    })
  }
  _toggleFilters () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.filters.shown = !prevState.filters.shown
      return newState
    })
  }
  _hideDeleteDialog () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.deleteDialog.shown = false
      return newState
    })
  }
  _showDeleteDialog () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.deleteDialog.shown = true
      return newState
    })
  }
  _hideErrorDialog () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.errorDialog.shown = false
      newState.errorDialog.message = ''
      newState.errorDialog.title = ''
      return newState
    })
  }
  _showErrorDialog () {
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.errorDialog.shown = true
      return newState
    })
  }
  // Methods to manage data via API
  /**
   * Makes API call to create the resource
   * @param {object} data - Data to be created in DB
   * @return {Oject} newState - updated state [Immutated]
   */
  createResource (data) {
    let api = new API({
      url: this.props.api.url
    })
    let params = (this.props.form && this.props.form.overwriteWithApiParams === false)
      ? Object.assign({}, this.state.apiParams, this._transformSubmit(data)) : Object.assign({}, this._transformSubmit(data), this.state.apiParams)
    if (params.storeId) {
      params.storeId = Number(params.storeId)
    }
    return api.post(params)
      .then(
        (response) => {
          let data = this._transformResponse(response)
          /* Show new entry at top of the table */
          if (this.props.form && this.props.form.filterBeforeAdding) {
            let filterBeforeAdding = this.props.form.filterBeforeAdding
            data = filterBeforeAdding(data, this)
          }
          if (data) {
            this.setState(prevState => {
              let newState = Object.assign({}, prevState)
              let updatedItems = newState.data.items
              this.props.addNewItemToLast ? updatedItems.push(data) : updatedItems.unshift(data)
              newState.data.items = updatedItems
              const updatedPaging = newState.data.paging
              updatedPaging.count = (updatedPaging.count || 0) + 1
              newState.data.paging = updatedPaging
              return newState
            })
          }
          this._hideForm()
        }, (error) => {
          this.setState(prevState => {
            let newState = Object.assign({}, prevState)
            let updatedItems = newState.data.items
            this.props.addNewItemToLast ? updatedItems.push(data) : updatedItems.unshift(data)
            newState.data.items = updatedItems
            const updatedPaging = newState.data.paging
            updatedPaging.count = (updatedPaging.count || 0) + 1
            newState.data.paging = updatedPaging
            return newState
          })
          this._hideForm()
          // this.throwError(error)
        })
  }
  modifyResource (data) {
    // Make an API call to update the resource
    let x = !this.props.noId ? data[this.primaryKey] : 'X'
    let api = new API({
      url: this.props.api.url + '/' + x
    })
    let params = (this.props.form && this.props.form.overwriteWithApiParams === false)
      ? Object.assign({}, this.state.apiParams, this._transformSubmit(data)) : Object.assign({}, this._transformSubmit(data), this.state.apiParams)
    return api.put(params)
      .then(
        (response) => {
          /* Update the table row */
          if (this.props.form && this.props.form.filterBeforeAdding) {
            let filterBeforeAdding = this.props.form.filterBeforeAdding
            data = filterBeforeAdding(data, this)
          }
          let updatedRow = this._transformResponse(response)
          let row = this._getRow({
            [this.primaryKey]: updatedRow[this.primaryKey]
          })
          if (data) {
            if (row.index > -1) {
              this.setState(prevState => {
                let newState = Object.assign({}, prevState)
                let updatedItems = newState.data.items
                updatedItems.splice(row.index, 1, updatedRow)
                newState.data.items = updatedItems
                return newState
              })
            } else if (this.props.noId) {
              this.setState(prevState => {
                let newState = Object.assign({}, prevState)
                let updatedItems = newState.data.items
                this.props.addNewItemToLast ? updatedItems.push(updatedRow) : updatedItems.unshift(updatedRow)
                newState.data.items = updatedItems
                const updatedPaging = newState.data.paging
                updatedPaging.count = (updatedPaging.count || 0) + 1
                newState.data.paging = updatedPaging
                return newState
              })
            }
          } else {
            if (row.index > -1) {
              this.setState(prevState => {
                let newState = Object.assign({}, prevState)
                let updatedItems = newState.data.items
                updatedItems.splice(row.index, 1)
                newState.data.items = updatedItems
                const updatedPaging = newState.data.paging
                updatedPaging.count = (updatedPaging.count) - 1
                newState.data.paging = updatedPaging
                return newState
              })
            }
          }
          this.props.api && this.props.api.afterSubmit && this.props.api.afterSubmit(response)
          this._hideForm()
        }, (error) => {
          let updatedRow = this._transformResponse(data)
          let row = this._getRow({
            [this.primaryKey]: updatedRow[this.primaryKey]
          })
          this.setState(prevState => {
            let newState = Object.assign({}, prevState)
            let updatedItems = newState.data.items
            updatedItems.splice(row.index, 1)
            newState.data.items = updatedItems
            const updatedPaging = newState.data.paging
            updatedPaging.count = (updatedPaging.count) - 1
            newState.data.paging = updatedPaging
            return newState
          })
          this._hideForm()
          // this.throwError(error)
        })
  }

  /**
   * Makes API call to delete the resource
   * @param {object} data - Data to be deleted from DB
   * @return {Oject} newState - updated state [Immutated]
   */
  deleteResource (data) {
    let api = new API({
      url: this.props.api.url + '/' + data[this.primaryKey]
    })
    let params = this.props.api.overWriteDeleteParams === false ? Object.assign({}, this.state.apiParams, data) : Object.assign({}, data, this.state.apiParams)
    api.delete(params)
      .then(
        (response) => {
          /* Update the table row */
          let row = this._getRow({
            [this.primaryKey]: data[this.primaryKey]
          })
          if (row.index > -1) {
            this.setState(prevState => {
              let newState = Object.assign({}, prevState)
              let updatedItems = newState.data.items
              updatedItems.splice(row.index, 1)
              newState.data.items = updatedItems
              const updatedPaging = newState.data.paging
              updatedPaging.count = (updatedPaging.count) - 1
              newState.data.paging = updatedPaging
              return newState
            })
          }
        }, (error) => {
          // this.throwError(error, getMessage('errorDialog.delete.error.title'))
          let row = this._getRow({
            [this.primaryKey]: data[this.primaryKey]
          })
          this.setState(prevState => {
            let newState = Object.assign({}, prevState)
            let updatedItems = newState.data.items
            updatedItems.splice(row.index, 1)
            newState.data.items = updatedItems
            const updatedPaging = newState.data.paging
            updatedPaging.count = (updatedPaging.count) - 1
            newState.data.paging = updatedPaging
            return newState
          })
        })
      .then(this._hideForm)
  }

  getResource (data) {
    let api = new API({
      url: this.props.api.url + '/' + data[this.primaryKey]
    })
    let params = Object.assign({}, this._transformSubmit(data), this.state.apiParams)
    api.get(params).then(
      response => {
        /* Update the table row */
        let updatedRow = this._transformResponse(response)
        let row = this._getRow({
          [this.primaryKey]: updatedRow[this.primaryKey]
        })
        if (row.index > -1) {
          this.setState(prevState => {
            let newState = Object.assign({}, prevState)
            let updatedItems = newState.data.items
            updatedItems.splice(row.index, 1, updatedRow)
            newState.data.items = updatedItems
            return newState
          })
        }
        this.props.api && this.props.api.afterSubmit && this.props.api.afterSubmit(response)
        this._hideForm()
      }, (error) => {
        this.throwError(error)
      }
    )
  }
  fetchTableData (params = {}) {
    if (!this.api) {
      return
    }
    this._showDataLoader()
    if (Object.keys(params).length > 0) {
      params = Object.assign({}, this.state.apiParams, params)
    } else {
      params = Object.assign({}, params, this.state.apiParams)
    }
    if (this.props.storeDependent && isExtensionEnabled('MultiStoreSupport')) {
      if (!params.storeId) {
        return null
      }
    }
    return this.api.get(params)
      .then((response) => {
        this.setState(prevState => {
          let newState = Object.assign({}, prevState)
          newState.data.items = this._transformResponse(response)
          if (this.props.updateView) {
            newState.data.viewItems = this._transformResponse(response)
          }
          newState.data.paging = (
            ({ count, limit, offset }) => ({ count, limit, offset })
          )(response.data)
          newState.firstLoadDone = true
          return newState
        })
      })
      .then(this._hideDataLoader)
      .catch((error) => {
        this._hideDataLoader()
        throw error
      })
  }
  changePage (page) {
    window.localStorage.setItem(this.props.className, page) // necessary for pagination
    if (Object.keys(this.state.data.filters).length) {
      this.applyFilters(this.state.data.filters, page)
    } else {
      this.fetchTableData({ page })
    }
  }
  applyFilters (filters, page = 1) {
    window.localStorage.setItem(this.props.className, page) // necessary for pagination
    var transformedFilters = filters
    if (this.props.filters && this.props.filters.transformSubmit) {
      transformedFilters = this.props.filters.transformSubmit(filters)
    }
    let params = Object.assign({
      offset: 0, // Reset page to 1 if applying filters
      page: page
    }, transformedFilters)
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.data.filters = filters
      return newState
    }, () => { this.fetchTableData(params) })
  }
  clearFilters () {
    window.localStorage.setItem(this.props.className, 1)
    let {onClear} = this.props
    this.setState(prevState => {
      let newState = Object.assign({}, prevState)
      newState.data.filters = {}
      newState.filters = {shown: true}
      return newState
    }, () => { onClear ? onClear() : this.fetchTableData() })
  }
  confirmDelete () {
    this.deleteResource(this.state.deleteDialog.data)
    this._hideDeleteDialog()
  }
  throwError (error, title) {
    if (error.code === 400) {
      this.setState(prevState => {
        let newState = Object.assign({}, prevState)
        newState.errorDialog.message = error.message.split(':').slice(1).join(':') || error.message // if string does not have a colon
        newState.errorDialog.title = title || ''
        return newState
      }, this._showErrorDialog())
    } else {
      throw error
    }
  }
  performAction (action, data, updates, deleteRow = false) {
    // action: (string) Action to perform
    // data: The data needed to search a specific a row
    // updates: The data to update the row with
    // deleteRow: delete the row from view without making api call
    if (action in TABLE_ACTIONS) {
      switch (action) {
        case TABLE_ACTIONS.ADD:
          if (this.props.form) {
            this._showForm(-1, data)
          }
          break
        case TABLE_ACTIONS.EDIT:
          if (this.props.form) {
            // Lookup row number for given data and send that row number
            let row = this._getRow(data)
            if (row.index >= 0) {
              if (updates) {
                // If there are updates, just update row instead of showing form
                this.setState(prevState => {
                  let newState = Object.assign({}, prevState)
                  let updatedItems = newState.data.items
                  updatedItems.splice(row.index, 1, Object.assign({}, row.data, updates))
                  newState.data.items = updatedItems
                  return newState
                })
              } else {
                this._showForm(row.index)
              }
            } else {
              if (this.props.noId && row.index >= 0) {
                this._showForm(row.index, data)
              } else if (this.props.noId) {
                this._showForm(-1, data)
              }
            }
          }
          break
        case TABLE_ACTIONS.UPDATE:
          let row = this._getRow(data)
          if (row.index >= 0 && updates) {
            let params = Object.assign({}, data, updates)
            return this.modifyResource(params)
          }
          break
        case TABLE_ACTIONS.DELETE:
          this.setState(prevState => {
            let newState = Object.assign({}, prevState)
            newState.deleteDialog.data = data
            return newState
          })
          this._showDeleteDialog()
          break
        case TABLE_ACTIONS.FILTER:
          // To the user, search & filters are mutually exclusive, but internally,
          // both are implemented as filters
          this.applyFilters(data)
          break
        case TABLE_ACTIONS.REFRESH:
          let params = {}
          if (data && deleteRow) {
            // If data and delete row are not empty, simply delete the row from the view
            let row = this._getRow(data)
            this.setState(prevState => {
              let newState = Object.assign({}, prevState)
              let updatedItems = newState.data.items.slice()
              updatedItems.splice(row.index, 1)
              newState.data.items = updatedItems
              return newState
            })
            return
          } else if (data && updates) {
            // If 'data' and 'updates' are not empty, simply update the view by pushing 'updates' into the state
            let row = this._getRow(data)
            this.setState(prevState => {
              let newState = Object.assign({}, prevState)
              let updatedItems = newState.data.items
              updatedItems.splice(row.index, 1, Object.assign({}, row.data, updates))
              newState.data.items = updatedItems
              return newState
            })
          } else if (data) {
            // TODO: If 'data' is not empty, fetch details for that row and update the data for that row
            this.getResource(data)
            return
          } else if (this.state.data && this.state.data.filters) {
            // if filters are applied on the table then refresh the page with filters
            params = Object.assign({
              offset: 0 // Reset page to 1 if applying filters
            }, this.state.data.filters)
          }
          this.fetchTableData(params)
          break
        case TABLE_ACTIONS.SET_API_PARAMS:
          this.setState(prevState => {
            return {
              apiParams: Object.assign({}, prevState.apiParams, data)
            }
          }, this.fetchTableData)
          break
        default:
          break
      }
    } else if (this.props.tableProperties.actions && (action in this.props.tableProperties.actions)) {
      // Perform custom action
    }
  }
  componentDidMount () {
    this.props.dontSavePagination && window.localStorage.setItem(this.props.className, 1)
    let configs = {page: window.localStorage.getItem(this.props.className)}
    if (this.props.filters && this.props.filters.transformFilter && this.state.data.filters) {
      let transformedFilters = this.props.filters.transformFilter(this.state.data.filters)
      this.fetchTableData({...transformedFilters, ...configs})
    } else {
      this.fetchTableData({...this.state.data.filters, ...configs})
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!compareValues(this.props.api.params, nextProps.api.params) && this.props.api && this.props.api.updateApiParams) {
      let loaders = Object.assign({}, this.state.loaders)
      loaders.updatingApiParams = true
      this.setState({
        loaders
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const api = this.props.api
    if (api && api.updateApiParams) {
      let updates = api.updateApiParams(prevProps.api.params, this.props.api.params, prevState.apiParams, this.state.apiParams)
      if (updates && updates.shouldUpdate) {
        this.setState(prevState => {
          let loaders = Object.assign({}, prevState.loaders)
          loaders.updatingApiParams = true
          return {
            loaders
          }
        }, () => {
          this.performAction(TABLE_ACTIONS.SET_API_PARAMS, updates.params)
        })
      }
    }
    if (this.state.apiParams.storeId && (prevState.apiParams.storeId !== this.state.apiParams.storeId)) {
      this.fetchTableData()
    }
  }

  componentWillUnmount () {
    this.api && this.api.cancel()
  }

  updateView (data, key) {
    if (this.props.updateView) {
      let newView = this.props.updateView(data, key)
      let newData = Object.assign({}, this.state.data)
      newData.viewItems = newView
      this.setState({
        data: newData
      })
    }
  }
  setApiParam (storeId) {
    let apiParams = JSON.parse(JSON.stringify(this.state.apiParams))
    if (!apiParams.storeId && this.props.storeDependent && isExtensionEnabled('MultiStoreSupport')) {
      apiParams.storeId = Number(storeId)
      this.setState({apiParams})
    }
  }

  render () {
    // TODO: Add support for replacing default messages with localized strings
    let { props } = this
    let view = null
    let data = this.state.data
    let filtersCount = Object.keys(data.filters).filter(key => Boolean(data.filters[key])).length
    let filtersApplied = filtersCount > 0
    let emptyStateShown = false
    if (!this.api || (data.paging && data.paging.count === 0 && !(data.items && data.items.length > 0)) ||
      (data.items && data.items.length === 0)) {
      if (filtersApplied) {
        view = (
          <div className='text-muted text-center'>No results found</div>
        )
      } else {
        emptyStateShown = true
        let emptyStateProps = Object.assign({}, props.emptyState)
        let emptyState = <EmptyState {...emptyStateProps} />
        let helpItems = null
        if (props.helpItems && !isEnterprise()) {
          helpItems = (
            <HelpWidget title={props.helpItems.title}>
              {props.helpItems.instructions.map((instruction, index) => (
                <HelpCard icon={instruction.icon} title={instruction.title} key={index} onAction={instruction.onAction}>
                  {instruction.description}
                </HelpCard>
              ))}
            </HelpWidget>
          )
        }
        view = (
          <div>
            {emptyState}
            {helpItems}
          </div>
        )
      }
    } else if (data.items && props.tableProperties.row && !this.state.loaders.updatingApiParams) {
      let Row = props.tableProperties.row
      let { count, offset, limit } = data.paging
      count = Number(count)
      offset = Number(offset)
      limit = Number(limit)
      let totalPages = Math.ceil(count / limit)
      const page = window.localStorage.getItem(this.props.className)
      const viewData = props.updateView ? data.viewItems && data.viewItems.length > 0 ? data.viewItems : data.items : data.items
      view = (
        <div className='table-container'>
          <Table tableDynamic={props.tableDynamic || false}>
            {props.tableProperties.headers ? <Header items={props.tableProperties.headers} /> : null}
            {viewData.map((row, index) => (
              <Row {...row} key={row[this.primaryKey]} apiParams={this.state.apiParams} onAction={this.performAction} index={index} />
            ))}
            {props.addToTable && <props.addToTable onAction={this.performAction} />}
          </Table>
          <div className='pagination-container'>
            <div className='pagination-count'>{`${getMessage('pagination.text')} ${offset + 1} - ${limit > 0 && offset >= 0 ? Math.min(offset + limit, count) : count} ${getMessage('pagination.helperText')} ${count}`}</div>
            {totalPages > 1 ? (
              <Pagination
                total={totalPages}
                current={Number(page) || Math.floor(offset / limit + 1)}
                onSelect={this.changePage}
              // pageNumberNotEditable
              />
            ) : null}
          </div>
        </div>
      )
    }
    let HeaderActions = this.props.headerActions || NullComponent
    const Form = props.form ? props.form.component || NullComponent : NullComponent
    const Filters = props.filters ? props.filters.component || NullComponent : NullComponent
    const allowDelete = props.form && props.form.allowDelete // to allow delete action from inside the form
    if (emptyStateShown) {
      HeaderActions = props.emptyState && props.emptyState.actions ? props.emptyState.actions : NullComponent
    }
    let WrapperComponent = this.props.menu ? AuthenticatedPage : WithoutMenuPage
    return (
      <WrapperComponent setApiParam={this.setApiParam} menu={props.menu} showLanguageDropDown={props.showLanguageDropDown} className={'listing-page ' + props.className} storeDependent={props.storeDependent} onChange={() => {
        this.performAction(TABLE_ACTIONS.SET_API_PARAMS, { storeId: Number(get('store')) })
        this.props.api && this.props.api.onUpdateStore && this.props.api.onUpdateStore()
      }}>
        <div className='header-container'>
          <h1 className='title'>{props.title}</h1>
          {((!emptyStateShown && this.state.firstLoadDone) || (this.props.filters && this.props.filters.forceShow)) ? (
            <div className='header-actions-wrapper'>
              {this.props.filters ? (
                <div className='search-button-wrapper'>
                  <button
                    className={'search-button' + (this.state.filters.shown ? ' active' : '')}
                    onClick={this._toggleFilters}
                  />
                  {/* <span className='search-button-count'>{filtersCount || null}</span> */}
                </div>
              ) : null}
              <HeaderActions apiParams={this.state.apiParams} onAction={this.performAction} data={this.state.data} />
            </div>
          ) : (
            emptyStateShown && <div className='header-actions-wrapper'>
              <HeaderActions apiParams={this.state.apiParams} onAction={this.performAction} />
            </div>
          )}
        </div>
        {this.props.additionalViews ? this.props.additionalViews.map((View, index) => <View key={index} data={this.props.updateView ? this.state.data.items : null} updateView={this.props.updateView ? this.updateView : null} />) : null}
        <div className={'filters-wrapper' + (this.state.filters.shown ? '' : ' hidden')}>
          <Filters value={this.state.data.filters} onClear={this.clearFilters} onSubmit={this.applyFilters} options={props.filters ? props.filters.options : null} />
        </div>
        {this.state.form.shown ? (
          <Modal
            heading={(this.state.form.rowIndex > -1)
              ? (this.props.editHeading || (this.props.getEditHeading && this.props.getEditHeading(this.state.data.items[this.state.form.rowIndex])))
              : (this.props.addHeading || (this.props.getAddHeading && this.props.getAddHeading(this.state.form.data)))}
            className={this.props.modalClassName ||
              (this.props.getModalClassName &&
                ((this.state.form.data && this.props.getModalClassName(this.state.form.data)) ||
                  (this.state.form.rowIndex > -1 && this.props.getModalClassName(this.state.data.items[this.state.form.rowIndex])))) || ''}
            show={this.state.form.shown}
            close={this._hideForm}
          >
            <Form
              value={(this.state.form.rowIndex > -1) ? this.state.data.items[this.state.form.rowIndex] : this.state.form.data}
              onSubmit={(this.state.form.rowIndex > -1) ? this.modifyResource : this.props.noId ? this.modifyResource : this.createResource}
              onCancel={this._hideForm}
              method={(this.state.form.rowIndex > -1) ? 'edit' : 'add'}
              options={this.props.form && this.props.form.options}
              onDelete={allowDelete ? () => this.performAction('DELETE', this.state.data.items[this.state.form.rowIndex]) : null}
            />
          </Modal>
        ) : null}
        {this.state.deleteDialog.shown &&
          <Dialog show={this.state.deleteDialog.shown} title={getMessage('deleteDialog.title')} information={getMessage('deleteDialog.information')}
            onOk={this.confirmDelete}
            close={this._hideDeleteDialog}
            closeText={getMessage('dialog.cancelText')}
            okText={getMessage('dialog.okText')} />
        }
        {this.state.errorDialog.shown &&
          <Dialog show={this.state.errorDialog.shown} title={this.state.errorDialog.title} information={getMessage(this.state.errorDialog.message)}
            close={this._hideErrorDialog} closeText={getMessage('dialog.okText')} />
        }
        {this.state.loaders.data ? <Loader /> : view}
        {(!emptyStateShown && this.props.additionalViewsBottom) ? this.props.additionalViewsBottom.map((View, index) => <View key={index} values={this.state.data} />) : null}
      </WrapperComponent>
    )
  }
}

ListingPage.propTypes = {
  title: PropTypes.string,
  api: PropTypes.shape({
    url: PropTypes.string.isRequired,
    transform: PropTypes.func
  })
}

export default withRouter(({ location, history, match, ...props }) => (
  <ListingPage router={{ location, history, match }} {...props} />
))
