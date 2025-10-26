import { isEquitiesMarketClosed, isCryptoFxAllowed } from '@/lib/market/utils';

export default function MarketClosedBanner() {
  if (!isEquitiesMarketClosed()) return null;

  return (
    <div className="w-full rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
      <div className="font-semibold">Marché actions fermé</div>
      <div className="text-sm">
        Les bourses actions sont fermées (week-end / fermeture). Les flux temps réel actions sont en pause.
        {isCryptoFxAllowed() ? ' Les flux crypto/FX restent actifs.' : ''}
      </div>
    </div>
  );
}