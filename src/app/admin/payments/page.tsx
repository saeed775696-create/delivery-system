'use client';

import { useEffect, useState } from 'react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(setPayments);
  }, []);

  const confirmPayment = async (id: string) => {
    await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: id }),
    });

    location.reload();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>💳 إدارة المدفوعات</h1>

      <table border={1} cellPadding={10} style={{ width: '100%', marginTop: 20 }}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Reference</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <td>{p.orderId}</td>
              <td>{p.amount}</td>
              <td>{p.method}</td>
              <td>{p.status}</td>
              <td>{p.referenceNumber || '-'}</td>

              <td>
                {p.status === 'PENDING' && (
                  <button onClick={() => confirmPayment(p.id)}>
                    ✅ تأكيد
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}