import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../store/slices/productSlice.js";
import ProductCard from "../../components/ProductCard/ProductCard.jsx";
import { Filter, SlidersHorizontal, ArrowLeft, ShoppingBag } from "lucide-react";

export default function Shop() {
  const { category: rawCategory } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const dispatch = useDispatch();
  const { list: allProducts, loading } = useSelector((s) => s.products);

  const [sortBy, setSortBy] = useState("default");

  // Determine current active filter
  const categories = useSelector((s) => s.categories.list);
  const currentCategory = rawCategory ? (categories.find((c) => c.slug === rawCategory)?.name || "") : "";

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filter products by category or search query
  let filtered = [...allProducts];

  if (currentCategory) {
    filtered = filtered.filter((p) => 
      p.category?.toLowerCase() === currentCategory.toLowerCase()
    );
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter((p) => 
      p.tittle?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === "price-low") {
    filtered.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
  } else if (sortBy === "price-high") {
    filtered.sort((a, b) => (b.price?.amount || 0) - (a.price?.amount || 0));
  }

  return (
    <div className="bg-[#F7F4EF] min-h-screen py-10 px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 text-[#111111]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header Breadcrumb & Heading */}
        <div className="mb-8 border-b border-neutral-200/80 pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#111111] mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#E8272A]">
                {currentCategory ? `Collection: ${currentCategory}` : searchQuery ? `Search Results for "${searchQuery}"` : "All Gear"}
              </span>
              <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#111111] mt-1 capitalize">
                {currentCategory || (searchQuery ? `"${searchQuery}"` : "Storefront Catalog")}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-500">
                {filtered.length} {filtered.length === 1 ? "Product" : "Products"} Available
              </span>

              {/* Sort selector */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 text-xs shadow-sm">
                <SlidersHorizontal size={14} className="text-neutral-400" />
                <select
                  data-testid="shop-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="default">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none text-xs">
          <Link
            to="/shop"
            data-testid="shop-all-collections-link"
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
              !currentCategory 
                ? "bg-[#111111] text-white" 
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            All Collections
          </Link>
          {categories.map(({ slug, name }) => (
            <Link
              key={slug}
              to={`/collections/${slug}`}
              data-testid={`shop-category-pill-${slug}`}
              className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                currentCategory === name
                  ? "bg-[#E8272A] text-white shadow-md shadow-red-900/20"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {name}
            </Link>
          ))}
        </div>

        {/* Product Grid or Empty State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-[#E8272A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-neutral-200/80 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#E8272A] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 className="font-serif font-black text-2xl text-[#111111] mb-2">
              No Products Found
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              {currentCategory 
                ? `There are currently no products listed under "${currentCategory}". As sellers publish new stock, they will immediately appear here.`
                : searchQuery
                ? `No products matched your search "${searchQuery}". Try browsing by categories instead.`
                : "The catalog is currently empty."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/shop"
                className="px-6 py-2.5 bg-[#111111] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#E8272A] transition-colors"
              >
                View All Categories
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
