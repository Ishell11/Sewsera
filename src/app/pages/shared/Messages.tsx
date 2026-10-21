// src/app/pages/shared/Messages.tsx
import React, { useState, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { db, auth } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const C = { primary: '#C4623F', dark: '#1A2B3C', teal: '#2A9D8F', bg: '#F5F0E8' };

interface Message {
  from: string;
  text: string;
  time: Timestamp; // Changed from Date to Timestamp
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string>;
  participantRoles: Record<string, string>;
  lastMessage: string;
  lastMessageTime: Timestamp; // Changed from Date to Timestamp
  unreadCount: Record<string, number>;
  messages: Message[];
}

// Helper to format timestamp to readable time
const formatTime = (timestamp: Timestamp | null | undefined) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Messages() {
  const { currentUser } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // Real-time listener for conversations
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        convs.push({ id: doc.id, ...data } as Conversation);
      });
      // Sort by lastMessageTime desc (using Timestamp comparison)
      convs.sort((a, b) => {
        const timeA = a.lastMessageTime?.toMillis?.() || 0;
        const timeB = b.lastMessageTime?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // When a conversation is selected, mark unread count to 0 for current user
  useEffect(() => {
    if (selectedConv && currentUser?.uid && selectedConv.unreadCount[currentUser.uid] > 0) {
      const updateUnread = async () => {
        const convRef = doc(db, 'conversations', selectedConv.id);
        await updateDoc(convRef, {
          [`unreadCount.${currentUser.uid}`]: 0,
        });
        // Update local state
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConv.id
              ? { ...c, unreadCount: { ...c.unreadCount, [currentUser.uid]: 0 } }
              : c
          )
        );
        setSelectedConv(prev => prev ? { ...prev, unreadCount: { ...prev.unreadCount, [currentUser.uid]: 0 } } : null);
      };
      updateUnread();
    }
  }, [selectedConv, currentUser]);

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedConv || !currentUser?.uid) return;

    const newMessage: Message = {
      from: currentUser.uid,
      text: inputText.trim(),
      time: Timestamp.now(), // Use Timestamp.now()
    };

    // Update conversation
    const convRef = doc(db, 'conversations', selectedConv.id);
    const otherParticipant = selectedConv.participants.find(p => p !== currentUser.uid);
    const newUnreadCount = { ...selectedConv.unreadCount };
    if (otherParticipant) {
      newUnreadCount[otherParticipant] = (newUnreadCount[otherParticipant] || 0) + 1;
    }

    await updateDoc(convRef, {
      messages: [...selectedConv.messages, newMessage],
      lastMessage: newMessage.text,
      lastMessageTime: Timestamp.now(),
      unreadCount: newUnreadCount,
    });

    setInputText('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    const otherId = conv.participants.find(p => p !== currentUser?.uid);
    if (!otherId) return null;
    return {
      name: conv.participantNames[otherId] || 'User',
      avatar: conv.participantAvatars[otherId] || otherId[0].toUpperCase(),
      role: conv.participantRoles[otherId] || 'user',
    };
  };

  if (loading) {
    return (
      <Layout title="Messages">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Messages">
      <div className="flex h-[calc(100vh-114px)] md:h-[calc(100vh-64px)] overflow-hidden">
        {/* Inbox List */}
        <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white border-r border-gray-100`}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm" style={{ color: C.dark }}>Messages</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {conversations.filter(c => c.unreadCount[currentUser?.uid || ''] > 0).length} unread
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => {
              const other = getOtherParticipant(conv);
              if (!other) return null;
              const unread = conv.unreadCount[currentUser?.uid || ''] || 0;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left"
                  style={{ background: selectedConv?.id === conv.id ? '#FDF5F2' : undefined }}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ background: other.role === 'tailor' ? C.primary : other.role === 'seller' ? C.teal : C.dark }}
                    >
                      {other.avatar}
                    </div>
                    {unread > 0 && (
                      <div
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ background: C.primary }}
                      >
                        {unread}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm truncate" style={{ color: C.dark }}>{other.name}</p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block"
                      style={{
                        background: other.role === 'tailor' ? '#FDF5F2' : '#E8F8F6',
                        color: other.role === 'tailor' ? C.primary : C.teal,
                      }}
                    >
                      {other.role === 'tailor' ? 'Tailor' : other.role === 'seller' ? 'Seller' : 'Customer'}
                    </span>
                  </div>
                </button>
              );
            })}
            {conversations.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Send size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No messages yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat View */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col bg-white md:bg-gray-50">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-100">
              <button onClick={() => setSelectedConv(null)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <ArrowLeft size={18} style={{ color: C.dark }} />
              </button>
              {(() => {
                const other = getOtherParticipant(selectedConv);
                if (!other) return null;
                return (
                  <>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ background: other.role === 'tailor' ? C.primary : other.role === 'seller' ? C.teal : C.dark }}
                    >
                      {other.avatar}
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: C.dark }}>{other.name}</p>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedConv.messages.map((msg, idx) => {
                const isMe = msg.from === currentUser?.uid;
                const senderName = isMe ? 'You' : getOtherParticipant(selectedConv)?.name || 'User';
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[75%] px-4 py-2.5 rounded-2xl text-sm"
                      style={{
                        background: isMe ? C.primary : 'white',
                        color: isMe ? 'white' : C.dark,
                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      }}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-60">
                        {formatTime(msg.time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKey}
                  className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none bg-gray-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
                  style={{ background: C.primary }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 text-gray-400 text-sm">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Send size={24} className="opacity-40" />
              </div>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}