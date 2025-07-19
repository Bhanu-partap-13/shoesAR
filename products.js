const products = [
  {
    id: '1',
    title: 'Nike Air Max Alpha',
    description: 'Lightweight running shoe with maximum comfort.',
    price: 120,
    reviews: [],
    image: 'img/1.png',
    category: 'Sport',
    size: 7,
    modelType: 'box',
    color: 0xff5555
  },
  {
    id: '2',
    title: 'Nike Revolution Flex',
    description: 'Flexible and durable for everyday wear.',
    price: 110,
    reviews: [],
    image: 'img/2.png',
    category: 'Casual',
    size: 8,
    modelType: 'sphere',
    color: 0x55ff55
  },
  {
    id: '3',
    title: 'Nike ZoomX Elite',
    description: 'Elite performance for serious runners.',
    price: 150,
    reviews: [],
    image: 'img/3.png',
    category: 'Running',
    size: 9,
    modelType: 'torus',
    color: 0x5555ff
  },
  {
    id: '4',
    title: 'Nike Classic Street',
    description: 'Classic style for urban adventures.',
    price: 130,
    reviews: [],
    image: 'img/4.jpg',
    category: 'Casual',
    size: 10,
    modelType: 'cone',
    color: 0xffaa00
  },
  {
    id: '5',
    title: 'Nike Power Run',
    description: 'Powerful grip and support for training.',
    price: 140,
    reviews: [],
    image: 'img/5.png',
    category: 'Training',
    size: 11,
    modelType: 'cylinder',
    color: 0x00aaff
  },
  {
    id: '6',
    title: 'Nike Comfort Glide',
    description: 'Glide through your day with comfort.',
    price: 125,
    reviews: [],
    image: 'img/6.jpg',
    category: 'Sport',
    size: 8,
    modelType: 'dodecahedron',
    color: 0xaa00ff
  },
  {
    id: '7',
    title: 'Nike Urban Trainer',
    description: 'Perfect for city workouts and style.',
    price: 135,
    reviews: [],
    image: 'img/7.jpg',
    category: 'Training',
    size: 9,
    modelType: 'octahedron',
    color: 0xaaaa00
  },
  {
    id: '8',
    title: 'Nike Sport Pro',
    description: 'Professional sport shoe for all activities.',
    price: 145,
    reviews: [],
    image: 'img/8 (1).jpg',
    category: 'Sport',
    size: 10,
    modelType: 'torusknot',
    color: 0x00ffaa
  },
  {
    id: '9',
    title: 'Nike Runner X',
    description: 'Engineered for speed and comfort.',
    price: 155,
    reviews: [],
    image: 'img/8 (2).jpg',
    category: 'Running',
    size: 7,
    modelType: 'box',
    color: 0xff00aa
  },
  {
    id: '10',
    title: 'Nike Flexi Move',
    description: 'Move freely with flexible support.',
    price: 115,
    reviews: [],
    image: 'img/8 (3).jpg',
    category: 'Casual',
    size: 8,
    modelType: 'sphere',
    color: 0x00ffcc
  },
  {
    id: '11',
    title: 'Nike All Terrain',
    description: 'All-terrain shoe for every adventure.',
    price: 160,
    reviews: [],
    image: 'img/8 (4).jpg',
    category: 'Sport',
    size: 9,
    modelType: 'torus',
    color: 0xccff00
  },
  {
    id: '12',
    title: 'Nike Endurance',
    description: 'Built for endurance and long runs.',
    price: 170,
    reviews: [],
    image: 'img/8 (5).jpg',
    category: 'Running',
    size: 10,
    modelType: 'cone',
    color: 0x00ccff
  }
];

// For browser usage
if (typeof window !== 'undefined') {
  window.products = products;
} 