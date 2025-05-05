// ToastService.js
import { toast } from 'react-toastify';
import { Heart, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import React from 'react';

// Custom toast styles with improved visibility
const toastStyles = {
  success: {
    style: {
      background: 'linear-gradient(to right, #34d399, #10b981)',
      color: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      fontWeight: '500',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    icon: <CheckCircle2 size={24} className="text-white" />
  },
  error: {
    style: {
      background: 'linear-gradient(to right, #f87171, #ef4444)',
      color: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      fontWeight: '500',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    icon: <AlertCircle size={24} className="text-white" />
  },
  info: {
    style: {
      background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
      color: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      fontWeight: '500',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    icon: <Info size={24} className="text-white" />
  },
  baymax: {
    style: {
      background: 'linear-gradient(to right, #ef4444, #dc2626)',
      color: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      fontWeight: '500',
      padding: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    icon: <Heart size={24} className="text-white" />
  }
};

// Custom CSS for the rainbow loading bar
const rainbowProgressStyles = {
  background: 'linear-gradient(90deg, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
  backgroundSize: '500% 100%',
  animation: 'rainbow-progress 3s ease-in-out infinite',
  height: '4px',
};

// Toast close button
const CloseButton = ({ closeToast }) => (
  <button 
    onClick={closeToast} 
    className="flex items-center justify-center hover:opacity-80 transition-opacity"
  >
    <X size={18} color="white" />
  </button>
);

// Custom Toast component
const BaymaxToast = ({ type, message }) => {
  const toastType = toastStyles[type] || toastStyles.baymax;
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        {toastType.icon}
      </div>
      <div className="flex-grow font-medium">{message}</div>
    </div>
  );
};

// Add rainbow animation styles to document head
const addRainbowStylesIfNeeded = () => {
  if (!document.getElementById('rainbow-toast-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'rainbow-toast-styles';
    styleEl.innerHTML = `
      @keyframes rainbow-progress {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(styleEl);
  }
};

// Toast notification functions
export const showToast = (message, type = 'baymax') => {
  addRainbowStylesIfNeeded();
  
  const toastType = toastStyles[type] || toastStyles.baymax;
  
  toast(
    <BaymaxToast type={type} message={message} />,
    {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: toastType.style,
      closeButton: CloseButton,
      icon: false,
      progressStyle: rainbowProgressStyles,
      className: 'baymax-toast',
    }
  );
};

export const showSuccessToast = (message) => showToast(message, 'success');
export const showErrorToast = (message) => showToast(message, 'error');
export const showInfoToast = (message) => showToast(message, 'info');
export const showBaymaxToast = (message) => showToast(message, 'baymax');