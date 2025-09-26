import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpDown, ExternalLink } from 'lucide-react';

const PositionsTable = ({ positions }) => {
  const [sortField, setSortField] = useState('marketValue');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPositions = [...(positions || [])]?.sort((a, b) => {
    let aVal = a?.[sortField];
    let bVal = b?.[sortField];
    
    if (typeof aVal === 'string') {
      aVal = aVal?.toLowerCase();
      bVal = bVal?.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(value || 0);
  };

  const formatPercent = (value) => {
    return `${(value || 0)?.toFixed(2)}%`;
  };

  const SortIcon = ({ field }) => (
    <ArrowUpDown 
      className={`h-4 w-4 inline ml-1 ${
        sortField === field ? 'text-blue-500' : 'text-gray-400'
      }`} 
    />
  );

  if (!positions || positions?.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Current Positions</h2>
        <div className="text-center text-gray-400 py-12">
          No positions found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Current Positions</h2>
        <div className="text-sm text-gray-400">
          {positions?.length} position{positions?.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                <button 
                  onClick={() => handleSort('symbol')}
                  className="flex items-center hover:text-white"
                >
                  Symbol <SortIcon field="symbol" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                <button 
                  onClick={() => handleSort('quantity')}
                  className="flex items-center justify-end hover:text-white"
                >
                  Quantity <SortIcon field="quantity" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                <button 
                  onClick={() => handleSort('avgEntryPrice')}
                  className="flex items-center justify-end hover:text-white"
                >
                  Avg Price <SortIcon field="avgEntryPrice" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                <button 
                  onClick={() => handleSort('currentPrice')}
                  className="flex items-center justify-end hover:text-white"
                >
                  Current Price <SortIcon field="currentPrice" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                <button 
                  onClick={() => handleSort('marketValue')}
                  className="flex items-center justify-end hover:text-white"
                >
                  Market Value <SortIcon field="marketValue" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                <button 
                  onClick={() => handleSort('unrealizedPnL')}
                  className="flex items-center justify-end hover:text-white"
                >
                  Unrealized P&L <SortIcon field="unrealizedPnL" />
                </button>
              </th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                <button 
                  onClick={() => handleSort('duration')}
                  className="flex items-center justify-end hover:text-white"
                >
                  Duration <SortIcon field="duration" />
                </button>
              </th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPositions?.map((position) => {
              const pnlColor = position?.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500';
              const pnlIcon = position?.unrealizedPnL >= 0 ? 
                <TrendingUp className="h-4 w-4" /> : 
                <TrendingDown className="h-4 w-4" />;

              return (
                <tr key={position?.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {position?.logoUrl && (
                        <img 
                          src={position?.logoUrl} 
                          alt={position?.symbol}
                          className="h-8 w-8 rounded mr-3"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div>
                        <div className="font-medium text-white">{position?.symbol}</div>
                        <div className="text-sm text-gray-400 truncate max-w-32">
                          {position?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-white">
                    {position?.quantity?.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right text-white">
                    {formatCurrency(position?.avgEntryPrice)}
                  </td>
                  <td className="py-4 px-4 text-right text-white">
                    {formatCurrency(position?.currentPrice)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-white">
                    {formatCurrency(position?.marketValue)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className={`flex items-center justify-end ${pnlColor}`}>
                      {pnlIcon}
                      <div className="ml-2">
                        <div className="font-medium">
                          {formatCurrency(position?.unrealizedPnL)}
                        </div>
                        <div className="text-sm">
                          {formatPercent(position?.unrealizedPnLPercent)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-400">
                    {position?.duration}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="text-blue-500 hover:text-blue-400">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsTable;