import moment from 'moment'
import { getMessage } from '../translator'
import { isExtensionEnabled, getStores } from '../auth'
import { formatTime } from '../datetime'
import isEmpty from 'lodash.isempty'

function sortSlotTypesAvailability (slots) {
  if (!slots) {
    return null
  }
  return slots.sort((slot1, slot2) => {
    if (slot1.interval < slot2.interval) {
      return -1
    } else {
      return 1
    }
  })
}

function sortSlotsAvailability (slots) {
  if (!slots) {
    return null
  }
  if (!Array.isArray(slots)) {
    return slots
  }
  let asapSlots = slots.filter(slot => slot.type === 'ASAP')
  let stdSlots = slots.filter(slot => slot.type === 'STANDARD')
  asapSlots = sortSlotTypesAvailability(asapSlots)
  stdSlots = sortSlotTypesAvailability(stdSlots)
  return asapSlots.concat(stdSlots)
}

function sortAsapSlots (slots) {
  if (!slots) {
    return null
  }
  return slots.sort((slot1, slot2) => {
    if (slot1.endTime < slot2.endTime) {
      return -1
    } else {
      return 1
    }
  })
}

function sortStandardSlots (slots) {
  if (!slots) {
    return null
  }
  return slots.sort((slot1, slot2) => {
    if (slot1.startTime < slot2.startTime) {
      return -1
    } else {
      return 1
    }
  })
}

function sortSlots (slots) {
  if (!slots) {
    return null
  }
  if (!Array.isArray(slots)) {
    return slots
  }
  let asapSlots = slots.filter(slot => slot.type === 'ASAP')
  let stdSlots = slots.filter(slot => slot.type === 'STANDARD')
  asapSlots = sortAsapSlots(asapSlots)
  stdSlots = sortStandardSlots(stdSlots)
  return asapSlots.concat(stdSlots)
}

function getDisplaySlot (slot) {
  if (!slot) {
    return null
  }
  if (slot.type === 'ASAP') {
    return `${getMessage('asapDurationStartText')} ${getMinutes(slot.endTime)} ${getMessage('asapDurationEndText')}`
  } else {
    return `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`
  }
}
// Takes array of slot objects and returns the text and value needed for select options
function slotSelectOptions (slots) {
  if (!slots) {
    return []
  }
  slots = sortSlots(slots)
  return slots.map(slot => {
    return {
      text: getDisplaySlot(slot),
      value: slot.id
    }
  })
}

// Takes time in 01:40:00 and returns 100 (60 + 40 mins)
function getMinutes (his) {
  if (!his) {
    return ''
  }
  var a = his.split(':')
  return (+a[0]) * 60 + (+a[1])
}

function getAsapDuration (startTime, endTime) {
  if (!startTime || !endTime) {
    return ''
  }
  let momentStartTime = moment(startTime, 'h:mma')
  let momentEndTime = moment(endTime, 'h:mma')
  if (momentStartTime.isBefore(momentEndTime)) {
    return `${getMessage('asapDurationStartText')} ${momentEndTime.diff(momentStartTime, 'minutes')} ${getMessage('asapDurationEndText')}`
  } else {
    return `${getMessage('asapDurationStartText')} ${1440 - momentStartTime.diff(momentEndTime, 'minutes')} ${getMessage('asapDurationEndText')}`
  }
}

function getTimes () {
  let times = []
  for (let i = 0; i <= 23; i++) {
    if (i < 10) {
      times.push(`0${i}:00`)
      times.push(`0${i}:30`)
    } else {
      times.push(`${i}:00`)
      times.push(`${i}:30`)
    }
  }
  return times
}

function getDisplayAddress (givenAddress, sequence) {
  if (!givenAddress) {
    return null
  }
  // Todo: Find an efficient way to do this for all keys
  let fieldsToDelete = ['id', 'latitude', 'longitude', 'clientId', 'metaData', 'FirstName', 'LastName']
  let address = Object.assign({}, givenAddress)
  let pin = address.pincode
  pin = pin && pin.toString().padStart(6, 0)
  let endAddress = {address: address.address || '', landmark: address.landmark, city: address.city, pincode: pin}
  if (isExtensionEnabled('EntityMetaData')) {
    if (sequence && address.metaData) {
      let seqAddress = {}
      sequence.forEach(key => {
        if (key === 'Address') {
          seqAddress.address = givenAddress.address
        }
        seqAddress[key] = address.metaData[key]
      })
      address = Object.assign({}, {...seqAddress}, endAddress)
    } else {
      address = Object.assign({}, {...address.metaData}, endAddress)
    }
  } else {
    address = Object.assign({}, endAddress)
  }
  fieldsToDelete.forEach(field => {
    delete address[field]
  })
  return Object.values(address).filter(Boolean).join(', ')
}

// converts camelcase to regular english sentence
function camelToReading (word) {
  if (!word) {
    return ''
  }
  return word.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
}

// converts word another word to Word Another Word
function toTitleCase (word) {
  if (!word) {
    return ''
  }
  return word.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

function storeSelection () {
  const stores = getStores() || []
  return stores.map(store => {
    return {
      text: store.name,
      value: store.id
    }
  })
}

function getProductName (product) {
  if (!product) {
    return ''
  }
  let name = product.fullName || product.name
  if (product.brand) {
    return `${product.brand.name} ${name}`
  } else {
    return name
  }
}

function getProductImage (product) {
  if (!product) {
    return ''
  }
  if (product.images && product.images.length) {
    return product.images[0]
  }
  let variant = product.variants && product.variants.filter(variant => variant.images)[0]
  if (variant) {
    return variant.images && variant.images[0]
  }
  return ''
}

// All sorted order status that are there
const getSortedOrderStatus = () => {
  let sortedStatues = ['PENDING']
  if (isExtensionEnabled('InStoreProcessing')) {
    sortedStatues = sortedStatues.concat(['PICKING', 'PICKED', 'CHECKING', 'CHECKED', 'PACKING', 'PACKED'])
  }
  if (isExtensionEnabled('LogisticsSupport')) {
    sortedStatues = sortedStatues.concat(['DISPATCHED'])
  }
  sortedStatues = sortedStatues.concat(['COMPLETED', 'CANCELLED'])
  if (isExtensionEnabled('OrderReturns')) {
    sortedStatues = sortedStatues.concat(['RETURNED'])
  }
  return sortedStatues
}

const allStatuses = ['PENDING', 'PICKING', 'PARTIALLY-PICKED', 'PICKED', 'CHECKING', 'CHECKED', 'PACKING', 'PACKED', 'DISPATCHED', 'COMPLETED', 'CANCELLED', 'RETURNED']

const getSelectOrderStatus = () => {
  let allStatuses = getSortedOrderStatus()
  return allStatuses.map(status => {
    return {
      text: getMessage(status),
      value: status
    }
  })
}

// If we give an array of statuses then this function gives the statuses in sequence
const sortOrderStatus = (statuses = []) => {
  const allStatuses = getSortedOrderStatus()
  return allStatuses.map(status => {
    if (statuses.indexOf(status) > -1) {
      return status
    }
    return false
  }).filter(Boolean)
}

function hasDuplicates (array) {
  return (new Set(array)).size !== array.length
}

const getCountryList = () => {
  return [
    {'name': 'Afghanistan', 'code': 'AF'},
    {'name': 'Åland Islands', 'code': 'AX'},
    {'name': 'Albania', 'code': 'AL'},
    {'name': 'Algeria', 'code': 'DZ'},
    {'name': 'American Samoa', 'code': 'AS'},
    {'name': 'AndorrA', 'code': 'AD'},
    {'name': 'Angola', 'code': 'AO'},
    {'name': 'Anguilla', 'code': 'AI'},
    {'name': 'Antarctica', 'code': 'AQ'},
    {'name': 'Antigua and Barbuda', 'code': 'AG'},
    {'name': 'Argentina', 'code': 'AR'},
    {'name': 'Armenia', 'code': 'AM'},
    {'name': 'Aruba', 'code': 'AW'},
    {'name': 'Australia', 'code': 'AU'},
    {'name': 'Austria', 'code': 'AT'},
    {'name': 'Azerbaijan', 'code': 'AZ'},
    {'name': 'Bahamas', 'code': 'BS'},
    {'name': 'Bahrain', 'code': 'BH'},
    {'name': 'Bangladesh', 'code': 'BD'},
    {'name': 'Barbados', 'code': 'BB'},
    {'name': 'Belarus', 'code': 'BY'},
    {'name': 'Belgium', 'code': 'BE'},
    {'name': 'Belize', 'code': 'BZ'},
    {'name': 'Benin', 'code': 'BJ'},
    {'name': 'Bermuda', 'code': 'BM'},
    {'name': 'Bhutan', 'code': 'BT'},
    {'name': 'Bolivia', 'code': 'BO'},
    {'name': 'Bosnia and Herzegovina', 'code': 'BA'},
    {'name': 'Botswana', 'code': 'BW'},
    {'name': 'Bouvet Island', 'code': 'BV'},
    {'name': 'Brazil', 'code': 'BR'},
    {'name': 'British Indian Ocean Territory', 'code': 'IO'},
    {'name': 'Brunei Darussalam', 'code': 'BN'},
    {'name': 'Bulgaria', 'code': 'BG'},
    {'name': 'Burkina Faso', 'code': 'BF'},
    {'name': 'Burundi', 'code': 'BI'},
    {'name': 'Cambodia', 'code': 'KH'},
    {'name': 'Cameroon', 'code': 'CM'},
    {'name': 'Canada', 'code': 'CA'},
    {'name': 'Cape Verde', 'code': 'CV'},
    {'name': 'Cayman Islands', 'code': 'KY'},
    {'name': 'Central African Republic', 'code': 'CF'},
    {'name': 'Chad', 'code': 'TD'},
    {'name': 'Chile', 'code': 'CL'},
    {'name': 'China', 'code': 'CN'},
    {'name': 'Christmas Island', 'code': 'CX'},
    {'name': 'Cocos (Keeling) Islands', 'code': 'CC'},
    {'name': 'Colombia', 'code': 'CO'},
    {'name': 'Comoros', 'code': 'KM'},
    {'name': 'Congo', 'code': 'CG'},
    {'name': 'Congo, The Democratic Republic of the', 'code': 'CD'},
    {'name': 'Cook Islands', 'code': 'CK'},
    {'name': 'Costa Rica', 'code': 'CR'},
    {'name': 'Cote D\'Ivoire', 'code': 'CI'},
    {'name': 'Croatia', 'code': 'HR'},
    {'name': 'Cuba', 'code': 'CU'},
    {'name': 'Cyprus', 'code': 'CY'},
    {'name': 'Czech Republic', 'code': 'CZ'},
    {'name': 'Denmark', 'code': 'DK'},
    {'name': 'Djibouti', 'code': 'DJ'},
    {'name': 'Dominica', 'code': 'DM'},
    {'name': 'Dominican Republic', 'code': 'DO'},
    {'name': 'Ecuador', 'code': 'EC'},
    {'name': 'Egypt', 'code': 'EG'},
    {'name': 'El Salvador', 'code': 'SV'},
    {'name': 'Equatorial Guinea', 'code': 'GQ'},
    {'name': 'Eritrea', 'code': 'ER'},
    {'name': 'Estonia', 'code': 'EE'},
    {'name': 'Ethiopia', 'code': 'ET'},
    {'name': 'Falkland Islands (Malvinas)', 'code': 'FK'},
    {'name': 'Faroe Islands', 'code': 'FO'},
    {'name': 'Fiji', 'code': 'FJ'},
    {'name': 'Finland', 'code': 'FI'},
    {'name': 'France', 'code': 'FR'},
    {'name': 'French Guiana', 'code': 'GF'},
    {'name': 'French Polynesia', 'code': 'PF'},
    {'name': 'French Southern Territories', 'code': 'TF'},
    {'name': 'Gabon', 'code': 'GA'},
    {'name': 'Gambia', 'code': 'GM'},
    {'name': 'Georgia', 'code': 'GE'},
    {'name': 'Germany', 'code': 'DE'},
    {'name': 'Ghana', 'code': 'GH'},
    {'name': 'Gibraltar', 'code': 'GI'},
    {'name': 'Greece', 'code': 'GR'},
    {'name': 'Greenland', 'code': 'GL'},
    {'name': 'Grenada', 'code': 'GD'},
    {'name': 'Guadeloupe', 'code': 'GP'},
    {'name': 'Guam', 'code': 'GU'},
    {'name': 'Guatemala', 'code': 'GT'},
    {'name': 'Guernsey', 'code': 'GG'},
    {'name': 'Guinea', 'code': 'GN'},
    {'name': 'Guinea-Bissau', 'code': 'GW'},
    {'name': 'Guyana', 'code': 'GY'},
    {'name': 'Haiti', 'code': 'HT'},
    {'name': 'Heard Island and Mcdonald Islands', 'code': 'HM'},
    {'name': 'Holy See (Vatican City State)', 'code': 'VA'},
    {'name': 'Honduras', 'code': 'HN'},
    {'name': 'Hong Kong', 'code': 'HK'},
    {'name': 'Hungary', 'code': 'HU'},
    {'name': 'Iceland', 'code': 'IS'},
    {'name': 'India', 'code': 'IN'},
    {'name': 'Indonesia', 'code': 'ID'},
    {'name': 'Iran, Islamic Republic Of', 'code': 'IR'},
    {'name': 'Iraq', 'code': 'IQ'},
    {'name': 'Ireland', 'code': 'IE'},
    {'name': 'Isle of Man', 'code': 'IM'},
    {'name': 'Israel', 'code': 'IL'},
    {'name': 'Italy', 'code': 'IT'},
    {'name': 'Jamaica', 'code': 'JM'},
    {'name': 'Japan', 'code': 'JP'},
    {'name': 'Jersey', 'code': 'JE'},
    {'name': 'Jordan', 'code': 'JO'},
    {'name': 'Kazakhstan', 'code': 'KZ'},
    {'name': 'Kenya', 'code': 'KE'},
    {'name': 'Kiribati', 'code': 'KI'},
    {'name': 'Korea, Democratic People\'S Republic of', 'code': 'KP'},
    {'name': 'Korea, Republic of', 'code': 'KR'},
    {'name': 'Kuwait', 'code': 'KW'},
    {'name': 'Kyrgyzstan', 'code': 'KG'},
    {'name': 'Lao People\'S Democratic Republic', 'code': 'LA'},
    {'name': 'Latvia', 'code': 'LV'},
    {'name': 'Lebanon', 'code': 'LB'},
    {'name': 'Lesotho', 'code': 'LS'},
    {'name': 'Liberia', 'code': 'LR'},
    {'name': 'Libyan Arab Jamahiriya', 'code': 'LY'},
    {'name': 'Liechtenstein', 'code': 'LI'},
    {'name': 'Lithuania', 'code': 'LT'},
    {'name': 'Luxembourg', 'code': 'LU'},
    {'name': 'Macao', 'code': 'MO'},
    {'name': 'Macedonia, The Former Yugoslav Republic of', 'code': 'MK'},
    {'name': 'Madagascar', 'code': 'MG'},
    {'name': 'Malawi', 'code': 'MW'},
    {'name': 'Malaysia', 'code': 'MY'},
    {'name': 'Maldives', 'code': 'MV'},
    {'name': 'Mali', 'code': 'ML'},
    {'name': 'Malta', 'code': 'MT'},
    {'name': 'Marshall Islands', 'code': 'MH'},
    {'name': 'Martinique', 'code': 'MQ'},
    {'name': 'Mauritania', 'code': 'MR'},
    {'name': 'Mauritius', 'code': 'MU'},
    {'name': 'Mayotte', 'code': 'YT'},
    {'name': 'Mexico', 'code': 'MX'},
    {'name': 'Micronesia, Federated States of', 'code': 'FM'},
    {'name': 'Moldova, Republic of', 'code': 'MD'},
    {'name': 'Monaco', 'code': 'MC'},
    {'name': 'Mongolia', 'code': 'MN'},
    {'name': 'Montserrat', 'code': 'MS'},
    {'name': 'Morocco', 'code': 'MA'},
    {'name': 'Mozambique', 'code': 'MZ'},
    {'name': 'Myanmar', 'code': 'MM'},
    {'name': 'Namibia', 'code': 'NA'},
    {'name': 'Nauru', 'code': 'NR'},
    {'name': 'Nepal', 'code': 'NP'},
    {'name': 'Netherlands', 'code': 'NL'},
    {'name': 'Netherlands Antilles', 'code': 'AN'},
    {'name': 'New Caledonia', 'code': 'NC'},
    {'name': 'New Zealand', 'code': 'NZ'},
    {'name': 'Nicaragua', 'code': 'NI'},
    {'name': 'Niger', 'code': 'NE'},
    {'name': 'Nigeria', 'code': 'NG'},
    {'name': 'Niue', 'code': 'NU'},
    {'name': 'Norfolk Island', 'code': 'NF'},
    {'name': 'Northern Mariana Islands', 'code': 'MP'},
    {'name': 'Norway', 'code': 'NO'},
    {'name': 'Oman', 'code': 'OM'},
    {'name': 'Pakistan', 'code': 'PK'},
    {'name': 'Palau', 'code': 'PW'},
    {'name': 'Palestinian Territory, Occupied', 'code': 'PS'},
    {'name': 'Panama', 'code': 'PA'},
    {'name': 'Papua New Guinea', 'code': 'PG'},
    {'name': 'Paraguay', 'code': 'PY'},
    {'name': 'Peru', 'code': 'PE'},
    {'name': 'Philippines', 'code': 'PH'},
    {'name': 'Pitcairn', 'code': 'PN'},
    {'name': 'Poland', 'code': 'PL'},
    {'name': 'Portugal', 'code': 'PT'},
    {'name': 'Puerto Rico', 'code': 'PR'},
    {'name': 'Qatar', 'code': 'QA'},
    {'name': 'Reunion', 'code': 'RE'},
    {'name': 'Romania', 'code': 'RO'},
    {'name': 'Russian Federation', 'code': 'RU'},
    {'name': 'RWANDA', 'code': 'RW'},
    {'name': 'Saint Helena', 'code': 'SH'},
    {'name': 'Saint Kitts and Nevis', 'code': 'KN'},
    {'name': 'Saint Lucia', 'code': 'LC'},
    {'name': 'Saint Pierre and Miquelon', 'code': 'PM'},
    {'name': 'Saint Vincent and the Grenadines', 'code': 'VC'},
    {'name': 'Samoa', 'code': 'WS'},
    {'name': 'San Marino', 'code': 'SM'},
    {'name': 'Sao Tome and Principe', 'code': 'ST'},
    {'name': 'Saudi Arabia', 'code': 'SA'},
    {'name': 'Senegal', 'code': 'SN'},
    {'name': 'Serbia and Montenegro', 'code': 'CS'},
    {'name': 'Seychelles', 'code': 'SC'},
    {'name': 'Sierra Leone', 'code': 'SL'},
    {'name': 'Singapore', 'code': 'SG'},
    {'name': 'Slovakia', 'code': 'SK'},
    {'name': 'Slovenia', 'code': 'SI'},
    {'name': 'Solomon Islands', 'code': 'SB'},
    {'name': 'Somalia', 'code': 'SO'},
    {'name': 'South Africa', 'code': 'ZA'},
    {'name': 'South Georgia and the South Sandwich Islands', 'code': 'GS'},
    {'name': 'Spain', 'code': 'ES'},
    {'name': 'Sri Lanka', 'code': 'LK'},
    {'name': 'Sudan', 'code': 'SD'},
    {'name': 'Suriname', 'code': 'SR'},
    {'name': 'Svalbard and Jan Mayen', 'code': 'SJ'},
    {'name': 'Swaziland', 'code': 'SZ'},
    {'name': 'Sweden', 'code': 'SE'},
    {'name': 'Switzerland', 'code': 'CH'},
    {'name': 'Syrian Arab Republic', 'code': 'SY'},
    {'name': 'Taiwan, Province of China', 'code': 'TW'},
    {'name': 'Tajikistan', 'code': 'TJ'},
    {'name': 'Tanzania, United Republic of', 'code': 'TZ'},
    {'name': 'Thailand', 'code': 'TH'},
    {'name': 'Timor-Leste', 'code': 'TL'},
    {'name': 'Togo', 'code': 'TG'},
    {'name': 'Tokelau', 'code': 'TK'},
    {'name': 'Tonga', 'code': 'TO'},
    {'name': 'Trinidad and Tobago', 'code': 'TT'},
    {'name': 'Tunisia', 'code': 'TN'},
    {'name': 'Turkey', 'code': 'TR'},
    {'name': 'Turkmenistan', 'code': 'TM'},
    {'name': 'Turks and Caicos Islands', 'code': 'TC'},
    {'name': 'Tuvalu', 'code': 'TV'},
    {'name': 'Uganda', 'code': 'UG'},
    {'name': 'Ukraine', 'code': 'UA'},
    {'name': 'United Arab Emirates', 'code': 'AE'},
    {'name': 'United Kingdom', 'code': 'GB'},
    {'name': 'United States', 'code': 'US'},
    {'name': 'United States Minor Outlying Islands', 'code': 'UM'},
    {'name': 'Uruguay', 'code': 'UY'},
    {'name': 'Uzbekistan', 'code': 'UZ'},
    {'name': 'Vanuatu', 'code': 'VU'},
    {'name': 'Venezuela', 'code': 'VE'},
    {'name': 'Viet Nam', 'code': 'VN'},
    {'name': 'Virgin Islands, British', 'code': 'VG'},
    {'name': 'Virgin Islands, U.S.', 'code': 'VI'},
    {'name': 'Wallis and Futuna', 'code': 'WF'},
    {'name': 'Western Sahara', 'code': 'EH'},
    {'name': 'Yemen', 'code': 'YE'},
    {'name': 'Zambia', 'code': 'ZM'},
    {'name': 'Zimbabwe', 'code': 'ZW'}
  ]
}

const getLanguages = () => {
  return [
    {
      name: 'Arabic',
      code: 'ar'
    },
    {
      name: 'Pashto',
      code: 'ps'
    },
    {
      name: 'Swedish',
      code: 'sv'
    },
    {
      name: 'Albanian',
      code: 'sq'
    },
    {
      name: 'Catalan',
      code: 'ca'
    },
    {
      name: 'Portuguese',
      code: 'pt'
    },
    {
      name: 'Spanish',
      code: 'es'
    },
    {
      name: 'Armenian',
      code: 'hy'
    },
    {
      name: 'Dutch',
      code: 'nl'
    },
    {
      name: 'German',
      code: 'de'
    },
    {
      name: 'Azerbaijani',
      code: 'az'
    },
    {
      name: 'Bengali',
      code: 'bn'
    },
    {
      name: 'Belarusian',
      code: 'be'
    },
    {
      name: 'French',
      code: 'fr'
    },
    {
      name: 'Dzongkha',
      code: 'dz'
    },
    {
      name: 'Bosnian',
      code: 'bs'
    },
    {
      name: 'Norwegian',
      code: 'no'
    },
    {
      name: 'Malay',
      code: 'ms'
    },
    {
      name: 'Bulgarian',
      code: 'bg'
    },
    {
      name: 'Khmer',
      code: 'km'
    },
    {
      name: 'Chinese',
      code: 'zh'
    },
    {
      name: 'Croatian',
      code: 'hr'
    },
    {
      name: 'Greek (modern)',
      code: 'el'
    },
    {
      name: 'Czech',
      code: 'cs'
    },
    {
      name: 'Danish',
      code: 'da'
    },
    {
      name: 'Tigrinya',
      code: 'ti'
    },
    {
      name: 'Estonian',
      code: 'et'
    },
    {
      name: 'Amharic',
      code: 'am'
    },
    {
      name: 'Faroese',
      code: 'fo'
    },
    {
      name: 'Finnish',
      code: 'fi'
    },
    {
      name: 'Georgian',
      code: 'ka'
    },
    {
      name: 'Kalaallisut',
      code: 'kl'
    },
    {
      name: 'Latin',
      code: 'la'
    },
    {
      name: 'Hungarian',
      code: 'hu'
    },
    {
      name: 'Icelandic',
      code: 'is'
    },
    {
      name: 'Hindi',
      code: 'hi'
    },
    {
      name: 'Indonesian',
      code: 'id'
    },
    {
      name: 'Persian (Farsi)',
      code: 'fa'
    },
    {
      name: 'Irish',
      code: 'ga'
    },
    {
      name: 'Hebrew (modern)',
      code: 'he'
    },
    {
      name: 'Italian',
      code: 'it'
    },
    {
      name: 'Japanese',
      code: 'ja'
    },
    {
      name: 'Kazakh',
      code: 'kk'
    },
    {
      name: 'Kyrgyz',
      code: 'ky'
    },
    {
      name: 'Lao',
      code: 'lo'
    },
    {
      name: 'Latvian',
      code: 'lv'
    },
    {
      name: 'Lithuanian',
      code: 'lt'
    },
    {
      name: 'Macedonian',
      code: 'mk'
    },
    {
      name: 'Malaysian',
      code: 'null'
    },
    {
      name: 'Divehi',
      code: 'dv'
    },
    {
      name: 'Maltese',
      code: 'mt'
    },
    {
      name: 'Romanian',
      code: 'ro'
    },
    {
      name: 'Mongolian',
      code: 'mn'
    },
    {
      name: 'Serbian',
      code: 'sr'
    },
    {
      name: 'Burmese',
      code: 'my'
    },
    {
      name: 'Nepali',
      code: 'ne'
    },
    {
      name: 'Korean',
      code: 'ko'
    },
    {
      name: 'Polish',
      code: 'pl'
    },
    {
      name: 'Russian',
      code: 'ru'
    },
    {
      name: 'Kinyarwanda',
      code: 'rw'
    },
    {
      name: 'Samoan',
      code: 'sm'
    },
    {
      name: 'Slovak',
      code: 'sk'
    },
    {
      name: 'Slovene',
      code: 'sl'
    },
    {
      name: 'Somali',
      code: 'so'
    },
    {
      name: 'Afrikaans',
      code: 'af'
    },
    {
      name: 'Sinhalese',
      code: 'si'
    },
    {
      name: 'Tajik',
      code: 'tg'
    },
    {
      name: 'Swahili',
      code: 'sw'
    },
    {
      name: 'Thai',
      code: 'th'
    },
    {
      name: 'Turkish',
      code: 'tr'
    },
    {
      name: 'Turkmen',
      code: 'tk'
    },
    {
      name: 'Ukrainian',
      code: 'uk'
    },
    {
      name: 'Uzbek',
      code: 'uz'
    },
    {
      name: 'Bislama',
      code: 'bi'
    },
    {
      name: 'Vietnamese',
      code: 'vi'
    },
    {
      name: 'Tamil',
      code: 'ta'
    },
    {
      name: 'Tamil (India)',
      code: 'ta-IN'
    },
    {
      name: 'Gujarati',
      code: 'gu'
    },
    {
      name: 'Gujarati (India)',
      code: 'gu-IN'
    },
    {
      name: 'Kannada',
      code: 'kn'
    },
    {
      name: 'Kannada (India)',
      code: 'kn-IN'
    },
    {
      name: 'Marathi',
      code: 'mr'
    },
    {
      name: 'Marathi (India)',
      code: 'mr-IN'
    },
    {
      name: 'Punjabi',
      code: 'pa'
    },
    {
      name: 'Punjabi (India)',
      code: 'pa-IN'
    },
    {
      name: 'Sanskrit',
      code: 'sa'
    },
    {
      name: 'Sanskrit (India)',
      code: 'sa-IN'
    },
    {
      name: 'Telugu',
      code: 'te'
    },
    {
      name: 'Telugu (India)',
      code: 'te-IN'
    }
  ]
}
const roleMapping = [
  {
    name: 'CHAT VIEW',
    redirect: 'messages'
  },
  {
    name: 'TASK MANAGEMENT',
    redirect: '/employees'
  },
  {
    name: 'EMPLOYEE MANAGEMENT',
    redirect: '/employee'
  }
]

const getStepValue = (num) => {
  if (num) {
    let stringifiedNum = String(num)

    let decimalDigits = stringifiedNum.split('.')

    if (decimalDigits.length > 1) {
      let decimalPlaces = decimalDigits[1].length

      return (1 / Math.pow(10, decimalPlaces))
    }
  }
}

const isAllRulesValid = (rules = [], requiredFields = [], itemDiscountType = 'COMBO_DISCOUNT') => {
  for (let i = 0; i < rules.length; i++) {
    for (let j = 0; j < requiredFields.length; j++) {
      if (itemDiscountType !== 'COMBO_DISCOUNT' && requiredFields[j] === 'total') continue
      let value = rules[i][requiredFields[j]]
      if (!value) {
        return false
      } else if (typeof value === 'object' && isEmpty(value)) {
        return false
      }
    }
    if (itemDiscountType !== 'COMBO_DISCOUNT') {
      let products = rules[i].product
      return products.every(product => product.q && product.t && product.v)
    }
  }

  return true
}

const getNestedValues = function (obj, keys) {
  let stateReference = obj
  while (keys.length) {
    if (stateReference && (['boolean', 'string', 'number'].indexOf(typeof stateReference[keys[0]]) > -1)) {
      return stateReference[keys[0]]
    } else if (stateReference && (stateReference[keys[0]] || stateReference[keys[0]] === '')) {
      stateReference = stateReference[keys.shift()]
    } else {
      return null
    }
  }
  return stateReference
}

export {
  roleMapping,
  getAsapDuration,
  sortAsapSlots,
  sortStandardSlots,
  sortSlots,
  getTimes,
  getCountryList,
  getDisplayAddress,
  getDisplaySlot,
  getMinutes,
  camelToReading,
  storeSelection,
  toTitleCase,
  getProductName,
  getProductImage,
  getLanguages,
  slotSelectOptions,
  sortSlotsAvailability,
  getSortedOrderStatus,
  getSelectOrderStatus,
  sortOrderStatus,
  allStatuses,
  hasDuplicates,
  getStepValue,
  isAllRulesValid,
  getNestedValues
}
