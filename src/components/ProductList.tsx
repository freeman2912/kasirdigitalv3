import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Calculator, Plus } from "lucide-react";
import { toast } from "sonner";

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

interface ProductListProps {
  onAddToCart: (product: Product) => void;
  searchQuery: string;
}

const ProductList = ({ onAddToCart, searchQuery }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [autoCalculate, setAutoCalculate] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (autoCalculate && editingProduct && editingProduct.length > 0 && editingProduct.width > 0 && Number(editingProduct.unit) > 0) {
      const area = editingProduct.length * editingProduct.width;
      const calculatedPrice = area * Number(editingProduct.unit);
      setEditingProduct(prev => prev ? { ...prev, price: calculatedPrice } : null);
    }
  }, [editingProduct?.length, editingProduct?.width, editingProduct?.unit, autoCalculate]);

  const loadProducts = () => {
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(storedProducts);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditDialog(true);
    setAutoCalculate(true);
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;

    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedProducts = storedProducts.map((p: Product) =>
      p.id === editingProduct.id ? editingProduct : p
    );
    
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    setShowEditDialog(false);
    setEditingProduct(null);
    toast.success('Produk berhasil diperbarui');
  };

  const handleCalculate = () => {
    if (!editingProduct) return;
    const area = editingProduct.length * editingProduct.width;
    const calculatedPrice = area * Number(editingProduct.unit);
    setEditingProduct({ ...editingProduct, price: calculatedPrice });
    setAutoCalculate(true);
    toast.info(`Luas: ${area} cm² | Harga: Rp ${calculatedPrice.toLocaleString()}`);
  };

  const handleAddToCart = (product: Product) => {
    onAddToCart(product);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-2">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="w-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500">Ukuran: {product.length} x {product.width}</p>
                  <p className="text-gray-600">Rp. {product.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Stok: {product.stock}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="default"
                    size="icon"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Edit Produk</h2>
            {editingProduct && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Harga Banner</Label>
                  <Input
                    id="unit"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      unit: e.target.value
                    })}
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
                      value={editingProduct.length}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        length: Number(e.target.value)
                      })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Lebar</Label>
                    <div className="flex gap-2">
                      <Input
                        id="width"
                        type="number"
                        value={editingProduct.width}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          width: Number(e.target.value)
                        })}
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
                      value={editingProduct.price}
                      onChange={(e) => {
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value)
                        });
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
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value)
                      })}
                      required
                    />
                  </div>
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductList;
