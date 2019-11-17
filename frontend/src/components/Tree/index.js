import React, { Component } from 'react'
import SortableTree, { getTreeFromFlatData, removeNodeAtPath, addNodeUnderParent, changeNodeAtPath, getVisibleNodeCount } from 'react-sortable-tree'
import 'react-sortable-tree/style.css'
import './style.css'

export default class Tree extends Component {
  render () {
    const { data, onChange, onMoveNode, getNodeKey, removeNodeAtPath, addNodeUnderParent, generateNodeProps, canDrag, className, onDragStateChanged, canDrop, onVisibilityToggle } = this.props
    const count = getVisibleNodeCount({treeData: data})
    return (
      <div className='sortable-tree'>
        <SortableTree
          style={{height: count * 70}}
          className={className}
          treeData={data}
          onChange={onChange}
          getNodeKey={getNodeKey}
          onMoveNode={onMoveNode}
          removeNodeAtPath={removeNodeAtPath}
          addNodeUnderParent={addNodeUnderParent}
          generateNodeProps={generateNodeProps}
          canDrag={canDrag}
          canDrop={canDrop}
          onDragStateChanged={onDragStateChanged}
          onVisibilityToggle={onVisibilityToggle}
        />
      </div>
    )
  }
}

export {
  getTreeFromFlatData,
  removeNodeAtPath,
  addNodeUnderParent,
  changeNodeAtPath
}

Tree.defaultProps = {
  getNodeKey: ({ node }) => node.id,
  canDrag: true,
  treeData: []
}
