
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const StoreSettings = () => {
  const [storeName, setStoreName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [footer, setFooter] = useState('');

  useEffect(() => {
    const storeData = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    setStoreName(storeData.storeName || '');
    setPhoneNumber(storeData.phoneNumber || '');
    setAddress(storeData.address || '');
    setFooter(storeData.footer || '');
  }, []);

  const handleUpdate = () => {
    const storeData = {
      storeName,
      phoneNumber,
      address,
      footer
    };
    localStorage.setItem('storeSettings', JSON.stringify(storeData));
    toast.success('Data toko berhasil diperbarui');
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h2 className="text-xl font-bold">Data Toko</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Toko</Label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Masukkan nama toko"
            />
          </div>
          <div className="space-y-2">
            <Label>Alamat</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masukkan alamat toko"
            />
          </div>
          <div className="space-y-2">
            <Label>No. HP</Label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Masukkan nomor HP"
            />
          </div>
          <div className="space-y-2">
            <Label>Footer</Label>
            <Textarea
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="Masukkan footer"
            />
          </div>
          <Button onClick={handleUpdate}>Update Data</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreSettings;
