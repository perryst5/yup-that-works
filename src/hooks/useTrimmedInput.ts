import { useState, ChangeEvent } from 'react';

export function useTrimmedInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    setValue(value.trim());
  };

  return {
    value,
    setValue,
    handleChange,
    handleBlur,
    trimmedValue: value.trim()
  };
}
