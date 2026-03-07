'use client';

import { useState } from 'react';

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
}

export function QuestionInput({
  value,
  onChange,
  placeholder,
  minLength = 0,
  maxLength = 500,
}: QuestionInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const charCount = value.length;
  const isValid = charCount >= minLength && charCount <= maxLength;

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-full h-40 px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-purple-300/50 focus:outline-none resize-none transition-colors ${
          isFocused
            ? 'border-purple-500'
            : isValid
              ? 'border-purple-300/20'
              : 'border-red-500/50'
        }`}
        maxLength={maxLength}
      />
      <div className="flex justify-between items-center text-sm">
        <span
          className={`${
            isValid ? 'text-purple-300' : 'text-red-400'
          }`}
        >
          {minLength > 0 && charCount < minLength
            ? `至少 ${minLength} 字`
            : ''}
        </span>
        <span
          className={`${
            charCount > maxLength * 0.9 ? 'text-yellow-400' : 'text-purple-300'
          }`}
        >
          {charCount} / {maxLength}
        </span>
      </div>
    </div>
  );
}
