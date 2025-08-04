import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  payment: number;
  change: number;
  customerName: string;
}

const DailySalesReport = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(storedTransactions);
  }, []);

  useEffect(() => {
    if (transactions.length > 0 && date) {
      const selectedDate = format(date, 'dd/MM/yyyy');
      
      const filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return format(transactionDate, 'dd/MM/yyyy') === selectedDate;
      });
      
      setFilteredTransactions(filtered);
      
      const total = filtered.reduce((sum, transaction) => sum + transaction.total, 0);
      setTotalSales(total);
      
      const items = filtered.reduce((sum, transaction) => {
        return sum + transaction.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      }, 0);
      setTotalItems(items);
      
      setTotalTransactions(filtered.length);
    }
  }, [transactions, date]);

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    
    try {
      const exportData = filteredTransactions.map((transaction, index) => ({
        'No': index + 1,
        'Waktu': new Date(transaction.date).toLocaleTimeString(),
        'Pelanggan': transaction.customerName || '-',
        'Total Item': transaction.items.reduce((sum, item) => sum + item.quantity, 0),
        'Total Harga': `Rp. ${transaction.total.toLocaleString()}`,
        'Status': transaction.payment >= transaction.total ? 'Lunas' : 'DP'
      }));
      
      const summaryData = [
        { 'No': '', 'Waktu': '', 'Pelanggan': '', 'Total Item': 'Total Penjualan:', 'Total Harga': `Rp. ${totalSales.toLocaleString()}`, 'Status': '' },
        { 'No': '', 'Waktu': '', 'Pelanggan': '', 'Total Item': 'Total Transaksi:', 'Total Harga': totalTransactions, 'Status': '' },
        { 'No': '', 'Waktu': '', 'Pelanggan': '', 'Total Item': 'Total Item Terjual:', 'Total Harga': totalItems, 'Status': '' }
      ];
      
      const ws = XLSX.utils.json_to_sheet([...exportData, ...summaryData]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Harian");
      
      const fileName = `Laporan_Harian_${format(date, 'dd-MM-yyyy')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success("Laporan berhasil didownload");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengexport laporan");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Laporan Penjualan Harian</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportExcel}
          disabled={filteredTransactions.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center justify-start text-left font-normal w-[240px]"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pilih tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-800">Total Penjualan</p>
          <p className="text-2xl font-bold">Rp. {totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Jumlah Transaksi</p>
          <p className="text-2xl font-bold">{totalTransactions}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-800">Total Item Terjual</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.date).toLocaleTimeString()}
                </TableCell>
                <TableCell>{transaction.customerName || '-'}</TableCell>
                <TableCell>{transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                <TableCell className="text-right">Rp. {transaction.total.toLocaleString()}</TableCell>
                <TableCell>
                  {transaction.payment >= transaction.total ? 
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Lunas</span> : 
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">DP</span>
                  }
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Tidak ada transaksi pada tanggal ini
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DailySalesReport;
