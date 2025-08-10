'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BrandButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'primary' | 'secondary' | 'outline' | 'outline-brand' | 'ghost' | 'worship' | 'community' | 'growth'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(({
  variant = 'brand',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}, ref) => {
  
  // Variant classes
  const variantClasses = {
    brand: 'btn-brand',
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    'outline-brand': 'btn-outline-brand',
    ghost: 'btn-ghost',
    worship: 'btn-worship',
    community: 'btn-community',
    growth: 'btn-growth'
  }

  // Size classes
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl'
  }

  return (
    <button
      ref={ref}
      className={cn(
        'btn',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className={cn(
          'spinner-brand mr-2',
          size === 'xs' ? 'w-3 h-3' :
          size === 'sm' ? 'w-4 h-4' :
          size === 'md' ? 'w-4 h-4' :
          size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'
        )} />
      )}
      
      {/* Left Icon */}
      {leftIcon && !loading && (
        <span className={cn(
          'flex-shrink-0',
          children && 'mr-2',
          size === 'xs' ? 'w-3 h-3' :
          size === 'sm' ? 'w-4 h-4' :
          size === 'md' ? 'w-4 h-4' :
          size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'
        )}>
          {leftIcon}
        </span>
      )}
      
      {/* Button Content */}
      <span className={cn(
        loading && 'opacity-0',
        'flex items-center justify-center'
      )}>
        {children}
      </span>
      
      {/* Right Icon */}
      {rightIcon && !loading && (
        <span className={cn(
          'flex-shrink-0',
          children && 'ml-2',
          size === 'xs' ? 'w-3 h-3' :
          size === 'sm' ? 'w-4 h-4' :
          size === 'md' ? 'w-4 h-4' :
          size === 'lg' ? 'w-5 h-5' : 'w-6 h-6'
        )}>
          {rightIcon}
        </span>
      )}
    </button>
  )
})

BrandButton.displayName = 'BrandButton'

export default BrandButton

// Pre-configured button variants for specific use cases
export const WelcomeButton = forwardRef<HTMLButtonElement, Omit<BrandButtonProps, 'variant'>>(
  (props, ref) => <BrandButton ref={ref} variant="brand" {...props} />
)
WelcomeButton.displayName = 'WelcomeButton'

export const WorshipButton = forwardRef<HTMLButtonElement, Omit<BrandButtonProps, 'variant'>>(
  (props, ref) => <BrandButton ref={ref} variant="worship" {...props} />
)
WorshipButton.displayName = 'WorshipButton'

export const CommunityButton = forwardRef<HTMLButtonElement, Omit<BrandButtonProps, 'variant'>>(
  (props, ref) => <BrandButton ref={ref} variant="community" {...props} />
)
CommunityButton.displayName = 'CommunityButton'

export const GrowthButton = forwardRef<HTMLButtonElement, Omit<BrandButtonProps, 'variant'>>(
  (props, ref) => <BrandButton ref={ref} variant="growth" {...props} />
)
GrowthButton.displayName = 'GrowthButton'