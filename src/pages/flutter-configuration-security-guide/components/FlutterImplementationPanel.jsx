import React, { useState } from 'react';
import { Code2, Copy, Check, FileText, Shield } from 'lucide-react';
import Icon from '../../../components/AppIcon';
import { AppConfig } from './config';



const FlutterImplementationPanel = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (code, id) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const flutterAppConfigCode = `import 'dart:convert';
import 'package:flutter/services.dart';

class AppConfig {
  final String supabaseUrl;
  final String supabaseAnonKey;

  AppConfig({required this.supabaseUrl, required this.supabaseAnonKey});

  // Méthode statique pour charger la configuration depuis le fichier JSON
  static Future<AppConfig> forEnvironment() async {
    try {
      // Charge le contenu du fichier JSON depuis les assets
      final contents = await rootBundle.loadString('assets/env/env.json');
      final json = jsonDecode(contents) as Map<String, dynamic>;

      return AppConfig(
        supabaseUrl: json['SUPABASE_URL'],
        supabaseAnonKey: json['SUPABASE_ANON_KEY'],
      );
    } catch (e) {
      // Gère l'erreur si le fichier n'est pas trouvé ou malformé
      throw Exception('Could not load app configuration: \$e');
    }
  }
}`;

  const secureLoadingPattern = `// Enhanced secure loading with validation
static Future<AppConfig> forEnvironment({String? environment}) async {
  try {
    final envFile = environment ?? 'production';
    final path = 'assets/env/\$envFile.json';
    
    final contents = await rootBundle.loadString(path);
    final json = jsonDecode(contents) as Map<String, dynamic>;

    // Validate required fields
    final requiredFields = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
    for (final field in requiredFields) {
      if (!json.containsKey(field) || json[field]?.isEmpty == true) {
        throw ConfigurationException('Missing required field: \$field');
      }
    }

    // Validate URL format
    if (!Uri.tryParse(json['SUPABASE_URL'])?.hasAbsolutePath == true) {
      throw ConfigurationException('Invalid SUPABASE_URL format');
    }

    return AppConfig(
      supabaseUrl: json['SUPABASE_URL'],
      supabaseAnonKey: json['SUPABASE_ANON_KEY'],
    );
  } catch (e) {
    throw Exception('Configuration loading failed: \$e');
  }
}`;

  const configurationExamples = [
    {
      id: 'basic-implementation',
      title: 'Basic AppConfig Implementation',
      description: 'The provided Flutter AppConfig class with JSON loading',
      code: flutterAppConfigCode,
      language: 'dart'
    },
    {
      id: 'secure-loading',
      title: 'Enhanced Secure Loading',
      description: 'Production-ready implementation with validation',
      code: secureLoadingPattern,
      language: 'dart'
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600/20 to-teal-600/20 px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Code2 className="w-6 h-6 text-white mr-3" />
            <h3 className="text-xl font-semibold text-white">Flutter AppConfig Implementation</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-200 text-sm rounded-full">
              Dart
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <p className="text-blue-100 mb-4">
            The Flutter AppConfig class demonstrates secure configuration loading from JSON assets. 
            This pattern provides centralized configuration management with proper error handling.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: Shield, label: 'Secure Loading', desc: 'Asset-based configuration' },
              { icon: FileText, label: 'JSON Structure', desc: 'Environment separation' },
              { icon: Check, label: 'Error Handling', desc: 'Validation patterns' }
            ]?.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/5 rounded-lg p-3 text-center">
                <Icon className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <h4 className="text-white font-medium text-sm">{label}</h4>
                <p className="text-blue-200 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {configurationExamples?.map(({ id, title, description, code }) => (
            <div key={id} className="bg-slate-900/50 rounded-lg border border-white/10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div>
                  <h4 className="text-white font-medium">{title}</h4>
                  <p className="text-blue-200 text-sm">{description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(code, id)}
                  className="flex items-center px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                >
                  {copiedCode === id ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
              <div className="p-4">
                <pre className="text-sm text-blue-100 overflow-x-auto">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-teal-500/10 border border-teal-400/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Implementation Notes</h4>
          <ul className="text-teal-100 text-sm space-y-1">
            <li>• Place configuration files in <code className="bg-white/10 px-1 rounded">assets/env/</code> directory</li>
            <li>• Use environment-specific JSON files (dev.json, staging.json, production.json)</li>
            <li>• Implement proper validation for all configuration fields</li>
            <li>• Never commit sensitive values to version control</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FlutterImplementationPanel;