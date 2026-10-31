import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { formatCurrency, Budget, FinancialGoal } from '../../types/database';
import { PieChart, Target, Plus, TrendingUp, CheckCircle2 } from 'lucide-react';

export const BudgetsView: React.FC = () => {
  const { activeWorkspace, canManageBudgets } = useWorkspace();
  const { currentUser } = useAuth();

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // New budget form state
  const [bName, setBName] = useState('');
  const [bAmount, setBAmount] = useState('');
  const [bPeriod, setBPeriod] = useState<Budget['period']>('monthly');

  // New goal form state
  const [gTitle, setGTitle] = useState('');
  const [gTarget, setGTarget] = useState('');
  const [gCurrent, setGCurrent] = useState('');

  const budgets = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getBudgets(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, showAddBudget]);

  const goals = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getGoals(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, showAddGoal]);

  const currency = activeWorkspace?.currency || 'INR';

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeWorkspace) return;
    dataEngine.addBudget(currentUser.id, activeWorkspace.id, {
      name: bName,
      amount: Number(bAmount),
      period: bPeriod,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    });
    setBName('');
    setBAmount('');
    setShowAddBudget(false);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeWorkspace) return;
    dataEngine.addGoal(currentUser.id, activeWorkspace.id, {
      title: gTitle,
      target_amount: Number(gTarget),
      current_amount: Number(gCurrent) || 0,
      target_date: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      status: 'active',
    });
    setGTitle('');
    setGTarget('');
    setGCurrent('');
    setShowAddGoal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Budgets &amp; Financial Goals</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Financial boundaries, capital sinking funds, and target milestone allocation for {activeWorkspace?.name}.
          </p>
        </div>

        {canManageBudgets && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddBudget(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Budget</span>
            </button>
            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>New Goal</span>
            </button>
          </div>
        )}
      </div>

      {/* Budgets Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Active Spending Budgets</span>
          <span className="text-xs font-normal text-slate-400">({budgets.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              No budgets configured. Click "New Budget" to define spending limits.
            </div>
          ) : (
            budgets.map((b) => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{b.name}</span>
                  <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {b.period}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-xl font-extrabold text-slate-900">
                    {formatCurrency(b.amount, currency)}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Period: {b.start_date} to {b.end_date}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Financial Goals Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Milestone Financial Goals &amp; Reserves</span>
          <span className="text-xs font-normal text-slate-400">({goals.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              No financial goals yet. Click "New Goal" to establish a target.
            </div>
          ) : (
            goals.map((g) => {
              const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
              return (
                <div key={g.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">{g.title}</span>
                    <span className="font-bold text-cyan-600">{pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden my-3">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Saved: {formatCurrency(g.current_amount, currency)}</span>
                    <span className="font-bold text-slate-800">Target: {formatCurrency(g.target_amount, currency)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals for Add Budget & Add Goal */}
      {showAddBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Create Spending Budget</h3>
            <form onSubmit={handleCreateBudget} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Budget Name</label>
                <input
                  type="text"
                  required
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  placeholder="e.g. Facilities & AMC"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Budget Limit ({currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={bAmount}
                  onChange={(e) => setBAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Period</label>
                <select
                  value={bPeriod}
                  onChange={(e) => setBPeriod(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Create Financial Goal / Sinking Fund</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={gTitle}
                  onChange={(e) => setGTitle(e.target.value)}
                  placeholder="e.g. Sinking Fund"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={gTarget}
                  onChange={(e) => setGTarget(e.target.value)}
                  placeholder="200000"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Initial Saved Amount</label>
                <input
                  type="number"
                  min="0"
                  value={gCurrent}
                  onChange={(e) => setGCurrent(e.target.value)}
                  placeholder="25000"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
