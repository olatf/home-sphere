'use client';

import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import {
  type ClipboardEvent,
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { verifyPin } from '@/actions/wallets';
import { BrandInput, type FormValue } from '@/components/common/BrandInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MAX_ATTEMPTS, PIN_LENGTH } from '@/config/constants';

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

  const PIN_ARRAY = [1, 2, 3, 4];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="z-200 w-full max-w-sm rounded-2xl p-0 font-secondary">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <DialogTitle className="font-primary font-semibold text-base text-gray-900">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">{subtitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-6 font-secondary">
          <p className="text-center text-gray-500 text-sm">{subtitle}</p>

          <div className="flex justify-center gap-3">
            {PIN_ARRAY.map((val, i) => (
              <BrandInput
                key={val}
                name="pin"
                ref={el => {
                  refs.current[i] = el;
                }}
                type={visible ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={1}
                value={pin[i] ?? ''}
                onChange={(val: FormValue) => handleChange(i, val as string)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                disabled={status === 'locked' || status === 'verifying'}
                className={`h-14 w-14 rounded-xl border-2 text-center font-bold text-xl transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  status === 'error'
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : pin[i]
                      ? 'border-brand bg-brand-light/30 text-brand-light'
                      : 'border-gray-200 bg-gray-50 focus:border-brand focus:bg-white'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisible(v => !v)}
              className="flex items-center gap-1.5 text-gray-400 text-xs transition hover:text-gray-600"
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
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-red-600 text-sm">
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
            className="w-full rounded-xl bg-brand py-3 font-semibold text-sm text-white transition hover:bg-brand-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
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
