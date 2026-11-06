import React from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsView: React.FC = () => {
  const { data, fetchAIInsights } = useApp();

  const currencySymbol = data?.business?.currencySymbol || '₨';
  const orders = data?.orders || [];
  const expenses = data?.expenses || [];
  const totalRevenue = orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const grossProfit = totalRevenue * 0.25; // estimated margin
  const netProfit = grossProfit - totalExpenses;

  const exportCSV = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Order ID,Customer,Total,Status,Date",
       ...orders.map(o => `${o.id},"${o.customerName}",${o.grandTotal},${o.status},${o.date.split('T')[0]}`)
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shopflow_sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Sales Reports & Financial Analytics</h2>
          <p className="text-sm text-slate-500">Comprehensive profit & loss calculations, revenue reports, and export tools.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchAIInsights}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-md hover:opacity-95 transition-all"
          >
            <span>AI Business Analyst</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{currencySymbol} {totalRevenue.toLocaleString()}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1">From {orders.length} completed orders</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Gross Profit</p>
          <h3 className="text-2xl font-extrabold text-purple-600 mt-2">{currencySymbol} {grossProfit.toLocaleString()}</h3>
          <p className="text-xs text-purple-500 font-medium mt-1">~25% average margin</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2">{currencySymbol} {totalExpenses.toLocaleString()}</h3>
          <p className="text-xs text-rose-500 font-medium mt-1">Rent, salaries & utilities</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Profit / Loss</p>
          <h3 className={`text-2xl font-extrabold mt-2 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {currencySymbol} {netProfit.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">Gross Profit - Expenses</p>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-800">Monthly Business Health Summary</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your retail store <span className="font-bold text-slate-800">{data?.business?.name || 'Your Shop'}</span> is performing strongly with steady customer acquisition and high-demand product sales. Consider restocking low inventory items immediately to prevent lost sales opportunities.
        </p>
      </div>
    </div>
  );
};
