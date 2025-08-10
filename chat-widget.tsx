// AI-Powered Chat Widget for Church Websites
// Embeddable React component with intelligent conversation flows

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, X, Send, Phone, Calendar, Heart, User, Mail, MapPin, Clock, ChevronDown, Star, Loader } from 'lucide-react';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestedActions?: SuggestedAction[];
    collectInfo?: InfoCollectionRequest;
    needsHuman?: boolean;
  };
}

interface SuggestedAction {
  type: 'schedule_visit' | 'prayer_request' | 'contact_pastor' | 'event_registration' | 'ministry_interest';
  label: string;
  data: Record<string, any>;
}

interface InfoCollectionRequest {
  type: 'contact' | 'visit_planning' | 'prayer_request';
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
  context: string;
}

interface ChurchInfo {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  serviceTimes?: Array<{
    day: string;
    time: string;
    serviceType: string;
  }>;
}

interface WidgetConfig {
  tenantId: string;
  tenantName: string;
  apiUrl: string;
  socketUrl: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
    borderRadius: string;
    fontFamily: string;
  };
  position: 'bottom-right' | 'bottom-left';
  welcomeMessage?: string;
  quickReplies?: string[];
  showBranding?: boolean;
}

interface ConversationState {
  id: string;
  status: 'active' | 'collecting_info' | 'waiting_human' | 'ended';
  visitorName?: string;
  visitorEmail?: string;
  collectedInfo?: Record<string, any>;
  collectingInfo?: InfoCollectionRequest;
}

// =============================================================================
// CHAT WIDGET COMPONENT
// =============================================================================

export const ChurchChatWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversation, setConversation] = useState<ConversationState | null>(null);
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSatisfactionRating, setShowSatisfactionRating] = useState(false);
  const [satisfactionRating, setSatisfactionRating] = useState(0);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Initialize socket connection
  useEffect(() => {
    if (isOpen && !socketRef.current) {
      initializeSocket();
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // =============================================================================
  // SOCKET INITIALIZATION
  // =============================================================================

  const initializeSocket = useCallback(async () => {
    try {
      // Get church info and start conversation
      const response = await fetch(`${config.apiUrl}/api/widget/${config.tenantId}/config`);
      if (response.ok) {
        const data = await response.json();
        setChurchInfo(data.data);
      }

      // Create conversation
      const conversationResponse = await fetch(`${config.apiUrl}/api/widget/${config.tenantId}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: generateSessionId(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || window.location.href
        })
      });
      
      if (conversationResponse.ok) {
        const conversationData = await conversationResponse.json();
        setConversation(conversationData.data);
        
        // Initialize socket
        socketRef.current = io(`${config.socketUrl}/chat`, {
          transports: ['websocket', 'polling'],
          query: {
            tenantId: config.tenantId,
            conversationId: conversationData.data.id
          }
        });
        
        setupSocketListeners();
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  }, [config]);

  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current) return;
    
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      
      // Send welcome message
      const welcomeMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: config.welcomeMessage || `Welcome to ${config.tenantName}! I'm here to help answer your questions and connect you with our church community. How can I assist you today?`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
      
      // Show quick replies if configured
      if (config.quickReplies && config.quickReplies.length > 0) {
        setTimeout(() => {
          const quickReplyMessage: ChatMessage = {
            id: generateMessageId(),
            role: 'system',
            content: 'Here are some common questions I can help with:',
            timestamp: new Date(),
            metadata: {
              suggestedActions: config.quickReplies?.map(reply => ({
                type: 'schedule_visit' as const,
                label: reply,
                data: { quickReply: true, text: reply }
              }))
            }
          };
          setMessages(prev => [...prev, quickReplyMessage]);
        }, 1000);
      }
    });
    
    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socketRef.current.on('ai-response', (data: {
      message: string;
      intent: string;
      confidence: number;
      suggestedActions?: SuggestedAction[];
      needsHuman?: boolean;
      collectInfo?: InfoCollectionRequest;
    }) => {
      setIsTyping(false);
      
      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        metadata: {
          intent: data.intent,
          confidence: data.confidence,
          suggestedActions: data.suggestedActions,
          collectInfo: data.collectInfo,
          needsHuman: data.needsHuman
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation state
      if (data.collectInfo) {
        setConversation(prev => prev ? {
          ...prev,
          status: 'collecting_info',
          collectingInfo: data.collectInfo
        } : null);
      } else if (data.needsHuman) {
        setConversation(prev => prev ? {
          ...prev,
          status: 'waiting_human'
        } : null);
        
        // Show satisfaction rating after a delay
        setTimeout(() => {
          setShowSatisfactionRating(true);
        }, 5000);
      }
    });
    
    socketRef.current.on('human-joined', (data: { staffName: string; message?: string }) => {
      const humanMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'system',
        content: data.message || `${data.staffName} has joined the conversation and will assist you personally.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, humanMessage]);
      setConversation(prev => prev ? { ...prev, status: 'active' } : null);
    });
    
    socketRef.current.on('typing', () => {
      setIsTyping(true);
    });
    
    socketRef.current.on('stop-typing', () => {
      setIsTyping(false);
    });
  }, [config]);

  // =============================================================================
  // MESSAGE HANDLING
  // =============================================================================

  const sendMessage = useCallback(async (text: string, metadata?: Record<string, any>) => {
    if (!text.trim() || !conversation || !socketRef.current) return;
    
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    // Send to socket
    socketRef.current.emit('send-message', {
      conversationId: conversation.id,
      message: text,
      type: 'text',
      metadata
    });
  }, [conversation]);

  const handleSuggestedAction = useCallback(async (action: SuggestedAction) => {
    switch (action.type) {
      case 'schedule_visit':
        if (action.data.quickReply) {
          sendMessage(action.label);
        } else {
          // Show visit planning form
          await sendMessage('I would like to plan a visit to your church.');
        }
        break;
        
      case 'prayer_request':
        await sendMessage('I have a prayer request I would like to share.');
        break;
        
      case 'contact_pastor':
        await sendMessage('I would like to speak with a pastor.');
        break;
        
      case 'event_registration':
        await sendMessage(`I'm interested in registering for ${action.data.eventName}.`);
        break;
        
      case 'ministry_interest':
        await sendMessage('I'm interested in getting involved with ministries.');
        break;
    }
  }, [sendMessage]);

  const handleInfoSubmission = useCallback(async (formData: Record<string, any>) => {
    if (!conversation?.collectingInfo) return;
    
    // Update conversation state with collected info
    setConversation(prev => prev ? {
      ...prev,
      status: 'active',
      collectedInfo: { ...prev.collectedInfo, ...formData },
      collectingInfo: undefined
    } : null);
    
    // Send confirmation message
    const confirmationMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: `Information submitted: ${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join(', ')}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    setIsTyping(true);
    
    // Send to backend for processing
    if (socketRef.current) {
      socketRef.current.emit('info-collected', {
        conversationId: conversation.id,
        type: conversation.collectingInfo.type,
        data: formData
      });
    }
  }, [conversation]);

  const handleSatisfactionRating = useCallback(async (rating: number) => {
    setSatisfactionRating(rating);
    
    if (socketRef.current && conversation) {
      socketRef.current.emit('satisfaction-rating', {
        conversationId: conversation.id,
        rating,
        feedback: rating <= 3 ? 'Could be improved' : 'Great experience'
      });
    }
    
    setTimeout(() => {
      setShowSatisfactionRating(false);
    }, 2000);
  }, [conversation]);

  // =============================================================================
  // UI COMPONENTS
  // =============================================================================

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
          isUser 
            ? 'bg-primary text-white ml-4' 
            : isSystem
            ? 'bg-gray-100 text-gray-700 text-center mx-4 text-sm'
            : 'bg-gray-100 text-gray-800 mr-4'
        }`}>
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
          
          {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.metadata.suggestedActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedAction(action)}
                  className="block w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          
          {message.metadata?.collectInfo && (
            <InformationCollectionForm
              request={message.metadata.collectInfo}
              onSubmit={handleInfoSubmission}
            />
          )}
          
          <div className="text-xs opacity-70 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  const InformationCollectionForm: React.FC<{
    request: InfoCollectionRequest;
    onSubmit: (data: Record<string, any>) => void;
  }> = ({ request, onSubmit }) => {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      // Validate required fields
      const missingRequired = request.fields
        .filter(field => field.required && !formData[field.name])
        .map(field => field.label);
        
      if (missingRequired.length > 0) {
        alert(`Please fill in required fields: ${missingRequired.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      
      await onSubmit(formData);
      setIsSubmitting(false);
    };
    
    const handleFieldChange = (name: string, value: any) => {
      setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    return (
      <form onSubmit={handleSubmit} className="mt-4 p-4 bg-white rounded-lg border space-y-3">
        <p className="text-sm font-medium">{request.context}</p>
        
        {request.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select
                value={formData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                required={field.required}
              >
                <option value="">Select...</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={formData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                required={field.required}
              />
            ) : field.type === 'boolean' ? (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData[field.name] || false}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Yes</span>
              </label>
            ) : (
              <input
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                required={field.required}
              />
            )}
          </div>
        ))}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm font-medium"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    );
  };

  const SatisfactionRating: React.FC = () => {
    if (!showSatisfactionRating) return null;
    
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 mx-4">
        <p className="text-sm font-medium text-gray-800 mb-3">How was your experience?</p>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleSatisfactionRating(rating)}
              className={`p-1 rounded ${
                satisfactionRating >= rating ? 'text-yellow-500' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            >
              <Star className="w-5 h-5 fill-current" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const TypingIndicator: React.FC = () => {
    if (!isTyping) return null;
    
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-100 rounded-2xl px-4 py-2 mr-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  };

  const QuickAccessBar: React.FC = () => {
    if (!churchInfo) return null;
    
    return (
      <div className="p-4 bg-gray-50 border-t">
        <div className="text-xs font-semibold text-gray-600 mb-2">Quick Access</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {churchInfo.phone && (
            <a href={`tel:${churchInfo.phone}`} className="flex items-center space-x-1 p-2 bg-white rounded border hover:bg-gray-50">
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
          )}
          {churchInfo.email && (
            <a href={`mailto:${churchInfo.email}`} className="flex items-center space-x-1 p-2 bg-white rounded border hover:bg-gray-50">
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </a>
          )}
          <button 
            onClick={() => sendMessage('What are your service times?')}
            className="flex items-center space-x-1 p-2 bg-white rounded border hover:bg-gray-50"
          >
            <Clock className="w-3 h-3" />
            <span>Services</span>
          </button>
          <button 
            onClick={() => sendMessage('I would like directions to your church.')}
            className="flex items-center space-x-1 p-2 bg-white rounded border hover:bg-gray-50"
          >
            <MapPin className="w-3 h-3" />
            <span>Directions</span>
          </button>
        </div>
      </div>
    );
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateSessionId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const generateMessageId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  const themeStyles = useMemo(() => ({
    '--primary': config.theme.primaryColor,
    '--secondary': config.theme.secondaryColor,
    '--text': config.theme.textColor,
    '--background': config.theme.backgroundColor,
    '--border-radius': config.theme.borderRadius,
    '--font-family': config.theme.fontFamily
  }), [config.theme]);

  return (
    <div 
      className={`fixed z-50 ${
        config.position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'
      }`}
      style={themeStyles as React.CSSProperties}
    >
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-2 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden group-hover:inline-block whitespace-nowrap bg-white text-gray-800 px-2 py-1 rounded text-sm absolute right-full mr-2 shadow-lg">
            Chat with us!
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-96 h-[32rem] flex flex-col overflow-hidden border">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{config.tenantName}</h3>
                <p className="text-xs opacity-90">
                  {isConnected ? 'Online' : 'Connecting...'}
                  {conversation?.status === 'waiting_human' && ' • Connecting you with someone'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            <TypingIndicator />
            <SatisfactionRating />
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Access */}
          <QuickAccessBar />

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                disabled={conversation?.status === 'collecting_info' || isLoading}
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || conversation?.status === 'collecting_info' || isLoading}
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            
            {config.showBranding && (
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">
                  Powered by <span className="font-semibold">VisionaryChurch AI</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// WIDGET INITIALIZATION SCRIPT
// =============================================================================

export const initializeChurchChatWidget = (config: WidgetConfig) => {
  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'church-chat-widget';
  document.body.appendChild(widgetContainer);
  
  // Add custom CSS
  const style = document.createElement('style');
  style.textContent = `
    .church-chat-widget {
      font-family: ${config.theme.fontFamily};
    }
    
    .church-chat-widget .bg-primary {
      background-color: ${config.theme.primaryColor};
    }
    
    .church-chat-widget .text-primary {
      color: ${config.theme.primaryColor};
    }
    
    .church-chat-widget .border-primary {
      border-color: ${config.theme.primaryColor};
    }
    
    .church-chat-widget .hover\\:bg-primary-dark:hover {
      background-color: ${adjustColorBrightness(config.theme.primaryColor, -20)};
    }
    
    .church-chat-widget .focus\\:ring-primary:focus {
      --tw-ring-color: ${config.theme.primaryColor};
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0, 0, 0);
      }
      40%, 43% {
        transform: translate3d(0, -8px, 0);
      }
      70% {
        transform: translate3d(0, -4px, 0);
      }
    }
    
    .animate-bounce {
      animation: bounce 1s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
  
  // Add Tailwind CSS if not present
  if (!document.querySelector('script[src*="tailwindcss"]')) {
    const tailwindScript = document.createElement('script');
    tailwindScript.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(tailwindScript);
  }
  
  // Render widget (this would typically be done with React.render in a real implementation)
  console.log('Church Chat Widget initialized with config:', config);
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function adjustColorBrightness(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  return (usePound ? '#' : '') + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export default ChurchChatWidget;