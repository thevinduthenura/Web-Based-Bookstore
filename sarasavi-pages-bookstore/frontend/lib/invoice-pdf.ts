/**
 * Sarasavi Pages - Clean & Professional Standard Invoice / Receipt PDF Generator
 * Simple, elegant, standard design matching Sarasavi UI aesthetics.
 */

interface OrderInvoiceItem {
  title: string;
  qty: number;
  price: number;
}

export interface OrderInvoiceData {
  invoiceNo: string;
  orderId?: string;
  date: string;
  customer: string;
  email?: string;
  phone?: string;
  address?: string;
  courier?: string;
  tracking?: string;
  items: OrderInvoiceItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  status?: string;
}

export interface MembershipInvoiceData {
  invoiceNo: string;
  date: string;
  customer: string;
  email?: string;
  phone?: string;
  customerId?: string;
  plan: string;
  duration: string;
  price: number;
  discount?: number;
  total?: number;
  paymentMethod?: string;
  perks?: string[];
}

export interface PaymentReceiptData {
  invoiceNo: string;
  reference?: string;
  date: string;
  customerName: string;
  customerId?: string;
  amount: number;
  method?: string;
  status?: string;
  description?: string;
}

const getBaseStyles = () => `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page {
    size: A4 portrait;
    margin: 15mm;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #20231B;
    background: #f4f5f1;
    font-size: 13px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .toolbar-title {
    font-size: 14px;
    font-weight: 600;
    color: #34451D;
  }
  .toolbar-actions {
    display: flex;
    gap: 10px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
  }
  .btn-primary {
    background: #34451D;
    color: #ffffff;
  }
  .btn-primary:hover {
    background: #253214;
  }
  .btn-secondary {
    background: #f8fafc;
    color: #475569;
    border-color: #cbd5e1;
  }
  .btn-secondary:hover {
    background: #f1f5f9;
  }
  .invoice-wrapper {
    max-width: 800px;
    margin: 24px auto;
    background: #ffffff;
    padding: 40px 48px;
    border: 1px solid #E2E7D8;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  }
  .inv-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 24px;
    border-bottom: 2px solid #34451D;
    margin-bottom: 24px;
  }
  .brand-title {
    font-size: 24px;
    font-weight: 800;
    color: #34451D;
    letter-spacing: -0.5px;
  }
  .brand-sub {
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
    line-height: 1.4;
  }
  .inv-title-box {
    text-align: right;
  }
  .inv-heading {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .inv-number {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-top: 2px;
  }
  .badge-paid {
    display: inline-block;
    margin-top: 6px;
    padding: 3px 10px;
    background: #EAFAD6;
    color: #34451D;
    border: 1px solid #B7D85A;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 28px;
  }
  .card-box {
    background: #FAFAF8;
    border: 1px solid #E2E7D8;
    border-radius: 6px;
    padding: 14px 16px;
  }
  .card-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #596B32;
    margin-bottom: 6px;
  }
  .card-value {
    font-size: 13px;
    color: #1e293b;
    line-height: 1.6;
  }
  .card-value strong {
    color: #0f172a;
  }
  table.items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
  }
  table.items-table thead th {
    background: #34451D;
    color: #ffffff;
    padding: 10px 14px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  table.items-table thead th.text-right,
  table.items-table tbody td.text-right {
    text-align: right;
  }
  table.items-table thead th.text-center,
  table.items-table tbody td.text-center {
    text-align: center;
  }
  table.items-table tbody td {
    padding: 12px 14px;
    border-bottom: 1px solid #E2E7D8;
    color: #334155;
    vertical-align: middle;
  }
  table.items-table tbody tr:last-child td {
    border-bottom: 2px solid #E2E7D8;
  }
  .item-title {
    font-weight: 600;
    color: #0f172a;
  }
  .totals-container {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 28px;
  }
  .totals-table {
    width: 280px;
  }
  .totals-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 12px;
    color: #475569;
  }
  .totals-row.discount {
    color: #166534;
  }
  .totals-grand {
    display: flex;
    justify-content: space-between;
    padding: 10px 14px;
    background: #34451D;
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    border-radius: 6px;
    margin-top: 8px;
  }
  .perks-card {
    background: #FAFAF8;
    border: 1px solid #E2E7D8;
    border-radius: 6px;
    padding: 14px 18px;
    margin-bottom: 24px;
  }
  .perks-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    margin-top: 8px;
  }
  .perk-item {
    font-size: 11.5px;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .perk-bullet {
    color: #596B32;
    font-weight: bold;
  }
  .inv-footer {
    border-top: 1px solid #E2E7D8;
    padding-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #64748b;
  }
  .inv-footer strong {
    color: #334155;
  }
  @media print {
    body {
      background: #ffffff;
    }
    .toolbar {
      display: none !important;
    }
    .invoice-wrapper {
      margin: 0;
      padding: 0;
      border: none;
      box-shadow: none;
      max-width: 100%;
    }
  }
`;

function openHtmlPrintWindow(title: string, bodyContent: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${getBaseStyles()}</style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">${title}</div>
    <div class="toolbar-actions">
      <button class="btn btn-primary" onclick="window.print()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save as PDF
      </button>
      <button class="btn btn-secondary" onclick="window.close()">Close</button>
    </div>
  </div>
  <div class="invoice-wrapper">
    ${bodyContent}
  </div>
  <script>
    // Prompt print dialog after loading
    window.addEventListener('load', () => {
      setTimeout(() => { window.print(); }, 400);
    });
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=900,height=1000,scrollbars=yes');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

/**
 * Generate standard clean order invoice PDF
 */
export function printOrderInvoice(order: OrderInvoiceData) {
  const invoiceNo = order.invoiceNo || (order.orderId ? `INV-${order.orderId.replace('ORD-', '')}` : 'INV-0000');
  const items = order.items && order.items.length > 0
    ? order.items
    : [{ title: 'Book Order Item(s)', qty: 1, price: order.total }];

  const subtotal = order.subtotal || order.total;
  const discount = order.discount || 0;
  const grandTotal = order.total;

  const content = `
    <div class="inv-header">
      <div>
        <div class="brand-title">Sarasavi Pages</div>
        <div class="brand-sub">
          Sarasavi Pages (Pvt) Ltd. &bull; Colombo 03, Sri Lanka<br />
          Email: support@sarasavipages.lk &bull; Tel: +94 11 234 5678<br />
          Company Reg: PV 00123456 &bull; VAT No: 123456789-7000
        </div>
      </div>
      <div class="inv-title-box">
        <div class="inv-heading">Tax Invoice</div>
        <div class="inv-number">No: ${invoiceNo}</div>
        <div class="badge-paid">Paid &bull; Verified</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card-box">
        <div class="card-label">Billed To</div>
        <div class="card-value">
          <strong>${order.customer || 'Valued Customer'}</strong><br />
          ${order.email ? `${order.email}<br />` : ''}
          ${order.phone ? `${order.phone}<br />` : ''}
          ${order.address ? `Delivery Address: ${order.address}<br />` : ''}
        </div>
      </div>
      <div class="card-box">
        <div class="card-label">Order Details</div>
        <div class="card-value">
          ${order.orderId ? `<strong>Order ID:</strong> ${order.orderId}<br />` : ''}
          <strong>Date:</strong> ${order.date}<br />
          <strong>Payment:</strong> ${order.paymentMethod || 'Online Payment'}<br />
          ${order.courier ? `<strong>Courier:</strong> ${order.courier} ${order.tracking ? `(${order.tracking})` : ''}<br />` : ''}
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th class="text-center" style="width: 70px;">Qty</th>
          <th class="text-right" style="width: 120px;">Unit Price (LKR)</th>
          <th class="text-right" style="width: 130px;">Amount (LKR)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td><div class="item-title">${item.title}</div></td>
            <td class="text-center">${item.qty}</td>
            <td class="text-right">${item.price.toFixed(2)}</td>
            <td class="text-right font-weight:600;">${(item.price * item.qty).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals-container">
      <div class="totals-table">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>LKR ${subtotal.toFixed(2)}</span>
        </div>
        ${discount > 0 ? `
          <div class="totals-row discount">
            <span>Discount</span>
            <span>- LKR ${discount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="totals-row">
          <span>VAT (0%)</span>
          <span>LKR 0.00</span>
        </div>
        <div class="totals-grand">
          <span>Total Paid</span>
          <span>LKR ${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="inv-footer">
      <div>
        <strong>Thank you for choosing Sarasavi Pages!</strong><br />
        This is a computer-generated tax receipt. Valid for official records.
      </div>
      <div style="text-align: right;">
        &copy; ${new Date().getFullYear()} Sarasavi Pages (Pvt) Ltd.<br />
        All rights reserved.
      </div>
    </div>
  `;

  openHtmlPrintWindow(`Sarasavi Pages - Invoice ${invoiceNo}`, content);
}

/**
 * Generate standard clean membership tax invoice PDF
 */
export function printMembershipInvoice(inv: MembershipInvoiceData) {
  const isPremium = inv.plan.toLowerCase().includes('premium');
  const perks = inv.perks && inv.perks.length > 0 ? inv.perks : (
    isPremium
      ? ['20% storewide book discount', 'Unlimited free islandwide delivery', 'Priority VIP customer support', 'Academic book borrowing tier']
      : ['10% storewide book discount', 'Free shipping on orders over LKR 2,000', 'Priority customer support', 'Early access to book drops']
  );

  const price = inv.price;
  const discount = inv.discount || 0;
  const total = inv.total !== undefined ? inv.total : (price - discount);

  const content = `
    <div class="inv-header">
      <div>
        <div class="brand-title">Sarasavi Pages</div>
        <div class="brand-sub">
          Sarasavi Pages (Pvt) Ltd. &bull; Colombo 03, Sri Lanka<br />
          Email: support@sarasavipages.lk &bull; Tel: +94 11 234 5678<br />
          Official Membership Tax Invoice
        </div>
      </div>
      <div class="inv-title-box">
        <div class="inv-heading">Tax Invoice</div>
        <div class="inv-number">No: ${inv.invoiceNo}</div>
        <div class="badge-paid">Paid &bull; Verified</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card-box">
        <div class="card-label">Member Details</div>
        <div class="card-value">
          <strong>${inv.customer || 'Member'}</strong><br />
          ${inv.email ? `${inv.email}<br />` : ''}
          ${inv.phone ? `${inv.phone}<br />` : ''}
          ${inv.customerId ? `Member ID: ${inv.customerId}<br />` : ''}
        </div>
      </div>
      <div class="card-box">
        <div class="card-label">Subscription Terms</div>
        <div class="card-value">
          <strong>Tier Plan:</strong> ${inv.plan}<br />
          <strong>Validity:</strong> ${inv.duration}<br />
          <strong>Issue Date:</strong> ${inv.date}<br />
          <strong>Status:</strong> Active &bull; Full Privileges<br />
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Plan Description</th>
          <th class="text-center" style="width: 100px;">Duration</th>
          <th class="text-right" style="width: 130px;">Amount (LKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-title">${inv.plan} Membership</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
              Sarasavi Pages reader privileges, digital catalog discounts & library access.
            </div>
          </td>
          <td class="text-center">${inv.duration}</td>
          <td class="text-right font-weight:600;">${price.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals-container">
      <div class="totals-table">
        <div class="totals-row">
          <span>Base Fee</span>
          <span>LKR ${price.toFixed(2)}</span>
        </div>
        ${discount > 0 ? `
          <div class="totals-row discount">
            <span>Promo Discount</span>
            <span>- LKR ${discount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="totals-row">
          <span>VAT (0%)</span>
          <span>LKR 0.00</span>
        </div>
        <div class="totals-grand">
          <span>Total Paid</span>
          <span>LKR ${total.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="perks-card">
      <div class="card-label">Active Membership Perks</div>
      <div class="perks-grid">
        ${perks.map(p => `
          <div class="perk-item">
            <span class="perk-bullet">&bull;</span>
            <span>${p}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="inv-footer">
      <div>
        <strong>Thank you for being part of Sarasavi Pages!</strong><br />
        Computer-generated receipt. Official Sarasavi Pages Membership confirmation.
      </div>
      <div style="text-align: right;">
        &copy; ${new Date().getFullYear()} Sarasavi Pages (Pvt) Ltd.<br />
        All rights reserved.
      </div>
    </div>
  `;

  openHtmlPrintWindow(`Sarasavi Pages - Membership Invoice ${inv.invoiceNo}`, content);
}

/**
 * Generate standard clean payment receipt PDF
 */
export function printPaymentReceipt(item: PaymentReceiptData) {
  const content = `
    <div class="inv-header">
      <div>
        <div class="brand-title">Sarasavi Pages</div>
        <div class="brand-sub">
          Sarasavi Pages (Pvt) Ltd. &bull; Colombo 03, Sri Lanka<br />
          Official Payment Receipt &bull; support@sarasavipages.lk
        </div>
      </div>
      <div class="inv-title-box">
        <div class="inv-heading">Payment Receipt</div>
        <div class="inv-number">No: ${item.invoiceNo}</div>
        <div class="badge-paid">${item.status || 'PAID'}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card-box">
        <div class="card-label">Received From</div>
        <div class="card-value">
          <strong>${item.customerName}</strong><br />
          ${item.customerId ? `Customer ID: ${item.customerId}<br />` : ''}
        </div>
      </div>
      <div class="card-box">
        <div class="card-label">Transaction Information</div>
        <div class="card-value">
          <strong>Date:</strong> ${item.date}<br />
          <strong>Method:</strong> ${item.method || 'Credit Card'}<br />
          ${item.reference ? `<strong>Reference:</strong> ${item.reference}<br />` : ''}
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right" style="width: 140px;">Amount Paid (LKR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="item-title">${item.description || 'Payment for Bookstore Purchase / Order'}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              Reference: ${item.reference || item.invoiceNo}
            </div>
          </td>
          <td class="text-right font-weight:600;">${item.amount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals-container">
      <div class="totals-table">
        <div class="totals-grand">
          <span>Total Received</span>
          <span>LKR ${item.amount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="inv-footer">
      <div>
        <strong>Thank you for your payment!</strong><br />
        This is an official computer-generated receipt issued by Sarasavi Pages.
      </div>
      <div style="text-align: right;">
        &copy; ${new Date().getFullYear()} Sarasavi Pages (Pvt) Ltd.
      </div>
    </div>
  `;

  openHtmlPrintWindow(`Sarasavi Pages - Receipt ${item.invoiceNo}`, content);
}
