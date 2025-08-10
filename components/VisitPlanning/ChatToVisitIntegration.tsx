// Chat to Visit Integration Component
// Allows converting chat conversations into visit plans
'use client';

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { VisitPlanningForm } from './VisitPlanningForm';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  metadata?: any;
}

interface ExtractedVisitInfo {
  visitor_name?: string;
  visitor_email?: string;
  visitor_phone?: string;
  party_size?: number;
  adults_count?: number;
  children_count?: number;
  children_ages?: number[];
  preferred_service_type?: string;
  special_needs?: string;
  wheelchair_accessible?: boolean;
  childcare_needed?: boolean;
  lead_source: string;
  referrer_name?: string;
}

interface ChatToVisitIntegrationProps {
  conversationId: string;
  messages: ChatMessage[];
  onVisitPlanned?: (visitPlan: any) => void;
  onClose?: () => void;
}

export default function ChatToVisitIntegration({ 
  conversationId, 
  messages, 
  onVisitPlanned, 
  onClose 
}: ChatToVisitIntegrationProps) {
  const [extractedInfo, setExtractedInfo] = useState<ExtractedVisitInfo>({ lead_source: 'chat' });
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    analyzeConversation();
  }, [messages]);

  const analyzeConversation = async () => {
    setAnalyzing(true);
    
    try {
      // Extract information from chat messages using AI/NLP
      const extracted = await extractVisitorInformation(messages);
      setExtractedInfo({
        ...extracted,
        lead_source: 'chat'
      });
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      toast.error('Failed to analyze conversation');
    } finally {
      setAnalyzing(false);
    }
  };

  const extractVisitorInformation = async (messages: ChatMessage[]): Promise<ExtractedVisitInfo> => {
    // This would typically use AI/NLP to extract information
    // For now, we'll do basic pattern matching and keyword extraction
    
    const conversationText = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ')
      .toLowerCase();

    const extracted: ExtractedVisitInfo = {
      lead_source: 'chat'
    };

    // Extract name patterns
    const namePatterns = [
      /my name is ([a-zA-Z\s]+)/i,
      /i'm ([a-zA-Z\s]+)/i,
      /this is ([a-zA-Z\s]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = conversationText.match(pattern);
      if (match && match[1]) {
        extracted.visitor_name = match[1].trim();
        break;
      }
    }

    // Extract email patterns
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = conversationText.match(emailPattern);
    if (emailMatch) {
      extracted.visitor_email = emailMatch[0];
    }

    // Extract phone patterns
    const phonePatterns = [
      /(\d{3}[-.]?\d{3}[-.]?\d{4})/,
      /\((\d{3})\)\s*(\d{3})[-.]?(\d{4})/
    ];
    
    for (const pattern of phonePatterns) {
      const match = conversationText.match(pattern);
      if (match) {
        extracted.visitor_phone = match[0];
        break;
      }
    }

    // Extract party size information
    const partySizePatterns = [
      /(\d+) people/i,
      /party of (\d+)/i,
      /(\d+) of us/i,
      /we are (\d+)/i
    ];
    
    for (const pattern of partySizePatterns) {
      const match = conversationText.match(pattern);
      if (match && match[1]) {
        extracted.party_size = parseInt(match[1]);
        break;
      }
    }

    // Extract children information
    const childrenPatterns = [
      /(\d+) child(?:ren)?/i,
      /(\d+) kid(?:s)?/i,
      /with (\d+) child/i
    ];
    
    for (const pattern of childrenPatterns) {
      const match = conversationText.match(pattern);
      if (match && match[1]) {
        extracted.children_count = parseInt(match[1]);
        if (extracted.party_size) {
          extracted.adults_count = extracted.party_size - extracted.children_count;
        }
        break;
      }
    }

    // Extract service preferences
    if (conversationText.includes('contemporary') || conversationText.includes('modern music')) {
      extracted.preferred_service_type = 'contemporary';
    } else if (conversationText.includes('traditional') || conversationText.includes('hymns')) {
      extracted.preferred_service_type = 'traditional';
    }

    // Check for accessibility needs
    if (conversationText.includes('wheelchair') || conversationText.includes('accessibility')) {
      extracted.wheelchair_accessible = true;
    }

    // Check for childcare needs
    if (conversationText.includes('childcare') || conversationText.includes('kids program')) {
      extracted.childcare_needed = true;
    }

    // Extract special needs or requests
    const specialNeedsKeywords = [
      'special need', 'accommodation', 'help with', 'assistance', 
      'dietary', 'allergy', 'wheelchair', 'mobility'
    ];
    
    for (const keyword of specialNeedsKeywords) {
      if (conversationText.includes(keyword)) {
        // Try to extract the context around the keyword
        const sentences = conversationText.split(/[.!?]+/);
        for (const sentence of sentences) {
          if (sentence.includes(keyword)) {
            extracted.special_needs = sentence.trim();
            break;
          }
        }
        break;
      }
    }

    return extracted;
  };

  const handleFormSubmit = (visitPlan: any) => {
    // Mark the chat conversation as converted
    markConversationAsConverted(conversationId);
    
    onVisitPlanned?.(visitPlan);
    toast.success('Visit planned successfully from chat conversation!');
  };

  const markConversationAsConverted = async (conversationId: string) => {
    try {
      await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            converted_to_visit: true,
            conversion_date: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.error('Error marking conversation as converted:', error);
    }
  };

  if (analyzing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyzing Conversation</h3>
          <p className="text-gray-600">
            Extracting visitor information from chat messages...
          </p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to conversation analysis
          </button>
        </div>
        
        <VisitPlanningForm
          prefillData={extractedInfo}
          chatConversationId={conversationId}
          onSuccess={handleFormSubmit}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center">
              <CalendarIcon className="w-6 h-6 mr-2" />
              Convert to Visit Plan
            </h2>
            <p className="text-blue-100 mt-1">
              Turn this conversation into a planned church visit
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Analysis Results */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Extracted Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Contact Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  {extractedInfo.visitor_name ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <ExclamationCircleIcon className="w-4 h-4 text-yellow-600 mr-2" />
                  )}
                  <span className="text-gray-600 mr-2">Name:</span>
                  <span className="font-medium">
                    {extractedInfo.visitor_name || 'Not provided'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  {extractedInfo.visitor_email ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <ExclamationCircleIcon className="w-4 h-4 text-yellow-600 mr-2" />
                  )}
                  <span className="text-gray-600 mr-2">Email:</span>
                  <span className="font-medium">
                    {extractedInfo.visitor_email || 'Not provided'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  {extractedInfo.visitor_phone ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <ExclamationCircleIcon className="w-4 h-4 text-yellow-600 mr-2" />
                  )}
                  <span className="text-gray-600 mr-2">Phone:</span>
                  <span className="font-medium">
                    {extractedInfo.visitor_phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Visit Preferences</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  {extractedInfo.party_size ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <ExclamationCircleIcon className="w-4 h-4 text-yellow-600 mr-2" />
                  )}
                  <span className="text-gray-600 mr-2">Party Size:</span>
                  <span className="font-medium">
                    {extractedInfo.party_size || 'Not specified'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  {extractedInfo.children_count ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <ExclamationCircleIcon className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-gray-600 mr-2">Children:</span>
                  <span className="font-medium">
                    {extractedInfo.children_count || '0'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  {extractedInfo.preferred_service_type ? (
                    <CheckCircleIcon className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <ExclamationCircleIcon className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className="text-gray-600 mr-2">Service Type:</span>
                  <span className="font-medium">
                    {extractedInfo.preferred_service_type || 'No preference'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Needs/Accommodations */}
          {(extractedInfo.special_needs || extractedInfo.wheelchair_accessible || extractedInfo.childcare_needed) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-800 mb-2">Special Accommodations Noted</h4>
              <div className="space-y-1 text-sm">
                {extractedInfo.wheelchair_accessible && (
                  <div className="flex items-center text-yellow-700">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Wheelchair accessibility requested
                  </div>
                )}
                {extractedInfo.childcare_needed && (
                  <div className="flex items-center text-yellow-700">
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Childcare requested
                  </div>
                )}
                {extractedInfo.special_needs && (
                  <div className="text-yellow-700">
                    <strong>Special request:</strong> {extractedInfo.special_needs}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Conversation Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Conversation Summary
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            {messages.slice(-5).map((message, index) => (
              <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-900 border'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <CalendarIcon className="w-5 h-5 mr-2" />
            Plan Visit
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
          
          <button
            onClick={analyzeConversation}
            className="flex-1 sm:flex-initial bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            🔄 Re-analyze Conversation
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Information Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Note about extracted information:</p>
              <p>
                We've analyzed your conversation to pre-fill the visit planning form. 
                You can review and modify any information on the next step. 
                Missing information will be requested in the form.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for integrating with existing chat components
export const useChatToVisitConversion = (conversationId: string, messages: ChatMessage[]) => {
  const [showVisitPlanning, setShowVisitPlanning] = useState(false);
  
  const canConvertToVisit = () => {
    // Check if the conversation contains visit-related keywords
    const conversationText = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ')
      .toLowerCase();
      
    const visitKeywords = [
      'visit', 'service', 'worship', 'church', 'attend', 'come', 
      'sunday', 'time', 'schedule', 'when', 'location', 'address'
    ];
    
    return visitKeywords.some(keyword => conversationText.includes(keyword));
  };

  const suggestVisitConversion = () => {
    return canConvertToVisit() && !showVisitPlanning;
  };

  return {
    showVisitPlanning,
    setShowVisitPlanning,
    canConvertToVisit,
    suggestVisitConversion
  };
};