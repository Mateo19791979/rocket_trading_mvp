import React, { useState, useEffect } from 'react';
import { Shield, Settings, Database, Lock, AlertTriangle } from 'lucide-react';
import Header from '../../components/ui/Header';
import CORSConfigPanel from './components/CORSConfigPanel';
import EnvExamplesPanel from './components/EnvExamplesPanel';
import SupabaseRLSPanel from './components/SupabaseRLSPanel';
import OrdersMVPPanel from './components/OrdersMVPPanel';
import Icon from '../../components/AppIcon';


const GlobalAITraderSecurityConfiguration = () => {
  const [activeItem, setActiveItem] = useState('global-ai-trader-security-configuration');
  const [configStatus, setConfigStatus] = useState({
    cors: false,
    env: false,
    rls: false,
    orders: false
  });

  useEffect(() => {
    // Simulate loading configuration status
    const timer = setTimeout(() => {
      setConfigStatus({
        cors: true,
        env: true,
        rls: false,
        orders: true
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentDate = () => {
    return new Date()?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800">
      <Header activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            GlobalAI Trader — Sécurité & Configuration
          </h1>
          <p className="text-xl text-orange-100 mb-4">
            CORS, .env, Supabase, Ordres
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-orange-100">
            <Shield className="w-5 h-5 mr-2" />
            {getCurrentDate()}
          </div>
        </div>

        {/* Configuration Status Overview */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'cors', label: 'CORS & Rate-Limit', icon: Shield },
            { key: 'env', label: '.env Configuration', icon: Settings },
            { key: 'rls', label: 'Supabase RLS', icon: Database },
            { key: 'orders', label: 'Orders MVP', icon: Lock }
          ]?.map(({ key, label, icon: Icon }) => (
            <div key={key} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="w-5 h-5 text-white mr-2" />
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  configStatus?.[key] ? 'bg-green-400' : 'bg-red-400'
                } animate-pulse`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <CORSConfigPanel />
            <EnvExamplesPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <SupabaseRLSPanel />
            <OrdersMVPPanel />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="flex items-center px-6 py-3 bg-white text-orange-700 font-semibold rounded-lg hover:bg-orange-50 transition-colors">
            <Settings className="w-5 h-5 mr-2" />
            Apply Configuration
          </button>
          <button className="flex items-center px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Validate Security
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalAITraderSecurityConfiguration;