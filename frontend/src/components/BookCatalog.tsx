import React, { useState } from 'react';
import { Book } from '../types';
import { Search, ShoppingCart, Star, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';

interface BookCatalogProps {
  books: Book[];
  onAddToCart: (book: Book) => void;
  loading: boolean;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({ books, onAddToCart, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Fiction', 'Technology', 'History', 'Literature', 'Self-Help'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || book.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="glass-card" style={{
        padding: '32px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(54, 123, 236, 0.06) 0%, rgba(54, 123, 236, 0.02) 100%)',
        borderColor: 'rgba(54, 123, 236, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <span style={{ color: '#367BEC', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Web-Based Bookstore Management System (Order & Cart Module)
          </span>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', marginTop: '6px' }}>
            Browse Sarasavi Bookstore Collection
          </h2>
          <p style={{ color: '#475569', marginTop: '8px', maxWidth: '600px', fontSize: '0.95rem' }}>
            Add items to your persistent cart, apply instant discount codes, and experience smooth multi-step checkout with real-time order status tracking.
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          background: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(54, 123, 236, 0.08)'
        }}>
          <BookOpen size={28} color="#367BEC" />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{books.length} Available Books</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>MongoDB Real-Time Inventory</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: selectedCategory === cat ? '#367BEC' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                border: selectedCategory === cat ? '1px solid #367BEC' : '1px solid #cbd5e1',
                boxShadow: selectedCategory === cat ? '0 4px 10px rgba(54, 123, 236, 0.25)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by book title or author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: 'var(--radius-md)',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading catalog from MongoDB database...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No books found matching your filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredBooks.map(book => (
            <div key={book.id} className="glass-card glass-card-interactive" style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden', background: '#ffffff', border: '1px solid #e2e8f0'
            }}>
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#f1f5f9' }}>
                <img src={book.coverImage} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', top: '12px', right: '12px', background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem',
                  fontWeight: 700, color: '#367BEC'
                }}>
                  {book.category}
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <Star size={14} color="#367BEC" fill="#367BEC" />
                    <span style={{ fontSize: '0.8rem', color: '#367BEC', fontWeight: 700 }}>{book.rating || 4.8}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '4px', lineHeight: 1.3 }}>{book.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>by {book.author}</p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
                    {book.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Price</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#367BEC' }}>
                        LKR {book.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div>
                      {book.stockQuantity > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#367BEC', fontWeight: 600 }}>
                          <CheckCircle size={12} /> {book.stockQuantity} in stock
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
                          <AlertTriangle size={12} /> Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(book)}
                    disabled={book.stockQuantity <= 0}
                    style={{
                      width: '100%', padding: '10px', borderRadius: 'var(--radius-md)',
                      background: book.stockQuantity > 0 ? '#367BEC' : '#cbd5e1',
                      color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: book.stockQuantity > 0 ? '0 4px 12px rgba(54, 123, 236, 0.25)' : 'none',
                      opacity: book.stockQuantity > 0 ? 1 : 0.6
                    }}
                  >
                    <ShoppingCart size={16} />
                    {book.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
