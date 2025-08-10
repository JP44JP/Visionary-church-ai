'use client'

import React from 'react'
import { clsx } from 'clsx'
import { BaseProps } from '../../types'

export function Card({ children, className = '' }: BaseProps) {
  return (
    <div className={clsx(
      'bg-white shadow rounded-lg border border-gray-200',
      className
    )}>
      {children}
    </div>
  )
}