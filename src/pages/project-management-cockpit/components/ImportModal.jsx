import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Download,
  Eye
} from 'lucide-react';

const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [csvData, setCsvData] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setCsvData(null);
      setCsvFile(null);
      setPreview([]);
      setError(null);
      setImporting(false);
      setDragActive(false);
    }
  }, [isOpen]);

  const parseCSV = (text) => {
    const lines = text?.trim()?.split('\n');
    if (lines?.length < 2) {
      throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
    }

    const headers = lines?.[0]?.split(',')?.map(h => h?.trim()?.replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines?.length; i++) {
      const values = lines?.[i]?.split(',')?.map(v => v?.trim()?.replace(/"/g, ''));
      if (values?.length === headers?.length) {
        const row = {};
        headers?.forEach((header, index) => {
          row[header] = values?.[index];
        });
        data?.push(row);
      }
    }

    return data;
  };

  const handleFile = useCallback((file) => {
    if (!file) return;
    
    if (!file?.name?.toLowerCase()?.endsWith('.csv')) {
      setError('Veuillez sélectionner un fichier CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e?.target?.result;
        const parsed = parseCSV(csvText);
        setCsvData(parsed);
        setCsvFile(file);
        setPreview(parsed?.slice(0, 5)); // Show first 5 rows for preview
        setError(null);
      } catch (err) {
        setError(err?.message);
        setCsvData(null);
        setCsvFile(null);
        setPreview([]);
      }
    };
    reader?.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e?.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e?.preventDefault();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e?.preventDefault();
    setDragActive(false);
    
    const files = e?.dataTransfer?.files;
    if (files?.[0]) {
      handleFile(files?.[0]);
    }
  }, [handleFile]);

  const handleFileInput = (e) => {
    const files = e?.target?.files;
    if (files?.[0]) {
      handleFile(files?.[0]);
    }
  };

  const handleImport = async () => {
    if (!csvData) return;

    setImporting(true);
    setError(null);

    try {
      await onImport?.(csvData);
      onClose?.();
    } catch (err) {
      setError(err?.message || 'Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Phase,Tâche,Responsable,Statut,Priorité,Échéance (jours),Notes
dns_ssl,"Configurer DNS + SSL","DevOps","À faire","Haute",2,"Configuration domaine"
infrastructure,"Déployer base de données","Backend","Partiel","Haute",3,"PostgreSQL + Redis" monitoring,"Setup monitoring","Ops","À faire","Moyenne",4,"Grafana + Prometheus"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_taches.csv';
    link?.click();
    window.URL?.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="w-full max-w-4xl bg-gray-800 rounded-xl border border-gray-700 shadow-2xl"
              onClick={(e) => e?.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Upload className="w-6 h-6 text-green-400" />
                  <span>Importer des tâches CSV</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Template</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* File Upload Area */}
                {!csvData && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                      dragActive
                        ? 'border-green-400 bg-green-900/10' :'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        dragActive ? 'bg-green-400/20 text-green-400' : 'bg-gray-700 text-gray-400'
                      }`}>
                        <Upload className="w-8 h-8" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">
                          {dragActive ? 'Déposez le fichier ici' : 'Glissez votre fichier CSV ici'}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          ou cliquez pour sélectionner un fichier
                        </p>
                        
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileInput}
                          className="hidden"
                          id="csv-upload"
                        />
                        <label
                          htmlFor="csv-upload"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Choisir un fichier</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-red-300">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Preview */}
                {preview?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-medium text-white">
                          Aperçu des données
                        </h3>
                        <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-sm rounded">
                          {csvData?.length || 0} tâches
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setCsvData(null);
                          setCsvFile(null);
                          setPreview([]);
                          setError(null);
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        Changer de fichier
                      </button>
                    </div>

                    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-800">
                            <tr>
                              {Object.keys(preview?.[0] || {})?.map((header) => (
                                <th key={header} className="px-4 py-3 text-left font-medium text-gray-300">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-700">
                            {preview?.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-800">
                                {Object.values(row)?.map((value, cellIndex) => (
                                  <td key={cellIndex} className="px-4 py-3 text-gray-300">
                                    {value || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {csvData?.length > 5 && (
                        <div className="px-4 py-2 bg-gray-800 text-center text-sm text-gray-400">
                          ... et {csvData?.length - 5} autres lignes
                        </div>
                      )}
                    </div>

                    {/* Import Info */}
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-300 mb-1">Prêt pour l'importation</h4>
                          <ul className="text-sm text-blue-200 space-y-1">
                            <li>• {csvData?.length || 0} tâches seront importées</li>
                            <li>• Les colonnes reconnues: Phase, Tâche, Responsable, Statut, Priorité, Échéance, Notes</li>
                            <li>• Les dates d'échéance seront calculées automatiquement</li>
                            <li>• Les tâches existantes avec le même nom ne seront pas dupliquées</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-6">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  
                  {csvData && (
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {importing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Importation...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Importer {csvData?.length || 0} tâches</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ImportModal;