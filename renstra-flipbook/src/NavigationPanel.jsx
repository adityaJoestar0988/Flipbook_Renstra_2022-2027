import { useState, useMemo } from "react";
import { outlineData, tablesAndFiguresData } from "./navigationData";

export default function NavigationPanel({ isOpen, onClose, onSelectPage, currentPage }) {
  const [activeTab, setActiveTab] = useState("outline"); // "outline" | "tables"
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    "bab-1": true,
    "bab-2": true,
    "bab-3": true,
    "bab-4": true,
  });

  const toggleSection = (id, e) => {
    e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter outline based on search
  const filteredOutline = useMemo(() => {
    if (!searchQuery.trim()) return outlineData;
    const q = searchQuery.toLowerCase();

    return outlineData
      .map((item) => {
        const matchesParent = item.title.toLowerCase().includes(q);
        const matchedChildren = item.children
          ? item.children.filter((child) => child.title.toLowerCase().includes(q))
          : [];

        if (matchesParent) {
          return item;
        } else if (matchedChildren.length > 0) {
          return {
            ...item,
            children: matchedChildren,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [searchQuery]);

  // Filter tables and figures based on search
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tablesAndFiguresData.tables;
    const q = searchQuery.toLowerCase();
    return tablesAndFiguresData.tables.filter((item) => item.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredFigures = useMemo(() => {
    if (!searchQuery.trim()) return tablesAndFiguresData.figures;
    const q = searchQuery.toLowerCase();
    return tablesAndFiguresData.figures.filter((item) => item.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleItemClick = (page) => {
    onSelectPage(page);
    // On small screens, close panel automatically after selection
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className="nav-backdrop" onClick={onClose} />}

      <aside className={`nav-panel ${isOpen ? "open" : ""}`} aria-label="Navigasi Dokumen">
        {/* Header */}
        <div className="nav-header">
          <div className="nav-title-group">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 6h16M4 12h16M4 18h12" />
            </svg>
            <span className="nav-title">Navigasi Dokumen</span>
          </div>
          <button className="nav-close-btn" onClick={onClose} title="Tutup Navigasi">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="nav-search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="nav-search-input"
            placeholder="Cari bab, sub-bab, tabel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        {/* Tab switch */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "outline" ? "active" : ""}`}
            onClick={() => setActiveTab("outline")}
          >
            📑 Daftar Isi
          </button>
          <button
            className={`nav-tab ${activeTab === "tables" ? "active" : ""}`}
            onClick={() => setActiveTab("tables")}
          >
            📊 Tabel & Gambar
          </button>
        </div>

        {/* Content List */}
        <div className="nav-content">
          {activeTab === "outline" && (
            <div className="outline-list">
              {filteredOutline.length === 0 ? (
                <div className="nav-empty">Tidak ada judul yang cocok</div>
              ) : (
                filteredOutline.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedSections[item.id] || searchQuery.length > 0;
                  const isActive = currentPage === item.page;

                  return (
                    <div key={item.id} className="outline-group">
                      <div
                        className={`outline-item level-1 ${isActive ? "active" : ""}`}
                        onClick={() => handleItemClick(item.page)}
                      >
                        {hasChildren ? (
                          <button
                            className="expand-btn"
                            onClick={(e) => toggleSection(item.id, e)}
                            title={isExpanded ? "Ciutkan" : "Bentangkan"}
                          >
                            <svg
                              className={`chevron ${isExpanded ? "expanded" : ""}`}
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        ) : (
                          <span className="expand-placeholder" />
                        )}

                        <span className="item-title">{item.title}</span>
                        <span className="item-page">Hal {item.page}</span>
                      </div>

                      {hasChildren && isExpanded && (
                        <div className="outline-children">
                          {item.children.map((child) => {
                            const isChildActive = currentPage === child.page;
                            return (
                              <div
                                key={child.id}
                                className={`outline-item level-2 ${isChildActive ? "active" : ""}`}
                                onClick={() => handleItemClick(child.page)}
                              >
                                <span className="child-bullet">•</span>
                                <span className="item-title">{child.title}</span>
                                <span className="item-page">Hal {child.page}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "tables" && (
            <div className="tables-list">
              <div className="section-header">DAFTAR TABEL</div>
              {filteredTables.length === 0 ? (
                <div className="nav-empty-sub">Tidak ditemukan tabel</div>
              ) : (
                filteredTables.map((t) => (
                  <div
                    key={t.id}
                    className={`outline-item level-table ${currentPage === t.page ? "active" : ""}`}
                    onClick={() => handleItemClick(t.page)}
                  >
                    <span className="table-icon">📋</span>
                    <span className="item-title">{t.title}</span>
                    <span className="item-page">Hal {t.page}</span>
                  </div>
                ))
              )}

              <div className="section-header" style={{ marginTop: "16px" }}>
                DAFTAR GAMBAR
              </div>
              {filteredFigures.length === 0 ? (
                <div className="nav-empty-sub">Tidak ditemukan gambar</div>
              ) : (
                filteredFigures.map((g) => (
                  <div
                    key={g.id}
                    className={`outline-item level-table ${currentPage === g.page ? "active" : ""}`}
                    onClick={() => handleItemClick(g.page)}
                  >
                    <span className="table-icon">🖼️</span>
                    <span className="item-title">{g.title}</span>
                    <span className="item-page">Hal {g.page}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

