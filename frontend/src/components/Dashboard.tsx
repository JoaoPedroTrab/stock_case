import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, Package, AlertTriangle, FolderPlus } from 'lucide-react';
import NewProductModal from './NewProductModal';
import NewCategoryModal from './NewCategoryModal';
import { getProducts, createProduct, getCategories, createCategory, deleteProduct, updateProduct } from '../services/api';
import Button from './Button';
import { formatCurrency } from '../utils/format';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface BaseProduct {
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
  minStock: number;
  categoryId: number;
  imageUrl?: string | File;
}

interface Product extends BaseProduct {
  id: number;
  imageUrl?: string;
  category?: Category;
}

interface CreateProduct extends BaseProduct {}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState<number | ''>('');
  const [editPrice, setEditPrice] = useState<number | ''>('');

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Falha ao carregar categorias.');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Falha ao carregar produtos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]);
  }, [fetchProducts, fetchCategories]);

  const handleCreateProduct = async (productData: CreateProduct) => {
    try {
      const newProduct = await createProduct(productData);
      setProducts(prevProducts => [...prevProducts, newProduct]);
      setIsNewProductModalOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
      setError('Falha ao criar produto, tente novamente.');
    }
  };

  const handleCreateCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory = await createCategory(categoryData);
      setCategories(prevCategories => [...prevCategories, newCategory]);
      setIsNewCategoryModalOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Falha ao criar categoria, tente novamente.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditQuantity(product.quantity);
    setEditPrice(product.price);
    setIsEditing(true);
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      const updatedData = {
        ...editingProduct,
        quantity: editQuantity !== '' ? editQuantity : editingProduct.quantity,
        price: editPrice !== '' ? editPrice : editingProduct.price,
      };
  
      try {
        const updatedProduct = await updateProduct(editingProduct.id, updatedData);
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === updatedProduct.id ? updatedProduct : product
          )
        );
        setIsEditing(false);
        setEditingProduct(null);
      } catch (error) {
        console.error('Error updating product:', error);
        setError('Falha ao atualizar produto, tente novamente.');
      }
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await deleteProduct(productId);
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Falha ao deletar produto, tente novamente.');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.categoryId === selectedCategory)
    : products;

  if (loading) return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Controle de Estoque</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Olá, {user?.name}</span>
              <Button onClick={handleLogout} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Produtos em Estoque</h2>
            <div className="flex space-x-4">
              <Button
                onClick={() => setIsNewCategoryModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
              <Button
                onClick={() => setIsNewProductModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="relative">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {product.quantity <= product.minStock && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    {categories.find(c => c.id === product.categoryId)?.name}
                  </p>
                  <p className="text-lg font-semibold text-indigo-600">{formatCurrency(product.price)}</p>
                  <p className="text-sm text-gray-500">Estoque: {product.quantity}</p>

                  <div className="flex justify-between mt-4 space-x-2">
                    <Button onClick={() => handleEditProduct(product)} className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                      Editar
                    </Button>
                    <Button onClick={() => handleDeleteProduct(product.id)} className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)}
        onCreateProduct={handleCreateProduct}
        categories={categories}
      />
      <NewCategoryModal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        onCreateCategory={handleCreateCategory}
      />

      {isEditing && editingProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Editar Produto</h2>
            <div className="mb-4">
              <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700">
                Quantidade
              </label>
              <input
                type="number"
                id="editQuantity"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={editQuantity}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="editPrice" className="block text-sm font-medium text-gray-700">
                Preço
              </label>
              <input
                type="number"
                id="editPrice"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsEditing(false)} className="text-sm bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2">
                Cancelar
              </Button>
              <Button onClick={handleUpdateProduct} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
