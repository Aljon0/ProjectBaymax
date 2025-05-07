import { useState, useEffect } from "react";
import BaymaxAvatar from "./BaymaxAvatar";
import MessageBubble from "./MessageBubble";
import ChatHistory from "./ChatHistory";
import axios from "axios";
import TypingEffect from "./TypingEffect";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";
import { db } from "../firebase";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc
} from "firebase/firestore";
import { auth } from "../firebase";
import voiceline from "../assets/BaymaxVoice.wav";

const API_BASE_URL = "http://localhost:5000";

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
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [user, setUser] = useState(null);
  const [showStartPrompt, setShowStartPrompt] = useState(true);
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const playAudio = () => {
    const audio = new Audio(voiceline);
    audio.play();
  };

  const analyzeSymptoms = async (symptoms) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/symptoms`, { symptoms });
      return response.data;
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      throw error;
    }
  };

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

  const searchMedlinePlus = async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/medlineplus?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching MedlinePlus:", error);
      return null;
    }
  };

  const searchNLM = async (query) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/nlm?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Error searching NLM:", error);
      return null;
    }
  };

  const extractDrugTerms = (input) => {
    const commonDrugs = [
      "aspirin", "ibuprofen", "acetaminophen", "paracetamol", "tylenol",
      "advil", "motrin", "aleve", "naproxen", "benadryl", "zyrtec", "claritin",
      "antibiotics", "penicillin", "amoxicillin", "lisinopril", "metformin",
      "lipitor", "atorvastatin", "simvastatin", "metoprolol", "losartan"
    ];
    
    const words = input.toLowerCase().split(/\s+/);
    return commonDrugs.filter(drug => words.includes(drug));
  };

  const processSymptoms = async (userSymptoms) => {
    setIsLoading(true);
    
    try {
      let symptomsAnalysis;
      try {
        symptomsAnalysis = await analyzeSymptoms(userSymptoms);
      } catch (error) {
        console.error("Symptom analysis failed, continuing with other methods:", error);
      }
      
      let medlinePlusData;
      try {
        medlinePlusData = await searchMedlinePlus(userSymptoms);
      } catch (error) {
        console.error("MedlinePlus search failed:", error);
      }
      
      let nlmData;
      try {
        nlmData = await searchNLM(userSymptoms);
      } catch (error) {
        console.error("NLM search failed:", error);
      }
      
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

  const createNewChat = async () => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        alert("Please sign in to create a new chat");
        return null;
      }
      
      playAudio();
      
      const initialMessages = [{
        sender: "baymax",
        text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
        isTyping: false,
      }];
      
      const chatsRef = collection(db, "users", userId, "chats");
      const newChatDoc = await addDoc(chatsRef, {
        title: "New consultation",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preview: "Start a new health conversation...",
        messages: initialMessages
      });
      
      const newChat = {
        id: newChatDoc.id,
        title: "New consultation",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        preview: "Start a new health conversation...",
        messages: initialMessages
      };
      
      // Update the chat list state
      setChatList(prevChats => [newChat, ...prevChats]);
      
      setActiveChat(newChat);
      setShowStartPrompt(false);
      setMessages(initialMessages);
      
      return newChat;
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert("Failed to create new chat");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!symptoms.trim() || isLoading) return;

    if (!activeChat) {
      const newChat = await createNewChat();
      if (!newChat) return;
    }

    const userMessage = { sender: "user", text: symptoms };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    if (activeChat) {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const chatRef = doc(db, "users", userId, "chats", activeChat.id);
          
          await updateDoc(chatRef, {
            messages: updatedMessages,
            preview: symptoms,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error updating chat with user message:", error);
      }
    }
    
    const analyzingMessages = [...updatedMessages, { sender: "baymax", text: "I'm analyzing your symptoms...", isTyping: false }];
    setMessages(analyzingMessages);
    
    setTimeout(() => {
      const messageContainer = document.getElementById("message-container");
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
    
    const response = await processSymptoms(symptoms);
    
    const finalMessages = analyzingMessages.filter(msg => msg.text !== "I'm analyzing your symptoms...");
    const responseMessage = { sender: "baymax", text: response, isTyping: true };
    const updatedMessagesWithResponse = [...finalMessages, responseMessage];
    
    setMessages(updatedMessagesWithResponse);
    
    if (activeChat) {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const chatRef = doc(db, "users", userId, "chats", activeChat.id);
          await updateDoc(chatRef, {
            messages: updatedMessagesWithResponse,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error updating chat with response:", error);
      }
    }
    
    setTimeout(() => {
      const messageContainer = document.getElementById("message-container");
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
    
    setSymptoms("");
  };

  const handleTypingComplete = (index) => {
    const updatedMessages = messages.map((msg, i) => 
      i === index ? { ...msg, isTyping: false } : msg
    );
    
    setMessages(updatedMessages);
    
    if (activeChat) {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const chatRef = doc(db, "users", userId, "chats", activeChat.id);
          updateDoc(chatRef, {
            messages: updatedMessages,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error updating chat after typing complete:", error);
      }
    }
  };
  
  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setShowStartPrompt(false);
    
    if (chat.messages && chat.messages.length > 0) {
      setMessages(chat.messages);
    } else {
      setMessages([
        {
          sender: "baymax",
          text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
          isTyping: false,
        }
      ]);
    }
  };

  const handleStartChat = async () => {
    const newChat = await createNewChat();
    if (newChat) {
      setShowStartPrompt(false);
    }
  };

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const renderMessageContent = (message) => {
    if (message.sender === "baymax" && message.isTyping) {
      return (
        <TypingEffect 
          text={message.text} 
          speed={2} 
          onComplete={() => handleTypingComplete(messages.indexOf(message))} 
        />
      );
    } else if (message.sender === "baymax") {
      return (
        <div className="baymax-response">
          <ReactMarkdown components={{
            ul: ({node, ...props}) => <ul className="baymax-list" {...props} />,
            ol: ({node, ...props}) => <ol className="baymax-ordered-list" {...props} />,
            li: ({node, ...props}) => <li className="baymax-list-item" {...props} />
          }}>
            {message.text}
          </ReactMarkdown>
        </div>
      );
    } else {
      return <div>{message.text}</div>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 px-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:hidden mb-4">
          <button 
            onClick={toggleSidebar}
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 flex items-center"
          >
            {sidebarVisible ? 
              <><ChevronLeft className="w-4 h-4 mr-2" /> Hide Chat History</> : 
              <><ChevronRight className="w-4 h-4 mr-2" /> Show Chat History</>
            }
          </button>
        </div>
        
        <div className={`${sidebarVisible ? 'block' : 'hidden'} md:block md:w-72 flex-shrink-0 mb-6 md:mb-0`}>
          <ChatHistory 
            onSelectChat={handleSelectChat} 
            activeChat={activeChat} 
            currentMessages={messages}
            isMobileView={window.innerWidth < 768}
            setShowChatHistory={setSidebarVisible}
            onCreateNewChat={createNewChat}
            chatList={chatList}
            setChatList={setChatList}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md">
              <div className="w-16 h-8 bg-black rounded-full flex items-center justify-around">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {showStartPrompt && !activeChat ? (
            <div className="bg-gray-100 rounded-xl p-8 mb-6 text-center">
              <h2 className="text-2xl font-bold mb-6">Welcome to Baymax Health Assistant</h2>
              <p className="text-gray-700 mb-8">To get started with your health consultation, please click the button below.</p>
              
              <button
                onClick={handleStartChat}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-medium flex items-center justify-center mx-auto transition-colors"
              >
                <Play className="w-5 h-5 mr-2" />
                Start New Consultation
              </button>
              
              {!user && (
                <div className="mt-4 text-sm text-gray-500">
                  Sign in to save your consultations
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-4 md:p-6 mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Symptom Checker</h2>

              {!user && (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 text-center">
                  Please sign in to save your consultations
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errorMessage}
                </div>
              )}

              <div 
                id="message-container"
                className="space-y-4 mb-4 md:mb-6 overflow-y-auto max-h-64 md:max-h-96 p-2"
              >
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-full md:max-w-3/4 p-3 rounded-lg ${
                        message.sender === "user" 
                          ? "bg-red-500 text-white" 
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      {renderMessageContent(message)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
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
                  } text-white px-6 py-3 rounded-lg transition-colors mt-2 sm:mt-0`}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Send"}
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>
                  This app uses MedlinePlus and NLM data for health information.
                  <br />
                  Always consult with a healthcare professional for medical advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}