import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useGym } from '../../context/GymContext';
import {
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Download,
  Receipt,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

export interface PaymentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'saas' | 'member';
  // SaaS Mode details
  saasDetails?: {
    gymId: string;
    gymName: string;
    planName: string;
    price: number;
    period: string;
  };
  // Member Mode details
  memberDetails?: {
    gymId: string;
    gymName: string;
    memberId: string;
    memberName: string;
    phone?: string;
    planName: string;
    amount: number;
    autoCheckIn?: boolean;
    onPaymentSuccess?: (paymentRef: string) => void;
  };
}

export const PaymentPortalModal: React.FC<PaymentPortalModalProps> = ({
  isOpen,
  onClose,
  mode,
  saasDetails,
  memberDetails,
}) => {
  const {
    gyms,
    updateGymSubscription,
    processMemberQRPayment,
    recordCheckIn,
    showToast,
  } = useGym();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [customUtr, setCustomUtr] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer

  const targetGym =
    mode === 'saas'
      ? gyms.find(g => g.id === saasDetails?.gymId) || gyms[0]
      : gyms.find(g => g.id === memberDetails?.gymId) || gyms[0];

  const gymName =
    mode === 'saas'
      ? saasDetails?.gymName || targetGym?.name || 'Iron House Fitness'
      : memberDetails?.gymName || targetGym?.name || 'Iron House Fitness';

  const amount =
    mode === 'saas' ? saasDetails?.price || 4999 : memberDetails?.amount || 2500;

  const planName =
    mode === 'saas'
      ? saasDetails?.planName || 'Growth Enterprise Plan'
      : memberDetails?.planName || 'Quarterly Unlimited';

  // UPI VPA identification
  const upiId =
    mode === 'saas'
      ? 'gympulse.platform@okaxis'
      : `${(targetGym?.name || 'facility')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')}@okaxis`;

  const payeeName =
    mode === 'saas' ? 'GymPulse SaaS Platform' : `${gymName} Official`;

  // Generate UPI payment URL
  const upiPayload = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(
    mode === 'saas'
      ? `SaaS License - ${gymName}`
      : `Gym Fee - ${memberDetails?.memberName || 'Member'}`
  )}`;

  // Generate QR Code on mount or details change
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(upiPayload, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#1a1a1a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));

    // Reset state
    setIsProcessing(false);
    setPaymentSuccess(null);
    setCustomUtr(`UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    setTimeLeft(600);
  }, [isOpen, upiPayload]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || paymentSuccess || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, paymentSuccess, timeLeft]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    showToast('UPI VPA copied to clipboard!');
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);

    const finalUtr =
      customUtr.trim() ||
      `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    setTimeout(() => {
      setIsProcessing(false);

      if (mode === 'saas') {
        // SaaS payment for gym owner
        const period = saasDetails?.period || 'Monthly';
        const isAnnual = period === 'Annual' || planName.toLowerCase().includes('annual');
        const months = isAnnual ? 12 : period === 'Quarterly' ? 3 : 1;
        const newEnd = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        updateGymSubscription(targetGym.id, {
          planName,
          price: amount,
          status: 'active',
          endDate: newEnd,
        });

        const receipt = {
          mode: 'saas',
          transactionId: finalUtr,
          date: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          gymName,
          planName,
          amount,
          validUntil: newEnd,
          payer: targetGym.ownerName,
        };

        setPaymentSuccess(receipt);
        showToast(
          `SaaS License renewed successfully! Active until ${newEnd}`,
          'success'
        );
      } else {
        // Member fee payment through SaaS QR
        if (!memberDetails) return;

        const result = processMemberQRPayment(
          memberDetails.gymId,
          memberDetails.memberId,
          amount,
          planName,
          finalUtr
        );

        // Auto check in if requested (e.g. from kiosk turnstile)
        if (memberDetails.autoCheckIn) {
          recordCheckIn(memberDetails.gymId, memberDetails.memberId);
        }

        const receipt = {
          mode: 'member',
          transactionId: finalUtr,
          date: new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          time: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          gymName,
          memberName: memberDetails.memberName,
          memberId: memberDetails.memberId,
          planName,
          amount,
          validUntil: result.member.membershipEndDate,
        };

        setPaymentSuccess(receipt);

        if (memberDetails.onPaymentSuccess) {
          memberDetails.onPaymentSuccess(finalUtr);
        }

        showToast(
          `Member payment of ₹${amount.toLocaleString('en-IN')} verified & recorded in Financial Records!`,
          'success'
        );
      }
    }, 1200);
  };

  return (
    <div className="modal-editorial-wrap animate-fade-in" onClick={onClose}>
      <div
        className="modal-editorial-body p-6 md:p-8 max-w-xl w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
          <div className="flex items-center gap-2">
            <span className="brand-serif text-2xl text-[#5c62d6]">GymPulse</span>
            <span className="text-[0.65rem] uppercase tracking-widest text-[#8a8a8a] font-mono border-l border-[#e6e4df] pl-2.5">
              {mode === 'saas' ? 'SaaS License Portal' : 'Member Fee QR Gateway'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8a8a8a] hover:text-[#1a1a1a] transition-colors cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentSuccess ? (
          /* RECEIPT VIEW */
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-[#e7f7f0] text-[#15803d] border border-[#15803d]/30 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-[#1a1a1a]">
                Payment Verified & Reconciled
              </h3>
              <p className="text-xs text-[#8a8a8a]">
                Transaction settled through unified UPI gateway and posted to the ledger.
              </p>
            </div>

            {/* Formal Receipt Card */}
            <div className="p-6 bg-white border border-[#e6e4df] rounded-lg shadow-xs space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center pb-3 border-b border-[#e6e4df]">
                <div>
                  <span className="text-[#8a8a8a] text-[10px] block">PAYEE</span>
                  <span className="font-semibold text-sm text-[#1a1a1a]">
                    {paymentSuccess.gymName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#8a8a8a] text-[10px] block">SETTLEMENT REF</span>
                  <span className="font-bold text-[#5c62d6]">
                    {paymentSuccess.transactionId}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8a8a8a] block">Item / Plan:</span>
                  <span className="font-medium text-[#1a1a1a]">
                    {paymentSuccess.planName}
                  </span>
                </div>
                {paymentSuccess.mode === 'member' ? (
                  <div>
                    <span className="text-[#8a8a8a] block">Member:</span>
                    <span className="font-medium text-[#1a1a1a]">
                      {paymentSuccess.memberName} ({paymentSuccess.memberId})
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[#8a8a8a] block">Tenant Admin:</span>
                    <span className="font-medium text-[#1a1a1a]">
                      {paymentSuccess.payer}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[#8a8a8a] block">Date & Time:</span>
                  <span className="text-[#1a1a1a]">
                    {paymentSuccess.date} at {paymentSuccess.time}
                  </span>
                </div>
                <div>
                  <span className="text-[#8a8a8a] block">New Conclusion Date:</span>
                  <span className="font-bold text-[#15803d]">
                    {paymentSuccess.validUntil}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6e4df] flex justify-between items-center text-sm font-sans">
                <span className="font-medium text-[#1a1a1a]">Remittance Total:</span>
                <span className="font-serif text-2xl font-bold text-[#1a1a1a]">
                  ₹{paymentSuccess.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-editorial-outline flex-1 flex items-center justify-center gap-2 cursor-pointer text-xs py-2.5"
              >
                <Download className="w-3.5 h-3.5" /> Print / Save Slip
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-editorial-primary flex-1 flex items-center justify-center gap-2 cursor-pointer text-xs py-2.5"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* SCAN & PAY QR VIEW */
          <div className="space-y-6 animate-fade-in">
            {/* Top summary banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white border border-[#e6e4df] rounded-lg">
              <div>
                <span className="nav-label-caps block text-[#5c62d6]">
                  {mode === 'saas' ? 'Platform Subscription' : 'Member Subscription Fee'}
                </span>
                <div className="font-serif text-xl font-medium text-[#1a1a1a]">
                  {planName}
                </div>
                <div className="text-xs text-[#8a8a8a] font-mono mt-0.5">
                  {mode === 'saas'
                    ? `Facility: ${gymName}`
                    : `Member: ${memberDetails?.memberName} (${memberDetails?.memberId})`}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-mono text-[#8a8a8a] block">
                  Amount Payable
                </span>
                <span className="font-serif text-3xl font-semibold text-[#1a1a1a]">
                  ₹{amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Main Interactive QR Area */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white border border-[#e6e4df] rounded-lg">
              {/* QR Box with Scan Frame */}
              <div className="relative flex flex-col items-center shrink-0">
                <div className="p-3 bg-white border-2 border-[#1a1a1a] rounded-lg shadow-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="UPI Payment QR Code"
                      className="w-48 h-48 md:w-52 md:h-52 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-[#8a8a8a]">
                      Generating QR...
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-[#8a8a8a]">
                  <Clock className="w-3.5 h-3.5 text-[#5c62d6]" />
                  <span>Valid for: </span>
                  <strong className="text-[#1a1a1a]">{formatTimer(timeLeft)}</strong>
                </div>
              </div>

              {/* QR Guidance & Instructions */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="font-serif text-lg font-medium text-[#1a1a1a] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#5c62d6]" />
                    <span>Scan with Any UPI App</span>
                  </h4>
                  <p className="text-xs text-[#8a8a8a] mt-1 leading-relaxed">
                    Open Google Pay, PhonePe, Paytm, BHIM, or any banking app to scan
                    this dynamic QR code.
                  </p>
                </div>

                {/* UPI VPA Copy Bar */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono text-[#8a8a8a] font-semibold">
                    UPI VPA / Handle
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-[#f8f7f4] border border-[#e6e4df] px-3 py-1.5 rounded text-xs font-mono text-[#1a1a1a] select-all">
                      {upiId}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="btn-editorial-outline px-3 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#15803d]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Accepted UPI Brands */}
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#8a8a8a] block mb-1.5">
                    Supported UPI Networks
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'Cred', 'Amazon Pay'].map(
                      badge => (
                        <span
                          key={badge}
                          className="px-2 py-0.5 bg-[#f8f7f4] border border-[#e6e4df] rounded text-[10px] font-mono text-[#1a1a1a]"
                        >
                          {badge}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Verification & UTR Reconciliation Section */}
            <div className="p-4 bg-[#f8f7f4] border border-[#e6e4df] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="nav-label-caps text-[#1a1a1a]">
                  Instant Transaction Verification
                </span>
                <span className="text-[10px] font-mono text-[#15803d] flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse" />
                  Live Gateway Listener
                </span>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-[#8a8a8a] mb-1">
                  Bank Reference Number / 12-Digit UTR
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUtr}
                    onChange={e => setCustomUtr(e.target.value)}
                    placeholder="e.g. UPI/402819481928"
                    className="flex-1 bg-white border border-[#e6e4df] px-3 py-2 text-xs font-mono text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustomUtr(
                        `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`
                      )
                    }
                    className="btn-editorial-outline px-2.5 py-2 text-xs cursor-pointer font-mono"
                    title="Generate new mock UTR"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="btn-editorial-primary w-full py-3 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Reconciling with Bank Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {mode === 'saas'
                        ? 'Confirm SaaS Remittance (Extend License)'
                        : 'Confirm Member Payment & Record in App'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
