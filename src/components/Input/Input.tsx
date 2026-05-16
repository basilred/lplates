import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import './Input.css';

interface InputProps {
  value?: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onScanClick?: () => void;
  scanLabel?: string;
};

const Input: React.FC<InputProps> = ({ 
  value: propValue = '', 
  onChange, 
  onFocus, 
  onBlur, 
  onScanClick,
  scanLabel = 'Scan'
}) => {
  const [internalValue, setInternalValue] = useState(propValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Синхронизация значения из пропсов
  useEffect(() => {
    setInternalValue(propValue);
  }, [propValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInternalValue(value);
    onChange(value);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="Input">
      <button 
        className="Input-Scan" 
        onClick={onScanClick} 
        type="button"
        aria-label={scanLabel}
        title={scanLabel}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      </button>
      <input
        ref={inputRef}
        className="Input-Field"
        placeholder="Type a code: AA, AK, 77, 178, A, 7"
        value={internalValue}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {internalValue ? (
        <button className="Input-Clear" onClick={handleClear} aria-label="Clear input">
          ✕
        </button>
      ) : (
        <span className="Input-Shortcut" aria-hidden="true">
          Enter
        </span>
      )}
    </div>
  );
};

export default React.memo(Input);
