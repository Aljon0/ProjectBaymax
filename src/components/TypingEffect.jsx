import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// This component creates a typing animation effect with proper markdown rendering
export default function TypingEffect({ text, speed = 2, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when we get new text
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      // For very fast typing, process multiple characters at once
      const charsPerTick = speed < 3 ? 3 : 1;
      
      // Set up the timer for the next character(s)
      const timer = setTimeout(() => {
        const endIndex = Math.min(currentIndex + charsPerTick, text.length);
        const nextChars = text.substring(currentIndex, endIndex);
        setDisplayedText(prev => prev + nextChars);
        setCurrentIndex(endIndex);
      }, speed);
      
      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  return (
    <div className="typing-animation baymax-response">
      <ReactMarkdown components={{
        // Customize ReactMarkdown rendering for lists
        ul: ({node, ...props}) => <ul className="baymax-list" {...props} />,
        ol: ({node, ...props}) => <ol className="baymax-ordered-list" {...props} />,
        li: ({node, ...props}) => <li className="baymax-list-item" {...props} />
      }}>
        {displayedText}
      </ReactMarkdown>
      {currentIndex < text.length && (
        <span className="inline-block typing-cursor animate-pulse">|</span>
      )}
    </div>
  );
}