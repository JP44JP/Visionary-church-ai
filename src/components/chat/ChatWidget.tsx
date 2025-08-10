'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import type { ChatMessage, WidgetConfig } from '@/types'

interface ChatWidgetProps {
  config?: Partial<WidgetConfig>
  onMessageSent?: (message: string) => void
  isDemo?: boolean
}

const defaultConfig: WidgetConfig = {
  churchId: 'demo',
  primaryColor: '#0284c7',
  secondaryColor: '#eab308',
  position: 'bottom-right',
  welcomeMessage: 'Hi! I\'m here to help you learn about our church and plan your visit. How can I assist you today?',
  offlineMessage: 'We\'re currently offline, but feel free to leave a message and we\'ll get back to you soon!',
  collectEmail: true,
  collectPhone: true,
  enabled: true
}

const sampleMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hi! I\'m here to help you learn about our church and plan your visit. How can I assist you today?',
    role: 'assistant',
    timestamp: new Date(),
    sessionId: 'demo'
  }
]

const ChatWidget: React.FC<ChatWidgetProps> = ({
  config = {},
  onMessageSent,
  isDemo = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const widgetConfig = { ...defaultConfig, ...config }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setHasUnreadMessages(false)
    }
  }, [messages, isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
      sessionId: 'demo'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response for demo
    if (isDemo) {
      setTimeout(() => {
        const responses = [
          'Thank you for your question! Our Sunday services are at 9:00 AM and 11:00 AM. Would you like me to help you plan a visit?',
          'I\'d be happy to help you with that! Can you tell me more about what you\'re looking for?',
          'Great question! Our church offers programs for all ages. What age group are you interested in?',
          'I can definitely help you with information about our ministries and small groups. What are your interests?',
          'That\'s wonderful that you\'re interested in visiting! Let me gather some information to make your visit special.'
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          role: 'assistant',
          timestamp: new Date(),
          sessionId: 'demo'
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsTyping(false)
        
        if (!isOpen) {
          setHasUnreadMessages(true)
        }
      }, 1500)
    }

    onMessageSent?.(inputValue.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleWidget = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <div className={cn('fixed z-50', positionClasses[widgetConfig.position])}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: isMinimized ? 0.8 : 1, 
              y: 0,
              height: isMinimized ? '60px' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 max-w-[calc(100vw-3rem)] overflow-hidden"
            style={{ maxHeight: isMinimized ? '60px' : '500px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-church-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">AI</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Church Assistant</h3>
                    <p className="text-xs opacity-90">Online now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label="Close chat"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] px-4 py-2 rounded-2xl text-sm',
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim()}
                      className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Send message"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleWidget}
        className="relative bg-gradient-to-r from-primary-600 to-church-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Open chat"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
        
        {hasUnreadMessages && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        
        {/* Bounce Animation for Demo */}
        {isDemo && !isOpen && (
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
        )}
      </motion.button>
    </div>
  )
}

export default ChatWidget