import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function MenuEditor() {
  const router = useRouter();
  const { slug } = router.query;

  const [pinEntered, setPinEntered] = useState(false);
  const [pin, setPin] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Business level
  const [business, setBusiness] = useState({ name: '', tagline: '', phone: '', website: '', address: '', about: '' });
  const [gallery, setGallery] = useState([]);
  const [sides, setSides] = useState([]);
  const [dailyFeatures, setDailyFeatures] = useState([]);

  // Area management
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [tab, setTab] = useState('menu');

  // Rotating items (Catch of the Day, Soup of the Day, etc)
  const [showAddRotating, setShowAddRotating] = useState(false);
  const [rotatingItem, setRotatingItem] = useState({ name: '', description: '', price: '', images: [], active: true });
  const [happyHour, setHappyHour] = useState([]);

  // Current tab state (reusable across all tabs)
  const [editingSection, setEditingSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionTime, setNewSectionTime] = useState('');
  const [sectionTimeStart, setSectionTimeStart] = useState('11:00');
  const [sectionTimeEnd, setSectionTimeEnd] = useState('22:00');
  const [eventTimeStart, setEventTimeStart] = useState('18:00');
  const [eventTimeEnd, setEventTimeEnd] = useState('22:00');
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ section_id: '', name: '', description: '', price: '', date: '', time: '', location: '', type: 'side', images: [], active: true });
  const [editingItemId, setEditingItemId] = useState(null);
  const [showGallerySelector, setShowGallerySelector] = useState(null);
  const [expandedAddForm, setExpandedAddForm] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [editingSectionTimeStart, setEditingSectionTimeStart] = useState('');
  const [editingSectionTimeEnd, setEditingSectionTimeEnd] = useState('');

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageLabel, setImageLabel] = useState('Grilled');
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Generate time options (12:00 AM to 11:30 PM in 30-minute intervals)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayMin = min === 0 ? '00' : '30';
      const value = `${String(hour).padStart(2, '0')}:${displayMin}`;
      const label = `${displayHour}:${displayMin} ${period}`;
      timeOptions.push({ value, label });
    }
  }

  // Initialize
  useEffect(() => {
    if (!slug) return;

    const newAreaId = Math.random().toString(36).substr(2, 9);
    setSelectedAreaId(newAreaId);

    // Start blank, data loads after PIN auth
    setBusiness({ name: '', tagline: '', phone: '', website: '', address: '', about: '' });
    setAreas([]);

    // Demo data reference (for manual entry)
    const menuSections = [
      { id: '1', name: 'Soups', time_range: '', items: [
        { id: '1a', section_id: '1', name: 'Crab and Corn Bisque', description: 'Creamy crab meat treasure served with crackers.', price: '$8/$12', images: [] },
        { id: '1b', section_id: '1', name: 'Seafood Gumbo', description: 'Made from scratch shrimp & sausage gumbo served with crackers.', price: '$8/$12', images: [] }
      ]},
      { id: '2', name: 'Salads', time_range: '', items: [
        { id: '2a', section_id: '2', name: 'The Grill Salad', description: 'Fresh tossed greens with grilled chicken, craisins, pineapple, parmesan cheese, and toasted almonds.', price: '$17', images: [] },
        { id: '2b', section_id: '2', name: 'Mango Shrimp Salad', description: 'Fresh greens with red onions, cherry tomatoes, boiled egg, parmesan cheese topped with mango BBQ shrimp.', price: '$17', images: [] },
        { id: '2c', section_id: '2', name: 'Tender Salad', description: 'Fresh greens with red onions, cherry tomatoes, boiled egg, parmesan cheese topped with crispy fried chicken.', price: '$16', images: [] },
        { id: '2d', section_id: '2', name: 'Side Salad', description: 'Fresh tossed greens with cucumber, cherry tomatoes, shredded cheese, and sliced onions.', price: '$5', images: [] }
      ]},
      { id: '3', name: 'From the Grill', time_range: '', items: [
        { id: '3a', section_id: '3', name: 'Islamorada Chicken', description: 'Grilled chicken breast marinated with island flavors. Served with Caribbean rice, steamed veggies, and grilled pineapple.', price: '$20', images: [] },
        { id: '3b', section_id: '3', name: 'Ribeye', description: 'Hand cut and grilled to your liking, served with mashed potatoes and steamed veggies.', price: '$30', images: [] },
        { id: '3c', section_id: '3', name: 'Caribbean Shrimp Kabobs', description: '2 grilled shrimp skewers with Caribbean rice, steamed veggies, and grilled pineapple.', price: '$24', images: [] },
        { id: '3d', section_id: '3', name: 'Surf and Turf', description: '12oz ribeye with your choice of grilled shrimp skewer, fried shrimp, or stuffed crab. Served with Gulf Island potatoes and steamed veggies.', price: '$36', images: [] },
        { id: '3e', section_id: '3', name: 'Mahi Tacos', description: 'Fresh mahi mahi wrapped in flour tortilla with homemade pico de gallo, fresh lettuce, and cheese. Served with chips and salsa.', price: '$22', images: [] },
        { id: '3f', section_id: '3', name: 'Baja Catch', description: 'Fresh fish prepared grilled or blackened. Served with Caribbean rice and steamed veggies.', price: '$22', images: [] },
        { id: '3g', section_id: '3', name: 'Shrimp Scampi', description: 'Fresh gulf shrimp sautéed in garlic wine butter. Served with Caribbean rice and steamed veggies.', price: '$22', images: [] }
      ]},
      { id: '4', name: 'House Specialties', time_range: '', items: [
        { id: '4a', section_id: '4', name: 'Grouper Roulade', description: 'Fresh grouper stuffed with crabmeat and broiled in garlic-wine butter cream sauce. Served with mashed potatoes and steamed veggies.', price: '$24', images: [] },
        { id: '4b', section_id: '4', name: 'Baby Back Ribs', description: 'Full 2 lb rack rubbed with island spices and slow cooked. Served with fries and Key West slaw.', price: '$28', images: [] },
        { id: '4c', section_id: '4', name: 'Grouper Parmesan', description: 'Baked grouper topped with fresh parmesan. Served with mashed potatoes and steamed veggies.', price: '$24', images: [] },
        { id: '4d', section_id: '4', name: 'Gulf Island Ya-Ya', description: 'Shrimp, chicken, Andouille sausage, peppers, onions, and tomatoes in garlic cheddar sauce on Caribbean rice. Served with garlic bread.', price: '$23', images: [] },
        { id: '4e', section_id: '4', name: 'Gulf Island Catch', description: 'Voted one of the BEST dishes on the island. Lightly pan-fried fish topped with creamy shrimp & andouille sausage sauce. Served with steamed veggies.', price: '$22', images: [] },
        { id: '4f', section_id: '4', name: 'Roasted Cheddar & Artichoke Dip', description: 'Creamy dip served with warm tortilla chips.', price: '$12', images: [] },
        { id: '4g', section_id: '4', name: 'Coconut Shrimp', description: 'Homemade with crispy coconut batter. Served with homemade Jezabel sauce.', price: '$14', images: [] },
        { id: '4h', section_id: '4', name: 'Boiled Shrimp', description: 'A 1/2 pound of fresh Gulf shrimp, served with cocktail sauce.', price: '$14', images: [] },
        { id: '4i', section_id: '4', name: 'Fried Dill Pickle Chips', description: 'Hand cut pickles, deep fried, and tasty! Served with ranch.', price: '$10', images: [] },
        { id: '4j', section_id: '4', name: 'Buffalo Shrimp', description: 'Hearty portion of popcorn shrimp tossed in your choice of: Honey BBQ, Mango BBQ, or Hot.', price: '$14', images: [] },
        { id: '4k', section_id: '4', name: 'Baked Crab Stuffed Mushrooms', description: 'Our signature crab dressing with our garlic cream sauce.', price: '$14', images: [] },
        { id: '4l', section_id: '4', name: 'Cheesy Bacon Fries', description: 'Melted cheese and crispy bacon pieces atop our fries. Served with ranch.', price: '$12', images: [] },
        { id: '4m', section_id: '4', name: 'Blackened Shrimp Queso', description: 'Blackened shrimp mixed in creamy queso dip. Served with tortilla chips.', price: '$14', images: [] },
        { id: '4n', section_id: '4', name: 'Louisiana Popcorn', description: 'Spicy fried crawfish tails served with mojo dipping sauce.', price: '$14', images: [] }
      ]},
      { id: '5', name: 'Sandwiches', time_range: '', items: [
        { id: '5a', section_id: '5', name: "Po'Boys", description: 'Shrimp, crawfish, or grouper served on French loaf with lettuce, tomato, and onion.', price: '$17', images: [] },
        { id: '5b', section_id: '5', name: 'Jerk Chicken Sandwich', description: 'Marinated chicken breast with grilled pineapple on toasted buns with lettuce, tomato, and onion.', price: '$15', images: [] },
        { id: '5c', section_id: '5', name: 'Island Burger', description: '1/2 lb burger grilled with island spices. Customize with cheese, bacon, mushrooms, or pineapple.', price: '$14', images: [] }
      ]},
      { id: '6', name: 'From the Fryer', time_range: '', items: [
        { id: '6a', section_id: '6', name: 'Fried Gulf Shrimp', description: '10 golden brown shrimp served with cocktail sauce.', price: '$22', images: [] },
        { id: '6b', section_id: '6', name: 'Fried Grouper', description: 'Fresh and local grouper cut into thin strips. Served with tartar sauce.', price: '$20', images: [] },
        { id: '6c', section_id: '6', name: 'Fried Chicken Tenders', description: 'Fried, juicy chicken tenders. Served with homemade honey mustard.', price: '$17', images: [] },
        { id: '6d', section_id: '6', name: 'Bon Secour Platter', description: 'Fried grouper strips, crawfish tails, gulf shrimp, and stuffed crab.', price: '$26', images: [] }
      ]},
      { id: '7', name: 'Pasta', time_range: '', items: [
        { id: '7a', section_id: '7', name: 'Seafood Pasta', description: 'Steamed shrimp & crawfish tails tossed in parmesan sauce with peppers and onions over penne noodles.', price: '$24', images: [] },
        { id: '7b', section_id: '7', name: 'Chicken Alfredo', description: 'Grilled chicken tossed in parmesan sauce with peppers and onions over penne noodles. Served with french fries and slaw.', price: '$22', images: [] },
        { id: '7c', section_id: '7', name: 'Blackened Chicken Alfredo', description: 'Creole-style blackened chicken tossed in parmesan sauce with peppers and onions over penne noodles.', price: '$22', images: [] }
      ]},
      { id: '8', name: 'From the Steamer', time_range: '', items: [
        { id: '8a', section_id: '8', name: 'Boiled Shrimp Dinner', description: 'Fresh local shrimp steamed with Old Bay. Served with new potatoes, corn, lemons, drawn butter, and hushpuppy.', price: '$24', images: [] },
        { id: '8b', section_id: '8', name: 'Snow Crab Legs', description: 'Your choice of 1 lb or 2 lb steamed crab legs with Old Bay. Served with potatoes, corn, lemons, and drawn butter.', price: 'Market Price', images: [] },
        { id: '8c', section_id: '8', name: 'St. Martin Platter', description: 'Feeding 2-3 people, this platter has a variety! It contains a 1 1/2 lb. of snow crab legs, a 1/2 lb. of steamed shrimp, 4oz. of fried crawfish tails, 4 new potatoes, 2 pieces of corn, hushpuppies, and Key West slaw. Served with drawn butter and lemons.', price: 'Market Price', images: [] }
      ]},
      { id: '9', name: 'Desserts', time_range: '', items: [
        { id: '9a', section_id: '9', name: 'Peanut Butter Pie', description: 'Creamy peanut butter pie drizzled with chocolate syrup with chocolate cracker crust.', price: '$7.99', images: [] },
        { id: '9b', section_id: '9', name: 'Salted Caramel Cheesecake', description: 'Creamy, rich cheesecake with smooth caramel and a hint of sea salt.', price: '$7.99', images: [] },
        { id: '9c', section_id: '9', name: 'Key Lime Pie', description: 'A classic made with graham cracker crust and drizzled with kiwi syrup.', price: '$7.99', images: [] }
      ]}
    ];

    const drinkSections = [
      { id: 'd1', name: 'House Specialty Drinks', time_range: '', items: [
        { id: 'd1a', section_id: 'd1', name: 'Komoniwanaleiya', description: 'Our original refreshing creation: made with vodka, blue curacao, island punch liqueur, and tropical juices. Comes with a free lei!', price: '', images: [] },
        { id: 'd1b', section_id: 'd1', name: 'Gulf Island Bucket', description: 'For a BEACHIN\' time try this huge drink in a souvenir sand pail that\'s filled with long island liqueur, sour, cranberry, and sprite.', price: '', images: [] },
        { id: 'd1c', section_id: 'd1', name: 'Margaritas', description: 'Get it frozen or on the rocks! Flavors: original, strawberry, peach, mango, raspberry, or watermelon.', price: '', images: [] },
        { id: 'd1d', section_id: 'd1', name: 'Daiquiries', description: 'Get it original or virgin! Flavors: strawberry, piña colada, peach, mango, banana, raspberry, or watermelon.', price: '', images: [] },
        { id: 'd1e', section_id: 'd1', name: 'Kiss My Malibu', description: 'Our island favorite made with Malibu rum, Jamaican rum, tropical juices, and grenadine.', price: '', images: [] },
        { id: 'd1f', section_id: 'd1', name: 'Bushwacker', description: 'An island tradition made with real ice cream, island rum, and Kahlúa.', price: '', images: [] }
      ]},
      { id: 'd2', name: 'Wine', time_range: '', items: [
        { id: 'd2a', section_id: 'd2', name: 'House Wine by Copper Ridge - Chardonnay', description: '', price: '$5', images: [] },
        { id: 'd2b', section_id: 'd2', name: 'House Wine by Copper Ridge - White Zinfandel', description: '', price: '$5', images: [] },
        { id: 'd2c', section_id: 'd2', name: 'House Wine by Copper Ridge - Cabernet Sauvignon', description: '', price: '$5', images: [] },
        { id: 'd2d', section_id: 'd2', name: 'House Wine by Copper Ridge - Merlot', description: '', price: '$5', images: [] },
        { id: 'd2e', section_id: 'd2', name: 'William Hill Chardonnay, AU', description: '', price: '$8 / $32', images: [] },
        { id: 'd2f', section_id: 'd2', name: 'Kendall Jackson Chardonnay', description: '', price: '$9 / $34', images: [] },
        { id: 'd2g', section_id: 'd2', name: 'EccoDomani Pinot Grigio, IT', description: '', price: '$7 / $28', images: [] },
        { id: 'd2h', section_id: 'd2', name: 'Nobilo Sauvignon Blanc, NZ', description: '', price: '$7 / $28', images: [] },
        { id: 'd2i', section_id: 'd2', name: 'Hogue Riesling, WA', description: '', price: '$8 / $32', images: [] },
        { id: 'd2j', section_id: 'd2', name: 'Bella Sera Moscato, IT', description: '', price: '$7 / $28', images: [] },
        { id: 'd2k', section_id: 'd2', name: 'Mirassou Pinot Noir, CA', description: '', price: '$7 / $28', images: [] },
        { id: 'd2l', section_id: 'd2', name: 'La Crema Pinot Noir, CA', description: '', price: '$9 / $34', images: [] },
        { id: 'd2m', section_id: 'd2', name: 'Kendall Jackson Merlot, CA', description: '', price: '$9 / $34', images: [] },
        { id: 'd2n', section_id: 'd2', name: 'Kendall Jackson Cabernet, CA', description: '', price: '$9 / $34', images: [] },
        { id: 'd2o', section_id: 'd2', name: '19 Crimes Blend, AU', description: '', price: '$8 / $32', images: [] }
      ]},
      { id: 'd3', name: 'Beer', time_range: '', items: [
        { id: 'd3a', section_id: 'd3', name: 'Bud Light', description: '', price: '', images: [] },
        { id: 'd3b', section_id: 'd3', name: 'Miller Lite', description: '', price: '', images: [] },
        { id: 'd3c', section_id: 'd3', name: 'Coors Light', description: '', price: '', images: [] },
        { id: 'd3d', section_id: 'd3', name: 'Budweiser', description: '', price: '', images: [] },
        { id: 'd3e', section_id: 'd3', name: 'Michelob Ultra', description: '', price: '', images: [] },
        { id: 'd3f', section_id: 'd3', name: 'Corona Extra', description: '', price: '', images: [] },
        { id: 'd3g', section_id: 'd3', name: 'White Claw Mango', description: '', price: '', images: [] },
        { id: 'd3h', section_id: 'd3', name: 'Blue Moon, ABV 5.4%', description: 'Draft', price: '', images: [] },
        { id: 'd3i', section_id: 'd3', name: 'Good People IPA, ABV 7.1%', description: 'Draft', price: '', images: [] },
        { id: 'd3j', section_id: 'd3', name: 'Yuengling, ABV 4.4%', description: 'Draft', price: '', images: [] },
        { id: 'd3k', section_id: 'd3', name: 'Michelob Ultra, 4.2%', description: 'Draft', price: '', images: [] },
        { id: 'd3l', section_id: 'd3', name: 'Kona Big Wave, ABV 4.4%', description: 'Draft', price: '', images: [] },
        { id: 'd3m', section_id: 'd3', name: 'Fly Llama Blackberry Seltzer, ABV 4.5%', description: 'Draft', price: '', images: [] }
      ]}
    ];

    const newArea = {
      id: newAreaId,
      name: 'Main Restaurant',
      hours: {
        Monday: { open: '11:00', close: '22:00' },
        Tuesday: { open: '11:00', close: '22:00' },
        Wednesday: { open: '11:00', close: '22:00' },
        Thursday: { open: '11:00', close: '22:00' },
        Friday: { open: '11:00', close: '22:00' },
        Saturday: { open: '11:00', close: '22:00' },
        Sunday: { open: '11:00', close: '22:00' }
      },
      menu_sections: menuSections,
      drink_sections: drinkSections,
      specials: [],
      daily_specials: days.reduce((acc, day) => ({ ...acc, [day]: null }), {}),
      events: [],
      rotating_items: []
    };

    setAreas([newArea]);
  }, [slug]);

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (!slug) {
      alert('No business selected');
      return;
    }
    if (!pin) {
      alert('Please enter PIN');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/menu-editor/${encodeURIComponent(slug)}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
        setPinEntered(true);

        // Load existing menu data
        try {
          const menuRes = await fetch(`${API_URL}/api/menu-editor/${encodeURIComponent(slug)}/data`, {
            headers: { 'x-menu-token': data.token }
          });
          if (menuRes.ok) {
            const menuData = await menuRes.json();
            if (menuData.business) setBusiness(menuData.business);
            if (menuData.areas) setAreas(menuData.areas);
            if (menuData.gallery) setGallery(menuData.gallery);
          }
        } catch (err) {
          console.log('Starting with blank menu');
        }
      } else {
        alert(data.error || 'Invalid PIN');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      // Convert to Base64 (local storage for testing)
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        const newImage = { url: base64, label: imageLabel };

        if (editingItem) {
          setEditingItem({ ...editingItem, images: [...(editingItem.images || []), newImage] });
        } else {
          setNewItem({ ...newItem, images: [...newItem.images, newImage] });
        }
        setImageLabel('Grilled');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Error uploading image: ' + err.message);
      setUploadingImage(false);
    }
  };

  const getSectionField = (tabType) => {
    if (tabType === 'menu') return 'menu_sections';
    if (tabType === 'drinks') return 'drink_sections';
    return 'menu_sections';
  };

  const getItemsField = (tabType) => {
    if (tabType === 'specials') return 'specials';
    if (tabType === 'daily') return 'daily_specials';
    if (tabType === 'events') return 'events';
    return 'specials';
  };

  // Reusable section management (for menu, drinks)
  const addSection = (tabType = tab) => {
    if (!newSectionName.trim() || !selectedAreaId) return;
    const field = getSectionField(tabType);
    const newSection = { id: Math.random().toString(36).substr(2, 9), name: newSectionName, time_range: newSectionTime, items: [] };
    setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, [field]: [...a[field], newSection] } : a));
    setNewSectionName('');
    setNewSectionTime('');
  };

  const deleteSection = (sectionId, tabType = tab) => {
    const field = getSectionField(tabType);
    setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, [field]: a[field].filter(s => s.id !== sectionId) } : a));
  };

  const addSectionItem = (tabType = tab) => {
    if (!newItem.name || !newItem.price || !newItem.section_id) {
      alert('Fill required fields');
      return;
    }
    const field = getSectionField(tabType);
    const area = areas.find(a => a.id === selectedAreaId);
    const section = area?.[field].find(s => s.id === newItem.section_id);
    if (!section) return;

    const item = { id: Math.random().toString(36).substr(2, 9), ...newItem, images: newItem.images || [] };
    setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, [field]: a[field].map(s => s.id === newItem.section_id ? { ...s, items: [...s.items, item] } : s) } : a));
    setNewItem({ section_id: '', name: '', description: '', price: '', date: '', time: '', location: '', type: 'side', images: [], active: true });
  };

  const updateSectionItem = (tabType = tab) => {
    if (!editingItem.name || !editingItem.price) {
      alert('Fill required fields');
      return;
    }
    const field = getSectionField(tabType);
    setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, [field]: a[field].map(s => s.id === editingItem.section_id ? { ...s, items: s.items.map(i => i.id === editingItem.id ? editingItem : i) } : s) } : a));
    setEditingItem(null);
  };

  const deleteSectionItem = (sectionId, itemId, tabType = tab) => {
    const field = getSectionField(tabType);
    setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, [field]: a[field].map(s => s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s) } : a));
  };

  // Reusable flat list management (specials, daily features, events, sides)
  const addFlatItem = (targetField) => {
    if (!newItem.name || !newItem.price) {
      alert('Fill required fields');
      return;
    }
    const item = { id: Math.random().toString(36).substr(2, 9), ...newItem, images: newItem.images || [], active: newItem.active !== false };

    if (targetField === 'specials') {
      const area = areas.find(a => a.id === selectedAreaId);
      setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, specials: [...a.specials, item] } : a));
    } else if (targetField === 'events') {
      const area = areas.find(a => a.id === selectedAreaId);
      setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, events: [...a.events, item] } : a));
    } else if (targetField === 'dailyFeatures') {
      setDailyFeatures([...dailyFeatures, item]);
    } else if (targetField === 'sides') {
      setSides([...sides, item]);
    }

    setNewItem({ section_id: '', name: '', description: '', price: '', date: '', time: '', location: '', type: 'side', images: [], active: true });
  };

  const updateFlatItem = (targetField) => {
    if (!editingItem.name || !editingItem.price) {
      alert('Fill required fields');
      return;
    }
    if (targetField === 'specials') {
      setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, specials: a.specials.map(i => i.id === editingItem.id ? editingItem : i) } : a));
    } else if (targetField === 'events') {
      setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, events: a.events.map(i => i.id === editingItem.id ? editingItem : i) } : a));
    } else if (targetField === 'dailyFeatures') {
      setDailyFeatures(dailyFeatures.map(i => i.id === editingItem.id ? editingItem : i));
    } else if (targetField === 'sides') {
      setSides(sides.map(i => i.id === editingItem.id ? editingItem : i));
    }
    setEditingItem(null);
  };

  const deleteFlatItem = (itemId, targetField) => {
    if (targetField === 'specials') {
      setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, specials: a.specials.filter(i => i.id !== itemId) } : a));
    } else if (targetField === 'events') {
      setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, events: a.events.filter(i => i.id !== itemId) } : a));
    } else if (targetField === 'dailyFeatures') {
      setDailyFeatures(dailyFeatures.filter(i => i.id !== itemId));
    } else if (targetField === 'sides') {
      setSides(sides.filter(i => i.id !== itemId));
    }
  };

  const deleteImage = (imageIndex, isEditing = false) => {
    if (isEditing) {
      setEditingItem({ ...editingItem, images: editingItem.images.filter((_, i) => i !== imageIndex) });
    } else {
      setNewItem({ ...newItem, images: newItem.images.filter((_, i) => i !== imageIndex) });
    }
  };

  const addArea = () => {
    if (!newAreaName.trim()) {
      alert('Please enter an area name (e.g., Outdoor Bar, Patio, Upstairs)');
      return;
    }
    const newAreaId = Math.random().toString(36).substr(2, 9);
    setAreas([...areas, {
      id: newAreaId,
      name: newAreaName,
      hours: days.reduce((acc, day) => ({ ...acc, [day]: { open: '09:00', close: '22:00' } }), {}),
      menu_sections: [],
      drink_sections: [],
      specials: [],
      daily_specials: days.reduce((acc, day) => ({ ...acc, [day]: null }), {}),
      events: [],
      rotating_items: []
    }]);
    setSelectedAreaId(newAreaId);
    setNewAreaName('');
  };

  const addRotatingItem = () => {
    if (!rotatingItem.name.trim()) {
      alert('Enter item name');
      return;
    }
    const newId = Math.random().toString(36).substr(2, 9);
    setAreas(areas.map(a => a.id === selectedAreaId ? {
      ...a,
      rotating_items: [...a.rotating_items, { id: newId, ...rotatingItem }]
    } : a));
    setRotatingItem({ name: '', description: '', price: '', images: [], active: true });
    setShowAddRotating(false);
  };

  const deleteRotatingItem = (itemId) => {
    setAreas(areas.map(a => a.id === selectedAreaId ? {
      ...a,
      rotating_items: a.rotating_items.filter(i => i.id !== itemId)
    } : a));
  };

  const toggleRotatingActive = (itemId) => {
    setAreas(areas.map(a => a.id === selectedAreaId ? {
      ...a,
      rotating_items: a.rotating_items.map(i => i.id === itemId ? { ...i, active: !i.active } : i)
    } : a));
  };

  const handleSave = async () => {
    if (!slug || !token) {
      alert('Not authenticated');
      return;
    }
    try {
      setSaving(true);
      const payload = { business, gallery, sides, dailyFeatures, areas };
      const res = await fetch(`${API_URL}/api/menu-editor/${slug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-menu-token': token },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      alert('✅ Saved!');
      setSaving(false);
    } catch (err) {
      alert('Error saving: ' + err.message);
      setSaving(false);
    }
  };

  // ItemRenderer - displays a flat list of items (specials, events, sides, daily features)
  const ItemRenderer = ({ items, targetField, placeholder = 'Add Item' }) => (
    <div>
      {items.map(item => (
        <div key={item.id} style={{background: '#1e293b', padding: 12, borderRadius: 6, marginBottom: 8}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
            <div style={{flex: 1}}>
              <h5 style={{margin: '0 0 4px 0'}}>{item.name}</h5>
              {item.description && <p style={{margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8'}}>{item.description}</p>}
              {item.price && <p style={{margin: '0 0 4px 0', fontWeight: 600}}>{item.price}</p>}
              {item.date && <p style={{margin: '0 0 4px 0', fontSize: 12}}>{item.date} {item.time}</p>}
              {item.location && <p style={{margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8'}}>{item.location}</p>}
              {item.images?.length > 0 && (
                <div style={{display: 'flex', gap: 6, marginTop: 8}}>
                  {item.images.map((img, idx) => (
                    <div key={idx} style={{width: 40, height: 40, borderRadius: 4, overflow: 'hidden', position: 'relative', title: img.label}}>
                      <img src={img.url} alt="item" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    </div>
                  ))}
                </div>
              )}
              {item.active !== undefined && <p style={{margin: '4px 0 0 0', fontSize: 11, color: item.active ? '#10b981' : '#f87171'}}>
                {item.active ? '✓ Active' : '✗ Inactive'}
              </p>}
            </div>
            <div style={{display: 'flex', gap: 6}}>
              <button onClick={() => setEditingItem(item)} style={{padding: '6px 10px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Edit</button>
              <button onClick={() => deleteFlatItem(item.id, targetField)} style={{padding: '6px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ItemForm - form for adding/editing items
  const ItemForm = ({ isSectionItem = false, targetField = null, onAdd, onUpdate, showDate = false, showTime = false, showLocation = false, sectionId = null }) => {
    const isExpanded = editingItem || expandedAddForm === sectionId;
    return (
    <div>
      {!isExpanded && <button onClick={() => setExpandedAddForm(sectionId)} style={{width: '100%', padding: 10, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginBottom: 12, fontWeight: 600}}>+ Add Item</button>}
      {isExpanded && <div style={{background: '#0f172a', padding: 12, borderRadius: 6, marginBottom: 12}}>
      <h4 style={{margin: '0 0 12px 0'}}>{editingItem ? 'Edit Item' : 'Add Item'}</h4>
      <input type="text" placeholder="Item name" value={editingItem ? editingItem.name : newItem.name} onChange={(e) => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8}} />
      <textarea placeholder="Description" value={editingItem ? editingItem.description : newItem.description} onChange={(e) => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8, height: 60}} />
      {!showDate && !showTime && !showLocation && <input type="text" placeholder="Price" value={editingItem ? editingItem.price : newItem.price} onChange={(e) => editingItem ? setEditingItem({...editingItem, price: e.target.value}) : setNewItem({...newItem, price: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8}} />}
      {showDate && <input type="date" value={editingItem ? editingItem.date : newItem.date} onChange={(e) => editingItem ? setEditingItem({...editingItem, date: e.target.value}) : setNewItem({...newItem, date: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8}} />}
      {showTime && <input type="time" value={editingItem ? editingItem.time : newItem.time} onChange={(e) => editingItem ? setEditingItem({...editingItem, time: e.target.value}) : setNewItem({...newItem, time: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8}} />}
      {showLocation && <input type="text" placeholder="Location" value={editingItem ? editingItem.location : newItem.location} onChange={(e) => editingItem ? setEditingItem({...editingItem, location: e.target.value}) : setNewItem({...newItem, location: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8}} />}
      {!isSectionItem && <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
        <label style={{flex: 1, display: 'flex', alignItems: 'center', gap: 6, color: '#f1f5f9'}}>
          <input type="checkbox" checked={editingItem ? editingItem.active : newItem.active} onChange={(e) => editingItem ? setEditingItem({...editingItem, active: e.target.checked}) : setNewItem({...newItem, active: e.target.checked})} />
          Active
        </label>
      </div>}
      <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{width: '100%', padding: 8, background: uploadingImage ? '#64748b' : '#1e293b', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: uploadingImage ? 'not-allowed' : 'pointer', marginBottom: 8}}>
        {uploadingImage ? 'Uploading...' : '+ Add Image'}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
      <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
        {(editingItem ? editingItem.images : newItem.images).map((img, idx) => (
          <div key={idx} style={{position: 'relative', width: 60, height: 60}}>
            <img src={img.url} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4}} />
            <div style={{fontSize: 10, color: '#94a3b8', marginTop: 2}}>{img.label}</div>
            <button onClick={() => deleteImage(idx, !!editingItem)} style={{position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 10}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display: 'flex', gap: 8}}>
        <select value={imageLabel} onChange={(e) => setImageLabel(e.target.value)} style={{flex: 1, padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
          <option>Grilled</option>
          <option>Blackened</option>
          <option>Fried</option>
          <option>Steamed</option>
          <option>Baked</option>
        </select>
        <button onClick={editingItem ? () => updateFlatItem(targetField) : () => addFlatItem(targetField)} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>
          {editingItem ? 'Update' : 'Save Item'}
        </button>
      </div>
      {editingItem && <button onClick={() => setEditingItem(null)} style={{width: '100%', marginTop: 8, padding: 8, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>}
      {!editingItem && <button onClick={() => setExpandedAddForm(null)} style={{width: '100%', marginTop: 8, padding: 8, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Collapse</button>}
    </div>}
    </div>
  );
  };

  if (!pinEntered) {
    return (
      <div className={styles.pinScreen}>
        <div className={styles.pinBox}>
          <h1>🔐 Menu Editor</h1>
          <p>Enter PIN to continue</p>
          <form onSubmit={handlePinSubmit}>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN" maxLength="6" autoFocus disabled={loading} />
            <button type="submit" disabled={loading}>{loading ? 'Unlocking...' : 'Unlock'}</button>
          </form>
        </div>
      </div>
    );
  }

  const selectedArea = areas.find(a => a.id === selectedAreaId);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <input type="text" placeholder="Business Name" value={business.name} onChange={(e) => setBusiness({...business, name: e.target.value})} style={{fontSize: 28, fontWeight: 700, background: 'transparent', border: 'none', color: '#f1f5f9', marginBottom: 8, width: '100%'}} />
          <input type="text" placeholder="Tagline" value={business.tagline} onChange={(e) => setBusiness({...business, tagline: e.target.value})} style={{fontSize: 14, background: 'transparent', border: 'none', color: '#b9d5de', width: '100%'}} />
        </div>
      </header>

      <div style={{borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', gap: 8, padding: '12px 20px', overflowX: 'auto'}}>
        {areas.map(area => (
          <button key={area.id} onClick={() => setSelectedAreaId(area.id)} style={{padding: '8px 16px', background: selectedAreaId === area.id ? '#0b7a75' : '#1e293b', color: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap'}}>
            {area.name}
          </button>
        ))}
        <button onClick={addArea} style={{padding: '8px 12px', background: '#1e293b', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: 'pointer'}}>+ Add Area</button>
      </div>

      {selectedArea && (
        <>
          <div style={{padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.1)'}}>
            <div style={{display: 'flex', gap: 8}}>
              <input type="text" placeholder="New area name" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addArea()} style={{flex: 1, padding: '8px 12px', background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}} />
              <button onClick={addArea} style={{padding: '8px 16px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>Add</button>
            </div>
          </div>

          <div style={{display: 'flex', gap: 8, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,.1)', overflowX: 'auto'}}>
            {['menu', 'drinks', 'specials', 'sides', 'daily', 'events', 'happyHour', 'hours', 'dailyFeatures', 'gallery', 'business'].map(t => (
              <button key={t} onClick={() => { setTab(t); setEditingItem(null); setNewItem({ section_id: '', name: '', description: '', price: '', date: '', time: '', location: '', images: [], active: true }); }} style={{padding: '8px 12px', background: tab === t ? '#0b7a75' : '#1e293b', color: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: tab === t ? 600 : 400, whiteSpace: 'nowrap'}}>
                {t === 'menu' && '🍽️'}{t === 'drinks' && '🥤'}{t === 'specials' && '⭐'}{t === 'sides' && '➕'}{t === 'daily' && '📅'}{t === 'events' && '🎉'}{t === 'happyHour' && '🍹'}{t === 'hours' && '🕐'}{t === 'dailyFeatures' && '🎣'}{t === 'gallery' && '📷'}{t === 'business' && '🌐'}
              </button>
            ))}
          </div>

          <div style={{padding: '20px', flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 300px)'}}>
            {/* MENU TAB */}
            {tab === 'menu' && (
              <>
                <h2>Menu Sections</h2>
                <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
                  <button onClick={() => { setNewSectionName('Breakfast'); setSectionTimeStart('07:00'); setSectionTimeEnd('11:00'); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>☀️ Breakfast</button>
                  <button onClick={() => { setNewSectionName('Brunch'); setSectionTimeStart('11:00'); setSectionTimeEnd('16:00'); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🥐 Brunch</button>
                  <button onClick={() => { setNewSectionName('Lunch'); setSectionTimeStart('11:00'); setSectionTimeEnd('15:00'); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🌤️ Lunch</button>
                  <button onClick={() => { setNewSectionName('Dinner'); setSectionTimeStart('17:00'); setSectionTimeEnd('22:00'); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🌙 Dinner</button>
                </div>
                <div style={{display: 'flex', gap: 8, marginBottom: 20}}>
                  <input type="text" placeholder="Section name (Seafood, Breakfast, etc.)" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} style={{flex: 1, padding: 10, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8}} />
                  <select value={sectionTimeStart} onChange={(e) => setSectionTimeStart(e.target.value)} style={{padding: 10, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8}}>
                    <option value="">Start Time</option>
                    {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <select value={sectionTimeEnd} onChange={(e) => setSectionTimeEnd(e.target.value)} style={{padding: 10, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8}}>
                    <option value="">End Time</option>
                    {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => { const range = sectionTimeStart && sectionTimeEnd ? `${sectionTimeStart}-${sectionTimeEnd}` : ''; setNewSectionTime(range); addSection('menu'); setSectionTimeStart('11:00'); setSectionTimeEnd('22:00'); }} style={{padding: '10px 16px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>Add Section</button>
                </div>

                <div style={{background: '#0f172a', padding: 16, borderRadius: 8, marginBottom: 20, borderLeft: '4px solid #f59e0b'}}>
                  <h3 style={{margin: '0 0 12px 0', color: '#f59e0b'}}>🎣 TODAY'S ROTATING ITEMS (Catch of Day, Soup of Day, etc.)</h3>

                  {selectedArea.rotating_items?.length > 0 && (
                    <div style={{marginBottom: 16}}>
                      {selectedArea.rotating_items.map(item => (
                        <div key={item.id} style={{background: '#1e293b', padding: 12, borderRadius: 6, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.active ? 1 : 0.5}}>
                          <div style={{flex: 1}}>
                            <h5 style={{margin: '0 0 4px 0'}}>{item.name}</h5>
                            {item.description && <p style={{margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8'}}>{item.description}</p>}
                            {item.price && <p style={{margin: 0, fontWeight: 600}}>{item.price}</p>}
                          </div>
                          <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                            <button onClick={() => toggleRotatingActive(item.id)} style={{padding: '6px 12px', background: item.active ? '#22c55e' : '#64748b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600}}>{item.active ? '✓ Active' : 'Inactive'}</button>
                            <button onClick={() => { setRotatingItem(item); setShowAddRotating(true); }} style={{padding: '6px 10px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Edit</button>
                            <button onClick={() => deleteRotatingItem(item.id)} style={{padding: '6px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showAddRotating ? (
                    <div style={{background: '#1e293b', padding: 12, borderRadius: 6}}>
                      <input type="text" placeholder="Item name (Catch of Day, Soup of Day, etc.)" value={rotatingItem.name} onChange={(e) => setRotatingItem({...rotatingItem, name: e.target.value})} style={{width: '100%', padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 8}} />
                      <textarea placeholder="Description" value={rotatingItem.description} onChange={(e) => setRotatingItem({...rotatingItem, description: e.target.value})} style={{width: '100%', padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 8, minHeight: 60}} />
                      <input type="text" placeholder="Price" value={rotatingItem.price} onChange={(e) => setRotatingItem({...rotatingItem, price: e.target.value})} style={{width: '100%', padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 8}} />
                      <div style={{display: 'flex', gap: 8}}>
                        <button onClick={addRotatingItem} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600}}>Save Item</button>
                        <button onClick={() => { setShowAddRotating(false); setRotatingItem({ name: '', description: '', price: '', images: [], active: true }); }} style={{flex: 1, padding: 8, background: '#64748b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddRotating(true)} style={{width: '100%', padding: 12, background: '#f59e0b', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14}}>+ Add Rotating Item</button>
                  )}
                </div>

                {selectedArea.menu_sections.map(section => (
                  <div key={section.id} style={{background: '#1e293b', padding: 16, borderRadius: 8, marginBottom: 20}}>
                    {editingSectionId === section.id ? (
                      <div style={{background: '#0f172a', padding: 12, borderRadius: 6, marginBottom: 12}}>
                        <h4 style={{margin: '0 0 12px 0'}}>Edit Section</h4>
                        <input type="text" placeholder="Section name" value={editingSectionName} onChange={(e) => setEditingSectionName(e.target.value)} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                        <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                          <select value={editingSectionTimeStart} onChange={(e) => setEditingSectionTimeStart(e.target.value)} style={{flex: 1, padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                            <option value="">Start Time</option>
                            {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <select value={editingSectionTimeEnd} onChange={(e) => setEditingSectionTimeEnd(e.target.value)} style={{flex: 1, padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                            <option value="">End Time</option>
                            {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div style={{display: 'flex', gap: 8}}>
                          <button onClick={() => { const timeRange = editingSectionTimeStart && editingSectionTimeEnd ? `${editingSectionTimeStart}-${editingSectionTimeEnd}` : ''; setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, menu_sections: a.menu_sections.map(s => s.id === section.id ? {...s, name: editingSectionName, time_range: timeRange} : s) } : a)); setEditingSectionId(null); }} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>Save</button>
                          <button onClick={() => setEditingSectionId(null)} style={{flex: 1, padding: 8, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>
                          <button onClick={() => deleteSection(section.id, 'menu')} style={{padding: 8, background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Delete</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                        <div style={{flex: 1}}>
                          <h3 style={{margin: 0, cursor: 'pointer', color: '#0b7a75'}} onClick={() => { setEditingSectionId(section.id); setEditingSectionName(section.name); const [start, end] = section.time_range?.split('-') || ['', '']; setEditingSectionTimeStart(start); setEditingSectionTimeEnd(end); }}>{section.name}</h3>
                          {section.time_range && <p style={{margin: '4px 0 0 0', fontSize: 12, color: '#94a3b8'}}>⏰ {section.time_range}</p>}
                          <p style={{margin: '4px 0 0 0', fontSize: 11, color: '#64748b'}}>Click name to edit</p>
                        </div>
                        <button onClick={() => { setEditingSectionId(section.id); setEditingSectionName(section.name); const [start, end] = section.time_range?.split('-') || ['', '']; setEditingSectionTimeStart(start); setEditingSectionTimeEnd(end); }} style={{padding: '6px 12px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginRight: 8}}>Edit</button>
                      </div>
                    )}

                    <ItemForm isSectionItem={true} sectionId={section.id} onAdd={() => addSectionItem('menu')} onUpdate={() => updateSectionItem('menu')} />

                    {section.items.length > 0 && (
                      <>
                        <h4 style={{margin: '12px 0 8px 0'}}>Items</h4>
                        {section.items.map(item => (
                          <div key={item.id} style={{background: '#0f172a', padding: 12, borderRadius: 6, marginBottom: 8}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                              <div style={{flex: 1}}>
                                <h5 style={{margin: '0 0 4px 0'}}>{item.name}</h5>
                                <p style={{margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8'}}>{item.description}</p>
                                <p style={{margin: 0, fontWeight: 600}}>{item.price}</p>
                                {item.images?.length > 0 && (
                                  <div style={{display: 'flex', gap: 6, marginTop: 8}}>
                                    {item.images.map((img, idx) => (
                                      <div key={idx} style={{width: 40, height: 40, borderRadius: 4, overflow: 'hidden', position: 'relative'}}>
                                        <img src={img.url} alt="item" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        <button onClick={() => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, menu_sections: a.menu_sections.map(s => s.id === section.id ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, images: i.images.filter((_, j) => j !== idx) } : i) } : s) } : a))} style={{position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10, padding: 0}}>✕</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div style={{display: 'flex', gap: 6}}>
                                <button onClick={() => setEditingItem(item)} style={{padding: '6px 10px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Edit</button>
                                <button onClick={() => setShowGallerySelector(item.id)} style={{padding: '6px 10px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>📷 Photo</button>
                                <button onClick={() => deleteSectionItem(section.id, item.id, 'menu')} style={{padding: '6px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Delete</button>
                              </div>
                            </div>

                            {showGallerySelector === item.id && (
                              <div style={{background: '#1e293b', padding: 12, borderRadius: 6, marginTop: 8}}>
                                <h5 style={{margin: '0 0 12px 0'}}>Add Photo</h5>
                                <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
                                  <button onClick={() => galleryInputRef.current?.click()} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>📤 Upload New</button>
                                  <input ref={galleryInputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = (evt) => { const newImg = { url: evt.target.result, label: 'Grilled' }; setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, menu_sections: a.menu_sections.map(s => s.id === section.id ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, images: [...(i.images || []), newImg] } : i) } : s) } : a)); setShowGallerySelector(null); }; reader.readAsDataURL(file); } }} style={{display: 'none'}} />
                                </div>
                                {gallery.length > 0 && (
                                  <>
                                    <p style={{margin: '0 0 8px 0', fontSize: 12, color: '#94a3b8'}}>Or select from gallery:</p>
                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: 8}}>
                                      {gallery.map(img => (
                                        <button key={img.id} onClick={() => { setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, menu_sections: a.menu_sections.map(s => s.id === section.id ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, images: [...(i.images || []), { url: img.url, label: img.type }] } : i) } : s) } : a)); setShowGallerySelector(null); }} style={{width: '100%', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, overflow: 'hidden'}}>
                                          <img src={img.url} alt="gallery" style={{width: '100%', height: 50, objectFit: 'cover', borderRadius: 4}} />
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                                <button onClick={() => setShowGallerySelector(null)} style={{width: '100%', marginTop: 8, padding: 8, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>Close</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* DRINKS TAB */}
            {tab === 'drinks' && (
              <>
                <h2>Drink Sections</h2>
                <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
                  <button onClick={() => { setNewSectionName('Happy Hour'); setSectionTimeStart('16:00'); setSectionTimeEnd('19:00'); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🍹 Happy Hour</button>
                  <button onClick={() => { setNewSectionName('Cocktails'); setSectionTimeStart('17:00'); setSectionTimeEnd('23:00'); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🍸 Cocktails</button>
                  <button onClick={() => { setNewSectionName('Beer & Wine'); setSectionTimeStart(''); setSectionTimeEnd(''); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🍺 Beer & Wine</button>
                  <button onClick={() => { setNewSectionName('Shots'); setSectionTimeStart(''); setSectionTimeEnd(''); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🥃 Shots</button>
                </div>
                <div style={{display: 'flex', gap: 8, marginBottom: 20}}>
                  <input type="text" placeholder="Section name (Cocktails, Beer, Wine, etc.)" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} style={{flex: 1, padding: 10, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8}} />
                  <select value={sectionTimeStart} onChange={(e) => setSectionTimeStart(e.target.value)} style={{padding: 10, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8}}>
                    <option value="">Start Time</option>
                    {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <select value={sectionTimeEnd} onChange={(e) => setSectionTimeEnd(e.target.value)} style={{padding: 10, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8}}>
                    <option value="">End Time</option>
                    {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => { const range = sectionTimeStart && sectionTimeEnd ? `${sectionTimeStart}-${sectionTimeEnd}` : ''; setNewSectionTime(range); addSection('drinks'); setSectionTimeStart('11:00'); setSectionTimeEnd('22:00'); }} style={{padding: '10px 16px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>Add Section</button>
                </div>

                {selectedArea.drink_sections.map(section => (
                  <div key={section.id} style={{background: '#1e293b', padding: 16, borderRadius: 8, marginBottom: 20}}>
                    {editingSectionId === section.id ? (
                      <div style={{background: '#0f172a', padding: 12, borderRadius: 6, marginBottom: 12}}>
                        <h4 style={{margin: '0 0 12px 0'}}>Edit Section</h4>
                        <input type="text" placeholder="Section name" value={editingSectionName} onChange={(e) => setEditingSectionName(e.target.value)} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                        <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                          <select value={editingSectionTimeStart} onChange={(e) => setEditingSectionTimeStart(e.target.value)} style={{flex: 1, padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                            <option value="">Start Time</option>
                            {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          <select value={editingSectionTimeEnd} onChange={(e) => setEditingSectionTimeEnd(e.target.value)} style={{flex: 1, padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                            <option value="">End Time</option>
                            {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div style={{display: 'flex', gap: 8}}>
                          <button onClick={() => { const timeRange = editingSectionTimeStart && editingSectionTimeEnd ? `${editingSectionTimeStart}-${editingSectionTimeEnd}` : ''; setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, drink_sections: a.drink_sections.map(s => s.id === section.id ? {...s, name: editingSectionName, time_range: timeRange} : s) } : a)); setEditingSectionId(null); }} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>Save</button>
                          <button onClick={() => setEditingSectionId(null)} style={{flex: 1, padding: 8, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>
                          <button onClick={() => deleteSection(section.id, 'drinks')} style={{padding: 8, background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Delete</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                        <div style={{flex: 1}}>
                          <h3 style={{margin: 0, cursor: 'pointer', color: '#0b7a75'}} onClick={() => { setEditingSectionId(section.id); setEditingSectionName(section.name); const [start, end] = section.time_range?.split('-') || ['', '']; setEditingSectionTimeStart(start); setEditingSectionTimeEnd(end); }}>{section.name}</h3>
                          {section.time_range && <p style={{margin: '4px 0 0 0', fontSize: 12, color: '#94a3b8'}}>⏰ {section.time_range}</p>}
                          <p style={{margin: '4px 0 0 0', fontSize: 11, color: '#64748b'}}>Click name to edit</p>
                        </div>
                        <button onClick={() => { setEditingSectionId(section.id); setEditingSectionName(section.name); const [start, end] = section.time_range?.split('-') || ['', '']; setEditingSectionTimeStart(start); setEditingSectionTimeEnd(end); }} style={{padding: '6px 12px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, marginRight: 8}}>Edit</button>
                      </div>
                    )}

                    <ItemForm isSectionItem={true} sectionId={section.id} onAdd={() => addSectionItem('drinks')} onUpdate={() => updateSectionItem('drinks')} />

                    {section.items.length > 0 && (
                      <>
                        <h4 style={{margin: '12px 0 8px 0'}}>Items</h4>
                        {section.items.map(item => (
                          <div key={item.id} style={{background: '#0f172a', padding: 12, borderRadius: 6, marginBottom: 8}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                              <div style={{flex: 1}}>
                                <h5 style={{margin: '0 0 4px 0'}}>{item.name}</h5>
                                <p style={{margin: '0 0 4px 0', fontSize: 12, color: '#94a3b8'}}>{item.description}</p>
                                <p style={{margin: 0, fontWeight: 600}}>{item.price}</p>
                                {item.images?.length > 0 && (
                                  <div style={{display: 'flex', gap: 6, marginTop: 8}}>
                                    {item.images.map((img, idx) => (
                                      <div key={idx} style={{width: 40, height: 40, borderRadius: 4, overflow: 'hidden', position: 'relative'}}>
                                        <img src={img.url} alt="item" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        <button onClick={() => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, drink_sections: a.drink_sections.map(s => s.id === section.id ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, images: i.images.filter((_, j) => j !== idx) } : i) } : s) } : a))} style={{position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10, padding: 0}}>✕</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div style={{display: 'flex', gap: 6}}>
                                <button onClick={() => setEditingItem(item)} style={{padding: '6px 10px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Edit</button>
                                <button onClick={() => setShowGallerySelector(item.id)} style={{padding: '6px 10px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>📷 Photo</button>
                                <button onClick={() => deleteSectionItem(section.id, item.id, 'drinks')} style={{padding: '6px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Delete</button>
                              </div>
                            </div>

                            {showGallerySelector === item.id && (
                              <div style={{background: '#1e293b', padding: 12, borderRadius: 6, marginTop: 8}}>
                                <h5 style={{margin: '0 0 12px 0'}}>Add Photo</h5>
                                <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
                                  <button onClick={() => galleryInputRef.current?.click()} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>📤 Upload New</button>
                                  <input ref={galleryInputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { const file = e.target.files[0]; const reader = new FileReader(); reader.onload = (evt) => { const newImg = { url: evt.target.result, label: 'Grilled' }; setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, drink_sections: a.drink_sections.map(s => s.id === section.id ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, images: [...(i.images || []), newImg] } : i) } : s) } : a)); setShowGallerySelector(null); }; reader.readAsDataURL(file); } }} style={{display: 'none'}} />
                                </div>
                                {gallery.length > 0 && (
                                  <>
                                    <p style={{margin: '0 0 8px 0', fontSize: 12, color: '#94a3b8'}}>Or select from gallery:</p>
                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: 8}}>
                                      {gallery.map(img => (
                                        <button key={img.id} onClick={() => { setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, drink_sections: a.drink_sections.map(s => s.id === section.id ? { ...s, items: s.items.map(i => i.id === item.id ? { ...i, images: [...(i.images || []), { url: img.url, label: img.type }] } : i) } : s) } : a)); setShowGallerySelector(null); }} style={{width: '100%', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, overflow: 'hidden'}}>
                                          <img src={img.url} alt="gallery" style={{width: '100%', height: 50, objectFit: 'cover', borderRadius: 4}} />
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                                <button onClick={() => setShowGallerySelector(null)} style={{width: '100%', marginTop: 8, padding: 8, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>Close</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* SPECIALS TAB */}
            {tab === 'specials' && (
              <>
                <h2>Specials</h2>
                {!editingItem && !expandedAddForm && <button onClick={() => setExpandedAddForm('specials')} style={{width: '100%', padding: 12, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 16, fontWeight: 600}}>+ Add Special</button>}
                {(editingItem || expandedAddForm === 'specials') && (
                  <div style={{background: '#1e293b', padding: 16, borderRadius: 8, marginBottom: 16}}>
                    <h4 style={{margin: '0 0 12px 0'}}>{editingItem ? 'Edit Special' : 'Add Special'}</h4>
                    <input type="text" placeholder="Item name" value={editingItem ? editingItem.name : newItem.name} onChange={(e) => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <textarea placeholder="Description" value={editingItem ? editingItem.description : newItem.description} onChange={(e) => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10, height: 60}} />
                    <input type="text" placeholder="Price" value={editingItem ? editingItem.price : newItem.price} onChange={(e) => editingItem ? setEditingItem({...editingItem, price: e.target.value}) : setNewItem({...newItem, price: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <label style={{display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', marginBottom: 12}}>
                      <input type="checkbox" checked={editingItem ? editingItem.active : newItem.active} onChange={(e) => editingItem ? setEditingItem({...editingItem, active: e.target.checked}) : setNewItem({...newItem, active: e.target.checked})} />
                      Active
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: 'pointer', marginBottom: 10}}>📤 Add Image</button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? editingItem.images : newItem.images).map((img, idx) => (
                        <div key={idx} style={{position: 'relative', width: 50, height: 50}}>
                          <img src={img.url} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4}} />
                          <button onClick={() => deleteImage(idx, !!editingItem)} style={{position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10}}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                      <select value={imageLabel} onChange={(e) => setImageLabel(e.target.value)} style={{flex: 1, padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                        <option>Grilled</option>
                        <option>Blackened</option>
                        <option>Fried</option>
                        <option>Steamed</option>
                        <option>Baked</option>
                      </select>
                      <button onClick={editingItem ? () => { updateFlatItem('specials'); setExpandedAddForm(null); } : () => { addFlatItem('specials'); setExpandedAddForm(null); }} style={{flex: 1, padding: 10, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
                        {editingItem ? 'Update' : 'Save'}
                      </button>
                    </div>
                    {(editingItem || expandedAddForm) && <button onClick={() => { setEditingItem(null); setExpandedAddForm(null); }} style={{width: '100%', marginTop: 10, padding: 10, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>}
                  </div>
                )}
                {selectedArea.specials.length > 0 && <ItemRenderer items={selectedArea.specials} targetField="specials" />}
                {selectedArea.specials.length === 0 && !editingItem && !expandedAddForm && <p style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No specials yet</p>}
              </>
            )}

            {/* SIDES TAB */}
            {tab === 'sides' && (
              <>
                <h2>Sides & Add-ons</h2>
                {!editingItem && !expandedAddForm && <button onClick={() => setExpandedAddForm('sides')} style={{width: '100%', padding: 12, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 16, fontWeight: 600}}>+ Add Item</button>}
                {(editingItem || expandedAddForm === 'sides') && (
                  <div style={{background: '#1e293b', padding: 16, borderRadius: 8, marginBottom: 16}}>
                    <h4 style={{margin: '0 0 12px 0'}}>{editingItem ? 'Edit Item' : 'Add Item'}</h4>
                    <div style={{display: 'flex', gap: 10, marginBottom: 10}}>
                      <div style={{flex: 1}}>
                        <label style={{fontSize: 12, color: '#94a3b8'}}>Type</label>
                        <select value={editingItem ? editingItem.type : newItem.type || 'side'} onChange={(e) => editingItem ? setEditingItem({...editingItem, type: e.target.value}) : setNewItem({...newItem, type: e.target.value})} style={{width: '100%', padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                          <option value="side">Side</option>
                          <option value="addon">Add-on</option>
                        </select>
                      </div>
                    </div>
                    <input type="text" placeholder="Item name" value={editingItem ? editingItem.name : newItem.name} onChange={(e) => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <textarea placeholder="Description" value={editingItem ? editingItem.description : newItem.description} onChange={(e) => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10, height: 60}} />
                    <input type="text" placeholder={editingItem?.type === 'addon' || newItem.type === 'addon' ? "Price (e.g. +$1.50)" : "Price (e.g. $3.00)"} value={editingItem ? editingItem.price : newItem.price} onChange={(e) => editingItem ? setEditingItem({...editingItem, price: e.target.value}) : setNewItem({...newItem, price: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <button onClick={() => fileInputRef.current?.click()} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: 'pointer', marginBottom: 10}}>📤 Add Image</button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? editingItem.images : newItem.images).map((img, idx) => (
                        <div key={idx} style={{position: 'relative', width: 50, height: 50}}>
                          <img src={img.url} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4}} />
                          <button onClick={() => deleteImage(idx, !!editingItem)} style={{position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10}}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                      <select value={imageLabel} onChange={(e) => setImageLabel(e.target.value)} style={{flex: 1, padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                        <option>Grilled</option>
                        <option>Blackened</option>
                        <option>Fried</option>
                        <option>Steamed</option>
                        <option>Baked</option>
                      </select>
                      <button onClick={editingItem ? () => { updateFlatItem('sides'); setExpandedAddForm(null); } : () => { addFlatItem('sides'); setExpandedAddForm(null); }} style={{flex: 1, padding: 10, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
                        {editingItem ? 'Update' : 'Save'}
                      </button>
                    </div>
                    {(editingItem || expandedAddForm) && <button onClick={() => { setEditingItem(null); setExpandedAddForm(null); }} style={{width: '100%', marginTop: 10, padding: 10, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>}
                  </div>
                )}

                {sides.length > 0 && (
                  <>
                    {sides.filter(item => item.type === 'side').length > 0 && (
                      <div style={{marginBottom: 24}}>
                        <h3 style={{color: '#0b7a75', marginBottom: 12}}>Sides</h3>
                        <ItemRenderer items={sides.filter(item => item.type === 'side')} targetField="sides" />
                      </div>
                    )}
                    {sides.filter(item => item.type === 'addon').length > 0 && (
                      <div>
                        <h3 style={{color: '#7c3aed', marginBottom: 12}}>Add-ons</h3>
                        <ItemRenderer items={sides.filter(item => item.type === 'addon')} targetField="sides" />
                      </div>
                    )}
                  </>
                )}
                {sides.length === 0 && !editingItem && !expandedAddForm && <p style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No sides yet</p>}
              </>
            )}

            {/* DAILY SPECIALS TAB */}
            {tab === 'daily' && (
              <>
                <h2>Daily Specials</h2>
                <p style={{fontSize: 12, color: '#94a3b8', marginBottom: 16}}>Each special can have optional time restrictions (e.g., Lunch Special 11am-3pm)</p>
                {days.map(day => (
                  <div key={day} style={{background: '#1e293b', padding: 12, borderRadius: 6, marginBottom: 12}}>
                    <h3 style={{margin: '0 0 12px 0'}}>{day}</h3>
                    {selectedArea.daily_specials[day] ? (
                      <div style={{background: '#0f172a', padding: 12, borderRadius: 6}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12}}>
                          <div style={{flex: 1}}>
                            <h5 style={{margin: 0}}>{selectedArea.daily_specials[day].name}</h5>
                            <p style={{margin: '4px 0 0 0', fontSize: 12, color: '#94a3b8'}}>{selectedArea.daily_specials[day].description}</p>
                            <p style={{margin: '4px 0 0 0', fontWeight: 600}}>{selectedArea.daily_specials[day].price}</p>
                            {selectedArea.daily_specials[day].time_range && <p style={{margin: '4px 0 0 0', fontSize: 12, color: '#0b7a75', fontWeight: 600}}>⏰ {selectedArea.daily_specials[day].time_range}</p>}
                            <label style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#f1f5f9'}}>
                              <input type="checkbox" checked={selectedArea.daily_specials[day].active !== false} onChange={(e) => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, daily_specials: { ...a.daily_specials, [day]: { ...a.daily_specials[day], active: e.target.checked } } } : a))} />
                              Active
                            </label>
                          </div>
                          <div style={{display: 'flex', gap: 6}}>
                            <button onClick={() => setEditingItem({...selectedArea.daily_specials[day], day})} style={{padding: '6px 10px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Edit</button>
                            <button onClick={() => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, daily_specials: { ...a.daily_specials, [day]: null } } : a))} style={{padding: '6px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{background: '#0f172a', padding: 12, borderRadius: 6}}>
                        <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
                          <button onClick={() => { setSectionTimeStart('07:00'); setSectionTimeEnd('11:00'); }} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>☀️ Breakfast</button>
                          <button onClick={() => { setSectionTimeStart('11:00'); setSectionTimeEnd('15:00'); }} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🌤️ Lunch</button>
                          <button onClick={() => { setSectionTimeStart('11:00'); setSectionTimeEnd('16:00'); }} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🥐 Brunch</button>
                          <button onClick={() => { setSectionTimeStart('17:00'); setSectionTimeEnd('22:00'); }} style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🌙 Dinner</button>
                          <button onClick={() => { setSectionTimeStart(''); setSectionTimeEnd(''); }} style={{flex: 1, padding: 8, background: '#64748b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>✕ All Day</button>
                        </div>
                        <ItemForm targetField="daily" onAdd={() => { const timeRange = sectionTimeStart && sectionTimeEnd ? `${sectionTimeStart}-${sectionTimeEnd}` : ''; const item = { id: Math.random().toString(36).substr(2, 9), ...newItem, images: newItem.images || [], active: newItem.active, time_range: timeRange }; setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, daily_specials: { ...a.daily_specials, [day]: item } } : a)); setNewItem({ section_id: '', name: '', description: '', price: '', date: '', time: '', location: '', images: [], active: true }); setSectionTimeStart(''); setSectionTimeEnd(''); }} onUpdate={() => { const timeRange = sectionTimeStart && sectionTimeEnd ? `${sectionTimeStart}-${sectionTimeEnd}` : ''; setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, daily_specials: { ...a.daily_specials, [day]: { ...editingItem, time_range: timeRange } } } : a)); setEditingItem(null); setSectionTimeStart(''); setSectionTimeEnd(''); }} />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {/* EVENTS TAB */}
            {tab === 'events' && (
              <>
                <h2>Events</h2>
                {!editingItem && !expandedAddForm && <button onClick={() => setExpandedAddForm('events')} style={{width: '100%', padding: 12, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 16, fontWeight: 600}}>+ Add Event</button>}
                {(editingItem || expandedAddForm === 'events') && (
                  <div style={{background: '#1e293b', padding: 16, borderRadius: 8, marginBottom: 16}}>
                    <h4 style={{margin: '0 0 12px 0'}}>{editingItem ? 'Edit Event' : 'Add Event'}</h4>
                    <input type="text" placeholder="Event name" value={editingItem ? editingItem.name : newItem.name} onChange={(e) => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <textarea placeholder="Description" value={editingItem ? editingItem.description : newItem.description} onChange={(e) => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10, height: 60}} />
                    <input type="date" value={editingItem ? editingItem.date : newItem.date} onChange={(e) => editingItem ? setEditingItem({...editingItem, date: e.target.value}) : setNewItem({...newItem, date: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <select value={editingItem ? editingItem.time : newItem.time} onChange={(e) => editingItem ? setEditingItem({...editingItem, time: e.target.value}) : setNewItem({...newItem, time: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}}>
                      <option value="">Select Event Time</option>
                      {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <input type="text" placeholder="Location" value={editingItem ? editingItem.location : newItem.location} onChange={(e) => editingItem ? setEditingItem({...editingItem, location: e.target.value}) : setNewItem({...newItem, location: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <label style={{display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', marginBottom: 12}}>
                      <input type="checkbox" checked={editingItem ? editingItem.active : newItem.active} onChange={(e) => editingItem ? setEditingItem({...editingItem, active: e.target.checked}) : setNewItem({...newItem, active: e.target.checked})} />
                      Active
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: 'pointer', marginBottom: 10}}>📤 Add Image</button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? editingItem.images : newItem.images).map((img, idx) => (
                        <div key={idx} style={{position: 'relative', width: 50, height: 50}}>
                          <img src={img.url} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4}} />
                          <button onClick={() => deleteImage(idx, !!editingItem)} style={{position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10}}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                      <select value={imageLabel} onChange={(e) => setImageLabel(e.target.value)} style={{flex: 1, padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                        <option>Grilled</option>
                        <option>Blackened</option>
                        <option>Fried</option>
                        <option>Steamed</option>
                        <option>Baked</option>
                      </select>
                      <button onClick={editingItem ? () => { updateFlatItem('events'); setExpandedAddForm(null); } : () => { addFlatItem('events'); setExpandedAddForm(null); }} style={{flex: 1, padding: 10, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
                        {editingItem ? 'Update' : 'Save'}
                      </button>
                    </div>
                    {(editingItem || expandedAddForm) && <button onClick={() => { setEditingItem(null); setExpandedAddForm(null); }} style={{width: '100%', marginTop: 10, padding: 10, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>}
                  </div>
                )}
                {selectedArea.events.length > 0 && <ItemRenderer items={selectedArea.events} targetField="events" />}
                {selectedArea.events.length === 0 && !editingItem && !expandedAddForm && <p style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No events yet</p>}
              </>
            )}

            {/* HAPPY HOUR TAB */}
            {tab === 'happyHour' && (
              <>
                <h2>Happy Hour</h2>
                {!editingItem && !expandedAddForm && <button onClick={() => setExpandedAddForm('happyHour')} style={{width: '100%', padding: 12, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 16, fontWeight: 600}}>+ Add Happy Hour Item</button>}
                {(editingItem || expandedAddForm === 'happyHour') && (
                  <div style={{background: '#1e293b', padding: 16, borderRadius: 8, marginBottom: 16}}>
                    <h4 style={{margin: '0 0 12px 0'}}>{editingItem ? 'Edit Happy Hour Item' : 'Add Happy Hour Item'}</h4>
                    <input type="text" placeholder="Item name" value={editingItem ? editingItem.name : newItem.name} onChange={(e) => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <textarea placeholder="Description" value={editingItem ? editingItem.description : newItem.description} onChange={(e) => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10, height: 60}} />
                    <input type="text" placeholder="Price (e.g. $5 or 50% off)" value={editingItem ? editingItem.price : newItem.price} onChange={(e) => editingItem ? setEditingItem({...editingItem, price: e.target.value}) : setNewItem({...newItem, price: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      <div style={{flex: 1}}>
                        <label style={{fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4}}>Start Time</label>
                        <select value={editingItem ? editingItem.time?.split('-')[0] || eventTimeStart : eventTimeStart} onChange={(e) => { const endTime = editingItem?.time?.split('-')[1] || eventTimeEnd; if (editingItem) { setEditingItem({...editingItem, time: `${e.target.value}-${endTime}`}); } else { setEventTimeStart(e.target.value); } }} style={{width: '100%', padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                          {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div style={{flex: 1}}>
                        <label style={{fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4}}>End Time</label>
                        <select value={editingItem ? editingItem.time?.split('-')[1] || eventTimeEnd : eventTimeEnd} onChange={(e) => { const startTime = editingItem?.time?.split('-')[0] || eventTimeStart; if (editingItem) { setEditingItem({...editingItem, time: `${startTime}-${e.target.value}`}); } else { setEventTimeEnd(e.target.value); } }} style={{width: '100%', padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                          {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <input type="text" placeholder="Days (e.g. Mon-Fri)" value={editingItem ? editingItem.date : newItem.date} onChange={(e) => editingItem ? setEditingItem({...editingItem, date: e.target.value}) : setNewItem({...newItem, date: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <label style={{display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', marginBottom: 12}}>
                      <input type="checkbox" checked={editingItem ? editingItem.active : newItem.active} onChange={(e) => editingItem ? setEditingItem({...editingItem, active: e.target.checked}) : setNewItem({...newItem, active: e.target.checked})} />
                      Active
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: 'pointer', marginBottom: 10}}>📤 Add Image</button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? editingItem.images : newItem.images).map((img, idx) => (
                        <div key={idx} style={{position: 'relative', width: 50, height: 50}}>
                          <img src={img.url} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4}} />
                          <button onClick={() => deleteImage(idx, !!editingItem)} style={{position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10}}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                      <select value={imageLabel} onChange={(e) => setImageLabel(e.target.value)} style={{flex: 1, padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                        <option>Grilled</option>
                        <option>Blackened</option>
                        <option>Fried</option>
                        <option>Steamed</option>
                        <option>Baked</option>
                      </select>
                      <button onClick={editingItem ? () => { const updated = happyHour.map(item => item.id === editingItem.id ? editingItem : item); setHappyHour(updated); setEditingItem(null); setExpandedAddForm(null); } : () => { const item = { id: Math.random().toString(36).substr(2, 9), ...newItem, images: newItem.images || [], active: newItem.active }; setHappyHour([...happyHour, item]); setNewItem({ section_id: '', name: '', description: '', price: '', date: '', time: '', location: '', type: 'side', images: [], active: true }); setExpandedAddForm(null); }} style={{flex: 1, padding: 10, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
                        {editingItem ? 'Update' : 'Save'}
                      </button>
                    </div>
                    {(editingItem || expandedAddForm) && <button onClick={() => { setEditingItem(null); setExpandedAddForm(null); }} style={{width: '100%', marginTop: 10, padding: 10, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>}
                  </div>
                )}
                {happyHour.length > 0 && <ItemRenderer items={happyHour} targetField="happyHour" />}
                {happyHour.length === 0 && !editingItem && !expandedAddForm && <p style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No happy hour items yet</p>}
              </>
            )}

            {/* HOURS TAB */}
            {tab === 'hours' && (
              <>
                <h2>Hours of Operation</h2>
                {days.map(day => (
                  <div key={day} style={{display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, background: '#1e293b', padding: 12, borderRadius: 6}}>
                    <div style={{width: 100, fontWeight: 600}}>{day}</div>
                    <input type="time" value={selectedArea.hours[day].open} onChange={(e) => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, hours: { ...a.hours, [day]: { ...a.hours[day], open: e.target.value } } } : a))} style={{padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}} />
                    <div>to</div>
                    <input type="time" value={selectedArea.hours[day].close} onChange={(e) => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, hours: { ...a.hours, [day]: { ...a.hours[day], close: e.target.value } } } : a))} style={{padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}} />
                  </div>
                ))}
              </>
            )}

            {/* DAILY FEATURES TAB */}
            {tab === 'dailyFeatures' && (
              <>
                <h2>Daily Features</h2>
                {!editingItem && !expandedAddForm && <button onClick={() => setExpandedAddForm('dailyFeatures')} style={{width: '100%', padding: 12, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 16, fontWeight: 600}}>+ Add Feature</button>}
                {(editingItem || expandedAddForm === 'dailyFeatures') && (
                  <div style={{background: '#1e293b', padding: 16, borderRadius: 8, marginBottom: 16}}>
                    <h4 style={{margin: '0 0 12px 0'}}>{editingItem ? 'Edit Feature' : 'Add Feature'}</h4>
                    <input type="text" placeholder="Item name" value={editingItem ? editingItem.name : newItem.name} onChange={(e) => editingItem ? setEditingItem({...editingItem, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <textarea placeholder="Description" value={editingItem ? editingItem.description : newItem.description} onChange={(e) => editingItem ? setEditingItem({...editingItem, description: e.target.value}) : setNewItem({...newItem, description: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10, height: 60}} />
                    <input type="text" placeholder="Price" value={editingItem ? editingItem.price : newItem.price} onChange={(e) => editingItem ? setEditingItem({...editingItem, price: e.target.value}) : setNewItem({...newItem, price: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <label style={{display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', marginBottom: 12}}>
                      <input type="checkbox" checked={editingItem ? editingItem.active : newItem.active} onChange={(e) => editingItem ? setEditingItem({...editingItem, active: e.target.checked}) : setNewItem({...newItem, active: e.target.checked})} />
                      Active
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: 'pointer', marginBottom: 10}}>📤 Add Image</button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? editingItem.images : newItem.images).map((img, idx) => (
                        <div key={idx} style={{position: 'relative', width: 50, height: 50}}>
                          <img src={img.url} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4}} />
                          <button onClick={() => deleteImage(idx, !!editingItem)} style={{position: 'absolute', top: -4, right: -4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10}}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                      <select value={imageLabel} onChange={(e) => setImageLabel(e.target.value)} style={{flex: 1, padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                        <option>Grilled</option>
                        <option>Blackened</option>
                        <option>Fried</option>
                        <option>Steamed</option>
                        <option>Baked</option>
                      </select>
                      <button onClick={editingItem ? () => { updateFlatItem('dailyFeatures'); setExpandedAddForm(null); } : () => { addFlatItem('dailyFeatures'); setExpandedAddForm(null); }} style={{flex: 1, padding: 10, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
                        {editingItem ? 'Update' : 'Save'}
                      </button>
                    </div>
                    {(editingItem || expandedAddForm) && <button onClick={() => { setEditingItem(null); setExpandedAddForm(null); }} style={{width: '100%', marginTop: 10, padding: 10, background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>}
                  </div>
                )}
                {dailyFeatures.length > 0 && <ItemRenderer items={dailyFeatures} targetField="dailyFeatures" />}
                {dailyFeatures.length === 0 && !editingItem && !expandedAddForm && <p style={{color: '#64748b', textAlign: 'center', marginTop: 20}}>No daily features yet</p>}
              </>
            )}

            {/* GALLERY TAB */}
            {tab === 'gallery' && (
              <>
                <h2>Gallery</h2>
                <div style={{marginBottom: 20}}>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{width: '100%', padding: 12, background: uploadingImage ? '#64748b' : '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: uploadingImage ? 'not-allowed' : 'pointer', fontWeight: 600}}>
                    {uploadingImage ? 'Uploading...' : '📤 Upload Image'}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) { setUploadingImage(true); handleImageUpload(e).finally(() => setUploadingImage(false)); } }} style={{display: 'none'}} />
                </div>

                {['Hero', 'Business', 'Trip Swipe'].map(type => (
                  <div key={type} style={{marginBottom: 20}}>
                    <h3>{type} Images</h3>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12}}>
                      {gallery.filter(img => img.type === type).map(img => (
                        <div key={img.id} style={{position: 'relative', borderRadius: 8, overflow: 'hidden'}}>
                          <img src={img.url} alt={img.name} style={{width: '100%', height: 100, objectFit: 'cover'}} />
                          <select value={img.type} onChange={(e) => setGallery(gallery.map(g => g.id === img.id ? {...g, type: e.target.value} : g))} style={{position: 'absolute', bottom: 4, right: 4, padding: '4px 6px', background: '#1e293b', color: '#f1f5f9', border: 'none', borderRadius: 4, fontSize: 10}}>
                            <option>Hero</option>
                            <option>Business</option>
                            <option>Trip Swipe</option>
                          </select>
                          <button onClick={() => setGallery(gallery.filter(g => g.id !== img.id))} style={{position: 'absolute', top: 4, right: 4, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 12}}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {gallery.length === 0 && <p style={{color: '#64748b'}}>No images uploaded yet</p>}
              </>
            )}

            {/* BUSINESS INFO TAB */}
            {tab === 'business' && (
              <>
                <h2>Business Information</h2>
                <div style={{background: '#1e293b', padding: 16, borderRadius: 8}}>
                  <input type="text" placeholder="Business Name" value={business.name} onChange={(e) => setBusiness({...business, name: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 12}} />
                  <input type="text" placeholder="Tagline" value={business.tagline} onChange={(e) => setBusiness({...business, tagline: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 12}} />
                  <input type="text" placeholder="Phone" value={business.phone} onChange={(e) => setBusiness({...business, phone: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 12}} />
                  <input type="text" placeholder="Website" value={business.website} onChange={(e) => setBusiness({...business, website: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 12}} />
                  <input type="text" placeholder="Address" value={business.address} onChange={(e) => setBusiness({...business, address: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 12}} />
                  <textarea placeholder="About / Description" value={business.about} onChange={(e) => setBusiness({...business, about: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 12, height: 100}} />
                </div>
              </>
            )}
          </div>
        </>
      )}

      <footer style={{padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,.1)'}}>
        <button onClick={handleSave} disabled={saving || loading} style={{padding: '12px 24px', background: saving ? '#64748b' : '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600}}>
          {saving ? '⏳ SAVING...' : '💾 SAVE ALL CHANGES'}
        </button>
      </footer>
    </div>
  );
}
