// Intersection Observer for fade-in animations
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle functionality
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  // Function to set theme
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update icon based on theme
    if (theme === 'light') {
      themeIcon.src = 'assets/moon.svg';
    } else {
      themeIcon.src = 'assets/sun.svg';
    }
  };
  
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(prefersDark ? 'dark' : 'light');
  }
  
  // Toggle theme when button is clicked
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
  
  // Detect mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Animate sections when they come into view
  const sections = document.querySelectorAll('section');
  const navDots = document.querySelectorAll('.nav-dot');
  let isScrolling = false;
  
  // Update active navigation dot based on current section
  const updateActiveDot = (sectionId) => {
    navDots.forEach(dot => {
      dot.classList.remove('active');
      if (dot.getAttribute('href') === `#${sectionId}`) {
        dot.classList.add('active');
      }
    });
  };
  
  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    // Small delay to allow the browser to complete orientation change
    setTimeout(() => {
      // Force a re-calculation of section heights
      sections.forEach(section => {
        section.style.height = window.innerHeight + 'px';
      });
      
      // Adjust navigation dots position for landscape mode
      const isLandscape = window.innerWidth > window.innerHeight;
      const navDotsContainer = document.querySelector('.navigation-dots');
      
      if (isLandscape && window.innerWidth < 812) {
        navDotsContainer.style.flexDirection = 'row';
        navDotsContainer.style.right = '50%';
        navDotsContainer.style.top = 'auto';
        navDotsContainer.style.bottom = '1rem';
        navDotsContainer.style.transform = 'translateX(50%)';
      } else {
        navDotsContainer.style.flexDirection = '';
        navDotsContainer.style.right = '';
        navDotsContainer.style.top = '';
        navDotsContainer.style.bottom = '';
        navDotsContainer.style.transform = '';
      }
    }, 300);
  });
  
  // Handle smooth scrolling for navigation dots
  navDots.forEach(dot => {
    dot.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        isScrolling = true;
        
        // Update active dot
        updateActiveDot(targetId.substring(1));
        
        // Force section visibility and animations before scrolling
        targetSection.classList.add('visible');
        const children = targetSection.querySelectorAll('h1, p, div:not(.auto-blur), .contact-button, .btn');
        children.forEach((child, index) => {
          // Remove the animate class first to reset the animation
          child.classList.remove('animate');
          // Force a reflow
          void child.offsetWidth;
          // Add the animate class
          child.classList.add('animate');
        });
        
        // Handle blur elements if they exist in this section
        const blurElements = targetSection.querySelectorAll('.auto-blur');
        if (blurElements.length > 0) {
          blurElements.forEach((element, index) => {
            element.classList.remove('animate');
            void element.offsetWidth;
            setTimeout(() => {
              element.classList.add('animate');
            }, 100 * (index + 1));
          });
        }
        
        // Apply text scramble if heading exists
        const heading = targetSection.querySelector('h1');
        if (heading) {
          const headingId = targetSection.id || Math.random().toString(36).substring(2, 9);
          const text = headingTexts[headingId] || heading.textContent;
          const fx = new TextScramble(heading);
          fx.setText(text);
        }
        
        // Scroll to the section
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // Reset scrolling flag after animation completes
        setTimeout(() => {
          isScrolling = false;
        }, 1000);
      }
    });
  });
  
  // Special observer for the blur elements section
  const blurElementsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const blurElements = entry.target.querySelectorAll('.auto-blur');
      
      if (entry.isIntersecting) {
        // When section comes into view, animate blur elements with minimal delay
        blurElements.forEach((element, index) => {
          // Remove the animate class first to reset the animation
          element.classList.remove('animate');
          
          // Force a reflow to ensure the animation restarts
          void element.offsetWidth;
          
          // Add the animate class with staggered delay
          setTimeout(() => {
            element.classList.add('animate');
          }, 100 * (index + 1));
        });
      } else {
        // When section leaves view, remove animation class after a short delay
        setTimeout(() => {
          blurElements.forEach(element => {
            element.classList.remove('animate');
          });
        }, 300);
      }
    });
  }, { threshold: 0.1, rootMargin: '0% 0% -10% 0%' });
  
  // Apply blur observer to the section containing blur elements
  const blurSection = document.getElementById('change');
  if (blurSection) {
    blurElementsObserver.observe(blurSection);
  }
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const sectionId = entry.target.getAttribute('id');
      
      if (entry.isIntersecting && !isScrolling) {
        // Update active navigation dot
        updateActiveDot(sectionId);
        entry.target.classList.add('visible');
        
        // Add a staggered animation to children (excluding auto-blur elements)
        const children = entry.target.querySelectorAll('h1, p, div:not(.auto-blur), .contact-button, .btn');
        children.forEach((child, index) => {
          // Remove the animate class first to reset the animation
          child.classList.remove('animate');
          
          // Force a reflow to ensure the animation restarts
          void child.offsetWidth;
          
          // Add the animate class after a short delay
          setTimeout(() => {
            child.classList.add('animate');
          }, 50 * index);
        });
      } else if (!entry.isIntersecting) {
        // When section is out of view, remove animation classes to prepare for next view
        const children = entry.target.querySelectorAll('h1, p, div:not(.auto-blur), .contact-button, .btn');
        // Don't remove immediately, give some buffer time
        setTimeout(() => {
          if (!entry.target.classList.contains('visible')) return;
          children.forEach(child => {
            child.classList.remove('animate');
          });
          entry.target.classList.remove('visible');
        }, 500);
      }
    });
  }, { threshold: 0.2, rootMargin: '0% 0% -5% 0%' });
  
  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Text scramble effect for headings
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }
    
    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise(resolve => this.resolve = resolve);
      this.queue = [];
      
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        this.queue.push({ from, to, start, end });
      }
      
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    
    update() {
      let output = '';
      let complete = 0;
      
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="dud">${char}</span>`;
        } else {
          output += from;
        }
      }
      
      this.el.innerHTML = output;
      
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
    
    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  // Apply text scramble to headings when they come into view
  const headings = document.querySelectorAll('h1');
  const headingTexts = {}; // Store original text content
  
  headings.forEach(heading => {
    // Store the original text for each heading
    const originalText = heading.textContent;
    const headingId = heading.parentElement.id || Math.random().toString(36).substring(2, 9);
    headingTexts[headingId] = originalText;
    
    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Get the original text for this heading
          const text = headingTexts[headingId];
          const fx = new TextScramble(heading);
          fx.setText(text);
          // Don't unobserve, so it will replay when scrolling back
        }
      });
    }, { threshold: 0.5 });
    
    headingObserver.observe(heading);
  });

  // Parallax effect for sections
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    sections.forEach((section, index) => {
      const speed = 0.05;
      const yPos = -(scrollY * speed * (index * 0.1 + 1));
      section.style.backgroundPosition = `center ${yPos}px`;
    });
  });

  // Cursor effect
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Add hover effect to interactive elements
  const interactiveElements = document.querySelectorAll('h1, .auto-blur');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-grow');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-grow');
    });
  });
});
