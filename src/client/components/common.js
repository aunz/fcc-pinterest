import React from 'react'

export function Loading(props) {
  return <span {...props} className={'icon-spin6 animate-spin ' + (props.className || '')} />
}
