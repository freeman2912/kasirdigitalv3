import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Receipt from '@/components/Receipt';
import { toast } from "sonner";
import WorkOrder from '@/components/WorkOrder';

interface Transaction {
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
}

const SalesJournal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [showWorkOrder, setShowWorkOrder] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editedCustomerName, setEditedCustomerName] = useState('');
  const [editedPayment, setEditedPayment] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return storedTransactions.sort((a: Transaction, b: Transaction) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  const filteredTransactions = transactions.filter(transaction => 
    transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.id.includes(searchQuery) ||
    transaction.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTransactionStatus = (total: number, payment: number) => {
    if (payment >= total) {
      return { label: "Lunas", variant: "default" as const };
    } else {
      return { label: "Dp", variant: "destructive" as const };
    }
  };

  const handlePrintReceipt = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowReceipt(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditedCustomerName(transaction.customerName);
    setEditedPayment(transaction.payment);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTransaction) return;

    const updatedTransactions = transactions.map(t => {
      if (t.id === selectedTransaction.id) {
        const newChange = editedPayment - t.total;
        return {
          ...t,
          customerName: editedCustomerName,
          payment: editedPayment,
          change: newChange
        };
      }
      return t;
    });

    const sortedTransactions = updatedTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    localStorage.setItem('transactions', JSON.stringify(sortedTransactions));
    setTransactions(sortedTransactions);
    setShowEditDialog(false);
    setSelectedTransaction(null);
    toast.success("Transaksi berhasil diperbarui");
  };

  const handleDelete = (transactionId: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setTransactions(updatedTransactions);
    toast.success("Transaksi berhasil dihapus");
  };

  const handleShowWorkOrder = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowWorkOrder(true);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Cari transaksi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTransactions.map((transaction) => {
          const status = getTransactionStatus(transaction.total, transaction.payment);
          return (
            <Card key={transaction.id} className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">Pelanggan: {transaction.customerName || '-'}</div>
                <div className="text-sm text-gray-500">{transaction.date}</div>
              </div>
              
              <Badge variant={status.variant}>{status.label}</Badge>
              
              {transaction.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>Rp. {item.price.toLocaleString()}</span>
                </div>
              ))}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span>Rp. {transaction.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pembayaran</span>
                  <span>Rp. {transaction.payment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kembalian</span>
                  <span>Rp. {transaction.change.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(transaction)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(transaction.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePrintReceipt(transaction)}
                >
                  Cetak
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowWorkOrder(transaction)}
                >
                  Spk
                </Button>
              </div>
            </Card>
          );
        })}
        {filteredTransactions.length === 0 && (
          <div className="col-span-full p-4 text-center text-gray-500">
            Tidak ada transaksi
          </div>
        )}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogTitle>Edit Transaksi</DialogTitle>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nama Pelanggan</label>
              <Input
                value={editedCustomerName}
                onChange={(e) => setEditedCustomerName(e.target.value)}
                placeholder="Nama pelanggan"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Total</label>
              <Input
                type="number"
                value={selectedTransaction?.total || 0}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="mt-1">
                {selectedTransaction && (
                  <Badge
                    variant={getTransactionStatus(
                      selectedTransaction.total,
                      editedPayment
                    ).variant}
                  >
                    {getTransactionStatus(
                      selectedTransaction.total,
                      editedPayment
                    ).label}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Pembayaran</label>
              <Input
                type="number"
                value={editedPayment}
                onChange={(e) => setEditedPayment(Number(e.target.value))}
                placeholder="Jumlah pembayaran"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleSaveEdit}>
                Simpan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTransaction && (
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent>
            <DialogTitle>Struk Penjualan</DialogTitle>
            <Receipt
              items={selectedTransaction.items}
              total={selectedTransaction.total}
              payment={selectedTransaction.payment}
              change={selectedTransaction.change}
              customerName={selectedTransaction.customerName}
              deadline={selectedTransaction.deadline}
              onClose={() => setShowReceipt(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {selectedTransaction && (
        <Dialog open={showWorkOrder} onOpenChange={setShowWorkOrder}>
          <DialogContent>
            <DialogTitle>Surat Perintah Kerja</DialogTitle>
            <WorkOrder
              transaction={selectedTransaction}
              onClose={() => setShowWorkOrder(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SalesJournal;
