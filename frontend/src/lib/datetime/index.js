import { getMessage } from '../translator'
import moment from 'moment'

// takes Date-time as "2018-11-08 11:05:35" and returns as 8 Nov 2018, 11:05 AM
// if only date is passed ex. 2018-11-08, return it as 8 Nov 2018, 00:00 AM
function getPrintableTime (time) {
  if (!time) {
    return ''
  }
  time = time.trim()

  let dateString

  if (time.includes(' ')) {
    dateString = moment(time, 'YYYY-MM-DD HH:mm:ss')
    dateString = dateString.format('DD MMM YYYY, hh:mm A')
  } else {
    dateString = moment(time, 'YYYY-MM-DD')
    dateString = dateString.format('DD MMM YYYY')
  }

  return dateString
}

// gets date in YYYY-MM-DD and return in format 20th Nov 2017
function formatDate (dateString) {
  if (!dateString) {
    return null
  }
  let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let parts = dateString.split('-')
  let suffix = ''
  switch (parts[2]) {
    case '01':
    case '21':
    case '31':
      suffix = 'st'
      break
    case '03':
    case '23':
      suffix = 'rd'
      break
    case '02':
    case '22':
      suffix = 'nd'
      break
    default:
      suffix = 'th'
  }
  return `${parts[2].replace(/^0+/, '')}${suffix} ${monthNames[parts[1] - 1]} ${parts[0]}`
}
// take time in 23:59:59 format and return 11:59 PM
function formatTime (time) {
  if (!time) {
    return null
  }
  let parts = time.split(':')
  if (parts[0] === '00') {
    return `12:${parts[1]} AM`
  }
  if (parts[0] === '12') {
    return `${Number(parts[0])}:${parts[1]} PM`
  }
  if (parts[0] > 12) {
    return `${String(Number(parts[0]) - 12)}:${parts[1]} PM`
  }
  return `${Number(parts[0])}:${parts[1]} AM`
}

function getOrdinal (n) {
  let s = ['th', 'st', 'nd', 'rd']
  let v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Returns day of a week when a valid date is provided
function getPrintableDay (date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  date = new Date(date)
  return days[date.getDay()]
}

// Returns an array with current months first and end dates
function getMonthStartEnd (date = false) {
  date = date ? new Date(date) : new Date()
  return [
    getDateInSQL(new Date(date.getFullYear(), date.getMonth(), 1)),
    getDateInSQL(new Date(date.getFullYear(), date.getMonth() + 1, 0))
  ]
}

// Returns date in the form of YYYY-MM-DD for a given valid date
function getDateInSQL (date) {
  date = new Date(date)
  let month = '' + (date.getMonth() + 1)
  let day = '' + date.getDate()
  let year = date.getFullYear()

  if (month.length < 2) month = '0' + month
  if (day.length < 2) day = '0' + day

  return [year, month, day].join('-')
}

// Returns previous month from a given date
function getPrevMonth (date) {
  return new Date(date.setMonth(date.getMonth() - 1))
}

// Returns next month from a given date
function getNextMonth (date) {
  return new Date(date.setMonth(date.getMonth() + 1))
}

function getDaysOfWeek ({ full = false }) {
  return [
    {
      text: full ? getMessage('Monday.all') : getMessage('Monday'),
      value: 'Monday'
    },
    {
      text: full ? getMessage('Tuesday.all') : getMessage('Tuesday'),
      value: 'Tuesday'
    },
    {
      text: full ? getMessage('Wednesday.all') : getMessage('Wednesday'),
      value: 'Wednesday'
    },
    {
      text: full ? getMessage('Thursday.all') : getMessage('Thursday'),
      value: 'Thursday'
    },
    {
      text: full ? getMessage('Friday.all') : getMessage('Friday'),
      value: 'Friday'
    },
    {
      text: full ? getMessage('Saturday.all') : getMessage('Saturday'),
      value: 'Saturday'
    },
    {
      text: full ? getMessage('Sunday.all') : getMessage('Sunday'),
      value: 'Sunday'
    }
  ]
}

// 02:00:00 to 120 mins
function getMinutes (his) {
  if (!his) {
    return null
  }
  var a = his.split(':')
  return (+a[0]) * 60 + (+a[1])
}

// 2018-09-10T12:31:40Z to  12:31:40 and converts it to local time
function formatIsoTime (dateTime) {
  if (!dateTime) {
    return null
  }
  return formatTime(moment(dateTime).format('HH:mm:ss'))
}

function convertIsoToHHmmss (dateTime) {
  if (!dateTime) {
    return null
  }
  return moment(dateTime).format('HH:mm:ss')
}

function formatIsoDate (dateTime) {
  if (!dateTime) {
    return null
  }
  let date = moment(dateTime)
  return formatDate(date.format('YYYY-MM-DD'))
}

// Gets time difference in hrs plus minutes betn 2 times
// 16:00:00 and 22:00:00 gives 6h 00 mins
function getRemainingTime (startTime, endTime) {
  if (!startTime || !endTime) {
    return null
  }
  try {
    let start = moment.utc(startTime, 'HH:mm:ss')
    let end = moment.utc(endTime, 'HH:mm:ss')
    if (end.isBefore(start)) {
      end.add(1, 'day')
    }
    let diff = moment.duration(end.diff(start))
    diff = moment.utc(+diff).format('HH:mm').split(':')
    diff[0] = Number(diff[0])
    diff[1] = Number(diff[1])
    diff = diff.join(' h ').concat(' m')
    return diff
  } catch (error) {
    return null
  }
}

function getTimes () {
  let times = []
  for (let i = 0; i <= 23; i++) {
    if (i < 10) {
      times.push({text: `0${i}:00`, value: `0${i}:00:00`})
      times.push({text: `0${i}:30`, value: `0${i}:30:00`})
    } else {
      times.push({text: `${i}:00`, value: `${i}:00:00`})
      times.push({text: `${i}:30`, value: `${i}:30:00`})
    }
  }
  return times
}

export {
  getPrintableTime,
  formatDate,
  formatTime,
  getOrdinal,
  getMonthStartEnd,
  getPrintableDay,
  getDateInSQL,
  getPrevMonth,
  getNextMonth,
  getDaysOfWeek,
  getMinutes,
  formatIsoTime,
  convertIsoToHHmmss,
  formatIsoDate,
  getRemainingTime,
  getTimes
}
