// This file containes all the form validations
const validPincode = pincode => {
  return pincode.toString().match(/^[0-9][0-9]{5}$/)
}

const validName = name => {
  return name.startsWith(' ')
}

const validPhoneNumber = phoneNumber => {
  return (
    phoneNumber &&
    !isNaN(Number(phoneNumber)) &&
    phoneNumber.match(
      /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/
    )
  )
}

const validPassword = password => {
  if (password) {
    // Minimum of 8 characters with at least 1 number and 1 alphabet
    return /^(?=.*[a-z])(?=.*[0-9]).{8,}$/i.test(password.toString())
  }
  return
}

/**
 * can begin with a letter or digit or . or _ or - or % or +
 * and should contain "@" and followed by one or more characters
 * and followed by "." and one or more charaters
 */
const validEmail = email =>
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  )

export { validPincode, validName, validPhoneNumber, validEmail, validPassword }
