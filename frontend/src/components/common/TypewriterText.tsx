import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  emptyPause?: number;
  className?: string;
  cursorClassName?: string;
  prefix?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  phrases,
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseDuration = 2000,
  emptyPause = 400,
  className = '',
  cursorClassName = '',
  prefix = '',
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const currentPhrase = phrases[phraseIndex % phrases.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      // Adding letter by letter (Typing flow animation)
      if (currentText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        // Pause when full phrase is displayed, before starting backspace removal
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Removing letter by letter (Backspace removal animation)
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length - 1));
        }, deletingSpeed);
      } else {
        // Pauses on empty, then transitions to next phrase
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, emptyPause);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration, emptyPause]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span>{currentText}</span>
      <span className={`inline-block ml-0.5 animate-pulse font-mono font-bold select-none ${cursorClassName || 'text-[#ff7a00]'}`}>
        |
      </span>
    </span>
  );
};
