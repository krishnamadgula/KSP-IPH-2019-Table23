import React, { Component } from 'react'
import Row from '../../../../components/Table/Header'
import { Cell } from '../../../../components/Table'
import { getMessage } from '../../../../lib/translator'
import previous from './previous.png'
import next from './next.png'
import './style.css'
import { formatTime } from '../../../../lib/datetime'

class AttendanceTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      index: 0,
      headers: props.headers.slice(0, 3)
    }
    this.goToPrevious = this.goToPrevious.bind(this)
    this.goToNext = this.goToNext.bind(this)
  }

  goToPrevious () {
    let headers = this.props.headers || []
    let index = this.state.index || 0
    this.setState({ headers: headers.slice(index - 1, index + 2), index: index - 1 })
  }

  goToNext () {
    let headers = this.props.headers || []
    let index = this.state.index || 0
    this.setState({ headers: headers.slice(index + 1, index + 4), index: index + 1 })
  }
  render () {
    let {headers, data, index, id} = this.props
    return index === 0 ? (<React.Fragment>
      <Row className='header'>
        <Cell>{getMessage('attendance.summary.table.employee.name')}</Cell>
        <button type='button' disabled={!(this.state.index)} className='previous-button' onClick={this.goToPrevious}><img src={previous} alt='previous' /></button>
        {this.state.headers}
        <button type='button' disabled={!(this.state.index <= headers.length - 4)} className='next-button' onClick={this.goToNext}><img src={next} alt='next' /></button>
      </Row>
      {(data || []).map((employee) => {
        return <Row key={employee.id}>
          <Cell>
            <div>{employee.name}</div>
            <small className='text-muted'>{employee.designation.name}</small>
          </Cell>
          {((this.state.headers || []).map(({key}) => {
            return employee.attendance[key] ? <Cell key={key + '-' + id}>
              <div className={`color-${employee.attendance[key].status}`}>
                {getMessage(`attendance.summary.table.${employee.attendance[key].status}`)}
              </div>
              {
                employee.attendance[key].inTime && employee.attendance[key].expectedOut && (
                  <small>{formatTime(employee.attendance[key].inTime && employee.attendance[key].inTime.split(' ')[1])} {getMessage('attendance.summary.table.to')} {formatTime(employee.attendance[key].outTime && employee.attendance[key].outTime.split(' ')[1])}</small>
                )
              }
            </Cell> : <Cell key={key + '-' + id}>
              {getMessage('attendance.summary.table.na')}
            </Cell>
          }))}
        </Row>
      })}
    </React.Fragment>) : null
  }
}

export default AttendanceTable
