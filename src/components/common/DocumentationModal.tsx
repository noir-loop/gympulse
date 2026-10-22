import React, { useState } from 'react';
import { BookOpen, ShieldCheck, Database, CreditCard, QrCode, X } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'backend' | 'payments' | 'qr' | 'checklist'>('overview');

  if (!isOpen) return null;

  return (
    <div className="modal-editorial-wrap animate-fade-in" onClick={onClose}>
      <div className="modal-editorial-body max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#e6e4df] bg-white">
          <div className="flex items-center gap-3">
            <span className="brand-serif text-2xl">GymPulse</span>
            <span className="text-xs uppercase font-bold text-[#8a8a8a] tracking-wider pl-2 border-l border-[#e6e4df]">
              Architecture Ledger
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-[#e6e4df] bg-[#f8f7f4] px-8 gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'backend', label: 'Multi-Tenant RLS', icon: Database },
            { id: 'payments', label: 'Payment Gateway', icon: CreditCard },
            { id: 'qr', label: 'Turnstile Security', icon: QrCode },
            { id: 'checklist', label: 'Production Vitals', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#5c62d6] text-[#5c62d6]'
                    : 'border-transparent text-[#8a8a8a] hover:text-[#1a1a1a]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-sm text-[#1a1a1a] leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="font-serif text-3xl font-medium text-[#1a1a1a]">Institutional Management Platform</h3>
              <p className="text-[#8a8a8a]">
                GymPulse delivers a disciplined, mobile-first SaaS repository designed specifically for independent fitness facilities in India. It centralizes member profiles, entrance tracking, retention alerts via WhatsApp, and reconciliation of UPI dues.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="card-editorial p-6">
                  <span className="nav-label-caps block mb-2">Tenant Experience</span>
                  <p className="text-xs text-[#8a8a8a]">
                    Register profiles, generate dynamic member QR badges, monitor dormancy with 1-click WhatsApp dispatches, and log financial settlements.
                  </p>
                </div>
                <div className="card-editorial p-6">
                  <span className="nav-label-caps block mb-2">Central Authority Portal</span>
                  <p className="text-xs text-[#8a8a8a]">
                    Oversee participating institutions, govern term licenses, terminate or extend permissions, and audit platform run-rates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4">
              <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#5c62d6]" /> Row-Level Partitioning & RLS Security
              </h3>
              <p className="text-[#8a8a8a]">
                GymPulse enforces a <strong>shared relational schema with isolated tenant domains</strong>. Every entity (`members`, `attendance`, `payments`, `subscriptions`) requires a strict `gym_id` foreign key.
              </p>
              <div className="p-4 bg-white border border-[#e6e4df] rounded font-mono text-xs text-[#1a1a1a]">
                <p className="text-[#5c62d6] font-bold mb-2">-- Supabase / PostgreSQL Row-Level Security Policy</p>
                <p>CREATE POLICY "Tenant isolation policy" ON members</p>
                <p className="pl-4">FOR ALL USING (</p>
                <p className="pl-8">gym_id = (SELECT gym_id FROM profiles WHERE id = auth.uid())</p>
                <p className="pl-4">);</p>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#5c62d6]" /> Payment Gateway & Webhook Signature
              </h3>
              <p className="text-[#8a8a8a]">
                Production subscription extensions connect to <strong>Razorpay</strong> following a cryptographic HMAC verification cycle:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-[#1a1a1a]">
                <li><strong>Order Creation:</strong> Server generates verified order payload via `/api/orders`.</li>
                <li><strong>Client Checkout:</strong> Native Razorpay modal processes UPI, Card or NetBanking.</li>
                <li><strong>Webhook Verification:</strong> Webhook captures event with HMAC SHA-256 signature.</li>
                <li><strong>Term Activation:</strong> Database updates validity date strictly on server confirmation.</li>
              </ol>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4">
              <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#5c62d6]" /> QR Turnstile Architecture
              </h3>
              <p className="text-[#8a8a8a]">
                Turnstile validation enforces single-day check-in uniqueness per member, authenticating association with the facility domain before logging timestamps.
              </p>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#5c62d6]" /> Production Readiness Ledger
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { title: 'Authentication RBAC', desc: 'Supabase Auth or OAuth with distinct Gym Owner & Super Admin claims.' },
                  { title: 'Database Partitioning', desc: 'Row-Level Security (RLS) active on all relational tables.' },
                  { title: 'Webhook Verification', desc: 'HMAC signature authentication on all incoming payment signals.' },
                  { title: 'Anti-Proxy Rate Limiting', desc: 'IP rate limiters preventing automated or duplicate check-in abuse.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-[#e6e4df] rounded">
                    <span className="font-mono text-[#15803d] font-bold">✓</span>
                    <div>
                      <strong className="text-[#1a1a1a]">{item.title}:</strong> <span className="text-[#8a8a8a]">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-[#e6e4df] bg-white">
          <span className="font-mono text-[0.7rem] text-[#8a8a8a]">GymPulse v1.0 • Refined Management</span>
          <button
            onClick={onClose}
            className="btn-editorial-primary cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
