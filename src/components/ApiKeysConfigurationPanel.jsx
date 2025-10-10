import { useState } from "react";

export default function ApiKeysConfigurationPanel({
  defaultValues = {},
  onSave,           // (form) => Promise<void>
  onTest,           // () => Promise<void>
  onReset,          // () => void
  saving = false,
  testing = false,
  title = "Configuration Clés API IBKR",
  description = "Configurez vos paramètres de connexion Interactive Brokers"
}) {
  const [form, setForm] = useState(defaultValues);
  const [validationErrors, setValidationErrors] = useState({});

  // Fallback handlers - use props first, then global shims
  const fallbackSave = async () => {
    try {
      return await window.handleIBKRConfigSave?.(form);
    } catch (e) {
      console.error("Fallback save failed:", e);
      throw e;
    }
  };
  
  const fallbackTest = async () => {
    try {
      return await window.handleIBKRTestConnection?.();
    } catch (e) {
      console.error("Fallback test failed:", e);
      throw e;
    }
  };
  
  const fallbackReset = () => {
    try {
      window.handleIBKRReset?.();
      // Reset form to default values
      setForm(defaultValues);
      setValidationErrors({});
    } catch (e) {
      console.error("Fallback reset failed:", e);
    }
  };

  // Enhanced form validation
  const validateForm = () => {
    const errors = {};
    
    if (!form?.host?.trim()) {
      errors.host = "L'hôte est obligatoire";
    } else if (!/^[\w.-]+$/?.test(form?.host)) {
      errors.host = "Format d'hôte invalide";
    }
    
    if (!form?.port) {
      errors.port = "Le port est obligatoire";
    } else if (!/^\d+$/?.test(form?.port) || parseInt(form?.port) < 1 || parseInt(form?.port) > 65535) {
      errors.port = "Port invalide (1-65535)";
    }
    
    if (!form?.account?.trim()) {
      errors.account = "Le compte est obligatoire";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      await (onSave || fallbackSave)(form);
    } catch (e) {
      console.error("Save failed:", e);
      // Error is already handled by the fallback or parent component
    }
  };

  const handleTest = async () => {
    try {
      await (onTest || fallbackTest)();
    } catch (e) {
      console.error("Test failed:", e);
      // Error is already handled by the fallback or parent component
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      setForm(defaultValues);
      setValidationErrors({});
    } else {
      fallbackReset();
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors?.[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="space-y-4">
        {/* Host Field */}
        <div>
          <label htmlFor="ibkr-host" className="block text-sm font-medium text-gray-700 mb-1">
            Hôte IBKR Gateway
          </label>
          <input
            id="ibkr-host"
            type="text"
            placeholder="127.0.0.1"
            value={form?.host || ""}
            onChange={(e) => handleInputChange("host", e?.target?.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors?.host 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' :'border-gray-300 focus:border-blue-500'
            }`}
          />
          {validationErrors?.host && (
            <p className="mt-1 text-sm text-red-600">{validationErrors?.host}</p>
          )}
        </div>

        {/* Port Field */}
        <div>
          <label htmlFor="ibkr-port" className="block text-sm font-medium text-gray-700 mb-1">
            Port
          </label>
          <input
            id="ibkr-port"
            type="number"
            placeholder="4001"
            min="1"
            max="65535"
            value={form?.port || ""}
            onChange={(e) => handleInputChange("port", e?.target?.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors?.port 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' :'border-gray-300 focus:border-blue-500'
            }`}
          />
          {validationErrors?.port && (
            <p className="mt-1 text-sm text-red-600">{validationErrors?.port}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Port par défaut: 4001 (Paper Trading), 7496 (Live Trading)
          </p>
        </div>

        {/* Account Field */}
        <div>
          <label htmlFor="ibkr-account" className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de Compte
          </label>
          <input
            id="ibkr-account"
            type="text"
            placeholder="DU123456"
            value={form?.account || ""}
            onChange={(e) => handleInputChange("account", e?.target?.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors?.account 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' :'border-gray-300 focus:border-blue-500'
            }`}
          />
          {validationErrors?.account && (
            <p className="mt-1 text-sm text-red-600">{validationErrors?.account}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Format: DU123456 (Paper) ou U123456 (Live)
          </p>
        </div>

        {/* Connection Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de Connexion
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="connectionType"
                value="paper"
                checked={form?.connectionType === "paper"}
                onChange={(e) => handleInputChange("connectionType", e?.target?.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Paper Trading</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="connectionType"
                value="live"
                checked={form?.connectionType === "live"}
                onChange={(e) => handleInputChange("connectionType", e?.target?.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Live Trading</span>
            </label>
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
            ) : (
              "Enregistrer"
            )}
          </button>

          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {testing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Test en cours...
              </span>
            ) : (
              "Tester la connexion"
            )}
          </button>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Réinitialiser
        </button>
      </div>
      {/* Status/Help Text */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Aide:</strong> Assurez-vous que TWS (Trader Workstation) ou IB Gateway est démarré 
          avec l'API Socket activée. Les paramètres par défaut sont généralement corrects.
        </p>
      </div>
    </div>
  );
}