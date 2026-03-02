// js/admin.js - Panel de Administración COMPLETO
// CON BLOG MULTI-ENTRADAS Y USERS CON CONTRASEÑAS VISIBLES
// CORREGIDO: Input fields sin valores predeterminados

document.addEventListener('DOMContentLoaded', function() {
  console.log('Admin panel loaded');

  // =============================================
  // MENÚ - CAMBIO DE SECCIONES
  // =============================================
  const menuItems = document.querySelectorAll('.menu-item, .submenu li');
  const sections = document.querySelectorAll('.section');

  const serviceItem = document.querySelector('.menu-item.has-submenu');
  if (serviceItem) {
    serviceItem.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('active');
    });
  }

  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      if (this.classList.contains('has-submenu')) return;

      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      sections.forEach(sec => sec.classList.add('hidden'));

      const sectionKey = this.getAttribute('data-section');
      if (sectionKey) {
        const targetId = 'section-' + sectionKey;
        const target = document.getElementById(targetId);
        if (target) target.classList.remove('hidden');
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
    } catch (e) {}
    
    const backup = localStorage.getItem('site_data_backup');
    if (backup) {
      try {
        return JSON.parse(backup);
      } catch (e) {}
    }
    
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
      alert(message + ' ⚠️ (saved locally)');
    }
  }

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

  // =============================================
  // ABOUT US - CORREGIDO
  // =============================================
  const aboutTitleInput = document.getElementById('about-title');
  const aboutContentInput = document.getElementById('about-content');
  
  if (aboutTitleInput) aboutTitleInput.value = '';
  if (aboutContentInput) aboutContentInput.value = '';

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
  // SOCIAL LINKS - CORREGIDO
  // =============================================
  const facebookInput = document.getElementById('facebook-url');
  const instagramInput = document.getElementById('instagram-url');
  const tiktokInput = document.getElementById('tiktok-url');
  const youtubeInput = document.getElementById('youtube-url');
  const whatsappInput = document.getElementById('whatsapp-url');

  // Limpiar inputs
  [facebookInput, instagramInput, tiktokInput, youtubeInput, whatsappInput].forEach(input => {
    if (input) input.value = '';
  });

  const redesForm = document.getElementById('redes-form');
  if (redesForm) {
    (async function() {
      const data = await getCurrentSiteData();
      const r = data.redes_sociales || {};
      if (facebookInput && r.facebook) facebookInput.value = r.facebook;
      if (instagramInput && r.instagram) instagramInput.value = r.instagram;
      if (tiktokInput && r.tiktok) tiktokInput.value = r.tiktok;
      if (youtubeInput && r.youtube) youtubeInput.value = r.youtube;
      if (whatsappInput && r.whatsapp) whatsappInput.value = r.whatsapp;
    })();

    redesForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const isLink = (v) => v && v !== '#';
      
      const currentData = await getCurrentSiteData();
      currentData.redes_sociales = {
        facebook: isLink(facebookInput?.value) ? facebookInput.value : '#',
        instagram: isLink(instagramInput?.value) ? instagramInput.value : '#',
        tiktok: isLink(tiktokInput?.value) ? tiktokInput.value : '#',
        youtube: isLink(youtubeInput?.value) ? youtubeInput.value : '#',
        whatsapp: isLink(whatsappInput?.value) ? whatsappInput.value : '#'
      };
      await saveSiteData(currentData, 'Social links updated');
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
      
      if (data.blog && data.blog.posts) {
        blogPosts = data.blog.posts;
      } else {
        blogPosts = [];
      }
      
      const backup = localStorage.getItem('blog_posts_backup');
      if (backup && blogPosts.length === 0) {
        try {
          blogPosts = JSON.parse(backup);
        } catch (e) {}
      }
      
      console.log('Posts cargados:', blogPosts);
      renderBlogPosts();
    } catch (error) {
      console.error('Error loading blog posts:', error);
      const container = document.getElementById('blog-posts-list');
      if (container) {
        container.innerHTML = '<p class="error">Error loading posts. Check console.</p>';
      }
    }
  }

  function renderBlogPosts() {
    const container = document.getElementById('blog-posts-list');
    if (!container) {
      console.error('No se encontró el contenedor blog-posts-list');
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

    document.querySelectorAll('.edit-blog-btn').forEach(btn => {
      btn.addEventListener('click', () => editBlogPost(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.delete-blog-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteBlogPost(parseInt(btn.dataset.id)));
    });
  }

  function editBlogPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    document.getElementById('blog-title').value = post.titulo || '';
    document.getElementById('blog-content').value = post.texto || '';
    document.getElementById('blog-image-url').value = post.imagen || '';
    document.getElementById('blog-date').value = post.fecha || '';
    document.getElementById('blog-summary').value = post.resumen || '';
    
    document.getElementById('blog-form').dataset.editingId = id;
    document.querySelector('#blog-form button[type="submit"]').textContent = 'Update Post';
    document.getElementById('blog-form').scrollIntoView({ behavior: 'smooth' });
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

  const blogForm = document.getElementById('blog-form');
  const blogImageInput = document.getElementById('blog-image-url');
  const blogPreviewImg = document.getElementById('blog-preview-img');
  const blogTitleInput = document.getElementById('blog-title');
  const blogContentInput = document.getElementById('blog-content');
  const blogDateInput = document.getElementById('blog-date');
  const blogSummaryInput = document.getElementById('blog-summary');

  // Limpiar inputs
  if (blogTitleInput) blogTitleInput.value = '';
  if (blogContentInput) blogContentInput.value = '';
  if (blogImageInput) blogImageInput.value = '';
  if (blogDateInput) blogDateInput.value = '';
  if (blogSummaryInput) blogSummaryInput.value = '';

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

  if (blogForm) {
    blogForm.reset();
    blogForm.dataset.editingId = '';
    
    blogForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const title = blogTitleInput?.value.trim();
      const content = blogContentInput?.value.trim();
      const imageUrl = blogImageInput?.value.trim() || 'IMG/bio.png';
      const fecha = blogDateInput?.value || new Date().toISOString().split('T')[0];
      const resumen = blogSummaryInput?.value.trim() || content.substring(0, 150) + '...';

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
            imagen: imageUrl,
            fecha: fecha,
            resumen: resumen
          };
        }
      } else {
        const newPost = {
          id: Date.now(),
          titulo: title,
          texto: content,
          imagen: imageUrl,
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

      blogForm.reset();
      blogForm.dataset.editingId = '';
      blogTitleInput.value = '';
      blogContentInput.value = '';
      blogImageInput.value = '';
      blogDateInput.value = '';
      blogSummaryInput.value = '';
      blogPreviewImg.src = 'IMG/bio.png';
      
      document.querySelector('#blog-form button[type="submit"]').textContent = 'Save Blog Post';
      renderBlogPosts();
    });
  }

  const cancelBlogEdit = document.getElementById('cancel-blog-edit');
  if (cancelBlogEdit) {
    cancelBlogEdit.addEventListener('click', function() {
      blogForm.reset();
      blogForm.dataset.editingId = '';
      blogTitleInput.value = '';
      blogContentInput.value = '';
      blogImageInput.value = '';
      blogDateInput.value = '';
      blogSummaryInput.value = '';
      blogPreviewImg.src = 'IMG/bio.png';
      document.querySelector('#blog-form button[type="submit"]').textContent = 'Save Blog Post';
    });
  }

  // =============================================
  // BOARDING - CORREGIDO
  // =============================================
  const boardingImageInput = document.getElementById('boarding-image-url');
  const boardingPreviewImg = document.getElementById('boarding-preview-img');
  const boardingTitleInput = document.getElementById('boarding-title');
  const boardingContentInput = document.getElementById('boarding-content');

  if (boardingImageInput) boardingImageInput.value = '';
  if (boardingTitleInput) boardingTitleInput.value = '';
  if (boardingContentInput) boardingContentInput.value = '';

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

  const boardingForm = document.getElementById('boarding-form');
  if (boardingForm) {
    (async function() {
      const data = await getCurrentSiteData();
      if (boardingTitleInput && data.boarding?.titulo) {
        boardingTitleInput.value = data.boarding.titulo;
      }
      if (boardingContentInput && data.boarding?.texto) {
        boardingContentInput.value = data.boarding.texto;
      }
      if (boardingImageInput && data.boarding?.imagen) {
        boardingImageInput.value = data.boarding.imagen;
        boardingPreviewImg.src = data.boarding.imagen;
      }
    })();

    boardingForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const title = boardingTitleInput?.value.trim();
      const content = boardingContentInput?.value.trim();
      const imageUrl = boardingImageInput?.value.trim();
      
      if (!title || !content || !imageUrl) {
        alert('Please fill in all fields');
        return;
      }
      
      const currentData = await getCurrentSiteData();
      currentData.boarding = {
        titulo: title,
        texto: content,
        imagen: imageUrl
      };
      await saveSiteData(currentData, 'Boarding updated');
    });
  }

  // =============================================
  // PUPPY - CORREGIDO
  // =============================================
  const puppyImageInput = document.getElementById('puppy-image-url');
  const puppyPreviewImg = document.getElementById('puppy-preview-img');
  const puppyTitleInput = document.getElementById('puppy-title');
  const puppyContentInput = document.getElementById('puppy-content');

  if (puppyImageInput) puppyImageInput.value = '';
  if (puppyTitleInput) puppyTitleInput.value = '';
  if (puppyContentInput) puppyContentInput.value = '';

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

  const puppyForm = document.getElementById('puppy-form');
  if (puppyForm) {
    (async function() {
      const data = await getCurrentSiteData();
      if (puppyTitleInput && data.puppy?.titulo) {
        puppyTitleInput.value = data.puppy.titulo;
      }
      if (puppyContentInput && data.puppy?.texto) {
        puppyContentInput.value = data.puppy.texto;
      }
      if (puppyImageInput && data.puppy?.imagen) {
        puppyImageInput.value = data.puppy.imagen;
        puppyPreviewImg.src = data.puppy.imagen;
      }
    })();

    puppyForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const title = puppyTitleInput?.value.trim();
      const content = puppyContentInput?.value.trim();
      const imageUrl = puppyImageInput?.value.trim();
      
      if (!title || !content || !imageUrl) {
        alert('Please fill in all fields');
        return;
      }
      
      const currentData = await getCurrentSiteData();
      currentData.puppy = {
        titulo: title,
        texto: content,
        imagen: imageUrl
      };
      await saveSiteData(currentData, 'Puppy Concierge updated');
    });
  }

  // =============================================
  // TRAINING VIDEOS
  // =============================================
  let trainingVideos = [];

  function renderVideos(filter = 'all') {
    const videosList = document.getElementById('videos-list');
    if (!videosList) return;

    videosList.innerHTML = '';

    const filteredVideos = filter === 'all' ? trainingVideos : trainingVideos.filter(v => v.categories?.includes(filter));

    if (filteredVideos.length === 0) {
      videosList.innerHTML = '<p class="no-videos">No videos added yet.</p>';
      return;
    }

    filteredVideos.forEach(video => {
      const div = document.createElement('div');
      div.className = 'video-item';
      div.innerHTML = `
        <video controls src="${video.url}" style="width:100%; height:150px; object-fit:cover;"></video>
        <div class="video-info">
          <h4>${video.title}</h4>
          <p>${video.description || ''}</p>
          <div class="video-categories">${video.categories?.join(', ') || ''}</div>
          <button class="delete-video" data-id="${video.id}">Delete</button>
        </div>
      `;
      videosList.appendChild(div);
    });

    document.querySelectorAll('.delete-video').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = parseInt(this.dataset.id);
        if (confirm('Delete this video?')) {
          trainingVideos = trainingVideos.filter(v => v.id !== id);
          renderVideos(filter);
          localStorage.setItem('training_videos_backup', JSON.stringify(trainingVideos));
          
          const currentData = await getCurrentSiteData();
          currentData.training_videos = trainingVideos;
          await saveSiteData(currentData, 'Video deleted');
        }
      });
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderVideos(this.dataset.filter);
    });
  });

  (async function loadVideos() {
    const data = await getCurrentSiteData();
    trainingVideos = data.training_videos || [];
    
    const backup = localStorage.getItem('training_videos_backup');
    if (backup && trainingVideos.length === 0) {
      try {
        trainingVideos = JSON.parse(backup);
      } catch (e) {}
    }
    
    renderVideos('all');
  })();

  const trainingForm = document.getElementById('training-video-form');
  if (trainingForm) {
    trainingForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const title = document.getElementById('video-title')?.value.trim();
      const url = document.getElementById('video-url')?.value.trim();
      const description = document.getElementById('video-description')?.value.trim() || '';
      const categories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);

      if (!title || !url) {
        alert('Please enter title and URL');
        return;
      }
      if (categories.length === 0) {
        alert('Select at least one category');
        return;
      }

      const newVideo = {
        id: Date.now(),
        title,
        url,
        description,
        categories
      };

      trainingVideos.push(newVideo);
      renderVideos('all');
      trainingForm.reset();

      localStorage.setItem('training_videos_backup', JSON.stringify(trainingVideos));
      
      const currentData = await getCurrentSiteData();
      currentData.training_videos = trainingVideos;
      await saveSiteData(currentData, 'Video added');
    });
  }

  // =============================================
  // USERS - Gestión de usuarios
  // =============================================
  
  let siteUsers = [];

  async function loadUsers() {
    try {
      const data = await getCurrentSiteData();
      siteUsers = data.users || [];
      
      if (siteUsers.length === 0) {
        siteUsers = [
          {
            id: 1,
            username: 'admin',
            password: 'leash2025',
            role: 'administrator',
            created: '2024-01-01'
          }
        ];
      }
      
      renderUsers();
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  function renderUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;

    container.innerHTML = `
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Password</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${siteUsers.map(user => `
            <tr>
              <td>${user.id}</td>
              <td>${user.username}</td>
              <td>
                <span class="password-mask">••••••••</span>
                <span class="password-text" style="display: none;">${user.password}</span>
                <button class="toggle-password-btn" onclick="togglePassword(this)">Show</button>
              </td>
              <td>${user.role}</td>
              <td>${user.created}</td>
              <td>
                <button class="delete-user-btn" data-id="${user.id}" ${user.role === 'administrator' ? 'disabled' : ''}>Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    window.togglePassword = function(btn) {
      const row = btn.closest('tr');
      const mask = row.querySelector('.password-mask');
      const text = row.querySelector('.password-text');
      
      if (mask.style.display !== 'none') {
        mask.style.display = 'none';
        text.style.display = 'inline';
        btn.textContent = 'Hide';
      } else {
        mask.style.display = 'inline';
        text.style.display = 'none';
        btn.textContent = 'Show';
      }
    };

    document.querySelectorAll('.delete-user-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = parseInt(this.dataset.id);
        if (confirm('Delete this user?')) {
          siteUsers = siteUsers.filter(u => u.id !== id);
          
          const currentData = await getCurrentSiteData();
          currentData.users = siteUsers;
          await saveSiteData(currentData, 'User deleted');
          renderUsers();
        }
      });
    });
  }

  const createUserForm = document.getElementById('create-user-form');
  if (createUserForm) {
    createUserForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const username = document.getElementById('new-username')?.value.trim();
      const password = document.getElementById('new-password')?.value.trim();

      if (!username || !password) {
        alert('Please enter username and password');
        return;
      }

      if (siteUsers.some(u => u.username === username)) {
        alert('Username already exists');
        return;
      }

      const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        role: 'editor',
        created: new Date().toISOString().split('T')[0]
      };

      siteUsers.push(newUser);

      const currentData = await getCurrentSiteData();
      currentData.users = siteUsers;
      await saveSiteData(currentData, 'User created');

      createUserForm.reset();
      renderUsers();
    });
  }

  // =============================================
  // EMAIL RECIPIENT
  // =============================================
  const configSection = document.getElementById('section-config');
  if (configSection && !document.getElementById('email-config-form')) {
    const emailField = document.createElement('div');
    emailField.className = 'sub-section';
    emailField.innerHTML = `
      <h3>Email Configuration</h3>
      <form id="email-config-form">
        <div class="form-group">
          <label>Contact Form Recipient Email</label>
          <input type="email" id="email-recipient" placeholder="shawn@leashtolegacy.org">
          <p class="note">All contact form messages will be sent to this email address</p>
        </div>
        <button type="submit">Save Email Settings</button>
      </form>
    `;
    configSection.appendChild(emailField);

    (async function() {
      const data = await getCurrentSiteData();
      document.getElementById('email-recipient').value = data.email_recipient || 'shawn@leashtolegacy.org';
    })();

    document.getElementById('email-config-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const currentData = await getCurrentSiteData();
      currentData.email_recipient = document.getElementById('email-recipient').value.trim() || 'shawn@leashtolegacy.org';
      await saveSiteData(currentData, 'Email recipient updated');
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
  loadUsers();
});
