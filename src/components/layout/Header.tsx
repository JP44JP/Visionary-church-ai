'use client'

import React, { useState } from 'react'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Logo from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  current?: boolean
}

interface HeaderProps {
  navigation?: NavigationItem[]
  showAuth?: boolean
  variant?: 'landing' | 'dashboard'
}

const defaultNavigation: NavigationItem[] = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Contact', href: '#contact' },
]

const Header: React.FC<HeaderProps> = ({ 
  navigation = defaultNavigation, 
  showAuth = true,
  variant = 'landing'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setMobileMenuOpen(false)
  }

  return (
    <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Logo variant="full" size="sm" theme="brand" />
                </div>
                
                {/* Desktop Navigation */}
                <div className="hidden md:ml-10 md:flex md:space-x-8">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.href)}
                      className={cn(
                        'inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200',
                        item.current
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-700 hover:text-primary-600 hover:border-gray-300'
                      )}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Auth */}
              {showAuth && (
                <div className="hidden md:flex md:items-center md:space-x-4">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                  <Button size="sm">
                    Start Free Trial
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    'block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200',
                    item.current
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  )}
                >
                  {item.name}
                </button>
              ))}
              
              {showAuth && (
                <div className="pt-4 pb-3 border-t border-gray-200 space-y-2">
                  <Button variant="ghost" className="w-full justify-center">
                    Sign In
                  </Button>
                  <Button className="w-full justify-center">
                    Start Free Trial
                  </Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default Header