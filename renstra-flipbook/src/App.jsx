import { forwardRef, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import pages from "./pages.json";
import NavigationPanel from "./NavigationPanel";
import "./App.css";

// Wajib forwardRef, itu syarat react-pageflip.
const Page = forwardRef(({ src, n, near }, ref) => (
  <div ref={ref} className="page">
    {near && <img src={src} alt={`Halaman ${n}`} draggable={false} />}
  </div>
));
Page.displayName = "Page";

export default function App() {
  const book = useRef(null);
  const [current, setCurrent] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth >= 1200;
  });

  const flip = () => book.current?.pageFlip();

  const jumpToPage = (pageNum) => {
    const targetIndex = pageNum - 1;
    if (targetIndex >= 0 && targetIndex < pages.length && book.current) {
      book.current.pageFlip().turnToPage(targetIndex);
    }
  };

  return (
    <div className={`app-container ${isNavOpen ? "nav-expanded" : ""}`}>
      {/* Sidebar Navigasi Index */}
      <NavigationPanel
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        onSelectPage={jumpToPage}
        currentPage={current + 1}
      />

      <div className="main-content">
        {/* Top Navbar */}
        <header className="topbar">
          <button
            className="toggle-nav-btn"
            onClick={() => setIsNavOpen((prev) => !prev)}
            title="Buka/Tutup Navigasi Dokumen"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>Daftar Isi & Navigasi</span>
          </button>

          <h1 className="doc-title">RENSTRA UKSW 2022 - 2027</h1>

          <div className="header-page-info">
            Halaman {current + 1} dari {pages.length}
          </div>
        </header>

        {/* Viewer Flipbook */}
        <main className="viewer">
          <div className="book-wrapper">
            <HTMLFlipBook
              ref={book}
              width={595}
              height={850}
              size="stretch"
              minWidth={280}
              maxWidth={700}
              minHeight={400}
              maxHeight={1000}
              showCover
              maxShadowOpacity={0.5}
              mobileScrollSupport={false}
              onFlip={(e) => setCurrent(e.data)}
              className="book"
            >
              {pages.map((src, i) => (
                // Hanya muat gambar di sekitar halaman aktif supaya ringan.
                <Page key={src} src={src} n={i + 1} near={Math.abs(i - current) <= 4} />
              ))}
            </HTMLFlipBook>
          </div>

          {/* Controls Bawah */}
          <div className="controls">
            <button onClick={() => flip()?.flipPrev()}>‹ Sebelumnya</button>
            <span className="page-counter">
              {current + 1} / {pages.length}
            </span>
            <button onClick={() => flip()?.flipNext()}>Berikutnya ›</button>
            <input
              type="number"
              min="1"
              max={pages.length}
              placeholder="Ke hal."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  jumpToPage(Number(e.target.value));
                }
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
