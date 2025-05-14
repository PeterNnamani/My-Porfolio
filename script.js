document.addEventListener('DOMContentLoaded', function() {
  // Mobile Menu Toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
  });
  
  // Close mobile menu when clicking on a link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
          mobileMenu.classList.add('hidden');
      });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Portfolio Filtering
  const portfolioFilters = document.querySelectorAll('.portfolio-filter');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  
  portfolioFilters.forEach(filter => {
      filter.addEventListener('click', function() {
          // Remove active class from all filters
          portfolioFilters.forEach(f => {
              f.classList.remove('bg-primary', 'text-white');
              f.classList.add('text-gray-700');
          });
          
          // Add active class to clicked filter
          this.classList.add('bg-primary', 'text-white');
          this.classList.remove('text-gray-700');
          
          const filterValue = this.getAttribute('data-filter');
          
          // Show/hide portfolio items based on filter
          portfolioItems.forEach(item => {
              if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                  item.style.display = 'block';
              } else {
                  item.style.display = 'none';
              }
          });
      });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Counter Animation
  const counters = document.querySelectorAll('.counter-value');
  const speed = 200;
  
  const animateCounters = () => {
      counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const count = +counter.innerText;
          
          const inc = target / speed;
          
          if (count < target) {
              counter.innerText = Math.ceil(count + inc);
              setTimeout(animateCounters, 1);
          } else {
              counter.innerText = target.toLocaleString();
          }
      });
  };
  
  // Start animation when counters are in viewport
  const counterSection = document.querySelector('.counter-value').closest('section');
  
  const checkIfInView = () => {
      const rect = counterSection.getBoundingClientRect();
      const isInViewport = rect.top <= window.innerHeight && rect.bottom >= 0;
      
      if (isInViewport) {
          animateCounters();
          window.removeEventListener('scroll', checkIfInView);
      }
  };
  
  window.addEventListener('scroll', checkIfInView);
  checkIfInView(); // Check on page load
});

document.addEventListener('DOMContentLoaded', function() {
  // Back to Top Button
  const backToTopButton = document.getElementById('backToTop');
  
  const toggleBackToTopButton = () => {
      if (window.pageYOffset > 300) {
          backToTopButton.classList.add('visible');
      } else {
          backToTopButton.classList.remove('visible');
      }
  };
  
  window.addEventListener('scroll', toggleBackToTopButton);
  
  backToTopButton.addEventListener('click', function() {
      window.scrollTo({
          top: 0,
          behavior: 'smooth'
      });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Project Modal
  const projectModal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');
  
  window.openModal = function(projectId) {
      // Project data (in a real app, this would come from a database or API)
      const projects = {
          'project1': {
              title: 'FashionHub E-commerce',
              image: 'https://readdy.ai/api/search-image?query=modern%2520e-commerce%2520website%2520interface%2520with%2520clean%2520design%2520showing%2520product%2520grid%2520layout%2520with%2520clothing%2520items%2520on%2520white%2520background%2520professional%2520web%2520design%2520with%2520clear%2520navigation%2520and%2520shopping%2520cart%2520icon&width=800&height=500&seq=11&orientation=landscape',
              description: 'A full-featured React e-commerce platform with product filtering, cart management, and payment integration. This project focuses on delivering a seamless shopping experience with fast page loads and intuitive navigation.',
              technologies: ['React', 'Redux', 'Node.js', 'Express', 'MongoDB', 'Stripe API'],
              features: [
                  'Advanced product filtering and search',
                  'User authentication and profiles',
                  'Shopping cart and wishlist functionality',
                  'Secure payment processing',
                  'Order tracking and history',
                  'Admin dashboard for inventory management'
              ],
              client: 'FashionHub Inc.',
              date: 'January 2025',
              link: '#'
          },
          'project2': {
              title: 'FitTrack Mobile App',
              image: 'https://readdy.ai/api/search-image?query=fitness%2520mobile%2520app%2520interface%2520showing%2520workout%2520tracking%2520screen%2520with%2520exercise%2520statistics%2520and%2520progress%2520charts%2520clean%2520modern%2520UI%2520design%2520with%2520blue%2520accent%2520colors%2520on%2520dark%2520background&width=800&height=500&seq=12&orientation=landscape',
              description: 'A React Native fitness tracking application with workout plans, progress tracking, and social features. The app helps users stay motivated and achieve their fitness goals through personalized workout routines and progress visualization.',
              technologies: ['React Native', 'Firebase', 'GraphQL', 'Apollo Client', 'Expo', 'D3.js'],
              features: [
                  'Personalized workout plans',
                  'Exercise tracking with form guidance',
                  'Progress visualization with charts',
                  'Social sharing and challenges',
                  'Integration with fitness wearables',
                  'Offline functionality'
              ],
              client: 'FitTech Solutions',
              date: 'November 2024',
              link: '#'
          },
          'project3': {
              title: 'FinTech Dashboard',
              image: 'https://readdy.ai/api/search-image?query=banking%2520dashboard%2520interface%2520with%2520financial%2520analytics%2520charts%2520account%2520balance%2520information%2520and%2520transaction%2520history%2520clean%2520professional%2520UI%2520design%2520with%2520data%2520visualization%2520elements%2520light%2520theme&width=800&height=500&seq=13&orientation=landscape',
              description: 'A comprehensive financial dashboard with data visualization, account management, and transaction tracking. This platform provides users with insights into their financial health through intuitive visualizations and powerful analytics tools.',
              technologies: ['React', 'D3.js', 'Material UI', 'Node.js', 'Express', 'PostgreSQL'],
              features: [
                  'Real-time financial data visualization',
                  'Transaction categorization and analysis',
                  'Budget planning and tracking',
                  'Investment portfolio management',
                  'Expense forecasting',
                  'Secure multi-factor authentication'
              ],
              client: 'Global Finance Group',
              date: 'March 2025',
              link: '#'
          },
          'project4': {
              title: 'PropertyFinder Portal',
              image: 'https://readdy.ai/api/search-image?query=real%2520estate%2520property%2520listing%2520website%2520interface%2520showing%2520property%2520cards%2520with%2520images%2520and%2520details%2520search%2520filters%2520and%2520map%2520integration%2520clean%2520modern%2520web%2520design%2520with%2520white%2520background%2520and%2520blue%2520accents&width=800&height=500&seq=14&orientation=landscape',
              description: 'A real estate platform with property listings, advanced search filters, and interactive map integration. The platform connects property buyers with sellers and provides comprehensive information to facilitate informed decision-making.',
              technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'Google Maps API', 'AWS S3'],
              features: [
                  'Advanced property search with multiple filters',
                  'Interactive map with property pins',
                  'Virtual property tours',
                  'Mortgage calculator',
                  'Saved searches and favorites',
                  'Agent messaging system'
              ],
              client: 'PropertyFinder LLC',
              date: 'February 2025',
              link: '#'
          },
          'project5': {
              title: 'QuickBite Delivery App',
              image: 'https://readdy.ai/api/search-image?query=food%2520delivery%2520mobile%2520app%2520interface%2520showing%2520restaurant%2520listings%2520with%2520food%2520images%2520menu%2520items%2520and%2520ordering%2520process%2520clean%2520modern%2520UI%2520design%2520with%2520orange%2520accent%2520colors%2520on%2520white%2520background&width=800&height=500&seq=15&orientation=landscape',
              description: 'A food delivery application with restaurant browsing, order tracking, and payment processing. The app connects users with local restaurants and provides a seamless ordering experience with real-time delivery tracking.',
              technologies: ['React Native', 'Redux Toolkit', 'Firebase', 'Stripe', 'Google Maps API', 'Node.js'],
              features: [
                  'Restaurant discovery and menu browsing',
                  'Real-time order tracking',
                  'Multiple payment options',
                  'Scheduled deliveries',
                  'In-app chat with delivery personnel',
                  'Order history and reordering'
              ],
              client: 'QuickBite Technologies',
              date: 'December 2024',
              link: '#'
          },
          'project6': {
              title: 'TaskFlow Management',
              image: 'https://readdy.ai/api/search-image?query=project%2520management%2520dashboard%2520interface%2520showing%2520task%2520boards%2520project%2520timelines%2520and%2520team%2520collaboration%2520features%2520clean%2520modern%2520UI%2520design%2520with%2520data%2520visualization%2520elements%2520light%2520theme%2520with%2520blue%2520accents&width=800&height=500&seq=16&orientation=landscape',
              description: 'A project management tool with task boards, time tracking, and team collaboration features. The platform helps teams stay organized, track progress, and collaborate effectively on projects of any size.',
              technologies: ['React', 'Socket.io', 'MongoDB', 'Express', 'Node.js', 'JWT'],
              features: [
                  'Kanban and list views for tasks',
                  'Time tracking and reporting',
                  'Team collaboration and commenting',
                  'File sharing and version control',
                  'Automated workflows',
                  'Integration with popular tools (Slack, GitHub)'
              ],
              client: 'TaskFlow Systems',
              date: 'April 2025',
              link: '#'
          }
      };
      
      const project = projects[projectId];
      
      if (project) {
          // Populate modal content
          modalContent.innerHTML = `
              <div class="flex justify-between items-center mb-6">
                  <h3 class="text-2xl font-bold">${project.title}</h3>
                  <button class="text-gray-500 hover:text-gray-700" onclick="closeModal()">
                      <i class="ri-close-line ri-2x"></i>
                  </button>
              </div>
              <div class="mb-6">
                  <img src="${project.image}" alt="${project.title}" class="w-full h-auto rounded-lg">
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div class="md:col-span-2">
                      <h4 class="text-xl font-semibold mb-4">Project Overview</h4>
                      <p class="text-gray-700 mb-6">${project.description}</p>
                      
                      <h4 class="text-xl font-semibold mb-4">Key Features</h4>
                      <ul class="list-disc pl-5 text-gray-700 mb-6 space-y-2">
                          ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                      </ul>
                  </div>
                  <div>
                      <div class="bg-gray-50 p-6 rounded-lg">
                          <h4 class="text-xl font-semibold mb-4">Project Details</h4>
                          
                          <div class="mb-4">
                              <h5 class="font-medium text-gray-900">Client</h5>
                              <p class="text-gray-700">${project.client}</p>
                          </div>
                          
                          <div class="mb-4">
                              <h5 class="font-medium text-gray-900">Date</h5>
                              <p class="text-gray-700">${project.date}</p>
                          </div>
                          
                          <div class="mb-6">
                              <h5 class="font-medium text-gray-900">Technologies</h5>
                              <div class="flex flex-wrap gap-2 mt-2">
                                  ${project.technologies.map(tech => `
                                      <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">${tech}</span>
                                  `).join('')}
                              </div>
                          </div>
                          
                          <a href="${project.link}" class="bg-primary text-white px-6 py-2 !rounded-button whitespace-nowrap hover:bg-blue-600 transition-colors inline-block w-full text-center">View Live Project</a>
                      </div>
                  </div>
              </div>
          `;
          
          // Show modal
          projectModal.classList.remove('hidden');
          document.body.style.overflow = 'hidden'; // Prevent scrolling
      }
  };
  
  window.closeModal = function() {
      projectModal.classList.add('hidden');
      document.body.style.overflow = ''; // Re-enable scrolling
  };
  
  // Close modal when clicking outside
  projectModal.addEventListener('click', function(e) {
      if (e.target === projectModal) {
          closeModal();
      }
  });
  
  // Close modal on ESC key
  document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !projectModal.classList.contains('hidden')) {
          closeModal();
      }
  });
});

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
              window.scrollTo({
                  top: targetElement.offsetTop - 80, // Adjust for header height
                  behavior: 'smooth'
              });
          }
      });
  });
});

// Contact form submission using EmailJS
document.addEventListener('DOMContentLoaded', function () {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js';
    script.onload = function () {
        emailjs.init('N3kN7OWGID6l2hxsI'); // <-- Your EmailJS public key
    };
    document.body.appendChild(script);

    const contactForm = document.getElementById('contactForm');
    const feedback = document.getElementById('contactFormFeedback');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            feedback.textContent = 'Sending...';
            feedback.className = 'mt-2 text-sm text-gray-500';

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Replace these with your EmailJS service/template IDs
            const serviceID = 'service_5c7dbcf'; // your actual service ID
            const templateID = 'template_pi624hk'; // your actual template ID

            emailjs.send(serviceID, templateID, {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message,
                to_email: 'peternnamani001@gmail.com'
            })
            .then(() => {
                feedback.textContent = 'Message sent successfully!';
                feedback.className = 'mt-2 text-sm text-green-600';
                contactForm.reset();
            }, (error) => {
                feedback.textContent = 'Failed to send message. Please try again later.';
                feedback.className = 'mt-2 text-sm text-red-600';
                console.error('EmailJS error:', error);
            });
        });
    }
});

// Newsletter subscription
document.getElementById('subscribeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('subscribeEmail').value;

    try {
        const response = await fetch('http://localhost:3000/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            alert('Subscribed successfully!');
        } else {
            alert('Failed to subscribe.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred.');
    }
});