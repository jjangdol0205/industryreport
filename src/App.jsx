import React, { useState, useEffect, useCallback } from 'react';
import mockData from './mock_data.json';
import './index.css';

// 마크다운 볼드(**text**) 파싱
function parseBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

// 날짜 포맷: "2026-07-10" → "2026년 7월 10일 (목)"
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = days[date.getDay()];
  return `${y}년 ${m}월 ${d}일 (${day})`;
}

// 개별 카드 컴포넌트 (접기/펼치기 상태 관리)
function ReportCard({ item, showSectorBadge }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_COUNT = 3;

  const visibleInsights = expanded
    ? item.insights
    : item.insights.slice(0, PREVIEW_COUNT);

  const hasMore = item.insights.length > PREVIEW_COUNT;

  return (
    <article className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{item.title}</h3>
          <div className="card-meta">
            <span className="source-tag">{item.source}</span>
          </div>
        </div>
        {showSectorBadge && (
          <div className="badge">{item.sector.replace(/_/g, ' ')}</div>
        )}
      </div>

      <div className="insight-content">
        {visibleInsights.map((insight, idx) => (
          <p key={idx} className="insight-paragraph">
            {parseBold(insight)}
          </p>
        ))}
      </div>

      {hasMore && (
        <button
          className={`expand-button ${expanded ? 'expanded' : ''}`}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded
            ? `▲ 접기`
            : `▼ 더 보기 (${item.insights.length - PREVIEW_COUNT}개 더)`}
        </button>
      )}

      {item.top_picks && item.top_picks.length > 0 && (
        <div className="top-picks">
          <span className="picks-label">최선호주:</span>
          <div className="picks-container">
            {item.top_picks.map((pick, idx) => (
              <div key={idx} className="pick-tag">{pick}</div>
            ))}
          </div>
        </div>
      )}

      {item.pdf_url && (
        <div className="pdf-download">
          <a
            href={`${import.meta.env.BASE_URL}${item.pdf_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-button"
            download
          >
            📥 원본 리포트 다운로드 (PDF)
          </a>
        </div>
      )}
    </article>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [activeSector, setActiveSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const sortedData = [...mockData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setData(sortedData);

    const uniqueSectors = [...new Set(sortedData.map(item => item.sector))];
    setSectors(['All', ...uniqueSectors]);

    // 클린업: 메모리 누수 방지
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // 섹터 + 검색어 필터링
  const filteredData = data.filter(item => {
    const matchesSector = activeSector === 'All' || item.sector === activeSector;
    if (!searchQuery.trim()) return matchesSector;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.insights.some(ins => ins.toLowerCase().includes(q)) ||
      (item.top_picks && item.top_picks.some(p => p.toLowerCase().includes(q)));

    return matchesSector && matchesSearch;
  });

  // 날짜별 그룹핑
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedData).sort(
    (a, b) => new Date(b) - new Date(a)
  );

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
          <div className="header-inner">
            <div>
              <h1>산업 트렌드 인사이트</h1>
              <p>애널리스트 리포트 기반 1~2페이지 심층 요약 대시보드</p>
            </div>
            {deferredPrompt && (
              <button className="install-button" onClick={handleInstallClick}>
                📱 앱으로 설치하기
              </button>
            )}
          </div>

          {/* 검색창 */}
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="종목명, 키워드로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </header>

        <div className="timeline">
          {sortedDates.length === 0 && (
            <div className="empty-state">
              {searchQuery
                ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                : '해당 분야의 리포트가 없습니다.'}
            </div>
          )}

          {sortedDates.map(date => (
            <section key={date} className="date-group">
              <h2 className="date-header">
                <span className="date-icon">📅</span>
                {formatDate(date)}
              </h2>
              <div className="cards-grid">
                {groupedData[date].map(item => (
                  <ReportCard
                    key={item.id}
                    item={item}
                    showSectorBadge={activeSector === 'All'}
                  />
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
