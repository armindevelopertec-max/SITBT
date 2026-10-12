'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utilidades';
import { Search, X, ChevronDown } from 'lucide-react';

interface SearchableSelectProps {
  value: number | string;
  onChange: (value: string) => void;
  options: { value: string | number; label: string; searchText?: string }[];
  placeholder?: string;
  className?: string;
}

export function SelectorBuscable({
  value,
  onChange,
  options,
  placeholder = 'Buscar...',
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value.toString() === value.toString());

  const filteredOptions = options.filter(opt => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const labelMatch = opt.label.toLowerCase().includes(searchLower);
    const searchMatch = opt.searchText?.toLowerCase().includes(searchLower);
    return labelMatch || searchMatch;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optValue: string | number) => {
    onChange(optValue.toString());
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex items-center w-full rounded-lg border border-gray-300 bg-white px-3 py-2 cursor-pointer hover:border-gray-400 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500',
          isOpen && 'border-primary-500 ring-1 ring-primary-500'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
        <span className={cn('flex-1 truncate text-sm', !selectedOption && 'text-gray-400')}>
          {selectedOption?.label || placeholder}
        </span>
        {value && (
          <X
            className="w-4 h-4 text-gray-400 hover:text-gray-600 mr-1 flex-shrink-0"
            onClick={handleClear}
          />
        )}
        <ChevronDown className={cn('w-4 h-4 text-gray-400 flex-shrink-0', isOpen && 'rotate-180')} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Escribe para buscar..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No se encontraron materias
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={cn(
                    'px-4 py-2 cursor-pointer hover:bg-gray-50 text-sm',
                    opt.value.toString() === value.toString() && 'bg-primary-50 text-primary-600'
                  )}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}