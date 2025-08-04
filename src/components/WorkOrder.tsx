
import React from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

interface WorkOrderProps {
  transaction: {
    id: string;
    date: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      length?: number;
      width?: number;
    }>;
    total: number;
    payment: number;
    change: number;
    customerName: string;
    deadline?: string;
  };
  onClose: () => void;
}

const WorkOrder: React.FC<WorkOrderProps> = ({ transaction, onClose }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  const getStatus = (total: number, payment: number) => {
    if (payment >= total) {
      return "Lunas";
    } else {
      return "Dp";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="text-center space-y-2">
        <p className="text-sm">Pelanggan: {transaction.customerName || '-'}</p>
        <p className="text-sm">Status: {getStatus(transaction.total, transaction.payment)}</p>
        <p className="text-sm text-gray-600">{transaction.date}</p>
        {transaction.deadline && (
          <p className="text-sm">Deadline: {formatDate(transaction.deadline)}</p>
        )}
      </div>

      <div className="space-y-4">
        {transaction.items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <div>
              <div className="font-medium">{item.name} x{item.quantity}</div>
              {(item.length || item.width) && (
                <div className="text-sm text-gray-600">
                  Ukuran: {item.length || '-'} x {item.width || '-'}
                </div>
              )}
            </div>
            <div className="text-right">
              Rp. {item.price.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>Rp. {transaction.total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Pembayaran</span>
          <span>Rp. {transaction.payment.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Kembalian</span>
          <span>Rp. {transaction.change.toLocaleString()}</span>
        </div>
      </div>

      <div className="print:hidden flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
        <Button onClick={handlePrint}>
          Cetak SPK
        </Button>
      </div>
    </div>
  );
};

export default WorkOrder;
