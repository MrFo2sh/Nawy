import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing a value
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to cancel the timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for search functionality with debouncing
 * @param initialValue - Initial search value
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Object with search input, debounced value, loading state, and setter
 */
export function useSearchDebounce(
  initialValue: string = "",
  delay: number = 500
) {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchValue = useDebounce(searchInput, delay);

  // Track when search is in progress
  useEffect(() => {
    if (searchInput !== debouncedSearchValue) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchInput, debouncedSearchValue]);

  return {
    searchInput,
    debouncedSearchValue,
    isSearching,
    setSearchInput,
  };
}
