import { Helmet } from "react-helmet";
import Header from "../../components/ui/Header";
import HealthMonitor from "./components/HealthMonitor";
import ApiLatencyCard from "./components/ApiLatencyCard";
import ErrorLogViewer from "./components/ErrorLogViewer";
import DataProviderStatus from "./components/DataProviderStatus";
import DegradedModeControl from "./components/DegradedModeControl";
import { RealTimeDataPanel } from './components/RealTimeDataPanel';
import ApiSmokeTestPanel from "./components/ApiSmokeTestPanel";
import OrchestratorBridgePanel from "../../components/OrchestratorBridgePanel";
import { useState } from "react";

export default function SystemStatus() {
  const [activeItem, setActiveItem] = useState('system-status');

  return (
    <>
      <Helmet>
        <title>System Status - Rocket Trading MVP</title>
        <meta name="description" content="Real-time system monitoring and health dashboard" />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <Header activeItem={activeItem} setActiveItem={setActiveItem} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Status</h1>
            <p className="text-gray-600">Real-time monitoring and system health dashboard</p>
          </div>

          <div className="grid gap-8">
            {/* Health Overview Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              <HealthMonitor />
              <ApiLatencyCard />
            </div>

            {/* ChatOps Bridge Panel */}
            <OrchestratorBridgePanel />

            {/* Data Status Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              <DataProviderStatus />
              <DegradedModeControl />
            </div>

            {/* Real-Time Monitoring */}
            <RealTimeDataPanel />

            {/* Testing and Diagnostics */}
            <div className="grid lg:grid-cols-2 gap-8">
              <ApiSmokeTestPanel />
              <ErrorLogViewer />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}