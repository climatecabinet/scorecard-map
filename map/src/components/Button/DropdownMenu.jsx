import React, { memo } from "react"
import PropTypes from "prop-types"

import styled, { themeGet } from "../../../util/style"

const DropDownContainer = styled("div")`
  width: 10.5em;
  margin: 0 auto;
`;

const DropDownHeader = styled("div")`
  margin-bottom: 0.8em;
  padding: 0.4em 2em 0.4em 1em;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  font-size: 1.3rem;
  color: #3faffa;
  background: #ffffff;
`;

const DropDownListContainer = styled("div")``;

const DropDownList = styled("ul")`
  padding: 0;
  margin: 0;
  padding-left: 1em;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  box-sizing: border-box;
  color: #3faffa;
  font-size: 1.3rem;
  font-weight: 500;
  &:first-child {
    padding-top: 0.8em;
  }
`;

const ListItem = styled("li")`
  list-style: none;
  margin-bottom: 0.8em;
`;

const DropDownMenu = ({ value, options, onChange, ...props }) => {
  const handleClick = newValue => {
    if (newValue === value) return

    onChange(newValue)
  }

  if (value === null)
    return (
      <DropDownListContainer {...props}>
        {options.map(({ value: v, label }) => (
          <DropDownList key={v} onClick={() => handleClick(v)}>
            {label}
          </DropDownList>
        ))}
      </DropDownListContainer>
    )

  return (
    <DropDownListContainer {...props}>
      {options.map(({ value: v, label }) =>
        v === value ? (
          <DropDownHeader key={v}>{label}</DropDownHeader>
        ) : (
          <DropDownList key={v} onClick={() => handleClick(v)}>
            {label}
          </DropDownList>
        )
      )}
    </DropDownListContainer>
  )
}

DropDownMenu.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired
}

DropDownMenu.defaultProps = {
  value: null
}

export default memo(
  DropDownMenu,
  ({ value: prevValue }, { value: nextValue }) => prevValue === nextValue
)