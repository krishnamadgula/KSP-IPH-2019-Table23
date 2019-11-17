import React, { useRef, useEffect } from 'react'
import styled from 'styled-components'

const ErrorMessage = styled.div`
  font-size: 0.75rem;
  color: #ea353a;
  padding: 0.25rem 0;
`

const StyledInput = styled.input`
  padding: 0.6rem;
  border: solid 1px
    ${({ error }) => (error ? '#ea353a' : 'rgba(0, 0, 0, 0.15)')};
  border-radius: 4px;
  width: calc(100% - 1.2rem);
  outline-color: ${({ error }) => (error ? 'transparent' : '#8c78ff')};
`

const StyledLabel = styled.label`
  display: block;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: ${({ value }) => (value ? '500' : '600')};
  color: ${({ value }) => (value ? 'rgba(0, 0, 0, 0.5)' : '#000')};
  margin: 0.65rem 0;
`

const Input = props => {
  const inputRef = useRef(null)

  useEffect(() => {
    if (props.autoFocus) {
      inputRef && inputRef.current && inputRef.current.focus()
    }
  }, [props.autoFocus])

  return (
    <div css={props.containerStyle}>
      <StyledLabel htmlFor={props.id || props.name} value={props.value}>
        {props.label}
      </StyledLabel>
      <StyledInput
        id={props.id || props.name}
        name={props.name}
        className={props.className}
        placeholder={props.placeholder}
        type={props.type}
        value={props.value || ''}
        onChange={props.onChange}
        disabled={props.disabled}
        autoComplete={props.autoComplete}
        onKeyPress={props.onKeyPress}
        onKeyUp={props.onKeyUp}
        required={props.required}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        error={props.error}
        autoFocus={props.autoFocus}
        ref={inputRef}
      />
      {props.error && <ErrorMessage>{props.error}</ErrorMessage>}
    </div>
  )
}

export default Input
