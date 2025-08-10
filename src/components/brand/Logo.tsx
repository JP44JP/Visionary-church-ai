'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'full' | 'icon' | 'text' | 'stacked'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  theme?: 'light' | 'dark' | 'brand' | 'monochrome'
  className?: string
  animated?: boolean
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  size = 'md',
  theme = 'brand',
  className,
  animated = false
}) => {
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
    '2xl': 'h-20'
  }

  const iconSizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8', 
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
    '2xl': 'h-20 w-20'
  }

  // Color schemes based on theme
  const colorSchemes = {
    brand: {
      primary: '#3B82F6',
      secondary: '#9333EA', 
      accent: '#F59E0B',
      text: '#1F2937'
    },
    light: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      accent: '#E2E8F0',
      text: '#FFFFFF'
    },
    dark: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#6B7280',
      text: '#1F2937'
    },
    monochrome: {
      primary: '#000000',
      secondary: '#374151',
      accent: '#6B7280',
      text: '#000000'
    }
  }

  const colors = colorSchemes[theme]

  // Logo Icon Component
  const LogoIcon = () => (
    <div className={cn(
      iconSizeClasses[size],
      'relative flex items-center justify-center rounded-lg overflow-hidden',
      animated && 'animate-glow',
      className
    )}>
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="50%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.accent} />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.primary} />
          </linearGradient>
        </defs>
        
        {/* Main logo shape - Abstract church/vision symbol */}
        <path 
          d="M24 4C32 4 38 10 38 18C38 26 32 32 24 32C16 32 10 26 10 18C10 10 16 4 24 4Z" 
          fill="url(#brandGradient)"
          className={animated ? 'animate-pulse-slow' : ''}
        />
        
        {/* Inner vision symbol */}
        <circle 
          cx="24" 
          cy="18" 
          r="6" 
          fill={theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'}
          className={animated ? 'animate-glow' : ''}
        />
        
        {/* AI connection nodes */}
        <circle cx="18" cy="15" r="2" fill="url(#accentGradient)" />
        <circle cx="30" cy="15" r="2" fill="url(#accentGradient)" />
        <circle cx="24" cy="25" r="2" fill="url(#accentGradient)" />
        
        {/* Connection lines */}
        <path 
          d="M20 16L28 16M24 20L24 23" 
          stroke={theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)'} 
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Foundation/base */}
        <path 
          d="M12 36C12 34 16 32 24 32C32 32 36 34 36 36C36 38 32 40 24 40C16 40 12 38 12 36Z" 
          fill={colors.secondary}
          opacity="0.6"
        />
        
        {/* Text 'V' and 'C' initials integrated */}
        <text 
          x="24" 
          y="20" 
          textAnchor="middle" 
          className="text-xs font-bold fill-white"
          style={{ fontSize: '8px' }}
        >
          VC
        </text>
      </svg>
    </div>
  )

  // Logo Text Component
  const LogoText = ({ includeAI = true }: { includeAI?: boolean }) => (
    <div className={cn('flex items-center space-x-2', className)}>
      <span 
        className={cn(
          'font-display font-bold',
          theme === 'light' ? 'text-white' : theme === 'dark' ? 'text-gray-900' : 'text-gray-900',
          size === 'xs' ? 'text-sm' :
          size === 'sm' ? 'text-base' :
          size === 'md' ? 'text-xl' :
          size === 'lg' ? 'text-2xl' :
          size === 'xl' ? 'text-3xl' : 'text-4xl',
          animated && 'animate-slide-up'
        )}
      >
        VisionaryChurch
      </span>
      {includeAI && (
        <span 
          className={cn(
            'font-medium',
            theme === 'brand' ? 'text-brand-primary-600' : 
            theme === 'light' ? 'text-brand-accent-300' :
            theme === 'dark' ? 'text-gray-600' : 'text-gray-600',
            size === 'xs' ? 'text-xs' :
            size === 'sm' ? 'text-sm' :
            size === 'md' ? 'text-sm' :
            size === 'lg' ? 'text-lg' :
            size === 'xl' ? 'text-xl' : 'text-2xl',
            animated && 'animate-slide-left'
          )}
        >
          AI
        </span>
      )}
    </div>
  )

  // Render different variants
  switch (variant) {
    case 'icon':
      return <LogoIcon />
    
    case 'text':
      return <LogoText />
      
    case 'stacked':
      return (
        <div className={cn('flex flex-col items-center space-y-2', className)}>
          <LogoIcon />
          <LogoText includeAI={true} />
        </div>
      )
    
    case 'full':
    default:
      return (
        <div className={cn('flex items-center space-x-3', className)}>
          <LogoIcon />
          <LogoText />
        </div>
      )
  }
}

export default Logo

// Utility function to get logo as SVG string (for email signatures, etc.)
export const getLogoSVG = (theme: 'brand' | 'light' | 'dark' = 'brand') => {
  const colorSchemes = {
    brand: {
      primary: '#3B82F6',
      secondary: '#9333EA', 
      accent: '#F59E0B'
    },
    light: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      accent: '#E2E8F0'
    },
    dark: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#6B7280'
    }
  }
  
  const colors = colorSchemes[theme]
  
  return `
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors.primary}" />
          <stop offset="50%" stop-color="${colors.secondary}" />
          <stop offset="100%" stop-color="${colors.accent}" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors.accent}" />
          <stop offset="100%" stop-color="${colors.primary}" />
        </linearGradient>
      </defs>
      <path d="M24 4C32 4 38 10 38 18C38 26 32 32 24 32C16 32 10 26 10 18C10 10 16 4 24 4Z" fill="url(#brandGradient)" />
      <circle cx="24" cy="18" r="6" fill="rgba(255,255,255,0.2)" />
      <circle cx="18" cy="15" r="2" fill="url(#accentGradient)" />
      <circle cx="30" cy="15" r="2" fill="url(#accentGradient)" />
      <circle cx="24" cy="25" r="2" fill="url(#accentGradient)" />
      <path d="M20 16L28 16M24 20L24 23" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" stroke-linecap="round" />
      <path d="M12 36C12 34 16 32 24 32C32 32 36 34 36 36C36 38 32 40 24 40C16 40 12 38 12 36Z" fill="${colors.secondary}" opacity="0.6" />
      <text x="24" y="20" text-anchor="middle" fill="white" style="font-size: 8px; font-weight: bold;">VC</text>
    </svg>
  `
}