import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { getSellerCategories, createCategory, updateCategory, deleteCategory } from "../../services/category.api.js";
import { fetchCategories } from "../../store/slices/wishlistSlice.js";
import { PageHeader, Panel, StatusBadge, Spinner, EmptyState, Modal, inputCls, labelCls, btnPrimary, btnGhost } from "../../components/Seller/ui.jsx";
import { apiError } from "../../utils/format.js";

const blank = { name: "", description: "", image: "", file: null, featured: false, active: true, sortOrder: 0 };

function CategoryForm({ initial, onSaved }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const preview = form.file ? URL.createObjectURL(form.file) : form.image;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    const data = new FormData();
    ["name", "description", "featured", "active", "sortOrder"].forEach((k) => data.append(k, form[k]));
    if (form.file) data.append("image", form.file);
    setSaving(true);
    try {
      form._id ? await updateCategory(form._id, data) : await createCategory(data);
      toast.success(form._id ? "Category updated" : "Category created");
      onSaved();
    } catch (err) { toast.error(apiError(err, "Failed to save category")); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="category-form">
      <div><label className={labelCls}>Name *</label><input data-testid="category-name-input" className={inputCls} value={form.name} onChange={set("name")} /></div>
      <div><label className={labelCls}>Description</label><input data-testid="category-description-input" className={inputCls} value={form.description} onChange={set("description")} /></div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-[#F7F5F1] border border-neutral-200 flex items-center justify-center overflow-hidden">
          {preview ? <img src={preview} alt="" className="w-full h-full object-contain p-1" /> : <Tags size={20} className="text-neutral-300" />}
        </div>
        <label className={`${btnGhost} cursor-pointer`}>Upload image<input data-testid="category-image-input" type="file" accept="image/*" className="hidden" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} /></label>
      </div>
      <div className="grid grid-cols-3 gap-3 items-end">
        <div><label className={labelCls}>Sort order</label><input data-testid="category-sort-input" type="number" className={inputCls} value={form.sortOrder} onChange={set("sortOrder")} /></div>
        <label className="flex items-center gap-2 text-sm cursor-pointer py-2.5"><input data-testid="category-featured-toggle" type="checkbox" className="accent-[#E52B32]" checked={form.featured} onChange={set("featured")} /> Featured</label>
        <label className="flex items-center gap-2 text-sm cursor-pointer py-2.5"><input data-testid="category-active-toggle" type="checkbox" className="accent-[#E52B32]" checked={form.active} onChange={set("active")} /> Visible</label>
      </div>
      <div className="flex justify-end"><button data-testid="category-save-button" disabled={saving} className={btnPrimary}>{saving ? "Saving…" : "Save category"}</button></div>
    </form>
  );
}

export default function Categories() {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => getSellerCategories().then((res) => setCategories(res.data.categories)).catch(() => toast.error("Failed to load categories"));
  useEffect(() => { load(); }, []);

  const saved = () => { setEditing(null); load(); dispatch(fetchCategories()); };

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try { await deleteCategory(c._id); toast.success("Category deleted"); saved(); }
    catch (err) { toast.error(apiError(err, "Failed to delete")); }
  };

  return (
    <div data-testid="seller-categories-page">
      <PageHeader eyebrow="Catalog" title="Categories" subtitle="Categories power the homepage bento grid and shop filters. Featured ones get the larger tiles."
        actions={<button data-testid="category-add-button" onClick={() => setEditing(blank)} className={btnPrimary}><Plus size={14} /> Add category</button>} />
      <Panel>
        {!categories ? <Spinner /> : categories.length === 0 ? <EmptyState icon={Tags} title="No categories yet" /> : (
          <ul className="divide-y divide-neutral-100">
            {categories.map((c) => (
              <li key={c._id} data-testid={`category-row-${c.slug}`} className="flex items-center gap-4 px-5 py-3">
                {c.image ? <img src={c.image} alt="" className="w-14 h-14 rounded-xl object-contain bg-[#F7F5F1] p-1.5 border border-neutral-100" /> : <div className="w-14 h-14 rounded-xl bg-[#F7F5F1] border border-neutral-100 flex items-center justify-center"><Tags size={18} className="text-neutral-300" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{c.name} {c.featured && <span className="text-[9px] font-bold uppercase text-[#E52B32] ml-1">Featured</span>}</p>
                  <p className="text-xs text-neutral-500 truncate">/{c.slug} · {c.productCount} products · order {c.sortOrder}</p>
                </div>
                <StatusBadge status={c.active ? "Active" : "Hidden"} />
                <button data-testid={`category-edit-${c.slug}`} onClick={() => setEditing({ ...blank, ...c, file: null })} className="p-2 text-neutral-400 hover:text-[#111]"><Pencil size={15} /></button>
                <button data-testid={`category-delete-${c.slug}`} onClick={() => remove(c)} className="p-2 text-neutral-400 hover:text-red-600"><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?._id ? "Edit category" : "New category"} testid="category-modal">
        {editing && <CategoryForm initial={editing} onSaved={saved} />}
      </Modal>
    </div>
  );
}
