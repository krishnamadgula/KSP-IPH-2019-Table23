import React, { useState } from 'react'
import styled from 'styled-components'
import Input from '../Input'
import { validEmail } from '../../lib/formValidation'
import { AuthConsumer } from '../AuthProvider'

const Container = styled.section`
  display: flex;
  flex-direction: column;
  max-width: 23.5rem;
  margin: 2rem auto;
`

const HeaderText = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: #3f51b5;
  text-align: center;
  line-height: 1.6;

  @media (min-width: 768px) {
    font-size: 1.875rem;
    font-weight: 700;
  }
`

const SubHeader = styled.span`
  font-size: 0.875rem;
  text-align: center;
  line-height: 1.6;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`

const StyledHr = styled.hr`
  width: 3rem;
  margin: 1.5rem auto;
  border: 1px solid #7e7efc;
  box-shadow: 0 4px 4px 0 #ffdfde;
`

const Submit = styled(Input)`
  padding: 0.65rem 0;
  background-color: #3f51b5;
  color: #ffffff;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  width: 100%;

  :disabled {
    opacity: 0.7;
  }
`

const LoginAttemptError = styled.span`
  font-size: 0.75rem;
  color: #ea353a;
  display: block;
  padding-bottom: 0.5rem;
`

export const HeaderSection = ({ header, subHeader }) => (
  <>
    <HeaderText>{header}</HeaderText>
    <SubHeader>{subHeader}</SubHeader>
    <StyledHr />
  </>
)

function LoginForm(props) {
  const [data, setData] = useState({})
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    let { name, value } = event.target

    setData({ ...data, [name]: value })

    if (value === '') {
      setErrors({ ...errors, [name]: '*Required' })
    } else if (value.length > 0 && errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  function validate() {
    let errors = {}
    let isFormValid = true

    if (!data.email) {
      errors.email = '*Required'
      isFormValid = false
    } else if (!validEmail(data.email)) {
      errors.email = '*Not a valid email'
      isFormValid = false
    }
    if (!data.password) {
      errors.password = '*Required'
      isFormValid = false
    }

    setErrors(errors)
    return isFormValid
  }

  function onLogin() {
    setSubmitting(false)
    // If we need some additional actions, this can be used. Otherwise, it can be removed later
    props.onLogin && props.onLogin()
    if (props.router && props.router.query && props.router.query.redirect) {
      props.router.push(props.router.query.redirect)
    } else {
      props.router.push('/')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) {
      if (errors.loginAttempt && errors.loginAttempt.trim().length > 0) {
        setErrors({ ...errors, loginAttempt: '' })
      }
      return
    }

    setSubmitting(true)

    props
      .login(data)
      .then(onLogin)
      .catch(() => {
        setErrors({
          ...errors,
          loginAttempt: 'Username/Password does not match',
        })
        setSubmitting(false)
      })
  }

  return (
    <Container>
      <HeaderSection
        header="Sign in to UNION"
        subHeader="Enter your details below"
      />
      <form onSubmit={handleSubmit} noValidate>
        <Input
          name="email"
          label="username"
          value={data.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="true"
        />
        <Input
          name="password"
          label="password"
          type="password"
          value={data.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="true"
        />
        {errors.loginAttempt && (
          <LoginAttemptError>{errors.loginAttempt}</LoginAttemptError>
        )}
        <Submit
          value={submitting ? 'Signing In' : 'Sign In'}
          type="submit"
          disabled={submitting}
        />
      </form>
    </Container>
  )
}

const LoginFormWrapper = props => (
  <AuthConsumer>
    {({ login }) => <LoginForm login={login} {...props} />}
  </AuthConsumer>
)

export default LoginFormWrapper
