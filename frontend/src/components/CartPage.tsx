import React, { useState } from 'react';
import { Cart, CartItem, PromoResult } from '../types';
import { api } from '../api';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, X, User, Mail, Phone, MapPin, CheckCircle2, Tag, XCircle } from 'lucide-react';

interface CartPageProps {
  cart: Cart;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  onClearCart: () => void;
  onBackToCatalog: () => void;
}

interface CheckoutForm {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
}

const EMPTY_FORM: CheckoutForm = {
  fullName: '', email: '', phone: '', addressLine1: '', city: '', postalCode: ''
};

export const CartPage: React.FC<CartPageProps> = ({
  cart, onUpdateQuantity, onRemoveItem, onClearCart, onBackToCatalog,
}) => {
  const [removingId, setRemovingId]   = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm]               = useState<CheckoutForm>(EMPTY_FORM);
  const [submitted, setSubmitted]     = useState(false);
  const [errors, setErrors]           = useState<Partial<CheckoutForm>>({});

  // coupon state
  const [couponInput, setCouponInput]   = useState('');
  const [promoResult, setPromoResult]   = useState<PromoResult | null>(null);
  const [promoError, setPromoError]     = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoResult(null);
    try {
      const result = await api.validateCoupon(couponInput.trim(), cart.totalAmount);
      setPromoResult(result);
    } catch (err: any) {
      setPromoError(err.message || 'Invalid coupon code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setPromoResult(null);
    setCouponInput('');
    setPromoError('');
  };

  const isEmpty = cart.items.length === 0;

  const handleRemove = async (bookId: string) => {
    setRemovingId(bookId);
    await onRemoveItem(bookId);
    setRemovingId(null);
  };

  const handleField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<CheckoutForm> = {};
    if (!form.fullName.trim())    errs.fullName    = 'Full name is required';
    if (!form.email.trim())       errs.email       = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim())       errs.phone       = 'Phone number is required';
    if (!form.addressLine1.trim()) errs.addressLine1 = 'Address is required';
    if (!form.city.trim())        errs.city        = 'City is required';
    if (!form.postalCode.trim())  errs.postalCode  = 'Postal code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) setSubmitted(true);
  };

  const closeModal = () => {
    setShowCheckout(false);
    setSubmitted(false);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem',
    border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
    outline: 'none', boxSizing: 'border-box', color: '#0f172a',
    background: hasError ? '#fff5f5' : '#fafafa',
  });

  return (
    <div style={{ padding: '32px 0', minHeight: '60vh' }}>

      {/* ── Checkout Modal ── */}
      {showCheckout && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px 0', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  {submitted ? 'Details Received!' : 'Checkout Details'}
                </h2>
                {!submitted && (
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    Enter your delivery information
                  </p>
                )}
              </div>
              <button onClick={closeModal} style={{
                width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid #e2e8f0',
                background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: '24px 28px 28px' }}>
              {submitted ? (
                /* Success State */
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'rgba(54,123,236,0.1)', margin: '0 auto 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <CheckCircle2 size={36} color="#367BEC" />
                  </div>
                  <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontWeight: 700 }}>
                    Details Submitted!
                  </h3>
                  <p style={{ margin: '0 0 8px', color: '#475569', lineHeight: 1.6, fontSize: '0.9rem' }}>
                    Hi <strong>{form.fullName}</strong>, your order details have been recorded.
                    The payment step will be handled by the payment module.
                  </p>
                  <div style={{
                    background: '#f8fafc', borderRadius: '10px', padding: '14px',
                    margin: '20px 0', textAlign: 'left', fontSize: '0.85rem', color: '#475569',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div><strong style={{ color: '#0f172a' }}>Deliver to:</strong> {form.addressLine1}, {form.city} {form.postalCode}</div>
                    <div style={{ marginTop: '4px' }}><strong style={{ color: '#0f172a' }}>Contact:</strong> {form.email} · {form.phone}</div>
                    <div style={{ marginTop: '4px' }}><strong style={{ color: '#0f172a' }}>Order Total:</strong> <span style={{ color: '#367BEC', fontWeight: 700 }}>LKR {cart.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span></div>
                  </div>
                  <button onClick={closeModal} style={{
                    width: '100%', padding: '12px', borderRadius: '10px',
                    background: '#367BEC', color: '#fff', fontWeight: 700,
                    border: 'none', cursor: 'pointer', fontSize: '0.95rem'
                  }}>
                    Close
                  </button>
                </div>
              ) : (
                /* Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      <User size={13} /> Full Name
                    </label>
                    <input name="fullName" value={form.fullName} onChange={handleField}
                      placeholder="e.g. Diyes Wickramasinghe" style={inputStyle(!!errors.fullName)} />
                    {errors.fullName && <p style={{ margin: '4px 0 0', color: '#ef4444', fontSize: '0.78rem' }}>{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      <Mail size={13} /> Email Address
                    </label>
                    <input name="email" type="email" value={form.email} onChange={handleField}
                      placeholder="e.g. diyes@example.com" style={inputStyle(!!errors.email)} />
                    {errors.email && <p style={{ margin: '4px 0 0', color: '#ef4444', fontSize: '0.78rem' }}>{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      <Phone size={13} /> Phone Number
                    </label>
                    <input name="phone" value={form.phone} onChange={handleField}
                      placeholder="e.g. 0771234567" style={inputStyle(!!errors.phone)} />
                    {errors.phone && <p style={{ margin: '4px 0 0', color: '#ef4444', fontSize: '0.78rem' }}>{errors.phone}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      <MapPin size={13} /> Delivery Address
                    </label>
                    <input name="addressLine1" value={form.addressLine1} onChange={handleField}
                      placeholder="Street / Road, Area" style={inputStyle(!!errors.addressLine1)} />
                    {errors.addressLine1 && <p style={{ margin: '4px 0 0', color: '#ef4444', fontSize: '0.78rem' }}>{errors.addressLine1}</p>}
                  </div>

                  {/* City + Postal */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>City</label>
                      <input name="city" value={form.city} onChange={handleField}
                        placeholder="e.g. Colombo" style={inputStyle(!!errors.city)} />
                      {errors.city && <p style={{ margin: '4px 0 0', color: '#ef4444', fontSize: '0.78rem' }}>{errors.city}</p>}
                    </div>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'block' }}>Postal Code</label>
                      <input name="postalCode" value={form.postalCode} onChange={handleField}
                        placeholder="e.g. 10250" style={inputStyle(!!errors.postalCode)} />
                      {errors.postalCode && <p style={{ margin: '4px 0 0', color: '#ef4444', fontSize: '0.78rem' }}>{errors.postalCode}</p>}
                    </div>
                  </div>

                  {/* Order Total Preview */}
                  <div style={{
                    background: 'rgba(54,123,236,0.06)', border: '1px solid rgba(54,123,236,0.2)',
                    borderRadius: '10px', padding: '14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>Order Total</span>
                    <span style={{ color: '#367BEC', fontWeight: 800, fontSize: '1.05rem' }}>
                      LKR {cart.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button onClick={handleSubmit} style={{
                    width: '100%', padding: '13px', borderRadius: '10px',
                    background: '#367BEC', color: '#fff', fontWeight: 700,
                    border: 'none', cursor: 'pointer', fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(54,123,236,0.4)'
                  }}>
                    Confirm Details
                  </button>
                  <p style={{ margin: 0, textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                    🔒 Payment is handled by the payment module
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>My Cart</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            {isEmpty ? 'No items yet' : `${cart.totalItems} item${cart.totalItems !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>
        <button onClick={onBackToCatalog} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
          borderRadius: '10px', border: '1.5px solid #367BEC', background: 'transparent',
          color: '#367BEC', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
        }}>
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      {isEmpty ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px', textAlign: 'center',
          border: '2px dashed #cbd5e1', borderRadius: '20px', background: '#f8fafc'
        }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'rgba(54,123,236,0.08)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
          }}>
            <ShoppingCart size={40} color="#367BEC" />
          </div>
          <h2 style={{ margin: '0 0 8px', color: '#1e293b', fontWeight: 700 }}>Your cart is empty</h2>
          <p style={{ margin: '0 0 28px', color: '#64748b', maxWidth: '340px', lineHeight: 1.6 }}>
            Browse the catalog and find a book you love!
          </p>
          <button onClick={onBackToCatalog} style={{
            padding: '12px 28px', borderRadius: '10px', background: '#367BEC',
            color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            border: 'none', boxShadow: '0 4px 14px rgba(54,123,236,0.35)'
          }}>
            Browse Books
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>

          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.items.map((item: CartItem) => (
              <div key={item.bookId} style={{
                display: 'flex', gap: '20px', alignItems: 'flex-start',
                background: '#ffffff', borderRadius: '16px',
                border: '1.5px solid #e2e8f0', padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                opacity: removingId === item.bookId ? 0.4 : 1, transition: 'opacity 0.2s ease'
              }}>
                <img src={item.coverImage} alt={item.title} style={{
                  width: '80px', height: '108px', objectFit: 'cover', borderRadius: '10px',
                  flexShrink: 0, border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }} onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x108?text=Book'; }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{item.title}</h3>
                  <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '0.85rem' }}>{item.author}</p>
                  <p style={{ margin: 0, color: '#367BEC', fontWeight: 700, fontSize: '1rem' }}>
                    LKR {item.price.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #367BEC', borderRadius: '10px', overflow: 'hidden' }}>
                    <button onClick={() => onUpdateQuantity(item.bookId, item.quantity - 1)} disabled={item.quantity <= 1} style={{
                      width: '36px', height: '36px', border: 'none',
                      background: item.quantity <= 1 ? '#f1f5f9' : 'rgba(54,123,236,0.08)',
                      color: item.quantity <= 1 ? '#94a3b8' : '#367BEC',
                      cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}><Minus size={14} /></button>
                    <span style={{
                      width: '40px', textAlign: 'center', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem',
                      borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '8px 0'
                    }}>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.bookId, item.quantity + 1)} style={{
                      width: '36px', height: '36px', border: 'none', background: 'rgba(54,123,236,0.08)',
                      color: '#367BEC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}><Plus size={14} /></button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Subtotal</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                      LKR {item.subtotal.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <button onClick={() => handleRemove(item.bookId)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                    borderRadius: '8px', border: '1px solid #fecaca', background: '#fff5f5',
                    color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                  }}><Trash2 size={13} /> Remove</button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <button onClick={onClearCart} style={{
                padding: '8px 16px', borderRadius: '8px', border: '1px solid #fecaca',
                background: 'transparent', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
              }}>Clear entire cart</button>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            background: '#ffffff', borderRadius: '18px', border: '1.5px solid #e2e8f0',
            padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', position: 'sticky', top: '100px'
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Order Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.9rem' }}>
                <span>Items ({cart.totalItems})</span>
                <span>LKR {cart.totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
              </div>
              {promoResult && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>Discount ({promoResult.promotion.code})</span>
                  <span>- LKR {promoResult.discountAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.9rem' }}>
                <span>Shipping</span>
                <span style={{ color: '#22c55e', fontWeight: 600 }}>Calculated at checkout</span>
              </div>
              <div style={{ height: '1px', background: '#e2e8f0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                <span>Total</span>
                <span style={{ color: '#367BEC' }}>
                  LKR {(promoResult ? promoResult.finalTotal : cart.totalAmount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Coupon Code */}
            {!promoResult ? (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                  <Tag size={13} /> Coupon Code
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value); setPromoError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="e.g. PAGE10"
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem',
                      border: `1.5px solid ${promoError ? '#ef4444' : '#e2e8f0'}`,
                      outline: 'none', background: promoError ? '#fff5f5' : '#fafafa', color: '#0f172a',
                      textTransform: 'uppercase'
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={promoLoading || !couponInput.trim()}
                    style={{
                      padding: '9px 14px', borderRadius: '8px', border: 'none',
                      background: promoLoading || !couponInput.trim() ? '#cbd5e1' : '#367BEC',
                      color: '#fff', fontWeight: 700, fontSize: '0.82rem',
                      cursor: promoLoading || !couponInput.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {promoError && (
                  <p style={{ margin: '5px 0 0', color: '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <XCircle size={12} /> {promoError}
                  </p>
                )}
                <p style={{ margin: '6px 0 0', fontSize: '0.73rem', color: '#94a3b8' }}>Try: PAGE10 · SARASAVI20 · WELCOME15</p>
              </div>
            ) : (
              <div style={{
                marginBottom: '16px', padding: '10px 14px', borderRadius: '10px',
                background: '#f0fdf4', border: '1.5px solid #86efac',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#15803d' }}>{promoResult.promotion.code} applied!</div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>
                      {(promoResult.promotion.discountPercentage ?? promoResult.promotion.discountPercent ?? 0)}% off · Saving LKR {promoResult.discountAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}>
                  <X size={16} />
                </button>
              </div>
            )}

            <button onClick={() => setShowCheckout(true)} style={{
              width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
              background: '#367BEC', color: '#ffffff', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(54,123,236,0.4)', marginBottom: '12px'
            }}>
              Proceed to Checkout
            </button>

            <button onClick={onBackToCatalog} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              border: '1.5px solid #367BEC', background: 'transparent',
              color: '#367BEC', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
            }}>
              Continue Shopping
            </button>

            <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
              🔒 Secure checkout via payment module
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
