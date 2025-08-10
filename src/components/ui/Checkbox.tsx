'use client'

import React, { forwardRef } from 'react'
import { clsx } from 'clsx'

interface CheckboxProps {
  label?: string
  description?: string
  error?: string
  disabled?: boolean
  className?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  disabled = false,
  className = '',
  checked,
  onChange,
  ...props
}, ref) => {
  return (
    <div className={clsx('relative', className)}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className={clsx(
              'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label className={clsx(
                'font-medium',
                error ? 'text-red-700' : 'text-gray-700',
                disabled && 'cursor-not-allowed opacity-50'
              )}>
                {label}
              </label>
            )}
            {description && (
              <p className={clsx(
                'text-gray-500',
                disabled && 'opacity-50'
              )}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})