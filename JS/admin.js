// js/admin.js - Panel de Administración VERSIÓN CORREGIDA

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Admin panel loaded - Versión corregida');

  // =============================================
  // MENÚ - CAMBIO DE SECCIONES
  // =============================================
  const menuItems = document.querySelectorAll('.menu-item, .submenu li');
  const sections = document.querySelectorAll('.section');

  console.log('Menú items encontrados:', menuItems.length);
  console.log('Secciones encontradas:', sections.length);

  const serviceItem = document.querySelector('.menu-item.has-submenu');
  if (serviceItem) {
    serviceItem.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
      console.log('Submenú toggled');
    });
  }

  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      // Si es el item de servicios con submenú, no hacer nada aquí
      if (this.classList.contains('has-submenu')) return;

      console.log('Clic en menú:', this.textContent.trim());

      // Quitar active de todos
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      // Ocultar todas las secciones
      sections.forEach(sec => sec.classList.add('hidden'));

      // Mostrar la sección correspondiente
      const sectionKey = this.getAttribute('data-section');
      if (sectionKey) {
        const targetId = 'section-' + sectionKey;
        const target = document.getElementById(targetId);
        if (target) {
          target.classList.remove('hidden');
          console.log('Mostrando sección:', targetId);
        } else {
          console.error('No se encontró la sección:', targetId);
        }
      }
    });
  });

  // =============================================
  // FUNCIONES DE GUARDADO
  // =============================================
  async function getCurrentSiteData() {
    try {
      const response = await fetch('/site-data.json?' + Date.now());
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Error fetching site-data.json:', e);
    }
    
    const backup = localStorage.getItem('site_data_backup');
    if (backup) {
      try {
        return JSON.parse(backup);
      } catch (e) {
        console.warn('Error parsing backup:', e);
      }
    }
    
    // Datos por defecto
    return {
      hero: { imagen: 'IMG/Perro home.png', subtitulo: 'DOG OBEDIENCE AND SERVICE DOG TRAINING' },
      about_us: { titulo: 'About Us', texto: '' },
      boarding: { titulo: 'Boarding Service', texto: '', imagen: 'IMG/Boarding-Service.png' },
      puppy: { titulo: 'Puppy Concierge', texto: '', imagen: 'IMG/Puppy-Concierge.png' },
      blog: { posts: [] },
      redes_sociales: { facebook: '#', instagram: '#', tiktok: '#', youtube: '#', whatsapp: '#' },
      training_videos: [],
      email_recipient: 'shawn@leashtolegacy.org',
      users: [
        { id: 1, username: 'admin', password: 'leash2025', role: 'administrator', created: '2024-01-01' }
      ]
    };
  }

  async function saveSiteData(updatedData, message) {
    localStorage.setItem('site_data_backup', JSON.stringify(updatedData));
    localStorage.setItem('site_data_backup_time', new Date().toISOString());
    
    if (updatedData.blog && updatedData.blog.posts) {
      localStorage.setItem('blog_posts_backup', JSON.stringify(updatedData.blog.posts));
    }
    
    try {
      const response = await fetch('/.netlify/functions/update-site-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        alert(message + ' ✅ (saved to GitHub)');
      } else {
        alert(message + ' ⚠️ (saved locally)');
      }
    } catch (error) {
      console.warn('Error saving to GitHub:', error);
      alert(message + ' ⚠️ (saved locally)');
    }
  }

  // =============================================
  // HERO SECTION
  // =============================================
  const heroImageInput = document.getElementById('hero-image-url');
  const heroPreviewImg = document.getElementById('preview-img');
  const heroSubtitleInput = document.getElementById('hero-subtitle');
  const heroForm = document.getElementById('hero-form');

  if (heroImageInput && heroPreviewImg) {
    heroImageInput.addEventListener('input', function() {
      const url = this.value.trim();
      if (url) {
        heroPreviewImg.src = url;
        heroPreviewImg.style.display = 'block';
      } else {
        heroPreviewImg.src = '';
        heroPreviewImg.style.display = 'none';
      }
    });
  }

  if (heroForm) {
    // Cargar valores
    (async function() {
      const data = await getCurrentSiteData();
      if (heroImageInput && data.hero?.imagen) {
        heroImageInput.value = data.hero.imagen;
        if (heroPreviewImg) {
          heroPreviewImg.src = data.hero.imagen;
          heroPreviewImg.style.display = 'block';
        }
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

  // =============================================
  // ABOUT US
  // =============================================
  const aboutTitleInput = document.getElementById('about-title');
  const aboutContentInput = document.getElementById('about-content');
  const aboutForm = document.getElementById('about-form');

  if (aboutForm) {
    (async function() {
      const data = await getCurrentSiteData();
      if (aboutTitleInput && data.about_us?.titulo) {
        aboutTitleInput.value = data.about_us.titulo;
      }
      if (aboutContentInput && data.about_us?.texto) {
        aboutContentInput.value = data.about_us.texto;
      }
    })();

    aboutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const title = aboutTitleInput?.value.trim() || 'About Us';
      const content = aboutContentInput?.value || '';
      
      const currentData = await getCurrentSiteData();
      currentData.about_us = {
        titulo: title,
        texto: content
      };
      await saveSiteData(currentData, 'About Us updated');
    });
  }

  // =============================================
  // BLOG - Multi-entradas
  // =============================================
  
  let blogPosts = [];

  async function loadBlogPosts() {
    try {
      const data = await getCurrentSiteData();
      console.log('Datos cargados:', data);
      
      blogPosts = (data.blog && data.blog.posts) ? data.blog.posts : [];
      
      const backup = localStorage.getItem('blog_posts_backup');
      if (backup && blogPosts.length === 0) {
        try {
          blogPosts = JSON.parse(backup);
        } catch (e) {}
      }
      
      renderBlogPosts();
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  }

  function renderBlogPosts() {
    const container = document.getElementById('blog-posts-list');
    if (!container) {
      console.warn('No container found for blog posts');
      return;
    }

    if (!blogPosts || blogPosts.length === 0) {
      container.innerHTML = '<p class="no-items">No blog posts yet. Create your first post!</p>';
      return;
    }

    const sortedPosts = [...blogPosts].sort((a, b) => {
      return new Date(b.fecha || 0) - new Date(a.fecha || 0);
    });

    let html = '';
    sortedPosts.forEach(post => {
      const fecha = post.fecha ? new Date(post.fecha).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'No date';
      
      const resumen = post.resumen || (post.texto ? post.texto.substring(0, 100) + '...' : 'No content');
      
      html += `
        <div class="blog-post-item" data-id="${post.id}">
          <div class="blog-post-preview">
            <img src="${post.imagen || 'IMG/bio.png'}" alt="${post.titulo}" class="blog-thumbnail">
            <div class="blog-post-info">
              <h4>${post.titulo || 'Untitled'}</h4>
              <div class="blog-meta">
                <span class="blog-date">${fecha}</span>
              </div>
              <p class="blog-summary">${resumen}</p>
            </div>
          </div>
          <div class="blog-post-actions">
            <button class="edit-blog-btn" data-id="${post.id}">Edit</button>
            <button class="delete-blog-btn" data-id="${post.id}">Delete</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Agregar event listeners
    document.querySelectorAll('.edit-blog-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        editBlogPost(id);
      });
    });

    document.querySelectorAll('.delete-blog-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        deleteBlogPost(id);
      });
    });
  }

  function editBlogPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    const titleInput = document.getElementById('blog-title');
    const contentInput = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image-url');
    const dateInput = document.getElementById('blog-date');
    const summaryInput = document.getElementById('blog-summary');
    const previewImg = document.getElementById('blog-preview-img');
    
    if (titleInput) titleInput.value = post.titulo || '';
    if (contentInput) contentInput.value = post.texto || '';
    if (imageInput) imageInput.value = post.imagen || '';
    if (dateInput) dateInput.value = post.fecha || '';
    if (summaryInput) summaryInput.value = post.resumen || '';
    
    if (previewImg && post.imagen) {
      previewImg.src = post.imagen;
      previewImg.style.display = 'block';
    }
    
    const blogForm = document.getElementById('blog-form');
    if (blogForm) {
      blogForm.dataset.editingId = id;
    }
    
    const submitBtn = document.querySelector('#blog-form button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Update Post';
    
    document.getElementById('blog-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function deleteBlogPost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    blogPosts = blogPosts.filter(p => p.id !== id);
    localStorage.setItem('blog_posts_backup', JSON.stringify(blogPosts));
    
    const currentData = await getCurrentSiteData();
    currentData.blog = currentData.blog || {};
    currentData.blog.posts = blogPosts;
    
    await saveSiteData(currentData, 'Blog post deleted');
    renderBlogPosts();
  }

  // Configurar formulario de blog
  const blogForm = document.getElementById('blog-form');
  const blogImageInput = document.getElementById('blog-image-url');
  const blogPreviewImg = document.getElementById('blog-preview-img');
  const blogTitleInput = document.getElementById('blog-title');
  const blogContentInput = document.getElementById('blog-content');
  const blogDateInput = document.getElementById('blog-date');
  const blogSummaryInput = document.getElementById('blog-summary');

  if (blogImageInput && blogPreviewImg) {
    blogImageInput.addEventListener('input', function() {
      const url = this.value.trim();
      if (url) {
        blogPreviewImg.src = url;
        blogPreviewImg.style.display = 'block';
      } else {
        blogPreviewImg.src = '';
        blogPreviewImg.style.display = 'none';
      }
    });
  }

  if (blogForm) {
    blogForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const title = blogTitleInput?.value.trim();
      const content = blogContentInput?.value.trim();
      const imageUrl = blogImageInput?.value.trim();
      const fecha = blogDateInput?.value || new Date().toISOString().split('T')[0];
      const resumen = blogSummaryInput?.value.trim() || (content ? content.substring(0, 150) + '...' : '');

      if (!title || !content) {
        alert('Please enter title and content');
        return;
      }

      const editingId = blogForm.dataset.editingId;
      
      if (editingId) {
        const index = blogPosts.findIndex(p => p.id === parseInt(editingId));
        if (index !== -1) {
          blogPosts[index] = {
            ...blogPosts[index],
            titulo: title,
            texto: content,
            imagen: imageUrl || blogPosts[index].imagen || 'IMG/bio.png',
            fecha: fecha,
            resumen: resumen
          };
        }
      } else {
        const newPost = {
          id: Date.now(),
          titulo: title,
          texto: content,
          imagen: imageUrl || 'IMG/bio.png',
          fecha: fecha,
          resumen: resumen
        };
        blogPosts.push(newPost);
      }

      localStorage.setItem('blog_posts_backup', JSON.stringify(blogPosts));

      const currentData = await getCurrentSiteData();
      currentData.blog = currentData.blog || {};
      currentData.blog.posts = blogPosts;
      
      await saveSiteData(currentData, editingId ? 'Blog post updated' : 'Blog post created');

      // Resetear formulario
      blogForm.reset();
      blogForm.dataset.editingId = '';
      if (blogTitleInput) blogTitleInput.value = '';
      if (blogContentInput) blogContentInput.value = '';
      if (blogImageInput) blogImageInput.value = '';
      if (blogDateInput) blogDateInput.value = '';
      if (blogSummaryInput) blogSummaryInput.value = '';
      if (blogPreviewImg) {
        blogPreviewImg.src = '';
        blogPreviewImg.style.display = 'none';
      }
      
      const submitBtn = document.querySelector('#blog-form button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Save Blog Post';
      
      renderBlogPosts();
    });
  }

  const cancelBlogEdit = document.getElementById('cancel-blog-edit');
  if (cancelBlogEdit) {
    cancelBlogEdit.addEventListener('click', function() {
      const blogForm = document.getElementById('blog-form');
      if (blogForm) {
        blogForm.reset();
        blogForm.dataset.editingId = '';
      }
      if (blogTitleInput) blogTitleInput.value = '';
      if (blogContentInput) blogContentInput.value = '';
      if (blogImageInput) blogImageInput.value = '';
      if (blogDateInput) blogDateInput.value = '';
      if (blogSummaryInput) blogSummaryInput.value = '';
      if (blogPreviewImg) {
        blogPreviewImg.src = '';
        blogPreviewImg.style.display = 'none';
      }
      const submitBtn = document.querySelector('#blog-form button[type="submit"]');
      if (submitBtn) submitBtn.textContent = 'Save Blog Post';
    });
  }

  // =============================================
  // BOARDING
  // =============================================
  const boardingForm = document.getElementById('boarding-form');
  if (boardingForm) {
    boardingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      alert('Boarding form submitted - implementar después');
    });
  }

  // =============================================
  // PUPPY
  // =============================================
  const puppyForm = document.getElementById('puppy-form');
  if (puppyForm) {
    puppyForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      alert('Puppy form submitted - implementar después');
    });
  }

  // =============================================
  // TRAINING VIDEOS
  // =============================================
  const trainingForm = document.getElementById('training-video-form');
  if (trainingForm) {
    trainingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      alert('Training form submitted - implementar después');
    });
  }

  // =============================================
  // USERS
  // =============================================
  const createUserForm = document.getElementById('create-user-form');
  if (createUserForm) {
    createUserForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      alert('User form submitted - implementar después');
    });
  }

  // =============================================
  // TEST GITHUB BUTTON
  // =============================================
  const btnTest = document.getElementById('btn-probar-github');
  const resultado = document.getElementById('resultado-probar');
  if (btnTest && resultado) {
    btnTest.addEventListener('click', async function() {
      resultado.textContent = 'Testing connection...';
      resultado.style.color = '#333';
      
      try {
        const data = await getCurrentSiteData();
        const response = await fetch('/.netlify/functions/update-site-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          resultado.textContent = '✅ GitHub connection successful!';
          resultado.style.color = 'green';
        } else {
          resultado.textContent = '⚠️ GitHub token not configured. Saving locally only.';
          resultado.style.color = 'orange';
        }
      } catch (error) {
        resultado.textContent = '⚠️ Working locally (GitHub not configured)';
        resultado.style.color = 'orange';
      }
    });
  }

  // Cargar datos iniciales
  loadBlogPosts();
  console.log('✅ Panel inicializado correctamente');
});
