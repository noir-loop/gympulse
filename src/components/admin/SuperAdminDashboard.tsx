import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { SaaSPlan, GymSubscription } from '../../types';
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Plus,
  Activity,
  X,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  Calendar,
  Sparkles,
  DownloadCloud,
} from 'lucide-react';
import { SystemUpdateModal } from '../common/SystemUpdateModal';

export const SuperAdminDashboard: React.FC = () => {
  const {
    gyms,
    subscriptions,
    saasPlans,
    members,
    activityLogs,
    addGym,
    updateGymSubscriptionStatus,
    updateGymSubscription,
    addSaaSPlan,
    updateSaaSPlan,
    deleteSaaSPlan,
    login,
    showToast,
    appVersion,
    isUpdateAvailable,
    updateInfo,
    activeTab: contextActiveTab,
    setActiveTab,
  } = useGym();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const activeTab: 'plans' | 'subscriptions' | 'gyms' | 'logs' =
    contextActiveTab === 'gyms' || contextActiveTab === 'super_gyms'
      ? 'gyms'
      : contextActiveTab === 'subscriptions' || contextActiveTab === 'super_subscriptions'
      ? 'subscriptions'
      : contextActiveTab === 'logs' || contextActiveTab === 'super_logs'
      ? 'logs'
      : 'plans';
  
  // Modals state
  const [isAddGymOpen, setIsAddGymOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<GymSubscription | null>(null);
  
  // Quick price edit state
  const [quickPriceModal, setQuickPriceModal] = useState<{ plan: SaaSPlan; newPrice: number } | null>(null);

  // New Gym state
  const [newGymData, setNewGymData] = useState({
    name: '',
    ownerName: '',
    phone: '+91 ',
    email: '',
    logoText: 'GY',
    primaryColor: '#ffffff',
    accentColor: '#5c62d6',
    themeName: 'dark-orange' as const,
    address: '',
    planName: saasPlans[0]?.name || 'Growth Enterprise Plan',
    price: saasPlans[0]?.price || 4999,
  });

  // Plan Form state (for adding or editing a plan)
  const [planFormData, setPlanFormData] = useState({
    name: '',
    period: 'Monthly' as 'Monthly' | 'Quarterly' | 'Annual',
    price: 4999,
    description: '',
    featuresText: 'Unlimited Members, Automated QR Scanner, Revenue Analytics',
    popular: false,
    active: true,
  });

  // Subscription Edit state
  const [subEditData, setSubEditData] = useState({
    planName: '',
    price: 0,
    endDate: '',
    status: 'active' as 'active' | 'expired' | 'suspended',
  });

  const totalMembers = members.length;
  const activeGymsCount = subscriptions.filter(s => s.status === 'active').length;
  const totalDemoRevenue = subscriptions.filter(s => s.status === 'active').reduce((acc, curr) => acc + curr.price, 0);

  // Handlers
  const handleOpenAddPlan = () => {
    setEditingPlan(null);
    setPlanFormData({
      name: '',
      period: 'Monthly',
      price: 4999,
      description: '',
      featuresText: 'Full Facility Access, Dual Kiosk Portal, Attendance Ledger, Automated Alerts',
      popular: false,
      active: true,
    });
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: SaaSPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      period: plan.period,
      price: plan.price,
      description: plan.description,
      featuresText: plan.features.join(', '),
      popular: !!plan.popular,
      active: plan.active,
    });
    setIsPlanModalOpen(true);
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormData.name.trim()) return;

    const featuresArray = planFormData.featuresText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingPlan) {
      updateSaaSPlan(editingPlan.id, {
        name: planFormData.name.trim(),
        period: planFormData.period,
        price: Number(planFormData.price),
        description: planFormData.description.trim(),
        features: featuresArray,
        popular: planFormData.popular,
        active: planFormData.active,
      });
    } else {
      addSaaSPlan({
        name: planFormData.name.trim(),
        period: planFormData.period,
        price: Number(planFormData.price),
        description: planFormData.description.trim(),
        features: featuresArray,
        popular: planFormData.popular,
        active: planFormData.active,
      });
    }

    setIsPlanModalOpen(false);
  };

  const handleQuickPriceSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceModal) return;
    updateSaaSPlan(quickPriceModal.plan.id, {
      price: Number(quickPriceModal.newPrice),
    });
    setQuickPriceModal(null);
  };

  const handleOpenEditSubscription = (sub: GymSubscription) => {
    setEditingSubscription(sub);
    setSubEditData({
      planName: sub.planName,
      price: sub.price,
      endDate: sub.endDate,
      status: sub.status,
    });
  };

  const handleSaveSubscriptionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscription) return;

    updateGymSubscription(editingSubscription.gymId, {
      planName: subEditData.planName,
      price: Number(subEditData.price),
      endDate: subEditData.endDate,
      status: subEditData.status,
    });
    setEditingSubscription(null);
  };

  const handleAddGymSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGym(
      {
        name: newGymData.name,
        ownerName: newGymData.ownerName,
        phone: newGymData.phone,
        email: newGymData.email,
        logoText: newGymData.logoText.toUpperCase(),
        primaryColor: newGymData.primaryColor,
        accentColor: newGymData.accentColor,
        themeName: newGymData.themeName,
        address: newGymData.address,
      },
      newGymData.planName,
      Number(newGymData.price)
    );
    setIsAddGymOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e4df]">
        <div>
          <span className="nav-label-caps block mb-2">Central Governance & Sovereign Authority</span>
          <h1 className="content-title">Platform Overview</h1>
          <p className="text-[1rem] text-[#8a8a8a] mt-1">
            Global multi-tenant jurisdiction, SaaS pricing power, custom subscription plans, and recurring platform ARR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsUpdateModalOpen(true)}
            className={`btn-editorial-outline cursor-pointer flex items-center gap-2 text-xs py-2.5 px-3.5 ${
              isUpdateAvailable ? 'border-[#5c62d6] text-[#5c62d6] bg-[#5c62d6]/5 font-semibold' : ''
            }`}
            title="System Version & Updates"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#5c62d6] ${isUpdateAvailable ? 'animate-spin' : ''}`} />
            <span>{isUpdateAvailable ? `Update Available (${updateInfo.version})` : `System ${appVersion}`}</span>
          </button>
          <button
            onClick={handleOpenAddPlan}
            className="btn-editorial-outline cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> + Add New SaaS Plan
          </button>
          <button
            onClick={() => setIsAddGymOpen(true)}
            className="btn-editorial-primary cursor-pointer flex items-center gap-2"
          >
            <Building2 className="w-3.5 h-3.5" /> Onboard Facility
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-editorial p-6">
          <span className="nav-label-caps block mb-3">Facility Tenants</span>
          <div className="font-serif text-4xl font-medium text-[#1a1a1a]">{gyms.length}</div>
          <div className="font-mono text-[0.68rem] text-[#8a8a8a] mt-2">Active Multi-Tenant Entities</div>
        </div>

        <div className="card-editorial p-6">
          <span className="nav-label-caps block mb-3">SaaS Tier Catalog</span>
          <div className="font-serif text-4xl font-medium text-[#5c62d6]">{saasPlans.length} Plans</div>
          <div className="font-mono text-[0.68rem] text-[#8a8a8a] mt-2">
            {saasPlans.filter(p => p.active).length} Active Tiers Available
          </div>
        </div>

        <div className="card-editorial p-6">
          <span className="nav-label-caps block mb-3">Valid Licenses</span>
          <div className="font-serif text-4xl font-medium text-[#1a1a1a]">{activeGymsCount}</div>
          <div className="font-mono text-[0.68rem] text-[#8a8a8a] mt-2">Under Paid Concurrence</div>
        </div>

        <div className="card-editorial p-6">
          <span className="nav-label-caps block mb-3">Platform ARR Yield</span>
          <div className="font-serif text-4xl font-medium text-[#1a1a1a]">₹{totalDemoRevenue.toLocaleString('en-IN')}</div>
          <div className="font-mono text-[0.68rem] text-[#8a8a8a] mt-2">Contracted Annual/Monthly Run-Rate</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e6e4df] pb-3 overflow-x-auto">
        {[
          { id: 'plans', label: 'SaaS Pricing & Plans' },
          { id: 'subscriptions', label: 'License Terms & Pricing' },
          { id: 'gyms', label: 'Tenant Directory' },
          { id: 'logs', label: 'Audit Trail' },
        ].map(tab => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-[0.75rem] uppercase font-bold tracking-wider rounded transition-all cursor-pointer whitespace-nowrap touch-manipulation active:scale-95 ${
              activeTab === tab.id
                ? 'bg-[#5c62d6] text-white shadow-xs'
                : 'text-[#8a8a8a] hover:text-[#1a1a1a] hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. PLANS & PRICING GOVERNANCE TAB */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white border border-[#e6e4df] rounded">
            <div>
              <span className="nav-label-caps block text-[#5c62d6] mb-1">Administrative Jurisdiction</span>
              <h3 className="font-serif text-2xl font-medium text-[#1a1a1a]">
                Global Rate Cards & Plan Architecture
              </h3>
              <p className="text-xs text-[#8a8a8a] mt-1 max-w-2xl leading-relaxed">
                As Super Admin, you have sovereign power to update monthly and annual prices across all subscription tiers,
                commission new plans, or modify tier features. All updates dynamically propagate to tenant onboarding and gym owner renewal portals.
              </p>
            </div>
            <button
              onClick={handleOpenAddPlan}
              className="btn-editorial-primary cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> + New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {saasPlans.map(plan => (
              <div
                key={plan.id}
                className={`card-editorial p-7 flex flex-col justify-between relative transition-all ${
                  plan.popular ? 'border-[#5c62d6] ring-1 ring-[#5c62d6]/20' : ''
                } ${!plan.active ? 'opacity-60 bg-gray-50' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-6 px-3 py-0.5 bg-[#5c62d6] text-white text-[0.65rem] uppercase font-bold tracking-widest rounded-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Flagship Tier
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="nav-label-caps text-[#8a8a8a]">{plan.period} Cadence</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider ${
                        plan.active ? 'bg-[#e7f7f0] text-[#15803d]' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {plan.active ? 'Active' : 'Draft / Inactive'}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-medium text-[#1a1a1a] mb-2">{plan.name}</h3>
                  <p className="text-xs text-[#8a8a8a] mb-5 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price Block with Quick Price Change */}
                  <div className="p-4 bg-[#f8f7f4] border border-[#e6e4df] rounded mb-5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-3xl font-semibold text-[#1a1a1a]">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className="font-mono text-xs text-[#8a8a8a]">/ {plan.period}</span>
                    </div>

                    <button
                      onClick={() => setQuickPriceModal({ plan, newPrice: plan.price })}
                      className="mt-3 w-full text-center text-xs text-[#5c62d6] hover:text-[#4a50c7] font-semibold flex items-center justify-center gap-1.5 pt-2 border-t border-[#e6e4df] cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Change {plan.period} Price
                    </button>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    <span className="text-[0.68rem] uppercase tracking-wider text-[#8a8a8a] font-semibold block">
                      Enclosed Privileges:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#1a1a1a]">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#5c62d6] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center gap-2 pt-4 border-t border-[#e6e4df]">
                  <button
                    onClick={() => handleOpenEditPlan(plan)}
                    className="btn-editorial-outline flex-1 !text-xs !py-2 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Plan
                  </button>
                  <button
                    onClick={() => deleteSaaSPlan(plan.id)}
                    className="p-2 border border-[#e6e4df] rounded hover:border-[#b91c1c] text-[#8a8a8a] hover:text-[#b91c1c] transition-colors cursor-pointer"
                    title="Delete Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SUBSCRIPTIONS & CONTRACTS TAB */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="p-4 bg-white border border-[#e6e4df] rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-semibold text-sm text-[#1a1a1a]">Facility Contract Terms & Custom Remittance</span>
              <p className="text-xs text-[#8a8a8a]">
                Customize individual gym contract sums, extend license duration, or adjust assigned subscription tier per tenant.
              </p>
            </div>
            <span className="font-mono text-xs text-[#5c62d6] font-semibold bg-[#5c62d6]/10 px-3 py-1.5 rounded">
              Total Contract Sum: ₹{totalDemoRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table-editorial">
              <thead>
                <tr>
                  <th>Tenant Facility</th>
                  <th>Contracted Tier</th>
                  <th>Contract Sum (Remittance)</th>
                  <th>Term Conclusion</th>
                  <th>State</th>
                  <th style={{ textAlign: 'right' }}>Administrative Authority</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map(sub => {
                  const gym = gyms.find(g => g.id === sub.gymId);
                  return (
                    <tr key={sub.id} className="row-editorial">
                      <td>
                        <div className="font-semibold text-sm text-[#1a1a1a]">{gym?.name || sub.gymId}</div>
                        <div className="font-mono text-[0.65rem] text-[#8a8a8a]">Officer: {gym?.ownerName}</div>
                      </td>
                      <td className="text-xs font-semibold text-[#1a1a1a]">{sub.planName}</td>
                      <td>
                        <span className="font-mono text-xs font-bold text-[#5c62d6]">
                          ₹{sub.price.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-[#8a8a8a]">{sub.endDate}</td>
                      <td>
                        <span className={`status-tag ${sub.status === 'active' ? 'tag-active' : 'tag-expired'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditSubscription(sub)}
                            className="btn-editorial-primary !py-1 !px-3 !text-[0.68rem] cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Adjust Price & Terms
                          </button>
                          <button
                            onClick={() => updateGymSubscriptionStatus(sub.gymId, sub.status === 'active' ? 'expired' : 'active')}
                            className={`status-tag cursor-pointer ${
                              sub.status === 'active'
                                ? 'tag-active hover:bg-[#b91c1c] hover:text-white'
                                : 'tag-expired hover:bg-[#15803d] hover:text-white'
                            }`}
                          >
                            {sub.status === 'active' ? 'Revoke' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. GYMS TABLE */}
      {activeTab === 'gyms' && (
        <div className="overflow-x-auto">
          <table className="table-editorial">
            <thead>
              <tr>
                <th>Tenant Facility</th>
                <th>Presiding Officer</th>
                <th>Repository Volume</th>
                <th>License Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gyms.map(gym => {
                const sub = subscriptions.find(s => s.gymId === gym.id);
                const count = members.filter(m => m.gymId === gym.id).length;
                return (
                  <tr key={gym.id} className="row-editorial">
                    <td>
                      <div className="font-semibold text-sm text-[#1a1a1a]">{gym.name}</div>
                      <div className="font-mono text-[0.65rem] text-[#8a8a8a]">ID: {gym.id}</div>
                    </td>
                    <td>
                      <div className="text-xs text-[#1a1a1a]">{gym.ownerName}</div>
                      <div className="font-mono text-[0.65rem] text-[#8a8a8a]">{gym.phone}</div>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-semibold text-[#1a1a1a]">{count} Members</span>
                    </td>
                    <td>
                      <span className={`status-tag ${sub?.status === 'active' ? 'tag-active' : 'tag-expired'}`}>
                        {sub?.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => login('gym_owner', gym.id, gym.ownerName)}
                        className="btn-editorial-outline !py-1 !px-3 !text-[0.65rem] cursor-pointer"
                      >
                        Assume Tenant Session <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. LOGS TABLE */}
      {activeTab === 'logs' && (
        <div className="overflow-x-auto">
          <table className="table-editorial">
            <thead>
              <tr>
                <th>Action Vector</th>
                <th>Transaction Log</th>
                <th>Signee</th>
                <th style={{ textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map(log => (
                <tr key={log.id} className="row-editorial">
                  <td>
                    <span className="status-tag tag-active font-mono text-[0.65rem]">
                      {log.action}
                    </span>
                  </td>
                  <td className="text-xs text-[#1a1a1a]">{log.description}</td>
                  <td className="text-xs text-[#8a8a8a]">{log.userName}</td>
                  <td className="font-mono text-[0.7rem] text-[#8a8a8a]" style={{ textAlign: 'right' }}>
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QUICK PRICE EDIT MODAL */}
      {quickPriceModal && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setQuickPriceModal(null)}>
          <div className="modal-editorial-body p-8 max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-5">
              <span className="nav-label-caps text-[#5c62d6]">Price Adjustment</span>
              <button onClick={() => setQuickPriceModal(null)} className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif text-2xl font-medium text-[#1a1a1a] mb-1">
              {quickPriceModal.plan.name}
            </h3>
            <p className="text-xs text-[#8a8a8a] mb-5 font-mono">
              Adjust recurring {quickPriceModal.plan.period} price in INR:
            </p>

            <form onSubmit={handleQuickPriceSave} className="space-y-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  New Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={quickPriceModal.newPrice}
                  onChange={e => setQuickPriceModal({ ...quickPriceModal, newPrice: Number(e.target.value) })}
                  className="w-full bg-white border border-[#e6e4df] p-3 text-lg font-mono text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e6e4df]">
                <button
                  type="button"
                  onClick={() => setQuickPriceModal(null)}
                  className="btn-editorial-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-primary cursor-pointer"
                >
                  Save New Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PLAN MODAL */}
      {isPlanModalOpen && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setIsPlanModalOpen(false)}>
          <div className="modal-editorial-body p-8 max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
              <span className="nav-label-caps text-[#5c62d6]">
                {editingPlan ? 'Configure Existing Tier' : 'Plan Architecture Studio'}
              </span>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] mb-2">
              {editingPlan ? 'Edit SaaS Plan' : 'Create New Subscription Plan'}
            </h3>
            <p className="text-xs text-[#8a8a8a] mb-6">
              Configure parameters, billing duration, pricing, and capabilities for multi-tenant gyms.
            </p>

            <form onSubmit={handlePlanSubmit} className="space-y-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elite Franchise Pass"
                  value={planFormData.name}
                  onChange={e => setPlanFormData({ ...planFormData, name: e.target.value })}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                    Billing Interval *
                  </label>
                  <select
                    value={planFormData.period}
                    onChange={e => setPlanFormData({ ...planFormData, period: e.target.value as any })}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={planFormData.price}
                    onChange={e => setPlanFormData({ ...planFormData, price: Number(e.target.value) })}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm font-mono text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Plan Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Target gym facility scale, capabilities, and benefits..."
                  value={planFormData.description}
                  onChange={e => setPlanFormData({ ...planFormData, description: e.target.value })}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-xs text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                />
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Features (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="Unlimited Members, Dual Kiosk, SMS Reminders"
                  value={planFormData.featuresText}
                  onChange={e => setPlanFormData({ ...planFormData, featuresText: e.target.value })}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-xs text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planFormData.popular}
                    onChange={e => setPlanFormData({ ...planFormData, popular: e.target.checked })}
                    className="accent-[#5c62d6]"
                  />
                  <span>Mark as Flagship / Popular</span>
                </label>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planFormData.active}
                    onChange={e => setPlanFormData({ ...planFormData, active: e.target.checked })}
                    className="accent-[#5c62d6]"
                  />
                  <span>Publish to Tenant Portal</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#e6e4df]">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="btn-editorial-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-primary cursor-pointer"
                >
                  {editingPlan ? 'Update Plan' : 'Commission Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST SUBSCRIPTION TERMS & PRICE MODAL */}
      {editingSubscription && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setEditingSubscription(null)}>
          <div className="modal-editorial-body p-8 max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-5">
              <span className="nav-label-caps text-[#5c62d6]">Facility License Adjustment</span>
              <button onClick={() => setEditingSubscription(null)} className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif text-2xl font-medium text-[#1a1a1a] mb-1">
              Adjust Facility Contract
            </h3>
            <p className="text-xs text-[#8a8a8a] mb-5">
              Tenant ID: <span className="font-mono text-[#1a1a1a]">{editingSubscription.gymId}</span>
            </p>

            <form onSubmit={handleSaveSubscriptionEdit} className="space-y-4">
              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Subscription Tier
                </label>
                <select
                  value={subEditData.planName}
                  onChange={e => {
                    const selected = saasPlans.find(p => p.name === e.target.value);
                    setSubEditData({
                      ...subEditData,
                      planName: e.target.value,
                      price: selected ? selected.price : subEditData.price,
                    });
                  }}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                >
                  {saasPlans.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name} (₹{p.price.toLocaleString('en-IN')}/{p.period})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Contract Sum / Price in INR (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={subEditData.price}
                  onChange={e => setSubEditData({ ...subEditData, price: Number(e.target.value) })}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm font-mono text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  Term Conclusion Date
                </label>
                <input
                  type="date"
                  value={subEditData.endDate}
                  onChange={e => setSubEditData({ ...subEditData, endDate: e.target.value })}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm font-mono text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-1.5">
                  License Status
                </label>
                <select
                  value={subEditData.status}
                  onChange={e => setSubEditData({ ...subEditData, status: e.target.value as any })}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] rounded focus:outline-none focus:border-[#5c62d6]"
                >
                  <option value="active">Active (Paid)</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e6e4df]">
                <button
                  type="button"
                  onClick={() => setEditingSubscription(null)}
                  className="btn-editorial-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-primary cursor-pointer"
                >
                  Confirm Contract Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARDING FACILITY MODAL */}
      {isAddGymOpen && (
        <div className="modal-editorial-wrap animate-fade-in" onClick={() => setIsAddGymOpen(false)}>
          <div className="modal-editorial-body p-8 max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e4df] mb-6">
              <span className="nav-label-caps">Institution Provisioning</span>
              <button onClick={() => setIsAddGymOpen(false)} className="text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="font-serif text-3xl font-medium text-[#1a1a1a] mb-6">Onboard Facility</h3>

            <form onSubmit={handleAddGymSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Facility Name
                  </label>
                  <input
                    type="text"
                    value={newGymData.name}
                    onChange={e => setNewGymData({ ...newGymData, name: e.target.value })}
                    placeholder="e.g. Apex Athletics"
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Principal Officer
                  </label>
                  <input
                    type="text"
                    value={newGymData.ownerName}
                    onChange={e => setNewGymData({ ...newGymData, ownerName: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Telephony Line
                  </label>
                  <input
                    type="text"
                    value={newGymData.phone}
                    onChange={e => setNewGymData({ ...newGymData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Registry Email
                  </label>
                  <input
                    type="email"
                    value={newGymData.email}
                    onChange={e => setNewGymData({ ...newGymData, email: e.target.value })}
                    placeholder="officer@apex.in"
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                  Physical Premises Address
                </label>
                <textarea
                  value={newGymData.address}
                  onChange={e => setNewGymData({ ...newGymData, address: e.target.value })}
                  placeholder="Street, City, Postal Code"
                  rows={2}
                  className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Monogram Glyphs
                  </label>
                  <input
                    type="text"
                    value={newGymData.logoText}
                    onChange={e => setNewGymData({ ...newGymData, logoText: e.target.value })}
                    maxLength={3}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm font-mono text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[0.7rem] uppercase tracking-wider text-[#8a8a8a] font-semibold mb-2">
                    Contracted SaaS Plan
                  </label>
                  <select
                    value={newGymData.planName}
                    onChange={e => {
                      const selectedPlan = saasPlans.find(p => p.name === e.target.value);
                      setNewGymData({
                        ...newGymData,
                        planName: e.target.value,
                        price: selectedPlan ? selectedPlan.price : newGymData.price,
                      });
                    }}
                    className="w-full bg-white border border-[#e6e4df] p-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#5c62d6] rounded"
                  >
                    {saasPlans.filter(p => p.active).map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name} (₹{p.price.toLocaleString('en-IN')}/{p.period})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#e6e4df]">
                <button
                  type="button"
                  onClick={() => setIsAddGymOpen(false)}
                  className="btn-editorial-outline cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-editorial-primary cursor-pointer"
                >
                  Confirm Tenancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* System Update Modal */}
      <SystemUpdateModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />

    </div>
  );
};
