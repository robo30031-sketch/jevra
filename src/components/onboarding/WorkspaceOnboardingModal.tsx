import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  WorkspaceCategory,
  WORKSPACE_CATEGORIES,
  InstitutionalDetails,
  CURRENCY_SYMBOLS,
} from '../../types/database';
import {
  User,
  Users,
  Building2,
  Briefcase,
  GraduationCap,
  Hospital,
  Shield,
  Flame,
  HeartHandshake,
  Trophy,
  Store,
  Landmark,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface WorkspaceOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WorkspaceOnboardingModal: React.FC<WorkspaceOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createWorkspace } = useWorkspace();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<WorkspaceCategory>('personal_finance');

  // Dynamic form state
  const [workspaceName, setWorkspaceName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Institutional form fields
  const [instName, setInstName] = useState('');
  const [instReg, setInstReg] = useState('');
  const [instLocation, setInstLocation] = useState('');
  const [instAdminName, setInstAdminName] = useState('');
  const [instContactPhone, setInstContactPhone] = useState('');
  const [instDepartment, setInstDepartment] = useState('');
  const [instPurpose, setInstPurpose] = useState('');
  const [instUnits, setInstUnits] = useState('');
  const [customCategoryLabel, setCustomCategoryLabel] = useState('');

  if (!isOpen) return null;

  const handleCategorySelect = (cat: WorkspaceCategory) => {
    setSelectedCategory(cat);
    const catInfo = WORKSPACE_CATEGORIES[cat];
    // Prefill default name placeholder
    if (cat === 'personal_finance') {
      setWorkspaceName(currentUser ? `${currentUser.full_name}'s Personal Vault` : 'My Personal Vault');
    } else {
      setWorkspaceName('');
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const catInfo = WORKSPACE_CATEGORIES[selectedCategory];

    const instDetails: InstitutionalDetails = {
      institution_name: instName || workspaceName,
      registration_number: instReg || undefined,
      location: instLocation || undefined,
      admin_name: instAdminName || currentUser?.full_name,
      contact_phone: instContactPhone || currentUser?.phone || undefined,
      department_name: instDepartment || undefined,
      purpose_summary: instPurpose || description || undefined,
      total_units_or_members: instUnits ? parseInt(instUnits, 10) : undefined,
      custom_category_label: customCategoryLabel || undefined,
    };

    const isInstitutional = [
      'school_education',
      'hospital_health',
      'police_station',
      'fire_station',
      'government_dept',
    ].includes(selectedCategory);

    const res = await createWorkspace({
      name: workspaceName.trim() || instName.trim() || catInfo.name,
      workspace_type: catInfo.defaultType,
      workspace_category: selectedCategory,
      currency,
      description: description.trim() || catInfo.description,
      institution_details: instDetails,
      verification_status: isInstitutional ? 'unverified' : 'verified',
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to initialize workspace');
    } else {
      onSuccess();
      onClose();
      // Reset state
      setStep(1);
    }
  };

  const getCategoryIcon = (catId: WorkspaceCategory) => {
    switch (catId) {
      case 'personal_finance':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'family_finance':
        return <Users className="w-5 h-5 text-teal-600" />;
      case 'society_apartment':
        return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'office_company':
        return <Briefcase className="w-5 h-5 text-sky-600" />;
      case 'school_education':
        return <GraduationCap className="w-5 h-5 text-emerald-600" />;
      case 'hospital_health':
        return <Hospital className="w-5 h-5 text-rose-600" />;
      case 'police_station':
        return <Shield className="w-5 h-5 text-amber-600" />;
      case 'fire_station':
        return <Flame className="w-5 h-5 text-orange-600" />;
      case 'ngo_foundation':
        return <HeartHandshake className="w-5 h-5 text-purple-600" />;
      case 'club_association':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'small_business':
        return <Store className="w-5 h-5 text-cyan-600" />;
      case 'government_dept':
        return <Landmark className="w-5 h-5 text-slate-700" />;
      default:
        return <Layers className="w-5 h-5 text-blue-500" />;
    }
  };

  const personalCategories = Object.values(WORKSPACE_CATEGORIES).filter(
    (c) => c.group === 'personal_community'
  );
  const professionalCategories = Object.values(WORKSPACE_CATEGORIES).filter(
    (c) => c.group === 'professional_institutional'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 block">
              Step {step} of 2 • Environment Provisioning
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {step === 1
                ? 'What type of financial workspace are you creating?'
                : `Configure Your ${WORKSPACE_CATEGORIES[selectedCategory].name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-left">
                <p className="text-xs text-slate-600 font-medium">
                  Choose the environment that best describes how you manage money and financial responsibilities.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Your account supports multiple workspaces. You can create or join others anytime.
                </p>
              </div>

              {/* Group A: Personal & Community */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    A. Personal and Community
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {personalCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="group p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition">
                          {getCategoryIcon(cat.id)}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize">
                          {cat.defaultType}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group B: Professional and Institutional */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    B. Professional and Institutional
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {professionalCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="group p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition text-left flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-blue-50 transition">
                          {getCategoryIcon(cat.id)}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 capitalize">
                          {cat.defaultType}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {cat.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Dynamic Form customized per category */
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Institutional notice if public sector/hospital/police */}
              {['police_station', 'hospital_health', 'fire_station', 'government_dept'].includes(
                selectedCategory
              ) && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Institutional Governance Notice:</span>
                    <span>
                      Workspace creation does not grant statutory or public authority. Institutional records require official verification by authorized administrators.
                    </span>
                  </div>
                </div>
              )}

              {/* Category banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-xs">
                  {getCategoryIcon(selectedCategory)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {WORKSPACE_CATEGORIES[selectedCategory].name}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {WORKSPACE_CATEGORIES[selectedCategory].tagline} • Tailored ledger categories &amp; terminology
                  </p>
                </div>
              </div>

              {/* General Workspace Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Workspace Title / Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={
                    selectedCategory === 'school_education'
                      ? 'e.g. St. Jude Higher Secondary School'
                      : selectedCategory === 'hospital_health'
                      ? 'e.g. City Care Multispeciality Hospital'
                      : selectedCategory === 'police_station'
                      ? 'e.g. Central Sector Police Station'
                      : selectedCategory === 'fire_station'
                      ? 'e.g. Station 4 Fire & Rescue'
                      : selectedCategory === 'office_company'
                      ? 'e.g. Apex Cloud Solutions Pvt Ltd'
                      : selectedCategory === 'society_apartment'
                      ? 'e.g. Palm Grove Apartments RWA'
                      : 'e.g. Priya Personal Vault'
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* DYNAMIC FORM PER CATEGORY */}
              {selectedCategory === 'school_education' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Affiliation / Reg Code</label>
                    <input
                      type="text"
                      value={instReg}
                      onChange={(e) => setInstReg(e.target.value)}
                      placeholder="e.g. CBSE-AFF-2023"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Campus City / Location</label>
                    <input
                      type="text"
                      value={instLocation}
                      onChange={(e) => setInstLocation(e.target.value)}
                      placeholder="e.g. Indiranagar, Bengaluru"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Principal / Administrator</label>
                    <input
                      type="text"
                      value={instAdminName}
                      onChange={(e) => setInstAdminName(e.target.value)}
                      placeholder="e.g. Dr. Arthur Vance"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Enrolled Students</label>
                    <input
                      type="number"
                      value={instUnits}
                      onChange={(e) => setInstUnits(e.target.value)}
                      placeholder="e.g. 1200"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'hospital_health' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hospital License No.</label>
                    <input
                      type="text"
                      value={instReg}
                      onChange={(e) => setInstReg(e.target.value)}
                      placeholder="e.g. MED-LIC-9021"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={instLocation}
                      onChange={(e) => setInstLocation(e.target.value)}
                      placeholder="e.g. Mumbai, MH"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Medical Superintendent</label>
                    <input
                      type="text"
                      value={instAdminName}
                      onChange={(e) => setInstAdminName(e.target.value)}
                      placeholder="e.g. Dr. M. Iyer"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Department</label>
                    <input
                      type="text"
                      value={instDepartment}
                      onChange={(e) => setInstDepartment(e.target.value)}
                      placeholder="e.g. Central Emergency &amp; ICU"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'police_station' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Station House Officer (SHO)</label>
                    <input
                      type="text"
                      value={instAdminName}
                      onChange={(e) => setInstAdminName(e.target.value)}
                      placeholder="e.g. Inspector S. Rathore"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jurisdiction / Zone</label>
                    <input
                      type="text"
                      value={instLocation}
                      onChange={(e) => setInstLocation(e.target.value)}
                      placeholder="e.g. Zone 4 &amp; Ring Road"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'fire_station' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chief Fire Officer / Station Head</label>
                    <input
                      type="text"
                      value={instAdminName}
                      onChange={(e) => setInstAdminName(e.target.value)}
                      placeholder="e.g. Station Officer K. Verma"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Station Headquarters</label>
                    <input
                      type="text"
                      value={instLocation}
                      onChange={(e) => setInstLocation(e.target.value)}
                      placeholder="e.g. South Sector Station"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'society_apartment' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">RWA Registration Number</label>
                    <input
                      type="text"
                      value={instReg}
                      onChange={(e) => setInstReg(e.target.value)}
                      placeholder="e.g. SOC-BLR-2020-112"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Units / Flats</label>
                    <input
                      type="number"
                      value={instUnits}
                      onChange={(e) => setInstUnits(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'office_company' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">CIN / Tax Registration</label>
                    <input
                      type="text"
                      value={instReg}
                      onChange={(e) => setInstReg(e.target.value)}
                      placeholder="e.g. U72200KA2021PTC145"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Registered Office City</label>
                    <input
                      type="text"
                      value={instLocation}
                      onChange={(e) => setInstLocation(e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {selectedCategory === 'other' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Custom Financial Group Classification
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategoryLabel}
                    onChange={(e) => setCustomCategoryLabel(e.target.value)}
                    placeholder="e.g. Cooperative Agricultural Credit Society"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              )}

              {/* Base Currency & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                    <option value="AED">AED — UAE Dirham</option>
                    <option value="SGD">SGD (S$) — Singapore Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fiduciary Purpose</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of financial responsibilities"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Choose Another Category</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? 'Establishing Workspace...' : 'Initialize Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
