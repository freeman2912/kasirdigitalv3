
import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Bar, 
  BarChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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

const MonthlySalesReport = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [monthlySales, setMonthlySales] = useState<{date: string, sales: number}[]>([]);
  const [totalMonthlySales, setTotalMonthlySales] = useState(0);
  const [totalMonthlyTransactions, setTotalMonthlyTransactions] = useState(0);
  
  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(storedTransactions);
  }, []);

  useEffect(() => {
    if (transactions.length > 0 && selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));
      
      const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
      
      const initialDailySales = daysInMonth.map(day => ({
        date: format(day, 'yyyy-MM-dd'),
        sales: 0
      }));
      
      const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === month - 1 && 
          transactionDate.getFullYear() === year
        );
      });
      
      const dailySalesMap = new Map();
      monthlyTransactions.forEach(transaction => {
        const date = format(new Date(transaction.date), 'yyyy-MM-dd');
        const currentSales = dailySalesMap.get(date) || 0;
        dailySalesMap.set(date, currentSales + transaction.total);
      });
      
      const dailySales = initialDailySales.map(day => ({
        date: day.date,
        sales: dailySalesMap.get(day.date) || 0
      }));
      
      setMonthlySales(dailySales);
      
      const totalSales = monthlyTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
      setTotalMonthlySales(totalSales);
      
      setTotalMonthlyTransactions(monthlyTransactions.length);
    }
  }, [transactions, selectedMonth]);

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      const value = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy');
      options.push({ value, label });
    }
    
    return options;
  };

  const handleExportExcel = () => {
    if (monthlySales.length === 0 || totalMonthlySales === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    
    try {
      const wb = XLSX.utils.book_new();
      
      const dailySalesData = monthlySales.map((day, index) => ({
        'Tanggal': format(parseISO(day.date), 'dd MMMM yyyy'),
        'Penjualan': `Rp. ${day.sales.toLocaleString()}`
      }));
      
      const dailySalesWS = XLSX.utils.json_to_sheet(dailySalesData);
      XLSX.utils.book_append_sheet(wb, dailySalesWS, "Penjualan Harian");
      
      const summaryData = [
        { 'Keterangan': 'Total Penjualan Bulan Ini', 'Nilai': `Rp. ${totalMonthlySales.toLocaleString()}` },
        { 'Keterangan': 'Jumlah Transaksi Bulan Ini', 'Nilai': totalMonthlyTransactions }
      ];
      
      const summaryWS = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWS, "Ringkasan");
      
      const [year, month] = selectedMonth.split('-');
      const monthName = format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMMM');
      const fileName = `Laporan_Bulanan_${monthName}_${year}.xlsx`;
      
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
        <h2 className="text-xl font-bold">Laporan Penjualan Bulanan</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportExcel}
          disabled={monthlySales.length === 0 || totalMonthlySales === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Excel
        </Button>
      </div>
      
      <div className="w-[240px]">
        <Select
          value={selectedMonth}
          onValueChange={setSelectedMonth}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih bulan" />
          </SelectTrigger>
          <SelectContent>
            {getMonthOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-800">Total Penjualan Bulan Ini</p>
          <p className="text-2xl font-bold">Rp. {totalMonthlySales.toLocaleString()}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Jumlah Transaksi Bulan Ini</p>
          <p className="text-2xl font-bold">{totalMonthlyTransactions}</p>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Grafik Penjualan Harian</h3>
        <div className="h-[300px]">
          <ChartContainer 
            config={{ 
              sales: { 
                color: "#4f46e5",
                label: "Penjualan"
              } 
            }}
          >
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(parseISO(value), 'dd')}
              />
              <YAxis />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow-lg">
                        <p className="font-medium">
                          {payload[0].payload.date ? format(parseISO(payload[0].payload.date), 'dd MMMM yyyy') : ''}
                        </p>
                        <p>
                          Penjualan: Rp. {Number(payload[0].value).toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="sales" fill="#4f46e5" />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesReport;
