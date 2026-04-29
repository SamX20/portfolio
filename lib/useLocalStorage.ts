import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): T {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // دالة تحمل البيانات من localStorage
    const handleStorageChange = () => {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    };

    // حمّل البيانات أول مرة
    handleStorageChange();

    // راقب localStorage وحدّث البيانات لو تغيرت
    window.addEventListener('storage', handleStorageChange);
    
    // تنظيف عند إغلاق المكون
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return storedValue;
}