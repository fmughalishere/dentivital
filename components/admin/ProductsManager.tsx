"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import { useUI } from "@/context/UIContext";
import { money, slugify } from "@/lib/format";
import type { Product } from "@/types";
import { CURRENCY_CODE } from "@/lib/currency";

type FormState = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  ingredients: string;
  benefits: string;
  rating: string;
  reviewCount: string;
  stock: string;
  images: string[];
  featured: boolean;
  active: boolean;
};

const BLANK: FormState = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "whitening",
  ingredients: "",
  benefits: "",
  rating: "5",
  reviewCount: "0",
  stock: "100",
  images: [],
  featured: false,
  active: true,
};

function toForm(product: Product): FormState {
  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    price: String(product.price),
    compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
    category: product.category ?? "whitening",
    ingredients: (product.ingredients ?? []).join(", "),
    benefits: (product.benefits ?? []).join(", "),
    rating: String(product.rating ?? 5),
    reviewCount: String(product.reviewCount ?? 0),
    stock: String(product.stock ?? 0),
    images: product.images ?? [],
    featured: Boolean(product.featured),
    active: product.active !== false,
  };
}

export default function ProductsManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const { toast, confirm } = useUI();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );
  }, [products, query]);

  function openCreate() {
    setEditing(null);
    setForm(BLANK);
    setErrors({});
    setImageUrl("");
    setOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm(toForm(product));
    setErrors({});
    setImageUrl("");
    setOpen(true);
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key as string]: "" }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      update("images", [...form.images, data.url as string]);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed", err instanceof Error ? err.message : undefined);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addImageUrl() {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) {
      toast.error("That doesn't look like a URL", "Image URLs must start with http:// or https://");
      return;
    }
    update("images", [...form.images, url]);
    setImageUrl("");
  }

  function validate() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter a product name.";
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) next.price = "Enter a valid price.";
    if (form.compareAtPrice && Number(form.compareAtPrice) <= price) {
      next.compareAtPrice = "Compare-at price should be higher than the price.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save(e?: React.SyntheticEvent) {
    e?.preventDefault();
    if (saving || !validate()) return;

    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      category: form.category.trim() || "whitening",
      ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
      benefits: form.benefits.split(",").map((s) => s.trim()).filter(Boolean),
      rating: Number(form.rating) || 5,
      reviewCount: Number(form.reviewCount) || 0,
      stock: Number(form.stock) || 0,
      images: form.images,
      featured: form.featured,
      active: form.active,
    };

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/products/${editing._id}` : "/api/products",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't save that product.");

      setOpen(false);
      router.refresh();
      toast.success(editing ? "Product updated" : "Product created", payload.name);
    } catch (err) {
      toast.error("Save failed", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function remove(product: Product) {
    const ok = await confirm({
      title: `Delete ${product.name}?`,
      description:
        "This removes the product from your catalogue. Past orders keep their record of it.",
      confirmLabel: "Delete product",
      tone: "danger",
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      router.refresh();
      toast.success("Product deleted", product.name);
    } catch (err) {
      toast.error("Couldn't delete", err instanceof Error ? err.message : undefined);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dv-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="dv-input pl-10"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New product
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? "No products yet" : "No products match your search"}
          description={
            products.length === 0
              ? "Add your first product, or run `npm run seed` to load the Dentivital catalogue."
              : "Try a different keyword."
          }
          action={
            products.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> New product
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-dv-line bg-white">
          <div className="dv-scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-dv-line bg-dv-mint-50 text-left text-xs text-dv-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dv-line">
                {visible.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-dv-mint-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-dv-mint-100">
                          {product.images?.[0] && (
                            <Image
                              src={product.images[0]}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-contain p-1"
                            />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-dv-teal-900">
                            {product.name}
                          </span>
                          <span className="block truncate text-xs text-dv-ink-soft">
                            /{product.slug}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-dv-teal-900">{money(product.price)}</span>
                      {product.compareAtPrice ? (
                        <span className="ml-2 text-xs text-dv-ink-soft line-through">
                          {money(product.compareAtPrice)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={
                          product.stock <= 0
                            ? "text-dv-danger"
                            : product.stock <= 10
                              ? "text-dv-warning"
                              : "text-dv-ink-soft"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {product.active === false ? (
                          <Badge tone="danger">hidden</Badge>
                        ) : (
                          <Badge tone="success">live</Badge>
                        )}
                        {product.featured && <Badge tone="coral">featured</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          aria-label={`Edit ${product.name}`}
                          className="rounded-lg p-2 text-dv-ink-soft transition-colors hover:bg-dv-mint-100 hover:text-dv-teal-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(product)}
                          aria-label={`Delete ${product.name}`}
                          className="rounded-lg p-2 text-dv-ink-soft transition-colors hover:bg-dv-danger-bg hover:text-dv-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : "New product"}
        description="Fields marked with * are required."
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {editing ? "Save changes" : "Create product"}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="grid gap-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Product name"
              required
              value={form.name}
              error={errors.name}
              onChange={(e) => update("name", e.target.value)}
            />
            <Input
              label="URL slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              placeholder={form.name ? slugify(form.name) : "auto-generated"}
              hint="Leave blank to generate from the name."
            />
          </div>

          <Input
            label="Short description"
            value={form.shortDescription}
            onChange={(e) => update("shortDescription", e.target.value)}
            placeholder="One line shown on product cards"
          />

          <Textarea
            label="Full description"
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label={`Price (${CURRENCY_CODE})`}
              required
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              error={errors.price}
              onChange={(e) => update("price", e.target.value)}
            />
            <Input
              label="Compare-at price"
              type="number"
              step="0.01"
              min="0"
              value={form.compareAtPrice}
              error={errors.compareAtPrice}
              onChange={(e) => update("compareAtPrice", e.target.value)}
              hint="Shown struck through"
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="whitening">Whitening</option>
              <option value="tools">Tools</option>
              <option value="care">Daily care</option>
              <option value="bundles">Bundles</option>
            </Select>
            <Input
              label="Rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => update("rating", e.target.value)}
            />
            <Input
              label="Review count"
              type="number"
              min="0"
              value={form.reviewCount}
              onChange={(e) => update("reviewCount", e.target.value)}
            />
          </div>

          <Input
            label="Ingredients"
            value={form.ingredients}
            onChange={(e) => update("ingredients", e.target.value)}
            placeholder="PAP, Myrrh Extract, Coconut Oil"
            hint="Separate with commas."
          />
          <Input
            label="Key benefits"
            value={form.benefits}
            onChange={(e) => update("benefits", e.target.value)}
            placeholder="Zero sensitivity, Enamel repair"
            hint="Separate with commas."
          />

          {/* Images */}
          <div>
            <span className="dv-label">Images</span>
            {form.images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {form.images.map((src, i) => (
                  <span
                    key={`${src}-${i}`}
                    className="relative h-20 w-20 overflow-hidden rounded-xl border border-dv-line bg-dv-mint-100"
                  >
                    <Image src={src} alt="" fill sizes="80px" className="object-contain p-1" />
                    <button
                      type="button"
                      onClick={() =>
                        update(
                          "images",
                          form.images.filter((_, index) => index !== i)
                        )
                      }
                      aria-label="Remove image"
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-dv-danger shadow-soft"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 gap-2">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste an image URL"
                  className="dv-input"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="shrink-0 rounded-xl border border-dv-line-strong px-4 text-sm text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
                >
                  Add
                </button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-dv-line-strong px-4 py-2.5 text-sm text-dv-teal-900 transition-colors hover:bg-dv-mint-100 disabled:opacity-60"
              >
                {uploading ? <Spinner /> : <ImagePlus className="h-4 w-4" />}
                Upload
              </button>
            </div>
            <p className="mt-1.5 text-xs text-dv-ink-soft">
              Uploads go to Cloudinary. Without those keys, paste a hosted image URL instead.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 border-t border-dv-line pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-dv-ink">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 accent-dv-teal-700"
              />
              Featured on the homepage
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-dv-ink">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update("active", e.target.checked)}
                className="h-4 w-4 accent-dv-teal-700"
              />
              Visible in the store
            </label>
          </div>
        </form>
      </Modal>
    </>
  );
}
