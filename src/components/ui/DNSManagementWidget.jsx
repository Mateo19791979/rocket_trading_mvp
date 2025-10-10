import React, { useState, useEffect } from 'react';
import { Globe, Plus, Edit3, Trash2, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { dnsSslService } from '../../services/dnsSslService';

const DNSManagementWidget = ({ domainId, domainName = 'trading-mvp.com' }) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({
    record_type: 'A',
    record_name: '@',
    record_value: '',
    ttl: 300,
    priority: 0
  });

  useEffect(() => {
    if (domainId) {
      loadDnsRecords();
    }
  }, [domainId]);

  const loadDnsRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dnsSslService?.getDnsRecords(domainId);
      setRecords(data || []);
    } catch (err) {
      setError('Erreur lors du chargement des enregistrements DNS: ' + (err?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    try {
      if (!newRecord?.record_value?.trim()) {
        setError('La valeur de l\'enregistrement est requise');
        return;
      }

      setError(null);
      const recordData = {
        domain_id: domainId,
        ...newRecord,
        record_name: newRecord?.record_name || '@'
      };

      await dnsSslService?.createDnsRecord(recordData);
      await loadDnsRecords();
      setShowAddForm(false);
      setNewRecord({
        record_type: 'A',
        record_name: '@',
        record_value: '',
        ttl: 300,
        priority: 0
      });
    } catch (err) {
      setError('Erreur lors de la création: ' + (err?.message || 'Erreur inconnue'));
    }
  };

  const handleUpdateRecord = async () => {
    try {
      if (!editingRecord?.record_value?.trim()) {
        setError('La valeur de l\'enregistrement est requise');
        return;
      }

      setError(null);
      await dnsSslService?.updateDnsRecord(editingRecord?.id, {
        record_type: editingRecord?.record_type,
        record_name: editingRecord?.record_name,
        record_value: editingRecord?.record_value,
        ttl: editingRecord?.ttl,
        priority: editingRecord?.priority
      });
      
      await loadDnsRecords();
      setEditingRecord(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour: ' + (err?.message || 'Erreur inconnue'));
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement DNS ?')) return;
    
    try {
      setError(null);
      await dnsSslService?.deleteDnsRecord(recordId);
      await loadDnsRecords();
    } catch (err) {
      setError('Erreur lors de la suppression: ' + (err?.message || 'Erreur inconnue'));
    }
  };

  const testDnsResolution = async (recordName, recordType) => {
    try {
      const result = await dnsSslService?.testDnsResolution(`${recordName}.${domainName}`, recordType);
      alert(`Test DNS ${result?.success ? 'réussi' : 'échoué'}: ${result?.resolvedValue || result?.error}`);
    } catch (err) {
      alert('Erreur lors du test DNS: ' + (err?.message || 'Erreur inconnue'));
    }
  };

  const getRecordTypeColor = (type) => {
    const colors = {
      'A': 'text-blue-400 bg-blue-400/10',
      'AAAA': 'text-purple-400 bg-purple-400/10',
      'CNAME': 'text-green-400 bg-green-400/10',
      'MX': 'text-orange-400 bg-orange-400/10',
      'TXT': 'text-yellow-400 bg-yellow-400/10',
      'SRV': 'text-pink-400 bg-pink-400/10',
      'PTR': 'text-indigo-400 bg-indigo-400/10',
      'NS': 'text-gray-400 bg-gray-400/10'
    };
    return colors?.[type] || 'text-gray-400 bg-gray-400/10';
  };

  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'PTR', 'NS'];

  if (loading && !records?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-white ml-3">Chargement des enregistrements DNS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Gestion DNS</h3>
            <p className="text-sm text-slate-400">{domainName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDnsRecords}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
          <h4 className="text-white font-medium mb-3">Nouvel enregistrement DNS</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type</label>
              <select
                value={newRecord?.record_type}
                onChange={(e) => setNewRecord({...newRecord, record_type: e?.target?.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
              >
                {recordTypes?.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nom</label>
              <input
                type="text"
                placeholder="@, www, mail..."
                value={newRecord?.record_name}
                onChange={(e) => setNewRecord({...newRecord, record_name: e?.target?.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Valeur</label>
              <input
                type="text"
                placeholder="192.168.1.1, example.com..."
                value={newRecord?.record_value}
                onChange={(e) => setNewRecord({...newRecord, record_value: e?.target?.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">TTL</label>
              <select
                value={newRecord?.ttl}
                onChange={(e) => setNewRecord({...newRecord, ttl: parseInt(e?.target?.value)})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
              >
                <option value={300}>5 min (300)</option>
                <option value={1800}>30 min (1800)</option>
                <option value={3600}>1 heure (3600)</option>
                <option value={14400}>4 heures (14400)</option>
                <option value={86400}>1 jour (86400)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateRecord}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Créer
            </button>
          </div>
        </div>
      )}

      {/* Records List */}
      <div className="space-y-3">
        {records?.map((record) => (
          <div key={record?.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            {editingRecord?.id === record?.id ? (
              // Edit Mode
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <select
                    value={editingRecord?.record_type}
                    onChange={(e) => setEditingRecord({...editingRecord, record_type: e?.target?.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                  >
                    {recordTypes?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={editingRecord?.record_name}
                    onChange={(e) => setEditingRecord({...editingRecord, record_name: e?.target?.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editingRecord?.record_value}
                    onChange={(e) => setEditingRecord({...editingRecord, record_value: e?.target?.value})}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUpdateRecord}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingRecord(null)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRecordTypeColor(record?.record_type)}`}>
                    {record?.record_type}
                  </span>
                  <div>
                    <div className="text-white font-medium">
                      {record?.record_name === '@' ? domainName : `${record?.record_name}.${domainName}`}
                    </div>
                    <div className="text-sm text-slate-400">{record?.record_value}</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    TTL: {record?.ttl}s
                  </div>
                  {record?.is_active ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testDnsResolution(record?.record_name, record?.record_type)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Tester la résolution DNS"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingRecord({...record})}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record?.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {records?.length === 0 && !loading && (
          <div className="text-center py-8 text-slate-400">
            <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>Aucun enregistrement DNS configuré</p>
            <p className="text-sm">Cliquez sur "Ajouter" pour créer votre premier enregistrement</p>
          </div>
        )}
      </div>

      {/* Quick Setup Suggestions */}
      {records?.length > 0 && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Suggestions de configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-300">
            <div>
              <strong>A Record:</strong> @ → {records?.find(r => r?.record_type === 'A')?.record_value || 'IP de votre serveur'}
            </div>
            <div>
              <strong>CNAME:</strong> www → {domainName}
            </div>
            <div>
              <strong>MX:</strong> @ → mail.{domainName}
            </div>
            <div>
              <strong>TXT:</strong> @ → v=spf1 include:_spf.google.com ~all
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DNSManagementWidget;