import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import BaymaxAvatar from "./BaymaxAvatar";
import MessageBubble from "./MessageBubble";
import ChatHistory from "./ChatHistory";
import axios from "axios";
import TypingEffect from "./TypingEffect";

// Set the base URL for API requests
const API_BASE_URL = "http://localhost:5000"; // Adjust this to your backend server address

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "baymax",
      text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
      isTyping: false,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeChat, setActiveChat] = useState(null);

  // Function to analyze symptoms using our backend
  const analyzeSymptoms = async (symptoms) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/symptoms`, { symptoms });
      return response.data;
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      throw error;
    }
  };

  // Function to query the Mistral AI model through our backend
  const queryMistralAI = async (userInput, medicalContext = "") => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/mistral`, {
        prompt: userInput,
        medicalContext,
      });
      return response.data.answer;
    } catch (error) {
      console.error("Error querying Mistral AI:", error);
      setErrorMessage("Sorry, I'm having trouble connecting to my medical database right now.");
      return "I'm experiencing technical difficulties. Please try again later.";
    }
  };

  // Function to search MedlinePlus for information
  const searchMedlinePlus = async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/medlineplus?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching MedlinePlus:", error);
      return null;
    }
  };

  // Function to search National Library of Medicine
  const searchNLM = async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/nlm?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching NLM:", error);
      return null;
    }
  };

  // Helper function to extract potential drug terms from user input
  const extractDrugTerms = (input) => {
    // This is a simplified version - in a real app, you might use NLP or a medical dictionary
    const commonDrugs = [
      "aspirin", "ibuprofen", "acetaminophen", "paracetamol", "tylenol",
      "advil", "motrin", "aleve", "naproxen", "benadryl", "zyrtec", "claritin",
      "antibiotics", "penicillin", "amoxicillin", "lisinopril", "metformin",
      "lipitor", "atorvastatin", "simvastatin", "metoprolol", "losartan"
    ];
    
    const words = input.toLowerCase().split(/\s+/);
    return commonDrugs.filter(drug => words.includes(drug));
  };

  // Main function to process user input and generate responses
  const processSymptoms = async (userSymptoms) => {
    setIsLoading(true);
    
    try {
      // Step 1: Check symptoms with our backend symptom analyzer
      let symptomsAnalysis;
      try {
        symptomsAnalysis = await analyzeSymptoms(userSymptoms);
      } catch (error) {
        console.error("Symptom analysis failed, continuing with other methods:", error);
        // If symptom analysis fails, we'll continue with other methods
      }
      
      // Step 2: Search MedlinePlus for general information about the condition
      let medlinePlusData;
      try {
        medlinePlusData = await searchMedlinePlus(userSymptoms);
      } catch (error) {
        console.error("MedlinePlus search failed:", error);
      }
      
      // Step 3: Get additional context from NLM (medical literature)
      let nlmData;
      try {
        nlmData = await searchNLM(userSymptoms);
      } catch (error) {
        console.error("NLM search failed:", error);
      }
      
      // Step 4: Compile medical context for Mistral AI
      let medicalContext = "";
      
      if (symptomsAnalysis) {
        medicalContext += `Symptom analysis: ${JSON.stringify(symptomsAnalysis)}\n\n`;
      }
      
      if (medlinePlusData) {
        medicalContext += `MedlinePlus information: ${JSON.stringify(medlinePlusData)}\n\n`;
      }
      
      if (nlmData) {
        medicalContext += `Medical literature: ${JSON.stringify(nlmData)}\n\n`;
      }
      
      // Step 5: Generate response using Mistral AI with all the context
      const aiResponse = await queryMistralAI(
        `${userSymptoms}. Provide medical advice and information in a helpful, caring manner as Baymax.`, 
        medicalContext
      );
      
      return aiResponse;
    } catch (error) {
      console.error("Error processing symptoms:", error);
      return "I'm sorry, I encountered an error while analyzing your symptoms. Please try again or consult a healthcare professional if you are experiencing severe symptoms.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!symptoms.trim() || isLoading) return;

    // Add user message
    const userMessage = { sender: "user", text: symptoms };
    setMessages(prev => [...prev, userMessage]);
    
    // Show analyzing message with typing animation
    setMessages(prev => [
      ...prev, 
      { sender: "baymax", text: "I'm analyzing your symptoms...", isTyping: true }
    ]);
    
    // Auto-scroll after adding the analyzing message
    setTimeout(() => {
      const messageContainer = document.getElementById("message-container");
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
    
    // Process the symptoms
    const response = await processSymptoms(symptoms);
    
    // Update messages to show the response with typing animation
    setMessages(messages => {
      // Filter out the loading/analyzing message
      const filteredMessages = messages.filter(msg => msg.text !== "I'm analyzing your symptoms...");
      // Add the real response with typing animation
      return [...filteredMessages, { sender: "baymax", text: response, isTyping: true }];
    });
    
    // Auto-scroll to the bottom after adding the new message
    setTimeout(() => {
      const messageContainer = document.getElementById("message-container");
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
    
    setSymptoms("");
  };

  // Handle typing completion for each message
  const handleTypingComplete = (index) => {
    setMessages(prev => 
      prev.map((msg, i) => 
        i === index ? { ...msg, isTyping: false } : msg
      )
    );
  };
  
  // Handle chat selection from chat history
  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    
    // For demo purposes, we'll simulate loading previous chat messages
    if (chat.id === 1) {
      setMessages([
        {
          sender: "baymax",
          text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
          isTyping: false,
        },
        {
          sender: "user",
          text: "I have been coughing for a week and spitting phlegm.",
        },
        {
          sender: "baymax",
          text: "Hello! I'm here to help you with your health concerns. I'm sorry to hear that you've been coughing for a week and spitting phlegm. Let's see how we can make you feel better.\nBased on the information you've provided, your symptoms could be related to several mild conditions such as:\nCommon cold\nBronchitis\nAsthma",
          isTyping: false,
        }
      ]);
    } else if (chat.id === 2) {
      setMessages([
        {
          sender: "baymax",
          text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
          isTyping: false,
        },
        {
          sender: "user",
          text: "I've had a persistent headache for the past 3 days.",
        },
        {
          sender: "baymax",
          text: "I understand you've been experiencing a persistent headache for the past 3 days. This must be uncomfortable for you. Persistent headaches can have various causes, including tension, dehydration, lack of sleep, or stress. Have you noticed any triggers or patterns with your headache? Also, are you experiencing any other symptoms alongside the headache, such as sensitivity to light or sound?",
          isTyping: false,
        }
      ]);
    } else if (chat.id === 3 || chat.id === 4) {
      // For other existing chats, load appropriate conversation
      setMessages([
        {
          sender: "baymax",
          text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
          isTyping: false,
        },
        {
          sender: "user",
          text: chat.preview,
        },
        {
          sender: "baymax",
          text: "I'm here to help you with your health concerns. Could you please provide more details about your symptoms so I can better assist you?",
          isTyping: false,
        }
      ]);
    } else {
      // For new chats, reset to initial message
      setMessages([
        {
          sender: "baymax",
          text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
          isTyping: false,
        }
      ]);
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-6xl mx-auto mt-6 flex gap-0">
      {/* Chat history sidebar */}
      <div className="md:block">
        <ChatHistory onSelectChat={handleSelectChat} activeChat={activeChat} />
      </div>
      
      {/* Main chat interface */}
      <div className="flex-1">
        <div className="flex items-center justify-center mb-8">
          <BaymaxAvatar mood={isLoading ? "thinking" : "neutral"} />
        </div>

        <div className="bg-gray-100 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Symptom Checker</h2>

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}

          <div 
            id="message-container"
            className="space-y-4 mb-6 overflow-y-auto max-h-96 p-2"
          >
            {messages.map((message, index) => (
              <MessageBubble key={index} sender={message.sender}>
                {message.sender === "baymax" && message.isTyping ? (
                  <div className="flex items-center">
                    <div className="animate-pulse mr-2">⚕️</div>
                    <TypingEffect 
                      text={message.text} 
                      speed={2} 
                      onComplete={() => handleTypingComplete(index)}
                    />
                  </div>
                ) : (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                )}
              </MessageBubble>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              className={`${
                isLoading 
                  ? "bg-gray-400" 
                  : "bg-red-500 hover:bg-red-600"
              } text-white px-6 py-3 rounded-lg transition-colors`}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Send"}
            </button>
          </div>
          
          {/* Additional information */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              This app uses MedlinePlus and NLM data for health information.
              <br />
              Always consult with a healthcare professional for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}