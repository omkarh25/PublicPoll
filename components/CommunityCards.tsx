'use client';

/**
 * Community Cards Component
 * 3-part card showing News, Trivia, and Events for Karnataka community
 */

interface CommunityItem {
  id: number;
  type: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

interface CommunityCardsProps {
  news: CommunityItem[];
  trivia: CommunityItem[];
  events: CommunityItem[];
}

export default function CommunityCards({ news, trivia, events }: CommunityCardsProps) {
  // Get icon for each type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'trivia':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'event':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Get color for each type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100',
        };
      case 'trivia':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-200',
          iconBg: 'bg-amber-100',
        };
      case 'event':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-600',
          border: 'border-purple-200',
          iconBg: 'bg-purple-100',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-600',
          border: 'border-gray-200',
          iconBg: 'bg-gray-100',
        };
    }
  };

  // Render a single card item
  const renderCard = (item: CommunityItem, index: number) => {
    const colors = getTypeColor(item.type);
    
    return (
      <div
        key={item.id}
        className={`group ${colors.bg} ${colors.border} border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {/* Image */}
        {item.image_url && (
          <div className="relative h-32 overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className={`absolute top-2 right-2 ${colors.iconBg} ${colors.text} p-1.5 rounded-lg`}>
              {getTypeIcon(item.type)}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium uppercase tracking-wide ${colors.text}`}>
              {item.type}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-1">
            {item.title}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-3">
            {item.content}
          </p>
        </div>
      </div>
    );
  };

  // Section component
  const renderSection = (title: string, items: CommunityItem[], type: string) => {
    const colors = getTypeColor(type);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colors.iconBg} ${colors.text}`}>
            {getTypeIcon(type)}
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="grid gap-3">
          {items.slice(0, 2).map((item, index) => renderCard(item, index))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Community Feed</h2>
        <span className="text-sm text-gray-500">Karnataka Updates</span>
      </div>

      {/* 3-Part Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* News Section */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          {renderSection('📰 News', news, 'news')}
        </div>

        {/* Trivia Section */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          {renderSection('💡 Did You Know?', trivia, 'trivia')}
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          {renderSection('📅 Events', events, 'event')}
        </div>
      </div>

      {/* Featured Content */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">Stay Connected with Karnataka</h3>
            <p className="text-primary-100 text-sm">
              Join thousands of citizens participating in civic polls and shaping the future of your community.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">30+</div>
              <div className="text-xs text-primary-200">Active Polls</div>
            </div>
            <div className="w-px h-12 bg-primary-400" />
            <div className="text-center">
              <div className="text-3xl font-bold">9</div>
              <div className="text-xs text-primary-200">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
