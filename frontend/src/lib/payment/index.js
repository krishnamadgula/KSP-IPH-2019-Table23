import Visa from './visa.svg'
import MasterCard from './mastercard.svg'
import Amex from './americanExpress.svg'
import Generic from './genericCard.svg'
function getPaymentLogo (paymentMode) {
  let icon = Generic
  switch (paymentMode) {
    case 'VISA':
    case 'visa':
      icon = Visa
      break
    case 'MASTER':
    case 'MASTERCARD':
      icon = MasterCard
      break
    case 'AMEX':
    case 'AMERICANEXPRESS':
      icon = Amex
      break
    default:
      icon = Generic
  }
  return icon
}

function formatCardNumber (number, type) {
  if (!number) {
    return ''
  }
  return `${type ? type.charAt(0).toUpperCase() + type.toLowerCase().slice(1) + ' - ' : ''} XXXX${number.substr(number.length - 4)}`
}

export {
  getPaymentLogo,
  formatCardNumber
}
