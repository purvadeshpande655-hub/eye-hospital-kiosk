// Voice Input Enhancement for Patient Registration Form
// This ensures dictated text properly fills the input field

export const enhanceVoiceInput = (transcript, inputSelector = '.form-input') => {
  const input = document.querySelector(inputSelector);
  if (input && transcript.trim()) {
    // Set the value
    input.value = transcript.trim();
    
    // Create and dispatch input event
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    
    // Also trigger change event for React
    const changeEvent = new Event('change', { bubbles: true });
    input.dispatchEvent(changeEvent);
    
    // Focus the input
    input.focus();
    
    return true;
  }
  return false;
};

// Hook for better voice input handling
export const useVoiceInput = (onInputChange, inputSelector = '.form-input') => {
  const handleVoiceResult = (transcript) => {
    const success = enhanceVoiceInput(transcript, inputSelector);
    if (success && onInputChange) {
      onInputChange(transcript.trim());
    }
  };
  
  return { handleVoiceResult };
};
