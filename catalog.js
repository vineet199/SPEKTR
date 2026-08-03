/* ============================================================
   SPEKTR RACING — PRODUCT CATALOG
   Single source of truth for every product across the site.
   Shared by: shop.html, product.html, index.html (The Range).
   ============================================================ */
(function () {
  const C = '#0d0d0d', RED = '#D72B2B', ASH = '#4a4a4a', SLATE = '#3a4252',
        STONE = '#6b6b6b', INDIGO = '#28323f', OLIVE = '#3f4231', GREY = '#8a8a8a';

  const APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const WAIST   = ['28', '30', '32', '34', '36', '38', '40'];

  const CATALOG = [
    {
      slug: 'basic-hoodie', name: 'BASIC HOODIE', group: 'hoodies', badge: 'Hoodie',
      cat: 'Riding Hoodie · Core Series', price: 130, tax: 'Incl. duties · ships in 1 wk',
      rating: 4.8, reviews: 184,
      lede: 'The hoodie you live in, built to ride. Single-layer aramid lining, armour-ready pockets, and a cut clean enough for the café after.',
      colors: [{ name: 'Ignition Red', hex: RED }, { name: 'Stealth Volt', hex: '#141414' }, { name: 'Apex White', hex: '#ededed' }],
      media: {
        'Ignition Red': ['assets/products/basic-hoodie/red-front.png', 'assets/products/basic-hoodie/red-angle.png', 'assets/products/basic-hoodie/red-side.png', 'assets/products/basic-hoodie/red-back.png'],
        'Stealth Volt': ['assets/products/basic-hoodie/black-front.png', 'assets/products/basic-hoodie/black-angle.png', 'assets/products/basic-hoodie/black-side.png', 'assets/products/basic-hoodie/black-back.png'],
        'Apex White': ['assets/products/basic-hoodie/white-front.png', 'assets/products/basic-hoodie/white-angle.png', 'assets/products/basic-hoodie/white-side.png', 'assets/products/basic-hoodie/white-back.png']
      },
      sizeLabel: 'Size', sizes: APPAREL, sizeDefault: 'M', sizeOut: ['XXL'],
      assure: ['CE-ready armour pockets', 'Free returns', '2-yr warranty'],
      thumbs: ['Front', 'Angle', 'Side', 'Back'],
      specs: [
        ['Outer Shell', '380gsm brushed cotton-blend'],
        ['Lining', 'DuPont™ Kevlar® aramid (impact zones)'],
        ['Armour', 'CE pockets — shoulder, elbow, back'],
        ['Abrasion', '4.1s slide-tested'],
        ['Closure', 'YKK® centre zip'],
        ['Weight', '740 g (size M)'],
        ['Fit', 'Regular, dropped shoulder'],
        ['Care', 'Machine cold, inside out']
      ],
      acc: [
        { q: 'Materials &amp; Construction', open: true, html: '<ul><li>380gsm brushed cotton-blend outer</li><li>Kevlar® aramid lining across impact zones</li><li>CE armour pockets at shoulder, elbow &amp; back</li><li>Triple-stitched stress seams</li></ul>' },
        { q: 'Safety &amp; Certification', html: 'Armour-ready to CE Level 1/2 (armour sold separately). Aramid lining independently abrasion-tested to 4.1 seconds at the panel.' },
        { q: 'Size &amp; Fit', html: 'Regular street fit with a slightly dropped shoulder for layering. True to size — size up if you plan to run thick base layers underneath.' },
        { q: 'Care', html: 'Machine wash cold, inside out. Remove armour first. Air-dry away from direct heat. Do not iron the aramid lining.' }
      ]
    },
    {
      slug: 'riding-zipper-hoodie', name: 'RIDING ZIPPER HOODIE', group: 'hoodies', badge: 'Zipper Hoodie',
      cat: 'Riding Hoodie · Zipper Series', price: 190, tax: 'Incl. duties · ships in 1 wk',
      rating: 4.9, reviews: 226,
      lede: 'Full-zip protection that reads like streetwear. Complete aramid lining and CE Level 1 armour at shoulder, elbow and back — in from the first ride.',
      colors: [{ name: 'Ignition Red', hex: RED }, { name: 'Marine Blue', hex: '#1e2a4a' }, { name: 'Graphite', hex: '#454b52' }],
      media: {
        'Ignition Red': ['assets/products/riding-zipper-hoodie/red-front.png', 'assets/products/riding-zipper-hoodie/red-side.png', 'assets/products/riding-zipper-hoodie/red-back.png', 'assets/products/riding-zipper-hoodie/red-rear.png', 'assets/products/riding-zipper-hoodie/red-lining.png'],
        'Marine Blue': ['assets/products/riding-zipper-hoodie/marine-front.png', 'assets/products/riding-zipper-hoodie/marine-side.png', 'assets/products/riding-zipper-hoodie/marine-back.png', 'assets/products/riding-zipper-hoodie/marine-rear.png', 'assets/products/riding-zipper-hoodie/marine-lining.png'],
        'Graphite': ['assets/products/riding-zipper-hoodie/graphite-front.png', 'assets/products/riding-zipper-hoodie/graphite-side.png', 'assets/products/riding-zipper-hoodie/graphite-back.png', 'assets/products/riding-zipper-hoodie/graphite-rear.png', 'assets/products/riding-zipper-hoodie/graphite-lining.png']
      },
      sizeLabel: 'Size', sizes: APPAREL, sizeDefault: 'M', sizeOut: ['XS'],
      assure: ['CE-1 armour included', 'Free returns', '2-yr warranty'],
      thumbs: ['Front', 'Side', 'Back', 'Rear ¾', 'Lining'],
      specs: [
        ['Outer Shell', '420gsm heavyweight fleece'],
        ['Lining', 'Full Kevlar® aramid'],
        ['Armour', 'CE Level 1 — included (S/E/B)'],
        ['Abrasion', '5.3s slide-tested'],
        ['Closure', 'YKK® two-way front zip'],
        ['Reflective', 'Subtle pulls + cuff trim'],
        ['Weight', '1,020 g (size M)'],
        ['Care', 'Machine cold, inside out']
      ],
      acc: [
        { q: 'Materials &amp; Construction', open: true, html: '<ul><li>420gsm heavyweight fleece outer</li><li>Full Kevlar® aramid lining, sleeve to hem</li><li>YKK® two-way front zip with storm flap</li><li>Reflective zip pulls &amp; cuff trim</li></ul>' },
        { q: 'Safety &amp; Certification', html: 'CE Level 1 armour included at shoulder, elbow and back. Full aramid lining abrasion-tested to 5.3 seconds at the panel.' },
        { q: 'Size &amp; Fit', html: 'Athletic riding fit, pre-curved sleeves. True to size. The armour sits correctly in a slightly forward posture.' },
        { q: 'Care', html: 'Remove armour, then machine wash cold inside out. Air-dry. Re-seat armour before riding.' }
      ]
    },
    {
      slug: 'riding-pullover', name: 'RIDING PULLOVER', group: 'hoodies', badge: 'Pullover',
      cat: 'Riding Hoodie · Pullover Series', price: 170, tax: 'Incl. duties · ships in 1 wk',
      rating: 4.7, reviews: 141,
      lede: 'No zip, no fuss. A pull-on riding hoodie with full aramid lining and a kangaroo pocket built to take a beating.',
      colors: [{ name: 'Ignition Red', hex: RED }, { name: 'Cobalt Blue', hex: '#1e2a55' }, { name: 'Ash Grey', hex: ASH }],
      media: {
        'Ignition Red': ['assets/products/riding-pullover/red-front.png', 'assets/products/riding-pullover/red-angle.png', 'assets/products/riding-pullover/red-side.png', 'assets/products/riding-pullover/red-back.png'],
        'Cobalt Blue': ['assets/products/riding-pullover/blue-front.png', 'assets/products/riding-pullover/blue-angle.png', 'assets/products/riding-pullover/blue-side.png', 'assets/products/riding-pullover/blue-back.png'],
        'Ash Grey': ['assets/products/riding-pullover/grey-front.png', 'assets/products/riding-pullover/grey-angle.png', 'assets/products/riding-pullover/grey-side.png', 'assets/products/riding-pullover/grey-back.png']
      },
      sizeLabel: 'Size', sizes: APPAREL, sizeDefault: 'M', sizeOut: [],
      assure: ['CE-ready armour pockets', 'Free returns', '2-yr warranty'],
      thumbs: ['Front', 'Angle', 'Side', 'Back'],
      specs: [
        ['Outer Shell', '400gsm loopback cotton-blend'],
        ['Lining', 'Full Kevlar® aramid'],
        ['Armour', 'CE pockets — shoulder, elbow, back'],
        ['Abrasion', '4.9s slide-tested'],
        ['Pocket', 'Reinforced kangaroo pouch'],
        ['Weight', '880 g (size M)'],
        ['Fit', 'Relaxed riding cut'],
        ['Care', 'Machine cold, inside out']
      ],
      acc: [
        { q: 'Materials &amp; Construction', open: true, html: '<ul><li>400gsm loopback cotton-blend outer</li><li>Full Kevlar® aramid lining</li><li>Reinforced kangaroo front pouch</li><li>CE armour pockets at shoulder, elbow &amp; back</li></ul>' },
        { q: 'Safety &amp; Certification', html: 'Armour-ready to CE Level 1/2 (armour sold separately). Aramid lining abrasion-tested to 4.9 seconds.' },
        { q: 'Size &amp; Fit', html: 'Relaxed riding cut with room to layer. True to size.' },
        { q: 'Care', html: 'Machine wash cold inside out. Air-dry away from heat.' }
      ]
    },
    {
      slug: 'riding-jeans', name: 'RIDING JEANS', group: 'pants', badge: 'Jeans',
      cat: 'Riding Denim · Apex Series', price: 210, tax: 'Incl. duties · ships in 2 wks',
      rating: 4.9, reviews: 198,
      lede: '14oz denim over Cordura® and aramid. Knee and hip armour in, abrasion out. The jeans that forget they\u2019re armour — until you need them.',
      colors: [{ name: 'Carbon Black', hex: C }],
      media: {
        'Carbon Black': ['assets/products/riding-jeans/black-front.png', 'assets/products/riding-jeans/black-angle.png', 'assets/products/riding-jeans/black-side.png', 'assets/products/riding-jeans/black-back.png', 'assets/products/riding-jeans/black-rear.png', 'assets/products/riding-jeans/black-detail.png']
      },
      sizeLabel: 'Size · Waist', sizes: WAIST, sizeDefault: '32', sizeOut: ['40'],
      assure: ['CE-2 knee armour included', 'Free returns', '2-yr warranty'],
      thumbs: ['Front', 'Angle', 'Side', 'Back', 'Rear ¾', 'Detail'],
      specs: [
        ['Outer Shell', '14oz denim + Cordura® panels'],
        ['Lining', 'Kevlar® aramid at seat &amp; knee'],
        ['Armour', 'CE-2 knee + CE-1 hip — included'],
        ['Abrasion', '6.8s slide-tested'],
        ['Closure', 'YKK® fly + shank button'],
        ['Adjust', 'Height-adjustable knee armour'],
        ['Weight', '1,180 g (W32)'],
        ['Care', 'Machine cold, inside out']
      ],
      acc: [
        { q: 'Materials &amp; Construction', open: true, html: '<ul><li>14oz denim with Cordura® abrasion panels</li><li>Kevlar® aramid lining at seat and knee</li><li>CE-2 knee + CE-1 hip armour included</li><li>Height-adjustable knee armour pockets</li></ul>' },
        { q: 'Safety &amp; Certification', html: 'CE-2 knee and CE-1 hip armour included. Denim + Cordura + aramid stack abrasion-tested to 6.8 seconds.' },
        { q: 'Size &amp; Fit', html: 'Slim-straight riding cut, pre-bent knee. Runs true to waist size; size up one if between sizes for a roomier seat.' },
        { q: 'Care', html: 'Remove armour. Machine wash cold inside out, gentle cycle. Air-dry. Do not tumble.' }
      ]
    },
    {
      slug: 'riding-cargo', name: 'RIDING CARGO', group: 'pants', badge: 'Cargo',
      cat: 'Riding Pant · Cargo Series', price: 200, tax: 'Incl. duties · ships in 2 wks',
      rating: 4.7, reviews: 132,
      lede: 'Utility cut, race-grade guts. Stretch ripstop with aramid panels, adjustable knee armour and pockets that actually hold.',
      colors: [{ name: 'Carbon Black', hex: C }],
      media: {
        'Carbon Black': ['assets/products/riding-cargo/black-front.png', 'assets/products/riding-cargo/black-angle.png', 'assets/products/riding-cargo/black-side.png', 'assets/products/riding-cargo/black-back.png', 'assets/products/riding-cargo/black-rear.png', 'assets/products/riding-cargo/black-detail.png']
      },
      sizeLabel: 'Size · Waist', sizes: WAIST, sizeDefault: '32', sizeOut: ['28'],
      assure: ['CE-2 knee armour included', 'Free returns', '2-yr warranty'],
      thumbs: ['Front', 'Angle', 'Side', 'Back', 'Rear ¾', 'Detail'],
      specs: [
        ['Outer Shell', '4-way stretch ripstop'],
        ['Lining', 'Kevlar® aramid at seat &amp; knee'],
        ['Armour', 'CE-2 knee + CE-1 hip — included'],
        ['Abrasion', '6.1s slide-tested'],
        ['Pockets', 'Bellowed cargo, secured'],
        ['Adjust', 'Waist tabs + knee height'],
        ['Weight', '1,090 g (W32)'],
        ['Care', 'Machine cold, inside out']
      ],
      acc: [
        { q: 'Materials &amp; Construction', open: true, html: '<ul><li>4-way stretch ripstop shell</li><li>Kevlar® aramid lining at seat &amp; knee</li><li>CE-2 knee + CE-1 hip armour included</li><li>Bellowed, secured cargo pockets</li></ul>' },
        { q: 'Safety &amp; Certification', html: 'CE-2 knee and CE-1 hip armour included. Ripstop + aramid stack abrasion-tested to 6.1 seconds.' },
        { q: 'Size &amp; Fit', html: 'Relaxed utility cut with waist adjusters and an articulated knee. True to waist size.' },
        { q: 'Care', html: 'Remove armour. Machine wash cold inside out. Air-dry away from heat.' }
      ]
    },
    {
      slug: 'base-liner', name: 'BASE LINER', group: 'base', badge: 'Base Liner',
      cat: 'Base Layer · Core Series', price: 90, tax: 'Incl. duties · ships in 1 wk',
      rating: 4.8, reviews: 167,
      lede: 'The system underneath. Seamless thermo-regulating knit, UPF50 and AG+ anti-odour. Disappears under everything.',
      colors: [{ name: 'Ignition Red', hex: RED }, { name: 'Reflective Grey', hex: '#b9bdc2' }, { name: 'Hi-Viz Volt', hex: '#c8ec00' }],
      media: {
        'Ignition Red': ['assets/products/base-liner/red-front.png', 'assets/products/base-liner/red-angle.png', 'assets/products/base-liner/red-side.png', 'assets/products/base-liner/red-back.png'],
        'Reflective Grey': ['assets/products/base-liner/grey-front.png', 'assets/products/base-liner/grey-angle.png', 'assets/products/base-liner/grey-side.png', 'assets/products/base-liner/grey-back.png'],
        'Hi-Viz Volt': ['assets/products/base-liner/green-front.png', 'assets/products/base-liner/green-angle.png', 'assets/products/base-liner/green-side.png', 'assets/products/base-liner/green-back.png']
      },
      sizeLabel: 'Size', sizes: ['S', 'M', 'L', 'XL'], sizeDefault: 'M', sizeOut: [],
      assure: ['UPF50 · AG+ anti-odour', 'Free returns', '2-yr warranty'],
      thumbs: ['Front', 'Angle', 'Side', 'Back'],
      specs: [
        ['Construction', 'Seamless circular-knit'],
        ['Yarn', 'Recycled poly / elastane'],
        ['Protection', 'UPF50 rated'],
        ['Anti-Odour', 'AG+ silver-ion treatment'],
        ['Moisture', 'Wicking, fast-dry'],
        ['Weight', '180 g (size M)'],
        ['Fit', 'Compression base'],
        ['Care', 'Machine cold, no softener']
      ],
      acc: [
        { q: 'Materials &amp; Construction', open: true, html: '<ul><li>Seamless circular-knit body — zero chafe</li><li>Recycled poly / elastane blend</li><li>AG+ silver-ion anti-odour treatment</li><li>UPF50 sun protection</li></ul>' },
        { q: 'Performance', html: 'Thermo-regulating across a wide temperature band. Moisture-wicking and fast-drying so it stays light through long days in the saddle.' },
        { q: 'Size &amp; Fit', html: 'Compression base-layer fit. Size down for a tighter second-skin feel. True to size for everyday wear.' },
        { q: 'Care', html: 'Machine wash cold, no fabric softener (it coats the AG+ treatment). Air-dry. Do not iron.' }
      ]
    },
    {
      slug: 'balaclava', name: 'BALACLAVA', group: 'balaclava', badge: 'Balaclava',
      cat: 'Base Layer · Core Series', price: 45, tax: 'Incl. duties · ships in 1 wk',
      rating: 4.9, reviews: 312,
      lede: 'The layer between you and the helmet. Flame-resistant knit, weightless, relentless at temperature.',
      colors: [{ name: 'Ignition Red', hex: RED }, { name: 'Reflective Grey', hex: '#b9bdc2' }, { name: 'Hi-Viz Volt', hex: '#c8ec00' }],
      media: {
        'Ignition Red': ['assets/products/balaclava/red-front.png', 'assets/products/balaclava/red-angle.png', 'assets/products/balaclava/red-side.png', 'assets/products/balaclava/red-back.png'],
        'Reflective Grey': ['assets/products/balaclava/grey-front.png', 'assets/products/balaclava/grey-angle.png', 'assets/products/balaclava/grey-side.png', 'assets/products/balaclava/grey-back.png'],
        'Hi-Viz Volt': ['assets/products/balaclava/green-front.png', 'assets/products/balaclava/green-angle.png', 'assets/products/balaclava/green-side.png', 'assets/products/balaclava/green-back.png']
      },
      sizeLabel: 'Size', sizes: ['S / M', 'L / XL'], sizeDefault: 'S / M', sizeOut: [],
      assure: ['Flame-resistant knit', 'Free returns', '2-yr warranty'],
      thumbs: ['Front', 'Angle', 'Side', 'Back'],
      specs: [
        ['Construction', 'Seamless FR knit'],
        ['Yarn', 'Modacrylic / poly blend'],
        ['Protection', 'Flame-resistant'],
        ['Moisture', 'Wicking, fast-dry'],
        ['Seams', 'Flat-locked, helmet-safe'],
        ['Weight', '38 g'],
        ['Fit', 'Two-size stretch'],
        ['Care', 'Machine cold, air-dry']
      ],
      acc: [
        { q: 'Materials &amp; Construction', open: true, html: '<ul><li>Seamless flame-resistant knit</li><li>Modacrylic / poly blend</li><li>Flat-locked seams — invisible under a helmet</li><li>Moisture-wicking, fast-dry</li></ul>' },
        { q: 'Performance', html: 'Flame-resistant and weightless at 38g. Wicks sweat away from the brow so your visor stays clear at temperature.' },
        { q: 'Size &amp; Fit', html: 'Two-size stretch fit. S/M suits most; L/XL for larger heads or fuller beards.' },
        { q: 'Care', html: 'Machine wash cold, air-dry. Do not iron or tumble — heat degrades the FR knit.' }
      ]
    }
  ];

  const GROUPS = [
    { id: 'all', label: 'All' },
    { id: 'hoodies', label: 'Hoodies' },
    { id: 'pants', label: 'Pants' },
    { id: 'base', label: 'Base Layers' },
    { id: 'balaclava', label: 'Balaclava' }
  ];

  const bySlug = {};
  CATALOG.forEach(p => { bySlug[p.slug] = p; });

  window.SPEKTR_CATALOG = CATALOG;
  window.SPEKTR_GROUPS = GROUPS;
  window.SPEKTR_PRODUCT = function (slug) { return bySlug[slug] || CATALOG[0]; };
  window.SPEKTR_MONEY = function (n) { return '$' + n.toLocaleString('en-US'); };
  /* front image of the default colourway, for listing cards — null if no real media */
  window.SPEKTR_CARD_IMG = function (p) {
    if (!p.media) return null;
    const first = p.colors.find(c => p.media[c.name]);
    return first ? p.media[first.name][0] : null;
  };
})();
