'use client';

import React, { useState, useEffect } from 'react';
import { Book, Cart, PromoResult } from '@/types/orders';
import { ordersApi } from '@/lib/orders-api';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  BookOpen,
  Sparkles
} from 'lucide-react';

export default function CartManager() {
  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<Cart>({ customerId: 'CUST-101', items: [], totalAmount: 0, totalItems: 0 });
  const [couponCode, setCouponCode] = useState('PAGE10');
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [promoError, setPromoError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bList = await ordersApi.getBooks();
      setBooks(bList);
      const c = await ordersApi.getCart('CUST-101');
      setCart(c);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToCart = async (bookId: string) => {
    try {
      const updated = await ordersApi.addToCart('CUST-101', bookId, 1);
      setCart(updated);
      if (promoResult) setPromoResult(null);
    } catch (e: any) {
      alert(e.message || 'Error adding item');
    }
  };

  const handleUpdateQty = async (bookId: string, qty: number) => {
    try {
      const updated = await ordersApi.updateCartQuantity('CUST-101', bookId, qty);
      setCart(updated);
      if (promoResult) setPromoResult(null);
    } catch (e: any) {
      alert(e.message || 'Error updating quantity');
    }
  };

  const handleRemove = async (bookId: string) => {
    try {
      const updated = await ordersApi.removeCartItem('CUST-101', bookId);
      setCart(updated);
      if (promoResult) setPromoResult(null);
    } catch (e: any) {
      alert(e.message || 'Error removing item');
    }
  };

  const handleClear = async () => {
    try {
      await ordersApi.clearCart('CUST-101');
      setCart({ customerId: 'CUST-101', items: [], totalAmount: 0, totalItems: 0 });
      setPromoResult(null);
    } catch (e: any) {
      alert(e.message || 'Error clearing cart');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setLoading(true);
    setPromoError('');
    setPromoResult(null);
    try {
      const res = await ordersApi.validateCoupon(couponCode.trim(), cart.totalAmount);
      setPromoResult(res);
    } catch (err: any) {
      setPromoError(err.message || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Interactive Cart & Catalog Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Books Storefront to Add Items */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E2E7D8] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#596B32]" />
              <h3 className="text-base font-medium font-display text-[#20231B]">Bookstore Catalog (Live Cart Demo)</h3>
            </div>
            <span className="text-xs text-[#85887A]">Available Stock Ready for Dispatch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {books.slice(0, 4).map((book) => (
              <div key={book.id} className="p-3.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] flex gap-3 items-center shadow-xs hover:border-[#596B32]/40 transition-colors">
                <img src={book.coverImage} alt={book.title} className="w-14 h-18 object-cover rounded-lg shadow-sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-[#20231B] truncate">{book.title}</h4>
                  <p className="text-[11px] text-[#85887A] truncate">{book.author}</p>
                  <p className="text-xs font-mono font-bold text-[#34451D] mt-1">LKR {book.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleAddToCart(book.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F0F4E8] text-[#34451D] hover:bg-[#34451D] hover:text-white border border-[#E2E7D8] text-xs font-medium transition-all shadow-xs"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cart Sidebar */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E7D8] space-y-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-[#E2E7D8] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#596B32]" />
                <h3 className="text-base font-medium font-display text-[#20231B]">Shopping Cart</h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#F0F4E8] text-[#34451D] border border-[#E2E7D8]">
                {cart.totalItems} items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.length === 0 ? (
                <div className="text-center py-8 text-[#85887A] text-xs">
                  Cart is currently empty. Click "+ Add" on any book.
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.bookId} className="p-2.5 rounded-xl bg-[#F8F9F5] border border-[#E2E7D8] flex items-center justify-between gap-2 text-xs shadow-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#20231B] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#85887A] font-mono">LKR {item.price.toLocaleString()} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateQty(item.bookId, item.quantity - 1)}
                        className="h-6 w-6 rounded bg-white text-[#20231B] hover:bg-[#F0F4E8] flex items-center justify-center border border-[#E2E7D8]"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs w-4 text-center text-[#20231B]">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.bookId, item.quantity + 1)}
                        className="h-6 w-6 rounded bg-white text-[#20231B] hover:bg-[#F0F4E8] flex items-center justify-center border border-[#E2E7D8]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.bookId)}
                        className="h-6 w-6 rounded text-rose-600 hover:text-rose-700 flex items-center justify-center ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Coupon Code Section */}
            {cart.items.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#E2E7D8] space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-[#85887A]">
                  <Tag className="w-3.5 h-3.5 text-[#596B32]" />
                  <span>Promo Code (e.g. PAGE10, WELCOME20, SLIITBOOK)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    className="flex-1 bg-[#F8F9F5] border border-[#E2E7D8] focus:bg-white rounded-xl px-3 py-1.5 text-xs text-[#20231B] uppercase focus:outline-none focus:border-[#596B32]"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-[#34451D] text-white hover:bg-[#596B32] text-xs font-medium shadow-xs"
                  >
                    Apply
                  </button>
                </div>
                {promoResult && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#34451D] bg-[#F0F4E8] border border-[#E2E7D8] rounded-lg p-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#596B32]" />
                    <span>Coupon {promoResult.promotion.code} applied! Saved LKR {promoResult.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {promoError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{promoError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Total & Action */}
          <div className="pt-4 border-t border-[#E2E7D8] space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-[#85887A]">
                <span>Subtotal:</span>
                <span className="font-mono text-[#20231B]">LKR {cart.totalAmount.toLocaleString()}</span>
              </div>
              {promoResult && (
                <div className="flex justify-between text-[#596B32]">
                  <span>Discount:</span>
                  <span className="font-mono">- LKR {promoResult.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-[#20231B] pt-1 border-t border-[#E2E7D8]">
                <span>Total:</span>
                <span className="font-mono text-[#34451D] font-bold">
                  LKR {(promoResult ? promoResult.finalTotal : cart.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>

            {cart.items.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-2 rounded-xl bg-white border border-[#E2E7D8] text-[#85887A] hover:text-[#20231B] hover:bg-[#F8F9F5] text-xs transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => alert(`Simulating Order Checkout! Total: LKR ${(promoResult ? promoResult.finalTotal : cart.totalAmount).toLocaleString()}`)}
                  className="flex-1 py-2 rounded-xl bg-[#34451D] hover:bg-[#596B32] text-white text-xs font-medium shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B7D85A]" />
                  Dispatch Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
