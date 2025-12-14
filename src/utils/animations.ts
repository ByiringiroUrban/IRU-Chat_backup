// Animation utilities for smooth transitions and effects

export const animationClasses = {
  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-slide-up',
  fadeInLeft: 'animate-slide-in-left',
  fadeInRight: 'animate-slide-in-right',
  
  // Scale animations
  scaleIn: 'animate-scale-in',
  bounceIn: 'animate-bounce-in',
  
  // Hover effects
  hoverScale: 'transition-all duration-300 ease-out transform hover:scale-[1.02] active:scale-[0.98]',
  hoverLift: 'transition-all duration-300 ease-out transform hover:-translate-y-1 hover:shadow-lg',
  hoverGlow: 'transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  
  // Button animations
  buttonPress: 'transition-all duration-200 ease-out active:scale-95',
  buttonHover: 'transition-all duration-300 ease-out hover:scale-105 hover:shadow-md',
  
  // Card animations
  cardHover: 'transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-xl',
  cardEnter: 'animate-slide-up',
  
  // Message animations
  messageSlide: 'animate-slide-in-right',
  messageFade: 'animate-fade-in',
  
  // Stagger delays
  stagger: (index: number, delay: number = 50) => ({
    style: { animationDelay: `${index * delay}ms` }
  })
};

export const getStaggerDelay = (index: number, delay: number = 50) => ({
  style: { animationDelay: `${index * delay}ms` }
});

