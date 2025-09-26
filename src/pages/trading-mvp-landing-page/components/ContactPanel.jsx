import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';

export default function ContactPanel() {
  const contacts = [
    { label: "Site", value: "https://trading-mvp.com", type: "link" },
    { label: "API", value: "https://api.trading-mvp.com", type: "link" },
    { label: "(Ajouter e-mail / réseau social ici)", value: "", type: "placeholder" }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center mb-4">
        <Mail className="h-6 w-6 text-orange-400 mr-3" />
        <h2 className="text-2xl font-bold text-orange-400">
          Contact
        </h2>
      </div>
      <ul className="space-y-3">
        {contacts?.map((contact, index) => (
          <li key={index} className="flex items-start text-white">
            <span className="text-teal-400 mr-3 mt-1">•</span>
            <div className="flex items-center space-x-2">
              {contact?.type === "link" ? (
                <>
                  <span className="text-gray-100">{contact?.label}:</span>
                  <a 
                    href={contact?.value} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200 flex items-center"
                  >
                    {contact?.value}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </>
              ) : (
                <span className="text-gray-400 italic">{contact?.label}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}