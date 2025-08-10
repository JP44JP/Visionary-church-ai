'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface BrandCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'brand' | 'elevated' | 'interactive' | 'church'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  hover?: boolean
  glow?: boolean
  gradient?: boolean
}

const BrandCard: React.FC<BrandCardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  hover = false,
  glow = false,
  gradient = false,
  className,
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    default: 'card',
    brand: 'card-brand',
    elevated: 'card-elevated',
    interactive: 'card-interactive',
    church: 'card-church'
  }

  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        glow && 'glow-brand',
        gradient && 'bg-gradient-to-br from-brand-primary-50 to-brand-secondary-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default BrandCard

// Pre-configured card variants for specific use cases

interface ChurchFeatureCardProps extends Omit<BrandCardProps, 'variant'> {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export const ChurchFeatureCard: React.FC<ChurchFeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) => (
  <BrandCard variant="church" hover className={cn('text-center', className)} {...props}>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center text-white text-2xl">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold font-display text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  </BrandCard>
)

interface TestimonialCardProps extends Omit<BrandCardProps, 'variant'> {
  quote: string
  author: string
  role: string
  church: string
  avatar?: string
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  church,
  avatar,
  className,
  ...props
}) => (
  <BrandCard variant="elevated" className={cn('relative overflow-hidden', className)} {...props}>
    {/* Quote decoration */}
    <div className="absolute top-4 right-4 text-6xl text-brand-primary-100 font-serif leading-none">
      "
    </div>
    
    <div className="relative space-y-4">
      <blockquote className="text-gray-700 italic leading-relaxed">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center space-x-3 pt-2">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-brand rounded-full flex items-center justify-center text-white font-semibold">
            {author.charAt(0)}
          </div>
        )}
        
        <div>
          <div className="font-medium text-gray-900">{author}</div>
          <div className="text-sm text-gray-600">{role}, {church}</div>
        </div>
      </div>
    </div>
  </BrandCard>
)

interface PricingCardProps extends Omit<BrandCardProps, 'variant'> {
  plan: string
  price: string | number
  period?: string
  features: string[]
  popular?: boolean
  action: React.ReactNode
}

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  price,
  period = 'month',
  features,
  popular = false,
  action,
  className,
  ...props
}) => (
  <BrandCard
    variant={popular ? 'brand' : 'elevated'}
    className={cn(
      'relative text-center',
      popular && 'border-2 border-brand-primary-500 shadow-brand-lg',
      className
    )}
    {...props}
  >
    {popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-brand text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      </div>
    )}
    
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold font-display text-gray-900">{plan}</h3>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold font-display text-gray-900">
            {typeof price === 'number' ? `$${price}` : price}
          </span>
          {period && (
            <span className="text-gray-600 ml-1">/{period}</span>
          )}
        </div>
      </div>
      
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 text-brand-primary-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      
      <div className="pt-4">
        {action}
      </div>
    </div>
  </BrandCard>
)

interface StatCardProps extends Omit<BrandCardProps, 'variant'> {
  value: string | number
  label: string
  change?: {
    value: string | number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  color?: 'primary' | 'secondary' | 'accent' | 'supporting'
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  change,
  icon,
  color = 'primary',
  className,
  ...props
}) => {
  const colorClasses = {
    primary: 'text-brand-primary-600 bg-brand-primary-50',
    secondary: 'text-brand-secondary-600 bg-brand-secondary-50',
    accent: 'text-brand-accent-600 bg-brand-accent-50',
    supporting: 'text-brand-supporting-600 bg-brand-supporting-50'
  }

  const changeColorClasses = {
    increase: 'text-green-600 bg-green-50',
    decrease: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  }

  return (
    <BrandCard variant="default" className={className} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-2xl font-bold font-display text-gray-900">
            {value}
          </p>
          <p className="text-sm text-gray-600">{label}</p>
          
          {change && (
            <div className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              changeColorClasses[change.type]
            )}>
              {change.type === 'increase' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {change.type === 'decrease' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {change.value}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            colorClasses[color]
          )}>
            {icon}
          </div>
        )}
      </div>
    </BrandCard>
  )
}