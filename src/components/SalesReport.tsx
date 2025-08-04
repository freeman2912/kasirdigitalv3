
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DailySalesReport from '@/components/DailySalesReport';
import MonthlySalesReport from '@/components/MonthlySalesReport';

const SalesReport = () => {
  return (
    <Tabs defaultValue="daily" className="space-y-4">
      <TabsList>
        <TabsTrigger value="daily">Laporan Harian</TabsTrigger>
        <TabsTrigger value="monthly">Laporan Bulanan</TabsTrigger>
      </TabsList>
      
      <TabsContent value="daily">
        <DailySalesReport />
      </TabsContent>
      
      <TabsContent value="monthly">
        <MonthlySalesReport />
      </TabsContent>
    </Tabs>
  );
};

export default SalesReport;
