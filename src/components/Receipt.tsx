
import React from 'react';
import { Printer } from "lucide-react";

interface ReceiptProps {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    length?: number;  // Added length dimension
    width?: number;   // Added width dimension
  }>;
  total: number;
  payment: number;
  change: number;
  customerName?: string;
  deadline?: string;
  onClose: () => void;
}

const Receipt = ({ items, total, payment, change, customerName, deadline }: ReceiptProps) => {
  const paymentStatus = payment >= total ? "Lunas" : "Dp";
  const storeData = JSON.parse(localStorage.getItem('storeSettings') || '{}');

  const handlePrint = () => {
    window.print();
  };

  // Helper function to format dimensions
  const formatDimension = (value?: number) => {
    if (value === undefined) return "-";
    return value === 0 ? "-" : value;
  };

  // Format the deadline date for display in dd/mm/yyyy format
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-center space-y-2">
        {storeData.storeName && (
          <h1 className="font-bold text-2xl">{storeData.storeName}</h1>
        )}
        {storeData.address && (
          <p className="text-sm text-gray-600">{storeData.address}</p>
        )}
        {storeData.phoneNumber && (
          <p className="text-sm text-gray-600">HP: {storeData.phoneNumber}</p>
        )}
        <p className="text-sm text-gray-500">{new Date().toLocaleString()}</p>
        {customerName && (
          <p className="text-sm">Pelanggan: {customerName}</p>
        )}
        <p className="text-sm font-semibold">Status: {paymentStatus}</p>
        {deadline && (
          <p className="text-sm">Deadline: {formatDate(deadline)}</p>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>Rp. {(item.price * item.quantity).toLocaleString()}</span>
            </div>
            {(item.length !== undefined || item.width !== undefined) && (
              <p className="text-xs text-gray-500 pl-2">
                Ukuran: {formatDimension(item.length)} x {formatDimension(item.width)}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-2 space-y-1">
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>Rp. {total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Pembayaran</span>
          <span>Rp. {payment.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Kembalian</span>
          <span>Rp. {change.toLocaleString()}</span>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>{storeData.footer || 'Terima kasih atas kunjungan Anda'}</p>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handlePrint}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Cetak"
        >
          <Printer className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Receipt;
