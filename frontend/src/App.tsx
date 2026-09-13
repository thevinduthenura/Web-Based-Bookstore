import React, { useState, useEffect } from 'react';
import { Book, Cart } from './types';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { BookCatalog } from './components/BookCatalog';
import { CartPage } from './components/CartPage';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'catalog' | 'cart'>('catalog');

  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<Cart>({ customerId: 'CUST-101', items: [], totalAmount: 0, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedBooks, fetchedCart] = await Promise.all([
          api.getBooks(),
          api.getCart('CUST-101'),
        ]);
        setBooks(fetchedBooks);
        setCart(fetchedCart);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddToCart = async (book: Book) => {
    try {
      const updatedCart = await api.addToCart('CUST-101', book.id, 1);
      setCart(updatedCart);
      showToast(`"${book.title}" added to cart!`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleUpdateQuantity = async (bookId: string, quantity: number) => {
    try {
      const updatedCart = await api.updateCartQuantity('CUST-101', bookId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleRemoveItem = async (bookId: string) => {
    try {
      const updatedCart = await api.removeCartItem('CUST-101', bookId);
      setCart(updatedCart);
      showToast('Item removed from cart');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleClearCart = async () => {
    try {
      await api.clearCart('CUST-101');
      setCart({ customerId: 'CUST-101', items: [], totalAmount: 0, totalItems: 0 });
      showToast('Cart cleared');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
          background: '#367BEC', color: '#ffffff',
          padding: '12px 20px', borderRadius: '10px',
          fontWeight: 600, boxShadow: '0 8px 24px rgba(54,123,236,0.4)',
          display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartItemCount={cart.totalItems || 0}
        cartTotal={cart.totalAmount || 0}
      />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 24px 60px' }}>
        {activeView === 'catalog' && (
          <BookCatalog
            books={books}
            onAddToCart={handleAddToCart}
            loading={loading}
          />
        )}

        {activeView === 'cart' && (
          <CartPage
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onBackToCatalog={() => setActiveView('catalog')}
          />
        )}
      </main>

      <footer style={{
        borderTop: '1px solid #e2e8f0', padding: '20px 24px',
        textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', background: '#ffffff'
      }}>
        <div>Web-Based Bookstore Management System &copy; 2026 — SE2030 Software Engineering</div>
        <div style={{ color: '#367BEC', marginTop: '4px', fontWeight: 600 }}>
          Diyes C.L. (IT25100263) — Cart Management Module
        </div>
      </footer>
    </div>
  );
};
