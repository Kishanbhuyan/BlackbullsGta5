import React, { useState, useEffect } from 'react';
import { X, Heart, Search, Radio, Edit3, Save, User, Youtube, Instagram, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Comment, Streamer } from '../types.js';

interface StreamerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamers: Streamer[];
  onStreamerUpdated: (updated: Streamer) => void;
}

export function StreamerDashboardModal({
  isOpen,
  onClose,
  streamers,
  onStreamerUpdated,
}: StreamerDashboardModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'comments' | 'profile'>('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Edit State
  const currentStreamer = streamers.find(s => s.id === user?.streamerId) || streamers[0];
  const [bio, setBio] = useState(currentStreamer?.bio || '');
  const [youtubeUrl, setYoutubeUrl] = useState(currentStreamer?.youtubeUrl || '');
  const [kickUrl, setKickUrl] = useState(currentStreamer?.kickUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(currentStreamer?.instagramUrl || '');
  const [photo, setPhoto] = useState(currentStreamer?.photo || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (currentStreamer) {
      setBio(currentStreamer.bio);
      setYoutubeUrl(currentStreamer.youtubeUrl);
      setKickUrl(currentStreamer.kickUrl);
      setInstagramUrl(currentStreamer.instagramUrl);
      setPhoto(currentStreamer.photo);
    }
  }, [currentStreamer]);

  const fetchComments = async () => {
    if (!currentStreamer) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('bb_token');
      const res = await fetch(`/api/comments/streamer?streamerId=${currentStreamer.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.warn('Failed to fetch streamer comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, currentStreamer?.id]);

  const handleToggleFavorite = async (commentId: string) => {
    try {
      const token = localStorage.getItem('bb_token');
      const res = await fetch(`/api/comments/${commentId}/favorite`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (res.ok) {
        const updatedComment = await res.json();
        setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      }
    } catch (err) {
      console.warn('Failed to toggle favorite', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStreamer) return;
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem('bb_token');
      const res = await fetch(`/api/streamers/${currentStreamer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          bio,
          youtubeUrl,
          kickUrl,
          instagramUrl,
          photo
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      onStreamerUpdated(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Error updating profile');
    }
  };

  if (!isOpen) return null;

  const filteredComments = comments.filter(c =>
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-[#0e0e14] shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-display text-xl uppercase tracking-wider text-white">
                Streamer Command Dashboard
              </h3>
              <p className="text-xs text-neutral-400">
                Managing: <strong className="text-white">{currentStreamer?.name}</strong> ({currentStreamer?.inGameCharacter})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'comments'
                ? 'border-red-600 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Fan Shoutouts ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-red-600 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Edit Profile & Socials
          </button>
        </div>

        {/* Tab 1: Fan Comments */}
        {activeTab === 'comments' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search shoutouts by fan name or message keyword..."
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredComments.map(comment => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
                        alt={comment.userName}
                        className="h-8 w-8 rounded-full border border-neutral-700 bg-neutral-800"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{comment.userName}</h4>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFavorite(comment.id)}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                        comment.isFavorite
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                      title={comment.isFavorite ? 'Unfavorite' : 'Favorite shoutout'}
                    >
                      <Heart className={`h-3.5 w-3.5 ${comment.isFavorite ? 'fill-white' : ''}`} />
                      <span>{comment.isFavorite ? 'Favorited' : 'Favorite'}</span>
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-neutral-200 leading-relaxed pl-10">
                    {comment.content}
                  </p>
                </div>
              ))}

              {filteredComments.length === 0 && (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No fan comments found matching your query.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Edit Profile & Socials */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 space-y-4">
            {saveSuccess && (
              <div className="flex items-center gap-2 rounded border border-emerald-800/80 bg-emerald-950/60 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>Profile updated successfully! Changes are live across the site.</span>
              </div>
            )}
            {saveError && (
              <div className="rounded border border-red-800/80 bg-red-950/60 p-3 text-xs text-red-300">
                {saveError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                Profile Avatar / Headshot URL
              </label>
              <input
                type="url"
                required
                value={photo}
                onChange={e => setPhoto(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                Streamer Bio & Roleplay Persona
              </label>
              <textarea
                rows={3}
                required
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-3 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  YouTube Channel Link
                </label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
                  <input
                    type="url"
                    required
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                  Kick Channel Link
                </label>
                <div className="relative">
                  <Radio className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
                  <input
                    type="url"
                    required
                    value={kickUrl}
                    onChange={e => setKickUrl(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1">
                Instagram Link
              </label>
              <div className="relative">
                <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-pink-400" />
                <input
                  type="url"
                  required
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-md bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500 shadow-md shadow-red-950/60"
              >
                <Save className="h-4 w-4" />
                <span>Save Streamer Profile</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
