import { useState, useEffect } from "react";
import { PlusCircle, Clock, Calendar, Trash2, AlertCircle } from "lucide-react";
import { db } from "../firebase";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import voiceline from "../assets/BaymaxVoice.wav";

export default function ChatHistory({ 
  onSelectChat, 
  activeChat, 
  currentMessages, 
  isMobileView, 
  setShowChatHistory,
  onCreateNewChat,
  chatList,
  setChatList
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const auth = getAuth();

  const playAudio = () => {
    const audio = new Audio(voiceline);
    audio.play();
  };

  // Sync with parent's chatList prop
  useEffect(() => {
    if (chatList && chatList.length > 0) {
      setChats(chatList);
      setLoading(false);
    } else {
      fetchChatHistory();
    }
  }, [chatList]);

  // Fetch chat history from Firestore when component mounts
  const fetchChatHistory = async () => {
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        setLoading(false);
        return;
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
      if (setChatList) setChatList(chatList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setLoading(false);
    }
  };

  // Watch for changes in currentMessages to update active chat
  useEffect(() => {
    const updateActiveChat = async () => {
      if (!activeChat || !currentMessages || currentMessages.length === 0) return;
      
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        
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
        const updatedChats = chats.map(chat => 
          chat.id === activeChat.id 
            ? {
                ...chat,
                preview: latestUserMessage || chat.preview,
                messages: currentMessages,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }
            : chat
        );
        
        setChats(updatedChats);
        if (setChatList) setChatList(updatedChats);
      } catch (error) {
        console.error("Error updating chat:", error);
      }
    };
    
    updateActiveChat();
  }, [currentMessages, activeChat]);

  const createNewChat = async () => {
    if (onCreateNewChat) {
      const newChat = await onCreateNewChat();
      if (newChat) {
        // Update local state if not handled by parent
        if (!setChatList) {
          setChats([newChat, ...chats]);
        }
        return;
      }
    }

    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        alert("Please sign in to create a new chat");
        return;
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
      
      const updatedChats = [newChat, ...chats];
      setChats(updatedChats);
      if (setChatList) setChatList(updatedChats);
      
      onSelectChat(newChat);
      
      if (isMobileView && setShowChatHistory) {
        setShowChatHistory(false);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      alert("Failed to create new chat");
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    if (deleteConfirm !== chatId) {
      setDeleteConfirm(chatId);
      return;
    }
    
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        alert("Please sign in to delete a chat");
        return;
      }
      
      const chatRef = doc(db, "users", userId, "chats", chatId);
      await deleteDoc(chatRef);
      
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      if (setChatList) setChatList(updatedChats);
      
      if (activeChat && activeChat.id === chatId) {
        const firstChat = updatedChats[0];
        onSelectChat(firstChat || null);
      }
      
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSelectChat = (chat) => {
    onSelectChat(chat);
    if (isMobileView && setShowChatHistory) {
      setShowChatHistory(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md h-[calc(100vh-180px)] flex flex-col w-full relative">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-bold text-red-500">Chat History</h2>
      </div>
      
      <button
        onClick={createNewChat}
        className="bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors p-3 mx-4 mb-4"
      >
        <PlusCircle className="w-5 h-5 mr-2" />
        New Chat
      </button>
      
      <div className="text-sm text-gray-500 font-medium mb-2 mx-4 flex items-center">
        <Clock className="w-4 h-4 mr-1" />
        Recent Consultations
      </div>
      
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
              onClick={() => handleSelectChat(chat)}
              className={`mb-2 rounded-lg cursor-pointer transition-colors p-3 ${
                activeChat && activeChat.id === chat.id
                  ? "bg-red-100 border-l-4 border-red-500"
                  : "hover:bg-gray-100"
              } relative group`}
            >
              <div className="flex items-center justify-between mb-1 pr-8">
                <h3 className="font-medium text-gray-800 truncate">{chat.title}</h3>
                <span className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(chat.date)}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{chat.preview}</p>
              
              {deleteConfirm === chat.id ? (
                <div className="absolute top-1 right-1 flex items-center">
                  <span className="text-xs mr-1 bg-red-50 text-red-600 p-1 rounded">Confirm?</span>
                  <button 
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded p-1 mr-1"
                    title="Confirm Delete"
                  >
                    <Trash2 className="w-3 h-3 cursor-pointer" />
                  </button>
                  <button 
                    onClick={cancelDelete}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded p-1 cursor-pointer"
                    title="Cancel"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button 
                  onClick={(e) => deleteChat(chat.id, e)}
                  className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded p-1"
                  title="Delete Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      
      {chats.length === 0 && !loading && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <AlertCircle className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  );
}