import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';

interface GalleryImage {
  src: string;
  title: string;
  category: string;
}

const galleryImages: GalleryImage[] = [
  // Men's Events
  { src: '/gallery/cricket.png', title: 'Cricket', category: 'Men' },
  { src: '/gallery/volleyball.png', title: 'Volleyball', category: 'Men' },
  { src: '/gallery/tugofwar.png', title: 'Tug of War', category: 'Men' },
  { src: '/gallery/lagori.png', title: 'Lagori', category: 'Men' },

  // Women's Events
  { src: '/gallery/throwball.png', title: 'Throwball', category: 'Women' },
  { src: '/gallery/dodgeball.png', title: 'Dodgeball', category: 'Women' },
  { src: '/gallery/rangoli.png', title: 'Rangoli', category: 'Women' },
  { src: '/gallery/lemonspoon.png', title: 'Lemon & Spoon', category: 'Women' },
  { src: '/gallery/lagori.png', title: 'Lagori', category: 'Women' },

  // Kids' Events
  { src: '/gallery/race.png', title: '100m Sprint', category: 'Kids' },
  { src: '/gallery/drawing.png', title: 'Drawing Competition', category: 'Kids' },
  { src: '/gallery/coloring.png', title: 'Colouring', category: 'Kids' },
  { src: '/gallery/lemonspoon.png', title: 'Lemon & Spoon', category: 'Kids' },

  // Senior Citizens
  { src: '/gallery/fastwalking.png', title: 'Fast Walking', category: 'Senior Citizens' },

  // General Events
  { src: '/gallery/cooking.png', title: 'Cooking Without Fire', category: 'General' },
  { src: '/gallery/treasurehunt.png', title: 'Treasure Hunt', category: 'General' },
  { src: '/gallery/housie.png', title: 'Housie (Tambola)', category: 'General' },

  // Highlights
  { src: '/gallery/ceremony.png', title: 'Opening Ceremony', category: 'Highlights' },
  { src: '/gallery/tugofwar.png', title: 'Team Spirit', category: 'Highlights' },
  { src: '/gallery/cricket.png', title: 'Championship Match', category: 'Highlights' },
  { src: '/gallery/rangoli.png', title: 'Cultural Showcase', category: 'Highlights' },
];

const categories = ['All', 'Men', 'Women', 'Kids', 'Senior Citizens', 'General', 'Highlights'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const filteredImages = activeCategory === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <div className="page-container">
      <AnimatedSection className="gallery-page" direction="up">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <Camera size={32} className="icon-primary" />
            Event Gallery
          </h1>
          <div className="divider" style={{ margin: '1rem auto' }}></div>
          <p style={{ color: 'var(--muted)', maxWidth: 600, margin: '0 auto' }}>
            Relive the excitement of Avatarana through our collection of event highlights.
          </p>
        </div>

        {/* Category Filters */}
        <div className="gallery-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`gallery-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="gallery-grid">
          {filteredImages.map((img, idx) => (
            <div
              key={idx}
              className="gallery-item"
              onClick={() => setSelectedImage(img)}
            >
              <img src={img.src} alt={img.title} loading="lazy" />
              <div className="gallery-item-overlay">
                <span className="gallery-item-title">{img.title}</span>
                <span className="gallery-item-cat">{img.category}</span>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Lightbox */}
      {selectedImage && (
        <div className="gallery-lightbox" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
            <X size={28} />
          </button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.src} alt={selectedImage.title} />
            <div className="lightbox-caption">
              <h3>{selectedImage.title}</h3>
              <span>{selectedImage.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
