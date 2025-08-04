
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { FormItem } from "@/components/ui/form";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  length?: number;  // Added length dimension
  width?: number;   // Added width dimension
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onReset: () => void;
  payment: number;
  onPaymentChange: (amount: number) => void;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  deadline: string;
  onDeadlineChange: (date: string) => void;
}

const Cart = ({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  onReset,
  payment,
  onPaymentChange,
  customerName,
  onCustomerNameChange,
  deadline,
  onDeadlineChange
}: CartProps) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const change = payment - total;
  const paymentStatus = payment >= total ? "Lunas" : "Dp";
  
  // Check if any items have quantity of 0 or if payment is empty
  const hasZeroQuantity = items.some(item => item.quantity === 0);
  const isPaymentEmpty = payment === 0 || payment === null;

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Daftar Pembelian</h2>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{item.name}</p>
                {item.length && item.width && (
                  <p className="text-xs text-gray-500">Ukuran: {item.length} x {item.width}</p>
                )}
                <p className="text-sm text-gray-600">Rp. {item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onUpdateQuantity(item.id, Number(e.target.value))}
                  className="w-20"
                  min="1"
                />
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-bold">Rp. {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Kembali:</span>
            <span className="font-bold">Rp. {change.toLocaleString()}</span>
          </div>
          <div className="space-y-2">
            <Label>Pelanggan:</Label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Masukkan nama pelanggan"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Deadline:</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => onDeadlineChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Bayar:</Label>
            <Input
              type="number"
              value={payment}
              onChange={(e) => onPaymentChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Status:</Label>
            <Input
              type="text"
              value={paymentStatus}
              readOnly
              className="w-full bg-gray-50"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onCheckout}
              className="flex-1"
              disabled={items.length === 0 || hasZeroQuantity || isPaymentEmpty}
            >
              Cetak nota
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              disabled={items.length === 0}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Cart;
