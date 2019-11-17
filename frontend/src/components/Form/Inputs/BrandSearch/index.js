import React from 'react'
import { Searchable } from '../../Inputs'

export default function BrandSearch (props) {
  let newProps = Object.assign({}, props, {
    searchUrl: '/catalogue-service/brand',
    valueKey: 'id',
    nameKey: 'name',
    searchKey: 'name',
    transformRequest: (searchText, paramsDefault) => {
      let params = Object.assign({}, paramsDefault)
      params.name = `%${params.name}`
      return params
    },
    transformResponse: response => {
      return (props.appendElement ? props.appendElement : []).concat(response.data.brand) || []
    }
  })
  return <Searchable {...newProps} />
}
