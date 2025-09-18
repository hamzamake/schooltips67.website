// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Expand/Collapse tip details
document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const expandedContent = btn.nextElementSibling;
        const isActive = expandedContent.classList.contains('active');
        
        if (isActive) {
            expandedContent.classList.remove('active');
            btn.textContent = 'Learn More';
        } else {
            expandedContent.classList.add('active');
            btn.textContent = 'Show Less';
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all tip cards for scroll animations
document.querySelectorAll('.tip-card').forEach(card => {
    observer.observe(card);
});

// Add a progress indicator
function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 70px;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #4f46e5, #7c3aed);
        z-index: 1000;
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize progress bar
createProgressBar();

// Add typing effect to hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing effect when page loads
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero h1');
    const originalText = heroTitle.textContent;
    typeWriter(heroTitle, originalText, 80);
});

// Add some fun interactions
document.querySelectorAll('.tip-icon').forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.1) rotate(5deg)';
        icon.style.transition = 'transform 0.3s ease';
    });
    
    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Study timer feature (bonus)
function createStudyTimer() {
    const timerBtn = document.createElement('button');
    timerBtn.innerHTML = '<i class="fas fa-clock"></i> Study Timer';
    timerBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #4f46e5;
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 5px 20px rgba(79, 70, 229, 0.3);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    timerBtn.addEventListener('click', () => {
        alert('🍅 Pomodoro Timer: Study for 25 minutes, then take a 5-minute break!\n\nTip: Use the browser timer or download a dedicated Pomodoro app for the best experience.');
    });
    
    timerBtn.addEventListener('mouseenter', () => {
        timerBtn.style.transform = 'scale(1.05)';
        timerBtn.style.boxShadow = '0 8px 30px rgba(79, 70, 229, 0.4)';
    });
    
    timerBtn.addEventListener('mouseleave', () => {
        timerBtn.style.transform = 'scale(1)';
        timerBtn.style.boxShadow = '0 5px 20px rgba(79, 70, 229, 0.3)';
    });
    
    document.body.appendChild(timerBtn);
}

// Initialize study timer
createStudyTimer();