import { useState, useEffect } from "react";
import { PlusCircle, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../firebase"; // Import your Firebase db
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Chat History Component with Firebase integration
export default function ChatHistory({ onSelectChat, activeChat, currentMessages }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Fetch chat history from Firestore when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const userId = auth.currentUser?.uid;
        
        if (!userId) {
          setLoading(false);
          return; // Exit if no user is logged in
        }
        
        const chatsRef = collection(db, "users", userId, "chats");
        const q = query(chatsRef, orderBy("createdAt", "desc"));
        
        const querySnapshot = await getDocs(q);
        const chatList = [];
        
        querySnapshot.forEach((doc) => {
          const chatData = doc.data();
          chatList.push({
            id: doc.id,
            title: chatData.title,
            date: chatData.createdAt?.toDate().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) || new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            preview: chatData.preview || "No preview available",
            messages: chatData.messages || []
          });
        });
        
        setChats(chatList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [auth.currentUser]);

  // Watch for changes in currentMessages to update active chat
  useEffect(() => {
    const updateActiveChat = async () => {
      // If there's no active chat or no messages, return
      if (!activeChat || !currentMessages || currentMessages.length === 0) return;
      
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
        // Generate preview from the latest user message
        const userMessages = currentMessages.filter(msg => msg.sender === "user");
        const latestUserMessage = userMessages.length > 0 
          ? userMessages[userMessages.length - 1].text 
          : "";
        
        // Update the chat in Firestore
        const chatRef = doc(db, "users", userId, "chats", activeChat.id);
        await updateDoc(chatRef, {
          messages: currentMessages,
          preview: latestUserMessage || activeChat.preview,
          updatedAt: serverTimestamp()
        });
        
        // Update local state
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === activeChat.id 
              ? {
                  ...chat,
                  preview: latestUserMessage || chat.preview,
                  messages: currentMessages,
                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                }
              : chat
          )
        );
      } catch (error) {
        console.error("Error updating chat:", error);
      }
    };
    
    updateActiveChat();
  }, [currentMessages, activeChat, auth.currentUser]);

  const createNewChat = async () => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        alert("Please sign in to create a new chat");
        return;
      }
      
      // Initial message from Baymax
      const initialMessages = [{
        sender: "baymax",
        text: "Hello, I am Baymax, your personal healthcare companion. Please describe your symptoms, and I will try to help.",
        isTyping: false,
      }];
      
      // Create a new chat document in Firestore
      const chatsRef = collection(db, "users", userId, "chats");
      const newChatDoc = await addDoc(chatsRef, {
        title: "New consultation",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        preview: "Start a new health conversation...",
        messages: initialMessages
      });
      
      // Create the new chat object with the Firestore document ID
      const newChat = {
        id: newChatDoc.id,
        title: "New consultation",
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        preview: "Start a new health conversation...",
        messages: initialMessages
      };
      
      // Update state
      setChats([newChat, ...chats]);
      
      // Select the new chat
      onSelectChat(newChat);
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert("Failed to create new chat");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`bg-white rounded-xl shadow-md h-[calc(100vh-180px)] flex flex-col transition-all duration-300 ${isCollapsed ? 'w-14 overflow-hidden' : 'w-full'} relative`}>
      {/* Header with title and toggle button side by side */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'justify-between p-4'}`}>
        <h2 className="text-xl font-bold text-red-500 flex items-center">
          {isCollapsed ? (
            <Clock className="w-6 h-6" />
          ) : (
            <span>Chat History</span>
          )}
        </h2>
        
        {/* Toggle collapse button - Next to the clock icon */}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* When collapsed, show the expand button below the clock icon */}
      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md mx-auto mt-2 mb-4"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
      
      <button
        onClick={createNewChat}
        className={`bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors ${
          isCollapsed ? 'p-2 mx-auto mb-4' : 'p-3 mx-4 mb-4'
        }`}
      >
        <PlusCircle className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-2'}`} />
        {!isCollapsed && 'New Chat'}
      </button>
      
      {!isCollapsed && (
        <div className="text-sm text-gray-500 font-medium mb-2 mx-4 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Recent Consultations
        </div>
      )}
      
      <div className="overflow-y-auto flex-grow px-2">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 w-full bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center p-4 text-gray-500">
            No chat history found. Start a new chat!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`mb-2 rounded-lg cursor-pointer transition-colors ${
                isCollapsed 
                  ? 'p-2 text-center'
                  : 'p-3'
              } ${
                activeChat && activeChat.id === chat.id
                  ? isCollapsed 
                    ? "bg-red-100 border-l-2 border-red-500" 
                    : "bg-red-100 border-l-4 border-red-500"
                  : "hover:bg-gray-100"
              }`}
              title={isCollapsed ? chat.title : ''}
            >
              {isCollapsed ? (
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-red-600 font-medium">
                    {chat.title.charAt(0)}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-800 truncate">{chat.title}</h3>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(chat.date)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.preview}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}