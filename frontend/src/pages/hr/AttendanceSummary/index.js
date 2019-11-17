import React, { Component } from 'react'

import ListingPage from '../../../containers/ListingPage'

import { Cell } from '../../../components/Table'

import { getMessage } from '../../../lib/translator'
import { getPrintableTime, formatDate, getPrintableDay, getMonthStartEnd, getDateInSQL } from '../../../lib/datetime'

import { isExtensionEnabled } from '../../../lib/auth'
import API from '../../../lib/api'

import Filters from './Filters'
import './style.css'
import EmptyIcon from './attendance-empty.svg'
import AttendanceSummaryTable from './AttendanceTable'

function getHeaderSet (data) {
  let headerSet = []
  let maxKeysIndex = 0
  let maxHeaderLength = 0
  data.forEach((element, index, data) => {
    if (Object.keys(element.attendance).length > maxHeaderLength) {
      maxKeysIndex = index
      maxHeaderLength = Object.keys(data[index].attendance).length
    }
  })

  if (data.length) {
    for (const dateKey in data[maxKeysIndex].attendance) {
      if (headerSet.indexOf(dateKey) === -1) {
        headerSet.push(dateKey)
        headerSet.sort()
      }
    }
  }
  return headerSet
}

const tableProperties = data => {
  let headerSet = []
  return {
    row: ({ id, name, designation, attendance, index }) => {
      const attendanceStatus = []
      const headers = []

      headerSet = getHeaderSet(data)

      for (let i = headerSet.length - 1; i >= 0; i--) {
        const key = headerSet[i]
        if (new Date(key) <= new Date()) {
          headers.push(
            <Cell key={key}>
              <div>{formatDate(key)}<br /><small className='text-muted'>{getPrintableDay(key)}</small></div>
            </Cell>
          )
          if (attendance[key]) {
            attendanceStatus.push(
              <Cell key={key + '-' + id}>
                <div className={`status color-${attendance[key].status}`}>
                  {getMessage(`attendance.summary.table.${attendance[key].status}`)}
                </div>
                {
                  attendance[key].inTime && attendance[key].expectedOut && (
                    <small>{formatTime(attendance[key].inTime)} {getMessage('attendance.summary.table.to')} {formatTime(attendance[key].outTime)}</small>
                  )
                }
              </Cell>
            )
          } else {
            attendanceStatus.push(
              <Cell key={key + '-' + id}>
                {getMessage('attendance.summary.table.na')}
              </Cell>
            )
          }
        }
      }

      if (headerSet.length) {
        return (
          <AttendanceSummaryTable id={id} name={name} designation={designation} attendance={attendance} headers={headers} attendanceStatus={attendanceStatus} data={data} index={index} />
        )
      } else {
        return <div className='empty-attendance-state'>
          <img src={EmptyIcon} alt='attendance' />
          <span>{getMessage('attendance.summary.empty.message')}</span>
        </div>
      }
    }
  }
}

const EmptyState = {
  icon: EmptyIcon,
  message: getMessage('attendance.summary.empty.message')
}

const formatTime = t => getPrintableTime(t).split(', ')[1]

class AttendanceSummary extends Component {
  constructor (props) {
    super(props)
    this.state = {
      from: getMonthStartEnd()[0],
      to: getDateInSQL(new Date()),
      stores: [],
      tableBody: []
    }
  }

  componentWillMount () {
    if (isExtensionEnabled('MultiStoreSupport')) {
      this.storeApi = new API({
        url: '/account-service/store'
      })
      this.storeApi.get({ paginate: false })
        .then(response => {
          if (response.data.store.length > 0) {
            const stores = response.data.store
            this.setState({
              stores
            })
          }
        })
    }
  }
  componentWillUnmount () {
    this.storeApi && this.storeApi.cancel()
  }

  render () {
    const { from, to, tableBody, stores } = this.state
    return (
      <ListingPage
        menu={this.props.menu}
        className='attendace-summary-page'
        title={getMessage('attendance.summary.title')}
        emptyState={EmptyState}
        api={{
          url: '/account-service/attendance-summary',
          transform: response => {
            this.setState({
              tableBody: tableProperties(response.data.attendancesummary)
            })
            return response.data.attendancesummary
          },
          params: {
            from,
            to
          }
        }}
        tableProperties={tableBody}
        filters={{
          component: Filters,
          forceShow: true,
          options: {
            stores
          },
          transformSubmit: (fd) => {
            const data = Object.assign({}, fd)
            const from = getMonthStartEnd()[0]
            const to = getMonthStartEnd()[1]

            if (data.from === null) {
              this.setState({ from })
              data.from = from
            }
            if (data.to === null) {
              this.setState({ to })
              data.to = to
            }
            if (data.user) {
              data.userId = data.user.id
              delete data.user
            }

            return data
          }
        }}
      />
    )
  }
}

export default AttendanceSummary
