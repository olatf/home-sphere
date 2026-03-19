'use client';

import {
  useState,
  useRef,
  useCallback,
  KeyboardEvent,
  ClipboardEvent,
} from 'react';
import { ShieldCheck, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { verifyPin } from '@/actions/wallets';
import { PIN_LENGTH, MAX_ATTEMPTS } from '@/config/constants';

interface PinPromptModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  onVerified: () => void;
  onClose: () => void;
}

const emptyPin = (): string[] => Array<string>(PIN_LENGTH).fill('');

export const PinPromptModal = ({
  isOpen,
  title = 'Enter Wallet PIN',
  subtitle = 'Confirm your 4-digit PIN to continue.',
  onVerified,
  onClose,
}: PinPromptModalProps) => {
  const [pin, setPin] = useState<string[]>(emptyPin);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'verifying' | 'error' | 'locked'
  >('idle');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const pinComplete = pin.every(Boolean);

  // Reset all state back to initial — called when the dialog opens or closes
  const resetState = useCallback(() => {
    setPin(emptyPin());
    setStatus('idle');
    setError('');
    setAttempts(0);
    setVisible(false);
  }, []);

  function handleOpenChange(open: boolean) {
    if (!open && status !== 'verifying') {
      resetState();
      onClose();
    }
    if (open) {
      resetState();
      setTimeout(() => refs.current[0]?.focus(), 100);
    }
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next: string[] = [...pin];
    next[index] = digit;
    setPin(next);
    setError('');
    if (digit && index < PIN_LENGTH - 1) refs.current[index + 1]?.focus();
    if (digit && index === PIN_LENGTH - 1) {
      const fullPin = next.join('');
      if (fullPin.length === PIN_LENGTH) verify(fullPin);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, PIN_LENGTH);
    const next: string[] = Array<string>(PIN_LENGTH).fill('');
    pasted.split('').forEach((d, i) => {
      next[i] = d;
    });
    setPin(next);
    const lastFilled = Math.min(pasted.length - 1, PIN_LENGTH - 1);
    refs.current[lastFilled]?.focus();
    if (pasted.length === PIN_LENGTH) verify(pasted);
  }

  async function verify(pinString: string) {
    if (status === 'locked') return;
    setStatus('verifying');
    setError('');

    try {
      const res = await verifyPin(pinString);

      if (res.error) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin(emptyPin());
        setTimeout(() => refs.current[0]?.focus(), 50);

        if (newAttempts >= MAX_ATTEMPTS) {
          setStatus('locked');
          setError('Too many failed attempts. Please wait for 5 minutes.');
        } else {
          setStatus('error');
          setError(
            `Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempt${
              MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'
            } remaining.`
          );
        }
        return;
      }

      setStatus('idle');
      onVerified();
    } catch {
      setStatus('error');
      setError('Verification failed. Please try again.');
      setPin(emptyPin());
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="font-secondary z-200 w-full max-w-sm rounded-2xl p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <DialogTitle className="font-primary text-base font-semibold text-gray-900">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="font-secondary space-y-5 p-6">
          <p className="text-center text-sm text-gray-500">{subtitle}</p>

          <div className="flex justify-center gap-3">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <input
                key={i}
                ref={el => {
                  refs.current[i] = el;
                }}
                type={visible ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={1}
                value={pin[i] ?? ''}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                disabled={status === 'locked' || status === 'verifying'}
                className={`h-14 w-14 rounded-xl border-2 text-center text-xl font-bold transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  status === 'error'
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : pin[i]
                      ? 'border-brand bg-brand-light/30 text-brand-light'
                      : 'focus:border-brand border-gray-200 bg-gray-50 focus:bg-white'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisible(v => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-400 transition hover:text-gray-600"
            >
              {visible ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {visible ? 'Hide PIN' : 'Show PIN'}
            </button>
          </div>

          {(status === 'error' || status === 'locked') && error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => pinComplete && verify(pin.join(''))}
            disabled={
              !pinComplete || status === 'verifying' || status === 'locked'
            }
            className="bg-brand hover:bg-brand-dark/80 w-full rounded-xl py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'verifying' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
              </span>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
