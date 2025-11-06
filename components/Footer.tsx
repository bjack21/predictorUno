import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#161b22]/60 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Prognos AI Predictor. For entertainment purposes only.</p>
      </div>
    </footer>
  );
};
