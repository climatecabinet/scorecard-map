import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'rebass'

import { Flex, Box, Columns, Column as BaseColumn } from '../Grid'

import styled from '../../../util/style'

const Wrapper = styled.div`
  cursor: pointer;
  position: absolute;
  right: 10px;
  bottom: 24px;
  z-index: 10000;
  background-color: #fff;
  border-radius: 0.5rem;
  border: 1px solid #000000;
  box-shadow: 1px 1px 4px #666;
  padding: 0.25rem 0.5rem 0.5rem;
  max-height: 90%;
  overflow-y: auto;
  overflow-x: hidden;
`

const Column = styled(BaseColumn)`
  max-width: 200px;
  &:not(:first-child) {
    margin-left: 1rem;
  }
`

const Title = styled(Text).attrs({
  fontSize: ['0.8rem', '0.8rem', '1rem'],
})``

const Patch = styled(Box).attrs({
  flex: 0,
})`
  flex: 0 0 1.25rem;
  width: 1.25rem;
  height: 1.25rem;
  background-color: ${({ color }) => color || 'transparent'};
  border-style: solid;
  border-width: ${({ borderWidth }) => borderWidth || 0}px;
  border-color: ${({ borderColor }) => borderColor || 'transparent'};
  border-radius: 0.25rem;
`

const Label = styled(Box).attrs({})`
  font-size: 0.7rem;
  color: #000000;
  margin-left: 0.5rem;
`

const Circle = ({ radius, color, borderColor, borderWidth, scale }) => {
  const width = 2 * borderWidth + 2 * radius * scale
  const center = width / 2

  return (
    <svg style={{ width, height: width }}>
      <circle
        cx={center}
        cy={center}
        r={radius * 0.75 * scale}
        fill={color}
        stroke={borderColor}
        strokeWidth={borderWidth}
      />
    </svg>
  )
}

Circle.propTypes = {
  radius: PropTypes.number.isRequired,
  color: PropTypes.string,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.number,
  scale: PropTypes.number,
}

Circle.defaultProps = {
  borderWidth: 0,
  color: null,
  borderColor: null,
  scale: 1,
}

const EntryWrapper = styled(Flex).attrs({
  alignItems: 'center',
})`
  &:not(:first-child) {
    margin-top: 0.25rem;
  }
`

const Entry = ({ type, label, ...entry }) => (
  <EntryWrapper>
    {type === 'circle' ? (
      <Circle scale={0.75} {...entry} />
    ) : (
      <Patch {...entry} />
    )}
    <Label>{label}</Label>
  </EntryWrapper>
)

Entry.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
}

const Legend = ({ title, entries }) => {
  if (!entries.length) return null

  const [isClosed, setIsClosed] = useState(false) // TODO: fix useState error 
  const toggle = () => setIsClosed(prevIsClosed => !prevIsClosed)

  const cols = []
  if (entries.length > 6) {
    const numCols = entries.length / 4
    for (let i = 0; i < numCols; i += 1) {
      cols.push(entries.slice(i * 4, i * 4 + 4))
    }
    console.log(entries, cols)
  }

  return (
    <Wrapper
      title={isClosed ? 'click to open' : 'click to hide'}
      onClick={toggle}
    >
    <Columns>
          {cols.length ? (
            <>
              {cols.map((colEntries, i) => (
                <Column key={i}>
                  {colEntries.map(entry => (
                    <Entry key={entry.label} {...entry} />
                  ))}
                </Column>
              ))}
              <Column>
                {entries.slice(0, Math.round(entries.length / 2)).map(entry => (
                  <Entry key={entry.label} {...entry} />
                ))}
              </Column>
              <Column>
                {entries
                  .slice(Math.round(entries.length / 2), entries.length)
                  .map(entry => (
                    <Entry key={entry.label} {...entry} />
                  ))}
              </Column>
            </>
          ) : (
            <Column>
              {entries.map(entry => (
                <Entry key={entry.label} {...entry} />
              ))}
            </Column>
          )}
        </Columns>
      )}
    </Wrapper>
  )
}

Legend.propTypes = {
  title: PropTypes.string,
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      color: PropTypes.string,
      borderColor: PropTypes.string,
      borderWidth: PropTypes.number,
      radius: PropTypes.number,
    })
  ),
}

Legend.defaultProps = {
  title: 'Legend',
  entries: [],
}

export default Legend