'use client';

import { storage } from '@/lib/storage';
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingDown, Calculator, CheckCircle, ArrowRight, Home, Calendar, CreditCard, Users, Plus, Edit2, Trash2, Phone, Mail, Lock } from 'lucide-react';

export default function OakstoneQuotePlatform() {
  const [viewMode, setViewMode] = useState('savings');
  const [loTeam, setLoTeam] = useState([]);
  const [selectedLO, setSelectedLO] = useState('');
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [teamPassword, setTeamPassword] = useState('');
  const [isTeamUnlocked, setIsTeamUnlocked] = useState(false);
  const [editingLO, setEditingLO] = useState(null);
  const [showUFMIPCalc, setShowUFMIPCalc] = useState(false);
  
  const [newLO, setNewLO] = useState({ name: '', nmls: '', phone: '', email: '' });
  
  const [quoteData, setQuoteData] = useState({
    borrowerName: '',
    propertyAddress: '123 Main St, City, ST',
    loanType: 'va_irrrl',
    
    // Current Loan
    currentLoanAmount: '350000',
    currentRate: '6.5',
    currentTerm: '30',
    currentTaxes: '300',
    currentInsurance: '150',
    currentMI: '',
    
    // New Loan
    newLoanAmount: '350000',
    newRate: '5.25',
    newTerm: '30',
    newTaxes: '300',
    newInsurance: '150',
    newMI: '',
    
    escrowRefund: '2400',
    skipMonths: '2',
    fees: '',
    
    // UFMIP Calculator
    ufmipOriginalLoanDate: '',
    ufmipOriginalLoanAmount: '',
  });
  
  const [showPrincipal, setShowPrincipal] = useState(true);
  const [showEscrow, setShowEscrow] = useState(true);
  const [showFees, setShowFees] = useState(false);
  const [adminMode, setAdminMode] = useState(true);
  const [isClientView, setIsClientView] = useState(false);
  
  const TEAM_PASSWORD = 'oakstone2026';

  useEffect(() => { 
    loadLOTeam(); 
    loadFromUrlParams();
  }, []);
  
  // Auto-populate taxes/insurance from current to new
  useEffect(() => {
    if (quoteData.currentTaxes && !quoteData.newTaxes) {
      setQuoteData(prev => ({ ...prev, newTaxes: prev.currentTaxes }));
    }
    if (quoteData.currentInsurance && !quoteData.newInsurance) {
      setQuoteData(prev => ({ ...prev, newInsurance: prev.currentInsurance }));
    }
  }, [quoteData.currentTaxes, quoteData.currentInsurance]);
  
  const loadLOTeam = async () => {
    try {
      const result = await storage.get('oakstone-lo-team');
      if (result && result.value) {
        const team = JSON.parse(result.value);
        setLoTeam(team);
        if (team.length > 0) {
          setSelectedLO(team[0].id);
        }
      } else {
        const defaultTeam = [
          { 
            id: '1', 
            name: 'Steven Arroyo', 
            nmls: '123456', 
            phone: '555-123-4567', 
            email: 'steven@oakstone.com' 
          },
          { 
            id: '2', 
            name: 'Blake Belshe', 
            nmls: '789012', 
            phone: '555-987-6543', 
            email: 'blake@oakstone.com' 
          },
        ];
        
        await saveLOTeam(defaultTeam);
        setLoTeam(defaultTeam);
        setSelectedLO('1');
      }
    } catch (error) {
      console.error('Error loading team:', error);
      const defaultTeam = [
        { id: '1', name: 'Steven Arroyo', nmls: '123456', phone: '555-123-4567', email: 'steven@oakstone.com' },
        { id: '2', name: 'Blake Belshe', nmls: '789012', phone: '555-987-6543', email: 'blake@oakstone.com' },
      ];
      setLoTeam(defaultTeam);
      setSelectedLO('1');
    }
  };
  
  const saveLOTeam = async (team) => {
    try { 
      await storage.set('oakstone-lo-team', JSON.stringify(team)); 
    } 
    catch (error) { 
      console.error('Error saving team:', error); 
    }
  };
  
  const handleTeamPasswordSubmit = () => {
    if (teamPassword === TEAM_PASSWORD) {
      setIsTeamUnlocked(true);
      setTeamPassword('');
    } else {
      alert('Incorrect password');
      setTeamPassword('');
    }
  };
  
  const addNewLO = async () => {
    if (!newLO.name.trim()) { alert('Please enter a name'); return; }
    const updatedTeam = [...loTeam, { id: Date.now().toString(), ...newLO }];
    await saveLOTeam(updatedTeam);
    setLoTeam(updatedTeam);
    setNewLO({ name: '', nmls: '', phone: '', email: '' });
  };
  
  const updateLO = async (id, data) => {
    const updatedTeam = loTeam.map(lo => lo.id === id ? { ...lo, ...data } : lo);
    await saveLOTeam(updatedTeam);
    setLoTeam(updatedTeam);
    setEditingLO(null);
  };
  
  const deleteLO = async (id) => {
    if (!confirm('Remove this loan officer?')) return;
    const updatedTeam = loTeam.filter(lo => lo.id !== id);
    await saveLOTeam(updatedTeam);
    setLoTeam(updatedTeam);
    if (selectedLO === id) setSelectedLO('');
  };
  
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const getSelectedLOData = () => loTeam.find(lo => lo.id === selectedLO);
  
  // Mortgage Payment Calculator
  const calculatePI = (loanAmount, annualRate, termYears) => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(annualRate) || 0;
    const term = parseInt(termYears) || 30;
    
    if (principal === 0 || rate === 0) return 0;
    
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    return payment;
  };
  
  // Calculate Month 1 principal portion
  const calculateMonth1Principal = (loanAmount, annualRate, termYears) => {
    const principal = parseFloat(loanAmount) || 0;
    const rate = parseFloat(annualRate) || 0;
    
    if (principal === 0 || rate === 0) return 0;
    
    const monthlyRate = rate / 100 / 12;
    const payment = calculatePI(loanAmount, annualRate, termYears);
    const interest = principal * monthlyRate;
    const principalPortion = payment - interest;
    
    return principalPortion;
  };
  
  // UFMIP Refund Calculator
  const calculateUFMIPRefund = () => {
    const origLoanAmount = parseFloat(quoteData.ufmipOriginalLoanAmount) || 0;
    const origDate = quoteData.ufmipOriginalLoanDate;
    
    if (origLoanAmount === 0 || !origDate) return null;
    
    const originalUFMIP = origLoanAmount * 0.0175;
    
    const loanDate = new Date(origDate);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - loanDate.getFullYear()) * 12 + (today.getMonth() - loanDate.getMonth());
    
    let refundPercent = 0;
    if (monthsDiff >= 7 && monthsDiff <= 12) refundPercent = 0.70;
    else if (monthsDiff >= 13 && monthsDiff <= 24) refundPercent = 0.50;
    else if (monthsDiff >= 25 && monthsDiff <= 36) refundPercent = 0.25;
    
    const refundAmount = originalUFMIP * refundPercent;
    
    return {
      originalUFMIP,
      monthsSinceOrigination: monthsDiff,
      refundPercent: refundPercent * 100,
      refundAmount
    };
  };
  
  // Calculate current loan values
  const currentPI = calculatePI(quoteData.currentLoanAmount, quoteData.currentRate, quoteData.currentTerm);
  const currentTaxes = parseFloat(quoteData.currentTaxes) || 0;
  const currentInsurance = parseFloat(quoteData.currentInsurance) || 0;
  const currentMI = parseFloat(quoteData.currentMI) || 0;
  const currentPITI = currentPI + currentTaxes + currentInsurance + currentMI;
  const currentMonth1Principal = calculateMonth1Principal(quoteData.currentLoanAmount, quoteData.currentRate, quoteData.currentTerm);
  
  // Calculate new loan values
  const newPI = calculatePI(quoteData.newLoanAmount, quoteData.newRate, quoteData.newTerm);
  const newTaxes = parseFloat(quoteData.newTaxes) || 0;
  const newInsurance = parseFloat(quoteData.newInsurance) || 0;
  const newMI = parseFloat(quoteData.newMI) || 0;
  const newPITI = newPI + newTaxes + newInsurance + newMI;
  const newMonth1Principal = calculateMonth1Principal(quoteData.newLoanAmount, quoteData.newRate, quoteData.newTerm);
  
  const monthlySavings = currentPITI - newPITI;
  const skipValue = currentPITI * parseInt(quoteData.skipMonths || '0');
  const escrowRefund = parseFloat(quoteData.escrowRefund) || 0;
  const fees = parseFloat(quoteData.fees) || 0;
  const principalIncrease = newMonth1Principal - currentMonth1Principal;
  
  const ufmipRefund = calculateUFMIPRefund();
  
  const handleInputChange = (field, value) => setQuoteData(prev => ({ ...prev, [field]: value }));
  const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num);
  const formatRate = (rate) => parseFloat(rate).toFixed(3) + '%';
  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 ? `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}` : phone;
  };

  // Magic Link Functions
const generateQuoteLink = () => {
  const params = new URLSearchParams();
  
  // Add all quote data
  if (quoteData.borrowerName) params.set('name', quoteData.borrowerName);
  if (quoteData.propertyAddress && quoteData.propertyAddress !== '123 Main St, City, ST') 
    params.set('addr', quoteData.propertyAddress);
  if (quoteData.currentLoanAmount) params.set('ca', quoteData.currentLoanAmount);
  if (quoteData.currentRate) params.set('cr', quoteData.currentRate);
  if (quoteData.currentTerm && quoteData.currentTerm !== '30') 
    params.set('ct', quoteData.currentTerm);
  if (quoteData.newLoanAmount) params.set('na', quoteData.newLoanAmount);
  if (quoteData.newRate) params.set('nr', quoteData.newRate);
  if (quoteData.newTerm && quoteData.newTerm !== '30') 
    params.set('nt', quoteData.newTerm);
  if (quoteData.currentTaxes) params.set('tx', quoteData.currentTaxes);
  if (quoteData.currentInsurance) params.set('ins', quoteData.currentInsurance);
  if (quoteData.escrowRefund) params.set('esc', quoteData.escrowRefund);
  if (quoteData.skipMonths && quoteData.skipMonths !== '0') 
    params.set('skip', quoteData.skipMonths);
  
  // Add savings and cache buster
  params.set('savings', Math.round(monthlySavings));
  params.set('cb', Date.now());
  
  // 👇 CRITICAL - Add client view parameter
  params.set('view', 'client');
  
  const url = `${window.location.origin}/api/preview?${params.toString()}`;
  
  navigator.clipboard.writeText(url).then(() => {
    alert('✅ Client link copied! They will see a clean, read-only view.');
  }).catch(() => {
    alert('❌ Failed to copy. Please copy this URL manually:\n' + url);
  });
};

const loadFromUrlParams = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    console.log('URL Params:', params.toString());
    
    // Check if this is a client view link
    const clientView = params.get('view') === 'client';
    console.log('Is Client View:', clientView);
    
    setIsClientView(clientView);
    
    const urlData = {
      borrowerName: params.get('name') || '',
      propertyAddress: params.get('addr') || quoteData.propertyAddress,
      currentLoanAmount: params.get('ca') || quoteData.currentLoanAmount,
      currentRate: params.get('cr') || quoteData.currentRate,
      currentTerm: params.get('ct') || quoteData.currentTerm,
      newLoanAmount: params.get('na') || quoteData.newLoanAmount,
      newRate: params.get('nr') || quoteData.newRate,
      newTerm: params.get('nt') || quoteData.newTerm,
      currentTaxes: params.get('tx') || quoteData.currentTaxes,
      currentInsurance: params.get('ins') || quoteData.currentInsurance,
      escrowRefund: params.get('esc') || quoteData.escrowRefund,
      skipMonths: params.get('skip') || quoteData.skipMonths,
      loanType: params.get('type') || quoteData.loanType,
    };
    
    setQuoteData(prev => ({ ...prev, ...urlData }));
  }
};
  
  const selectedLOData = getSelectedLOData();
  
  const showMI = quoteData.loanType === 'fha_streamline' || quoteData.loanType === 'conventional';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <img src="/logo.png" alt="Oakstone Capital Mortgage" className="h-12 md:h-16" />
          <div className="flex gap-3">
            <button onClick={() => setShowTeamManager(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-all flex items-center gap-2">
              <Users className="w-4 h-4" /> Manage Team
            </button>
            <button onClick={() => setAdminMode(!adminMode)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-all">
              {adminMode ? 'Hide Admin' : 'Show Admin'}
            </button>
          </div>
        </div>
      </div>

      {/* Team Management Modal */}
      {showTeamManager && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-400" /> Manage Loan Officers
              </h2>
              <button onClick={() => { setShowTeamManager(false); setIsTeamUnlocked(false); setEditingLO(null); }} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="p-6">
              {!isTeamUnlocked ? (
                <div className="max-w-md mx-auto text-center py-12">
                  <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">Enter Password</h3>
                  <input type="password" value={teamPassword} onChange={(e) => setTeamPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleTeamPasswordSubmit()} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 mb-4" placeholder="Team management password" autoFocus />
                  <button onClick={handleTeamPasswordSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">Unlock Team Management</button>
                </div>
              ) : (
                <>
                  <div className="bg-gray-900/50 rounded-xl p-6 mb-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-green-400" /> Add New Loan Officer</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input type="text" value={newLO.name} onChange={(e) => setNewLO({ ...newLO, name: e.target.value })} className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="Full Name *" />
                      <input type="text" value={newLO.nmls} onChange={(e) => setNewLO({ ...newLO, nmls: e.target.value })} className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="NMLS #" />
                      <input type="tel" value={newLO.phone} onChange={(e) => setNewLO({ ...newLO, phone: e.target.value })} className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="Phone" />
                      <input type="email" value={newLO.email} onChange={(e) => setNewLO({ ...newLO, email: e.target.value })} className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="Email" />
                    </div>
                    <button onClick={addNewLO} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Add Loan Officer</button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Current Team ({loTeam.length})</h3>
                    <div className="space-y-3">
                      {loTeam.map((lo) => (
                        <div key={lo.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                          {editingLO === lo.id ? (
                            <div className="space-y-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                <input type="text" defaultValue={lo.name} id={`name-${lo.id}`} className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white" placeholder="Name" />
                                <input type="text" defaultValue={lo.nmls} id={`nmls-${lo.id}`} className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white" placeholder="NMLS #" />
                                <input type="tel" defaultValue={lo.phone} id={`phone-${lo.id}`} className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white" placeholder="Phone" />
                                <input type="email" defaultValue={lo.email} id={`email-${lo.id}`} className="bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white" placeholder="Email" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => updateLO(lo.id, {
                                  name: document.getElementById(`name-${lo.id}`).value,
                                  nmls: document.getElementById(`nmls-${lo.id}`).value,
                                  phone: document.getElementById(`phone-${lo.id}`).value,
                                  email: document.getElementById(`email-${lo.id}`).value,
                                })} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm">Save</button>
                                <button onClick={() => setEditingLO(null)} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center font-bold text-lg">{getInitials(lo.name)}</div>
                                <div>
                                  <div className="font-semibold">{lo.name}</div>
                                  <div className="text-sm text-gray-400">
                                    {lo.nmls && `NMLS #${lo.nmls}`}
                                    {lo.nmls && (lo.phone || lo.email) && ' • '}
                                    {lo.phone && formatPhone(lo.phone)}
                                    {lo.phone && lo.email && ' • '}
                                    {lo.email}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setEditingLO(lo.id)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => deleteLO(lo.id)} className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UFMIP Calculator Modal */}
      {showUFMIPCalc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full">
            <div className="bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calculator className="w-6 h-6 text-green-400" /> UFMIP Refund Calculator
              </h2>
              <button onClick={() => setShowUFMIPCalc(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Original FHA Loan Date</label>
                <input type="date" value={quoteData.ufmipOriginalLoanDate} onChange={(e) => handleInputChange('ufmipOriginalLoanDate', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Original FHA Loan Amount ($)</label>
                <input type="number" value={quoteData.ufmipOriginalLoanAmount} onChange={(e) => handleInputChange('ufmipOriginalLoanAmount', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500" placeholder="250000" />
              </div>

              {ufmipRefund && (
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/50 mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-green-400">Refund Calculation</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Original UFMIP Paid:</span>
                      <span className="font-semibold">{formatCurrency(ufmipRefund.originalUFMIP)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Months Since Origination:</span>
                      <span className="font-semibold">{ufmipRefund.monthsSinceOrigination} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Refund Percentage:</span>
                      <span className="font-semibold">{ufmipRefund.refundPercent}%</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-green-500/30">
                      <span className="text-green-300 font-semibold">UFMIP Refund:</span>
                      <span className="font-bold text-2xl text-green-400">{formatCurrency(ufmipRefund.refundAmount)}</span>
                    </div>
                  </div>
                  
                  {ufmipRefund.refundAmount > 0 && (
                    <button onClick={() => {
                      handleInputChange('escrowRefund', (parseFloat(quoteData.escrowRefund) || 0) + ufmipRefund.refundAmount);
                      setShowUFMIPCalc(false);
                    }} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
                      Add {formatCurrency(ufmipRefund.refundAmount)} to Escrow Refund
                    </button>
                  )}
                </div>
              )}

              <div className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-400 mt-4">
                <div className="font-semibold mb-2">HUD Refund Schedule:</div>
                <div>• 7-12 months: 70% refund</div>
                <div>• 13-24 months: 50% refund</div>
                <div>• 25-36 months: 25% refund</div>
                <div>• 37+ months: No refund</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
{/* Hide Quote Builder in client view */}
{!isClientView && adminMode && (
  <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 shadow-2xl">
    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Calculator className="w-6 h-6 text-blue-400" /> Quote Builder</h2>

    {/* LO Selector */}
    <div className="mb-6 bg-gray-900/50 rounded-xl p-4 border border-gray-700">
      <label className="block text-sm text-gray-400 mb-2">Select Loan Officer *</label>
      <select value={selectedLO} onChange={(e) => setSelectedLO(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500">
        <option value="">Choose your name...</option>
        {loTeam.map((lo) => <option key={lo.id} value={lo.id}>{lo.name} {lo.nmls && `(NMLS #${lo.nmls})`}</option>)}
      </select>
    </div>

    {/* Loan Type & Property */}
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">Loan Type</label>
        <select value={quoteData.loanType} onChange={(e) => handleInputChange('loanType', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
          <option value="va_irrrl">VA IRRRL</option>
          <option value="fha_streamline">FHA Streamline</option>
          <option value="conventional">Conventional</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-2">Borrower Name</label>
        <input 
          type="text" 
          value={quoteData.borrowerName} 
          onChange={(e) => handleInputChange('borrowerName', e.target.value)} 
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" 
          placeholder="John Smith" 
        />
      </div>
    </div>

    {/* Property Address */}
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <div className="md:col-span-2">
        <label className="block text-sm text-gray-400 mb-2">Property Address</label>
        <input type="text" value={quoteData.propertyAddress} onChange={(e) => handleInputChange('propertyAddress', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="123 Main St, City, ST" />
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Current Loan */}
      <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-lg mb-4 text-red-400">Current Loan</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Loan Amount ($)</label>
            <input type="number" value={quoteData.currentLoanAmount} onChange={(e) => handleInputChange('currentLoanAmount', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="350000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Rate (%)</label>
              <input type="number" step="0.001" value={quoteData.currentRate} onChange={(e) => handleInputChange('currentRate', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="6.500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Term</label>
              <select value={quoteData.currentTerm} onChange={(e) => handleInputChange('currentTerm', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
                <option value="30">30 Year</option>
                <option value="20">20 Year</option>
                <option value="15">15 Year</option>
              </select>
            </div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/30">
            <div className="text-xs text-gray-400 mb-1">P&I (Auto-Calculated)</div>
            <div className="text-xl font-bold text-blue-400">{formatCurrency(currentPI)}/mo</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Taxes/Mo ($)</label>
              <input type="number" value={quoteData.currentTaxes} onChange={(e) => handleInputChange('currentTaxes', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="300" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Insurance/Mo ($)</label>
              <input type="number" value={quoteData.currentInsurance} onChange={(e) => handleInputChange('currentInsurance', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="150" />
            </div>
          </div>
          {showMI && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">MI/Mo ($)</label>
              <input type="number" value={quoteData.currentMI} onChange={(e) => handleInputChange('currentMI', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="200" />
            </div>
          )}
          <div className="bg-red-900/20 rounded-lg p-3 border border-red-700/30">
            <div className="text-xs text-gray-400 mb-1">Total PITI</div>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(currentPITI)}/mo</div>
          </div>
        </div>
      </div>

      {/* New Loan */}
      <div className="bg-gray-900/50 rounded-xl p-5 border border-green-700">
        <h3 className="font-semibold text-lg mb-4 text-green-400">New Loan</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Loan Amount ($)</label>
            <input type="number" value={quoteData.newLoanAmount} onChange={(e) => handleInputChange('newLoanAmount', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="350000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Rate (%)</label>
              <input type="number" step="0.001" value={quoteData.newRate} onChange={(e) => handleInputChange('newRate', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="5.250" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Term</label>
              <select value={quoteData.newTerm} onChange={(e) => handleInputChange('newTerm', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
                <option value="30">30 Year</option>
                <option value="20">20 Year</option>
                <option value="15">15 Year</option>
              </select>
            </div>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/30">
            <div className="text-xs text-gray-400 mb-1">P&I (Auto-Calculated)</div>
            <div className="text-xl font-bold text-blue-400">{formatCurrency(newPI)}/mo</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Taxes/Mo ($)</label>
              <input type="number" value={quoteData.newTaxes} onChange={(e) => handleInputChange('newTaxes', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="300" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Insurance/Mo ($)</label>
              <input type="number" value={quoteData.newInsurance} onChange={(e) => handleInputChange('newInsurance', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="150" />
            </div>
          </div>
          {showMI && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">MI/Mo ($)</label>
              <input type="number" value={quoteData.newMI} onChange={(e) => handleInputChange('newMI', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="200" />
            </div>
          )}
          <div className="bg-green-900/20 rounded-lg p-3 border border-green-700/30">
            <div className="text-xs text-gray-400 mb-1">Total PITI</div>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(newPITI)}/mo</div>
          </div>
        </div>
      </div>
    </div>

    {/* Additional Options */}
    <div className="grid md:grid-cols-3 gap-4 mt-6">
      {showEscrow && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Escrow Refund ($)</label>
          <input type="number" value={quoteData.escrowRefund} onChange={(e) => handleInputChange('escrowRefund', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="2400" />
          {quoteData.loanType === 'fha_streamline' && (
            <button onClick={() => setShowUFMIPCalc(true)} className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <Calculator className="w-3 h-3" /> Calculate UFMIP Refund
            </button>
          )}
        </div>
      )}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Skip Payments</label>
        <select value={quoteData.skipMonths} onChange={(e) => handleInputChange('skipMonths', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500">
          <option value="0">No Skip</option>
          <option value="1">Skip 1 Month</option>
          <option value="2">Skip 2 Months</option>
        </select>
      </div>
      {showFees && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Total Fees ($)</label>
          <input type="number" value={quoteData.fees} onChange={(e) => handleInputChange('fees', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500" placeholder="3200" />
        </div>
      )}
    </div>

    {/* Toggles */}
    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-700 mt-6">
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showPrincipal} onChange={(e) => setShowPrincipal(e.target.checked)} className="w-4 h-4 rounded bg-gray-900 border-gray-600" /><span className="text-sm text-gray-300">Show Principal</span></label>
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showEscrow} onChange={(e) => setShowEscrow(e.target.checked)} className="w-4 h-4 rounded bg-gray-900 border-gray-600" /><span className="text-sm text-gray-300">Show Escrow Refund</span></label>
      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showFees} onChange={(e) => setShowFees(e.target.checked)} className="w-4 h-4 rounded bg-gray-900 border-gray-600" /><span className="text-sm text-gray-300">Show Fees</span></label>
    </div>
  </div>
)}

{/* Hide view mode buttons in client view */}
{!isClientView && (
  <div className="mb-8 flex flex-col sm:flex-row gap-3">
    <button onClick={() => setViewMode('savings')} className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${viewMode === 'savings' ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-900/50' : 'bg-gray-800 hover:bg-gray-700'}`}>💰 Maximum Savings</button>
    <button onClick={() => setViewMode('breakdown')} className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${viewMode === 'breakdown' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-900/50' : 'bg-gray-800 hover:bg-gray-700'}`}>📊 Full Breakdown</button>
    <button onClick={() => setViewMode('simple')} className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${viewMode === 'simple' ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-900/50' : 'bg-gray-800 hover:bg-gray-700'}`}>✅ Simple & Clean</button>
  </div>
)}

{/* Hide copy link button in client view */}
{!isClientView && (
  <div className="mb-6 flex justify-center">
    <button
      onClick={generateQuoteLink}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-semibold transition-all shadow-lg flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      Copy Quote Link to Text Client
    </button>
  </div>
)}

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
          {quoteData.propertyAddress && (
            <div className="bg-black/40 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-2 text-gray-300">
                <Home className="w-5 h-5" />
                <span className="font-medium">{quoteData.propertyAddress}</span>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Borrower Name Display */}
{/* Borrower Name Display - Different for client view */}
{quoteData.borrowerName && !isClientView && (
  <div className="text-center mb-6">
    <div className="text-xl text-gray-300">
      Quote prepared for <span className="font-bold text-white">{quoteData.borrowerName}</span>
    </div>
  </div>
)}

{/* Client View Welcome Message */}
{isClientView && quoteData.borrowerName && (
  <div className="text-center mb-8">
    <div className="text-2xl font-bold text-green-400 mb-2">Your Personalized Quote</div>
    <div className="text-xl text-gray-300">
      Hello <span className="font-bold text-white">{quoteData.borrowerName}</span>,
    </div>
    <div className="text-gray-400 mt-2">Here's your savings breakdown from Oakstone Capital</div>
  </div>
)}

            {viewMode === 'savings' && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Your <span className="text-green-400">Savings Snapshot</span></h2>
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-8 text-center shadow-lg">
                  <div className="text-sm uppercase tracking-wide mb-2 text-green-100">Monthly Savings</div>
                  <div className="text-5xl md:text-6xl font-bold mb-2">{formatCurrency(monthlySavings)}</div>
                  <div className="text-green-100">Every single month</div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {parseInt(quoteData.skipMonths) > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-3 mb-2"><Calendar className="w-6 h-6 text-blue-400" /><span className="text-lg font-semibold">Skip {quoteData.skipMonths} Payment{quoteData.skipMonths === '2' ? 's' : ''}</span></div>
                      <div className="text-3xl font-bold text-blue-400">{formatCurrency(skipValue)}</div>
                      <div className="text-sm text-gray-400 mt-1">Back in your pocket</div>
                    </div>
                  )}
                  {showEscrow && escrowRefund > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-3 mb-2"><DollarSign className="w-6 h-6 text-yellow-400" /><span className="text-lg font-semibold">Escrow Refund</span></div>
                      <div className="text-3xl font-bold text-yellow-400">{formatCurrency(escrowRefund)}</div>
                      <div className="text-sm text-gray-400 mt-1">Check back to you</div>
                    </div>
                  )}
                  {showPrincipal && principalIncrease > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-3 mb-2"><TrendingDown className="w-6 h-6 text-purple-400" /><span className="text-lg font-semibold">Extra Principal/Month</span></div>
                      <div className="text-3xl font-bold text-purple-400">{formatCurrency(principalIncrease)}</div>
                      <div className="text-sm text-gray-400 mt-1">Building equity faster</div>
                    </div>
                  )}
                </div>
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-gray-400 text-sm mb-2">Current Rate</div>
                      <div className="text-2xl font-bold text-red-400">{formatRate(quoteData.currentRate)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-2">New Rate</div>
                      <div className="text-2xl font-bold text-green-400">{formatRate(quoteData.newRate)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'breakdown' && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Complete <span className="text-blue-400">Financial Breakdown</span></h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-400 mb-2">Current Situation</div>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-3xl font-bold text-red-400">{formatRate(quoteData.currentRate)}</span>
                      </div>
                      <div className="text-sm text-gray-400 mb-1">P&I: {formatCurrency(currentPI)}</div>
                      <div className="text-2xl font-bold">{formatCurrency(currentPITI)}<span className="text-sm text-gray-400">/mo</span></div>
                      <div className="text-xs text-gray-500 mt-1">Total PITI</div>
                    </div>
                    {showPrincipal && currentMonth1Principal > 0 && (
                      <div className="border-t border-gray-700 pt-3">
                        <div className="text-sm text-gray-400">Principal portion (Month 1)</div>
                        <div className="text-lg font-semibold">{formatCurrency(currentMonth1Principal)}/mo</div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-500/50">
                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-300 mb-2">New Loan Terms</div>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-3xl font-bold text-green-400">{formatRate(quoteData.newRate)}</span>
                      </div>
                      <div className="text-sm text-gray-300 mb-1">P&I: {formatCurrency(newPI)}</div>
                      <div className="text-2xl font-bold">{formatCurrency(newPITI)}<span className="text-sm text-gray-400">/mo</span></div>
                      <div className="text-xs text-gray-500 mt-1">Total PITI</div>
                    </div>
                    {showPrincipal && newMonth1Principal > 0 && (
                      <div className="border-t border-blue-500/30 pt-3">
                        <div className="text-sm text-gray-300">Principal portion (Month 1)</div>
                        <div className="text-lg font-semibold text-green-400">{formatCurrency(newMonth1Principal)}/mo</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-sm text-green-100 mb-2">Monthly Savings</div>
                    <div className="text-4xl font-bold">{formatCurrency(monthlySavings)}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {parseInt(quoteData.skipMonths) > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 text-center">
                      <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400 mb-1">Skip {quoteData.skipMonths} Payment{quoteData.skipMonths === '2' ? 's' : ''}</div>
                      <div className="text-2xl font-bold text-blue-400">{formatCurrency(skipValue)}</div>
                    </div>
                  )}
                  {showEscrow && escrowRefund > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 text-center">
                      <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400 mb-1">Escrow Refund</div>
                      <div className="text-2xl font-bold text-yellow-400">{formatCurrency(escrowRefund)}</div>
                    </div>
                  )}
                  {showPrincipal && principalIncrease > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 text-center">
                      <TrendingDown className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400 mb-1">Extra Principal</div>
                      <div className="text-2xl font-bold text-purple-400">{formatCurrency(principalIncrease)}/mo</div>
                    </div>
                  )}
                </div>
                {showFees && fees > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold">Estimated Closing Costs</span>
                      </div>
                      <div className="text-xl font-bold">{formatCurrency(fees)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'simple' && (
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Your <span className="text-purple-400">New Loan</span></h2>
                <div className="text-center space-y-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Interest Rate</div>
                    <div className="text-5xl md:text-6xl font-bold text-purple-400">{formatRate(quoteData.newRate)}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
                    <div className="text-sm text-gray-400 mb-2">Monthly Payment (PITI)</div>
                    <div className="text-4xl md:text-5xl font-bold">{formatCurrency(newPITI)}</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6">
                    <div className="text-sm text-green-100 mb-2">You Save</div>
                    <div className="text-4xl font-bold">{formatCurrency(monthlySavings)}/mo</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-lg">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span>Lower rate: {formatRate(quoteData.currentRate)} → {formatRate(quoteData.newRate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-lg">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span>Lower payment: {formatCurrency(currentPITI)} → {formatCurrency(newPITI)}</span>
                  </div>
                  {parseInt(quoteData.skipMonths) > 0 && (
                    <div className="flex items-center gap-3 text-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span>Skip {quoteData.skipMonths} payment{quoteData.skipMonths === '2' ? 's' : ''} ({formatCurrency(skipValue)})</span>
                    </div>
                  )}
                  {showEscrow && escrowRefund > 0 && (
                    <div className="flex items-center gap-3 text-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span>Escrow refund: {formatCurrency(escrowRefund)}</span>
                    </div>
                  )}
                  {showPrincipal && principalIncrease > 0 && (
                    <div className="flex items-center gap-3 text-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <span>Build equity {formatCurrency(principalIncrease)}/mo faster</span>
                    </div>
                  )}
                </div>
              </div>
            )}

{/* GOOGLE REVIEWS SECTION */}
<div className="mt-8 pt-8 border-t border-gray-700">
  <div className="bg-gradient-to-br from-yellow-600/20 to-amber-600/20 rounded-xl p-6 border border-yellow-500/50 text-center">
    <div className="flex justify-center mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
    </div>
    <h3 className="text-2xl font-bold mb-2">Trusted by Homeowners Like You</h3>
    <p className="text-gray-300 mb-4">Join satisfied clients who saved with Oakstone Capital</p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href="https://www.google.com/search?q=Oakstone+Capital+Mortgage+LLC&rlz=1C1VDKB_enUS1127US1127&sxsrf=ANbL-n5KHJizAfW-E3Hqxk3iBHu_eCJ1Wg:1771470986502&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOQvueYEpKpGuY65lm4VxBNWIZCLnn3K5EjDnXFlluRlc0zGxQ9ooC6lTQNCYqCNGOkiPgok%3D&uds=ALYpb_kVApVhulIiP3ocP-9qIyr_nLMhYA1Ohq_p5XieA1NNSRpI3DEMN6u4_Og7CyRwe6lz47cWTHv1VuZk8Nqaskrx_Cht6SvAJiGcz9Odwe6yA1jpo8L_a-YmoV8Lq_s71cj8tmTT"
        target="_blank" 
        rel="noopener noreferrer"
        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 flex-1"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
        Read Our Google Reviews
      </a>
      <a 
        href="https://www.google.com/search?q=Oakstone+Capital+Mortgage+LLC&rlz=1C1VDKB_enUS1127US1127&sxsrf=ANbL-n5KHJizAfW-E3Hqxk3iBHu_eCJ1Wg:1771470986502&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOQvueYEpKpGuY65lm4VxBNWIZCLnn3K5EjDnXFlluRlc0zGxQ9ooC6lTQNCYqCNGOkiPgok%3D&uds=ALYpb_kVApVhulIiP3ocP-9qIyr_nLMhYA1Ohq_p5XieA1NNSRpI3DEMN6u4_Og7CyRwe6lz47cWTHv1VuZk8Nqaskrx_Cht6SvAJiGcz9Odwe6yA1jpo8L_a-YmoV8Lq_s71cj8tmTT#lrd=0x89c2b704de14df37:0x1b9059be21c8a5a7,1,,,"
        target="_blank" 
        rel="noopener noreferrer"
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 flex-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Write a Review
      </a>
    </div>
    <p className="text-sm text-gray-400 mt-4">⭐⭐⭐⭐⭐ 5.0 (27 reviews)</p>
  </div>
</div>

            {/* Apply Now Button */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              <a href="https://2585868.my1003app.com/1576672/register?time=1771103083263" target="_blank" rel="noopener noreferrer" className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xl py-5 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl text-center">
                <span className="flex items-center justify-center gap-3">Apply Now <ArrowRight className="w-6 h-6" /></span>
              </a>
              <p className="text-center text-sm text-gray-400 mt-4">NMLS #2585868 • Secure application • Takes 5 minutes</p>
            </div>

            {/* Loan Officer Info */}
            {selectedLOData && (
              <div className="mt-6 bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-xl p-6 border border-gray-600">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">{getInitials(selectedLOData.name)}</div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-400 mb-1">Your Loan Officer</div>
                    <div className="font-bold text-lg">{selectedLOData.name}</div>
                    {selectedLOData.nmls && <div className="text-sm text-gray-400">NMLS #{selectedLOData.nmls}</div>}
                  </div>
                </div>
                {(selectedLOData.phone || selectedLOData.email) && (
                  <div className="mt-4 pt-4 border-t border-gray-600 space-y-2">
                    {selectedLOData.phone && <a href={`tel:${selectedLOData.phone}`} className="flex items-center gap-2 text-blue-400 hover:text-blue-300"><Phone className="w-4 h-4" /><span>{formatPhone(selectedLOData.phone)}</span></a>}
                    {selectedLOData.email && <a href={`mailto:${selectedLOData.email}`} className="flex items-center gap-2 text-blue-400 hover:text-blue-300"><Mail className="w-4 h-4" /><span>{selectedLOData.email}</span></a>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Oakstone Capital Mortgage • NMLS #2585868</p>
          <p className="mt-2">This quote is an estimate and not a commitment to lend.</p>
        </div>
      </div>
    </div>
  );
}