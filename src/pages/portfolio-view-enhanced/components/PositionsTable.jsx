import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpDown, Star } from 'lucide-react';

const PositionsTable = ({ positions, topPerformers, loading }) => {
  const [sortField, setSortField] = useState('unrealized_pnl_percent');
  const [sortDirection, setSortDirection] = useState('desc');

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)]?.map((_, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                <div className="h-3 bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!positions?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">📊</div>
        <div>No positions found</div>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPositions = [...positions]?.sort((a, b) => {
    let aValue = a?.[sortField] || 0;
    let bValue = b?.[sortField] || 0;

    // Handle string sorting for symbol and name
    if (sortField === 'assets.symbol' || sortField === 'assets.name') {
      aValue = a?.assets?.[sortField?.split('.')?.[1]]?.toLowerCase() || '';
      bValue = b?.assets?.[sortField?.split('.')?.[1]]?.toLowerCase() || '';
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value || 0);
  };

  const formatPercentage = (value) => {
    const isPositive = (value || 0) >= 0;
    return {
      value: `${isPositive ? '+' : ''}${(value || 0)?.toFixed(2)}%`,
      isPositive
    };
  };

  const isTopPerformer = (positionId) => {
    return topPerformers?.winners?.some(winner => winner?.id === positionId) ||
           topPerformers?.losers?.some(loser => loser?.id === positionId);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    return sortDirection === 'asc' ? 
      <TrendingUp className="h-4 w-4 text-blue-400" /> : 
      <TrendingDown className="h-4 w-4 text-blue-400" />;
  };

  const columns = [
    { field: 'assets.symbol', label: 'Asset', sortable: true },
    { field: 'quantity', label: 'Quantity', sortable: true },
    { field: 'current_price', label: 'Price', sortable: true },
    { field: 'market_value', label: 'Value', sortable: true },
    { field: 'unrealized_pnl', label: 'P&L ($)', sortable: true },
    { field: 'unrealized_pnl_percent', label: 'P&L (%)', sortable: true }
  ];

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              {columns?.map(column => (
                <th
                  key={column?.field}
                  className={`text-left py-3 px-4 text-sm font-medium text-gray-300 ${
                    column?.sortable ? 'cursor-pointer hover:text-white' : ''
                  }`}
                  onClick={() => column?.sortable && handleSort(column?.field)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column?.label}</span>
                    {column?.sortable && getSortIcon(column?.field)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPositions?.map(position => {
              const pnlPercent = formatPercentage(position?.unrealized_pnl_percent);
              const isWinner = topPerformers?.winners?.some(w => w?.id === position?.id);
              const isLoser = topPerformers?.losers?.some(l => l?.id === position?.id);
              
              return (
                <tr
                  key={position?.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {position?.assets?.logo_url && (
                        <img 
                          src={position?.assets?.logo_url} 
                          alt={position?.assets?.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{position?.assets?.symbol}</span>
                          {isTopPerformer(position?.id) && (
                            <Star className={`h-4 w-4 ${isWinner ? 'text-green-400' : 'text-red-400'}`} />
                          )}
                        </div>
                        <div className="text-sm text-gray-400">{position?.assets?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-white">
                    {(position?.quantity || 0)?.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-white">
                    ${(position?.current_price || 0)?.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-white">
                    {formatCurrency(position?.market_value)}
                  </td>
                  <td className={`py-4 px-4 font-medium ${
                    (position?.unrealized_pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(position?.unrealized_pnl)}
                  </td>
                  <td className={`py-4 px-4 font-medium ${
                    pnlPercent?.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {pnlPercent?.value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {sortedPositions?.map(position => {
          const pnlPercent = formatPercentage(position?.unrealized_pnl_percent);
          const isWinner = topPerformers?.winners?.some(w => w?.id === position?.id);
          const isLoser = topPerformers?.losers?.some(l => l?.id === position?.id);
          
          return (
            <div key={position?.id} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {position?.assets?.logo_url && (
                    <img 
                      src={position?.assets?.logo_url} 
                      alt={position?.assets?.name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{position?.assets?.symbol}</span>
                      {isTopPerformer(position?.id) && (
                        <Star className={`h-4 w-4 ${isWinner ? 'text-green-400' : 'text-red-400'}`} />
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{position?.assets?.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {formatCurrency(position?.market_value)}
                  </div>
                  <div className={`text-sm font-medium ${
                    pnlPercent?.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {pnlPercent?.value}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Quantity</div>
                  <div className="text-white font-medium">{(position?.quantity || 0)?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Price</div>
                  <div className="text-white font-medium">${(position?.current_price || 0)?.toFixed(2)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Summary */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400">Total Positions</div>
            <div className="text-lg font-bold text-white">{positions?.length || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Winners</div>
            <div className="text-lg font-bold text-green-400">{topPerformers?.winners?.length || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Losers</div>
            <div className="text-lg font-bold text-red-400">{topPerformers?.losers?.length || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Avg. Position</div>
            <div className="text-lg font-bold text-blue-400">
              {formatCurrency(
                positions?.reduce((sum, pos) => sum + (pos?.market_value || 0), 0) / (positions?.length || 1)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionsTable;