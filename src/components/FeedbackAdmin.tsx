import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Star, Download, RefreshCw, Calendar, User, MessageSquare, Bug, Lightbulb, Globe } from 'lucide-react';

interface FeedbackItem {
  rating: number;
  feedback: string;
  category: 'bug' | 'feature' | 'general';
  timestamp: string;
  userAgent: string;
  url: string;
}

interface FeedbackAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackAdmin: React.FC<FeedbackAdminProps> = ({ isOpen, onClose }) => {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'bug' | 'feature' | 'general'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');

  const loadFeedbackData = () => {
    const data = JSON.parse(localStorage.getItem('weatherapp_feedback') || '[]');
    setFeedbackData(data);
  };

  useEffect(() => {
    if (isOpen) {
      loadFeedbackData();
    }
  }, [isOpen]);

  const clearAllFeedback = () => {
    if (window.confirm('Are you sure you want to delete all feedback? This cannot be undone.')) {
      localStorage.removeItem('weatherapp_feedback');
      setFeedbackData([]);
    }
  };

  const deleteFeedbackItem = (index: number) => {
    const newData = feedbackData.filter((_, i) => i !== index);
    localStorage.setItem('weatherapp_feedback', JSON.stringify(newData));
    setFeedbackData(newData);
  };

  const exportFeedback = () => {
    const dataStr = JSON.stringify(feedbackData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `weatherpro-feedback-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFilteredAndSortedData = () => {
    let filtered = feedbackData;

    if (filter !== 'all') {
      filtered = feedbackData.filter(item => item.category === filter);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <Bug size={16} color="#ef4444" />;
      case 'feature': return <Lightbulb size={16} color="#eab308" />;
      case 'general': return <MessageSquare size={16} color="#3b82f6" />;
      default: return <MessageSquare size={16} color="#6b7280" />;
    }
  };

  const getCategoryStats = () => {
    const stats = {
      total: feedbackData.length,
      bug: feedbackData.filter(f => f.category === 'bug').length,
      feature: feedbackData.filter(f => f.category === 'feature').length,
      general: feedbackData.filter(f => f.category === 'general').length,
      avgRating: feedbackData.length > 0
        ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
        : '0'
    };
    return stats;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        fill={index < rating ? '#fbbf24' : 'none'}
        color={index < rating ? '#fbbf24' : '#9ca3af'}
      />
    ));
  };

  const stats = getCategoryStats();
  const displayData = getFilteredAndSortedData();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '90vw',
              width: '1000px',
              maxHeight: '90vh',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <User size={20} color="white" />
                </div>
                <div>
                  <h2 style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    Feedback Admin
                  </h2>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.875rem',
                    margin: 0
                  }}>
                    Manage user feedback and insights
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} color="white" />
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '700' }}>
                  {stats.total}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                  Total Feedback
                </div>
              </div>
              <div style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#fbbf24', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {stats.avgRating} <Star size={16} fill="#fbbf24" color="#fbbf24" />
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                  Avg Rating
                </div>
              </div>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '700' }}>
                  {stats.bug}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                  Bug Reports
                </div>
              </div>
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#22c55e', fontSize: '1.5rem', fontWeight: '700' }}>
                  {stats.feature}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                  Feature Requests
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="bug">Bug Reports</option>
                  <option value="feature">Feature Requests</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadFeedbackData}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: '#22c55e',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} />
                  Refresh
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportFeedback}
                  disabled={feedbackData.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: feedbackData.length > 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                    border: `1px solid ${feedbackData.length > 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`,
                    borderRadius: '8px',
                    color: feedbackData.length > 0 ? '#3b82f6' : '#9ca3af',
                    fontSize: '14px',
                    cursor: feedbackData.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Download size={14} />
                  Export
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAllFeedback}
                  disabled={feedbackData.length === 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: feedbackData.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                    border: `1px solid ${feedbackData.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`,
                    borderRadius: '8px',
                    color: feedbackData.length > 0 ? '#ef4444' : '#9ca3af',
                    fontSize: '14px',
                    cursor: feedbackData.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Trash2 size={14} />
                  Clear All
                </motion.button>
              </div>
            </div>

            {/* Feedback List */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {displayData.length === 0 ? (
                <div style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                  <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '1.125rem', margin: '0 0 8px 0' }}>No feedback found</p>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>
                    {filter !== 'all' ? `No ${filter} feedback available` : 'Start collecting user feedback!'}
                  </p>
                </div>
              ) : (
                <div style={{ padding: '16px' }}>
                  {displayData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '16px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {renderStars(item.rating)}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px'
                          }}>
                            {getCategoryIcon(item.category)}
                            <span style={{
                              color: 'white',
                              fontSize: '12px',
                              textTransform: 'capitalize'
                            }}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteFeedbackItem(index)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            borderRadius: '6px',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} color="#ef4444" />
                        </motion.button>
                      </div>

                      {item.feedback && (
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          marginBottom: '12px',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          borderLeft: '3px solid rgba(59, 130, 246, 0.5)'
                        }}>
                          "{item.feedback}"
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Globe size={12} />
                          {item.url.split('/').pop() || 'Home'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackAdmin;