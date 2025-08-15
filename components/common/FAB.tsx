import React from 'react';
import Icon from './Icon';

interface FABProps {
  onClick: () => void;
  icon: string;
  label: string;
}

const FAB: React.FC<FABProps> = ({ onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-600 dark:bg-blue-500 text-white rounded-2xl shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 ease-in-out flex items-center h-14 px-5 gap-3 group"
      aria-label={label}
    >
      <Icon name={icon} className="text-2xl group-hover:rotate-90 transition-transform" />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
};

export default FAB;
