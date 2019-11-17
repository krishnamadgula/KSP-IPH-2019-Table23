import React from 'react'
import Searchable from '../Searchable'

const getChain = category => {
  let chain = []
  let reference = category
  while (reference) {
    chain.push(reference.name)
    reference = reference.parentCategory
  }
  return chain.reverse().join(' > ')
}

export default function CategorySearch (props) {
  let newProps = Object.assign({}, props, {
    searchUrl: '/catalogue-service/category',
    valueKey: 'id',
    nameKey: 'displayName',
    searchKey: 'name',
    displaySelectedValue: (category) => {
      return props.dontShowChain ? category.name : getChain(category)
    },
    transformRequest: (searchText, paramsDefault) => {
      let params = Object.assign({}, paramsDefault)
      params.name = `%${params.name}`
      return params
    },
    transformResponse: response => {
      return (props.appendElement ? props.appendElement : []).concat(
        response.data.category.map(category => {
          category.displayName = getChain(category)
          return category
        })
      )
    }
  })
  return (
    <Searchable {...newProps} />
  )
}
