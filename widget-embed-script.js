// Church Chat Widget Embed Script
// This script can be embedded on any church website to add the AI chat functionality

(function() {
  'use strict';
  
  // =============================================================================
  // CONFIGURATION
  // =============================================================================
  
  // Widget configuration - can be overridden by website
  const defaultConfig = {
    tenantId: null, // Must be provided
    apiUrl: 'https://api.visionarychurch.ai', // Default API URL
    socketUrl: 'https://api.visionarychurch.ai', // Default Socket URL
    position: 'bottom-right', // bottom-right, bottom-left
    showBranding: true, // Show "Powered by VisionaryChurch AI"
    autoOpen: false, // Auto-open widget after delay
    autoOpenDelay: 30000, // 30 seconds
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#EF4444',
      textColor: '#1F2937',
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    welcomeMessage: null, // Will be fetched from API
    quickReplies: null, // Will be fetched from API
    customCSS: '', // Additional CSS
    onOpen: null, // Callback when widget opens
    onClose: null, // Callback when widget closes
    onMessage: null, // Callback when message is sent
    debug: false
  };
  
  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================
  
  function log(...args) {
    if (window.ChurchChatConfig?.debug) {
      console.log('[ChurchChat]', ...args);
    }
  }
  
  function error(...args) {
    console.error('[ChurchChat]', ...args);
  }
  
  function generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  function createElement(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  }
  
  function loadCSS(css) {
    const style = createElement('style', { type: 'text/css' });
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }
  
  function loadScript(src, callback) {
    const script = createElement('script', { src, type: 'text/javascript' });
    script.onload = callback;
    script.onerror = () => error('Failed to load script:', src);
    document.head.appendChild(script);
  }
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // =============================================================================
  // CHURCH CHAT WIDGET CLASS
  // =============================================================================
  
  class ChurchChatWidget {
    constructor(config) {
      this.config = { ...defaultConfig, ...config };
      this.isOpen = false;
      this.isConnected = false;
      this.conversation = null;
      this.messages = [];
      this.churchInfo = null;
      this.socket = null;
      this.widgetElement = null;
      this.isTyping = false;
      this.sessionId = this.generateSessionId();
      
      if (!this.config.tenantId) {
        error('tenantId is required');
        return;
      }
      
      this.init();
    }
    
    async init() {
      try {
        // Load widget configuration from API
        await this.loadWidgetConfig();
        
        // Create widget HTML
        this.createWidget();
        
        // Load Socket.IO if not already loaded
        await this.loadDependencies();
        
        // Initialize auto-open if configured
        this.initAutoOpen();
        
        log('Widget initialized successfully');
      } catch (err) {
        error('Failed to initialize widget:', err);
      }
    }
    
    async loadWidgetConfig() {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/widget/${this.config.tenantId}/config`);
        const data = await response.json();
        
        if (data.success) {
          // Merge API config with local config
          this.config = {
            ...this.config,
            ...data.data,
            theme: { ...this.config.theme, ...data.data.theme }
          };
          this.churchInfo = data.data.churchInfo;
          log('Widget configuration loaded:', this.config);
        }
      } catch (err) {
        error('Failed to load widget config:', err);
      }
    }
    
    async loadDependencies() {
      return new Promise((resolve, reject) => {
        if (window.io) {
          resolve();
          return;
        }
        
        loadScript('https://cdn.socket.io/4.7.2/socket.io.min.js', () => {
          if (window.io) {
            resolve();
          } else {
            reject(new Error('Failed to load Socket.IO'));
          }
        });
      });
    }
    
    createWidget() {
      // Inject CSS
      this.injectCSS();
      
      // Create widget container
      this.widgetElement = createElement('div', {
        id: 'church-chat-widget',
        className: `church-chat-widget fixed z-50 ${this.config.position === 'bottom-left' ? 'bottom-4 left-4' : 'bottom-4 right-4'}`
      });
      
      // Create chat button
      this.createChatButton();
      
      // Create chat window (initially hidden)
      this.createChatWindow();
      
      // Add to page
      document.body.appendChild(this.widgetElement);
    }
    
    createChatButton() {
      const button = createElement('div', {
        className: 'chat-button bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center group',
        onClick: () => this.openChat(),
        innerHTML: `
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.774-.9L3 21l1.9-6.226A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z"></path>
          </svg>
          <span class="hidden group-hover:inline-block whitespace-nowrap bg-white text-gray-800 px-2 py-1 rounded text-sm absolute right-full mr-2 shadow-lg">
            Chat with us!
          </span>
        `
      });
      
      this.widgetElement.appendChild(button);
    }
    
    createChatWindow() {
      const chatWindow = createElement('div', {
        className: 'chat-window bg-white rounded-lg shadow-2xl w-96 h-[32rem] flex-col overflow-hidden border hidden',
        innerHTML: `
          <!-- Header -->
          <div class="chat-header bg-primary text-white p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-sm">${this.config.tenantName || 'Church Chat'}</h3>
                <p class="text-xs opacity-90" id="connection-status">Connecting...</p>
              </div>
            </div>
            <button class="close-button p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors" onclick="window.churchChatWidget.closeChat()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Messages -->
          <div class="messages-container flex-1 overflow-y-auto p-4" id="messages-container">
            <!-- Messages will be added here -->
          </div>
          
          <!-- Quick Access Bar -->
          <div class="quick-access p-3 bg-gray-50 border-t" id="quick-access">
            <div class="text-xs font-semibold text-gray-600 mb-2">Quick Access</div>
            <div class="grid grid-cols-2 gap-2 text-xs" id="quick-access-buttons">
              <!-- Quick access buttons will be added here -->
            </div>
          </div>
          
          <!-- Input -->
          <div class="input-container border-t p-4">
            <div class="flex space-x-2">
              <input 
                type="text" 
                id="message-input"
                placeholder="Type your message..."
                class="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
              <button 
                id="send-button"
                class="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </button>
            </div>
            ${this.config.showBranding ? `
            <div class="text-center mt-2">
              <p class="text-xs text-gray-500">
                Powered by <span class="font-semibold">VisionaryChurch AI</span>
              </p>
            </div>
            ` : ''}
          </div>
        `
      });
      
      this.widgetElement.appendChild(chatWindow);
      this.setupChatWindowEvents();
    }
    
    setupChatWindowEvents() {
      const messageInput = document.getElementById('message-input');
      const sendButton = document.getElementById('send-button');
      
      // Send message on enter key
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage(messageInput.value.trim());
        }
      });
      
      // Send message on button click
      sendButton.addEventListener('click', () => {
        this.sendMessage(messageInput.value.trim());
      });
      
      // Typing indicator
      let typingTimer;
      messageInput.addEventListener('input', () => {
        if (this.socket && this.conversation) {
          this.socket.emit('typing');
          clearTimeout(typingTimer);
          typingTimer = setTimeout(() => {
            this.socket.emit('stop-typing');
          }, 1000);
        }
      });
    }
    
    setupQuickAccess() {
      const quickAccessContainer = document.getElementById('quick-access-buttons');
      if (!quickAccessContainer || !this.churchInfo) return;
      
      quickAccessContainer.innerHTML = '';
      
      const quickAccessItems = [
        {
          icon: '📞',
          label: 'Call',
          href: this.churchInfo.phone ? `tel:${this.churchInfo.phone}` : null,
          onClick: this.churchInfo.phone ? null : () => this.sendMessage('What is your phone number?')
        },
        {
          icon: '📧',
          label: 'Email',
          href: this.churchInfo.email ? `mailto:${this.churchInfo.email}` : null,
          onClick: this.churchInfo.email ? null : () => this.sendMessage('How can I contact you by email?')
        },
        {
          icon: '⏰',
          label: 'Services',
          onClick: () => this.sendMessage('What are your service times?')
        },
        {
          icon: '📍',
          label: 'Directions',
          onClick: () => this.sendMessage('How do I get to your church?')
        }
      ];
      
      quickAccessItems.forEach(item => {
        const button = createElement(item.href ? 'a' : 'button', {
          className: 'flex items-center space-x-1 p-2 bg-white rounded border hover:bg-gray-50 transition-colors',
          ...(item.href ? { href: item.href } : {}),
          onClick: item.onClick,
          innerHTML: `<span>${item.icon}</span><span>${item.label}</span>`
        });
        
        quickAccessContainer.appendChild(button);
      });
    }
    
    async openChat() {
      if (this.isOpen) return;
      
      this.isOpen = true;
      
      // Show chat window
      const chatWindow = this.widgetElement.querySelector('.chat-window');
      const chatButton = this.widgetElement.querySelector('.chat-button');
      
      chatButton.style.display = 'none';
      chatWindow.classList.remove('hidden');
      chatWindow.classList.add('flex');
      
      // Focus input
      setTimeout(() => {
        document.getElementById('message-input')?.focus();
      }, 100);
      
      // Initialize connection
      await this.initializeChat();
      
      // Setup quick access
      this.setupQuickAccess();
      
      // Call callback
      if (typeof this.config.onOpen === 'function') {
        this.config.onOpen();
      }
      
      log('Chat opened');
    }
    
    closeChat() {
      if (!this.isOpen) return;
      
      this.isOpen = false;
      
      // Hide chat window
      const chatWindow = this.widgetElement.querySelector('.chat-window');
      const chatButton = this.widgetElement.querySelector('.chat-button');
      
      chatWindow.classList.add('hidden');
      chatWindow.classList.remove('flex');
      chatButton.style.display = 'flex';
      
      // Call callback
      if (typeof this.config.onClose === 'function') {
        this.config.onClose();
      }
      
      log('Chat closed');
    }
    
    async initializeChat() {
      try {
        // Create conversation
        await this.createConversation();
        
        // Initialize socket connection
        await this.initializeSocket();
        
        log('Chat initialized');
      } catch (err) {
        error('Failed to initialize chat:', err);
      }
    }
    
    async createConversation() {
      try {
        const response = await fetch(`${this.config.apiUrl}/api/widget/${this.config.tenantId}/conversation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            referrer: document.referrer || window.location.href
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          this.conversation = data.data;
          log('Conversation created:', this.conversation.id);
        } else {
          throw new Error(data.error || 'Failed to create conversation');
        }
      } catch (err) {
        error('Failed to create conversation:', err);
        throw err;
      }
    }
    
    async initializeSocket() {
      try {
        this.socket = window.io(`${this.config.socketUrl}/chat`, {
          transports: ['websocket', 'polling'],
          query: {
            tenantId: this.config.tenantId,
            conversationId: this.conversation.id
          }
        });
        
        this.setupSocketListeners();
        
      } catch (err) {
        error('Failed to initialize socket:', err);
        throw err;
      }
    }
    
    setupSocketListeners() {
      this.socket.on('connect', () => {
        this.isConnected = true;
        this.updateConnectionStatus('Online');
        
        // Send welcome message
        this.addMessage({
          role: 'assistant',
          content: this.config.welcomeMessage,
          timestamp: new Date()
        });
        
        // Show quick replies if configured
        if (this.config.quickReplies && this.config.quickReplies.length > 0) {
          setTimeout(() => {
            this.showQuickReplies(this.config.quickReplies);
          }, 1000);
        }
        
        log('Socket connected');
      });
      
      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.updateConnectionStatus('Connecting...');
        log('Socket disconnected');
      });
      
      this.socket.on('ai-response', (data) => {
        this.hideTypingIndicator();
        
        this.addMessage({
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          metadata: data
        });
        
        // Show suggested actions if any
        if (data.suggestedActions && data.suggestedActions.length > 0) {
          this.showSuggestedActions(data.suggestedActions);
        }
        
        // Handle info collection
        if (data.collectInfo) {
          this.showInfoCollectionForm(data.collectInfo);
        }
        
        log('AI response received:', data);
      });
      
      this.socket.on('new-message', (message) => {
        this.addMessage({
          role: message.senderType === 'user' ? 'user' : 'assistant',
          content: message.content,
          timestamp: new Date(message.timestamp),
          senderName: message.senderName,
          isStaff: message.isStaff
        });
      });
      
      this.socket.on('human-joined', (data) => {
        this.addMessage({
          role: 'system',
          content: data.message,
          timestamp: new Date()
        });
        
        this.updateConnectionStatus(`Connected with ${data.staffName}`);
      });
      
      this.socket.on('ai-typing', () => {
        this.showTypingIndicator();
      });
      
      this.socket.on('user-typing', (data) => {
        this.updateConnectionStatus(`${data.name} is typing...`);
      });
      
      this.socket.on('user-stop-typing', () => {
        this.updateConnectionStatus('Online');
      });
      
      this.socket.on('error', (error) => {
        this.addMessage({
          role: 'system',
          content: 'There was an error processing your message. Please try again.',
          timestamp: new Date()
        });
        error('Socket error:', error);
      });
    }
    
    sendMessage(text) {
      if (!text.trim() || !this.socket || !this.conversation) return;
      
      // Add message to UI
      this.addMessage({
        role: 'user',
        content: text,
        timestamp: new Date()
      });
      
      // Clear input
      document.getElementById('message-input').value = '';
      
      // Show typing indicator
      this.showTypingIndicator();
      
      // Send to server
      this.socket.emit('send-message', {
        conversationId: this.conversation.id,
        message: text,
        type: 'text'
      });
      
      // Call callback
      if (typeof this.config.onMessage === 'function') {
        this.config.onMessage(text);
      }
      
      log('Message sent:', text);
    }
    
    addMessage(message) {
      this.messages.push(message);
      
      const messagesContainer = document.getElementById('messages-container');
      if (!messagesContainer) return;
      
      const messageElement = this.createMessageElement(message);
      messagesContainer.appendChild(messageElement);
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    createMessageElement(message) {
      const isUser = message.role === 'user';
      const isSystem = message.role === 'system';
      
      const messageDiv = createElement('div', {
        className: `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`
      });
      
      const bubbleDiv = createElement('div', {
        className: `max-w-[85%] rounded-2xl px-4 py-2 ${
          isUser 
            ? 'bg-primary text-white ml-4' 
            : isSystem
            ? 'bg-gray-100 text-gray-700 text-center mx-4 text-sm'
            : 'bg-gray-100 text-gray-800 mr-4'
        }`,
        innerHTML: `
          <div class="whitespace-pre-wrap break-words">${this.escapeHtml(message.content)}</div>
          <div class="text-xs opacity-70 mt-2">
            ${message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        `
      });
      
      messageDiv.appendChild(bubbleDiv);
      
      return messageDiv;
    }
    
    showQuickReplies(replies) {
      const quickRepliesElement = createElement('div', {
        className: 'flex justify-start mb-4'
      });
      
      const bubbleDiv = createElement('div', {
        className: 'bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 mr-4',
        innerHTML: `
          <div class="text-sm mb-3">Here are some common questions I can help with:</div>
          <div class="space-y-2">
            ${replies.map(reply => `
              <button class="quick-reply-btn block w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                ${this.escapeHtml(reply)}
              </button>
            `).join('')}
          </div>
        `
      });
      
      // Add event listeners to quick reply buttons
      bubbleDiv.querySelectorAll('.quick-reply-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
          this.sendMessage(replies[index]);
          bubbleDiv.remove();
        });
      });
      
      quickRepliesElement.appendChild(bubbleDiv);
      
      const messagesContainer = document.getElementById('messages-container');
      messagesContainer.appendChild(quickRepliesElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showSuggestedActions(actions) {
      const actionsElement = createElement('div', {
        className: 'flex justify-start mb-4'
      });
      
      const bubbleDiv = createElement('div', {
        className: 'bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 mr-4',
        innerHTML: `
          <div class="text-sm mb-3">How would you like to continue?</div>
          <div class="space-y-2">
            ${actions.map(action => `
              <button class="action-btn block w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm" data-action="${action.type}" data-label="${action.label}">
                ${this.escapeHtml(action.label)}
              </button>
            `).join('')}
          </div>
        `
      });
      
      // Add event listeners to action buttons
      bubbleDiv.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const actionType = btn.getAttribute('data-action');
          const label = btn.getAttribute('data-label');
          
          switch (actionType) {
            case 'schedule_visit':
              this.sendMessage('I would like to plan a visit to your church.');
              break;
            case 'prayer_request':
              this.sendMessage('I have a prayer request I would like to share.');
              break;
            case 'contact_pastor':
              this.sendMessage('I would like to speak with a pastor.');
              break;
            default:
              this.sendMessage(label);
          }
          
          bubbleDiv.remove();
        });
      });
      
      actionsElement.appendChild(bubbleDiv);
      
      const messagesContainer = document.getElementById('messages-container');
      messagesContainer.appendChild(actionsElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showInfoCollectionForm(infoRequest) {
      const formElement = createElement('div', {
        className: 'flex justify-start mb-4'
      });
      
      const formHtml = `
        <div class="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2 mr-4 max-w-[85%]">
          <div class="text-sm mb-3">${this.escapeHtml(infoRequest.context)}</div>
          <form class="info-collection-form space-y-3">
            ${infoRequest.fields.map(field => this.createFormField(field)).join('')}
            <button type="submit" class="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark text-sm font-medium">
              Submit
            </button>
          </form>
        </div>
      `;
      
      formElement.innerHTML = formHtml;
      
      // Add form submission handler
      const form = formElement.querySelector('.info-collection-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Send collected info to server
        this.socket.emit('info-collected', {
          conversationId: this.conversation.id,
          type: infoRequest.type,
          data
        });
        
        // Remove form and show confirmation
        formElement.remove();
        this.addMessage({
          role: 'user',
          content: `Information submitted: ${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ')}`,
          timestamp: new Date()
        });
      });
      
      const messagesContainer = document.getElementById('messages-container');
      messagesContainer.appendChild(formElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    createFormField(field) {
      const baseClasses = 'w-full p-2 border border-gray-300 rounded-md text-sm';
      const required = field.required ? 'required' : '';
      
      switch (field.type) {
        case 'select':
          return `
            <div>
              <label class="block text-sm font-medium mb-1">
                ${this.escapeHtml(field.label)} ${field.required ? '<span class="text-red-500">*</span>' : ''}
              </label>
              <select name="${field.name}" class="${baseClasses}" ${required}>
                <option value="">Select...</option>
                ${(field.options || []).map(option => `<option value="${this.escapeHtml(option)}">${this.escapeHtml(option)}</option>`).join('')}
              </select>
            </div>
          `;
        case 'textarea':
          return `
            <div>
              <label class="block text-sm font-medium mb-1">
                ${this.escapeHtml(field.label)} ${field.required ? '<span class="text-red-500">*</span>' : ''}
              </label>
              <textarea name="${field.name}" class="${baseClasses}" rows="3" ${required}></textarea>
            </div>
          `;
        case 'boolean':
          return `
            <div>
              <label class="flex items-center space-x-2">
                <input type="checkbox" name="${field.name}" value="true" class="rounded">
                <span class="text-sm">${this.escapeHtml(field.label)}</span>
              </label>
            </div>
          `;
        default:
          return `
            <div>
              <label class="block text-sm font-medium mb-1">
                ${this.escapeHtml(field.label)} ${field.required ? '<span class="text-red-500">*</span>' : ''}
              </label>
              <input type="${field.type}" name="${field.name}" class="${baseClasses}" ${required}>
            </div>
          `;
      }
    }
    
    showTypingIndicator() {
      if (this.isTyping) return;
      
      this.isTyping = true;
      
      const typingElement = createElement('div', {
        className: 'typing-indicator flex justify-start mb-4',
        innerHTML: `
          <div class="bg-gray-100 rounded-2xl px-4 py-2 mr-4">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        `
      });
      
      const messagesContainer = document.getElementById('messages-container');
      messagesContainer.appendChild(typingElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
      if (!this.isTyping) return;
      
      this.isTyping = false;
      
      const typingIndicator = document.querySelector('.typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }
    
    updateConnectionStatus(status) {
      const statusElement = document.getElementById('connection-status');
      if (statusElement) {
        statusElement.textContent = status;
      }
    }
    
    generateSessionId() {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    initAutoOpen() {
      if (this.config.autoOpen && this.config.autoOpenDelay > 0) {
        setTimeout(() => {
          if (!this.isOpen) {
            this.openChat();
          }
        }, this.config.autoOpenDelay);
      }
    }
    
    injectCSS() {
      const css = `
        .church-chat-widget {
          font-family: ${this.config.theme.fontFamily};
          z-index: 999999;
        }
        
        .church-chat-widget .bg-primary {
          background-color: ${this.config.theme.primaryColor};
        }
        
        .church-chat-widget .text-primary {
          color: ${this.config.theme.primaryColor};
        }
        
        .church-chat-widget .border-primary {
          border-color: ${this.config.theme.primaryColor};
        }
        
        .church-chat-widget .hover\\:bg-primary-dark:hover {
          background-color: ${this.adjustColorBrightness(this.config.theme.primaryColor, -20)};
        }
        
        .church-chat-widget .focus\\:ring-primary:focus {
          --tw-ring-color: ${this.config.theme.primaryColor};
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
        
        .church-chat-widget .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        
        .church-chat-widget .fixed {
          position: fixed;
        }
        
        .church-chat-widget .bottom-4 {
          bottom: 1rem;
        }
        
        .church-chat-widget .right-4 {
          right: 1rem;
        }
        
        .church-chat-widget .left-4 {
          left: 1rem;
        }
        
        .church-chat-widget .z-50 {
          z-index: 50;
        }
        
        .church-chat-widget .hidden {
          display: none;
        }
        
        .church-chat-widget .flex {
          display: flex;
        }
        
        .church-chat-widget .flex-1 {
          flex: 1 1 0%;
        }
        
        .church-chat-widget .flex-col {
          flex-direction: column;
        }
        
        .church-chat-widget .items-center {
          align-items: center;
        }
        
        .church-chat-widget .justify-center {
          justify-content: center;
        }
        
        .church-chat-widget .justify-between {
          justify-content: space-between;
        }
        
        .church-chat-widget .justify-start {
          justify-content: flex-start;
        }
        
        .church-chat-widget .justify-end {
          justify-content: flex-end;
        }
        
        .church-chat-widget .space-x-1 > * + * {
          margin-left: 0.25rem;
        }
        
        .church-chat-widget .space-x-2 > * + * {
          margin-left: 0.5rem;
        }
        
        .church-chat-widget .space-x-3 > * + * {
          margin-left: 0.75rem;
        }
        
        .church-chat-widget .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
        
        .church-chat-widget .space-y-3 > * + * {
          margin-top: 0.75rem;
        }
        
        .church-chat-widget .p-1 {
          padding: 0.25rem;
        }
        
        .church-chat-widget .p-2 {
          padding: 0.5rem;
        }
        
        .church-chat-widget .p-3 {
          padding: 0.75rem;
        }
        
        .church-chat-widget .p-4 {
          padding: 1rem;
        }
        
        .church-chat-widget .px-2 {
          padding-left: 0.5rem;
          padding-right: 0.5rem;
        }
        
        .church-chat-widget .px-3 {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        
        .church-chat-widget .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        .church-chat-widget .py-1 {
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        
        .church-chat-widget .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }
        
        .church-chat-widget .mb-1 {
          margin-bottom: 0.25rem;
        }
        
        .church-chat-widget .mb-2 {
          margin-bottom: 0.5rem;
        }
        
        .church-chat-widget .mb-3 {
          margin-bottom: 0.75rem;
        }
        
        .church-chat-widget .mb-4 {
          margin-bottom: 1rem;
        }
        
        .church-chat-widget .mt-2 {
          margin-top: 0.5rem;
        }
        
        .church-chat-widget .mt-3 {
          margin-top: 0.75rem;
        }
        
        .church-chat-widget .mr-2 {
          margin-right: 0.5rem;
        }
        
        .church-chat-widget .mr-4 {
          margin-right: 1rem;
        }
        
        .church-chat-widget .ml-4 {
          margin-left: 1rem;
        }
        
        .church-chat-widget .w-4 {
          width: 1rem;
        }
        
        .church-chat-widget .w-5 {
          width: 1.25rem;
        }
        
        .church-chat-widget .w-6 {
          width: 1.5rem;
        }
        
        .church-chat-widget .w-8 {
          width: 2rem;
        }
        
        .church-chat-widget .w-96 {
          width: 24rem;
        }
        
        .church-chat-widget .w-full {
          width: 100%;
        }
        
        .church-chat-widget .w-2 {
          width: 0.5rem;
        }
        
        .church-chat-widget .h-4 {
          height: 1rem;
        }
        
        .church-chat-widget .h-5 {
          height: 1.25rem;
        }
        
        .church-chat-widget .h-6 {
          height: 1.5rem;
        }
        
        .church-chat-widget .h-8 {
          height: 2rem;
        }
        
        .church-chat-widget .h-2 {
          height: 0.5rem;
        }
        
        .church-chat-widget .max-w-\\[85\\%\\] {
          max-width: 85%;
        }
        
        .church-chat-widget .overflow-hidden {
          overflow: hidden;
        }
        
        .church-chat-widget .overflow-y-auto {
          overflow-y: auto;
        }
        
        .church-chat-widget .rounded {
          border-radius: 0.25rem;
        }
        
        .church-chat-widget .rounded-lg {
          border-radius: 0.5rem;
        }
        
        .church-chat-widget .rounded-md {
          border-radius: 0.375rem;
        }
        
        .church-chat-widget .rounded-full {
          border-radius: 9999px;
        }
        
        .church-chat-widget .rounded-2xl {
          border-radius: 1rem;
        }
        
        .church-chat-widget .border {
          border-width: 1px;
        }
        
        .church-chat-widget .border-t {
          border-top-width: 1px;
        }
        
        .church-chat-widget .border-gray-200 {
          border-color: #e5e7eb;
        }
        
        .church-chat-widget .border-gray-300 {
          border-color: #d1d5db;
        }
        
        .church-chat-widget .bg-white {
          background-color: #ffffff;
        }
        
        .church-chat-widget .bg-gray-50 {
          background-color: #f9fafb;
        }
        
        .church-chat-widget .bg-gray-100 {
          background-color: #f3f4f6;
        }
        
        .church-chat-widget .bg-gray-400 {
          background-color: #9ca3af;
        }
        
        .church-chat-widget .text-white {
          color: #ffffff;
        }
        
        .church-chat-widget .text-gray-500 {
          color: #6b7280;
        }
        
        .church-chat-widget .text-gray-600 {
          color: #4b5563;
        }
        
        .church-chat-widget .text-gray-700 {
          color: #374151;
        }
        
        .church-chat-widget .text-gray-800 {
          color: #1f2937;
        }
        
        .church-chat-widget .text-red-500 {
          color: #ef4444;
        }
        
        .church-chat-widget .text-xs {
          font-size: 0.75rem;
          line-height: 1rem;
        }
        
        .church-chat-widget .text-sm {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        
        .church-chat-widget .font-medium {
          font-weight: 500;
        }
        
        .church-chat-widget .font-semibold {
          font-weight: 600;
        }
        
        .church-chat-widget .opacity-70 {
          opacity: 0.7;
        }
        
        .church-chat-widget .opacity-90 {
          opacity: 0.9;
        }
        
        .church-chat-widget .shadow-lg {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        
        .church-chat-widget .shadow-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .church-chat-widget .shadow-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .church-chat-widget .transition-all {
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        .church-chat-widget .transition-colors {
          transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
        
        .church-chat-widget .duration-300 {
          transition-duration: 300ms;
        }
        
        .church-chat-widget .cursor-pointer {
          cursor: pointer;
        }
        
        .church-chat-widget .whitespace-nowrap {
          white-space: nowrap;
        }
        
        .church-chat-widget .whitespace-pre-wrap {
          white-space: pre-wrap;
        }
        
        .church-chat-widget .break-words {
          overflow-wrap: break-word;
        }
        
        .church-chat-widget .absolute {
          position: absolute;
        }
        
        .church-chat-widget .right-full {
          right: 100%;
        }
        
        .church-chat-widget .text-center {
          text-align: center;
        }
        
        .church-chat-widget .text-left {
          text-align: left;
        }
        
        .church-chat-widget .bg-opacity-20 {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .church-chat-widget .group:hover .group-hover\\:inline-block {
          display: inline-block;
        }
        
        .church-chat-widget .hover\\:bg-gray-50:hover {
          background-color: #f9fafb;
        }
        
        .church-chat-widget .hover\\:shadow-xl:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .church-chat-widget .focus\\:outline-none:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }
        
        .church-chat-widget .focus\\:ring-2:focus {
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
        }
        
        .church-chat-widget .focus\\:border-transparent:focus {
          border-color: transparent;
        }
        
        .church-chat-widget .grid {
          display: grid;
        }
        
        .church-chat-widget .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        
        .church-chat-widget .gap-2 {
          gap: 0.5rem;
        }
        
        .church-chat-widget .block {
          display: block;
        }
        
        ${this.config.customCSS}
      `;
      
      loadCSS(css);
    }
    
    adjustColorBrightness(color, amount) {
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
  }
  
  // =============================================================================
  // GLOBAL INITIALIZATION
  // =============================================================================
  
  // Wait for DOM to be ready
  function initializeWidget() {
    // Check if widget is already initialized
    if (window.churchChatWidget) {
      log('Widget already initialized');
      return;
    }
    
    // Get configuration from global variable or script tag
    const config = window.ChurchChatConfig || {};
    
    // Try to get config from script tag if not in global variable
    if (!config.tenantId) {
      const scriptTag = document.querySelector('script[data-church-chat-tenant-id]');
      if (scriptTag) {
        config.tenantId = scriptTag.getAttribute('data-church-chat-tenant-id');
        config.apiUrl = scriptTag.getAttribute('data-church-chat-api-url') || config.apiUrl;
        config.position = scriptTag.getAttribute('data-church-chat-position') || config.position;
      }
    }
    
    // Initialize widget if tenantId is found
    if (config.tenantId) {
      window.churchChatWidget = new ChurchChatWidget(config);
      log('Widget initialized from script tag or global config');
    } else {
      error('No tenantId found. Please set window.ChurchChatConfig.tenantId or add data-church-chat-tenant-id to script tag.');
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWidget);
  } else {
    // DOM is already ready
    initializeWidget();
  }
  
  // Export for programmatic access
  window.ChurchChatWidget = ChurchChatWidget;
  
})();