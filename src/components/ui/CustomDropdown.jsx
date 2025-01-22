import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({ 
  label, 
  options = [], 
  value = '', 
  onChange,  
  placeholder,
  name 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Update searchTerm when value prop changes
  useEffect(() => {
    setSearchTerm(value);
    setSelectedValue(value);
  }, [value]);

  const filteredOptions = options.filter(option => 
    option?.name?.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!searchTerm) {
          setSearchTerm(selectedValue || '');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchTerm, selectedValue]);

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    setSearchTerm(optionValue);
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setSelectedValue(newValue);
    
    // Trigger onChange for every input change
    onChange({ target: { name, value: newValue } });
    
    if (!newValue) {
      setSelectedValue('');
    }
    
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  if (!Array.isArray(options)) {
    console.warn('CustomDropdown: options prop must be an array');
    return null;
  }

  return (
    <div className="w-full my-2  mb-4" ref={dropdownRef}>
      <label className="block mb-3 text-sm font-medium text-gray-200">
        {label}
      </label>
      <div className="relative">
        <div className="w-full bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer flex items-center justify-between">
          <input
            ref={inputRef}
            autoComplete="off"
            aria-autocomplete="off"
            type="text"
            className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:shadow-md"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option._id || Math.random()}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                  onClick={() => handleSelect(option.name)}
                >
                  {option.name || 'Unnamed Option'}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No options found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;