import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import './Input.css';

interface InputProps {
  value?: string;
  onChange: (val: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

const Input: React.FC<InputProps> = ({ value: propValue = '', onChange, onFocus, onBlur }) => {
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
      <span className="Input-Icon" aria-hidden="true">
        /
      </span>
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

export default Input;
