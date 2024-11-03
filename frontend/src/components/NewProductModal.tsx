import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getCategories } from '../services/api';
import Button from './Button';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProduct: (productData: ProductData) => Promise<void>;
  categories: Category[];
}

interface ProductData {
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
  minStock: number;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose, onCreateProduct }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    sku: '',
    price: 0,
    quantity: 0,
    minStock: 0,
    categoryId: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductData, string>>>({});

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: fetchedCategories[0].id }));
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProductData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU é obrigatório';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Preço deve ser maior que zero';
    }
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantidade não pode ser negativa';
    }
    if (formData.minStock < 0) {
      newErrors.minStock = 'Estoque mínimo não pode ser negativo';
    }
    if (formData.categoryId === 0) {
      newErrors.categoryId = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    if (['price', 'quantity', 'minStock', 'categoryId'].includes(name)) {
        parsedValue = name === 'price' ? parseFloat(value) : parseInt(value, 10);
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    if (errors[name as keyof ProductData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onCreateProduct(formData);
      onClose();
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: 0,
        quantity: 0,
        minStock: 0,
        categoryId: categories[0]?.id || 0,
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Novo Produto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                id="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  errors.sku ? 'border-red-500' : ''
                }`}
              />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {/* Preço e Quantidade */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Preço *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">R$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full pl-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.price ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Quantidade *
                </label>
                <input
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.quantity ? 'border-red-500' : ''
                  }`}
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="minStock" className="block text-sm font-medium text-gray-700">
                  Estoque Mínimo *
                </label>
                <input
                  type="number"
                  name="minStock"
                  id="minStock"
                  min="0"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.minStock ? 'border-red-500' : ''
                  }`}
                />
                {errors.minStock && <p className="mt-1 text-sm text-red-600">{errors.minStock}</p>}
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Categoria *
                </label>
                <select
                  name="categoryId"
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    errors.categoryId ? 'border-red-500' : ''
                  }`}
                >
                  <option value={0}>Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between space-x-24">
        <Button
            type="button"
            variant="secondary"
            onClick={onClose}
        >
            Cancelar
        </Button>
        <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            disabled={loading}
        >
            Criar Produto
        </Button>
        </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductModal;
