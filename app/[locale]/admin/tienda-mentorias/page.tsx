'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ExternalLink, Loader2, Store } from 'lucide-react';
import {
  shopApi,
  type AdminShopPack,
  type AdminShopProduct,
  type AdminShopPromo,
} from '@/lib/mentorship-shop-api';
import { OrdersTab } from '@/components/mentorship-shop/admin/orders-tab';
import { ProductsTab } from '@/components/mentorship-shop/admin/products-tab';
import { PacksTab } from '@/components/mentorship-shop/admin/packs-tab';
import { PromosTab } from '@/components/mentorship-shop/admin/promos-tab';

type Tab = 'compras' | 'mentorias' | 'packs' | 'promos';

export default function AdminTiendaMentoriasPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const [tab, setTab] = useState<Tab>('compras');
  const [pendingCount, setPendingCount] = useState(0);
  const [products, setProducts] = useState<AdminShopProduct[] | null>(null);
  const [packs, setPacks] = useState<AdminShopPack[]>([]);
  const [promos, setPromos] = useState<AdminShopPromo[]>([]);

  const loadCatalog = useCallback(async () => {
    try {
      const [pr, pa, po] = await Promise.all([shopApi.adminProducts(), shopApi.adminPacks(), shopApi.adminPromos()]);
      setProducts(pr);
      setPacks(pa);
      setPromos(po);
    } catch (e) {
      toast.error((e as Error).message);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'compras', label: 'Compras', badge: pendingCount || undefined },
    { key: 'mentorias', label: 'Mentorías' },
    { key: 'packs', label: 'Packs' },
    { key: 'promos', label: 'Promos' },
  ];

  return (
    <div className='mx-auto w-full max-w-4xl px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-6 min-h-[100dvh]'>
      <div className='mb-5 flex items-center justify-between gap-3'>
        <h1 className='flex items-center gap-2 text-lg sm:text-xl font-primary-medium font-bold text-foreground'>
          <Store className='w-5 h-5 sm:w-6 sm:h-6 text-[#EBA2A8]' />
          Tienda de mentorías
        </h1>
        <Link
          href={`/${locale}/mentorias`}
          target='_blank'
          className='inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted'
        >
          Ver tienda <ExternalLink className='w-3.5 h-3.5' />
        </Link>
      </div>

      <div className='mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-[#1c1c1e] p-1.5 shadow-sm [scrollbar-width:none]' role='tablist'>
        {tabs.map((t) => (
          <button
            key={t.key}
            type='button'
            role='tab'
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-xs sm:text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
              tab === t.key ? 'bg-[#EBA2A8] text-[#1c1c1e] shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {t.label}
            {t.badge != null && (
              <span
                className={`min-w-5 h-5 px-1 rounded-full text-[11px] tabular-nums flex items-center justify-center ${
                  tab === t.key ? 'bg-[#1c1c1e] text-[#EBA2A8]' : 'bg-[#EBA2A8] text-[#1c1c1e]'
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'compras' && <OrdersTab onPendingCount={setPendingCount} />}
      {tab !== 'compras' && products === null && (
        <div className='flex justify-center py-16'>
          <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
        </div>
      )}
      {tab === 'mentorias' && products && (
        <ProductsTab
          products={products}
          onSaved={(p) => setProducts((list) => (list ?? []).map((x) => (x.id === p.id ? p : x)))}
        />
      )}
      {tab === 'packs' && products && <PacksTab packs={packs} products={products} onChanged={() => void loadCatalog()} />}
      {tab === 'promos' && products && <PromosTab promos={promos} products={products} onChanged={() => void loadCatalog()} />}
    </div>
  );
}
