import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  category: "",
};

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/products/${id}`).then((res) => {
      const p = res.data.product;
      setForm({
        name: p.name || "",
        description: p.description || "",
        price: p.price ?? "",
        stock: p.stock ?? "",
        imageUrl: p.image_url || "",
        category: p.category || "",
      });
      setLoading(false);
    });
  }, [id, isEditing]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/products/${id}`, form);
      } else {
        await api.post("/products", form);
      }
      navigate("/admin");
    } catch (err) {
      const messages = err.response?.data?.errors?.map((er) => er.message).join(" ");
      setError(messages || err.response?.data?.message || "Could not save product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="mx-auto max-w-xl px-6 py-10 text-muted">Loading...</p>;

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-800 text-ink">
        {isEditing ? "Edit product" : "Add a new product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Name</label>
          <input required className="input" value={form.name} onChange={handleChange("name")} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            rows={4}
            className="input"
            value={form.description}
            onChange={handleChange("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Price (Rs)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              className="input"
              value={form.price}
              onChange={handleChange("price")}
            />
          </div>
          <div>
            <label className="label">Stock</label>
            <input
              type="number"
              min="0"
              required
              className="input"
              value={form.stock}
              onChange={handleChange("stock")}
            />
          </div>
        </div>

        <div>
          <label className="label">Image URL</label>
          <input
            className="input"
            placeholder="https://..."
            value={form.imageUrl}
            onChange={handleChange("imageUrl")}
          />
        </div>

        <div>
          <label className="label">Category</label>
          <input
            className="input"
            value={form.category}
            onChange={handleChange("category")}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Saving..." : isEditing ? "Save changes" : "Create product"}
          </button>
          <button type="button" onClick={() => navigate("/admin")} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
