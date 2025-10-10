export default function Agents() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Agents IA</h1>
      <p>Chef Orchestra + IA régionales (Europe/US/Asie).</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 16,
        marginTop: 20 
      }}>
        <div style={{ 
          padding: 16, 
          border: '1px solid #333', 
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <h3>🎼 Chef Orchestra</h3>
          <p style={{ opacity: 0.8 }}>Agent coordinateur principal</p>
          <div style={{ 
            background: '#2ecc71', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: 4, 
            fontSize: '12px',
            display: 'inline-block'
          }}>
            ACTIF
          </div>
        </div>
        
        <div style={{ 
          padding: 16, 
          border: '1px solid #333', 
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <h3>🇪🇺 Agent Europe</h3>
          <p style={{ opacity: 0.8 }}>Trading européen</p>
          <div style={{ 
            background: '#f1c40f', 
            color: 'black', 
            padding: '2px 8px', 
            borderRadius: 4, 
            fontSize: '12px',
            display: 'inline-block'
          }}>
            ATTENTE
          </div>
        </div>
        
        <div style={{ 
          padding: 16, 
          border: '1px solid #333', 
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <h3>🇺🇸 Agent US</h3>
          <p style={{ opacity: 0.8 }}>Trading américain</p>
          <div style={{ 
            background: '#2ecc71', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: 4, 
            fontSize: '12px',
            display: 'inline-block'
          }}>
            ACTIF
          </div>
        </div>
        
        <div style={{ 
          padding: 16, 
          border: '1px solid #333', 
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <h3>🌏 Agent Asie</h3>
          <p style={{ opacity: 0.8 }}>Trading asiatique</p>
          <div style={{ 
            background: '#e74c3c', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: 4, 
            fontSize: '12px',
            display: 'inline-block'
          }}>
            ARRÊTÉ
          </div>
        </div>
        
        <div style={{ 
          padding: 16, 
          border: '1px solid #333', 
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <h3>📊 Agent Analytics</h3>
          <p style={{ opacity: 0.8 }}>Analyse de données</p>
          <div style={{ 
            background: '#2ecc71', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: 4, 
            fontSize: '12px',
            display: 'inline-block'
          }}>
            ACTIF
          </div>
        </div>
        
        <div style={{ 
          padding: 16, 
          border: '1px solid #333', 
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <h3>🚨 Agent Risk</h3>
          <p style={{ opacity: 0.8 }}>Contrôle des risques</p>
          <div style={{ 
            background: '#2ecc71', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: 4, 
            fontSize: '12px',
            display: 'inline-block'
          }}>
            ACTIF
          </div>
        </div>
      </div>
    </main>
  );
}