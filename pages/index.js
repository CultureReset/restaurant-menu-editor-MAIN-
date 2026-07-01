import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gcr-api-clean.vercel.app';

export default function MenuEditor() {
  const router = useRouter();
  const { slug } = router.query;

  const [mode, setMode] = useState('choose'); // 'choose' | 'pin' | 'create' | 'editor'
  const [pinEntered, setPinEntered] = useState(false);
  const [pin, setPin] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // { done: 0, total: 0 }

  // AI Chat state
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');

  // Business level
  const [business, setBusiness] = useState({ name: '', tagline: '', phone: '', website: '', address: '', about: '' });
  const [theme, setTheme] = useState({ primary: '#0b7a75', accent: '#f0a500', bg: '#f7f7f7', surface: '#ffffff', text: '#111111' });
  const [gallery, setGallery] = useState([]);
  const [sides, setSides] = useState([]);
  const [dailyFeatures, setDailyFeatures] = useState([]);

  // Area management
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [newAreaName, setNewAreaName] = useState('');
  const [tab, setTab] = useState('menu');

  // Rotating sections (Beer on Tap, Catch of the Day, etc)
  const [rotatingSections, setRotatingSections] = useState([]);
  const [editingRotatingSection, setEditingRotatingSection] = useState(null);
  const [newRotatingSectionName, setNewRotatingSectionName] = useState('');
  const [editingRotatingItem, setEditingRotatingItem] = useState(null);
  const [newRotatingItem, setNewRotatingItem] = useState({ name: '', description: '', price: '', active: true });
  const [expandedRotatingSection, setExpandedRotatingSection] = useState(null);
  const [happyHour, setHappyHour] = useState([]);

  // Current tab state (reusable across all tabs)
  const [editingSection, setEditingSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDays, setNewSectionDays] = useState([]);
  const [newSectionTime, setNewSectionTime] = useState('');
  const [sectionTimeStart, setSectionTimeStart] = useState('11:00');
  const [sectionTimeEnd, setSectionTimeEnd] = useState('22:00');
  const [eventTimeStart, setEventTimeStart] = useState('18:00');
  const [eventTimeEnd, setEventTimeEnd] = useState('22:00');
  const createBlankItem = () => ({
    section_id: '',
    name: '',
    description: '',
    price: '',
    date: '',
    time: '',
    location: '',
    type: 'side',
    images: [],
    active: true,
    available: true,
    featured: false,
    catch_of_the_day: false,
    market_price: false,
    on_tap: false
  });
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState(createBlankItem());
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
    // Don't require slug initially - user chooses mode first
    const newAreaId = Math.random().toString(36).substr(2, 9);
    setSelectedAreaId(newAreaId);

    // Start blank, data loads after PIN auth
    setBusiness({ name: '', tagline: '', phone: '', website: '', address: '', about: '' });
    setAreas([]);
    setMode('choose');

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
      menu_sections: [],
      drink_sections: [],
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
      if (data.token) {
        setToken(data.token);
        setMode('editor');
        setPinEntered(true);

        // Load existing menu data BEFORE showing editor
        try {
          const menuRes = await fetch(`${API_URL}/api/menu-editor/${encodeURIComponent(slug)}/data`, {
            headers: { 'x-menu-token': data.token }
          });
          if (menuRes.ok) {
            const menuData = await menuRes.json();

            // Transform API format to editor format
            if (menuData.entity) {
              setBusiness({
                name: menuData.entity.name || '',
                tagline: menuData.entity.subtitle || '',
                phone: menuData.entity.phone || '',
                website: menuData.entity.website_url || '',
                address: menuData.entity.address_line_1 || '',
                about: menuData.entity.description || ''
              });
            }

            // Create an area with the menu data
            if (menuData.menu_sections || menuData.drink_sections || menuData.hours) {
              const newAreaId = Math.random().toString(36).substr(2, 9);

              const normalizeSections = (sections) => (sections || []).map(s => ({
                ...s,
                name: s.name || s.section_name || '',
                items: (s.items || []).map(i => ({
                  ...withItemDefaults(i),
                  name: i.name || i.item_name || '',
                  price: i.price != null ? String(i.price) : '',
                }))
              }));

              const areaData = {
                id: newAreaId,
                name: 'Main Restaurant',
                menu_sections: normalizeSections(menuData.menu_sections),
                drink_sections: normalizeSections(menuData.drink_sections),
                happy_hour_sections: normalizeSections(menuData.happy_hour_sections),
                specials: (menuData.specials || []).map(s => ({ ...s, name: s.name || s.special_name || '', price: s.price != null ? String(s.price) : '' })),
                events: (menuData.events || []).map(e => ({ ...e, name: e.name || e.event_name || '' })),
                hours: {},
                rotating_items: [],
                daily_specials: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].reduce((acc, d) => ({ ...acc, [d]: null }), {})
              };

              // Convert hours array to object
              if (menuData.hours && menuData.hours.length > 0) {
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                menuData.hours.forEach(h => {
                  const dayName = dayNames[h.day_of_week];
                  areaData.hours[dayName] = { open: h.opens_at, close: h.closes_at };
                });
              } else {
                areaData.hours = { Monday: {open:'11:00',close:'22:00'}, Tuesday: {open:'11:00',close:'22:00'}, Wednesday: {open:'11:00',close:'22:00'}, Thursday: {open:'11:00',close:'22:00'}, Friday: {open:'11:00',close:'23:00'}, Saturday: {open:'11:00',close:'23:00'}, Sunday: {open:'11:00',close:'22:00'} };
              }

              setAreas([areaData]);
              setSelectedAreaId(newAreaId);
            }

            // Load happy hour items into flat state
            if (menuData.happy_hour_sections && menuData.happy_hour_sections.length > 0) {
              const hhItems = menuData.happy_hour_sections.flatMap(s =>
                (s.items || []).map(i => ({
                  ...i,
                  id: i.id || Math.random().toString(36).substr(2, 9),
                  name: i.name || i.item_name || '',
                  price: i.price != null ? String(i.price) : '',
                  section: s.section_name || s.name || '',
                  active: i.active !== false,
                  images: i.images || []
                }))
              );
              setHappyHour(hhItems);
            }

            if (menuData.sides) setSides(menuData.sides.map(s => ({ ...s, name: s.name || s.side_name || '', price: s.price != null ? String(s.price) : '', type: s.item_type || s.type || 'side' })));
            if (menuData.daily_features) setDailyFeatures(menuData.daily_features.map(f => ({ ...f, name: f.name || f.feature_name || '', price: f.price != null ? String(f.price) : '' })));
            if (menuData.entity?.rotating_sections && menuData.entity.rotating_sections.length > 0) {
              setRotatingSections(menuData.entity.rotating_sections);
            }
            if (menuData.entity?.theme && Object.keys(menuData.entity.theme).length > 0) {
              setTheme(prev => ({ ...prev, ...menuData.entity.theme }));
            }
            const photos = menuData.entity_photos || menuData.photos || [];
            if (photos.length > 0) setGallery(photos.map(p => ({
              id:         p.id || Math.random().toString(36).substr(2, 9),
              url:        p.url || p.image_url,
              type:       p.usage_note || (p.is_cover ? 'Cover' : 'gallery'),
              photo_type: p.photo_type || null,
              label:      p.caption || '',
              is_cover:   p.is_cover || false,
              sort_order: p.sort_order || 0,
            })));
          }

          // Now show the editor
          setPinEntered(true);
        } catch (err) {
          console.log('Starting with blank menu');
          setPinEntered(true);
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

  const convertToJpeg = (file) => new Promise((resolve) => {
    const supported = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (supported.includes(file.type)) { resolve(file); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });

  const uploadSingleImage = async (file) => {
    const converted = await convertToJpeg(file);
    const formData = new FormData();
    formData.append('image', converted);
    formData.append('type', 'gallery');
    formData.append('label', imageLabel);
    const res = await fetch(`${API_URL}/api/menu-editor/${encodeURIComponent(slug)}/upload`, {
      method: 'POST',
      headers: { 'x-menu-token': token },
      body: formData,
    });
    const data = await res.json();
    if (!data.url) throw new Error(data.error || 'Upload failed');
    return data.url;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';

    try {
      setUploadingImage(true);
      const uploaded = [];
      for (const file of files) {
        const url = await uploadSingleImage(file);
        uploaded.push({ url, label: imageLabel });
        setGallery(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url, type: 'Business', label: imageLabel }]);
      }
      if (editingItem) {
        setEditingItem({ ...editingItem, images: [...(editingItem.images || []), ...uploaded] });
      } else {
        setNewItem(prev => ({ ...prev, images: [...(prev.images || []), ...uploaded] }));
      }
      setImageLabel('Grilled');
    } catch (err) {
      alert('Error uploading image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload a file to Supabase via API, add to gallery, and attach to an item in areas
  const uploadAndAttachImage = async (file, areaField, sectionId, itemId) => {
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'gallery');
      const res = await fetch(`${API_URL}/api/menu-editor/${encodeURIComponent(slug)}/upload`, {
        method: 'POST',
        headers: { 'x-menu-token': token },
        body: formData,
      });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || 'Upload failed');
      const newImg = { url: data.url, label: 'Photo' };
      setGallery(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url: data.url, type: 'Business', label: '' }]);
      setAreas(areas.map(a => a.id === selectedAreaId
        ? { ...a, [areaField]: a[areaField].map(s => s.id === sectionId
          ? { ...s, items: s.items.map(i => i.id === itemId ? { ...i, images: [...(i.images || []), newImg] } : i) }
          : s) }
        : a));
      setShowGallerySelector(null);
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
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
    const newSection = { id: Math.random().toString(36).substr(2, 9), name: newSectionName, time_range: newSectionTime, available_days: newSectionDays.join(',') || null, items: [] };
    setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, [field]: [...a[field], newSection] } : a));
    setNewSectionName('');
    setNewSectionTime('');
    setNewSectionDays([]);
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

    const item = withItemDefaults({ id: Math.random().toString(36).substr(2, 9), ...newItem, images: newItem.images || [] });
    setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, [field]: a[field].map(s => s.id === newItem.section_id ? { ...s, items: [...s.items, item] } : s) } : a));
    setNewItem(createBlankItem());
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
    const item = withItemDefaults({ id: Math.random().toString(36).substr(2, 9), ...newItem, images: newItem.images || [], active: newItem.active !== false });

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

    setNewItem(createBlankItem());
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
      setEditingItem({ ...editingItem, images: (editingItem.images || []).filter((_, i) => i !== imageIndex) });
    } else {
      setNewItem({ ...newItem, images: (newItem.images || []).filter((_, i) => i !== imageIndex) });
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
      const payload = {
        business,
        gallery: gallery.map(g => ({
          id:         g.id,
          url:        g.url,
          type:       g.type,
          photo_type: g.photo_type || null,
          is_cover:   g.is_cover || false,
          label:      g.label || '',
          caption:    g.label || '',
          sort_order: g.sort_order,
        })),
        sides, dailyFeatures, areas, rotatingSections, theme, happyHour
      };
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

  const handleExport = () => {
    const exportData = {
      business,
      gallery,
      sides,
      dailyFeatures,
      happyHour,
      areas,
      exportDate: new Date().toISOString(),
      exportedFrom: slug || 'restaurant-menu'
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `menu-export-${slug || 'backup'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('✅ Exported to JSON!');
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
      {showDate && <input type="date" value={(editingItem ? editingItem.date : newItem.date) || ''} onChange={(e) => editingItem ? setEditingItem({...editingItem, date: e.target.value}) : setNewItem({...newItem, date: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8}} />}
      {showTime && <input type="time" value={editingItem ? editingItem.time : newItem.time} onChange={(e) => editingItem ? setEditingItem({...editingItem, time: e.target.value}) : setNewItem({...newItem, time: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8}} />}
      {showLocation && <input type="text" placeholder="Location" value={editingItem ? editingItem.location : newItem.location} onChange={(e) => editingItem ? setEditingItem({...editingItem, location: e.target.value}) : setNewItem({...newItem, location: e.target.value})} style={{width: '100%', padding: 8, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 8}} />}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 8}}>
        {[
          ['available', 'Available'],
          ['featured', 'Featured'],
          ['catch_of_the_day', 'Catch of Day'],
          ['market_price', 'Market Price'],
          ['on_tap', 'On Tap']
        ].map(([key, label]) => (
          <label key={key} style={{display: 'flex', alignItems: 'center', gap: 6, color: '#f1f5f9', fontSize: 12, background: '#1e293b', padding: 8, borderRadius: 6}}>
            <input type="checkbox" checked={editingItem ? !!withItemDefaults(editingItem)[key] : !!withItemDefaults(newItem)[key]} onChange={(e) => editingItem ? setEditingItem({...editingItem, [key]: e.target.checked, ...(key === 'available' ? { active: e.target.checked } : {}), ...(key === 'market_price' && e.target.checked ? { price: 'Market Price' } : {})}) : setNewItem({...newItem, [key]: e.target.checked, ...(key === 'available' ? { active: e.target.checked } : {}), ...(key === 'market_price' && e.target.checked ? { price: 'Market Price' } : {})})} />
            {label}
          </label>
        ))}
      </div>
      {!isSectionItem && <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
        <label style={{flex: 1, display: 'flex', alignItems: 'center', gap: 6, color: '#f1f5f9'}}>
          <input type="checkbox" checked={editingItem ? editingItem.active : newItem.active} onChange={(e) => editingItem ? setEditingItem({...editingItem, active: e.target.checked}) : setNewItem({...newItem, active: e.target.checked})} />
          Active
        </label>
      </div>}
      <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
        <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{flex: 1, padding: 8, background: uploadingImage ? '#64748b' : '#1e293b', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: uploadingImage ? 'not-allowed' : 'pointer'}}>
          {uploadingImage ? 'Uploading…' : '📤 Upload Photo'}
        </button>
        <button onClick={() => setShowGallerySelector(showGallerySelector ? null : 'item')} style={{flex: 1, padding: 8, background: showGallerySelector ? '#0b7a75' : '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.2)', borderRadius: 6, cursor: 'pointer'}}>
          🖼 Choose from Gallery
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display: 'none'}} />

      {/* Gallery picker — shows when "Choose from Gallery" is clicked */}
      {showGallerySelector === 'item' && (
        <div style={{marginBottom: 12, padding: 10, background: '#0f172a', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8}}>
          <div style={{fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 700}}>TAP A PHOTO TO USE IT</div>
          {gallery.length === 0 ? (
            <div style={{color: '#475569', fontSize: 12, textAlign: 'center', padding: 12}}>No gallery photos yet — upload some in the Gallery tab first</div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6}}>
              {gallery.map(img => (
                <div key={img.id} onClick={() => {
                  const picked = { url: img.url, label: img.label || img.photo_type || 'Photo' };
                  if (editingItem) setEditingItem({ ...editingItem, images: [...(editingItem.images || []), picked] });
                  else setNewItem(prev => ({ ...prev, images: [...(prev.images || []), picked] }));
                  setShowGallerySelector(null);
                }} style={{cursor: 'pointer', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,.1)'}}>
                  <img src={img.url} alt="" style={{width: '100%', height: 60, objectFit: 'cover', display: 'block'}} />
                  {img.photo_type && <div style={{fontSize: 9, color: '#94a3b8', textAlign: 'center', padding: '2px 0', background: '#1e293b'}}>{img.photo_type}</div>}
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowGallerySelector(null)} style={{width: '100%', marginTop: 8, padding: 6, background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>Cancel</button>
        </div>
      )}

      <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
        {(editingItem ? (editingItem.images || []) : (newItem.images || [])).map((img, idx) => (
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

  const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const DayPicker = ({ selected, onChange }) => (
    <div style={{display:'flex',gap:4,flexWrap:'wrap',margin:'8px 0'}}>
      <button type="button" onClick={() => onChange(selected.length===7?[]:DAY_LABELS)} style={{padding:'4px 8px',borderRadius:4,border:'1px solid rgba(255,255,255,.2)',background:selected.length===7?'#0b7a75':'#1e293b',color:'#f1f5f9',cursor:'pointer',fontSize:11,fontWeight:600}}>All</button>
      {DAY_LABELS.map(d=>(
        <button type="button" key={d} onClick={()=>onChange(selected.includes(d)?selected.filter(x=>x!==d):[...selected,d])} style={{padding:'4px 8px',borderRadius:4,border:'1px solid rgba(255,255,255,.2)',background:selected.includes(d)?'#0b7a75':'#1e293b',color:selected.includes(d)?'#fff':'#94a3b8',cursor:'pointer',fontSize:11,fontWeight:600}}>{d}</button>
      ))}
    </div>
  );

  const selectedArea = areas.find(a => a.id === selectedAreaId);

  const itemDefaults = {
    active: true,
    available: true,
    featured: false,
    catch_of_the_day: false,
    market_price: false,
    on_tap: false
  };

  const withItemDefaults = (item) => ({ ...itemDefaults, ...item });

  const getLaunchItems = () => {
    if (!selectedArea) return [];
    const collect = (field, label) => (selectedArea[field] || []).flatMap(section =>
      (section.items || []).map(item => ({ ...withItemDefaults(item), sectionId: section.id, sectionName: section.name, field, label }))
    );
    return [
      ...collect('menu_sections', 'Menu'),
      ...collect('drink_sections', 'Drinks')
    ];
  };

  const updateNestedItem = (field, sectionId, itemId, updater) => {
    setAreas(areas.map(area => area.id === selectedAreaId ? {
      ...area,
      [field]: (area[field] || []).map(section => section.id === sectionId ? {
        ...section,
        items: (section.items || []).map(item => item.id === itemId ? updater(withItemDefaults(item)) : item)
      } : section)
    } : area));
  };

  const setSingleCatchOfDay = (field, sectionId, itemId) => {
    setAreas(areas.map(area => area.id === selectedAreaId ? {
      ...area,
      menu_sections: (area.menu_sections || []).map(section => ({
        ...section,
        items: (section.items || []).map(item => ({ ...item, catch_of_the_day: field === 'menu_sections' && section.id === sectionId && item.id === itemId }))
      })),
      drink_sections: (area.drink_sections || []).map(section => ({
        ...section,
        items: (section.items || []).map(item => ({ ...item, catch_of_the_day: field === 'drink_sections' && section.id === sectionId && item.id === itemId }))
      }))
    } : area));
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

  // AI Chat handler
  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = { role: 'user', content: aiInput };
    setAiMessages([...aiMessages, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/gcr/grok-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: aiInput,
          history: aiMessages.slice(-10),
          provider: 'anthropic',
          model: 'claude-sonnet-4-6',
          context: 'menu_creation'
        })
      });
      const data = await res.json();
      const reply = data.reply || 'No response';
      setAiMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      // Parse summary from response
      if (reply.includes('section') || reply.includes('item')) {
        const summary = extractSummary(reply);
        if (summary) setAiSummary(summary);
      }
    } catch (err) {
      console.error('AI error:', err);
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + err.message }]);
    } finally {
      setAiLoading(false);
    }
  };

  const extractSummary = (text) => {
    const summary = {};
    const sectionMatch = text.match(/(\d+)\s*(?:menu\s+)?sections?/i);
    const itemMatch = text.match(/(\d+)\s*items?/i);
    const happyMatch = text.match(/happy\s+hours?.*?(\d+[:\d]*)\s*-\s*(\d+[:\d]*)/i);

    if (sectionMatch) summary.sections = sectionMatch[1];
    if (itemMatch) summary.items = itemMatch[1];
    if (happyMatch) summary.happyHours = `${happyMatch[1]} - ${happyMatch[2]}`;

    return Object.keys(summary).length > 0 ? summary : null;
  };

  const handleAiApprove = async () => {
    if (!restaurantName.trim()) {
      alert('Please enter restaurant name');
      return;
    }

    setLoading(true);
    try {
      // Create new business with AI data
      const res = await fetch(`${API_URL}/api/menu-editor/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: restaurantName,
          ai_data: aiMessages,
          ai_summary: aiSummary
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Menu created! PIN: ' + data.pin);
        setMode('editor');
        setPin(data.pin);
        setPinEntered(true);
        setToken(data.token);
      } else {
        alert('Error: ' + (data.error || 'Failed to create'));
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* CHOOSE MODE - Select Enter PIN or Create Menu */}
      {mode === 'choose' && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 20, padding: 20}}>
          <div style={{textAlign: 'center', marginBottom: 40}}>
            <h1 style={{fontSize: 32, marginBottom: 8}}>🍽️ Menu Editor</h1>
            <p style={{color: '#94a3b8'}}>What would you like to do?</p>
          </div>
          <button onClick={() => setMode('pin')} style={{padding: '16px 32px', fontSize: 16, fontWeight: 600, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', minWidth: 280}}>
            🔓 Edit Existing Menu (Enter PIN)
          </button>
          <button onClick={() => { setMode('create'); setAiMessages([]); }} style={{padding: '16px 32px', fontSize: 16, fontWeight: 600, background: '#065f46', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', minWidth: 280}}>
            ✨ Create New Menu (AI)
          </button>
        </div>
      )}

      {/* PIN ENTRY MODE */}
      {mode === 'pin' && !pinEntered && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 20}}>
          <div style={{textAlign: 'center', marginBottom: 20}}>
            <h1 style={{fontSize: 28, marginBottom: 8}}>🔐 Menu Editor</h1>
            <p style={{color: '#94a3b8'}}>Enter PIN to continue</p>
          </div>
          <form onSubmit={handlePinSubmit} style={{display: 'flex', flexDirection: 'column', gap: 12, minWidth: 300}}>
            <input type="password" placeholder="Enter PIN" maxLength="6" value={pin} onChange={(e) => setPin(e.target.value)} autoFocus style={{padding: '12px 16px', fontSize: 18, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8}} />
            <button type="submit" disabled={loading} style={{padding: '12px 16px', fontSize: 16, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>
              {loading ? 'Loading...' : 'Unlock'}
            </button>
          </form>
          <button onClick={() => setMode('choose')} style={{marginTop: 20, color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer'}}>← Back</button>
        </div>
      )}

      {/* AI CREATE MODE */}
      {mode === 'create' && (
        <div style={{display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a'}}>
          <div style={{padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 style={{margin: 0}}>✨ AI Menu Creator</h2>
            <button onClick={() => setMode('choose')} style={{color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14}}>← Back</button>
          </div>

          <div style={{flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12}}>
            {aiMessages.map((msg, i) => (
              <div key={i} style={{alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '12px 16px', background: msg.role === 'user' ? '#0b7a75' : '#1e293b', color: '#f1f5f9', borderRadius: '12px 12px ' + (msg.role === 'user' ? '2px 12px' : '12px 2px'), fontSize: 14, lineHeight: 1.5}}>
                {msg.content}
              </div>
            ))}
            {aiLoading && <div style={{alignSelf: 'flex-start', padding: '12px 16px', color: '#94a3b8', fontSize: 13}}>🤖 thinking…</div>}
          </div>

          {aiSummary && (
            <div style={{padding: 16, background: '#1e293b', borderTop: '1px solid rgba(255,255,255,.1)'}}>
              <div style={{fontSize: 13, fontWeight: 600, marginBottom: 8}}>📊 Summary:</div>
              <div style={{fontSize: 12, color: '#94a3b8', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8}}>
                {aiSummary.sections && <div>✓ {aiSummary.sections} sections</div>}
                {aiSummary.items && <div>✓ {aiSummary.items} items</div>}
                {aiSummary.happyHours && <div>✓ Happy Hours: {aiSummary.happyHours}</div>}
              </div>
            </div>
          )}

          <div style={{padding: 16, borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', gap: 8}}>
            <input type="text" placeholder="Restaurant name..." value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} style={{flex: 1, padding: '10px 14px', background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8}} />
            <form onSubmit={handleAiChat} style={{display: 'flex', gap: 8, flex: 1}}>
              <textarea placeholder="Paste menu data here…" value={aiInput} onChange={(e) => setAiInput(e.target.value)} style={{flex: 1, padding: '10px 14px', background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, minHeight: 60, maxHeight: 60, resize: 'none'}} />
              <button type="submit" disabled={aiLoading} style={{padding: '10px 16px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>Send</button>
            </form>
            {aiSummary && <button onClick={handleAiApprove} disabled={loading} style={{padding: '10px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>✅ Save</button>}
          </div>
        </div>
      )}

      {/* EDITOR MODE */}
      {mode === 'editor' && (
      <>
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
            {['today', 'menu', 'drinks', 'specials', 'sides', 'daily', 'events', 'happyHour', 'hours', 'dailyFeatures', 'gallery', 'preview', 'business'].map(t => (
              <button key={t} onClick={() => { setTab(t); setEditingItem(null); setNewItem(createBlankItem()); }} style={{padding: '8px 12px', background: tab === t ? '#0b7a75' : '#1e293b', color: '#f1f5f9', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: tab === t ? 600 : 400, whiteSpace: 'nowrap'}}>
                {t === 'today' && '⚡'}{t === 'menu' && '🍽️'}{t === 'drinks' && '🥤'}{t === 'specials' && '⭐'}{t === 'sides' && '➕'}{t === 'daily' && '📅'}{t === 'events' && '🎉'}{t === 'happyHour' && '🍹'}{t === 'hours' && '🕐'}{t === 'dailyFeatures' && '🎣'}{t === 'gallery' && '📷'}{t === 'preview' && '👁️'}{t === 'business' && '🌐'}
              </button>
            ))}
          </div>

          <div style={{padding: '20px', flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 300px)'}}>
            {/* TODAY TAB */}
            {tab === 'today' && (
              <>
                <h2>Today</h2>
                <p style={{fontSize: 13, color: '#94a3b8', marginTop: -6, marginBottom: 16}}>Fast daily controls for prices, sold out items, catch of the day, beer on tap, and specials.</p>

                {getLaunchItems().filter(item => item.catch_of_the_day).length > 0 && (
                  <div style={{background: '#1e293b', borderLeft: '4px solid #f59e0b', padding: 14, borderRadius: 8, marginBottom: 16}}>
                    <div style={{fontSize: 12, color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em'}}>Catch of the Day</div>
                    {getLaunchItems().filter(item => item.catch_of_the_day).map(item => (
                      <div key={`${item.field}-${item.id}`} style={{marginTop: 6, display: 'flex', justifyContent: 'space-between', gap: 10}}>
                        <strong>{item.name}</strong>
                        <span style={{color: '#4ade80', fontWeight: 700}}>{item.market_price ? 'Market Price' : item.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 18}}>
                  {rotatingSections.map(sec => (
                    <div key={sec.id} style={{background: '#1e293b', padding: 12, borderRadius: 8}}>
                      <h3 style={{margin: '0 0 8px 0', color: '#f59e0b', fontSize: 15}}>{sec.name}</h3>
                      {(sec.items || []).length === 0 && <p style={{color: '#64748b', fontSize: 12, margin: 0}}>No rotating items yet.</p>}
                      {(sec.items || []).map(item => (
                        <div key={item.id} style={{display: 'grid', gridTemplateColumns: '1fr 76px 54px', gap: 8, alignItems: 'center', padding: '7px 0', borderTop: '1px solid rgba(255,255,255,.08)'}}>
                          <div>
                            <div style={{fontWeight: 700, fontSize: 13}}>{item.name}</div>
                            {item.description && <div style={{fontSize: 11, color: '#94a3b8'}}>{item.description}</div>}
                          </div>
                          <input value={item.price || ''} onChange={(e) => setRotatingSections(rotatingSections.map(s => s.id === sec.id ? {...s, items: s.items.map(i => i.id === item.id ? {...i, price: e.target.value} : i)} : s))} placeholder="$" style={{padding: 6, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 5, fontSize: 12}} />
                          <button onClick={() => setRotatingSections(rotatingSections.map(s => s.id === sec.id ? {...s, items: s.items.map(i => i.id === item.id ? {...i, active: !i.active} : i)} : s))} style={{padding: '6px 8px', background: item.active !== false ? '#166534' : '#475569', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 11}}>{item.active !== false ? 'On' : 'Off'}</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <h3 style={{marginBottom: 10}}>Menu & Drink Items</h3>
                {getLaunchItems().length === 0 && <p style={{color: '#64748b'}}>No menu items yet. Add sections and items in Menu or Drinks.</p>}
                {getLaunchItems().map(item => (
                  <div key={`${item.field}-${item.id}`} style={{background: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 10, opacity: item.available === false || item.active === false ? .62 : 1}}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 110px', gap: 10, alignItems: 'start'}}>
                      <div>
                        <div style={{fontSize: 11, color: '#94a3b8', marginBottom: 3}}>{item.label} / {item.sectionName}</div>
                        <strong>{item.name}</strong>
                        {item.description && <p style={{margin: '4px 0 0', fontSize: 12, color: '#94a3b8'}}>{item.description}</p>}
                      </div>
                      <input value={item.market_price ? 'Market Price' : (item.price || '')} onChange={(e) => updateNestedItem(item.field, item.sectionId, item.id, old => ({ ...old, price: e.target.value, market_price: e.target.value.toLowerCase().includes('market') }))} style={{padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, fontWeight: 700}} />
                    </div>
                    <div style={{display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10}}>
                      <button onClick={() => updateNestedItem(item.field, item.sectionId, item.id, old => ({ ...old, available: old.available === false ? true : false, active: old.available === false ? true : false }))} style={{padding: '7px 10px', background: item.available === false || item.active === false ? '#7f1d1d' : '#166534', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700}}>{item.available === false || item.active === false ? 'Sold Out' : 'Available'}</button>
                      <button onClick={() => updateNestedItem(item.field, item.sectionId, item.id, old => ({ ...old, featured: !old.featured }))} style={{padding: '7px 10px', background: item.featured ? '#7c3aed' : '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>Featured</button>
                      <button onClick={() => item.catch_of_the_day ? updateNestedItem(item.field, item.sectionId, item.id, old => ({ ...old, catch_of_the_day: false })) : setSingleCatchOfDay(item.field, item.sectionId, item.id)} style={{padding: '7px 10px', background: item.catch_of_the_day ? '#f59e0b' : '#334155', color: item.catch_of_the_day ? '#111827' : 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700}}>Catch</button>
                      <button onClick={() => updateNestedItem(item.field, item.sectionId, item.id, old => ({ ...old, market_price: !old.market_price, price: !old.market_price ? 'Market Price' : '' }))} style={{padding: '7px 10px', background: item.market_price ? '#0ea5e9' : '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>Market</button>
                      {item.field === 'drink_sections' && <button onClick={() => updateNestedItem(item.field, item.sectionId, item.id, old => ({ ...old, on_tap: !old.on_tap }))} style={{padding: '7px 10px', background: item.on_tap ? '#10b981' : '#334155', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>On Tap</button>}
                    </div>
                  </div>
                ))}

                <h3 style={{margin: '20px 0 10px'}}>Active Specials</h3>
                {(selectedArea.specials || []).length === 0 && <p style={{color: '#64748b'}}>No specials yet.</p>}
                {(selectedArea.specials || []).map(special => (
                  <div key={special.id} style={{background: '#1e293b', padding: 12, borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', gap: 10}}>
                    <div>
                      <strong>{special.name}</strong>
                      <div style={{fontSize: 12, color: '#94a3b8'}}>{special.description}</div>
                    </div>
                    <button onClick={() => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, specials: a.specials.map(i => i.id === special.id ? { ...i, active: i.active === false ? true : false } : i) } : a))} style={{padding: '6px 10px', background: special.active === false ? '#475569' : '#166534', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>{special.active === false ? 'Off' : 'Active'}</button>
                  </div>
                ))}
              </>
            )}

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
                <div style={{background:'#1e293b',padding:12,borderRadius:8,marginBottom:20}}>
                  <div style={{display:'flex',gap:8,marginBottom:8}}>
                    <input type="text" placeholder="Section name (Seafood, Breakfast, etc.)" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} style={{flex:1,padding:10,background:'#0f172a',color:'#f1f5f9',border:'1px solid rgba(255,255,255,.15)',borderRadius:8}} />
                    <select value={sectionTimeStart} onChange={(e) => setSectionTimeStart(e.target.value)} style={{padding:10,background:'#0f172a',color:'#f1f5f9',border:'1px solid rgba(255,255,255,.15)',borderRadius:8}}>
                      <option value="">Start Time</option>
                      {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <select value={sectionTimeEnd} onChange={(e) => setSectionTimeEnd(e.target.value)} style={{padding:10,background:'#0f172a',color:'#f1f5f9',border:'1px solid rgba(255,255,255,.15)',borderRadius:8}}>
                      <option value="">End Time</option>
                      {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div style={{fontSize:12,color:'#94a3b8',marginBottom:2}}>Days served (leave blank = every day)</div>
                  <DayPicker selected={newSectionDays} onChange={setNewSectionDays} />
                  <button onClick={() => { const range = sectionTimeStart && sectionTimeEnd ? `${sectionTimeStart}-${sectionTimeEnd}` : ''; setNewSectionTime(range); addSection('menu'); setSectionTimeStart('11:00'); setSectionTimeEnd('22:00'); }} style={{marginTop:8,padding:'10px 16px',background:'#0b7a75',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Add Section</button>
                </div>

                <div style={{background: '#0f172a', padding: 16, borderRadius: 8, marginBottom: 20, borderLeft: '4px solid #f59e0b'}}>
                  <h3 style={{margin: '0 0 4px 0', color: '#f59e0b'}}>🔄 ROTATING SECTIONS</h3>
                  <p style={{margin: '0 0 16px 0', fontSize: 12, color: '#64748b'}}>Beer on Tap, Catch of the Day, Soup of the Day — each as its own named section with items underneath.</p>

                  {rotatingSections.map(sec => (
                    <div key={sec.id} style={{background: '#1e293b', borderRadius: 8, marginBottom: 12, overflow: 'hidden'}}>
                      <div style={{padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        {editingRotatingSection === sec.id ? (
                          <div style={{display: 'flex', gap: 8, flex: 1}}>
                            <input type="text" value={newRotatingSectionName} onChange={e => setNewRotatingSectionName(e.target.value)} style={{flex: 1, padding: '6px 10px', background: '#0f172a', color: '#f1f5f9', border: '1px solid #f59e0b', borderRadius: 6, fontSize: 14}} autoFocus />
                            <button onClick={() => { setRotatingSections(rotatingSections.map(s => s.id === sec.id ? {...s, name: newRotatingSectionName} : s)); setEditingRotatingSection(null); }} style={{padding: '6px 12px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>Save</button>
                            <button onClick={() => setEditingRotatingSection(null)} style={{padding: '6px 12px', background: '#64748b', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <span style={{fontWeight: 700, fontSize: 15, color: '#f59e0b', cursor: 'pointer'}} onClick={() => setExpandedRotatingSection(expandedRotatingSection === sec.id ? null : sec.id)}>{sec.name} <span style={{fontSize: 12, color: '#64748b'}}>({sec.items.length} items)</span></span>
                            <div style={{display: 'flex', gap: 6}}>
                              <button onClick={() => { setEditingRotatingSection(sec.id); setNewRotatingSectionName(sec.name); }} style={{padding: '4px 10px', background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>✏️ Rename</button>
                              <button onClick={() => setExpandedRotatingSection(expandedRotatingSection === sec.id ? null : sec.id)} style={{padding: '4px 10px', background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>{expandedRotatingSection === sec.id ? '▲ Hide' : '▼ Edit'}</button>
                              <button onClick={() => setRotatingSections(rotatingSections.filter(s => s.id !== sec.id))} style={{padding: '4px 10px', background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🗑</button>
                            </div>
                          </>
                        )}
                      </div>

                      {expandedRotatingSection === sec.id && (
                        <div style={{padding: '0 16px 16px'}}>
                          {sec.items.map(item => (
                            <div key={item.id} style={{background: '#0f172a', padding: 10, borderRadius: 6, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: item.active ? 1 : 0.5}}>
                              {editingRotatingItem?.id === item.id && editingRotatingItem?.sectionId === sec.id ? (
                                <div style={{flex: 1}}>
                                  <input type="text" value={editingRotatingItem.name} onChange={e => setEditingRotatingItem({...editingRotatingItem, name: e.target.value})} placeholder="Name" style={{width: '100%', padding: 7, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 6}} />
                                  <textarea value={editingRotatingItem.description || ''} onChange={e => setEditingRotatingItem({...editingRotatingItem, description: e.target.value})} placeholder="Description" style={{width: '100%', padding: 7, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 6, height: 50}} />
                                  <input type="text" value={editingRotatingItem.price || ''} onChange={e => setEditingRotatingItem({...editingRotatingItem, price: e.target.value})} placeholder="Price" style={{width: '100%', padding: 7, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 6}} />
                                  <div style={{display: 'flex', gap: 6}}>
                                    <button onClick={() => { setRotatingSections(rotatingSections.map(s => s.id === sec.id ? {...s, items: s.items.map(i => i.id === editingRotatingItem.id ? {...editingRotatingItem} : i)} : s)); setEditingRotatingItem(null); }} style={{flex: 1, padding: 7, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600}}>Save</button>
                                    <button onClick={() => setEditingRotatingItem(null)} style={{flex: 1, padding: 7, background: '#64748b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{flex: 1}}>
                                    <strong style={{fontSize: 14}}>{item.name}</strong>
                                    {item.description && <p style={{margin: '2px 0', fontSize: 12, color: '#94a3b8'}}>{item.description}</p>}
                                    {item.price && <span style={{fontWeight: 600, color: '#4ade80', fontSize: 13}}>{item.price}</span>}
                                  </div>
                                  <div style={{display: 'flex', gap: 6, marginLeft: 8}}>
                                    <button onClick={() => setRotatingSections(rotatingSections.map(s => s.id === sec.id ? {...s, items: s.items.map(i => i.id === item.id ? {...i, active: !i.active} : i)} : s))} style={{padding: '4px 8px', background: item.active ? '#166534' : '#64748b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11}}>{item.active ? '✓ On' : 'Off'}</button>
                                    <button onClick={() => setEditingRotatingItem({...item, sectionId: sec.id})} style={{padding: '4px 8px', background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11}}>Edit</button>
                                    <button onClick={() => setRotatingSections(rotatingSections.map(s => s.id === sec.id ? {...s, items: s.items.filter(i => i.id !== item.id)} : s))} style={{padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11}}>✕</button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}

                          {/* Add item form */}
                          <div style={{background: '#0f172a', padding: 10, borderRadius: 6, border: '1px dashed rgba(245,158,11,.3)'}}>
                            <input type="text" value={newRotatingItem.sectionId === sec.id ? newRotatingItem.name : ''} onChange={e => setNewRotatingItem({...newRotatingItem, name: e.target.value, sectionId: sec.id})} onFocus={() => setNewRotatingItem({...newRotatingItem, sectionId: sec.id})} placeholder="Item name (e.g. Grouper, Bud Light)" style={{width: '100%', padding: 7, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 6}} />
                            <input type="text" value={newRotatingItem.sectionId === sec.id ? newRotatingItem.description || '' : ''} onChange={e => setNewRotatingItem({...newRotatingItem, description: e.target.value, sectionId: sec.id})} onFocus={() => setNewRotatingItem({...newRotatingItem, sectionId: sec.id})} placeholder="Description (optional)" style={{width: '100%', padding: 7, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 6}} />
                            <input type="text" value={newRotatingItem.sectionId === sec.id ? newRotatingItem.price || '' : ''} onChange={e => setNewRotatingItem({...newRotatingItem, price: e.target.value, sectionId: sec.id})} onFocus={() => setNewRotatingItem({...newRotatingItem, sectionId: sec.id})} placeholder="Price (optional)" style={{width: '100%', padding: 7, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, marginBottom: 6}} />
                            <button onClick={() => {
                              if (!newRotatingItem.name.trim()) return;
                              const id = Math.random().toString(36).substr(2, 9);
                              setRotatingSections(rotatingSections.map(s => s.id === sec.id ? {...s, items: [...s.items, {id, name: newRotatingItem.name, description: newRotatingItem.description || '', price: newRotatingItem.price || '', active: true}]} : s));
                              setNewRotatingItem({ name: '', description: '', price: '', active: true, sectionId: sec.id });
                            }} style={{width: '100%', padding: 8, background: '#f59e0b', color: '#000', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600}}>+ Add Item</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={{display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap'}}>
                    <input type="text" value={newRotatingSectionName} onChange={e => setNewRotatingSectionName(e.target.value)} placeholder="Section name (e.g. Beer on Tap, Catch of the Day - Lunch)" style={{flex: 1, minWidth: 200, padding: 10, background: '#1e293b', color: '#f1f5f9', border: '1px solid #f59e0b', borderRadius: 6, fontSize: 14}} onKeyDown={e => { if (e.key === 'Enter' && newRotatingSectionName.trim()) { setRotatingSections([...rotatingSections, {id: Math.random().toString(36).substr(2,9), name: newRotatingSectionName.trim(), type: newRotatingSectionName.toLowerCase().match(/beer|wine|drink|cocktail|spirit|tap|keg|brew/) ? 'drinks' : 'food', items: []}]); setNewRotatingSectionName(''); }}} />
                    <select defaultValue="auto" id="rotating-type-select" style={{padding: 10, background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}}>
                      <option value="auto">Auto-detect</option>
                      <option value="food">🍽️ Food (Menu tab)</option>
                      <option value="drinks">🍺 Drinks (Drinks tab)</option>
                    </select>
                    <button onClick={() => {
                      if (!newRotatingSectionName.trim()) return;
                      const sel = document.getElementById('rotating-type-select');
                      let type = sel ? sel.value : 'auto';
                      if (type === 'auto') type = newRotatingSectionName.toLowerCase().match(/beer|wine|drink|cocktail|spirit|tap|keg|brew/) ? 'drinks' : 'food';
                      setRotatingSections([...rotatingSections, {id: Math.random().toString(36).substr(2,9), name: newRotatingSectionName.trim(), type, items: []}]);
                      setNewRotatingSectionName('');
                    }} style={{padding: '10px 16px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700}}>+ Add Section</button>
                  </div>
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
                                  <label style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, textAlign: 'center'}}>📤 Upload New<input type="file" accept="image/*" style={{display:'none'}} onChange={(e) => { if (e.target.files[0]) uploadAndAttachImage(e.target.files[0], 'menu_sections', section.id, item.id); e.target.value=''; }} /></label>
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

                {/* Rotating drink sections (Beer on Tap, Wine List, etc.) */}
                {rotatingSections.filter(s => s.type === 'drinks').length > 0 && (
                  <div style={{background: '#0f172a', padding: 16, borderRadius: 8, marginBottom: 20, borderLeft: '4px solid #f59e0b'}}>
                    <h3 style={{margin: '0 0 4px 0', color: '#f59e0b'}}>🔄 ROTATING DRINK SECTIONS</h3>
                    <p style={{margin: '0 0 12px 0', fontSize: 12, color: '#64748b'}}>Managed from the Menu tab → Rotating Sections</p>
                    {rotatingSections.filter(s => s.type === 'drinks').map(sec => (
                      <div key={sec.id} style={{background: '#1e293b', borderRadius: 6, marginBottom: 8, padding: '10px 14px'}}>
                        <strong style={{color: '#f59e0b'}}>{sec.name}</strong>
                        <span style={{fontSize: 12, color: '#64748b', marginLeft: 8}}>{sec.items.filter(i => i.active).length} active items</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
                  <button onClick={() => { setNewSectionName('Happy Hour'); setSectionTimeStart('16:00'); setSectionTimeEnd('19:00'); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🍹 Happy Hour</button>
                  <button onClick={() => { setNewSectionName('Cocktails'); setSectionTimeStart('17:00'); setSectionTimeEnd('23:00'); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🍸 Cocktails</button>
                  <button onClick={() => { setNewSectionName('Beer & Wine'); setSectionTimeStart(''); setSectionTimeEnd(''); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🍺 Beer & Wine</button>
                  <button onClick={() => { setNewSectionName('Shots'); setSectionTimeStart(''); setSectionTimeEnd(''); }} style={{padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12}}>🥃 Shots</button>
                </div>
                <div style={{background:'#1e293b',padding:12,borderRadius:8,marginBottom:20}}>
                  <div style={{display:'flex',gap:8,marginBottom:8}}>
                    <input type="text" placeholder="Section name (Cocktails, Beer, Wine, etc.)" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} style={{flex:1,padding:10,background:'#0f172a',color:'#f1f5f9',border:'1px solid rgba(255,255,255,.15)',borderRadius:8}} />
                    <select value={sectionTimeStart} onChange={(e) => setSectionTimeStart(e.target.value)} style={{padding:10,background:'#0f172a',color:'#f1f5f9',border:'1px solid rgba(255,255,255,.15)',borderRadius:8}}>
                      <option value="">Start Time</option>
                      {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <select value={sectionTimeEnd} onChange={(e) => setSectionTimeEnd(e.target.value)} style={{padding:10,background:'#0f172a',color:'#f1f5f9',border:'1px solid rgba(255,255,255,.15)',borderRadius:8}}>
                      <option value="">End Time</option>
                      {timeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div style={{fontSize:12,color:'#94a3b8',marginBottom:2}}>Days served (leave blank = every day)</div>
                  <DayPicker selected={newSectionDays} onChange={setNewSectionDays} />
                  <button onClick={() => { const range = sectionTimeStart && sectionTimeEnd ? `${sectionTimeStart}-${sectionTimeEnd}` : ''; setNewSectionTime(range); addSection('drinks'); setSectionTimeStart('11:00'); setSectionTimeEnd('22:00'); }} style={{marginTop:8,padding:'10px 16px',background:'#0b7a75',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Add Section</button>
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
                                  <label style={{flex: 1, padding: 8, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, textAlign: 'center'}}>📤 Upload New<input type="file" accept="image/*" style={{display:'none'}} onChange={(e) => { if (e.target.files[0]) uploadAndAttachImage(e.target.files[0], 'drink_sections', section.id, item.id); e.target.value=''; }} /></label>
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
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? (editingItem.images || []) : (newItem.images || [])).map((img, idx) => (
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
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? (editingItem.images || []) : (newItem.images || [])).map((img, idx) => (
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
                        <ItemForm targetField="daily" onAdd={() => { const timeRange = sectionTimeStart && sectionTimeEnd ? `${sectionTimeStart}-${sectionTimeEnd}` : ''; const item = withItemDefaults({ id: Math.random().toString(36).substr(2, 9), ...newItem, images: newItem.images || [], active: newItem.active, time_range: timeRange }); setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, daily_specials: { ...a.daily_specials, [day]: item } } : a)); setNewItem(createBlankItem()); setSectionTimeStart(''); setSectionTimeEnd(''); }} onUpdate={() => { const timeRange = sectionTimeStart && sectionTimeEnd ? `${sectionTimeStart}-${sectionTimeEnd}` : ''; setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, daily_specials: { ...a.daily_specials, [day]: { ...withItemDefaults(editingItem), time_range: timeRange } } } : a)); setEditingItem(null); setSectionTimeStart(''); setSectionTimeEnd(''); }} />
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
                    <input type="date" value={(editingItem ? editingItem.date : newItem.date) || ''} onChange={(e) => editingItem ? setEditingItem({...editingItem, date: e.target.value}) : setNewItem({...newItem, date: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
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
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? (editingItem.images || []) : (newItem.images || [])).map((img, idx) => (
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
                    <input type="text" placeholder="Days (e.g. Mon-Fri)" value={(editingItem ? editingItem.date : newItem.date) || ''} onChange={(e) => editingItem ? setEditingItem({...editingItem, date: e.target.value}) : setNewItem({...newItem, date: e.target.value})} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, marginBottom: 10}} />
                    <label style={{display: 'flex', alignItems: 'center', gap: 8, color: '#f1f5f9', marginBottom: 12}}>
                      <input type="checkbox" checked={editingItem ? editingItem.active : newItem.active} onChange={(e) => editingItem ? setEditingItem({...editingItem, active: e.target.checked}) : setNewItem({...newItem, active: e.target.checked})} />
                      Active
                    </label>
                    <button onClick={() => fileInputRef.current?.click()} style={{width: '100%', padding: 10, background: '#0f172a', color: '#f1f5f9', border: '1px dashed rgba(255,255,255,.3)', borderRadius: 6, cursor: 'pointer', marginBottom: 10}}>📤 Add Image</button>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? (editingItem.images || []) : (newItem.images || [])).map((img, idx) => (
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
                      <button onClick={editingItem ? () => { const updated = happyHour.map(item => item.id === editingItem.id ? withItemDefaults(editingItem) : item); setHappyHour(updated); setEditingItem(null); setExpandedAddForm(null); } : () => { const item = withItemDefaults({ id: Math.random().toString(36).substr(2, 9), ...newItem, images: newItem.images || [], active: newItem.active }); setHappyHour([...happyHour, item]); setNewItem(createBlankItem()); setExpandedAddForm(null); }} style={{flex: 1, padding: 10, background: '#0b7a75', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600}}>
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
                    <input type="time" value={(selectedArea.hours[day] || {open:'11:00',close:'22:00'}).open} onChange={(e) => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, hours: { ...a.hours, [day]: { ...(a.hours[day] || {open:'11:00',close:'22:00'}), open: e.target.value } } } : a))} style={{padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}} />
                    <div>to</div>
                    <input type="time" value={(selectedArea.hours[day] || {open:'11:00',close:'22:00'}).close} onChange={(e) => setAreas(areas.map(a => a.id === selectedAreaId ? { ...a, hours: { ...a.hours, [day]: { ...(a.hours[day] || {open:'11:00',close:'22:00'}), close: e.target.value } } } : a))} style={{padding: 8, background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6}} />
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
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{display: 'none'}} />
                    <div style={{display: 'flex', gap: 8, marginBottom: 10}}>
                      {(editingItem ? (editingItem.images || []) : (newItem.images || [])).map((img, idx) => (
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
                <h2 style={{margin: '0 0 16px'}}>📷 Photo Gallery</h2>
                <p style={{color: '#94a3b8', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5}}>
                  Upload any photo. Set the <strong style={{color: '#f1f5f9'}}>Hero</strong> image (top of profile), 
                  <strong style={{color: '#f1f5f9'}}> Cover</strong> (card thumbnail in listings), and 
                  <strong style={{color: '#f1f5f9'}}> Food/Exterior/Interior</strong> photos for the gallery. 
                  Menu items can pick from here too.
                </p>

                {/* Upload button */}
                <label style={{display: 'block', width: '100%', padding: 14, background: uploadingImage ? '#334155' : '#0b7a75', color: 'white', border: 'none', borderRadius: 10, cursor: uploadingImage ? 'not-allowed' : 'pointer', fontWeight: 700, textAlign: 'center', boxSizing: 'border-box', fontSize: 15, marginBottom: 20}}>
                  {uploadProgress ? `Uploading ${uploadProgress.done} / ${uploadProgress.total}…` : '📤 Upload Photos (tap to select, multiple OK)'}
                  <input type="file" accept="image/*" multiple disabled={uploadingImage} onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    if (!files.length) return;
                    setUploadingImage(true);
                    setUploadProgress({ done: 0, total: files.length });
                    for (let i = 0; i < files.length; i++) {
                      try {
                        const fd = new FormData();
                        fd.append('image', files[i]);
                        fd.append('type', 'gallery');
                        const res = await fetch(`${API_URL}/api/menu-editor/${encodeURIComponent(slug)}/upload`, {
                          method: 'POST', headers: { 'x-menu-token': token }, body: fd,
                        });
                        const d = await res.json();
                        if (d.url) setGallery(prev => [...prev, { id: d.id || Math.random().toString(36).substr(2,9), url: d.url, type: 'gallery', photo_type: null, label: '', is_cover: false }]);
                      } catch {}
                      setUploadProgress({ done: i + 1, total: files.length });
                    }
                    setUploadingImage(false);
                    setUploadProgress(null);
                    e.target.value = '';
                  }} style={{display: 'none'}} />
                </label>

                {/* All photos grid */}
                {gallery.length === 0 && (
                  <div style={{textAlign: 'center', padding: '40px 20px', color: '#475569', border: '2px dashed #334155', borderRadius: 12}}>
                    <div style={{fontSize: 40, marginBottom: 8}}>📷</div>
                    <div>No photos yet — upload some above</div>
                  </div>
                )}

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12}}>
                  {gallery.map((img, idx) => (
                    <div key={img.id} style={{borderRadius: 10, overflow: 'hidden', background: '#1e293b', border: img.type === 'Hero' ? '2px solid #f59e0b' : img.is_cover ? '2px solid #22c55e' : '1px solid rgba(255,255,255,.1)', position: 'relative'}}>
                      <img src={img.url} alt="" style={{width: '100%', height: 110, objectFit: 'cover', display: 'block'}} />

                      {/* Badge */}
                      {img.type === 'Hero' && <div style={{position: 'absolute', top: 6, left: 6, background: '#f59e0b', color: '#000', fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: 999}}>HERO</div>}
                      {img.is_cover && img.type !== 'Hero' && <div style={{position: 'absolute', top: 6, left: 6, background: '#22c55e', color: '#000', fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: 999}}>COVER</div>}
                      {img.photo_type && <div style={{position: 'absolute', top: img.type === 'Hero' || img.is_cover ? 26 : 6, left: 6, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999}}>{img.photo_type}</div>}

                      {/* Delete */}
                      <button onClick={() => setGallery(gallery.filter(g => g.id !== img.id))} style={{position: 'absolute', top: 6, right: 6, background: 'rgba(220,38,38,.85)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✕</button>

                      {/* Controls */}
                      <div style={{padding: '8px 8px 10px', display: 'flex', flexDirection: 'column', gap: 5}}>
                        {/* Photo type */}
                        <select value={img.photo_type || ''} onChange={(e) => setGallery(gallery.map(g => g.id === img.id ? {...g, photo_type: e.target.value || null} : g))}
                          style={{width: '100%', padding: '5px 6px', background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, fontSize: 11}}>
                          <option value="">Type…</option>
                          <option value="food">🍽 Food</option>
                          <option value="exterior">🏠 Exterior</option>
                          <option value="interior">🪑 Interior</option>
                          <option value="outdoor">🌴 Outdoor</option>
                          <option value="event">🎉 Event</option>
                          <option value="drink">🍹 Drink</option>
                        </select>

                        {/* Action buttons */}
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4}}>
                          <button onClick={async () => {
                            setGallery(gallery.map(g => g.id === img.id ? {...g, type: 'Hero'} : {...g, type: g.type === 'Hero' ? 'gallery' : g.type}));
                            try { await fetch(`${API_URL}/api/menu-editor/${encodeURIComponent(slug)}/set-hero`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-menu-token': token }, body: JSON.stringify({ url: img.url }) }); } catch {}
                          }} style={{padding: '5px 2px', background: img.type === 'Hero' ? '#f59e0b' : 'rgba(245,158,11,.15)', color: img.type === 'Hero' ? '#000' : '#f59e0b', border: '1px solid rgba(245,158,11,.4)', borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: 'pointer'}}>
                            ⭐ Hero
                          </button>
                          <button onClick={() => setGallery(gallery.map(g => g.id === img.id ? {...g, is_cover: !g.is_cover} : g))}
                            style={{padding: '5px 2px', background: img.is_cover ? '#22c55e' : 'rgba(34,197,94,.1)', color: img.is_cover ? '#000' : '#22c55e', border: '1px solid rgba(34,197,94,.3)', borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: 'pointer'}}>
                            🃏 Cover
                          </button>
                        </div>

                        {/* Caption */}
                        <input value={img.label || ''} onChange={(e) => setGallery(gallery.map(g => g.id === img.id ? {...g, label: e.target.value} : g))}
                          placeholder="Caption…" style={{width: '100%', padding: '5px 6px', background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, fontSize: 11, boxSizing: 'border-box'}} />
                      </div>
                    </div>
                  ))}
                </div>

                {gallery.length > 0 && (
                  <div style={{marginTop: 16, padding: 12, background: 'rgba(11,122,117,.1)', border: '1px solid rgba(11,122,117,.25)', borderRadius: 10, fontSize: 13, color: '#94a3b8', lineHeight: 1.5}}>
                    <strong style={{color: '#f1f5f9'}}>💡 Tips:</strong> Set one photo as <strong style={{color: '#f59e0b'}}>Hero</strong> — it becomes the big image at the top of your profile page and updates immediately. 
                    Set one as <strong style={{color: '#22c55e'}}>Cover</strong> — it's the thumbnail in listings and Trip Swipe cards. 
                    Tag photos as <strong style={{color: '#f1f5f9'}}>Food / Exterior / Interior</strong> so they show in the right section of the gallery. Hit <strong style={{color: '#f1f5f9'}}>Save</strong> to apply all changes.
                  </div>
                )}
              </>
            )}

            {/* PREVIEW TAB */}

            {tab === 'preview' && (
              <>
                <h2>QR Menu Preview</h2>
                <p style={{fontSize: 13, color: '#94a3b8', marginTop: -6, marginBottom: 16}}>Simple customer view using the same data this editor saves.</p>
                <div style={{background: theme.bg || '#f7f7f7', color: theme.text || '#111', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)'}}>
                  <div style={{padding: 18, background: theme.primary || '#0b7a75', color: '#fff'}}>
                    <h1 style={{margin: '0 0 4px', fontSize: 26}}>{business.name || 'Restaurant Menu'}</h1>
                    <p style={{margin: 0, opacity: .88}}>{business.tagline || business.about || 'Fresh menu, updated daily.'}</p>
                  </div>
                  <div style={{padding: 16}}>
                    {getLaunchItems().filter(item => item.catch_of_the_day && item.available !== false && item.active !== false).map(item => (
                      <div key={`catch-preview-${item.field}-${item.id}`} style={{background: theme.surface || '#fff', border: `2px solid ${theme.accent || '#f0a500'}`, borderRadius: 10, padding: 14, marginBottom: 14}}>
                        <div style={{fontSize: 11, color: theme.accent || '#f0a500', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.08em'}}>Catch of the Day</div>
                        <h3 style={{margin: '4px 0'}}>{item.name}</h3>
                        {item.description && <p style={{margin: '0 0 8px', color: '#64748b'}}>{item.description}</p>}
                        <strong>{item.market_price ? 'Market Price' : item.price}</strong>
                      </div>
                    ))}

                    {[...(selectedArea.menu_sections || []), ...(selectedArea.drink_sections || [])].map(section => (
                      <div key={`pv-section-${section.id}`} style={{marginBottom: 18}}>
                        <h2 style={{fontSize: 22, margin: '0 0 4px', color: theme.primary || '#0b7a75'}}>{section.name}</h2>
                        {section.time_range && <div style={{fontSize: 12, color: '#64748b', marginBottom: 8}}>Available {section.time_range}</div>}
                        {(section.items || []).filter(item => withItemDefaults(item).available !== false && withItemDefaults(item).active !== false).map(item => {
                          const normalized = withItemDefaults(item);
                          return (
                            <div key={`pv-item-${section.id}-${item.id}`} style={{background: theme.surface || '#fff', borderRadius: 8, padding: 12, marginBottom: 8, display: 'grid', gridTemplateColumns: item.images?.[0]?.url ? '70px 1fr auto' : '1fr auto', gap: 10, alignItems: 'center'}}>
                              {item.images?.[0]?.url && <img src={item.images[0].url} alt="" style={{width: 70, height: 58, objectFit: 'cover', borderRadius: 7}} />}
                              <div>
                                <strong>{item.name}</strong>
                                {normalized.featured && <span style={{marginLeft: 6, fontSize: 11, color: theme.accent || '#f0a500', fontWeight: 800}}>Featured</span>}
                                {normalized.on_tap && <span style={{marginLeft: 6, fontSize: 11, color: '#10b981', fontWeight: 900}}>On Tap</span>}
                                {item.description && <p style={{margin: '3px 0 0', fontSize: 13, color: '#64748b'}}>{item.description}</p>}
                              </div>
                              <strong style={{whiteSpace: 'nowrap'}}>{normalized.market_price ? 'Market Price' : item.price}</strong>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {(selectedArea.specials || []).filter(s => s.active !== false).length > 0 && (
                      <div style={{marginBottom: 18}}>
                        <h2 style={{fontSize: 22, margin: '0 0 8px', color: theme.primary || '#0b7a75'}}>Specials</h2>
                        {(selectedArea.specials || []).filter(s => s.active !== false).map(s => (
                          <div key={`pv-special-${s.id}`} style={{background: theme.surface || '#fff', borderRadius: 8, padding: 12, marginBottom: 8}}>
                            <strong>{s.name}</strong>
                            {s.price && <strong style={{float: 'right'}}>{s.price}</strong>}
                            {s.description && <p style={{margin: '3px 0 0', fontSize: 13, color: '#64748b'}}>{s.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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

                <div style={{background: '#1e293b', padding: 16, borderRadius: 8, marginTop: 16}}>
                  <h3 style={{margin: '0 0 4px 0', color: '#f1f5f9'}}>🎨 Public Menu Theme</h3>
                  <p style={{margin: '0 0 16px 0', fontSize: 12, color: '#64748b'}}>Customize the colors of your public-facing menu page.</p>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                    {[
                      { key: 'primary', label: 'Primary Color' },
                      { key: 'accent', label: 'Accent / Highlight' },
                      { key: 'bg', label: 'Page Background' },
                      { key: 'surface', label: 'Card Color' },
                      { key: 'text', label: 'Text Color' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label style={{fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4}}>{label}</label>
                        <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
                          <input type="color" value={theme[key] || '#000000'} onChange={(e) => setTheme(t => ({...t, [key]: e.target.value}))} style={{width: 38, height: 38, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 2, background: '#0f172a'}} />
                          <input type="text" value={theme[key] || ''} onChange={(e) => setTheme(t => ({...t, [key]: e.target.value}))} style={{flex: 1, padding: '6px 10px', background: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, fontSize: 12}} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setTheme({ primary: '#0b7a75', accent: '#f0a500', bg: '#f7f7f7', surface: '#ffffff', text: '#111111' })} style={{width: '100%', marginTop: 12, padding: 8, background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12}}>↺ Reset to Default Colors</button>
                </div>
              </>
            )}
          </div>

          <footer style={{padding: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', gap: 12, justifyContent: 'center'}}>
            <button onClick={handleSave} disabled={saving || loading} style={{padding: '12px 24px', background: saving ? '#64748b' : '#0b7a75', color: 'white', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600}}>
              {saving ? '⏳ SAVING...' : '💾 SAVE ALL CHANGES'}
            </button>
            <button onClick={handleExport} style={{padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>
              📥 EXPORT TO JSON
            </button>
          </footer>
        </>
      )}
      </>
      )}
    </div>
  );
}
