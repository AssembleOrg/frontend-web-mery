'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Edit, Trash2, ToggleLeft, ToggleRight, Gift } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useModal } from '@/contexts/modal-context';
import {
  getCoupons,
  getCategories,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type Coupon,
  type CreateCouponDto,
  type Category,
} from '@/lib/api-client';

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


interface FormData {
  code: string;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  maxUses: string;
  appliesToAll: boolean;
  categoryIds: string[];
  isActive: boolean;
}

const defaultForm: FormData = {
  code: 'mery-10',
  discountPercent: 10,
  validFrom: '',
  validTo: '',
  maxUses: '',
  appliesToAll: false,
  categoryIds: [],
  isActive: true,
};

export default function AdminCuponesPage() {
  const { showConfirm } = useModal();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [couponsData, categoriesResponse] = await Promise.all([
        getCoupons(),
        getCategories(),
      ]);
      setCoupons(couponsData);
      setCategories(categoriesResponse.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateDiscount = (value: number) => {
    setForm((prev) => ({
      ...prev,
      discountPercent: value,
      ...(!codeManuallyEdited && value ? { code: `mery-${value}` } : {}),
    }));
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setCodeManuallyEdited(false);
    setCategorySearch('');
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCodeManuallyEdited(true);
    setCategorySearch('');
    setForm({
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
      validTo: coupon.validTo ? coupon.validTo.split('T')[0] : '',
      maxUses: coupon.maxUses != null ? String(coupon.maxUses) : '',
      appliesToAll: coupon.appliesToAll,
      categoryIds: coupon.categories.map((c) => c.id),
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.validFrom && !form.validTo && !form.maxUses) {
      toast.error('Debe establecer al menos una restricción: fechas o cantidad máxima de usos.');
      return;
    }
    if (!form.appliesToAll && form.categoryIds.length === 0) {
      toast.error('Seleccione categorías o marque "Aplica a todos".');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateCouponDto = {
        code: form.code,
        discountPercent: Number(form.discountPercent),
        isActive: form.isActive,
        appliesToAll: form.appliesToAll,
        ...(form.validFrom && { validFrom: form.validFrom }),
        ...(form.validTo && { validTo: form.validTo }),
        ...(form.maxUses && { maxUses: Number(form.maxUses) }),
        ...(!form.appliesToAll && { categoryIds: form.categoryIds }),
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
        toast.success('Cupón actualizado');
      } else {
        await createCoupon(payload);
        toast.success('Cupón creado');
      }

      setShowModal(false);
      fetchData();
    } catch (error: any) {
      const msg = error?.message || 'Error al guardar el cupón';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    const confirmed = await showConfirm({
      title: 'Eliminar Cupón',
      message: `¿Eliminar el cupón "${coupon.code}"?`,
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    try {
      await deleteCoupon(coupon.id);
      toast.success('Cupón eliminado');
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'No se puede eliminar. Desactivalo en su lugar.');
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? 'Cupón desactivado' : 'Cupón activado');
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || 'Error al cambiar estado');
    }
  };

  const toggleCategory = (catId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter((id) => id !== catId)
        : [...prev.categoryIds, catId],
    }));
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className='space-y-4 font-admin'>
        <div className='h-8 bg-gray-200 rounded w-1/3 animate-pulse' />
        <div className='h-64 bg-gray-100 rounded animate-pulse' />
      </div>
    );
  }

  return (
    <div className='space-y-6 font-admin'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Cupones de Descuento</h1>
          <p className='text-gray-500 text-sm mt-1'>{coupons.length} cupones</p>
        </div>
        <button
          onClick={openCreate}
          className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
        >
          <PlusCircle className='w-4 h-4' />
          Nuevo Cupón
        </button>
      </div>

      {/* Table */}
      {coupons.length === 0 ? (
        <div className='text-center py-16 text-gray-400'>
          <Gift className='w-12 h-12 mx-auto mb-4 opacity-50' />
          <p>No hay cupones creados</p>
        </div>
      ) : (
        <div className='overflow-x-auto bg-white rounded-lg border'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='text-left px-4 py-3 font-medium text-gray-600'>Código</th>
                <th className='text-left px-4 py-3 font-medium text-gray-600'>Descuento</th>
                <th className='text-left px-4 py-3 font-medium text-gray-600'>Categorías</th>
                <th className='text-left px-4 py-3 font-medium text-gray-600'>Vigencia</th>
                <th className='text-left px-4 py-3 font-medium text-gray-600'>Usos</th>
                <th className='text-left px-4 py-3 font-medium text-gray-600'>Estado</th>
                <th className='text-right px-4 py-3 font-medium text-gray-600'>Acciones</th>
              </tr>
            </thead>
            <tbody className='divide-y'>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-3 font-semibold'>{coupon.code}</td>
                  <td className='px-4 py-3'>
                    <span className='bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium'>
                      {coupon.discountPercent}%
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    {coupon.appliesToAll ? (
                      <span className='text-xs text-gray-500 italic'>Todos</span>
                    ) : (
                      <div className='flex flex-wrap gap-1'>
                        {coupon.categories.map((c) => (
                          <span key={c.id} className='bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs'>
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className='px-4 py-3 text-xs text-gray-500'>
                    {coupon.validFrom || coupon.validTo
                      ? `${formatDateDisplay(coupon.validFrom)} — ${formatDateDisplay(coupon.validTo)}`
                      : '—'}
                  </td>
                  <td className='px-4 py-3 tabular-nums'>
                    {coupon.currentUses}{coupon.maxUses != null ? ` / ${coupon.maxUses}` : ' / \u221E'}
                  </td>
                  <td className='px-4 py-3'>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {coupon.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex justify-end gap-2'>
                      <button onClick={() => openEdit(coupon)} className='p-1.5 text-gray-400 hover:text-blue-600 transition-colors' title='Editar'>
                        <Edit className='w-4 h-4' />
                      </button>
                      <button onClick={() => handleToggleActive(coupon)} className='p-1.5 text-gray-400 hover:text-purple-600 transition-colors' title={coupon.isActive ? 'Desactivar' : 'Activar'}>
                        {coupon.isActive ? <ToggleRight className='w-4 h-4' /> : <ToggleLeft className='w-4 h-4' />}
                      </button>
                      {coupon.currentUses === 0 && (
                        <button onClick={() => handleDelete(coupon)} className='p-1.5 text-gray-400 hover:text-red-600 transition-colors' title='Eliminar'>
                          <Trash2 className='w-4 h-4' />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4'>
            <div className='px-6 py-4 border-b flex justify-between items-center'>
              <h2 className='text-lg font-bold'>{editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl'>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>* Porcentaje de descuento</label>
                  <input
                    type='number'
                    min={1}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => updateDiscount(Number(e.target.value))}
                    className='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>* Código del cupón</label>
                  <input
                    type='text'
                    value={form.code}
                    onChange={(e) => { setForm((prev) => ({ ...prev, code: e.target.value })); setCodeManuallyEdited(true); }}
                    className='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300'
                    placeholder='mery-20'
                    required
                  />
                  <p className='text-xs text-gray-400 mt-1'>Se auto-genera con el %, podés personalizarlo</p>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Válido desde</label>
                  <input
                    type='date'
                    value={form.validFrom}
                    onChange={(e) => setForm((prev) => ({ ...prev, validFrom: e.target.value }))}
                    className='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Válido hasta</label>
                  <input
                    type='date'
                    value={form.validTo}
                    onChange={(e) => setForm((prev) => ({ ...prev, validTo: e.target.value }))}
                    className='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Cantidad máxima de usos</label>
                  <input
                    type='number'
                    min={1}
                    value={form.maxUses}
                    onChange={(e) => setForm((prev) => ({ ...prev, maxUses: e.target.value }))}
                    placeholder='Vacío = ilimitado'
                    className='w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-300'
                  />
                </div>
                <div className='flex items-end pb-2'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={form.isActive}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className='w-4 h-4 text-purple-600 rounded'
                    />
                    <span className='text-sm text-gray-700'>Cupón activo</span>
                  </label>
                </div>
              </div>

              {!form.validFrom && !form.validTo && !form.maxUses && (
                <p className='text-xs text-red-500'>Debe establecer al menos una restricción: fechas o cantidad máxima de usos.</p>
              )}

              <div className='border-t pt-4'>
                <div className='flex items-center justify-between mb-3'>
                  <label className='text-sm font-medium text-gray-700'>Categorías donde aplica *</label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={form.appliesToAll}
                      onChange={(e) => setForm((prev) => ({ ...prev, appliesToAll: e.target.checked }))}
                      className='w-4 h-4 text-purple-600 rounded'
                    />
                    <span className='text-sm text-gray-600'>Aplica a todos</span>
                  </label>
                </div>

                {!form.appliesToAll && (
                  <>
                    <input
                      type='text'
                      placeholder='Buscar categoría...'
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className='w-full px-3 py-2 border rounded-lg text-sm mb-3 focus:ring-2 focus:ring-purple-300'
                    />
                    <div className='max-h-48 overflow-y-auto space-y-1.5 border rounded-lg p-2'>
                      {filteredCategories.length === 0 ? (
                        <p className='text-center text-gray-400 text-sm py-4'>No se encontraron categorías</p>
                      ) : (
                        filteredCategories.map((cat) => (
                          <label
                            key={cat.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                              form.categoryIds.includes(cat.id) ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                            }`}
                          >
                            <input
                              type='checkbox'
                              checked={form.categoryIds.includes(cat.id)}
                              onChange={() => toggleCategory(cat.id)}
                              className='w-4 h-4 text-purple-600 rounded'
                            />
                            <div>
                              <span className='text-sm font-medium'>{cat.name}</span>
                              <span className='text-xs text-gray-400 ml-2'>
                                ${Number(cat.priceARS).toLocaleString('es-AR')}
                              </span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    {form.categoryIds.length > 0 && (
                      <p className='text-xs text-gray-500 mt-2'>
                        {form.categoryIds.length} categoría{form.categoryIds.length !== 1 ? 's' : ''} seleccionada{form.categoryIds.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors'
                >
                  {isSubmitting ? 'Guardando...' : editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
