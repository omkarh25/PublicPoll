/**
 * Database initialization and management for PublicPoll app
 * Uses SQLite with better-sqlite3 for local storage
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'publicpoll.db');

let db: Database.Database | null = null;

/**
 * Get or initialize the database connection
 */
export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeTables();
    seedData();
  }
  return db;
}

/**
 * Initialize all required database tables
 */
function initializeTables() {
  if (!db) return;

  // Users table - stores Aadhaar verified users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aadhaar_number TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Questions pool table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL,
      options TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      option_index INTEGER NOT NULL,
      voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id),
      UNIQUE(user_id, question_id)
    )
  `);

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      comment_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `);

  // Community content table (news, trivia, events)
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Daily poll assignments
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_polls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      date DATE NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id),
      UNIQUE(date)
    )
  `);

  console.log('[DB] Tables initialized successfully');
}

/**
 * Seed initial data - 30 Karnataka-specific questions and community content
 */
function seedData() {
  if (!db) return;

  // Check if questions already exist
  const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
  if (questionCount.count > 0) {
    console.log('[DB] Data already seeded, skipping...');
    return;
  }

  // 30 Karnataka-specific questions
  const questions = [
    { text: 'Should traffic police be banned from collecting cash fines?', options: JSON.stringify(['Yes', 'No']), category: 'traffic' },
    { text: 'Should pot holes be fixed within 48 hours of reporting?', options: JSON.stringify(['Yes', 'No']), category: 'infrastructure' },
    { text: 'Fitness test required for police officers every year?', options: JSON.stringify(['Yes', 'No']), category: 'law_enforcement' },
    { text: 'Should we penalize municipality for not collecting garbage on that day?', options: JSON.stringify(['Yes', 'No']), category: 'sanitation' },
    { text: 'Should people be able to revoke an elected politician?', options: JSON.stringify(['Yes', 'No']), category: 'governance' },
    { text: 'Should Bangalore Metro be extended to all residential areas?', options: JSON.stringify(['Yes', 'No']), category: 'transport' },
    { text: 'Should street vendors be allowed in all neighborhoods?', options: JSON.stringify(['Yes', 'No']), category: 'commerce' },
    { text: 'Should mandatory rainwater harvesting be enforced for all buildings?', options: JSON.stringify(['Yes', 'No']), category: 'environment' },
    { text: 'Should private hospitals display all charges transparently?', options: JSON.stringify(['Yes', 'No']), category: 'healthcare' },
    { text: 'Should school buses have GPS tracking mandatory?', options: JSON.stringify(['Yes', 'No']), category: 'safety' },
    { text: 'Should Bengaluru have odd-even vehicle scheme during peak hours?', options: JSON.stringify(['Yes', 'No']), category: 'traffic' },
    { text: 'Should farmers get direct income support from government?', options: JSON.stringify(['Yes', 'No']), category: 'agriculture' },
    { text: 'Should electric autos be mandatory in Mysore city?', options: JSON.stringify(['Yes', 'No']), category: 'environment' },
    { text: 'ShouldBBMP engineers be held accountable for road quality?', options: JSON.stringify(['Yes', 'No']), category: 'accountability' },
    { text: 'Should there be strict penalties for noise pollution during festivals?', options: JSON.stringify(['Yes', 'No']), category: 'environment' },
    { text: 'Should government provide free WiFi in all villages?', options: JSON.stringify(['Yes', 'No']), category: 'digital' },
    { text: 'Should Bangalore roads have dedicated cycle lanes?', options: JSON.stringify(['Yes', 'No']), category: 'transport' },
    { text: 'Should pet owners register their animals with local authorities?', options: JSON.stringify(['Yes', 'No']), category: 'animals' },
    { text: 'Should CCTV cameras be mandatory at all public places?', options: JSON.stringify(['Yes', 'No']), category: 'security' },
    { text: 'Should auto-rickshaw fares be regulated with maximum caps?', options: JSON.stringify(['Yes', 'No']), category: 'transport' },
    { text: 'Should stray cattle be relocated to shelter homes?', options: JSON.stringify(['Yes', 'No']), category: 'animals' },
    { text: 'Should public parks be open 24/7 for citizens?', options: JSON.stringify(['Yes', 'No']), category: 'public_spaces' },
    { text: 'Should liquor shops be banned within 500m of schools?', options: JSON.stringify(['Yes', 'No']), category: 'healthcare' },
    { text: 'Should migrants get equal access to government schemes?', options: JSON.stringify(['Yes', 'No']), category: 'welfare' },
    { text: 'Should traffic signal violations be penalized with community service?', options: JSON.stringify(['Yes', 'No']), category: 'traffic' },
    { text: 'Should senior citizens get free public transport?', options: JSON.stringify(['Yes', 'No']), category: 'welfare' },
    { text: 'Should building violations lead to immediate demolition?', options: JSON.stringify(['Yes', 'No']), category: 'governance' },
    { text: 'Should Karnataka ban single-use plastics completely?', options: JSON.stringify(['Yes', 'No']), category: 'environment' },
    { text: 'Should teachers be evaluated by students annually?', options: JSON.stringify(['Yes', 'No']), category: 'education' },
    { text: 'Should water supply be metered and charged by usage?', options: JSON.stringify(['Yes', 'No']), category: 'utilities' },
  ];

  const insertQuestion = db.prepare('INSERT INTO questions (question_text, options, category) VALUES (?, ?, ?)');
  
  for (const q of questions) {
    insertQuestion.run(q.text, q.options, q.category);
  }

  console.log('[DB] Seeded 30 questions');

  // Seed community content
  const communityContent = [
    // News
    { type: 'news', title: 'Bangalore Metro Expansion', content: 'The Namma Metro Blue Line extension to Hebbal and Thanisandra is now operational, benefiting over 2 lakh daily commuters.', image_url: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=400' },
    { type: 'news', title: 'BBMP Road Repair Initiative', content: 'BBMP has launched a Rs. 500 crore road repair project covering 1000 km of city roads. Report potholes via the BBMP Sahaya app.', image_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=400' },
    { type: 'news', title: 'New Green Park Opens', content: 'A new 15-acre green park with jogging track and children play area inaugurated in Koramangala. Open from 5 AM to 9 PM.', image_url: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400' },
    
    // Trivia
    { type: 'trivia', title: 'Did You Know?', content: 'Bangalore is called the "Silicon Valley of India" due to its role as the nation\'s leading IT exporter. The city contributes to 35% of India\'s IT exports.', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
    { type: 'trivia', title: 'Historical Fact', content: 'Mysore Palace, one of the largest palaces in India, is illuminated by 98,000 bulbs every Sunday and during national holidays.', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
    { type: 'trivia', title: 'Environment Stat', content: 'Karnataka has 5 national parks and 25 wildlife sanctuaries, covering 6% of the state\'s geographical area. The state is home to Bengal tigers and elephants.', image_url: 'https://images.unsplash.com/photo-1564767594394-7245b2ef9d69?w=400' },
    
    // Events
    { type: 'event', title: 'Mysore Dasara Festival', content: 'The grand 10-day Dasara festival begins on October 15th. Don\'t miss the Jumbo Savari (elephant procession) on Vijayadashami.', image_url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400' },
    { type: 'event', title: 'Bangalore Literature Festival', content: 'Annual literary gala at Bangalore Palace from December 1-3. Featuring 100+ authors, poets, and interactive sessions.', image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' },
    { type: 'event', title: 'Farmers Market', content: 'Every Sunday from 6 AM to 12 PM at Gandhi Nagar. Fresh organic produce directly from farmers. Bring your own bags!', image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400' },
  ];

  const insertContent = db.prepare('INSERT INTO community_content (type, title, content, image_url) VALUES (?, ?, ?, ?)');
  
  for (const c of communityContent) {
    insertContent.run(c.type, c.title, c.content, c.image_url);
  }

  console.log('[DB] Seeded community content');

  // Assign today's question
  const today = new Date().toISOString().split('T')[0];
  const firstQuestion = db.prepare('SELECT id FROM questions ORDER BY id ASC LIMIT 1').get() as { id: number };
  
  db.prepare('INSERT OR IGNORE INTO daily_polls (question_id, date) VALUES (?, ?)').run(firstQuestion.id, today);
  
  console.log('[DB] Daily poll assigned for today');
}

/**
 * Get today's poll question
 */
export function getTodayPoll() {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  
  const result = db.prepare(`
    SELECT q.id, q.question_text, q.options, q.category
    FROM questions q
    JOIN daily_polls dp ON q.id = dp.question_id
    WHERE dp.date = ?
  `).get(today) as { id: number; question_text: string; options: string; category: string } | undefined;

  if (result) {
    return {
      ...result,
      options: JSON.parse(result.options)
    };
  }
  
  // Fallback: get random question if no daily poll
  const random = db.prepare(`
    SELECT id, question_text, options, category
    FROM questions
    ORDER BY RANDOM()
    LIMIT 1
  `).get() as { id: number; question_text: string; options: string; category: string };
  
  return {
    ...random,
    options: JSON.parse(random.options)
  };
}

/**
 * Get all community content grouped by type
 */
export function getCommunityContent() {
  const db = getDb();
  
  const news = db.prepare('SELECT * FROM community_content WHERE type = ? ORDER BY created_at DESC').all('news');
  const trivia = db.prepare('SELECT * FROM community_content WHERE type = ? ORDER BY created_at DESC').all('trivia');
  const events = db.prepare('SELECT * FROM community_content WHERE type = ? ORDER BY created_at DESC').all('event');
  
  return { news, trivia, events };
}

/**
 * Create or get user by Aadhaar
 */
export function createOrGetUser(aadhaarNumber: string, phone: string) {
  const db = getDb();
  
  let user = db.prepare('SELECT * FROM users WHERE aadhaar_number = ?').get(aadhaarNumber) as { id: number; aadhaar_number: string; phone: string } | undefined;
  
  if (!user) {
    const result = db.prepare('INSERT INTO users (aadhaar_number, phone) VALUES (?, ?)').run(aadhaarNumber, phone);
    user = { id: result.lastInsertRowid as number, aadhaar_number: aadhaarNumber, phone };
    console.log(`[DB] New user created: ${aadhaarNumber}`);
  }
  
  return user;
}

/**
 * Submit a vote
 */
export function submitVote(userId: number, questionId: number, optionIndex: number) {
  const db = getDb();
  
  try {
    db.prepare(`
      INSERT INTO votes (user_id, question_id, option_index)
      VALUES (?, ?, ?)
    `).run(userId, questionId, optionIndex);
    
    console.log(`[DB] Vote recorded: User ${userId} voted for option ${optionIndex} on question ${questionId}`);
    return { success: true };
  } catch (error) {
    console.error('[DB] Vote failed:', error);
    return { success: false, error: 'Already voted' };
  }
}

/**
 * Get user's vote for a question
 */
export function getUserVote(userId: number, questionId: number) {
  const db = getDb();
  
  const vote = db.prepare('SELECT option_index FROM votes WHERE user_id = ? AND question_id = ?').get(userId, questionId) as { option_index: number } | undefined;
  
  return vote?.option_index;
}

/**
 * Submit a comment
 */
export function submitComment(userId: number, questionId: number, commentText: string) {
  const db = getDb();
  
  const result = db.prepare('INSERT INTO comments (user_id, question_id, comment_text) VALUES (?, ?, ?)').run(userId, questionId, commentText);
  
  console.log(`[DB] Comment added: User ${userId} on question ${questionId}`);
  return { success: true, id: result.lastInsertRowid };
}

/**
 * Get comments for a question
 */
export function getComments(questionId: number) {
  const db = getDb();
  
  const comments = db.prepare(`
    SELECT c.id, c.comment_text, c.created_at, u.aadhaar_number
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.question_id = ?
    ORDER BY c.created_at DESC
    LIMIT 50
  `).all(questionId);
  
  return comments;
}

/**
 * Get vote counts for a question
 */
export function getVoteCounts(questionId: number) {
  const db = getDb();
  
  const counts = db.prepare(`
    SELECT option_index, COUNT(*) as count
    FROM votes
    WHERE question_id = ?
    GROUP BY option_index
  `).all(questionId) as { option_index: number; count: number }[];
  
  return counts;
}
