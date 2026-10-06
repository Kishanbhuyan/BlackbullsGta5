import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { EmberCanvas } from './components/EmberCanvas.js';
import { CustomCursor } from './components/CustomCursor.js';
import { Navbar } from './components/Navbar.js';
import { HeroSection } from './components/HeroSection.js';
import { StorySection } from './components/StorySection.js';
import { StreamersSection } from './components/StreamersSection.js';
import { LiveSection } from './components/LiveSection.js';
import { ClipsSection } from './components/ClipsSection.js';
import { MerchSection } from './components/MerchSection.js';
import { FanWallSection } from './components/FanWallSection.js';
import { Footer } from './components/Footer.js';
import { CartDrawer } from './components/CartDrawer.js';
import { AuthModal } from './components/AuthModal.js';
import { StreamerDashboardModal } from './components/StreamerDashboardModal.js';
import { AdminDashboardModal } from './components/AdminDashboardModal.js';
import { UserOrdersModal } from './components/UserOrdersModal.js';
import { MultiStreamPage } from './components/multistream/MultiStreamPage.js';
import { Streamer, LiveStatus, VideoClip, Product, GangStory, Comment } from './types.js';

function MainApp() {
  const { user } = useAuth();

  // Page Routing State
  const [currentPage, setCurrentPage] = useState<'home' | 'multistream'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash.startsWith('#multistream') || path.startsWith('/multistream')) {
        return 'multistream';
      }
    }
    return 'home';
  });

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash.startsWith('#multistream') || path.startsWith('/multistream')) {
        setCurrentPage('multistream');
      } else if (hash === '#home' || hash === '' || (!hash.startsWith('#multistream') && !path.startsWith('/multistream') && currentPage === 'multistream' && (hash.startsWith('#story') || hash.startsWith('#streamers') || hash.startsWith('#live') || hash.startsWith('#clips') || hash.startsWith('#merch') || hash.startsWith('#fan-wall')))) {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [currentPage]);

  const handleNavigate = (page: 'home' | 'multistream') => {
    setCurrentPage(page);
    if (page === 'multistream') {
      if (!window.location.hash.startsWith('#multistream')) {
        window.location.hash = '#multistream';
      }
    } else {
      if (window.location.hash.startsWith('#multistream')) {
        window.location.hash = '';
      }
    }
  };

  // Core Data States
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStatus[]>([]);
  const [videos, setVideos] = useState<VideoClip[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [story, setStory] = useState<GangStory | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // Selection & UI States
  const [selectedStreamerId, setSelectedStreamerId] = useState<string>('');
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [streamerDashboardOpen, setStreamerDashboardOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [userOrdersOpen, setUserOrdersOpen] = useState(false);

  // Fetch Streamers
  const loadStreamers = async () => {
    try {
      const res = await fetch('/api/streamers');
      if (res.ok) {
        const data = await res.json();
        setStreamers(data);
        if (data.length > 0 && !selectedStreamerId) {
          setSelectedStreamerId(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Error fetching streamers', err);
    }
  };

  // Fetch Live Streams (cached 60s)
  const loadLiveStreams = useCallback(async () => {
    setIsRefreshingLive(true);
    try {
      const res = await fetch('/api/live');
      if (res.ok) {
        const data = await res.json();
        setLiveStreams(data.streams || []);
      }
    } catch (err) {
      console.warn('Error fetching live streams', err);
    } finally {
      setIsRefreshingLive(false);
    }
  }, []);

  // Fetch Videos & Clips
  const loadVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.warn('Error fetching videos', err);
    }
  };

  // Fetch Products
  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.warn('Error fetching products', err);
    }
  };

  // Fetch Story
  const loadStory = async () => {
    try {
      const res = await fetch('/api/story');
      if (res.ok) {
        const data = await res.json();
        setStory(data);
      }
    } catch (err) {
      console.warn('Error fetching story', err);
    }
  };

  // Fetch Comments
  const loadComments = async () => {
    try {
      const res = await fetch('/api/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.warn('Error fetching comments', err);
    }
  };

  const loadAllData = () => {
    loadStreamers();
    loadLiveStreams();
    loadVideos();
    loadProducts();
    loadStory();
    loadComments();
  };

  useEffect(() => {
    loadAllData();
    // 60-second polling for live broadcast updates
    const interval = setInterval(() => {
      loadLiveStreams();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectStreamerForLive = (streamerId: string) => {
    setSelectedStreamerId(streamerId);
    const liveElem = document.getElementById('live');
    if (liveElem) {
      liveElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWatchLive = () => {
    const liveElem = document.getElementById('live');
    if (liveElem) {
      liveElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShopMerch = () => {
    const merchElem = document.getElementById('merch');
    if (merchElem) {
      merchElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080a] text-neutral-100 flex flex-col font-sans">
      {/* Animated GTA 5 RP embers backdrop */}
      <EmberCanvas />

      {/* Black Bulls Syndicate Custom Interactive Crosshair Cursor */}
      <CustomCursor />

      {/* Top Bar Navigation (3-Zone Contract) */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenStreamerDashboard={() => setStreamerDashboardOpen(true)}
        onOpenAdminDashboard={() => setAdminDashboardOpen(true)}
        onOpenUserOrders={() => setUserOrdersOpen(true)}
        currentPage={currentPage}
        onNavigateToPage={handleNavigate}
      />

      {currentPage === 'multistream' ? (
        <MultiStreamPage onBackToHome={() => handleNavigate('home')} liveStreams={liveStreams} />
      ) : (
        <>
          {/* Public Page Sections in Exact Order */}
          <main className="relative z-10 flex-1">
            {/* A. Hero Section */}
            <HeroSection
              streamers={streamers}
              liveStreams={liveStreams}
              onWatchLive={handleWatchLive}
              onShopMerch={handleShopMerch}
            />

            {/* B. Our Story */}
            <StorySection story={story} />

            {/* C. Streamers Profiles */}
            <StreamersSection
              streamers={streamers}
              liveStreams={liveStreams}
              onSelectStreamerForLive={handleSelectStreamerForLive}
            />

            {/* D. Live Streams Hub (YouTube & Kick) */}
            <LiveSection
              streamers={streamers}
              liveStreams={liveStreams}
              selectedStreamerId={selectedStreamerId || (streamers[0]?.id ?? '')}
              onSelectStreamer={setSelectedStreamerId}
              onRefreshLive={loadLiveStreams}
              isRefreshing={isRefreshingLive}
              onOpenAuth={() => setAuthModalOpen(true)}
            />

            {/* E. Highlights & Clips */}
            <ClipsSection videos={videos} streamers={streamers} />

            {/* F. Merchandise Store */}
            <MerchSection products={products} />

            {/* G. Fan Wall Community */}
            <FanWallSection
              comments={comments}
              streamers={streamers}
              onCommentSubmitted={newComment => setComments(prev => [newComment, ...prev])}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </main>

          {/* H. Footer with Exact Verbatim Legal Disclaimer */}
          <Footer streamers={streamers} />
        </>
      )}

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenUserOrders={() => setUserOrdersOpen(true)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Streamer Dashboard Modal */}
      <StreamerDashboardModal
        isOpen={streamerDashboardOpen}
        onClose={() => setStreamerDashboardOpen(false)}
        streamers={streamers}
        onStreamerUpdated={updated => {
          setStreamers(prev => prev.map(s => s.id === updated.id ? updated : s));
        }}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
        streamers={streamers}
        products={products}
        story={story}
        onRefreshAllData={loadAllData}
      />

      {/* User Orders History Modal */}
      <UserOrdersModal
        isOpen={userOrdersOpen}
        onClose={() => setUserOrdersOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
