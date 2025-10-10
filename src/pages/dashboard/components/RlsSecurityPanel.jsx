import RlsHealthWidget from "../../../components/ui/RlsHealthWidget";

export default function RlsSecurityPanel() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          RLS Security Monitor
        </h2>
        <p className="text-gray-600">
          Real-time monitoring and auto-repair for Row Level Security policies
        </p>
      </div>
      
      <RlsHealthWidget 
        canRepair={true} 
        className="max-w-4xl mx-auto"
      />
      
      <div className="max-w-4xl mx-auto p-4 rounded-lg bg-blue-50 border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">💡 How It Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Health Check:</strong> Monitors RLS policies across critical database tables</li>
          <li>• <strong>Role-Based Access:</strong> Validates JWT-based role permissions (system_ai, data_ingest, admin, public)</li>
          <li>• <strong>Auto-Repair:</strong> Automatically creates missing policies and enables RLS where needed</li>
          <li>• <strong>Security First:</strong> Auto-repair requires internal admin key and uses service role privileges</li>
          <li>• <strong>Real-time:</strong> Updates every 30 seconds with current policy status</li>
        </ul>
      </div>
    </div>
  );
}