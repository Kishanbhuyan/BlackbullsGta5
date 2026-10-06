import React, { useState } from 'react';
import { MessageSquare, Heart, Send, Sparkles, User, Flame } from 'lucide-react';
import { Comment, Streamer } from '../types.js';
import { useAuth } from '../context/AuthContext.js';

interface FanWallSectionProps {
  comments: Comment[];
  streamers: Streamer[];
  onCommentSubmitted: (comment: Comment) => void;
  onOpenAuth: () => void;
}

export function FanWallSection({
  comments,
  streamers,
  onCommentSubmitted,
  onOpenAuth,
}: FanWallSectionProps) {
  const { user } = useAuth();
  const [selectedStreamerId, setSelectedStreamerId] = useState<string>(
    streamers[0]?.id || 'streamer_motabhai'
  );
  const [filterStreamer, setFilterStreamer] = useState<string>('all');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!content.trim()) {
      setError('Please enter a comment message');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('bb_token');
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({
          streamerId: selectedStreamerId,
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      onCommentSubmitted(data);
      setContent('');
      setSuccessMessage('Your shoutout has been posted on the Fan Wall!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComments = comments.filter(c => {
    if (filterStreamer === 'all') return true;
    return c.streamerId === filterStreamer;
  });

  return (
    <section id="fan-wall" className="relative border-b border-neutral-800/80 py-24 bg-[#08080c]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">
              <MessageSquare className="h-4 w-4" />
              <span>Voice of the Syndicate</span>
            </div>
            <h2 className="font-display text-4xl sm:text-6xl text-white tracking-wide uppercase">
              The Fan Wall
            </h2>
          </div>
          <p className="max-w-md text-neutral-400 text-sm leading-relaxed">
            Leave your shoutouts, roleplay theories, and stream reactions directly for Mota Bhai and Thunderbolt Gaming.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Comment Submission Card */}
          <div className="lg:col-span-4 rounded-xl border border-neutral-800 bg-[#0e0e14] p-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Send className="h-4 w-4 text-red-500" />
              <span>Post a Shoutout</span>
            </h3>

            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded border border-red-800/80 bg-red-950/60 p-2.5 text-xs text-red-300">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="rounded border border-emerald-800/80 bg-emerald-950/60 p-2.5 text-xs text-emerald-300">
                    {successMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Address To Streamer
                  </label>
                  <select
                    value={selectedStreamerId}
                    onChange={e => setSelectedStreamerId(e.target.value)}
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-white focus:border-red-500 focus:outline-none"
                  >
                    {streamers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.inGameCharacter})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your reaction to yesterday's police chase or RP storyline..."
                    className="w-full rounded-md border border-neutral-800 bg-neutral-900 p-3 text-xs text-white placeholder-neutral-500 focus:border-red-500 focus:outline-none resize-none"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                    <span>Posting as {user.name}</span>
                    <span>{content.length}/500</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-red-500 shadow-md shadow-red-950/50 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{submitting ? 'Broadcasting...' : 'Publish to Wall'}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-red-500 mb-3">
                  <User className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Join the Syndicate</h4>
                <p className="text-xs text-neutral-400 mb-4 max-w-xs mx-auto">
                  Log in as a fan to send messages to the streamers and get your shoutouts featured.
                </p>
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2.5 rounded-md bg-red-600 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-500 transition-colors"
                >
                  Sign In / 1-Click Demo
                </button>
              </div>
            )}
          </div>

          {/* Comments Feed */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Filter by recipient streamer */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-lg border border-neutral-800 w-fit mb-2">
              <button
                onClick={() => setFilterStreamer('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  filterStreamer === 'all'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Messages
              </button>
              {streamers.map(s => (
                <button
                  key={s.id}
                  onClick={() => setFilterStreamer(s.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    filterStreamer === s.id
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  For {s.name}
                </button>
              ))}
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {filteredComments.map(comment => (
                <div
                  key={comment.id}
                  className="rounded-xl border border-neutral-800/90 bg-[#0e0e14] p-5 transition-all hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`}
                        alt={comment.userName}
                        className="h-9 w-9 rounded-full border border-neutral-700 bg-neutral-800 object-cover"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{comment.userName}</h4>
                        {/* Zero-Pill text metadata with separators */}
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                          <span>For <strong className="text-red-400">{comment.streamerName}</strong></span>
                          <span>·</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {comment.isFavorite && (
                      <span className="flex items-center gap-1 rounded bg-red-950/80 px-2 py-0.5 text-[11px] font-semibold text-red-300 border border-red-900/60">
                        <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                        <span>Favorited by Streamer</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed pl-12">
                    {comment.content}
                  </p>
                </div>
              ))}

              {filteredComments.length === 0 && (
                <div className="py-12 text-center text-neutral-500">
                  <p className="text-xs">No shoutouts yet for this streamer.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
