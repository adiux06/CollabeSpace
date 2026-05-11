import React from 'react';
import { useUIStore } from '../../store/uiStore';

interface ThemeToggleProps {
  id: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ id }) => {
  const { theme, toggleTheme } = useUIStore();
  
  return (
    <label className="mc-container" htmlFor={id}>
      <input 
        id={id}
        className="mc-theme-checkbox"
        type="checkbox"
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
      <div className="mc-lamp-block">
        {['mc-top', 'mc-bottom', 'mc-front', 'mc-back', 'mc-left', 'mc-right'].map((faceClass) => (
          <div key={faceClass} className={`mc-face ${faceClass}`}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i}></div>
            ))}
          </div>
        ))}
      </div>
    </label>
  );
};

export default ThemeToggle;
