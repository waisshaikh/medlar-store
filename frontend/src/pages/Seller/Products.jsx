import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ExternalLink, Package, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getSellerProducts, deleteProduct } from "../../services/product.api.js";
import { PageHeader, Panel, StatusBadge, Spinner, EmptyState, inputCls, btnPrimary } from "../../components/Seller/ui.jsx";
import { formatINR, productImage, apiError } from "../../utils/format.js";

export default function Products() {
  const [products, setProducts] = useState(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    getSellerProducts().then((res) => setProducts(res.data.products)).catch(() => { setProducts([]); toast.error("Failed to load products"); });
  }, []);

  const categories = useMemo(() => [...new Set((products || []).map((p) => p.category))], [products]);
  const filtered = (products || []).filter((p) => (!category || p.category === category) && p.tittle.toLowerCase().includes(q.toLowerCase()));

  const remove = async (p) => {
    if (!window.confirm(`Remove "${p.tittle}" from the catalog? Past orders keep their details.`)) return;
    try {
      await deleteProduct(p._id);
      setProducts((list) => list.filter((x) => x._id !== p._id));
      toast.success("Product removed");
    } catch (err) { toast.error(apiError(err, "Failed to remove product")); }
  };

  return (
    <div data-testid="seller-products-page">
      <PageHeader eyebrow="Catalog" title="Products" subtitle="Every product sells through its variants — each with its own images, price and stock."
        actions={<Link to="/seller/products/new" data-testid="products-add-button" className={btnPrimary}><Plus size={14} /> Add product</Link>} />
      <Panel>
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-neutral-100">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input data-testid="products-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className={`${inputCls} pl-9`} />
          </div>
          <select data-testid="products-category-filter" value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} sm:w-56`}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        {!products ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No products found" action={<Link to="/seller/products/new" className={btnPrimary}>Add your first product</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-[0.15em] text-neutral-500 border-b border-neutral-100">
                  <th className="px-5 py-3">Product</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Variants</th>
                  <th className="px-5 py-3">Stock</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((p) => {
                  const stock = p.variants.reduce((s, v) => s + (v.stock || 0), 0);
                  return (
                    <tr key={p._id} data-testid={`product-row-${p._id}`} className="hover:bg-neutral-50/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <img src={productImage(p)} alt="" className="w-12 h-12 rounded-lg object-contain bg-[#F7F5F1] p-1 border border-neutral-100" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.tittle}</p>
                            {p.featured && <span className="text-[9px] font-bold uppercase text-[#E52B32]">Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{p.category}</td>
                      <td className="px-5 py-3">{p.variants.length}</td>
                      <td className={`px-5 py-3 font-semibold ${stock === 0 ? "text-red-600" : stock <= 5 ? "text-amber-600" : ""}`}>{stock}</td>
                      <td className="px-5 py-3">{formatINR(p.price?.amount)}</td>
                      <td className="px-5 py-3"><StatusBadge status={p.active ? "Active" : "Hidden"} /></td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/product/${p._id}`} title="View in store" className="p-2 text-neutral-400 hover:text-[#111]"><ExternalLink size={15} /></Link>
                          <Link to={`/seller/products/${p._id}/edit`} data-testid={`product-edit-${p._id}`} title="Edit" className="p-2 text-neutral-400 hover:text-[#111]"><Pencil size={15} /></Link>
                          <button data-testid={`product-delete-${p._id}`} onClick={() => remove(p)} title="Remove" className="p-2 text-neutral-400 hover:text-red-600"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
