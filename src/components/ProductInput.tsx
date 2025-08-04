import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Calculator } from "lucide-react";

interface Product {
  id: string;
  name: string;
  length: number;
  width: number;
  price: number;
  stock: number;
  description: string;
  unit: string;
}

const ProductInput = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>({
    id: '',
    name: '',
    length: 0,
    width: 0,
    price: 0,
    stock: 0,
    description: '',
    unit: '0'  // Changed default value to '0'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(storedProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (isEditing) {
      const updatedProducts = storedProducts.map((p: Product) =>
        p.id === product.id ? product : p
      );
      localStorage.setItem('products', JSON.stringify(updatedProducts));
      toast.success('Produk berhasil diperbarui');
      setIsEditing(false);
    } else {
      const newProduct = { ...product, id: Date.now().toString() };
      localStorage.setItem('products', JSON.stringify([...storedProducts, newProduct]));
      toast.success('Produk berhasil ditambahkan');
    }

    setProduct({ id: '', name: '', length: 0, width: 0, price: 0, stock: 0, description: '', unit: '0' });
    loadProducts();
  };

  const handleEdit = (productToEdit: Product) => {
    setProduct(productToEdit);
    setIsEditing(true);
  };

  const handleDelete = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    toast.success('Produk berhasil dihapus');
  };

  const handleCancel = () => {
    setProduct({ id: '', name: '', length: 0, width: 0, price: 0, stock: 0, description: '', unit: '0' });
    setIsEditing(false);
  };

  const handleCalculate = () => {
    const area = product.length * product.width;
    const calculatedPrice = area * Number(product.unit);
    setProduct({ ...product, price: calculatedPrice });
    toast.info(`Luas: ${area} cm² | Harga: Rp ${calculatedPrice.toLocaleString()}`);
    setAutoCalculate(true);
  };

  useEffect(() => {
    if (autoCalculate && product.length > 0 && product.width > 0 && Number(product.unit) > 0) {
      const area = product.length * product.width;
      const calculatedPrice = area * Number(product.unit);
      setProduct(prev => ({ ...prev, price: calculatedPrice }));
    }
  }, [product.length, product.width, product.unit, autoCalculate]);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input
            id="name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Harga Banner</Label>
          <Input
            id="unit"
            value={product.unit}
            onChange={(e) => setProduct({ ...product, unit: e.target.value })}
            type="number"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="length">Panjang</Label>
            <Input
              id="length"
              type="number"
              value={product.length}
              onChange={(e) => setProduct({ ...product, length: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="width">Lebar</Label>
            <div className="flex gap-2">
              <Input
                id="width"
                type="number"
                value={product.width}
                onChange={(e) => setProduct({ ...product, width: Number(e.target.value) })}
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleCalculate}
                className="flex-shrink-0"
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Harga</Label>
            <Input
              id="price"
              type="number"
              value={product.price}
              onChange={(e) => {
                setProduct({ ...product, price: Number(e.target.value) });
                setAutoCalculate(false);
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stok</Label>
            <Input
              id="stock"
              type="number"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
              required
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            {isEditing ? 'Update Produk' : 'Tambah Produk'}
          </Button>
          {isEditing && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Batal
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-gray-500">Ukuran: {p.length} x {p.width}</p>
                  <p className="text-gray-600">Rp. {p.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Stok: {p.stock}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(p)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductInput;
