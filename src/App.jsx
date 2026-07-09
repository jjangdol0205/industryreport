import React, { useState, useEffect } from 'react';
import mockData from './mock_data.json';
import './index.css';

function App() {
  const [data, setData] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [activeSector, setActiveSector] = useState('All');

  useEffect(() => {
    // Sort data by date descending initially
    const sortedData = [...mockData].sort((a, b) => new Date(b.date) - new Date(a.date));
    setData(sortedData);
    
    const uniqueSectors = [...new Set(sortedData.map(item => item.sector))];
    setSectors(['All', ...uniqueSectors]);
  }, []);

  const filteredData = activeSector === 'All' 
    ? data 
    : data.filter(item => item.sector === activeSector);

  // Group by date
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">InsightDesk</div>
        <nav>
          {sectors.map(sector => (
            <div 
              key={sector}
              className={`nav-item ${activeSector === sector ? 'active' : ''}`}
              onClick={() => setActiveSector(sector)}
            >
              {sector === 'All' ? '전체 보기' : sector.replace(/_/g, ' ')}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>산업 트렌드 인사이트</h1>
          <p>애널리스트 리포트 기반 1~2페이지 심층 요약 대시보드</p>
        </header>

        <div className="timeline">
          {sortedDates.length === 0 && (
            <div className="empty-state">
              해당 분야의 리포트가 없습니다.
            </div>
          )}
          
          {sortedDates.map(date => (
            <section key={date} className="date-group">
              <h2 className="date-header">
                <span className="date-icon">📅</span> {date}
              </h2>
              <div className="cards-grid">
                {groupedData[date].map(item => (
                  <article key={item.id} className="card">
                    <div className="card-header">
                      <div>
                        <h3 className="card-title">{item.title}</h3>
                        <div className="card-meta">
                          <span className="source-tag">{item.source}</span>
                        </div>
                      </div>
                      {activeSector === 'All' && (
                        <div className="badge">{item.sector.replace(/_/g, ' ')}</div>
                      )}
                    </div>

                    <div className="insight-content">
                      {item.insights.map((insight, idx) => (
                        <p key={idx} className="insight-paragraph">{insight}</p>
                      ))}
                    </div>

                    {item.top_picks && item.top_picks.length > 0 && (
                      <div className="top-picks">
                        <span className="picks-label">Top Picks:</span>
                        <div className="picks-container">
                          {item.top_picks.map((pick, idx) => (
                            <div key={idx} className="pick-tag">{pick}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
