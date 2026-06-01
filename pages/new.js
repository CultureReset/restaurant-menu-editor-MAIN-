import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function NewBusiness() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: '',
    name: '',
    tagline: '',
    icon: '🍽️',
    pin: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const initialData = {
        restaurant: {
          name: form.name,
          tagline: form.tagline,
          icon: form.icon
        },
        sections: ['Appetizers', 'Main Course', 'Drinks', 'Desserts'],
        items: [],
        gallery: [],
        pin: form.pin
      };

      const res = await fetch(`/api/data?slug=${form.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialData)
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create');
        setLoading(false);
        return;
      }

      router.push(`/?slug=${form.slug}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.pinScreen}>
      <div className={styles.pinBox} style={{ maxWidth: 400 }}>
        <h1>🍽️ New Restaurant</h1>
        <p>Create a menu</p>
        {error && <p style={{ color: '#f87171', marginBottom: 12, fontSize: 14 }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <input
            placeholder="Restaurant Name *"
            required
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            style={{ marginBottom: 10 }}
          />
          <input
            placeholder="URL slug (e.g. island-grill) *"
            required
            value={form.slug}
            onChange={(e) => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
            style={{ marginBottom: 10 }}
          />
          <input
            placeholder="Tagline"
            value={form.tagline}
            onChange={(e) => setForm({...form, tagline: e.target.value})}
            style={{ marginBottom: 10 }}
          />
          <input
            placeholder="Icon emoji"
            value={form.icon}
            onChange={(e) => setForm({...form, icon: e.target.value.substring(0, 2)})}
            style={{ marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="PIN (4 digits) *"
            required
            maxLength="4"
            value={form.pin}
            onChange={(e) => setForm({...form, pin: e.target.value})}
            style={{ marginBottom: 16 }}
          />
          <button type="submit" disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating...' : 'Create Restaurant'}
          </button>
        </form>
      </div>
    </div>
  );
}
