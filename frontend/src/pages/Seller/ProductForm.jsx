import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { createProduct, updateProduct, getSellerProduct, addVariant, updateVariant, deleteVariant } from "../../services/product.api.js";
import { getSellerCategories } from "../../services/category.api.js";
import ImagePicker from "../../components/Seller/ImagePicker.jsx";
import VariantEditor, { emptyVariant, fromVariant, toVariantForm, validateVariant } from "../../components/Seller/VariantEditor.jsx";
import { PageHeader, Panel, Spinner, inputCls, labelCls, btnPrimary, btnGhost, btnDark } from "../../components/Seller/ui.jsx";
import { apiError } from "../../utils/format.js";

const blankDetails = { tittle: "", description: "", category: "", priceAmount: "", active: true, featured: false, existing: [], files: [] };

const toProductForm = (d) => {
  const form = new FormData();
  ["tittle", "description", "category", "priceAmount", "active", "featured"].forEach((k) => form.append(k, d[k]));
  form.append("priceCurrency", "INR");
  form.append("keepImages", JSON.stringify(d.existing));
  d.files.forEach((f) => form.append("images", f));
  return form;
};

function DetailsFields({ details, setDetails, categories }) {
  const set = (key) => (e) => setDetails({ ...details, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2"><label className={labelCls}>Product title *</label><input data-testid="product-title-input" className={inputCls} value={details.tittle} onChange={set("tittle")} placeholder="Croco Duffle Bag with Side Pocket" /></div>
        <div>
          <label className={labelCls}>Category *</label>
          <select data-testid="product-category-select" className={inputCls} value={details.category} onChange={set("category")}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c.name}>{c.name}{c.active ? "" : " (hidden)"}</option>)}
          </select>
        </div>
      </div>
      <div><label className={labelCls}>Description *</label><textarea data-testid="product-description-input" rows={4} className={`${inputCls} resize-none`} value={details.description} onChange={set("description")} /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div><label className={labelCls}>Base price (₹) *</label><input data-testid="product-price-input" type="number" min={1} className={inputCls} value={details.priceAmount} onChange={set("priceAmount")} /></div>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer py-2.5"><input data-testid="product-active-toggle" type="checkbox" className="accent-[#E52B32]" checked={details.active} onChange={set("active")} /> Visible in store</label>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer py-2.5"><input data-testid="product-featured-toggle" type="checkbox" className="accent-[#E52B32]" checked={details.featured} onChange={set("featured")} /> Feature on homepage</label>
      </div>
      <div><label className={labelCls}>Product cover images * (max 7)</label><ImagePicker testid="product-images" existing={details.existing} files={details.files} onChange={(imgs) => setDetails({ ...details, ...imgs })} /></div>
    </div>
  );
}

const validateDetails = (d) => {
  if (!d.tittle.trim() || !d.description.trim() || !d.category) return "Fill in title, description and category";
  if (!(Number(d.priceAmount) > 0)) return "Enter a base price";
  if (d.existing.length + d.files.length === 0) return "Add at least one product image";
  return null;
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [details, setDetails] = useState(blankDetails);
  const [variants, setVariants] = useState(isEdit ? [] : [emptyVariant()]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(null);

  const hydrate = (p) => {
    setDetails({ tittle: p.tittle, description: p.description, category: p.category, priceAmount: p.price?.amount ?? "", active: p.active !== false, featured: Boolean(p.featured), existing: p.images || [], files: [] });
    setVariants(p.variants.map(fromVariant));
  };

  useEffect(() => {
    getSellerCategories().then((res) => {
      setCategories(res.data.categories);
      if (!isEdit) setDetails((d) => ({ ...d, category: d.category || res.data.categories[0]?.name || "" }));
    });
    if (isEdit) getSellerProduct(id).then((res) => hydrate(res.data.product)).catch(() => { toast.error("Product not found"); navigate("/seller/products"); }).finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const updateAt = (i) => (v) => setVariants((list) => list.map((x, j) => (j === i ? v : x)));

  const createAll = async () => {
    const error = validateDetails(details) || variants.map(validateVariant).find(Boolean) || (variants.length ? null : "Add at least one variant");
    if (error) return toast.error(error);
    setSaving("create");
    try {
      const { data } = await createProduct(toProductForm(details));
      for (const v of variants) await addVariant(data.product._id, toVariantForm(v));
      toast.success("Product published");
      navigate("/seller/products");
    } catch (err) { toast.error(apiError(err, "Failed to publish product")); }
    finally { setSaving(null); }
  };

  const saveDetails = async () => {
    const error = validateDetails(details);
    if (error) return toast.error(error);
    setSaving("details");
    try {
      const { data } = await updateProduct(id, toProductForm(details));
      setDetails((d) => ({ ...d, existing: data.product.images, files: [] }));
      toast.success("Details saved");
    } catch (err) { toast.error(apiError(err, "Failed to save")); }
    finally { setSaving(null); }
  };

  const saveVariant = async (i) => {
    const v = variants[i];
    const error = validateVariant(v);
    if (error) return toast.error(error);
    setSaving(`v${i}`);
    try {
      const { data } = v._id ? await updateVariant(id, v._id, toVariantForm(v)) : await addVariant(id, toVariantForm(v));
      const saved = v._id ? data.product.variants.find((x) => x._id === v._id) : data.product.variants[data.product.variants.length - 1];
      updateAt(i)(fromVariant(saved));
      toast.success(v._id ? "Variant saved" : "Variant added");
    } catch (err) { toast.error(apiError(err, "Failed to save variant")); }
    finally { setSaving(null); }
  };

  const removeVariant = async (i) => {
    const v = variants[i];
    if (v._id) {
      if (!window.confirm("Delete this variant? Past orders keep their details.")) return;
      try { await deleteVariant(id, v._id); toast.success("Variant deleted"); } catch (err) { return toast.error(apiError(err, "Failed to delete")); }
    }
    setVariants((list) => list.filter((_, j) => j !== i));
  };

  if (loading) return <Spinner />;

  return (
    <div data-testid="seller-product-form-page">
      <Link to="/seller/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#111] mb-3"><ArrowLeft size={14} /> Products</Link>
      <PageHeader eyebrow={isEdit ? "Edit product" : "New product"} title={isEdit ? details.tittle || "Edit product" : "Publish a product"}
        actions={isEdit && <button data-testid="product-save-details-button" onClick={saveDetails} disabled={saving === "details"} className={btnDark}>{saving === "details" ? "Saving…" : "Save details"}</button>} />
      <Panel title="Details" className="mb-4"><DetailsFields details={details} setDetails={setDetails} categories={categories} /></Panel>
      <Panel title={`Variants (${variants.length})`} action={<button type="button" data-testid="product-add-variant-button" onClick={() => setVariants((l) => [...l, emptyVariant(details.priceAmount)])} className={btnGhost}><Plus size={14} /> Add variant</button>}>
        <div className="p-5 space-y-4">
          {variants.length === 0 && <p className="text-sm text-neutral-500">No variants yet — add one so customers can buy this product.</p>}
          {variants.map((v, i) => (
            <VariantEditor key={v._id || `draft-${i}`} index={i} value={v} onChange={updateAt(i)} saving={saving === `v${i}`}
              onSave={isEdit ? () => saveVariant(i) : undefined}
              onDelete={isEdit || variants.length > 1 ? () => removeVariant(i) : undefined} />
          ))}
        </div>
      </Panel>
      {!isEdit && (
        <div className="flex justify-end gap-3 mt-6">
          <Link to="/seller/products" className={btnGhost}>Cancel</Link>
          <button data-testid="product-publish-button" onClick={createAll} disabled={saving === "create"} className={btnPrimary}><CheckCircle2 size={14} /> {saving === "create" ? "Publishing…" : "Publish product"}</button>
        </div>
      )}
    </div>
  );
}
