
import React from 'react';

interface InputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  options?: string[];
  className?: string;
  suffix?: string;
}

const Input: React.FC<InputProps> = ({ label, type = 'text', value, onChange, placeholder, options, className, suffix }) => {
  const baseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border";
  
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">{label}</label>
      <div className="relative">
        {options ? (
          <select value={value} onChange={onChange} className={baseClasses}>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={value}
            onChange={onChange}
            className={baseClasses}
            placeholder={placeholder}
            rows={2}
          />
        ) : (
          <div className="flex">
            <input
              type={type}
              value={value}
              onChange={onChange}
              className={`${baseClasses} ${suffix ? 'rounded-r-none' : ''}`}
              placeholder={placeholder}
            />
            {suffix && (
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                {suffix}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
