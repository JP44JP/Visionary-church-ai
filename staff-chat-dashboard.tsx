// Staff Chat Dashboard for AI-Powered Church Chat System
// React component for church staff to manage and monitor chat conversations

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MessageCircle, Users, Clock, TrendingUp, AlertCircle, CheckCircle,
  User, Phone, Mail, Calendar, Tag, Filter, Search, RefreshCw,
  Send, MoreHorizontal, Eye, UserPlus, ArrowRight, Star,
  BarChart3, Activity, Zap, Bell, Settings
} from 'lucide-react';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface Conversation {
  id: string;
  visitorName?: string;
  visitorEmail?: string;
  status: 'active' | 'resolved' | 'waiting_human' | 'abandoned';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  leadScore: number;
  visitorIntent?: string;
  assignedTo?: string;
  assignedToName?: string;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
  rating?: number;
  tags: string[];
  source: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'staff';
  content: string;
  timestamp: string;
  senderName: string;
  isStaff?: boolean;
  aiConfidence?: number;
  aiIntent?: string;
}

interface ChatAnalytics {
  totalConversations: number;
  activeConversations: number;
  averageResponseTime: number;
  satisfactionRating: number;
  resolutionRate: number;
  humanHandoffRate: number;
  topIntents: Array<{ intent: string; count: number }>;
  dailyStats: Array<{ date: string; conversations: number; resolved: number }>;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  activeConversations: number;
  avgResponseTime: number;
  satisfactionRating: number;
}

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

export const StaffChatDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    assigned: 'all',
    search: ''
  });
  const [view, setView] = useState<'conversations' | 'analytics' | 'settings'>('conversations');
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // =============================================================================
  // INITIALIZATION
  // =============================================================================
  
  useEffect(() => {
    initializeDashboard();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      await Promise.all([
        fetchConversations(),
        fetchAnalytics(),
        fetchStaffMembers()
      ]);
      
      initializeSocket();
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/chat/analytics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await fetch('/api/staff/chat-status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setStaffMembers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch staff members:', error);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    const tenantId = localStorage.getItem('tenantId');
    
    socketRef.current = io('/staff-chat', {
      auth: { token },
      query: { tenantId }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('new-chat-started', (data) => {
      // Add new conversation to list
      fetchConversations();
      showNotification('New chat started', `${data.visitorName} has started a conversation`);
    });

    socketRef.current.on('visitor-message', (data) => {
      // Update conversation with new message
      fetchConversations();
      
      if (selectedConversation?.id === data.conversationId) {
        fetchConversationMessages(data.conversationId);
      }
      
      showNotification('New message', `${data.visitorName}: ${data.message.substring(0, 50)}...`);
    });

    socketRef.current.on('human-assistance-requested', (data) => {
      fetchConversations();
      showNotification('Human assistance requested', `${data.visitorName} needs help - ${data.reason}`);
    });

    socketRef.current.on('conversation-assigned', (data) => {
      fetchConversations();
    });
  };

  // =============================================================================
  // CONVERSATION MANAGEMENT
  // =============================================================================

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchConversationMessages(conversation.id);
  };

  const fetchConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const joinConversation = async (conversationId: string) => {
    if (!socketRef.current) return;
    
    try {
      socketRef.current.emit('join-conversation', conversationId);
      
      // Update conversation assignment
      await fetch(`/api/chat/conversations/${conversationId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      fetchConversations();
    } catch (error) {
      console.error('Failed to join conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !socketRef.current) return;
    
    try {
      socketRef.current.emit('send-staff-message', {
        conversationId: selectedConversation.id,
        message: newMessage,
        type: 'text'
      });
      
      setNewMessage('');
      await fetchConversationMessages(selectedConversation.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const endConversation = async (conversationId: string) => {
    if (!socketRef.current) return;
    
    try {
      socketRef.current.emit('end-conversation', conversationId);
      fetchConversations();
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/church-icon.png' });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter.status !== 'all' && conv.status !== filter.status) return false;
    if (filter.priority !== 'all' && conv.priority !== filter.priority) return false;
    if (filter.assigned !== 'all') {
      if (filter.assigned === 'me' && conv.assignedTo !== localStorage.getItem('userId')) return false;
      if (filter.assigned === 'unassigned' && conv.assignedTo) return false;
    }
    if (filter.search && !conv.visitorName?.toLowerCase().includes(filter.search.toLowerCase()) &&
        !conv.visitorEmail?.toLowerCase().includes(filter.search.toLowerCase())) return false;
    
    return true;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      waiting_human: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-blue-100 text-blue-800',
      abandoned: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'normal': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  // =============================================================================
  // RENDER COMPONENTS
  // =============================================================================

  const ConversationList: React.FC = () => (
    <div className="w-1/3 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <button
            onClick={fetchConversations}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-3 gap-2">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="waiting_human">Waiting</option>
            <option value="resolved">Resolved</option>
          </select>
          
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>
          
          <select
            value={filter.assigned}
            onChange={(e) => setFilter({ ...filter, assigned: e.target.value })}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">All Assigned</option>
            <option value="me">Mine</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => selectConversation(conv)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
              selectedConversation?.id === conv.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-sm text-gray-900">
                  {conv.visitorName || 'Anonymous Visitor'}
                </span>
                {conv.leadScore > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getLeadScoreColor(conv.leadScore)}`}>
                    {conv.leadScore}
                  </span>
                )}
              </div>
              {getPriorityIcon(conv.priority)}
            </div>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(conv.status)}`}>
                {conv.status.replace('_', ' ')}
              </span>
              {conv.visitorIntent && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {conv.visitorIntent}
                </span>
              )}
            </div>
            
            {conv.visitorEmail && (
              <div className="text-xs text-gray-500 mb-1">
                {conv.visitorEmail}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{conv.messageCount} messages</span>
              <span>{new Date(conv.lastActivityAt).toLocaleTimeString()}</span>
            </div>
            
            {conv.assignedToName && (
              <div className="text-xs text-blue-600 mt-1">
                Assigned to {conv.assignedToName}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const ChatWindow: React.FC = () => {
    if (!selectedConversation) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a conversation to start chatting</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedConversation.visitorName || 'Anonymous Visitor'}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedConversation.visitorEmail}
                {selectedConversation.visitorIntent && ` • ${selectedConversation.visitorIntent}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {!selectedConversation.assignedTo && (
                <button
                  onClick={() => joinConversation(selectedConversation.id)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Join
                </button>
              )}
              
              <button
                onClick={() => endConversation(selectedConversation.id)}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                End Chat
              </button>
              
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex mb-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-gray-200 text-gray-800'
                    : message.role === 'system'
                    ? 'bg-yellow-100 text-yellow-800 text-center'
                    : message.isStaff
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                {message.role !== 'user' && message.role !== 'system' && (
                  <div className="text-xs opacity-75 mb-1">
                    {message.isStaff ? message.senderName : 'AI Assistant'}
                    {message.aiConfidence && (
                      <span className="ml-2">({Math.round(message.aiConfidence * 100)}%)</span>
                    )}
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                <div className="text-xs opacity-75 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                  {message.aiIntent && (
                    <span className="ml-2 bg-black bg-opacity-10 px-1 rounded">
                      {message.aiIntent}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        {selectedConversation.assignedTo === localStorage.getItem('userId') && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const AnalyticsView: React.FC = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat Analytics</h2>
      
      {analytics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Conversations</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalConversations}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Resolution Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.resolutionRate)}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(analytics.averageResponseTime)}s</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.satisfactionRating.toFixed(1)}/5</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Intents */}
          <div className="bg-white p-6 rounded-lg shadow border mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Conversation Topics</h3>
            <div className="space-y-3">
              {analytics.topIntents.map((intent, index) => (
                <div key={intent.intent} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">
                    {intent.intent.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(intent.count / analytics.topIntents[0]?.count) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{intent.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading chat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Chat Dashboard</h1>
              <div className={`px-2 py-1 rounded-full text-xs ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('conversations')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    view === 'conversations'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Conversations
                </button>
                <button
                  onClick={() => setView('analytics')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    view === 'analytics'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setView('settings')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    view === 'settings'
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Settings
                </button>
              </div>
              
              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {view === 'conversations' && (
          <>
            <ConversationList />
            <ChatWindow />
          </>
        )}
        
        {view === 'analytics' && (
          <div className="w-full overflow-y-auto">
            <AnalyticsView />
          </div>
        )}
        
        {view === 'settings' && (
          <div className="w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat Settings</h2>
            <p className="text-gray-500">Settings panel coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffChatDashboard;