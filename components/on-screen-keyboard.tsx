'use client';

import { useEffect, useRef, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import { Button } from '@/components/ui/button';
import { Keyboard as KeyboardIcon, X } from 'lucide-react';

interface OnScreenKeyboardProps {
  onChange: (value: string) => void;
  value: string;
  onClose?: () => void;
  placeholder?: string;
}

export function OnScreenKeyboard({ onChange, value, onClose, placeholder }: OnScreenKeyboardProps) {
  const keyboardRef = useRef<any>(null);
  const [layoutName, setLayoutName] = useState('default');

  useEffect(() => {
    if (keyboardRef.current) {
      keyboardRef.current.setInput(value);
    }
  }, [value]);

  const handleChange = (input: string) => {
    onChange(input);
  };

  const onKeyPress = (button: string) => {
    // Handle shift toggle
    if (button === '{shift}' || button === '{shiftleft}' || button === '{shiftright}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
      return false;
    }

    // Close keyboard on enter/done
    if (button === '{enter}') {
      if (onClose) {
        onClose();
      }
      return false;
    }

    // Return to default layout after typing a character (if on shift)
    if (layoutName === 'shift' && button !== '{bksp}' && button !== '{space}') {
      setLayoutName('default');
    }

    // Prevent default browser actions (space scroll, backspace navigation, etc.)
    return false;
  };

  // Prevent keyboard shortcuts from triggering browser actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent space from scrolling when keyboard is open
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
      }
      // Prevent backspace from navigating back
      if (e.key === 'Backspace') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-2xl z-[9999] animate-fade-in pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyboardIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{placeholder || 'On-Screen Keyboard'}</span>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="pointer-events-auto">
          <Keyboard
            keyboardRef={(r: any) => (keyboardRef.current = r)}
            onChange={handleChange}
            onKeyPress={onKeyPress}
            layoutName={layoutName}
            layout={{
              default: [
                '1 2 3 4 5 6 7 8 9 0 {bksp}',
                'q w e r t y u i o p',
                'a s d f g h j k l',
                'z x c v b n m',
                '{shift} . , {space} {enter}',
              ],
              shift: [
                '! @ # $ % ^ & * ( ) {bksp}',
                'Q W E R T Y U I O P',
                'A S D F G H J K L',
                'Z X C V B N M',
                '{shift} - _ = + / \\ : ; \' " {enter}',
              ],
            }}
            display={{
              '{bksp}': '⌫ Delete',
              '{enter}': '✓ Done',
              '{space}': 'Space',
              '{shift}': layoutName === 'shift' ? '⇧ SHIFT' : '⇧ Shift',
            }}
            buttonTheme={[
              {
                class: layoutName === 'shift' ? 'hg-activeButton' : '',
                buttons: '{shift}',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
