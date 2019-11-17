import React from 'react'
import { Searchable } from '../../Inputs'
import API from '../../../../lib/api'
import propTypes from 'prop-types'

export default function CustomerTagSearch (props) {
  let newProps = Object.assign({}, props, {
    onChange: (event) => {
      if (!props.customerId) {
        return
      }
      if (props.tags.length < event.length) {
        // Tag Added
        let resultingArr = event.filter((item) => props.tags.indexOf(item) < 0)
        if (resultingArr.length > 0 && resultingArr[0].id) {
          let postApi = new API({ url: `/customer-service/customer/${props.customerId}/tag` })
          let params = {
            tagids: [resultingArr[0].id]
          }
          postApi.post(params).then(response => {
            props.onChange(event)
          })
        }
      } else {
        // Tag Removed
        let resultingArr = props.tags.filter((item) => event.indexOf(item) < 0)
        if (resultingArr.length > 0 && resultingArr[0].id) {
          let api = new API({ url: `/customer-service/customer/${props.customerId}/tag/${resultingArr[0].id}` })
          api.delete().then(
            response => {
              props.onChange(event)
            })
        }
      }
    },
    searchUrl: `/customer-service/tag`,
    valueKey: 'id',
    nameKey: 'name',
    searchKey: 'name',
    transformRequest: (searchText, paramsDefault) => {
      let params = Object.assign({}, paramsDefault)
      params.name = `${params.name}`
      return params
    },
    transformResponse: response => {
      return response.data.tag || []
    }
  })
  return (
    <Searchable {...newProps} />
  )
}
CustomerTagSearch.propTypes = {
  customerId: propTypes.number.isRequired
}
