import { useState } from 'react';
import { AlertTriangle, Send, Download, Search, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const API = import.meta.env?.VITE_API_BASE_URL;
const KEY = import.meta.env?.VITE_INTERNAL_ADMIN_KEY;

export default function OrchestratorBridgePanel() {
    const [cmd, setCmd] = useState('rebalance');
    const [channel, setChannel] = useState('execution');
    const [payload, setPayload] = useState('{"symbol":"SPY","target":0.15}');
    const [priority, setPriority] = useState(0);
    const [inboxId, setInboxId] = useState('');
    const [result, setResult] = useState(null);
    const [log, setLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addLog = (message, type = 'info') => {
        const timestamp = new Date()?.toLocaleTimeString();
        setLog(l => [{
            id: Date.now(),
            message,
            type,
            timestamp
        }, ...l]?.slice(0, 10)); // Keep only last 10 entries
    };

    const post = async (path, body) => {
        const r = await fetch(`${API}/bridge${path}`, {
            method: 'POST',
            headers: { 
                'content-type': 'application/json', 
                'x-internal-key': KEY 
            },
            body: JSON.stringify(body || {})
        });
        return r?.json();
    };

    const get = async (path) => {
        const r = await fetch(`${API}/bridge${path}`, { 
            headers: { 'x-internal-key': KEY }
        });
        return r?.json();
    };

    const validatePayload = (payloadStr) => {
        try {
            JSON.parse(payloadStr);
            return null;
        } catch (e) {
            return e?.message;
        }
    };

    const enqueue = async () => {
        setLoading(true);
        setError('');
        
        const payloadError = validatePayload(payload);
        if (payloadError) {
            setError(`Invalid JSON payload: ${payloadError}`);
            setLoading(false);
            return;
        }

        try {
            const res = await post('/enqueue', { 
                channel, 
                command: cmd, 
                payload: JSON.parse(payload), 
                priority, 
                issued_by: 'assistant' 
            });
            
            if (res?.ok) {
                setInboxId(res?.inbox_id || '');
                addLog(`✅ Enqueued '${cmd}' → inbox_id=${res?.inbox_id || '—'}`, 'success');
            } else {
                addLog(`❌ Failed to enqueue: ${res?.error || 'Unknown error'}`, 'error');
                setError(res?.error || 'Failed to enqueue command');
            }
        } catch (e) {
            const errorMsg = `Network error: ${e?.message || e}`;
            addLog(`❌ ${errorMsg}`, 'error');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const pull = async () => {
        setLoading(true);
        setError('');
        
        try {
            const res = await post('/pull', { channel });
            
            if (res?.ok) {
                const cmdInfo = res?.cmd ? `command '${res?.cmd?.command}' (${res?.cmd?.id})` : 'no commands';
                addLog(`🔄 Pulled from '${channel}' → ${cmdInfo}`, 'info');
            } else {
                addLog(`❌ Pull failed: ${res?.error || 'Unknown error'}`, 'error');
                setError(res?.error || 'Failed to pull command');
            }
        } catch (e) {
            const errorMsg = `Network error: ${e?.message || e}`;
            addLog(`❌ ${errorMsg}`, 'error');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const fetchResult = async () => {
        if (!inboxId) return;
        
        setLoading(true);
        setError('');
        
        try {
            const res = await get(`/result/${inboxId}`);
            
            if (res?.ok) {
                setResult(res?.result || null);
                addLog(`📥 Result for ${inboxId} → ${res?.result?.ok ? '✅ Success' : '❌ Error'}`, 'success');
            } else {
                addLog(`❌ Failed to fetch result: ${res?.error || 'Unknown error'}`, 'error');
                setError(res?.error || 'Failed to fetch result');
            }
        } catch (e) {
            const errorMsg = `Network error: ${e?.message || e}`;
            addLog(`❌ ${errorMsg}`, 'error');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const healthCheck = async () => {
        setLoading(true);
        setError('');
        
        try {
            const res = await get('/health');
            
            if (res?.ok) {
                addLog(`💚 Bridge Health: OK`, 'success');
            } else {
                addLog(`💔 Bridge Health: Failed`, 'error');
                setError('Bridge health check failed');
            }
        } catch (e) {
            const errorMsg = `Bridge unreachable: ${e?.message || e}`;
            addLog(`💔 ${errorMsg}`, 'error');
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 border rounded-xl bg-white shadow-lg space-y-6">
            <div className="flex items-center gap-3">
                <ArrowRight className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">
                    AAS ↔ Chef Orchestrateur — ChatOps Bridge
                </h3>
                <button
                    onClick={healthCheck}
                    disabled={loading}
                    className="ml-auto px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                    {loading ? <Clock className="w-4 h-4 animate-spin" /> : '💚 Health'}
                </button>
            </div>
            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm">{error}</span>
                </div>
            )}
            {/* Command Input Form */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                    <select 
                        value={channel} 
                        onChange={(e) => setChannel(e?.target?.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="execution">execution</option>
                        <option value="data">data</option>
                        <option value="research">research</option>
                        <option value="default">default</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Command</label>
                    <select 
                        value={cmd} 
                        onChange={(e) => setCmd(e?.target?.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="rebalance">rebalance</option>
                        <option value="pause-agent">pause-agent</option>
                        <option value="resume-agent">resume-agent</option>
                        <option value="run-backtest">run-backtest</option>
                        <option value="sync-books">sync-books</option>
                        <option value="rollover">rollover</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <input 
                        type="number"
                        min="0" 
                        max="10"
                        value={priority}
                        onChange={(e) => setPriority(parseInt(e?.target?.value) || 0)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payload JSON</label>
                    <textarea 
                        value={payload} 
                        onChange={(e) => setPayload(e?.target?.value)}
                        placeholder='{"key": "value"}'
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                    />
                </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={enqueue}
                    disabled={loading}
                >
                    <Send className="w-4 h-4" />
                    {loading ? 'Enqueueing...' : 'Enqueue Command'}
                </button>

                <button 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={pull}
                    disabled={loading}
                >
                    <Download className="w-4 h-4" />
                    {loading ? 'Pulling...' : 'Orchestrateur: Pull'}
                </button>

                <button 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={fetchResult}
                    disabled={!inboxId || loading}
                >
                    <Search className="w-4 h-4" />
                    {loading ? 'Fetching...' : 'Fetch Result'}
                </button>
            </div>
            {/* Current Inbox ID */}
            {inboxId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Current Inbox ID:</div>
                    <code className="text-sm text-blue-600 font-mono break-all">{inboxId}</code>
                </div>
            )}
            {/* Result Display */}
            {result && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-800">Command Result</h4>
                        {result?.ok ? 
                            <CheckCircle className="w-5 h-5 text-green-600" /> : 
                            <XCircle className="w-5 h-5 text-red-600" />
                        }
                    </div>
                    <pre className="bg-gray-50 border rounded-lg p-4 text-sm overflow-auto max-h-64">
{JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
            {/* Activity Log */}
            <div className="space-y-2">
                <h4 className="text-lg font-semibold text-gray-800">Bridge Activity Log</h4>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm space-y-1">
                    {log?.length === 0 ? (
                        <div className="text-gray-500 italic">No activity yet...</div>
                    ) : (
                        log?.map((entry) => (
                            <div 
                                key={entry?.id} 
                                className={`flex items-start gap-2 ${
                                    entry?.type === 'error' ? 'text-red-400' : 
                                    entry?.type === 'success'? 'text-green-400' : 'text-blue-400'
                                }`}
                            >
                                <span className="text-gray-500 text-xs">{entry?.timestamp}</span>
                                <span className="flex-1">{entry?.message}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}