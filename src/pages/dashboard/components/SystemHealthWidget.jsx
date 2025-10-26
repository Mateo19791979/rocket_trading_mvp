import SafeErrorBoundary from '../../../components/SafeErrorBoundary';
import { useSafeQuery } from '@/hooks/useSafeQuery';
import { fetchJSON } from '@/lib/fetchJSON';

function SimpleHealthWidget(){
  const { loading, data, error } = useSafeQuery(()=> fetchJSON('/internal/health'), []);

  if (loading) return <div className="text-xs text-gray-500">vérification…</div>;
  if (error) return <div className="text-xs text-amber-700">santé dégradée</div>;
  return <div className="text-xs text-emerald-700">OK ({data?.ts})</div>;
}

export default function SystemHealthWidget(){
  return (
    <SafeErrorBoundary>
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Système</h3>
        <SimpleHealthWidget />
      </div>
    </SafeErrorBoundary>
  );
}