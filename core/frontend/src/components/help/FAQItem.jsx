import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';

/**
 * FAQItem Component
 * A collapsible question/answer item with keyboard accessibility
 */
const FAQItem = ({ question, answer, isOpen: defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Generate a unique ID for accessibility
  const id = React.useMemo(() => 
    `faq-${question.toLowerCase().replace(/\W+/g, '-')}`, 
    [question]
  );
  
  // Handle toggle
  const handleToggle = () => setIsOpen(prev => !prev);
  
  // Handle keyboard events
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };
  
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        className={`flex justify-between items-center w-full py-4 px-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isOpen ? 'text-blue-600' : 'text-gray-800'}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={id}
        tabIndex={0}
      >
        <span className="font-medium text-lg">{question}</span>
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
        />
      </button>
      
      <div 
        id={id}
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}
        aria-hidden={!isOpen}
      >
        <div className="prose prose-slate max-w-none px-2">
          {typeof answer === 'string' ? (
            <p className="text-gray-600">{answer}</p>
          ) : (
            answer
          )}
        </div>
      </div>
    </div>
  );
};

FAQItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]).isRequired,
  isOpen: PropTypes.bool
};

export default FAQItem;
