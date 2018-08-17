import React from 'react'

export function Loading(props) {
  return <span {...props} className={'icon-spin6 animate-spin ' + (props.className || '')} />
}

export const inputClass = ' p1 outline-none '

export const buttonClass = inputClass + ' pointer button '
