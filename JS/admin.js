  // =============================================
  // HERO SECTION - CORREGIDO
  // =============================================
  const heroImageInput = document.getElementById('hero-image-url');
  const heroPreviewImg = document.getElementById('preview-img');
  const heroSubtitleInput = document.getElementById('hero-subtitle');
  
  // Limpiar valores por defecto al cargar
  if (heroImageInput) heroImageInput.value = '';
  if (heroSubtitleInput) heroSubtitleInput.value = '';

  // Vista previa de imagen
  if (heroImageInput && heroPreviewImg) {
    heroImageInput.addEventListener('input', function() {
      const url = this.value.trim();
      if (url) {
        heroPreviewImg.src = url;
        heroPreviewImg.onerror = () => heroPreviewImg.src = 'IMG/Perro home.png';
      } else {
        heroPreviewImg.src = 'IMG/Perro home.png';
      }
    });
  }

  const heroForm = document.getElementById('hero-form');
  if (heroForm) {
    // Cargar valores actuales al abrir el panel
    (async function() {
      const data = await getCurrentSiteData();
      if (heroImageInput && data.hero?.imagen) {
        heroImageInput.value = data.hero.imagen;
        heroPreviewImg.src = data.hero.imagen;
      }
      if (heroSubtitleInput && data.hero?.subtitulo) {
        heroSubtitleInput.value = data.hero.subtitulo;
      }
    })();

    heroForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const imageUrl = heroImageInput?.value.trim();
      const subtitle = heroSubtitleInput?.value.trim();
      
      if (!imageUrl || !subtitle) {
        alert('Please fill in both fields');
        return;
      }
      
      const currentData = await getCurrentSiteData();
      currentData.hero = {
        imagen: imageUrl,
        subtitulo: subtitle
      };
      await saveSiteData(currentData, 'Hero updated');
    });
  }
