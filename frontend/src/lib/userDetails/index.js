import { getSession } from '../auth'

function getCurrency () {
  const organization = getSession().organization
  return organization && organization.currency
}

export { getCurrency }
