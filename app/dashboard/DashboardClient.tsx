'use client';

/**
 * Dashboard Client Component
 * Main page showing daily poll and community content
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PollCard from '@/components/PollCard';
import CommunityCards from '@/components/CommunityCards';
import { SessionData } from '@/lib/session';

interface PollData {
  id: number;
  question_text: string;
  options: string[];
  category: string;
}

interface CommunityContent {
  news: any[];
  trivia: any[];
  events: any[];
}

interface DashboardClientProps {
  session: SessionData;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const router = useRouter();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [community, setCommunity] = useState<CommunityContent | null>(null);
  const [userVote, setUserVote] = useState<number | undefined>(undefined);
  const [voteCounts, setVoteCounts] = useState<{ option_index: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch poll data
      const pollRes = await fetch('/api/poll');
      const pollData = await pollRes.json();
      setPoll(pollData.poll);
      setUserVote(pollData.userVote);
      setVoteCounts(pollData.voteCounts || []);

      // Fetch community content
      const communityRes = await fetch('/api/community');
      const communityData = await communityRes.json();
      setCommunity(communityData);
      
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">PublicPoll</h1>
                <p className="text-xs text-gray-500">Karnataka Citizen Voice</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* User Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500">Verified</span>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Your voice shapes Karnataka. Here's today's poll and community updates.
          </p>
        </div>

        {/* Poll Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold text-gray-800">Today's Poll</h3>
          </div>
          
          {poll ? (
            <PollCard
              poll={poll}
              userId={session.userId}
              initialUserVote={userVote}
              initialVoteCounts={voteCounts}
            />
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-gray-500">No poll available today. Check back tomorrow!</p>
            </div>
          )}
        </section>

        {/* Community Section */}
        <section>
          {community && (
            <CommunityCards
              news={community.news}
              trivia={community.trivia}
              events={community.events}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 PublicPoll - Karnataka Citizen Voice</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary-600">Privacy</a>
              <a href="#" className="hover:text-primary-600">Terms</a>
              <a href="#" className="hover:text-primary-600">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
