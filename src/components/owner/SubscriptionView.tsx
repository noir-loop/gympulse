import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { PaymentPortalModal } from '../payment/PaymentPortalModal';
import { ShieldCheck, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  const { auth, gyms, subscriptions, saasPlans, updateGymSubscriptionStatus } = useGym();
  
  const currentGym = gyms.find(g => g.id === auth.gymId) || gyms[0];
  const gymSub = subscriptions.find(s => s.gymId === currentGym.id);

  const activePlans = saasPlans.filter(p => p.active);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number; period?: string }>({ 
    name: activePlans[0]?.name || 'Growth Enterprise Plan', 
    price: activePlans[0]?.price || 4999,
    period: activePlans[0]?.period || 'Monthly'
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e4df]">
        <div>
          <span className="nav-label-caps block mb-2 text-[#5c62d6]">Tenant Licensing & Remittance</span>
          <h1 className="content-title">SaaS Plan & Payment Portal</h1>
          <p className="text-[1rem] text-[#8a8a8a] mt-1">
            Enterprise subscription terms, capacity allocations, and live UPI QR payment gateway.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const nextStatus = gymSub?.status === 'active' ? 'expired' : 'active';
              updateGymSubscriptionStatus(currentGym.id, nextStatus);
            }}
            className="btn-editorial-outline cursor-pointer text-xs"
          >
            Toggle ({gymSub?.status === 'active' ? 'Simulate Expiry' : 'Activate'})
          </button>
          
          <button
            type="button"
            onClick={() => {
              setSelectedPlan({
                name: gymSub?.planName || activePlans[0]?.name || 'Growth Enterprise Plan',
                price: gymSub?.price || activePlans[0]?.price || 4999,
                period: 'Monthly',
              });
              setIsCheckoutOpen(true);
            }}
            className="btn-editorial-primary flex items-center gap-2 cursor-pointer text-xs"
          >
            <QrCode className="w-3.5 h-3.5" /> Pay SaaS via UPI QR
          </button>
        </div>
      </div>

      {/* Active License Overview */}
      <div className="card-editorial p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="nav-label-caps block mb-2">Current Active License</span>
          <h2 className="font-serif text-3xl font-medium text-[#1a1a1a] mb-2">{gymSub?.planName || 'Growth Enterprise'}</h2>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8a8a8a]">
            <span>Valid from {gymSub?.startDate} to <strong className="text-[#1a1a1a]">{gymSub?.endDate}</strong></span>
            <span>•</span>
            <span className={`status-tag ${gymSub?.status === 'active' ? 'tag-active' : 'tag-expired'}`}>
              {gymSub?.status}
            </span>
            {gymSub?.status === 'active' && (
              <span className="text-[#15803d] flex items-center gap-1 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
        </div>

        <div className="text-left md:text-right">
          <span className="nav-label-caps block">Recurring Investment</span>
          <span className="font-serif text-3xl font-semibold text-[#1a1a1a]">
            ₹{gymSub?.price.toLocaleString('en-IN')}
          </span>
          <span className="font-mono text-xs text-[#8a8a8a] block">/ License Interval</span>
        </div>
      </div>

      {/* Plans Tier Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {activePlans.map((plan) => (
          <div key={plan.id} className={`card-editorial p-8 flex flex-col justify-between relative ${plan.popular ? 'border-[#5c62d6]' : ''}`}>
            {plan.popular && (
              <span className="absolute -top-3 left-6 px-3 py-0.5 bg-[#5c62d6] text-white text-[0.65rem] uppercase font-bold tracking-widest rounded-xs">
                Preferred Selection
              </span>
            )}

            <div>
              <span className="nav-label-caps block mb-2">{plan.period} Tier</span>
              <h3 className="font-serif text-2xl font-medium text-[#1a1a1a] mb-3">{plan.name}</h3>
              <p className="text-xs text-[#8a8a8a] mb-4 leading-relaxed">{plan.description}</p>
              
              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-1.5 mb-6 text-xs text-[#1a1a1a]">
                  {plan.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-[#5c62d6]">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="font-serif text-4xl font-medium text-[#1a1a1a] mb-8">
                ₹{plan.price.toLocaleString('en-IN')} <span className="font-sans text-xs text-[#8a8a8a] font-normal">/ {plan.period}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedPlan({ name: plan.name, price: plan.price, period: plan.period });
                setIsCheckoutOpen(true);
              }}
              className={`w-full cursor-pointer flex items-center justify-center gap-2 ${
                plan.popular ? 'btn-editorial-primary' : 'btn-editorial-outline'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" /> Pay via UPI QR
            </button>
          </div>
        ))}
      </div>

      {/* Integrated Live UPI QR Payment Modal */}
      <PaymentPortalModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        mode="saas"
        saasDetails={{
          gymId: currentGym.id,
          gymName: currentGym.name,
          planName: selectedPlan.name,
          price: selectedPlan.price,
          period: selectedPlan.period || 'Monthly',
        }}
      />

    </div>
  );
};
