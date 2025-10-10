import React, { useState } from 'react';
import { Bell, Send, Mail, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

export default function AlertManagement() {
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [alertThresholds, setAlertThresholds] = useState({
    buffett: 200,
    cape: 30,
    changes: true
  });

  const recentAlerts = [
    {
      id: 1,
      type: 'change',
      message: 'CMV Buffett changé: ratio=217% (January 15, 2025)',
      timestamp: new Date()?.toISOString(),
      status: 'sent'
    },
    {
      id: 2,
      type: 'change',
      message: 'Wilshire Platform page MAJ: Our Platform',
      timestamp: new Date(Date.now() - 3600000)?.toISOString(),
      status: 'sent'
    },
    {
      id: 3,
      type: 'threshold',
      message: 'CMV CAPE changé: cape=33.2 stance=Overvalued',
      timestamp: new Date(Date.now() - 7200000)?.toISOString(),
      status: 'sent'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'change': return <Bell className="w-4 h-4 text-blue-400" />;
      case 'threshold': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleTestTelegram = () => {
    console.log('Sending test Telegram message...');
  };

  const handleTestEmail = () => {
    console.log('Sending test email...');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-semibold">Alert Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Active</span>
        </div>
      </div>
      <div className="space-y-4">
        {/* Notification Channels */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Notification Channels</h3>
          
          <div className="space-y-3">
            {/* Telegram */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Send className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium text-gray-200">Telegram</div>
                  <div className="text-xs text-gray-400">Bot: 123456:ABC... | Chat: 123456789</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTestTelegram}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                >
                  Test
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telegramEnabled}
                    onChange={(e) => setTelegramEnabled(e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-medium text-gray-200">Email</div>
                  <div className="text-xs text-gray-400">ops@trading-mvp.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTestEmail}
                  className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs"
                >
                  Test
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-200">Alert Thresholds</h3>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Buffett Ratio Threshold (%)</label>
              <input
                type="number"
                value={alertThresholds?.buffett}
                onChange={(e) => setAlertThresholds(prev => ({ ...prev, buffett: Number(e?.target?.value) }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                min="0"
                max="500"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">CAPE Threshold</label>
              <input
                type="number"
                value={alertThresholds?.cape}
                onChange={(e) => setAlertThresholds(prev => ({ ...prev, cape: Number(e?.target?.value) }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Alert on Any Changes</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertThresholds?.changes}
                  onChange={(e) => setAlertThresholds(prev => ({ ...prev, changes: e?.target?.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Recent Alerts</h3>
          
          <div className="space-y-3">
            {recentAlerts?.map((alert) => (
              <div key={alert?.id} className="flex items-start space-x-3">
                {getAlertIcon(alert?.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-300">{alert?.message}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp)?.toLocaleString()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Sent</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
          <h3 className="font-medium text-gray-200 mb-3">Statistics (Last 30 Days)</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">47</div>
              <div className="text-xs text-gray-400">Alerts Sent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">23</div>
              <div className="text-xs text-gray-400">Changes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">5</div>
              <div className="text-xs text-gray-400">Thresholds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}