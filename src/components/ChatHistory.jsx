import { useState } from "react";
import { PlusCircle, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default function ChatHistory({ onSelectChat, activeChat }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chats, setChats] = useState([
    {
      id: 1,
      title: "Coughing and phlegm",
      date: "May 6, 2025",
      preview: "I have been coughing for a week and spitting phlegm.",
    },
    {
      id: 2,
      title: "Headache consultation",
      date: "May 4, 2025",
      preview: "I've had a persistent headache for the past 3 days.",
    },
    {
      id: 3,
      title: "Joint pain",
      date: "Apr 30, 2025",
      preview: "My knees have been hurting after exercising.",
    },
    {
      id: 4,
      title: "Sleep issues",
      date: "Apr 28, 2025",
      preview: "I've been having trouble falling asleep at night.",
    },
  ]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New consultation",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      preview: "Start a new health conversation...",
    };
    
    setChats([newChat, ...chats]);
    onSelectChat(newChat);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`bg-white rounded-xl shadow-md h-[calc(100vh-180px)] flex flex-col transition-all duration-300 ${isCollapsed ? 'w-14 overflow-hidden' : 'p-4 min-w-64 max-w-72'} relative`}>
      {/* Toggle collapse button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md z-10"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <h2 className={`text-xl font-bold mb-4 text-red-500 flex items-center justify-between ${isCollapsed ? 'px-4 py-2' : ''}`}>
        {isCollapsed ? (
          <Clock className="w-6 h-6 mx-auto" />
        ) : (
          <span>Chat History</span>
        )}
      </h2>
      
      <button
        onClick={createNewChat}
        className={`bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors ${
          isCollapsed ? 'p-2 mx-auto mb-4' : 'p-3 mb-4'
        }`}
      >
        <PlusCircle className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-2'}`} />
        {!isCollapsed && 'New Chat'}
      </button>
      
      {!isCollapsed && (
        <div className="text-sm text-gray-500 font-medium mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          Recent Consultations
        </div>
      )}
      
      <div className="overflow-y-auto flex-grow">
        {chats.map((chat) => (
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
        ))}
      </div>
    </div>
  );
}