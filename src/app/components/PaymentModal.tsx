import { useState } from 'react';
import { X, CreditCard, Smartphone, Building2, CheckCircle2, Loader2, Lock, Shield } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess?: () => void;
}

type PaymentMethod = 'gcash' | 'maya' | 'card' | 'bank';
type PaymentStep = 'select' | 'details' | 'processing' | 'success';

const C = {
  primary: '#C4623F',
  dark: '#1A2B3C',
  teal: '#2A9D8F',
  gold: '#C89558',
  bg: '#F5F0E8',
  light: '#F9F6F1',
};

export function PaymentModal({ isOpen, onClose, amount, description, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('gcash');
  const [step, setStep] = useState<PaymentStep>('select');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  if (!isOpen) return null;

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    }, 2500);
  };

  const handleClose = () => {
    setStep('select');
    setMethod('gcash');
    setPhone('');
    setCardNumber('');
    setCardName('');
    setExpiry('');
    setCvv('');
    setSelectedBank('');
    onClose();
  };

  const METHODS = [
    { id: 'gcash' as PaymentMethod, label: 'GCash', icon: '💚', color: '#007D4B', desc: 'Pay via GCash e-wallet' },
    { id: 'maya' as PaymentMethod, label: 'Maya', icon: '💙', color: '#0055A5', desc: 'Pay via Maya e-wallet' },
    { id: 'card' as PaymentMethod, label: 'Credit / Debit Card', icon: '💳', color: '#1A2B3C', desc: 'Visa, Mastercard, JCB' },
    { id: 'bank' as PaymentMethod, label: 'Bank Transfer', icon: '🏦', color: '#C89558', desc: 'InstaPay / PESONet' },
  ];

  const BANKS = ['BDO', 'BPI', 'Metrobank', 'UnionBank', 'Security Bank', 'RCBC', 'Landbank', 'PNB'];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100" style={{ background: C.light }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Lock size={14} style={{ color: C.primary }} />
              <span className="text-xs text-gray-500">Secure Payment</span>
            </div>
            <h2 style={{ color: C.dark }} className="text-lg">{description}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-2xl" style={{ color: C.primary }}>₱{amount.toLocaleString()}</p>
          </div>
          <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Step: Select Method */}
          {step === 'select' && (
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-500 mb-4">Choose your preferred payment method</p>
              {METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
                  style={{
                    borderColor: method === m.id ? C.primary : '#E5E7EB',
                    background: method === m.id ? '#FDF5F2' : 'white',
                  }}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: C.dark }}>{m.label}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: method === m.id ? C.primary : '#D1D5DB' }}
                  >
                    {method === m.id && <div className="w-2.5 h-2.5 rounded-full" style={{ background: C.primary }} />}
                  </div>
                </button>
              ))}
              <button
                onClick={() => setStep('details')}
                className="w-full py-3.5 rounded-xl text-white mt-4 transition-opacity hover:opacity-90"
                style={{ background: C.primary }}
              >
                Continue
              </button>
            </div>
          )}

          {/* Step: Payment Details */}
          {step === 'details' && (
            <div className="p-5 space-y-4">
              <button onClick={() => setStep('select')} className="text-sm flex items-center gap-1.5" style={{ color: C.primary }}>
                ← Back to payment methods
              </button>

              {(method === 'gcash' || method === 'maya') && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl text-center" style={{ background: method === 'gcash' ? '#E8F5F0' : '#E8F0F9' }}>
                    <span className="text-4xl">{method === 'gcash' ? '💚' : '💙'}</span>
                    <p className="mt-2 text-sm" style={{ color: C.dark }}>
                      Pay with {method === 'gcash' ? 'GCash' : 'Maya'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1.5">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="09XX XXX XXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': C.primary } as React.CSSProperties}
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-700">
                      You will receive a One-Time Password (OTP) to confirm your payment. Standard messaging rates may apply.
                    </p>
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1.5">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCard(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={e => setExpiry(formatExpiry(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1.5">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cvv}
                        onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-100">
                    <Shield size={14} className="text-green-600" />
                    <p className="text-xs text-green-700">Your card information is encrypted and secured with SSL.</p>
                  </div>
                </div>
              )}

              {method === 'bank' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">Select Your Bank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BANKS.map(b => (
                        <button
                          key={b}
                          onClick={() => setSelectedBank(b)}
                          className="p-3 rounded-xl border-2 text-sm transition-all"
                          style={{
                            borderColor: selectedBank === b ? C.primary : '#E5E7EB',
                            background: selectedBank === b ? '#FDF5F2' : 'white',
                            color: selectedBank === b ? C.primary : C.dark,
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedBank && (
                    <div className="p-4 rounded-xl border border-gray-200" style={{ background: C.light }}>
                      <p className="text-xs text-gray-500 mb-2">Transfer Details</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Account Name</span>
                          <span style={{ color: C.dark }}>SewsEra Inc.</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Account No.</span>
                          <span style={{ color: C.dark }}>1234-5678-90</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Bank</span>
                          <span style={{ color: C.dark }}>{selectedBank}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount</span>
                          <span style={{ color: C.primary }}>₱{amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handlePay}
                className="w-full py-3.5 rounded-xl text-white transition-opacity hover:opacity-90"
                style={{ background: C.primary }}
              >
                Pay ₱{amount.toLocaleString()}
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[280px]">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#FDF5F2' }}>
                <Loader2 size={32} style={{ color: C.primary }} className="animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-gray-800">Processing Payment</p>
                <p className="text-sm text-gray-500 mt-1">Please do not close this window...</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div className="h-1.5 rounded-full animate-pulse" style={{ background: C.primary, width: '70%' }} />
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="p-8 flex flex-col items-center justify-center gap-4 min-h-[280px]">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#E8F9F0' }}>
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-xl" style={{ color: C.dark }}>Payment Successful!</p>
                <p className="text-sm text-gray-500 mt-1">₱{amount.toLocaleString()} has been processed.</p>
                <p className="text-xs text-gray-400 mt-2">You will receive a confirmation shortly.</p>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        {step === 'select' || step === 'details' ? (
          <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2">
            <Shield size={12} className="text-gray-400" />
            <p className="text-xs text-gray-400">Secured by SewsEra Pay · PCI DSS Compliant</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
