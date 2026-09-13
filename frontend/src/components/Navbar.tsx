import React from 'react';
import { ShoppingBag, BookOpen, ShoppingCart } from 'lucide-react';

interface NavbarProps {
  activeView: 'catalog' | 'cart';
  setActiveView: (view: 'catalog' | 'cart') => void;
  cartItemCount: number;
  cartTotal: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, cartItemCount, cartTotal }) => {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: '#ffffff', borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 10px rgba(54,123,236,0.06)', padding: '14px 24px'
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px'
      }}>

        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => setActiveView('catalog')}
        >
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: '#367BEC', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 4px 12px rgba(54,123,236,0.3)'
          }}>
            <BookOpen size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>Page Turner</h1>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>Sarasavi Pages (Pvt) Ltd</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveView('catalog')}
            style={{
              padding: '8px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem',
              background: activeView === 'catalog' ? 'rgba(54,123,236,0.1)' : 'transparent',
              color: activeView === 'catalog' ? '#367BEC' : '#475569',
              border: activeView === 'catalog' ? '1.5px solid #367BEC' : '1.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer'
            }}
          >
            <BookOpen size={17} />
            Book Catalog
          </button>

          <button
            onClick={() => setActiveView('cart')}
            style={{
              padding: '8px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem',
              background: activeView === 'cart' ? 'rgba(54,123,236,0.1)' : 'transparent',
              color: activeView === 'cart' ? '#367BEC' : '#475569',
              border: activeView === 'cart' ? '1.5px solid #367BEC' : '1.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer'
            }}
          >
            <ShoppingCart size={17} />
            My Cart
          </button>
        </nav>

        {/* Cart Button */}
        <button
          onClick={() => setActiveView('cart')}
          style={{
            position: 'relative', padding: '10px 20px', borderRadius: '10px',
            background: '#367BEC', color: '#ffffff', fontWeight: 700,
            fontSize: '0.9rem', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(54,123,236,0.35)'
          }}
        >
          <ShoppingBag size={18} />
          <span>Cart</span>
          {cartItemCount > 0 && (
            <>
              <span style={{ opacity: 0.75, fontWeight: 400, fontSize: '0.85rem' }}>•</span>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                LKR {cartTotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
              </span>
              <span style={{
                background: '#ffffff', color: '#367BEC',
                borderRadius: '9999px', padding: '1px 8px',
                fontSize: '0.75rem', fontWeight: 800
              }}>
                {cartItemCount}
              </span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
