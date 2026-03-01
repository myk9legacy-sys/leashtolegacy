// admin.js - Control total del panel de administración

document.addEventListener('DOMContentLoaded', () => {
  console.log("Panel loaded successfully");

  // 1. Toggle submenú "Services" (abre/cierra al clic)
  const serviceItem = document.querySelector('.menu-item.has-submenu');
  if (serviceItem) {
    serviceItem.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      console.log("Submenú toggled");
    });
  }

  // 2. Cambio de sección al clic en cualquier item del menú o submenú
  const menuItems = document.querySelectorAll('.menu-item, .submenu li');
  const sections = document.querySelectorAll('.section');

  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (this.classList.contains('has-submenu')) return;

      console.log("Clic en:", this.textContent.trim(), "→ data-section:", this.getAttribute('data-section'));

      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      sections.forEach(sec => sec.classList.add('hidden'));

      const sectionKey = this.getAttribute('data-section');
      if (sectionKey) {
        const targetId = 'section-' + sectionKey;
        const target = document.getElementById(targetId);
        if (target) {
          target.classList.remove('hidden');
          console.log("Mostrando sección:", targetId);
        } else {
          console.error("No se encontró:", targetId);
        }
      }
    });
  });

  // ────────────────────────────────────────────────
  // Funcionalidades del panel (hero, about, redes, boarding, puppy)
  // ────────────────────────────────────────────────

  // Hero - vista previa
  const heroImageInput = document.getElementById('hero-image-url');
  const heroPreviewImg = document.getElementById('preview-img');
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

  // Cargar datos actuales del sitio (servidor + backup en localStorage; el backup tiene prioridad)
  async function getCurrentSiteData() {
    let data = {};
    try {
      const res = await fetch('/site-data.json');
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {
      console.warn('No se pudo cargar desde servidor');
    }
    const backup = localStorage.getItem('site_data_backup');
    if (backup) {
      try {
        const b = JSON.parse(backup);
        data = { ...data, ...b };
      } catch (e) {
        console.warn('Error parsing backup');
      }
    }
    // Asegurar estructura completa
    if (!data.hero) data.hero = {};
    if (!data.about_us) data.about_us = {};
    if (!data.boarding) data.boarding = {};
    if (!data.puppy) data.puppy = {};
    if (!data.redes_sociales) data.redes_sociales = {};
    if (!Array.isArray(data.training_videos)) data.training_videos = [];
    if (!data.blog) data.blog = {};
    return data;
  }

  // Función auxiliar para guardar datos
  async function saveSiteData(updatedData, successMessage) {
    try {
      // Intentar guardar usando la función de Netlify
      let saved = false;
      let errorMessage = '';
      
      try {
        console.log('Intentando guardar en GitHub vía Netlify...');
        const response = await fetch('/.netlify/functions/update-site-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData)
        });

        console.log('Respuesta de Netlify:', response.status, response.statusText);

        if (response.ok) {
          const result = await response.json();
          console.log('Guardado exitoso en GitHub:', result);
          saved = true;
        } else {
          // Intentar obtener el mensaje de error
          let errorData;
          try {
            const text = await response.text();
            console.log('Respuesta de error (texto):', text);
            try {
              errorData = JSON.parse(text);
            } catch (e) {
              errorData = { error: text || `Error ${response.status}: ${response.statusText}` };
            }
          } catch (e) {
            errorData = { error: `Error ${response.status}: ${response.statusText}` };
          }
          
          errorMessage = errorData.error || errorData.message || errorData.details || `Error ${response.status}`;
          
          // Si hay detalles adicionales, mostrarlos
          if (errorData.details) {
            console.error('Detalles del error:', errorData.details);
          }
          
          console.error('Error completo en función Netlify:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            fullError: errorMessage,
            tipo: errorData.type
          });
          
          // Mostrar mensaje más específico según el tipo de error
          if (errorMessage.includes('Token') || errorMessage.includes('token')) {
            errorMessage = 'GitHub token not configured. Go to Netlify → Site settings → Environment variables and add GITHUB_TOKEN';
          } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            errorMessage = 'Invalid or unauthorized GitHub token. Check the token in Netlify';
          } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
            errorMessage = 'Repositorio o archivo no encontrado. Verifica el nombre del repositorio';
          }
        }
      } catch (netlifyError) {
        errorMessage = netlifyError.message || 'Could not connect to Netlify function';
        console.error('Error de conexión con Netlify:', {
          message: netlifyError.message,
          stack: netlifyError.stack,
          name: netlifyError.name
        });
      }

      // If Netlify save failed, save to localStorage as backup
      if (!saved) {
        localStorage.setItem('site_data_backup', JSON.stringify(updatedData));
        localStorage.setItem('site_data_backup_time', new Date().toISOString());
        console.log('Data saved to localStorage as backup');
        
        // Mostrar mensaje más detallado
        const backupMessage = errorMessage 
          ? `${successMessage} (saved locally - Error: ${errorMessage})`
          : `${successMessage} (saved locally - Netlify function not available)`;
        
        return { 
          success: true, 
          saved: false, 
          message: backupMessage,
          error: errorMessage 
        };
      }

      return { success: true, saved: true, message: successMessage };
    } catch (err) {
      console.error('Error al guardar:', err);
      throw err;
    }
  }

  // Hero - guardar cambios (solo los campos que tengan valor)
  const heroForm = document.getElementById('hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', async e => {
      e.preventDefault();
      const imageUrl = document.getElementById('hero-image-url')?.value.trim();
      const subtitle = document.getElementById('hero-subtitle')?.value.trim();
      try {
        const currentData = await getCurrentSiteData();
        if (imageUrl) currentData.hero.imagen = imageUrl;
        if (subtitle) currentData.hero.subtitulo = subtitle;
        const result = await saveSiteData(currentData, 'Hero updated successfully');
        if (result.saved) alert(result.message + '\n\nChanges were saved to GitHub.');
        else alert(result.message + '\n\nChanges are saved locally. Set up GITHUB_TOKEN in Netlify to push to GitHub.');
      } catch (err) {
        console.error('Error saving Hero:', err);
        alert('Error saving: ' + err.message);
      }
    });
  }

  // About Us - guardar cambios (solo los campos que tengan valor)
  const aboutForm = document.getElementById('about-form');
  if (aboutForm) {
    aboutForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('about-title')?.value.trim();
      const contentElement = document.getElementById('about-content');
      const content = contentElement ? contentElement.value : '';
      try {
        const currentData = await getCurrentSiteData();
        if (title) currentData.about_us.titulo = title;
        currentData.about_us.texto = content;
        const result = await saveSiteData(currentData, 'About Us updated successfully');
        if (result.saved) alert(result.message + '\n\nChanges were saved to GitHub.');
        else alert(result.message + '\n\nChanges are saved locally. Set up GITHUB_TOKEN in Netlify to push to GitHub.');
      } catch (err) {
        console.error('Error saving About Us:', err);
        alert('Error saving: ' + err.message);
      }
    });
  }

  // Redes Sociales - cargar valores actuales al abrir el panel
  (async function fillRedesForm() {
    const fb = document.getElementById('facebook-url');
    const ig = document.getElementById('instagram-url');
    const tk = document.getElementById('tiktok-url');
    const yt = document.getElementById('youtube-url');
    const wa = document.getElementById('whatsapp-url');
    if (!fb || !ig) return;
    try {
      const data = await getCurrentSiteData();
      const r = data.redes_sociales || {};
      if (fb) fb.value = r.facebook || '';
      if (ig) ig.value = r.instagram || '';
      if (tk) tk.value = r.tiktok || '';
      if (yt) yt.value = r.youtube || '';
      if (wa) wa.value = r.whatsapp || '';
    } catch (e) {
      console.warn('No se pudieron cargar enlaces de redes:', e);
    }
  })();

  // Redes Sociales - guardar cambios (solo los campos que tengan valor)
  const redesForm = document.getElementById('redes-form');
  if (redesForm) {
    redesForm.addEventListener('submit', async e => {
      e.preventDefault();
      const raw = (id) => (document.getElementById(id)?.value || '').trim();
      const facebook = raw('facebook-url');
      const instagram = raw('instagram-url');
      const tiktok = raw('tiktok-url');
      const youtube = raw('youtube-url');
      const whatsapp = raw('whatsapp-url');
      // Solo actualizar si tiene un enlace real (no vacío y no solo "#")
      const isLink = (v) => v && v !== '#';
      try {
        const currentData = await getCurrentSiteData();
        if (isLink(facebook)) currentData.redes_sociales.facebook = facebook;
        if (isLink(instagram)) currentData.redes_sociales.instagram = instagram;
        if (isLink(tiktok)) currentData.redes_sociales.tiktok = tiktok;
        if (isLink(youtube)) currentData.redes_sociales.youtube = youtube;
        if (isLink(whatsapp)) currentData.redes_sociales.whatsapp = whatsapp;
        const result = await saveSiteData(currentData, 'Redes sociales actualizadas exitosamente');
        if (result.saved) alert(result.message);
        else alert(result.message + '\n\nChanges are saved locally.');
      } catch (err) {
        console.error('Error saving Social Links:', err);
        alert('Error saving: ' + err.message);
      }
    });
  }

  // Boarding - vista previa
  const boardingImageInput = document.getElementById('boarding-image-url');
  const boardingPreviewImg = document.getElementById('boarding-preview-img');
  if (boardingImageInput && boardingPreviewImg) {
    boardingImageInput.addEventListener('input', function() {
      const url = this.value.trim();
      if (url) {
        boardingPreviewImg.src = url;
        boardingPreviewImg.onerror = () => boardingPreviewImg.src = 'IMG/Boarding-Service.png';
      } else {
        boardingPreviewImg.src = 'IMG/Boarding-Service.png';
      }
    });
  }

  // Boarding Service - guardar cambios (solo los campos que tengan valor)
  const boardingForm = document.getElementById('boarding-form');
  if (boardingForm) {
    boardingForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('boarding-title')?.value.trim();
      const content = document.getElementById('boarding-content')?.value.trim();
      const imageUrl = document.getElementById('boarding-image-url')?.value.trim();
      try {
        const currentData = await getCurrentSiteData();
        if (title) currentData.boarding.titulo = title;
        currentData.boarding.texto = content;
        if (imageUrl) currentData.boarding.imagen = imageUrl;
        const result = await saveSiteData(currentData, 'Boarding Service updated successfully');
        if (result.saved) alert(result.message + '\n\nChanges were saved to GitHub.');
        else alert(result.message + '\n\nChanges are saved locally.');
      } catch (err) {
        console.error('Error saving Boarding Service:', err);
        alert('Error saving: ' + err.message);
      }
    });
  }

  // Blog - vista previa y cargar datos actuales
  const blogImageInput = document.getElementById('blog-image-url');
  const blogPreviewImg = document.getElementById('blog-preview-img');
  if (blogImageInput && blogPreviewImg) {
    blogImageInput.addEventListener('input', function() {
      const url = this.value.trim();
      if (url) {
        blogPreviewImg.src = url;
        blogPreviewImg.onerror = () => blogPreviewImg.src = 'IMG/bio.png';
      } else {
        blogPreviewImg.src = 'IMG/bio.png';
      }
    });
  }

  (async function fillBlogForm() {
    const titleEl = document.getElementById('blog-title');
    const contentEl = document.getElementById('blog-content');
    const imageEl = document.getElementById('blog-image-url');
    if (!titleEl || !contentEl) return;
    try {
      const data = await getCurrentSiteData();
      const b = data.blog || {};
      if (titleEl) titleEl.value = b.titulo || '';
      if (contentEl) contentEl.value = b.texto || '';
      if (imageEl) imageEl.value = b.imagen || 'IMG/bio.png';
      if (blogPreviewImg) blogPreviewImg.src = b.imagen || 'IMG/bio.png';
    } catch (e) {
      console.warn('Could not load blog data:', e);
    }
  })();

  // Blog - save changes
  const blogForm = document.getElementById('blog-form');
  if (blogForm) {
    blogForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('blog-title')?.value.trim();
      const content = document.getElementById('blog-content')?.value.trim();
      const imageUrl = document.getElementById('blog-image-url')?.value.trim();
      try {
        const currentData = await getCurrentSiteData();
        if (title) currentData.blog.titulo = title;
        currentData.blog.texto = content || '';
        if (imageUrl) currentData.blog.imagen = imageUrl;
        const result = await saveSiteData(currentData, 'Blog updated successfully');
        if (result.saved) alert(result.message + '\n\nChanges were saved to GitHub.');
        else alert(result.message + '\n\nChanges are saved locally.');
      } catch (err) {
        console.error('Error saving Blog:', err);
        alert('Error saving: ' + err.message);
      }
    });
  }

  // Puppy Concierge - vista previa
  const puppyImageInput = document.getElementById('puppy-image-url');
  const puppyPreviewImg = document.getElementById('puppy-preview-img');
  if (puppyImageInput && puppyPreviewImg) {
    puppyImageInput.addEventListener('input', function() {
      const url = this.value.trim();
      if (url) {
        puppyPreviewImg.src = url;
        puppyPreviewImg.onerror = () => puppyPreviewImg.src = 'IMG/Puppy-Concierge.png';
      } else {
        puppyPreviewImg.src = 'IMG/Puppy-Concierge.png';
      }
    });
  }

  // Puppy Concierge - guardar cambios (solo los campos que tengan valor)
  const puppyForm = document.getElementById('puppy-form');
  if (puppyForm) {
    puppyForm.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('puppy-title')?.value.trim();
      const content = document.getElementById('puppy-content')?.value.trim();
      const imageUrl = document.getElementById('puppy-image-url')?.value.trim();
      try {
        const currentData = await getCurrentSiteData();
        if (title) currentData.puppy.titulo = title;
        currentData.puppy.texto = content;
        if (imageUrl) currentData.puppy.imagen = imageUrl;
        const result = await saveSiteData(currentData, 'Puppy Concierge updated successfully');
        if (result.saved) alert(result.message + '\n\nChanges were saved to GitHub.');
        else alert(result.message + '\n\nChanges are saved locally.');
      } catch (err) {
        console.error('Error saving Puppy Concierge:', err);
        alert('Error saving: ' + err.message);
      }
    });
  }

  // Botón "Probar guardado en GitHub" (sección Configuración)
  const btnProbarGitHub = document.getElementById('btn-probar-github');
  const resultadoProbar = document.getElementById('resultado-probar');
  if (btnProbarGitHub && resultadoProbar) {
    btnProbarGitHub.addEventListener('click', async () => {
      resultadoProbar.textContent = 'Probando...';
      resultadoProbar.style.color = '';
      try {
        const currentData = await getCurrentSiteData();
        const result = await saveSiteData(currentData, 'Prueba');
        if (result.saved) {
          resultadoProbar.textContent = '✓ Saved to GitHub successfully. Changes are now pushed to GitHub.';
          resultadoProbar.style.color = 'green';
        } else {
          resultadoProbar.textContent = '✗ Could not save to GitHub: ' + (result.error || 'check the console');
          resultadoProbar.style.color = '#c0392b';
        }
      } catch (err) {
        resultadoProbar.textContent = 'Error: ' + err.message;
        resultadoProbar.style.color = '#c0392b';
      }
    });
  }

  // ────────────────────────────────────────────────
  // Training Services - manejo de videos
  // ────────────────────────────────────────────────

  let trainingVideos = []; // Se cargará desde site-data.json al inicio

  const trainingForm = document.getElementById('training-video-form');
  const videosList = document.getElementById('videos-list');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // Cargar videos existentes al abrir la sección
  async function loadVideos() {
    try {
      const response = await fetch('/site-data.json');
      if (response.ok) {
        const data = await response.json();
        trainingVideos = data.training_videos || [];
        
        // If there is a backup in localStorage and no videos, try to load it
        if (trainingVideos.length === 0) {
          const backup = localStorage.getItem('training_videos_backup');
          if (backup) {
            try {
              const backupVideos = JSON.parse(backup);
              if (backupVideos.length > 0) {
                console.log('Loading videos from local backup');
                trainingVideos = backupVideos;
              }
            } catch (e) {
              console.warn('Error loading backup:', e);
            }
          }
        }
        
        renderVideos('all');
      }
    } catch (err) {
      console.warn('No se pudo cargar videos desde site-data.json:', err);
      
      // Try to load from localStorage as backup
      const backup = localStorage.getItem('training_videos_backup');
      if (backup) {
        try {
          trainingVideos = JSON.parse(backup);
          console.log('Videos loaded from local backup');
          renderVideos('all');
        } catch (e) {
          console.error('Error loading backup:', e);
        }
      }
    }
  }

  // Renderizar videos en el panel
  function renderVideos(filter = 'all') {
    if (!videosList) return;

    videosList.innerHTML = '';

    const filteredVideos = filter === 'all'
      ? trainingVideos
      : trainingVideos.filter(v => v.categories?.includes(filter));

    if (filteredVideos.length === 0) {
      videosList.innerHTML = '<p class="no-videos">No videos added yet.</p>';
      return;
    }

    filteredVideos.forEach(video => {
      const div = document.createElement('div');
      div.className = 'video-item';
      div.innerHTML = `
        <video controls src="${video.url}"></video>
        <div class="video-info">
          <h4>${video.title}</h4>
          <p>${video.description || 'No description'}</p>
          <div class="video-categories">
            Categories: ${video.categories?.map(c => 
              c.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            ).join(', ') || 'None'}
          </div>
          <div class="video-actions">
            <button class="delete-video" data-id="${video.id}">Delete</button>
          </div>
        </div>
      `;
      videosList.appendChild(div);
    });

    // Delete video
    document.querySelectorAll('.delete-video').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = parseInt(this.dataset.id);
        if (confirm('Do you really want to delete this video?')) {
          trainingVideos = trainingVideos.filter(v => v.id !== id);
          renderVideos(filter);
          
          // Save changes
          try {
            let currentData = {};
            try {
              const res = await fetch('/site-data.json');
              if (res.ok) currentData = await res.json();
            } catch {}

            currentData.training_videos = trainingVideos;

            // Intentar guardar en Netlify
            let saved = false;
            try {
              const response = await fetch('/.netlify/functions/update-site-data', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentData)
              });

              if (response.ok) {
                saved = true;
                console.log('Video eliminado exitosamente en GitHub');
              }
            } catch (netlifyError) {
              console.warn('Función Netlify no disponible:', netlifyError);
            }

            // Save to localStorage as backup
            localStorage.setItem('training_videos_backup', JSON.stringify(trainingVideos));
            localStorage.setItem('training_videos_backup_time', new Date().toISOString());

            if (saved) {
              alert('Video deleted successfully.');
            } else {
              alert('Video deleted locally. Remember to update site-data.json manually.');
            }
          } catch (err) {
            console.error('Error al eliminar:', err);
            alert('Error deleting video: ' + err.message);
            // Recargar videos para restaurar el estado
            loadVideos();
          }
        }
      });
    });
  }

  // Manejo de filtros
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderVideos(this.dataset.filter);
    });
  });

  // Formulario para agregar video
  if (trainingForm) {
    trainingForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const title = document.getElementById('video-title')?.value.trim();
      const url = document.getElementById('video-url')?.value.trim();
      const description = document.getElementById('video-description')?.value.trim() || '';

      const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
      const categories = Array.from(categoryCheckboxes).map(cb => cb.value);

      if (!title || !url) {
        alert('Please enter the video title and URL.');
        return;
      }

      if (categories.length === 0) {
        alert('Select at least one category.');
        return;
      }

      const newVideo = {
        id: Date.now(),
        title,
        url,
        description,
        categories,
        thumbnail: '' // Puedes agregar thumbnail después si quieres
      };

      trainingVideos.push(newVideo);

      try {
        // Cargar datos actuales
        let currentData = {};
        try {
          const res = await fetch('/site-data.json');
          if (res.ok) currentData = await res.json();
        } catch {}

        currentData.training_videos = trainingVideos;

        // Intentar guardar usando la función de Netlify
        let saved = false;
        try {
          const response = await fetch('/.netlify/functions/update-site-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentData)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Guardado exitoso en GitHub:', result);
            saved = true;
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            console.warn('Error en función Netlify:', errorData);
          }
        } catch (netlifyError) {
          console.warn('La función de Netlify no está disponible (probablemente estás en desarrollo local):', netlifyError);
        }

        // If Netlify save failed, save to localStorage as backup
        if (!saved) {
          try {
            localStorage.setItem('training_videos_backup', JSON.stringify(trainingVideos));
            localStorage.setItem('training_videos_backup_time', new Date().toISOString());
            console.log('Video saved to localStorage as backup');
            
            // Mostrar mensaje informativo
            const useBackup = confirm(
              'Could not connect to the server (you may be in local development).\n\n' +
              'The video was saved locally. Do you want to copy the data to manually update site-data.json?\n\n' +
              'Press "OK" to copy to clipboard, or "Cancel" to continue.'
            );
            
            if (useBackup) {
              const jsonData = JSON.stringify(currentData, null, 2);
              navigator.clipboard.writeText(jsonData).then(() => {
                alert('Data copied to clipboard. Paste the content into site-data.json and upload to GitHub manually.');
              }).catch(() => {
                // Fallback si clipboard no está disponible
                console.log('Datos para site-data.json:', jsonData);
                alert('The data is in the browser console (F12). Copy it and update site-data.json manually.');
              });
            }
          } catch (localError) {
            console.error('Error al guardar en localStorage:', localError);
            throw new Error('Could not save the video. Check the console for details.');
          }
        }

        trainingForm.reset();
        renderVideos('all');

        if (saved) {
          alert('Video added successfully! It will update on GitHub shortly.');
        } else {
          alert('Video saved locally. Remember to update site-data.json manually or deploy on Netlify.');
        }
      } catch (err) {
        console.error('Error al guardar:', err);
        alert('Error saving video: ' + err.message + '\n\nCheck the console (F12) for details.');
      }
    });
  }

  // Cargar videos al inicio (cuando se abre la página)
  loadVideos();
});

// ────────────────────────────────────────────────
// Nota: La función saveToGitHub fue reemplazada por
// la función de Netlify /.netlify/functions/update-site-data
// que maneja la actualización de forma segura desde el servidor
// ────────────────────────────────────────────────