
(function() {
  'use strict';

  // Configuration
  const config = {
    observerOptions: {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.1
    },
    defaultDuration: 0.8,
    defaultStagger: 0.1,
    defaultEase: 'power2.out'
  };

  // Accessibility: Animation classification for reduced motion preference
  // Determines how each animation type should behave when user prefers reduced motion
  const animationAccessibility = {
    // ESSENTIAL: Always run (functional, not decorative)
    essential: ['sync', 'switch', 'anchor', 'anchorbottom', '3d'],

    // SUBTLE: Minimal motion, can optionally preserve with instant completion
    subtle: ['fadeIn', 'fadeUp', 'reveal'],

    // COMPLEX: Significant motion, should be disabled/instant-completed
    complex: [
      'parallax', 'rotate', 'tilt', 'swapmove', 'circular-scroll', 'pathgallery',
      'splitText', 'splitWords', 'splitLines',
      'slideInLeft', 'slideInRight', 'slideInUp',
      'slideOutUp', 'slideOutDown', 'slideOutRight', 'slideOutLeft',
      'scaleIn', 'scaleDown', 'stagger', 'flip', 'draw',
      'hgallery', 'turnleft90-scroll'
    ],

    // INTERACTIVE: Reduce but don't eliminate (simplify effects)
    interactive: ['draggable', 'momentum']
  };

  // Global reduced motion flag
  let reducedMotionEnabled = false;

  // Animation-specific parameter configurations
  // Define which parameters each animation accepts and their defaults
  const animationParams = {
    // Text animations with extensive customization
    splitText: {
      duration: 0.8,
      stagger: 0.02,  // Time between each character
      ease: 'power3.out',
      rotationX: -90,
      y: 20,
      transformOrigin: '0% 50% -50',
      delay: 0,
      scrub: false,  // Can be true, false, or number (smooth scrub)
      start: 'top 80%',  // When to start the animation
      end: 'bottom 20%'  // When to end the animation
    },
    splitWords: {
      duration: 0.8,
      stagger: 0.05,  // Time between each word
      ease: 'power2.out',
      y: 30,
      skewY: 5,
      delay: 0,
      scrub: false,  // Can be true, false, or number (smooth scrub)
      start: 'top 80%',  // When to start the animation
      end: 'bottom 20%'  // When to end the animation
    },
    splitLines: {
      duration: 0.8,
      stagger: 0.05,  // Time between each line
      ease: 'expo.out',
      yPercent: 110,  // Use percentage for better scaling
      delay: 0,
      scrub: false,  // Can be true, false, or number (smooth scrub)
      start: 'top 80%',  // When to start the animation
      end: 'bottom 20%'  // When to end the animation
    },
    
    // Basic animations with limited customization
    fadeUp: {
      duration: 0.8,
      ease: 'power2.out',
      y: 50,
      delay: 0
    },
    fadeIn: {
      duration: 0.8,
      ease: 'power2.out',
      delay: 0
    },
    slideInLeft: {
      duration: 0.8,
      ease: 'power2.out',
      distance: 100,  // How far to slide from
      delay: 0,
      scrub: 1,  // Enable scrubbing by default (scroll-based animation)
      start: 'top 80%',  // ScrollTrigger start position
      end: 'bottom 20%'   // ScrollTrigger end position
    },
    slideInRight: {
      duration: 0.8,
      ease: 'power2.out',
      distance: 100,  // How far to slide from
      delay: 0,
      scrub: 1,  // Enable scrubbing by default (scroll-based animation)
      start: 'top 80%',  // ScrollTrigger start position
      end: 'bottom 20%'   // ScrollTrigger end position
    },
    slideInUp: {
      duration: 0.8,
      ease: 'power2.out',
      distance: 150,  // How far to slide from
      delay: 0,
      speed: 1,  // Speed multiplier (1 = normal, 2 = twice as fast, 0.5 = half speed)
      scrub: false,  // Disable scrubbing by default (time-based animation)
      start: 'top 95%',  // ScrollTrigger start position (when scrub is enabled)
      end: 'bottom 20%'   // ScrollTrigger end position (when scrub is enabled)
    },
    slideOutUp: {
      duration: 0.8,
      ease: 'power2.out',
      distance: '120%',  // How far to slide out
      delay: 0,
      scrub: 1,  // Enable scrubbing by default
      start: 'top 0%',  // ScrollTrigger start position
      end: 'bottom 50%'   // ScrollTrigger end position
    },
    slideOutDown: {
      duration: 0.8,
      ease: 'power2.out',
      distance: '120%',  // How far to slide out
      delay: 0,
      scrub: 1,  // Enable scrubbing by default
      start: 'top 0%',  // ScrollTrigger start position
      end: 'bottom 50%'   // ScrollTrigger end position
    },
    scaleIn: {
      duration: 0.8,
      ease: 'power2.out',
      scale: 0.8,  // Starting scale (0-1)
      delay: 0,
      scrub: true,  // Enable scrubbing by default
      start: 'top 50%',  // ScrollTrigger start position
      end: 'bottom 20%'   // ScrollTrigger end position
    },
    scaleDown: {
      duration: 0.8,
      ease: 'power2.out',
      scale: 1.5,  // Starting scale (greater than 1)
      delay: 0,
      scrub: true,  // Enable scrubbing by default
      start: 'top 80%',  // ScrollTrigger start position
      end: 'bottom 20%'   // ScrollTrigger end position
    },
    
    // Container animations
    stagger: {
      duration: 0.8,
      stagger: 0.1,  // Time between each item
      ease: 'power2.out',
      y: 30,
      delay: 0,
      from: 'start'  // 'start', 'end', 'center', 'edges'
    },
    
    // ScrollTrigger animations
    parallax: {
      speed: 1,
      offset: 20,
      direction: 'y'  // 'y', 'x', or 'both'
    },
    
    // 3D animations
    reveal: {
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      y: 50,
      rotationX: -10,
      perspective: 1000,
      delay: 0
    },
    
    // Flip animation
    flip: {
      scrub: 0.25,
      scale: true,
      absolute: true,
      preserveAspectRatio: true, // Prevent stretching/squeezing
      start: 'center center',
      end: 'center center',
      markers: false
    },
    
    // Slide out animations
    slideOutRight: {
      duration: 0.8,
      ease: 'power2.in',
      delay: 0,
      distance: '120%' // How far to slide out
    },
    slideOutLeft: {
      duration: 0.8,
      ease: 'power2.in',
      delay: 0,
      distance: '120%' // How far to slide out
    },
    
    // Rotation animation (scroll-based)
    rotate: {
      scrub: 1,
      rotation: 360, // Total rotation degrees
      ease: 'none',
      start: 'top bottom',
      end: 'bottom top'
    },

    // Turn left 90 degrees animation (scroll-based with pinning)
    'turnleft90-scroll': {
      scrub: 1,
      rotation: -90, // Rotate counter-clockwise by 90 degrees
      ease: 'none',
      start: 'top 80%',
      end: 'bottom 20%',
      pin: true, // Pin the nearest .content-wrapper during animation
      startClass: 'startturn', // Class on body at start (removed when rotation starts)
      midClass: 'midturn', // Class on body during rotation (between 0% and 100%)
      endClass: 'endturn' // Class to add to body when animation completes
    },
    
    // Tilt animation (hover-based)
    tilt: {
      perspective: 1000,
      maxTilt: 15, // Maximum tilt angle
      scale: 1.05, // Scale on hover
      speed: 300, // Transition speed in ms
      easing: 'cubic-bezier(.03,.98,.52,.99)'
    },
    
    // DrawSVG animation (section-level, scroll-based)
    draw: {
      duration: 2,
      stagger: 0.2, // Time between each path animation
      ease: 'power3.Out',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: 1,
      drawFrom: '0%', // Starting point of draw
      drawTo: '100%', // Ending point of draw
      fromCenter: false, // Draw from center outward
      markers: false
    },
    
    // Horizontal gallery animation (section-level, scroll-based)
    hgallery: {
      duration: 3,
      ease: 'none',
      start: 'top 20%', // When to start pinning
      scrub: 2, // Smooth scrubbing value
      pin: true, // Pin the gallery during scroll
      markers: false
    },
    
    // Path gallery animation (curved motion, section-level, scroll-based)
    pathgallery: {
      duration: 4,
      ease: 'none',
      start: 'top 20%', // When to start pinning
      scrub: 2, // Smooth scrubbing value
      pin: true, // Pin the gallery during scroll
      curveHeight: 150, // Maximum height of the curve in pixels
      curveType: 'arc', // Type of curve: 'arc', 'wave', 'bounce'
      stagger: 0.1, // Delay between each item's movement
      autoRotate: false, // Whether items rotate along the path
      markers: false
    },

    // Switch animation (image switching based on text in viewport)
    switch: {
      transitionDuration: 0.6, // Duration of image fade transition
      rootMargin: '-50% 0% -50% 0%', // When to trigger the switch (at viewport center)
      layout: 'split', // Layout type: 'split' or 'overlay'
      imagePosition: 'left', // Image position: 'left' or 'right'
      mobileBreakpoint: 767 // Breakpoint for mobile layout
    },

    // Draggable animation (makes elements draggable)
    draggable: {
      type: 'x,y', // Type of dragging: 'x', 'y', 'x,y', or 'rotation'
      bounds: 'section', // Bounds: 'section' (parent section), 'window', selector, or {top, left, width, height}
      inertia: true, // Enable momentum/inertia when released
      throwProps: true, // Enable throwing with momentum
      edgeResistance: 0.65, // Resistance when dragging past bounds (0-1)
      dragResistance: 0, // Overall drag resistance (0-1)
      zIndexBoost: true, // Bring element to front while dragging
      cursor: 'grab', // Cursor style
      activeCursor: 'grabbing', // Cursor while dragging
      allowContextMenu: false, // Disable right-click menu
      allowNativeTouchScrolling: false, // Disable to prevent scroll conflicts on drag elements
      touchActionNone: true, // Set touch-action: none for better touch handling
      smoothTouch: true // Enable smooth touch dragging
    },

    // Momentum animation (hover-based inertia effect)
    momentum: {
      velocityMultiplier: 30, // How much to amplify the movement velocity
      rotateRange: 15, // Maximum rotation range (will be random between -range and +range)
      duration: 0.4, // Duration of rotation animation
      timeScale: 1.2, // Animation speed multiplier
      ease: 'power1.inOut' // Easing function for rotation
    },

    // 3D Carousel animation (scroll-based rotation)
    '3d': {
      radius: 520, // Distance from center in px (increased for better spacing)
      rotationSpeed: 1, // Rotation multiplier for scroll
      perspective: 1200, // CSS perspective value
      autoRotate: false, // Whether to auto-rotate when not scrolling
      autoRotateSpeed: 20, // Duration of one full rotation in seconds
      ease: 'none', // Easing for scroll-based rotation
      scrollDistance: 3000, // Pixels of scroll for full rotation
      enableDrag: false, // Enable drag interaction (requires Draggable plugin)
      dragResistance: 3000, // Distance to drag for full rotation
      itemWidth: 300, // Fixed width for list items in pixels
      itemHeight: 'auto' // Fixed height or 'auto'
    },

    // Swapmove animation (mouse/scroll-based image swapping with movement)
    swapmove: {
      movementThreshold: 300, // Amount of movement needed to swap images
      rotationScale: 0.25, // Rotation sensitivity
      followSpeed: 1, // Mouse follow speed
      parallaxScale: 8, // Parallax movement scale for slides
      easeDuration: 1, // Ease duration for movements
      resetDelay: 66, // Delay before resetting position (ms)
      trigger: 'mousemove', // 'mousemove' or 'scroll'
      scrollMultiplier: 2, // Multiplier for scroll-based virtual mouse movement
      containerScale: 0.2, // Scale factor for container movement (0.2 = 20% of viewport)
      perspective: 1000 // Perspective for 3D effect
    },

    // Sync animation (show/hide blocks based on other blocks in viewport)
    sync: {
      rootMargin: '-40% 0px -40% 0px', // When to consider a block "in view" (middle 20% of viewport)
      transitionDuration: 0.4, // Duration for fade in/out transitions
      ease: 'power2.inOut' // Easing for transitions
    },

    // Anchor animation (moves element to fixed position)
    anchor: {
      duration: 0.8, // Duration of the transition
      ease: 'power2.inOut',
      start: 'center top', // When element center reaches viewport top
      end: '+=300', // Complete 300px after start
      position: 'bottom-right', // Target position
      offsetX: 20, // Offset from right edge in pixels
      offsetY: 20, // Offset from bottom edge in pixels
      scrub: 1, // Smooth scrub
      scale: 1, // Final scale of element
      opacity: 1 // Final opacity
    },

    // Anchorbottom animation (Flip-based smooth transition to bottom-right)
    anchorbottom: {
      duration: 0.6, // Duration of the Flip animation
      ease: 'power2.inOut',
      start: 'center top', // When element center reaches viewport top
      end: '+=300', // Complete 300px after start
      offsetX: 20, // Offset from right edge in pixels
      offsetY: 20, // Offset from bottom edge in pixels
      scrub: 1, // Smooth scrub
      scale: 1, // Final scale of element
      opacity: 1 // Final opacity
    }
  };

  // Animation Registry
  const animations = {
    // Block-level animations (triggered by href="#animationType-scroll")
    splitText: {
      init: (element) => {
        const headings = element.querySelectorAll('h1, h2, h3');
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        headings.forEach(heading => {
          // Skip if already initialized
          if (heading.classList.contains('split-text-initialized')) return;
          
          // Use GSAP SplitText plugin
          const split = new SplitText(heading, { 
            type: 'words,chars',
            wordsClass: 'split-word',
            charsClass: 'split-char'
          });
          
          // Store split instance for cleanup
          heading._splitInstance = split;
          heading.classList.add('split-text-initialized');
          
          // Set initial state with custom parameters
          gsap.set(split.chars, {
            opacity: 0,
            y: customConfig.y || 20,
            rotationX: customConfig.rotationX || -90,
            transformOrigin: customConfig.transformOrigin || '0% 50% -50'
          });
        });
      },
      animate: (element) => {
        const headings = element.querySelectorAll('.split-text-initialized');
        const timelines = [];
        
        // Get custom config if present
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        headings.forEach(heading => {
          if (heading._splitInstance) {
            // Build ScrollTrigger config if scrub or replay is enabled
            let tlConfig = {};

            if (customConfig.scrub !== undefined || customConfig.replay) {
              tlConfig.scrollTrigger = {
                trigger: element,
                start: customConfig.start || "top 80%",
                end: customConfig.end || "bottom 20%",
                markers: customConfig.markers || false
              };

              // Add scrub if specified (can be boolean or number)
              if (customConfig.scrub !== undefined) {
                tlConfig.scrollTrigger.scrub = customConfig.scrub;
              } else if (customConfig.replay) {
                // Use toggleActions for replay mode without scrub
                tlConfig.scrollTrigger.toggleActions = "play pause resume reset";
              }
            }

            const tl = gsap.timeline(tlConfig)
              .to(heading._splitInstance.chars, {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: customConfig.duration || config.defaultDuration,
                stagger: customConfig.stagger || 0.02,
                ease: customConfig.ease || 'power3.out',
                delay: customConfig.delay || 0
              });
            timelines.push(tl);
          }
        });
        
        return timelines.length > 1 ? gsap.timeline().add(timelines) : timelines[0];
      }
    },
    
    splitWords: {
      init: (element) => {
        const textElements = element.querySelectorAll('h1, h2, h3, p');
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        textElements.forEach(el => {
          if (el.classList.contains('split-words-initialized')) return;
          
          const split = new SplitText(el, { 
            type: 'words',
            wordsClass: 'split-word'
          });
          
          el._splitInstance = split;
          el.classList.add('split-words-initialized');
          
          gsap.set(split.words, {
            opacity: 0,
            y: customConfig.y || 30,
            skewY: customConfig.skewY || 5
          });
        });
      },
      animate: (element) => {
        const textElements = element.querySelectorAll('.split-words-initialized');
        const timelines = [];
        
        // Get custom config if present
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        textElements.forEach(el => {
          if (el._splitInstance) {
            // Build ScrollTrigger config if scrub or replay is enabled
            let tlConfig = {};

            if (customConfig.scrub !== undefined || customConfig.replay) {
              tlConfig.scrollTrigger = {
                trigger: element,
                start: customConfig.start || "top 80%",
                end: customConfig.end || "bottom 20%",
                markers: customConfig.markers || false
              };

              // Add scrub if specified (can be boolean or number)
              if (customConfig.scrub !== undefined) {
                tlConfig.scrollTrigger.scrub = customConfig.scrub;
              } else if (customConfig.replay) {
                // Use toggleActions for replay mode without scrub
                tlConfig.scrollTrigger.toggleActions = "play pause resume reset";
              }
            }

            const tl = gsap.timeline(tlConfig)
              .to(el._splitInstance.words, {
                opacity: 1,
                y: 0,
                skewY: 0,
                duration: customConfig.duration || config.defaultDuration,
                stagger: customConfig.stagger || animationParams.splitWords.stagger || 0.05,
                ease: customConfig.ease || animationParams.splitWords.ease || config.defaultEase,
                delay: customConfig.delay || 0
              });
            timelines.push(tl);
          }
        });
        
        return timelines.length > 1 ? gsap.timeline().add(timelines) : timelines[0];
      }
    },
    
    splitLines: {
      init: (element) => {
        const textElements = element.querySelectorAll('h1, h2, h3, p');
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        textElements.forEach(el => {
          if (el.classList.contains('split-lines-initialized')) return;
          
          // Create split with line masking like the reference
          const split = new SplitText(el, { 
            type: 'lines',
            linesClass: 'split-line',
            lineThreshold: 0.5
          });
          
          // Manually wrap each line in overflow:hidden div for masking
          split.lines.forEach(line => {
            const wrapper = document.createElement('div');
            wrapper.style.overflow = 'hidden';
            wrapper.style.display = 'block';
            wrapper.className = 'split-line-mask';
            line.parentNode.insertBefore(wrapper, line);
            wrapper.appendChild(line);
          });
          
          el._splitInstance = split;
          el.classList.add('split-lines-initialized');
          
          // Set initial state with yPercent like the reference
          gsap.set(split.lines, {
            yPercent: customConfig.yPercent || animationParams.splitLines.yPercent
          });
        });
      },
      animate: (element) => {
        const textElements = element.querySelectorAll('.split-lines-initialized');
        const animations = [];
        
        // Get custom config if present
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        textElements.forEach(el => {
          if (el._splitInstance) {
            // Build ScrollTrigger config based on scrub/replay settings
            let animConfig = {
              yPercent: 0,
              duration: customConfig.duration || animationParams.splitLines.duration,
              stagger: customConfig.stagger || animationParams.splitLines.stagger,
              ease: customConfig.ease || animationParams.splitLines.ease,
              delay: customConfig.delay || 0
            };

            // Add ScrollTrigger if scrub or replay is enabled
            if (customConfig.scrub !== undefined || customConfig.replay) {
              animConfig.scrollTrigger = {
                trigger: element,
                start: customConfig.start || 'top 80%',
                end: customConfig.end || 'bottom 20%',
                markers: customConfig.markers || false
              };

              // Add scrub if specified (can be boolean or number)
              if (customConfig.scrub !== undefined) {
                animConfig.scrollTrigger.scrub = customConfig.scrub;
              } else if (customConfig.replay) {
                // Use toggleActions for replay mode without scrub
                animConfig.scrollTrigger.toggleActions = "play pause resume reset";
              }
            } else {
              // Default ScrollTrigger for non-scrub, non-replay
              animConfig.scrollTrigger = {
                trigger: element,
                start: 'top 80%',
                toggleActions: "play none none none",
                markers: customConfig.markers || false
              };
            }

            const anim = gsap.to(el._splitInstance.lines, animConfig);
            animations.push(anim);
          }
        });
        
        return animations.length > 1 ? animations : animations[0];
      }
    },
    
    fadeUp: {
      init: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        gsap.set(element, { 
          opacity: 0, 
          y: customConfig.y || 50 
        });
      },
      animate: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        return gsap.to(element, {
          opacity: 1,
          y: 0,
          duration: customConfig.duration || config.defaultDuration,
          ease: customConfig.ease || config.defaultEase,
          delay: customConfig.delay || 0
        });
      }
    },
    
    fadeIn: {
      init: (element) => {
        gsap.set(element, { 
          opacity: 0 
        });
      },
      animate: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        return gsap.to(element, {
          opacity: 1,
          duration: customConfig.duration || config.defaultDuration,
          ease: customConfig.ease || config.defaultEase,
          delay: customConfig.delay || 0
        });
      }
    },
    
    slideInLeft: {
      init: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        const distance = customConfig.distance || 100;

        // Always start with opacity 0 to prevent flash
        gsap.set(element, {
          opacity: 0,
          x: -distance,
          visibility: 'visible',
          willChange: 'transform, opacity' // Optimize for animation
        });
      },
      animate: (element) => {
        // Accessibility: Instantly position in final state when reduced motion is enabled
        if (reducedMotionEnabled) {
          gsap.set(element, {
            x: 0,
            opacity: 1,
            visibility: 'visible',
            clearProps: 'transform'
          });
          element.classList.add('gsap-animated');
          return gsap.timeline(); // Return empty timeline
        }

        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        const distance = customConfig.distance || 100;

        // Check if scrubbing is disabled
        const scrubValue = customConfig.scrub === 0 || customConfig.scrub === false ? false :
                          (customConfig.scrub !== undefined ? customConfig.scrub : 1);

        // If scrub is disabled, use standard animation with quick opacity
        if (scrubValue === false) {
          // Create timeline for separate opacity and movement animations
          const tl = gsap.timeline({ delay: customConfig.delay || 0 });

          // Quick opacity transition (15% of total duration for more abrupt effect)
          tl.to(element, {
            opacity: 1,
            duration: (customConfig.duration || config.defaultDuration) * 0.15,
            ease: 'power2.in'
          }, 0);

          // Smooth slide motion (full duration)
          tl.to(element, {
            x: 0,
            duration: customConfig.duration || config.defaultDuration,
            ease: customConfig.ease || config.defaultEase
          }, 0);

          return tl;
        }

        // Otherwise use ScrollTrigger with scrubbing (default)
        // For large distances, adjust start position to trigger earlier
        const startPosition = distance > 300 ? 'top 100%' : 'top 80%';

        // Create timeline for scroll-based animation with abrupt opacity
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: element.parentElement || element,
            start: customConfig.start || startPosition,
            end: customConfig.end || 'bottom 20%',
            scrub: scrubValue,
            markers: customConfig.markers || false,
            onEnter: () => {
              // Immediately show element when entering viewport
              gsap.set(element, { opacity: 1 });
            }
          }
        });

        // Smooth slide motion across entire scroll range
        tl.to(element, {
          x: 0,
          duration: 1,
          ease: 'none'
        }, 0);

        return tl;
      }
    },
    
    slideInRight: {
      init: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        const distance = customConfig.distance || 100;

        // Always start with opacity 0 to prevent flash
        gsap.set(element, {
          opacity: 0,
          x: distance,
          visibility: 'visible',
          willChange: 'transform, opacity' // Optimize for animation
        });
      },
      animate: (element) => {
        // Accessibility: Instantly position in final state when reduced motion is enabled
        if (reducedMotionEnabled) {
          gsap.set(element, {
            x: 0,
            opacity: 1,
            visibility: 'visible',
            clearProps: 'transform'
          });
          element.classList.add('gsap-animated');
          return gsap.timeline(); // Return empty timeline
        }

        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        const distance = customConfig.distance || 100;

        // Check if scrubbing is disabled
        const scrubValue = customConfig.scrub === 0 || customConfig.scrub === false ? false :
                          (customConfig.scrub !== undefined ? customConfig.scrub : 1);

        // If scrub is disabled, use standard animation with quick opacity
        if (scrubValue === false) {
          // Create timeline for separate opacity and movement animations
          const tl = gsap.timeline({ delay: customConfig.delay || 0 });

          // Quick opacity transition (15% of total duration for more abrupt effect)
          tl.to(element, {
            opacity: 1,
            duration: (customConfig.duration || config.defaultDuration) * 0.15,
            ease: 'power2.in'
          }, 0);

          // Smooth slide motion (full duration)
          tl.to(element, {
            x: 0,
            duration: customConfig.duration || config.defaultDuration,
            ease: customConfig.ease || config.defaultEase
          }, 0);

          return tl;
        }

        // Otherwise use ScrollTrigger with scrubbing (default)
        // For large distances, adjust start position to trigger earlier
        const startPosition = distance > 300 ? 'top 100%' : 'top 80%';

        // Create timeline for scroll-based animation with abrupt opacity
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: element.parentElement || element,
            start: customConfig.start || startPosition,
            end: customConfig.end || 'bottom 20%',
            scrub: scrubValue,
            markers: customConfig.markers || false,
            onEnter: () => {
              // Immediately show element when entering viewport
              gsap.set(element, { opacity: 1 });
            }
          }
        });

        // Smooth slide motion across entire scroll range
        tl.to(element, {
          x: 0,
          duration: 1,
          ease: 'none'
        }, 0);

        return tl;
      }
    },
    
    slideInUp: {
      init: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        gsap.set(element, { 
          opacity: 0, 
          y: customConfig.distance || 100 
        });
      },
      animate: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        // Check if scrubbing is enabled (default is false for slideInUp)
        const scrubValue = customConfig.scrub === true ? 1 : 
                          (customConfig.scrub !== undefined && customConfig.scrub !== false ? customConfig.scrub : false);
        
        // Calculate actual duration based on speed multiplier
        const speed = customConfig.speed || 1;
        const actualDuration = (customConfig.duration || config.defaultDuration) / speed;
        
        // If scrub is disabled (default), use standard animation
        if (scrubValue === false) {
          return gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: actualDuration,
            ease: customConfig.ease || config.defaultEase,
            delay: customConfig.delay || 0
          });
        }
        
        // Otherwise use ScrollTrigger with scrubbing
        return gsap.to(element, {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: element,
            start: customConfig.start || 'top 80%',
            end: customConfig.end || 'bottom 20%',
            scrub: scrubValue,
            markers: customConfig.markers || false
          }
        });
      }
    },
    
    slideOutUp: {
      init: (element) => {
        // No initial state needed, element starts in normal position
        gsap.set(element, { 
          opacity: 1,
          y: 0
        });
      },
      animate: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        // Check if scrubbing is disabled
        const scrubValue = customConfig.scrub === 0 || customConfig.scrub === false ? false : 
                          (customConfig.scrub !== undefined ? customConfig.scrub : 1);
        
        // If scrub is disabled, use standard animation
        if (scrubValue === false) {
          return gsap.to(element, {
            y: -(customConfig.distance || '120%'),
            opacity: 1,
            duration: customConfig.duration || 0.8,
            ease: customConfig.ease || 'power2.in',
            delay: customConfig.delay || 0
          });
        }
        
        // Otherwise use ScrollTrigger with scrubbing (default)
        return gsap.to(element, {
          y: -(customConfig.distance || '120%'),
          opacity: 1,
          duration: customConfig.duration || 0.8,
          ease: customConfig.ease || 'power2.in',
          delay: customConfig.delay || 0,
          scrollTrigger: {
            trigger: element,
            start: customConfig.start || 'top 60%',
            end: customConfig.end || 'bottom 40%',
            scrub: scrubValue,
            markers: customConfig.markers || false
          }
        });
      }
    },
    
    slideOutDown: {
      init: (element) => {
        // No initial state needed, element starts in normal position
        gsap.set(element, { 
          opacity: 1,
          y: 0
        });
      },
      animate: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        // Check if scrubbing is disabled
        const scrubValue = customConfig.scrub === 0 || customConfig.scrub === false ? false : 
                          (customConfig.scrub !== undefined ? customConfig.scrub : 1);
        
        // If scrub is disabled, use standard animation
        if (scrubValue === false) {
          return gsap.to(element, {
            y: customConfig.distance || '120%',
            opacity: 1,
            duration: customConfig.duration || 0.8,
            ease: customConfig.ease || 'power2.in',
            delay: customConfig.delay || 0
          });
        }
        
        // Otherwise use ScrollTrigger with scrubbing (default)
        return gsap.to(element, {
          y: customConfig.distance || '120%',
          opacity: 1,
          duration: customConfig.duration || 0.8,
          ease: customConfig.ease || 'power2.in',
          delay: customConfig.delay || 0,
          scrollTrigger: {
            trigger: element,
            start: customConfig.start || 'bottom 100%',
            end: customConfig.end || 'bottom 40%',
            scrub: scrubValue,
            markers: customConfig.markers || false
          }
        });
      }
    },
    
    scaleIn: {
      init: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        gsap.set(element, { 
          opacity: 1, 
          scale: customConfig.scale || 0.8,
          transformOrigin: customConfig.transformOrigin || 'center'
        });
      },
      animate: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        // Check if scrubbing is enabled (default true)
        const scrubEnabled = customConfig.scrub !== undefined ? customConfig.scrub : true;
        
        if (scrubEnabled) {
          // Create ScrollTrigger-based animation with scrubbing
          return gsap.to(element, {
            opacity: 1,
            scale: 1,
            ease: customConfig.ease || 'back.out(1.7)',
            scrollTrigger: {
              trigger: element,
              start: customConfig.start || 'top 80%',
              end: customConfig.end || 'bottom 20%',
              scrub: typeof customConfig.scrub === 'number' ? customConfig.scrub : 1,
              markers: customConfig.markers || false
            }
          });
        } else {
          // Standard animation without scrubbing
          return gsap.to(element, {
            opacity: 1,
            scale: 1,
            duration: customConfig.duration || config.defaultDuration,
            ease: customConfig.ease || 'back.out(1.7)',
            delay: customConfig.delay || 0
          });
        }
      }
    },
    
    scaleDown: {
      init: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        gsap.set(element, { 
          opacity: 1, 
          scaleX: customConfig.scale || 1.5,
          scaleY: customConfig.scale || 1.5,
          scaleZ: 1,
          transformOrigin: customConfig.transformOrigin || 'center'
        });
      },
      animate: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        // Check if scrubbing is enabled (default true)
        const scrubValue = customConfig.scrub === 0 || customConfig.scrub === false ? false : 
                          (customConfig.scrub !== undefined ? customConfig.scrub : true);
        
        if (scrubValue !== false) {
          // Create ScrollTrigger-based animation with scrubbing
          return gsap.to(element, {
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            ease: customConfig.ease || 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: customConfig.start || 'top 80%',
              end: customConfig.end || 'bottom 20%',
              scrub: typeof scrubValue === 'number' ? scrubValue : 1,
              markers: customConfig.markers || false
            }
          });
        } else {
          // Standard animation without scrubbing
          return gsap.to(element, {
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
            duration: customConfig.duration || config.defaultDuration,
            ease: customConfig.ease || 'power2.out',
            delay: customConfig.delay || 0
          });
        }
      }
    },
    
    slideOutRight: {
      init: (element) => {
        // No initial state needed, element starts in normal position
        gsap.set(element, {
          opacity: 1,
          x: 0
        });
      },
      animate: (element) => {
        // Accessibility: Keep element in normal position when reduced motion is enabled
        if (reducedMotionEnabled) {
          gsap.set(element, {
            x: 0,
            opacity: 1,
            visibility: 'visible'
          });
          element.classList.add('gsap-animated');
          return gsap.timeline(); // Return empty timeline
        }

        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        // Create ScrollTrigger-based animation for slide out
        return gsap.to(element, {
          x: customConfig.distance || '120%',
          opacity: 1,
          duration: customConfig.duration || 0.8,
          ease: customConfig.ease || 'power2.in',
          delay: customConfig.delay || 0,
          scrollTrigger: {
            trigger: element,
            start: customConfig.start || 'top 60%',
            end: customConfig.end || 'bottom 40%',
            scrub: customConfig.scrub !== undefined ? customConfig.scrub : 1,
            markers: customConfig.markers || false
          }
        });
      }
    },
    
    slideOutLeft: {
      init: (element) => {
        // No initial state needed, element starts in normal position
        gsap.set(element, {
          opacity: 1,
          x: 0
        });
      },
      animate: (element) => {
        // Accessibility: Keep element in normal position when reduced motion is enabled
        if (reducedMotionEnabled) {
          gsap.set(element, {
            x: 0,
            opacity: 1,
            visibility: 'visible'
          });
          element.classList.add('gsap-animated');
          return gsap.timeline(); // Return empty timeline
        }

        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        // Create ScrollTrigger-based animation for slide out
        return gsap.to(element, {
          x: '-' + (customConfig.distance || '120%'),
          opacity: 1,
          duration: customConfig.duration || 0.8,
          ease: customConfig.ease || 'power2.in',
          delay: customConfig.delay || 0,
          scrollTrigger: {
            trigger: element,
            start: customConfig.start || 'top 60%',
            end: customConfig.end || 'bottom 40%',
            scrub: customConfig.scrub !== undefined ? customConfig.scrub : 1,
            markers: customConfig.markers || false
          }
        });
      }
    },
    
    rotate: {
      init: (element) => {
        // Set initial rotation to 0
        gsap.set(element, {
          rotation: 0,
          transformOrigin: 'center center'
        });
      },
      animate: (element) => {
        // Accessibility: Skip rotation entirely when reduced motion is enabled
        if (reducedMotionEnabled) {
          gsap.set(element, {
            rotation: 0,
            opacity: 1,
            visibility: 'visible'
          });
          element.classList.add('gsap-animated');
          return gsap.timeline(); // Return empty timeline
        }

        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        // Create scroll-based rotation animation
        return gsap.to(element, {
          rotation: customConfig.rotation || 360,
          ease: customConfig.ease || 'none',
          scrollTrigger: {
            trigger: element,
            start: customConfig.start || 'top bottom',
            end: customConfig.end || 'bottom top',
            scrub: customConfig.scrub !== undefined ? customConfig.scrub : 1,
            markers: customConfig.markers || false,
            onUpdate: (self) => {
              // Optional: Add custom behavior based on scroll progress
              if (customConfig.onProgress) {
                element.style.setProperty('--rotation-progress', self.progress);
              }
            }
          }
        });
      }
    },

    'turnleft90-scroll': {
      init: (element) => {
        // Set initial rotation to 0
        gsap.set(element, {
          rotation: 0,
          transformOrigin: 'center center'
        });

        // Get custom config to check for class names
        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        // Add startturn class to body on initialization
        const startClass = customConfig.startClass || 'startturn';
        document.body.classList.add(startClass);

        // Store the class name for later removal
        element._startClass = startClass;
      },
      animate: (element) => {
        // Accessibility: Skip rotation animation when reduced motion is enabled
        if (reducedMotionEnabled) {
          gsap.set(element, {
            rotation: 0,
            opacity: 1,
            visibility: 'visible'
          });
          element.classList.add('gsap-animated');
          return gsap.timeline(); // Return empty timeline
        }

        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        // Find the nearest .content-wrapper for pinning
        const contentWrapper = element.closest('.content-wrapper');
        const pinElement = contentWrapper || element.parentElement;

        // Check if we should disable pinning on mobile/portrait
        const checkShouldDisablePin = () => {
          const isMobile = window.innerWidth <= 767;
          const isPortraitTablet = window.innerWidth <= 1024 && window.matchMedia('(orientation: portrait)').matches;
          return isMobile || isPortraitTablet;
        };

        let shouldDisablePin = checkShouldDisablePin();

        // Determine pin value: respect custom config but disable on mobile/portrait
        let pinValue = customConfig.pin !== false ? pinElement : false;
        if (shouldDisablePin) {
          pinValue = false; // Disable pinning on mobile and portrait tablets
        }

        // Add orientation change listener to refresh ScrollTrigger
        const handleOrientationChange = () => {
          const newShouldDisablePin = checkShouldDisablePin();
          if (newShouldDisablePin !== shouldDisablePin) {
            shouldDisablePin = newShouldDisablePin;
            // Refresh ScrollTrigger to update pinning
            ScrollTrigger.refresh();
          }
        };

        // Listen for orientation changes
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        // Store cleanup function
        element._turnleft90Cleanup = () => {
          window.removeEventListener('orientationchange', handleOrientationChange);
          window.removeEventListener('resize', handleOrientationChange);
        };

        // Create scroll-based rotation animation with conditional pinning
        return gsap.to(element, {
          rotation: customConfig.rotation || -90,
          ease: customConfig.ease || 'none',
          scrollTrigger: {
            trigger: element,
            start: customConfig.start || 'top 40%',
            end: customConfig.end || 'top 30%',
            scrub: customConfig.scrub !== undefined ? customConfig.scrub : 1,
            pin: pinValue,
            pinSpacing: shouldDisablePin ? false : (customConfig.pinSpacing !== false),
            markers: customConfig.markers || false,
            onComplete: () => {
              // Add endturn class and remove startturn/midturn classes when animation completes
              const startClass = element._startClass || customConfig.startClass || 'startturn';
              const midClass = customConfig.midClass || 'midturn';
              const endClass = customConfig.endClass || 'endturn';

              document.body.classList.remove(startClass);
              document.body.classList.remove(midClass);
              document.body.classList.add(endClass);
            },
            onReverseComplete: () => {
              // Remove endturn/midturn classes and restore startturn class when animation reverses to start
              const startClass = element._startClass || customConfig.startClass || 'startturn';
              const midClass = customConfig.midClass || 'midturn';
              const endClass = customConfig.endClass || 'endturn';

              document.body.classList.add(startClass);
              document.body.classList.remove(midClass);
              document.body.classList.remove(endClass);
            },
            onUpdate: (self) => {
              // Update progress for potential CSS variables
              if (customConfig.onProgress) {
                element.style.setProperty('--rotation-progress', self.progress);
              }

              const startClass = element._startClass || customConfig.startClass || 'startturn';
              const midClass = customConfig.midClass || 'midturn';
              const endClass = customConfig.endClass || 'endturn';

              // Manage classes based on progress
              if (self.progress >= 1) {
                // Fully rotated
                document.body.classList.remove(startClass);
                document.body.classList.remove(midClass);
                document.body.classList.add(endClass);
              } else if (self.progress <= 0) {
                // At start
                document.body.classList.add(startClass);
                document.body.classList.remove(midClass);
                document.body.classList.remove(endClass);
              } else {
                // During rotation (between 0 and 1)
                document.body.classList.remove(startClass);
                document.body.classList.add(midClass);
                document.body.classList.remove(endClass);
              }
            }
          }
        });
      }
    },

    tilt: {
      init: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config') 
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};
        
        // Set initial 3D perspective
        gsap.set(element, {
          transformPerspective: customConfig.perspective || 1000,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center'
        });
        
        // Store original transform for reset
        element._tiltOriginalTransform = gsap.getProperty(element, 'transform');
      },
      animate: (element) => {
        // Accessibility: Skip tilt animation when reduced motion is enabled
        if (reducedMotionEnabled) {
          gsap.set(element, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            opacity: 1,
            visibility: 'visible'
          });
          element.classList.add('gsap-animated');
          return gsap.timeline(); // Return empty timeline
        }

        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        const maxTilt = customConfig.maxTilt || 15;
        const scale = customConfig.scale || 1.05;
        const speed = (customConfig.speed || 300) / 1000; // Convert ms to seconds

        // Create hover timeline
        const tl = gsap.timeline({ paused: true });
        
        // Function to handle mouse movement
        const handleMouseMove = (e) => {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          // Calculate mouse position relative to element center
          const mouseX = e.clientX - centerX;
          const mouseY = e.clientY - centerY;
          
          // Calculate tilt angles based on mouse position
          const tiltX = -(mouseY / (rect.height / 2)) * maxTilt;
          const tiltY = (mouseX / (rect.width / 2)) * maxTilt;
          
          // Apply 3D tilt transformation
          gsap.to(element, {
            rotationX: tiltX,
            rotationY: tiltY,
            scale: scale,
            duration: speed,
            ease: customConfig.easing || 'power2.out',
            overwrite: 'auto'
          });
        };
        
        // Function to handle mouse enter
        const handleMouseEnter = () => {
          element.addEventListener('mousemove', handleMouseMove);
          
          // Add glow/shadow effect on hover
          gsap.to(element, {
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            duration: speed
          });
        };
        
        // Function to handle mouse leave
        const handleMouseLeave = () => {
          element.removeEventListener('mousemove', handleMouseMove);
          
          // Reset transformation
          gsap.to(element, {
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            boxShadow: 'none',
            duration: speed,
            ease: customConfig.easing || 'power2.out'
          });
        };
        
        // Add event listeners
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        
        // Store cleanup function
        element._tiltCleanup = () => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('mousemove', handleMouseMove);
        };
        
        return tl;
      }
    },

    // Section-level animations
    stagger: {
      init: (section) => {
        const items = section.querySelectorAll('.list-item, .sqs-block');
        gsap.set(items, { opacity: 0, y: 30 });
      },
      animate: (section) => {
        const items = section.querySelectorAll('.list-item, .sqs-block');
        const customConfig = section.hasAttribute('data-gsap-config') 
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};
        
        const tlConfig = customConfig.replay ? {
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play pause resume reset",
            markers: false
          }
        } : {};
        
        return gsap.timeline(tlConfig)
          .to(items, {
            opacity: 1,
            y: 0,
            duration: customConfig.duration || config.defaultDuration,
            stagger: customConfig.stagger || config.defaultStagger,
            ease: customConfig.ease || config.defaultEase,
            delay: customConfig.delay || 0
          });
      }
    },
    
    parallax: {
      init: (section) => {
        const images = section.querySelectorAll('img');
        images.forEach(img => {
          const wrapper = document.createElement('div');
          wrapper.className = 'parallax-wrapper';
          wrapper.style.overflow = 'hidden';
          img.parentNode.insertBefore(wrapper, img);
          wrapper.appendChild(img);
        });
      },
      animate: (section) => {
        const images = section.querySelectorAll('.parallax-wrapper img');
        const customConfig = section.hasAttribute('data-gsap-config') 
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};
        
        const fromValue = {};
        const toValue = {};
        
        // Set direction-based properties
        if (customConfig.direction === 'x' || customConfig.direction === 'both') {
          fromValue.xPercent = -(customConfig.offset || 20);
          toValue.xPercent = customConfig.offset || 20;
        }
        if (customConfig.direction === 'y' || customConfig.direction === 'both' || !customConfig.direction) {
          fromValue.yPercent = -(customConfig.offset || 20);
          toValue.yPercent = customConfig.offset || 20;
        }
        
        return gsap.timeline()
          .fromTo(images, 
            fromValue,
            {
              ...toValue,
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: customConfig.start || 'top bottom',
                end: customConfig.end || 'bottom top',
                scrub: customConfig.scrub || 1
              }
            }
          );
      }
    },
    
    reveal: {
      init: (section) => {
        const blocks = section.querySelectorAll('.sqs-block');
        const customConfig = section.hasAttribute('data-gsap-config') 
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};
        
        blocks.forEach((block) => {
          gsap.set(block, { 
            opacity: 0, 
            y: customConfig.y || 50,
            rotationX: customConfig.rotationX || -10,
            transformPerspective: customConfig.perspective || 1000
          });
        });
      },
      animate: (section) => {
        const blocks = section.querySelectorAll('.sqs-block');
        const customConfig = section.hasAttribute('data-gsap-config') 
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};
        
        const tlConfig = customConfig.replay ? {
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play pause resume reset",
            markers: false
          }
        } : {};
        
        return gsap.timeline(tlConfig)
          .to(blocks, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: customConfig.duration || config.defaultDuration,
            stagger: customConfig.stagger || config.defaultStagger,
            ease: customConfig.ease || config.defaultEase,
            delay: customConfig.delay || 0
          });
      }
    },
    
    flip: {
      init: (section) => {
        // Register Flip plugin if not already done
        if (typeof Flip !== 'undefined') {
          gsap.registerPlugin(Flip);
        } else {
          console.warn('Flip plugin not found. Please include the Flip plugin.');
          return;
        }
        
        console.log('Flip animation: Initializing for section', section.id);
        
        // Find target element within the section (has "flip-target" in alt or href)
        let targetElement = null;
        let targetBlock = null;
        
        // Check for element with flip-target in alt text within the section
        const elementsWithAlt = section.querySelectorAll('[alt*="flip-target"]');
        if (elementsWithAlt.length > 0) {
          targetElement = elementsWithAlt[0];
          targetBlock = targetElement.closest('.list-item, .fe-block');
          console.log('Flip animation: Found target via alt attribute', targetElement);
        }
        
        // Check for element with flip-target in href within the section
        if (!targetElement) {
          const elementsWithHref = section.querySelectorAll('[href*="flip-target"]');
          if (elementsWithHref.length > 0) {
            targetElement = elementsWithHref[0];
            targetBlock = targetElement.closest('.list-item, .fe-block');
            console.log('Flip animation: Found target via href attribute', targetElement);
          }
        }
        
        if (!targetBlock) {
          console.warn('Flip animation: No target element found with "flip-target" in alt/href');
          return;
        }
        
        // Add debug class to target (without visible borders)
        targetBlock.classList.add('flip-target-element');
        console.log('Flip animation: Target block identified', targetBlock);
        
        // Find wrapper elements across the ENTIRE DOCUMENT (not just the section)
        const wrapperElements = [];
        const processedWrappers = new Set(); // Track already added wrappers
        
        // Find ALL elements with flip-wrapper in alt or href across the document
        const allWrapperElements = [
          ...document.querySelectorAll('[alt*="flip-wrapper"]'),
          ...document.querySelectorAll('[href*="flip-wrapper"]')
        ];
        
        // Sort by DOM position (document order)
        allWrapperElements.sort((a, b) => {
          const position = a.compareDocumentPosition(b);
          if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
          if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
          return 0;
        });
        
        // Process each potential wrapper
        allWrapperElements.forEach(el => {
          const wrapper = el.closest('.list-item, .fe-block');
          if (wrapper && wrapper !== targetBlock && !processedWrappers.has(wrapper)) {
            wrapperElements.push(wrapper);
            processedWrappers.add(wrapper);
            
            const source = el.hasAttribute('alt') ? 'alt' : 'href';
            const value = el.getAttribute(source);
            console.log(`Flip animation: Found wrapper #${wrapperElements.length} via ${source}="${value}"`, wrapper);
          }
        });
        
        if (wrapperElements.length === 0) {
          console.warn('Flip animation: No wrapper elements found with "flip-wrapper" in alt/href');
          return;
        }
        
        // Add debug classes to wrappers (without visible borders)
        wrapperElements.forEach((wrapper, index) => {
          wrapper.classList.add('flip-wrapper-element', `flip-wrapper-${index}`);
        });
        
        console.log('Flip animation: Found', wrapperElements.length, 'wrapper element(s)');
        
        // Store references for animation
        section._flipTarget = targetBlock;
        section._flipWrappers = wrapperElements;
        section._flipInitialized = true;
      },
      animate: (section) => {
        // Check if flip was properly initialized
        if (!section._flipInitialized || !section._flipTarget || !section._flipWrappers) {
          console.warn('Flip animation: Not properly initialized, skipping animate');
          return;
        }
        
        console.log('Flip animation: Starting animation for section', section.id);
        
        const targetBlock = section._flipTarget;
        const wrapperElements = section._flipWrappers;
        const customConfig = section.hasAttribute('data-gsap-config') 
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};
        
        console.log('Flip animation: Animating with', wrapperElements.length, 'wrappers');
        
        // Create array including original position as first element
        const allPositions = [targetBlock.parentElement, ...wrapperElements];
        
        // Calculate the end position based on the last wrapper element
        const lastWrapper = wrapperElements[wrapperElements.length - 1];
        const endTrigger = lastWrapper ? lastWrapper.closest('.page-section') || lastWrapper : section;
        
        // Store the initial parent for the starting position
        const originalParent = targetBlock.parentElement;
        
        // Ensure target is visible initially
        gsap.set(targetBlock, { clearProps: "all" });
        targetBlock.style.visibility = 'visible';
        targetBlock.style.opacity = '1';
        
        // Create a context for proper cleanup if needed
        let flipCtx = gsap.context(() => {
          // Use requestAnimationFrame to ensure proper state capture after layout
          requestAnimationFrame(() => {
            // Clear any inline dimension styles that might cause distortion
            targetBlock.style.width = '';
            targetBlock.style.height = '';
          });

          // Create array of all positions (original + wrappers)
          const allStates = [originalParent, ...wrapperElements].map(el => Flip.getState(el));

          // Function to recapture all states (used for mid-page refresh)
          const recaptureAllStates = () => {
            // Recapture original parent state
            allStates[0] = Flip.getState(originalParent);
            // Recapture all wrapper states
            wrapperElements.forEach((wrapper, index) => {
              allStates[index + 1] = Flip.getState(wrapper);
            });
          };

          // Create the flip animation timeline with ScrollTrigger
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: originalParent,
              start: "clamp(center center)", // Start when original reaches center
              endTrigger: endTrigger,
              end: "clamp(top 40%)", // End when last wrapper is 40% from top (still mostly visible)
              scrub: customConfig.scrub !== undefined ? customConfig.scrub : 0.25,
              immediateRender: false, // Prevent immediate render on load
              invalidateOnRefresh: true, // Recalculate on refresh
              refreshPriority: -1, // Lower priority to run after other animations
              markers: customConfig.markers || false,
              onRefresh: () => {
                // Recapture all states on refresh (including original parent)
                recaptureAllStates();
              },
              onUpdate: (self) => {
                // Ensure element is visible during scroll
                if (targetBlock.style.visibility === 'hidden') {
                  targetBlock.style.visibility = 'visible';
                }
              }
            }
          });

          // Store ScrollTrigger for mid-page refresh handling
          section._flipScrollTrigger = timeline.scrollTrigger;
          section._flipRecaptureStates = recaptureAllStates;

          // Loop through each transition
          allStates.forEach((state, index) => {
            if (index < allStates.length - 1) {
              const nextState = allStates[index + 1];

              // Create the Flip.fit animation with configuration matching the reference
              const flipConfig = {
                duration: 1,
                ease: index === 0 ? "none" : "sine.inOut" // No ease for first transition
              };

              // Add the Flip.fit tween to the timeline
              // Using states directly like in the reference implementation
              timeline.add(
                Flip.fit(targetBlock, nextState, flipConfig),
                index ? "+=0.5" : 0 // Add 0.5s gap between transitions (except first)
              );

              console.log(`Flip animation: Added transition ${index} to ${index + 1}`);
            }
          });

          return timeline;
        });

        // Store context for potential cleanup
        section._flipContext = flipCtx;

        // Handle mid-page refresh: recapture states and refresh after scroll restoration
        // Problem: On page refresh, browsers restore scroll position AFTER scripts run,
        // and Flip.getState() captures wrong positions.
        // Solution: Wait for scroll restoration, then recapture and refresh.
        const handleFlipRefresh = () => {
          setTimeout(() => {
            if (section._flipRecaptureStates) {
              section._flipRecaptureStates();
            }
            if (section._flipScrollTrigger) {
              section._flipScrollTrigger.refresh();
            }
          }, 350); // After the 300ms global load refresh
        };

        if (document.readyState === 'complete') {
          handleFlipRefresh();
        } else {
          window.addEventListener('load', handleFlipRefresh, { once: true });
        }
      }
    },
    
    draw: {
      init: (section) => {
        // Register DrawSVG plugin if not already done
        if (typeof DrawSVGPlugin !== 'undefined') {
          gsap.registerPlugin(DrawSVGPlugin);
        } else {
          console.warn('DrawSVG plugin not found. Please include the DrawSVG plugin.');
          return;
        }
        
        // Find all SVG paths, lines, polylines, circles, rects, and ellipses in the section
        const svgElements = section.querySelectorAll('svg path, svg line, svg polyline, svg polygon, svg circle, svg rect, svg ellipse');
        
        if (svgElements.length === 0) {
          console.warn('Draw animation: No SVG elements found in section', section.id);
          return;
        }
        
        console.log('Draw animation: Found', svgElements.length, 'SVG elements in section', section.id);
        
        const customConfig = section.hasAttribute('data-gsap-config') 
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};
        
        // Set initial state for all SVG elements
        svgElements.forEach(element => {
          // Set initial drawSVG state
          if (customConfig.fromCenter) {
            gsap.set(element, { 
              drawSVG: '50% 50%',
              opacity: 1
            });
          } else {
            gsap.set(element, { 
              drawSVG: customConfig.drawFrom || '0%',
              opacity: 1
            });
          }
          
          // Add class for styling if needed
          element.classList.add('draw-svg-element');
        });
        
        // Store references for animation
        section._drawSVGElements = svgElements;
        section._drawInitialized = true;
      },
      animate: (section) => {
        // Check if draw was properly initialized
        if (!section._drawInitialized || !section._drawSVGElements) {
          console.warn('Draw animation: Not properly initialized, skipping animate');
          return;
        }
        
        const svgElements = section._drawSVGElements;
        const customConfig = section.hasAttribute('data-gsap-config') 
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};
        
        // Find the actual SVG container to use as trigger
        // This ensures the trigger bounds match the actual content
        let triggerElement = section;
        if (svgElements.length > 0) {
          // Try to find the SVG element itself or its closest block container
          const svgElement = svgElements[0].closest('svg');
          const blockContainer = svgElements[0].closest('.sqs-block, .fe-block');
          
          // Prefer the block container if it exists, otherwise use the SVG element
          if (blockContainer) {
            triggerElement = blockContainer;
            console.log('Draw animation: Using block container as trigger', blockContainer);
          } else if (svgElement) {
            triggerElement = svgElement;
            console.log('Draw animation: Using SVG element as trigger', svgElement);
          }
        }
        
        // Create timeline with ScrollTrigger
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerElement,
            start: customConfig.start || 'top 80%',
            end: customConfig.end || 'bottom 20%',
            scrub: customConfig.scrub !== undefined ? customConfig.scrub : 1,
            markers: customConfig.markers || false,
            invalidateOnRefresh: true, // Recalculate on refresh for mid-page reload
            onUpdate: (self) => {
              // Optional: Add custom behavior based on scroll progress
              section.style.setProperty('--draw-progress', self.progress);
            }
          }
        });
        
        // Animate based on configuration
        if (customConfig.fromCenter) {
          // Draw from center outward
          tl.to(svgElements, {
            drawSVG: '0% 100%',
            duration: customConfig.duration || 2,
            stagger: customConfig.stagger || 0.2,
            ease: customConfig.ease || 'power2.inOut'
          });
        } else if (customConfig.reverse) {
          // Draw in reverse (from end to start)
          tl.fromTo(svgElements, 
            { drawSVG: '100%' },
            {
              drawSVG: '0%',
              duration: customConfig.duration || 2,
              stagger: customConfig.stagger || 0.2,
              ease: customConfig.ease || 'power2.inOut'
            }
          );
        } else {
          // Standard draw (from start to end)
          tl.to(svgElements, {
            drawSVG: customConfig.drawTo || '100%',
            duration: customConfig.duration || 2,
            stagger: customConfig.stagger || 0.2,
            ease: customConfig.ease || 'power2.inOut'
          });
        }

        // Store ScrollTrigger for mid-page refresh handling
        section._drawScrollTrigger = tl.scrollTrigger;

        // Handle mid-page refresh: recalculate after scroll restoration
        // Problem: On page refresh, browsers restore scroll position AFTER scripts run,
        // and global ScrollTrigger.refresh() calls happen at 200ms and 300ms.
        // Solution: Wait until after all that, then refresh.
        const handleDrawRefresh = () => {
          setTimeout(() => {
            if (section._drawScrollTrigger) {
              section._drawScrollTrigger.refresh();
            }
          }, 350); // After the 300ms global load refresh
        };

        if (document.readyState === 'complete') {
          handleDrawRefresh();
        } else {
          window.addEventListener('load', handleDrawRefresh, { once: true });
        }

        return tl;
      }
    },

    // Horizontal Gallery animation
    hgallery: {
      init: (section) => {
        // Check if site is in edit mode
        const isEditMode = document.querySelector('.sqs-jacquard') !== null || 
                          document.body.classList.contains('sqs-edit-mode') ||
                          document.body.classList.contains('sqs-edit-mode-active') ||
                          window.top !== window.self;
        
        if (isEditMode) {
          console.log('Horizontal gallery: Skipping initialization in edit mode for section', section.id);
          return;
        }
        
        // Find the gallery element within the section
        const gallery = section.querySelector('.sqs-gallery');
        const galleryContainer = section.querySelector('.sqs-gallery-container');
        
        if (!gallery) {
          console.warn('Horizontal gallery: No .sqs-gallery element found in section', section.id);
          return;
        }
        
        console.log('Horizontal gallery: Initializing for section', section.id);
        
        // Store references for animation
        section._hgalleryElement = gallery;
        section._hgalleryContainer = galleryContainer || gallery.parentElement;
        section._hgalleryInitialized = true;
        
        // Add class for styling
        gallery.classList.add('hgallery-element');
        if (galleryContainer) {
          galleryContainer.classList.add('hgallery-container');
        }
        
        // Set initial styles to ensure proper layout
        gsap.set(gallery, {
          display: 'flex',
          flexWrap: 'nowrap',
          width: 'max-content'
        });
      },
      animate: (section) => {
        // Check if hgallery was properly initialized
        if (!section._hgalleryInitialized || !section._hgalleryElement) {
          console.warn('Horizontal gallery: Not properly initialized, skipping animate');
          return;
        }

        // Check if mobile/touch device
        const isMobile = window.innerWidth < 767 ||
                       ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0);

        // Skip animation entirely on mobile - let native scroll handle it
        if (isMobile) {
          console.log('Horizontal gallery: Mobile detected, using native scroll');
          const gallery = section._hgalleryElement;

          // Set up native horizontal scroll for mobile
          gsap.set(gallery, {
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
            scrollSnapType: 'x mandatory' // Optional: add scroll snapping
          });

          // Set scroll snap align on gallery items
          const items = gallery.querySelectorAll('.sqs-gallery-design-carousel-slide, .gallery-item');
          items.forEach(item => {
            gsap.set(item, {
              scrollSnapAlign: 'start',
              flexShrink: 0
            });
          });

          return; // Exit early for mobile
        }

        const gallery = section._hgalleryElement;
        const galleryContainer = section._hgalleryContainer;
        const customConfig = section.hasAttribute('data-gsap-config')
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};

        console.log('Horizontal gallery: Starting animation for section', section.id);
        console.log('Gallery width:', gallery.scrollWidth, 'Window width:', window.innerWidth);
        
        // Determine which element to pin
        let pinElement = galleryContainer; // Default to gallery container
        
        // Check if pincontent option is set
        if (customConfig.pincontent) {
          const contentWrapper = section.querySelector('.content-wrapper');
          if (contentWrapper) {
            pinElement = contentWrapper;
            console.log('Horizontal gallery: Pinning .content-wrapper element');
          } else {
            console.warn('Horizontal gallery: .content-wrapper not found, falling back to gallery container');
          }
        }
        
        // Calculate scroll amount - how far to move the gallery
        const getScrollAmount = () => {
          const galleryWidth = gallery.scrollWidth;
          const availableWidth = window.innerWidth;
          // Return negative value to move left
          return -(galleryWidth - availableWidth);
        };
        
        // Check if gallery needs horizontal scrolling
        const scrollAmount = getScrollAmount();
        if (scrollAmount >= 0) {
          console.log('Horizontal gallery: Gallery fits in viewport, no scrolling needed');
          return;
        }
        
        // Create the horizontal scroll animation
        const tween = gsap.to(gallery, {
          x: getScrollAmount,
          duration: customConfig.duration || animationParams.hgallery.duration,
          ease: customConfig.ease || animationParams.hgallery.ease
        });
        
        // Desktop only - pinning is never used on mobile (handled above)
        const pinValue = customConfig.pin === false ? false : pinElement;

        // Create ScrollTrigger for desktop only
        ScrollTrigger.create({
          trigger: galleryContainer,
          start: customConfig.start || animationParams.hgallery.start,
          end: () => `+=${Math.abs(getScrollAmount())}`, // Dynamic end based on scroll distance
          pin: pinValue,
          pinSpacing: pinValue !== false,
          animation: tween,
          scrub: customConfig.scrub !== undefined ? customConfig.scrub : animationParams.hgallery.scrub,
          invalidateOnRefresh: true, // Recalculate on window resize
          markers: customConfig.markers || animationParams.hgallery.markers,
          onUpdate: (self) => {
            // Optional: Add progress indicator
            section.style.setProperty('--hgallery-progress', self.progress);
          },
          onRefresh: () => {
            // Recalculate scroll amount on refresh
            console.log('Horizontal gallery: Refreshing scroll calculations');
          }
        });
        
        // Add responsive handling
        let resizeTimer;
        const handleResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
          }, 250);
        };
        
        // Store cleanup function
        section._hgalleryCleanup = () => {
          window.removeEventListener('resize', handleResize);
        };
        
        window.addEventListener('resize', handleResize);
        
        return tween;
      }
    },
    
    // Circular scroll animation (wheel/touch-controlled circular carousel)
    'circular-scroll': {
      init: (section) => {
        // Now works on both desktop and mobile devices
        
        // Find list items container
        const listContainer = section.querySelector('.user-items-list-item-container, .list-section-list, ul.list-section-list');
        if (!listContainer) {
          console.warn('Circular animation: No list container found in section');
          return;
        }
        
        // Get all list items
        const listItems = listContainer.querySelectorAll('.list-item');
        if (listItems.length === 0) {
          console.warn('Circular animation: No list items found');
          return;
        }
        
        const customConfig = section.hasAttribute('data-gsap-config') 
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};
        
        // Create circular container structure
        const circularContainer = document.createElement('div');
        circularContainer.className = 'circular-scroll-container';
        
        const innerRotator = document.createElement('div');
        innerRotator.className = 'circular-scroll-rotator';
        
        // Style the containers
        gsap.set(circularContainer, {
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden'
        });
        
        gsap.set(innerRotator, {
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0
        });
        
        // Clone and setup each item
        listItems.forEach((item, index) => {
          const itemWrapper = document.createElement('div');
          itemWrapper.className = 'circular-item-wrapper';
          
          // Create a container for the item content
          const itemContainer = document.createElement('div');
          itemContainer.className = 'circular-item-container';
          
          // Clone the media element if it exists
          const mediaEl = item.querySelector('.list-item-media');
          if (mediaEl) {
            const clonedMedia = mediaEl.cloneNode(true);
            itemContainer.appendChild(clonedMedia);
          }
          
          // Clone the content element (title, description, button)
          const contentEl = item.querySelector('.list-item-content');
          if (contentEl) {
            const clonedContent = contentEl.cloneNode(true);
            itemContainer.appendChild(clonedContent);
          }
          
          itemWrapper.appendChild(itemContainer);
          
          // Add random group class for different speeds
          const groupNum = Math.floor(Math.random() * 3) + 1;
          itemWrapper.classList.add(`circular-group-${groupNum}`);
          
          // Position items in circle
          const totalItems = listItems.length;
          const angle = (360 / totalItems) * index;
          
          gsap.set(itemWrapper, {
            rotation: angle,
            transformOrigin: 'center center',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          });
          
          // Position and style the item container
          gsap.set(itemContainer, {
            position: 'absolute',
            top: 0,
            left: '50%',
            xPercent: -50,
            width: customConfig.itemWidth || '300px',
            maxWidth: customConfig.maxItemWidth || '30vw',
            background: customConfig.itemBackground || 'rgba(255, 255, 255, 0.95)',
            borderRadius: customConfig.itemRadius || '8px',
            padding: customConfig.itemPadding || '20px',
            boxShadow: customConfig.itemShadow || '0 4px 20px rgba(0,0,0,0.1)'
          });
          
          // Ensure images within are responsive
          const images = itemContainer.querySelectorAll('img');
          images.forEach(img => {
            gsap.set(img, {
              width: '100%',
              height: 'auto',
              objectFit: 'cover'
            });
          });
          
          // Style the content text if present
          const titleEl = itemContainer.querySelector('.list-item-content__title');
          const descEl = itemContainer.querySelector('.list-item-content__description');
          
          if (titleEl) {
            gsap.set(titleEl, {
              fontSize: customConfig.titleSize || '1.2rem',
              marginTop: '10px'
            });
          }
          
          if (descEl) {
            gsap.set(descEl, {
              fontSize: customConfig.descSize || '0.9rem',
              opacity: customConfig.descOpacity || 0.8
            });
          }
          
          innerRotator.appendChild(itemWrapper);
        });
        
        // Insert the circular container
        circularContainer.appendChild(innerRotator);
        listContainer.style.display = 'none';
        
        // Append to section
        section.appendChild(circularContainer);
        
        // Store references
        section._circularContainer = circularContainer;
        section._circularRotator = innerRotator;
        section._circularConfig = customConfig;
        section._rotationValue = 0;
        
        // Initialize rotation controls
        const rotTo = gsap.quickTo(innerRotator, 'rotation', {
          duration: customConfig.duration || 0.8,
          ease: customConfig.ease || 'power4'
        });
        
        // Setup dynamic Y movement for groups if enabled
        let yTos = [];
        if (customConfig.dynamicY) {
          const speeds = customConfig.dynamicSpeed || [1, 2, 3];
          speeds.forEach((speed, i) => {
            yTos.push(gsap.quickTo(`.circular-group-${i+1} img`, 'yPercent', {
              duration: speed,
              ease: 'power3'
            }));
          });
        }
        
        // Track rotation limits
        const maxRotation = customConfig.maxRotation || 360;
        const minRotation = 0;
        
        // Track if section is actively in view
        section._circularIsActive = false;
        
        // Add wheel event listener (desktop only)
        const handleWheel = (e) => {
          // Accessibility: Skip rotation when reduced motion is enabled
          if (reducedMotionEnabled) return;

          // Skip on touch devices - let them scroll normally
          const isTouchDevice = ('ontouchstart' in window) ||
                               (navigator.maxTouchPoints > 0) ||
                               (navigator.msMaxTouchPoints > 0);

          if (isTouchDevice) return; // Don't interfere with mobile scrolling

          // Only handle wheel events if section is actively in view
          if (!section._circularIsActive) return;
          
          // Check if we're at the rotation limits
          const deltaY = e.deltaY;
          const currentRotation = section._rotationValue || 0;
          
          // If scrolling down and at max rotation, allow normal scrolling to continue to next section
          if (deltaY > 0 && currentRotation <= -maxRotation) {
            // Also remove sticky when rotation is complete (only on desktop)
            if (pageSection && pageSection._stickyApplied) {
              pageSection.style.position = pageSection._originalPosition || '';
              pageSection.style.top = pageSection._originalTop || '';
              pageSection.style.zIndex = pageSection._originalZIndex || '';
              pageSection._stickyApplied = false;

              if (customConfig.debug) {
                console.log('Removed sticky at max rotation');
              }
            }
            return; // Don't prevent default, allow scrolling to next section
          }

          // If scrolling up and at min rotation, allow normal scrolling to continue to previous section
          if (deltaY < 0 && currentRotation >= minRotation) {
            // Also remove sticky when rotation is complete (only on desktop)
            if (pageSection && pageSection._stickyApplied) {
              pageSection.style.position = pageSection._originalPosition || '';
              pageSection.style.top = pageSection._originalTop || '';
              pageSection.style.zIndex = pageSection._originalZIndex || '';
              pageSection._stickyApplied = false;

              if (customConfig.debug) {
                console.log('Removed sticky at min rotation');
              }
            }
            return; // Don't prevent default, allow scrolling to previous section
          }
          
          // Otherwise, prevent default and handle rotation
          e.preventDefault();
          const sensitivity = customConfig.wheelSensitivity || 40;
          const newRotation = currentRotation - (deltaY / sensitivity * (customConfig.rotationSpeed || 1));
          
          // Clamp rotation value
          section._rotationValue = Math.max(-maxRotation, Math.min(minRotation, newRotation));
          rotTo(section._rotationValue);
          
          // Apply dynamic Y movement if enabled
          if (customConfig.dynamicY && yTos.length > 0) {
            const val = -Math.abs(deltaY/4) - 50;
            yTos.forEach(yTo => yTo(val));
          }
        };
        
        // Find the parent .page-section container
        const pageSection = section.closest('.page-section');
        const observerTarget = pageSection || section; // Fall back to section if no page-section

        // Determine activation point based on config
        let activationThreshold = 5; // Default: within 5px of top
        let rootMargin = '0px 0px -50% 0px'; // Default for top activation

        if (customConfig.startAtCenter) {
          // Activate when section reaches center of viewport
          rootMargin = '-40% 0px -40% 0px';
        } else if (customConfig.activationThreshold !== undefined) {
          // Custom threshold in pixels from top
          activationThreshold = customConfig.activationThreshold;
        }

        // Set up Intersection Observer to activate when page-section reaches target position
        const observerOptions = {
          root: null,
          rootMargin: rootMargin,
          threshold: [0, 0.01, 0.1, 0.5] // Multiple thresholds for precise detection
        };

        const intersectionObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const rect = entry.boundingClientRect;
            const viewportHeight = window.innerHeight;

            // Activate based on configuration
            let shouldActivate = false;

            if (customConfig.startAtCenter) {
              // Activate when section center is near viewport center
              const sectionCenter = rect.top + (rect.height / 2);
              const viewportCenter = viewportHeight / 2;
              shouldActivate = entry.isIntersecting &&
                             Math.abs(sectionCenter - viewportCenter) < 100 &&
                             rect.bottom > viewportHeight * 0.3;
            } else {
              // Default: activate when section top reaches viewport top
              shouldActivate = entry.isIntersecting &&
                             rect.top <= activationThreshold &&
                             rect.top > -100 && // Not too far scrolled past
                             rect.bottom > viewportHeight * 0.5; // Still mostly in view
            }
            
            section._circularIsActive = shouldActivate;

            // Check if mobile/touch device
            const isMobile = window.innerWidth < 767 ||
                           ('ontouchstart' in window) ||
                           (navigator.maxTouchPoints > 0);

            // Apply sticky positioning to page-section when active (desktop only and not reduced motion)
            if (pageSection && !isMobile && !reducedMotionEnabled) {
              if (shouldActivate && !pageSection._stickyApplied) {
                // Store original styles
                pageSection._originalPosition = pageSection.style.position || '';
                pageSection._originalTop = pageSection.style.top || '';
                pageSection._originalZIndex = pageSection.style.zIndex || '';

                // Apply sticky positioning
                pageSection.style.position = 'sticky';
                pageSection.style.top = '0';
                pageSection.style.zIndex = '10';
                pageSection._stickyApplied = true;

                if (customConfig.debug) {
                  console.log('Applied sticky positioning to page-section (desktop only)');
                }
              } else if (!shouldActivate && pageSection._stickyApplied) {
                // Restore original styles
                pageSection.style.position = pageSection._originalPosition;
                pageSection.style.top = pageSection._originalTop;
                pageSection.style.zIndex = pageSection._originalZIndex;
                pageSection._stickyApplied = false;

                // Clean up stored values
                delete pageSection._originalPosition;
                delete pageSection._originalTop;
                delete pageSection._originalZIndex;

                if (customConfig.debug) {
                  console.log('Removed sticky positioning from page-section');
                }
              }
            }

            // Optional: Log for debugging
            if (customConfig.debug) {
              console.log('Circular scroll active:', shouldActivate,
                         'Top:', rect.top,
                         'Bottom:', rect.bottom);
            }
          });
        }, observerOptions);
        
        // Start observing the page-section (or section if no page-section found)
        intersectionObserver.observe(observerTarget);
        
        // Store observer for cleanup
        section._circularObserver = intersectionObserver;
        
        // Clean up any existing wheel handler first
        if (section._wheelHandler) {
          window.removeEventListener('wheel', section._wheelHandler);
        }
        
        section._wheelHandler = handleWheel;
        window.addEventListener('wheel', handleWheel, { passive: false });

        // Skip touch rotation on mobile - just display the circular layout
        // Mobile users can scroll normally through the section

        // Mobile-optimized resize handler
        const handleResize = () => {
          // Adjust item sizes for mobile
          if (window.innerWidth < 767) {
            // Mobile: adjust item sizes and layout
            const items = innerRotator.querySelectorAll('.circular-item-container');
            items.forEach(item => {
              gsap.set(item, {
                width: '200px', // Smaller width on mobile
                maxWidth: '60vw', // Larger percentage on mobile
                padding: '15px',
                fontSize: '0.9rem'
              });
            });
          } else {
            // Desktop: restore original sizes
            const items = innerRotator.querySelectorAll('.circular-item-container');
            items.forEach(item => {
              gsap.set(item, {
                width: customConfig.itemWidth || '300px',
                maxWidth: customConfig.maxItemWidth || '30vw',
                padding: customConfig.itemPadding || '20px',
                fontSize: '1rem'
              });
            });
          }
        };
        
        window.addEventListener('resize', handleResize);
        section._resizeHandler = handleResize;

        // Run resize handler immediately to set proper sizes
        handleResize();

        // Store cleanup function
        section._circularCleanup = () => {
          // Remove sticky if still applied
          if (pageSection && pageSection._stickyApplied) {
            pageSection.style.position = pageSection._originalPosition || '';
            pageSection.style.top = pageSection._originalTop || '';
            pageSection.style.zIndex = pageSection._originalZIndex || '';
            pageSection._stickyApplied = false;

            delete pageSection._originalPosition;
            delete pageSection._originalTop;
            delete pageSection._originalZIndex;
          }

          if (section._wheelHandler) {
            window.removeEventListener('wheel', section._wheelHandler);
          }
          if (section._resizeHandler) {
            window.removeEventListener('resize', section._resizeHandler);
          }
          if (section._circularObserver) {
            section._circularObserver.disconnect();
          }
        };
      },
      animate: (section) => {
        // Animation is handled by wheel events
        // Return empty timeline for consistency
        return gsap.timeline();
      }
    },

    // Switch animation - switches images based on text in viewport
    switch: {
      init: (section) => {
        // Check if section has the list items structure
        const listContainer = section.querySelector('.user-items-list-item-container');
        if (!listContainer) {
          console.warn('Switch animation: No list container found');
          return;
        }

        const listItems = listContainer.querySelectorAll('.list-item');
        if (listItems.length === 0) {
          console.warn('Switch animation: No list items found');
          return;
        }

        // Add switch-enabled class to the list container
        listContainer.classList.add('switch-enabled');

        // Add class to section to indicate switch is active
        section.classList.add('switch-active');

        // Create wrapper containers for the split layout
        const switchWrapper = document.createElement('div');
        switchWrapper.className = 'switch-wrapper';

        // Create image viewport (left side - for displaying current image)
        const imageViewport = document.createElement('div');
        imageViewport.className = 'switch-image-viewport';

        // Create text viewport (right side - for scrolling content)
        const textViewport = document.createElement('div');
        textViewport.className = 'switch-text-viewport';

        // Wrap the existing list container
        listContainer.parentNode.insertBefore(switchWrapper, listContainer);
        switchWrapper.appendChild(imageViewport);
        switchWrapper.appendChild(textViewport);
        textViewport.appendChild(listContainer);

        // Process each list item
        listItems.forEach((item, index) => {
          // Add index and classes for styling
          item.dataset.switchIndex = index;
          item.classList.add('switch-item');

          // Set initial visibility
          const image = item.querySelector('.list-item-media');
          if (image) {
            image.classList.add('switch-media');
            image.dataset.imageIndex = index;

            // Clone only the image media to the image viewport
            const imageClone = image.cloneNode(true);
            imageClone.classList.add('switch-viewport-image');
            if (index === 0) {
              imageClone.classList.add('active');
            }
            imageViewport.appendChild(imageClone);
          }

          // Add class to content for styling
          const content = item.querySelector('.list-item-content');
          if (content) {
            content.classList.add('switch-content');
          }
        });

        // Store references for animation
        section._switchData = {
          wrapper: switchWrapper,
          imageViewport: imageViewport,
          textViewport: textViewport,
          listContainer: listContainer,
          listItems: Array.from(listItems),
          viewportImages: Array.from(imageViewport.querySelectorAll('.switch-viewport-image')),
          currentIndex: 0
        };
      },

      animate: (section) => {
        const switchData = section._switchData;
        if (!switchData) return;

        const { listItems, viewportImages } = switchData;

        // Get custom config if present
        const customConfig = section.hasAttribute('data-gsap-config')
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};

        // Set up Intersection Observer for list items
        // Default: switches when content reaches the middle of viewport
        const observerOptions = {
          root: null,
          rootMargin: customConfig.rootMargin || '-50% 0% -50% 0%',
          threshold: customConfig.threshold || 0
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const itemIndex = parseInt(entry.target.dataset.switchIndex);

              // Update current index
              if (switchData.currentIndex !== itemIndex) {
                // Remove active class from current image
                if (viewportImages[switchData.currentIndex]) {
                  viewportImages[switchData.currentIndex].classList.remove('active');
                }

                // Add active class to new image
                if (viewportImages[itemIndex]) {
                  viewportImages[itemIndex].classList.add('active');
                }

                switchData.currentIndex = itemIndex;
              }
            }
          });
        }, observerOptions);

        // Observe all list items
        listItems.forEach(item => {
          observer.observe(item);
        });

        // Store observer for cleanup
        section._switchObserver = observer;

        // Store cleanup function
        section._switchCleanup = () => {
          if (section._switchObserver) {
            section._switchObserver.disconnect();
          }
        };

        return gsap.timeline();
      }
    },

    // Draggable animation - makes elements draggable using Interact.js
    draggable: {
      init: (section) => {
        // Check if Interact.js is loaded
        if (typeof interact === 'undefined') {
          console.warn('Interact.js not found. Please include Interact.js before using draggable animation.');
          // Try to load it dynamically
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js';
          script.onload = () => {
            console.log('Interact.js loaded dynamically');
            // Re-run init after loading
            animations.draggable.init(section);
          };
          document.head.appendChild(script);
          return;
        }

        // Find all draggable elements (.fe-block and .list-item)
        const draggableElements = section.querySelectorAll('.fe-block, .list-item');

        if (draggableElements.length === 0) {
          console.log('Draggable animation: No .fe-block or .list-item elements found');
          return;
        }

        // Helper function to check if element contains "fix-drag" in href or alt
        const isFixedElement = (element) => {
          // Check the element itself and all its descendants
          const checkElement = (el) => {
            // Check href attribute
            if (el.href && el.href.toLowerCase().includes('fix-drag')) {
              return true;
            }

            // Check alt attribute
            if (el.alt && el.alt.toLowerCase().includes('fix-drag')) {
              // Remove "fix-drag" from the alt text for cleaner display
              el.alt = el.alt.replace(/fix-drag/gi, '').trim();
              return true;
            }

            // Check all child elements
            const children = el.querySelectorAll('*');
            for (let child of children) {
              if (child.href && child.href.toLowerCase().includes('fix-drag')) {
                return true;
              }
              if (child.alt && child.alt.toLowerCase().includes('fix-drag')) {
                // Remove "fix-drag" from the alt text for cleaner display
                child.alt = child.alt.replace(/fix-drag/gi, '').trim();
                return true;
              }
            }

            return false;
          };

          return checkElement(element);
        };

        // Store draggable instances for cleanup
        section._draggableInstances = [];

        // Process each element
        draggableElements.forEach((element, index) => {
          // Skip elements that contain "fixed" in href or alt
          if (isFixedElement(element)) {
            console.log('Skipping fixed element:', element);
            element.classList.add('draggable-fixed');
            return;
          }

          // Add draggable class for identification only (no styling)
          element.classList.add('draggable-enabled');

          // Add unique ID if not present (for Draggable tracking)
          if (!element.id) {
            element.id = `draggable-${Date.now()}-${index}`;
          }

          // Apply touch-optimized CSS for better mobile performance
          element.style.touchAction = 'none'; // Prevent browser touch gestures
          element.style.userSelect = 'none'; // Prevent text selection during drag
          element.style.webkitUserSelect = 'none';
          element.style.webkitTouchCallout = 'none'; // Disable iOS callout
          element.style.cursor = 'grab';

          // Add hardware acceleration for smoother animations
          element.style.willChange = 'transform';
          element.style.transform = 'translateZ(0)';
        });

        // Mark section as initialized
        section.classList.add('draggable-initialized');
      },

      animate: (section) => {
        // Check if Interact.js is loaded
        if (typeof interact === 'undefined') {
          return gsap.timeline();
        }

        const draggableElements = section.querySelectorAll('.draggable-enabled');

        if (draggableElements.length === 0) {
          return gsap.timeline();
        }

        // Get custom config if present
        const customConfig = section.hasAttribute('data-gsap-config')
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};

        // Merge with defaults
        const config = {
          ...animationParams.draggable,
          ...customConfig
        };

        // Z-index counter for bringing elements to front
        let zIndexCounter = 100;

        // Helper function to handle drag start
        function dragStartListener(event) {
          const target = event.target;
          zIndexCounter++;
          target.style.zIndex = zIndexCounter;
          target.classList.add('dragging');
          target.style.cursor = config.activeCursor || 'grabbing';

          // Improve performance during drag
          target.style.pointerEvents = 'none'; // Prevent hover events during drag
        }

        // Helper function to handle drag move
        function dragMoveListener(event) {
          const target = event.target;
          // Get current position from data attributes (or 0 if not set)
          const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
          const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

          // Apply transform with hardware acceleration for smoother mobile performance
          target.style.transform = `translate3d(${x}px, ${y}px, 0)`;

          // Store position in data attributes
          target.setAttribute('data-x', x);
          target.setAttribute('data-y', y);
        }

        // Helper function to handle drag end
        function dragEndListener(event) {
          const target = event.target;
          target.classList.remove('dragging');
          target.style.cursor = config.cursor || 'grab';
          target.style.pointerEvents = ''; // Re-enable pointer events
        }

        // Detect if device is mobile/touch
        const isMobile = ('ontouchstart' in window) ||
                        (navigator.maxTouchPoints > 0) ||
                        (navigator.msMaxTouchPoints > 0);

        // Initialize Interact.js on each element
        draggableElements.forEach(element => {
          // Initialize data attributes if not present
          if (!element.hasAttribute('data-x')) {
            element.setAttribute('data-x', 0);
          }
          if (!element.hasAttribute('data-y')) {
            element.setAttribute('data-y', 0);
          }

          // Configure inertia based on device type
          const inertiaConfig = config.inertia ? {
            resistance: isMobile ? 20 : 30, // Less resistance on mobile for smoother throw
            minSpeed: isMobile ? 100 : 200, // Lower threshold on mobile
            endSpeed: isMobile ? 50 : 100,  // Smoother deceleration on mobile
            smoothEndDuration: isMobile ? 400 : 300 // Longer smooth end on mobile
          } : false;

          // Make element draggable with Interact.js
          interact(element)
            .draggable({
              inertia: inertiaConfig,
              modifiers: [
                interact.modifiers.restrictRect({
                  restriction: config.bounds === 'section' ? section : (config.bounds === 'window' ? 'parent' : config.bounds),
                  endOnly: false
                })
              ],
              autoScroll: false, // Disable to prevent conflicts with native scroll
              // Mobile-optimized settings
              allowFrom: isMobile ? element : null, // On mobile, allow drag from entire element
              ignoreFrom: isMobile ? 'a, button, input, textarea, select' : null, // Don't drag on interactive elements
              maxPerElement: 1, // Only one drag at a time per element
              listeners: {
                start: dragStartListener,
                move: dragMoveListener,
                end: dragEndListener
              }
            });
        });

        // Store cleanup function
        section._draggableCleanup = () => {
          // Clean up Interact.js instances
          draggableElements.forEach(element => {
            if (interact.isSet(element)) {
              interact(element).unset();
            }
          });
        };

        return gsap.timeline();
      }
    },

    momentum: {
      init: (section) => {
        // Check if InertiaPlugin is loaded
        if (typeof InertiaPlugin === 'undefined') {
          console.warn('InertiaPlugin not found. Please include GSAP InertiaPlugin for momentum animation.');
          return;
        }

        // Track mouse movement
        let oldX = 0,
            oldY = 0,
            deltaX = 0,
            deltaY = 0;

        // Store mouse tracking function for cleanup
        const mouseTracker = (e) => {
          deltaX = e.clientX - oldX;
          deltaY = e.clientY - oldY;
          oldX = e.clientX;
          oldY = e.clientY;
        };

        section.addEventListener('mousemove', mouseTracker);
        section._mouseTracker = mouseTracker;

        // Find all elements (.fe-block and .list-item)
        const momentumElements = section.querySelectorAll('.fe-block, .list-item');

        if (momentumElements.length === 0) {
          console.log('Momentum animation: No .fe-block or .list-item elements found');
          return;
        }

        // Helper function to check if element contains "fix-hover" in href or alt
        const isFixedElement = (element) => {
          const checkElement = (el) => {
            // Check href attribute
            if (el.href && el.href.toLowerCase().includes('fix-hover')) {
              return true;
            }

            // Check alt attribute
            if (el.alt && el.alt.toLowerCase().includes('fix-hover')) {
              return true;
            }

            // Check all child elements
            const children = el.querySelectorAll('*');
            for (let child of children) {
              if (child.href && child.href.toLowerCase().includes('fix-hover')) {
                return true;
              }
              if (child.alt && child.alt.toLowerCase().includes('fix-hover')) {
                return true;
              }
            }

            return false;
          };

          return checkElement(element);
        };

        // Process each element
        momentumElements.forEach((element) => {
          // Skip elements that contain "fix-hover" in href or alt
          if (isFixedElement(element)) {
            console.log('Skipping fixed hover element:', element);
            element.classList.add('momentum-fixed');
            return;
          }

          // Add momentum class for identification
          element.classList.add('momentum-enabled');

          // Create hover handler
          const hoverHandler = () => {
            // Get custom config if present
            const customConfig = section.hasAttribute('data-gsap-config')
              ? JSON.parse(section.getAttribute('data-gsap-config'))
              : {};

            const config = { ...animationParams.momentum, ...customConfig };

            const tl = gsap.timeline({
              onComplete: () => {
                tl.kill();
              }
            });

            tl.timeScale(config.timeScale);

            // Find the primary image or content element to animate
            let targetElement = element.querySelector('img') || element.querySelector('video') || element;

            tl.to(targetElement, {
              inertia: {
                x: {
                  velocity: deltaX * config.velocityMultiplier,
                  end: 0
                },
                y: {
                  velocity: deltaY * config.velocityMultiplier,
                  end: 0
                }
              }
            });

            tl.fromTo(targetElement, {
              rotate: 0
            }, {
              duration: config.duration,
              rotate: (Math.random() - 0.5) * 2 * config.rotateRange,
              yoyo: true,
              repeat: 1,
              ease: config.ease
            }, '<');
          };

          element.addEventListener('mouseenter', hoverHandler);
          element._hoverHandler = hoverHandler;
        });

        // Mark section as initialized
        section.classList.add('momentum-initialized');
      },

      animate: (section) => {
        // Momentum is entirely hover-based, no timeline animation needed
        return gsap.timeline();
      }
    },

    '3d': {
      init: (section) => {
        // Skip initialization in Squarespace edit mode
        const isEditMode = document.querySelector('.sqs-jacquard') !== null ||
                          document.body.classList.contains('sqs-edit-mode') ||
                          document.body.classList.contains('sqs-edit-mode-active') ||
                          window.top !== window.self;

        if (isEditMode) {
          console.log('3D Carousel: Skipping in edit mode');
          return;
        }

        // Find list container
        const listContainer = section.querySelector('.user-items-list-item-container, ul');
        if (!listContainer) {
          console.warn('3D Carousel: No list container found');
          return;
        }

        // Find all list items
        const items = listContainer.querySelectorAll('.list-item');
        if (items.length === 0) {
          console.warn('3D Carousel: No list items found');
          return;
        }

        // Get configuration from parsed animation config or custom config
        const parsedConfig = section.getAttribute('data-gsap-config');
        const customConfig = parsedConfig ? JSON.parse(parsedConfig) : {};

        // Merge default params with custom config
        const config = { ...animationParams['3d'], ...customConfig };

        // Log the radius being applied for debugging
        console.log('3D Carousel - Config:', config);
        console.log('3D Carousel - Radius being applied:', config.radius + 'px');

        // Set up 3D perspective on container
        gsap.set(listContainer, {
          perspective: config.perspective,
          transformStyle: 'preserve-3d',
          position: 'relative'
        });

        // Calculate carousel properties
        const numItems = items.length;
        const angleStep = 360 / numItems;

        // Set fixed width/height on items for consistency
        items.forEach((item, i) => {
          // Apply fixed width and optional height
          const transformOriginZ = -config.radius;
          gsap.set(item, {
            width: config.itemWidth + 'px',
            height: config.itemHeight === 'auto' ? 'auto' : config.itemHeight + 'px',
            maxWidth: config.itemWidth + 'px',
            overflow: 'hidden',
            position: 'absolute',
            left: '50%',
            top: '50%',
            xPercent: -50,
            yPercent: -50,
            rotationY: i * angleStep,
            transformOrigin: `50% 50% ${transformOriginZ}px`,
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            zIndex: Math.round(Math.cos((i * angleStep * Math.PI) / 180) * 100)
          });

          // Add data attribute to verify radius on each item
          item.setAttribute('data-carousel-radius', config.radius);
          item.setAttribute('data-carousel-transform-origin', `50% 50% ${transformOriginZ}px`);

          // Ensure images maintain aspect ratio within fixed width
          const images = item.querySelectorAll('img');
          images.forEach(img => {
            gsap.set(img, {
              width: '100%',
              height: 'auto',
              objectFit: 'cover'
            });
          });
        });

        // Store carousel data on section for animation phase
        section._carousel3d = {
          items,
          listContainer,
          config,
          numItems,
          angleStep,
          currentRotation: 0
        };

        // Add class for CSS adjustments
        section.classList.add('carousel-3d-initialized');
      },

      animate: (section) => {
        const carousel = section._carousel3d;
        if (!carousel) return gsap.timeline();

        const { items, listContainer, config, numItems } = carousel;

        // Find content wrapper for pinning (Squarespace structure)
        const contentWrapper = section.querySelector('.content-wrapper') || section;

        // Create main timeline for scroll-based rotation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${config.scrollDistance}`,
            scrub: true,
            pin: contentWrapper,
            pinSpacing: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              // Update z-index based on rotation for proper layering
              const progress = self.progress;
              const rotation = progress * 360;

              items.forEach((item, i) => {
                const itemAngle = (i * 360 / numItems + rotation) % 360;
                const z = Math.round(Math.cos((itemAngle * Math.PI) / 180) * 100);
                gsap.set(item, { zIndex: z });
              });
            }
          }
        });

        // Add rotation animation
        tl.to(items, {
          rotationY: (i) => i * 360 / numItems - 360,
          ease: config.ease,
          transformOrigin: `50% 50% ${-config.radius}px`
        });

        // Optional: Add drag functionality if enabled
        if (config.enableDrag && typeof Draggable !== 'undefined') {
          const proxy = document.createElement('div');
          let startProgress = 0;

          Draggable.create(proxy, {
            trigger: listContainer,
            type: 'x',
            inertia: true,
            onPress() {
              startProgress = tl.progress();
            },
            onDrag() {
              const deltaX = this.x - this.startX;
              const newProgress = startProgress + deltaX / config.dragResistance;
              tl.progress(gsap.utils.wrap(0, 1)(newProgress));
            }
          });
        }

        // Optional: Auto-rotate when not interacting
        if (config.autoRotate) {
          const autoTl = gsap.timeline({ repeat: -1 });
          autoTl.to(items, {
            rotationY: (i) => i * 360 / numItems - 360,
            duration: config.autoRotateSpeed,
            ease: 'none',
            transformOrigin: `50% 50% ${-config.radius}px`
          });

          // Pause auto-rotation when scrolling
          ScrollTrigger.create({
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            onToggle: (self) => {
              if (self.isActive) {
                autoTl.pause();
              } else {
                autoTl.play();
              }
            }
          });
        }

        return tl;
      }
    },

    // Swapmove animation - mouse/scroll-based image swapping with movement
    swapmove: {
      init: (section) => {
        // Find the content element first (inside content-wrapper)
        const content = section.querySelector('.content');
        if (!content) {
          console.warn('Swapmove: No .content found in section', section.id);
          return;
        }

        // Find the gallery element within the content
        const gallery = content.querySelector('.sqs-gallery');
        const galleryContainer = content.querySelector('.sqs-gallery-container');
        const slides = content.querySelectorAll('.slide');

        if (!gallery || slides.length === 0) {
          console.warn('Swapmove: No gallery or slides found in section', section.id);
          return;
        }

        console.log('Swapmove: Initializing for section', section.id, 'with', slides.length, 'slides');

        // Create a new container structure similar to reference
        const swapmoveCard = document.createElement('div');
        swapmoveCard.className = 'swapmove-card';

        const mediasContainer = document.createElement('div');
        mediasContainer.className = 'swapmove-medias';

        // Extract images from slides and add them to our new container
        const images = [];
        slides.forEach((slide, index) => {
          const img = slide.querySelector('img');
          if (img) {
            // Handle lazy-loaded images
            const mediaCopy = img.cloneNode(true);
            mediaCopy.className = 'swapmove-media';

            // If image has data-src (lazy loading), use that as src
            if (img.dataset.src && !img.src) {
              mediaCopy.src = img.dataset.src;
            } else if (img.dataset.src) {
              // Use data-src if available as it's usually higher quality
              mediaCopy.src = img.dataset.src;
            }

            // Remove lazy loading attributes
            mediaCopy.removeAttribute('data-src');
            mediaCopy.removeAttribute('data-load');
            mediaCopy.removeAttribute('data-parent-ratio');
            mediaCopy.removeAttribute('style'); // Remove inline styles

            // Set loading to eager to ensure images load
            mediaCopy.loading = 'eager';

            if (index === 0) {
              mediaCopy.classList.add('on');
            }

            images.push(mediaCopy);
            mediasContainer.appendChild(mediaCopy);
          }
        });

        // Add the new structure to the section
        swapmoveCard.appendChild(mediasContainer);

        // Hide original gallery
        if (galleryContainer) {
          galleryContainer.style.display = 'none';
        } else if (gallery) {
          gallery.style.display = 'none';
        }

        // Insert our new card structure inside content element
        content.appendChild(swapmoveCard);

        // Store references for animation
        section._swapmoveCard = swapmoveCard;
        section._swapmoveMedias = mediasContainer;
        section._swapmoveImages = images;
        section._swapmoveInitialized = true;

        // Add class to section
        section.classList.add('swapmove-section');

        // Set initial position of card to center
        // We'll use transform to center it, starting from 0,0
        gsap.set(swapmoveCard, {
          x: 0,
          y: 0
        });

        // Set initial GSAP properties for the media container
        gsap.set(mediasContainer, {
          scale: 1.2,
          transformOrigin: 'center center'
        });

        // Force load all images
        images.forEach(img => {
          if (img.complete) return;
          // Trigger load by accessing the src
          const tempSrc = img.src;
          img.src = '';
          img.src = tempSrc;
        });
      },

      animate: (section) => {
        // Check if swapmove was properly initialized
        if (!section._swapmoveInitialized || !section._swapmoveCard) {
          console.warn('Swapmove: Not properly initialized, skipping animate');
          return;
        }

        const card = section._swapmoveCard;
        const medias = section._swapmoveMedias;
        const images = section._swapmoveImages;
        const nbMedias = images.length;

        const customConfig = section.hasAttribute('data-gsap-config')
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};

        // Merge with defaults
        const config = {
          ...animationParams.swapmove,
          ...customConfig
        };

        console.log('Swapmove: Starting animation for section', section.id, 'with config', config);

        // Create GSAP quickTo functions (matching reference)
        const xTo = gsap.quickTo(card, "x", {duration: 1, ease: "power4"});
        const yTo = gsap.quickTo(card, "y", {duration: 1, ease: "power4"});
        const rotationTo = gsap.quickTo(card, "rotation", {duration: 1, ease: "power4"});
        const xToMedias = gsap.quickTo(medias, "xPercent", {duration: 0.6, ease: "power2"});
        const yToMedias = gsap.quickTo(medias, "yPercent", {duration: 0.7, ease: "power2"});

        // Initialize variables (matching reference)
        let isMoving;
        let oldPosX = 0;
        let oldPosY = 0;
        let incr = 0;
        let index = 0;

        // Get container rect for relative positioning
        const content = section.querySelector('.content');
        const getContainerRect = () => content.getBoundingClientRect();

        // Handle mouse movement - simplified positioning
        const handleMouseMove = (e) => {
          const rect = getContainerRect();

          // Get mouse position relative to the container
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Delta on x and y relative to the previous iteration
          // Divided by two to reduce the amplitude
          const valueX = (e.clientX - oldPosX) / 2;
          const valueY = (e.clientY - oldPosY) / 2;

          // Return the clamp values
          const clampValueX = gsap.utils.clamp(-8, 8, valueX);
          const clampValueY = gsap.utils.clamp(-8, 8, valueY);

          // We calculate the difference between the current position and the previous one
          // Divided by 4 to reduce the rotation amplitude
          rotationTo((e.clientX - oldPosX) / 4);

          // Get card dimensions
          const cardWidth = rect.width * 0.2; // 20vw relative to container
          const cardHeight = cardWidth * 1.25; // aspect ratio 0.8

          // Position card at mouse position, offset by half its size to center it
          xTo(mouseX - cardWidth / 2);
          yTo(mouseY - cardHeight / 2);

          // In the opposite direction of the cursor movement
          xToMedias(-clampValueX);
          yToMedias(-clampValueY);

          // Update for the next iteration (use global coordinates for deltas)
          oldPosX = e.clientX;
          oldPosY = e.clientY;

          // Add the positive values of the deltas from the previous step
          incr += Math.abs(valueX) + Math.abs(valueY);
          if(incr > 300) {
            // Reset the incr variable
            incr = 0;

            // Hide the active image
            const currentOn = section.querySelector('.swapmove-media.on');
            if (currentOn) {
              currentOn.classList.remove('on');
            }

            // Display the next media
            images[index % nbMedias].classList.add('on');
            index++; // Increment the index for the next call
          }

          window.clearTimeout(isMoving);
          isMoving = setTimeout(() => {
            rotationTo(0);
            xToMedias(0);
            yToMedias(0);
          }, 66);
        };

        // Check if mobile/touch device
        const isTouchDevice = ('ontouchstart' in window) ||
                             (navigator.maxTouchPoints > 0) ||
                             (navigator.msMaxTouchPoints > 0);

        if (isTouchDevice) {
          // Mobile: Add tap/click handler for image cycling
          let tapIndex = 0;

          const handleTap = (e) => {
            // Check if the click/tap was on a link or button
            const target = e.target;
            const clickedLink = target.closest('a, button, [role="button"]');

            // If a link or button was clicked, don't interfere
            if (clickedLink) {
              console.log('Swapmove: Link/button clicked, allowing default behavior');
              return; // Let the link/button work normally
            }

            // Also check if clicking on form elements
            if (target.matches('input, textarea, select, label')) {
              return; // Let form elements work normally
            }

            // Don't prevent default for taps - we want to allow scrolling
            // Only prevent default for actual mouse clicks on desktop
            if (e.type === 'click' && !isTouchDevice) {
              e.preventDefault();
            }

            // Get touch/click position
            const rect = getContainerRect();
            const touchX = e.clientX - rect.left;
            const touchY = e.clientY - rect.top;

            // Get card dimensions for mobile (larger on mobile)
            const cardWidth = rect.width * 0.6; // 60vw on mobile
            const cardHeight = cardWidth * 1.25; // maintain aspect ratio

            // Position card at tap position
            gsap.to(card, {
              x: touchX - cardWidth / 2,
              y: touchY - cardHeight / 2,
              duration: 0.4,
              ease: "power2.out"
            });

            // Small rotation effect on tap
            gsap.to(card, {
              rotation: Math.random() * 10 - 5, // Random rotation between -5 and 5
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => {
                gsap.to(card, {
                  rotation: 0,
                  duration: 0.3,
                  ease: "power2.inOut"
                });
              }
            });

            // Hide current image and show next
            const currentOn = section.querySelector('.swapmove-media.on');
            if (currentOn) {
              currentOn.classList.remove('on');
            }

            // Cycle to next image
            tapIndex = (tapIndex + 1) % nbMedias;
            images[tapIndex].classList.add('on');

            // Add some movement to the media container
            gsap.to(medias, {
              scale: 1.1,
              duration: 0.2,
              ease: "power2.out",
              onComplete: () => {
                gsap.to(medias, {
                  scale: 1.2,
                  duration: 0.3,
                  ease: "power2.inOut"
                });
              }
            });
          };

          // Track touch start position to detect if it's a tap or scroll
          let touchStartX = 0;
          let touchStartY = 0;
          let touchStartTime = 0;

          const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
          };

          const handleTouchEnd = (e) => {
            // Check if it was a quick tap (not a long press or scroll)
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;

            // Get end position
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            // Calculate movement distance
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);

            // Only trigger if it's a tap (minimal movement and quick)
            if (deltaX < 10 && deltaY < 10 && touchDuration < 300) {
              // It's a tap, not a scroll - trigger the animation
              const fakeEvent = {
                type: 'tap',
                clientX: touchEndX,
                clientY: touchEndY,
                target: e.target,
                preventDefault: () => {}
              };
              handleTap(fakeEvent);
            }
          };

          // Add touch event listeners with passive true to not block scrolling
          section.addEventListener("touchstart", handleTouchStart, { passive: true });
          section.addEventListener("touchend", handleTouchEnd, { passive: true });
          section.addEventListener("click", handleTap);

          // Store cleanup function for mobile
          section._swapmoveCleanup = () => {
            section.removeEventListener("touchstart", handleTouchStart);
            section.removeEventListener("touchend", handleTouchEnd);
            section.removeEventListener("click", handleTap);
          };

          // Position card at center initially on mobile
          const rect = getContainerRect();
          const cardWidth = rect.width * 0.6;
          const cardHeight = cardWidth * 1.25;
          gsap.set(card, {
            x: rect.width / 2 - cardWidth / 2,
            y: rect.height / 2 - cardHeight / 2
          });

        } else {
          // Desktop: Keep existing mouse movement behavior
          window.addEventListener("mousemove", handleMouseMove);

          // Store cleanup function for desktop
          section._swapmoveCleanup = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.clearTimeout(isMoving);
          };
        }

        return true;
      }
    },

    // Sync animation - show/hide blocks based on other blocks in viewport
    sync: {
      init: (section) => {
        console.log('Sync animation: Initializing for section', section.id);

        // Process all blocks in the section to find sync and trigger blocks
        const allBlocks = section.querySelectorAll('.fe-block');
        const syncBlocks = [];
        const triggerBlocks = [];

        allBlocks.forEach(block => {
          // Check for sync blocks with synced- pattern in alt attributes or href
          const syncElements = block.querySelectorAll('img[alt*="synced-"], [alt*="synced-"], a[href*="#synced-"]');
          let foundSyncId = null;

          syncElements.forEach(element => {
            if (foundSyncId) return;

            // Check alt attribute
            const alt = element.getAttribute('alt') || '';
            const syncedMatch = alt.match(/synced-([^\s]+)/);
            if (syncedMatch) {
              foundSyncId = syncedMatch[1].toLowerCase();

              // Remove the keyword from alt text
              const cleanedAlt = alt.replace(/\s*synced-[^\s]+\s*/, ' ').trim();
              element.setAttribute('alt', cleanedAlt);

              console.log('Found sync block in alt:', foundSyncId, 'cleaned alt:', cleanedAlt);
            }

            // Check href attribute for links
            if (!foundSyncId && element.tagName === 'A') {
              const href = element.getAttribute('href') || '';
              const hrefMatch = href.match(/#synced-([^\s]+)/);
              if (hrefMatch) {
                foundSyncId = hrefMatch[1].toLowerCase();

                // Remove the href to prevent navigation
                element.removeAttribute('href');
                element.style.cursor = 'default';

                console.log('Found sync block in href:', foundSyncId);
              }
            }
          });

          if (foundSyncId) {
            block.dataset.syncId = foundSyncId;
            block.classList.add('sync-block');
            syncBlocks.push({ block, syncId: foundSyncId });
          }

          // Check for trigger blocks with trigger- pattern in alt attributes or href
          const triggerElements = block.querySelectorAll('img[alt*="trigger-"], [alt*="trigger-"], a[href*="#trigger-"]');
          let foundTriggerId = null;

          triggerElements.forEach(element => {
            if (foundTriggerId) return;

            // Check alt attribute
            const alt = element.getAttribute('alt') || '';
            const triggerMatch = alt.match(/trigger-([^\s]+)/);
            if (triggerMatch) {
              foundTriggerId = triggerMatch[1].toLowerCase();

              // Remove the keyword from alt text
              const cleanedAlt = alt.replace(/\s*trigger-[^\s]+\s*/, ' ').trim();
              element.setAttribute('alt', cleanedAlt);

              console.log('Found trigger block in alt:', foundTriggerId, 'cleaned alt:', cleanedAlt);
            }

            // Check href attribute for links
            if (!foundTriggerId && element.tagName === 'A') {
              const href = element.getAttribute('href') || '';
              const hrefMatch = href.match(/#trigger-([^\s]+)/);
              if (hrefMatch) {
                foundTriggerId = hrefMatch[1].toLowerCase();

                // Remove the href to prevent navigation
                element.removeAttribute('href');
                element.style.cursor = 'default';

                console.log('Found trigger block in href:', foundTriggerId);
              }
            }
          });

          if (foundTriggerId) {
            block.dataset.triggerId = foundTriggerId;
            block.classList.add('sync-trigger');
            triggerBlocks.push({ block, triggerId: foundTriggerId });
          }
        });

        // Sort trigger blocks by visual position (top coordinate) so array order
        // matches scroll order. This is critical because DOM order can differ from
        // visual order in Squarespace grid layouts.
        triggerBlocks.sort((a, b) => {
          return a.block.getBoundingClientRect().top - b.block.getBoundingClientRect().top;
        });

        // Store references
        section._syncBlocks = syncBlocks;
        section._triggerBlocks = triggerBlocks;
        section._syncInitialized = true;
        section._currentSyncId = null;

        // Hide all sync blocks initially
        syncBlocks.forEach(({ block }) => {
          gsap.set(block, {
            opacity: 0,
            visibility: 'hidden',
            pointerEvents: 'none'
          });
        });

        // Add class to section
        section.classList.add('sync-section');
      },

      animate: (section) => {
        if (!section._syncInitialized) {
          console.warn('Sync animation: Not properly initialized');
          return;
        }

        const syncBlocks = section._syncBlocks;
        const triggerBlocks = section._triggerBlocks;

        if (syncBlocks.length === 0 || triggerBlocks.length === 0) {
          console.log('Sync animation: No sync or trigger blocks found');
          return;
        }

        const customConfig = section.hasAttribute('data-gsap-config')
          ? JSON.parse(section.getAttribute('data-gsap-config'))
          : {};

        const syncConfig = {
          ...animationParams.sync,
          ...customConfig
        };

        // Parse rootMargin to derive ScrollTrigger start/end positions
        // rootMargin format: '-40% 0px -40% 0px' (top, right, bottom, left)
        const margins = syncConfig.rootMargin.split(' ');
        const topMarginPct = Math.abs(parseInt(margins[0])) || 40;
        const bottomMarginPct = Math.abs(parseInt(margins[2])) || 40;
        const startPct = 100 - topMarginPct;   // e.g. 60%
        const endPct = bottomMarginPct;         // e.g. 40%

        // Calculate which trigger should be active based on scroll position
        // Strategy: Find the trigger whose center is closest to viewport center
        const findActiveTriggerId = () => {
          const vpHeight = window.innerHeight;
          const vpCenter = vpHeight / 2;

          let bestTrigger = null;
          let bestScore = Infinity;

          for (const { block, triggerId } of triggerBlocks) {
            const rect = block.getBoundingClientRect();
            const triggerCenter = rect.top + rect.height / 2;
            const score = Math.abs(triggerCenter - vpCenter);

            if (score < bestScore) {
              bestScore = score;
              bestTrigger = triggerId;
            }
          }

          return bestTrigger || triggerBlocks[0].triggerId;
        };

        // Function to update active sync block
        const updateActiveSync = (suggestedTriggerId, useCalculation = false) => {
          // When triggered by scroll callbacks, calculate the correct trigger
          // instead of trusting the suggested one (avoids race conditions)
          const triggerId = useCalculation ? findActiveTriggerId() : suggestedTriggerId;

          if (section._currentSyncId === triggerId) return; // Already active

          console.log('Sync animation: Switching to', triggerId);

          // Hide all sync blocks
          syncBlocks.forEach(({ block, syncId }) => {
            if (syncId !== triggerId) {
              gsap.to(block, {
                opacity: 0,
                visibility: 'hidden',
                pointerEvents: 'none',
                duration: syncConfig.transitionDuration,
                ease: syncConfig.ease
              });
            }
          });

          // Show ALL matching sync blocks
          const matchingSyncs = syncBlocks.filter(({ syncId }) => syncId === triggerId);
          if (matchingSyncs.length > 0) {
            matchingSyncs.forEach(({ block }) => {
              gsap.to(block, {
                opacity: 1,
                visibility: 'visible',
                pointerEvents: 'auto',
                duration: syncConfig.transitionDuration,
                ease: syncConfig.ease
              });
            });

            // Update body data attribute
            document.body.dataset.sync = triggerId;
          }

          section._currentSyncId = triggerId;
        };

        // Use a direct scroll listener instead of ScrollTrigger callbacks.
        // This is more reliable because it doesn't depend on cached trigger positions.
        let scrollListenerReady = false;
        let scrollTimeout = null;

        const handleScroll = () => {
          if (!scrollListenerReady) return;

          // Debounce: wait for scroll to settle before recalculating
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            updateActiveSync(null, true);
          }, 50);
        };

        // Add scroll listener to the window
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Store cleanup function
        section._syncCleanup = () => {
          window.removeEventListener('scroll', handleScroll);
          if (scrollTimeout) clearTimeout(scrollTimeout);
        };

        // Default activation: Wait for page load + global ScrollTrigger refreshes.
        // Problem: On page refresh, browsers restore scroll position AFTER scripts run,
        // and global ScrollTrigger.refresh() calls happen at 200ms and 300ms.
        // Solution: Wait until after all that, then re-sort and calculate.

        // Helper to re-sort and activate
        const resortAndActivate = () => {
          // Re-sort trigger blocks by CURRENT visual position
          triggerBlocks.sort((a, b) => {
            return a.block.getBoundingClientRect().top - b.block.getBoundingClientRect().top;
          });
          updateActiveSync(null, true);
        };

        // Immediate activation (may be wrong on mid-page refresh, but avoids blank state)
        updateActiveSync(null, true);

        // Wait for load event + delay to ensure:
        // 1. Browser has restored scroll position
        // 2. Global ScrollTrigger.refresh() calls have completed (200ms, 300ms)
        const waitForStableState = () => {
          setTimeout(() => {
            resortAndActivate();
            scrollListenerReady = true; // Enable scroll listener
          }, 350); // After the 300ms global load refresh
        };

        if (document.readyState === 'complete') {
          // Page already loaded, just wait for refresh timing
          waitForStableState();
        } else {
          window.addEventListener('load', waitForStableState, { once: true });
        }

        // Also recalculate when ScrollTrigger refreshes (other animations may trigger this)
        ScrollTrigger.addEventListener('refresh', () => {
          if (scrollListenerReady) {
            resortAndActivate();
          }
        });

        return true;
      }
    },

    // Anchor animation - smoothly moves element to fixed bottom-right
    anchor: {
      init: (element) => {
        // Ensure element is visible and force paint
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.style.display = 'block';
        element.style.zIndex = '999';

        // Force layout recalculation and repaint
        void element.offsetHeight;

        // Store original position for reference
        const rect = element.getBoundingClientRect();
        element._anchorOriginalRect = rect;
        element._anchorScrollStart = window.scrollY;

        // Add class for identification
        element.classList.add('anchor-element');

        // Create a placeholder to maintain layout
        const placeholder = document.createElement('div');
        placeholder.style.width = rect.width + 'px';
        placeholder.style.height = rect.height + 'px';
        placeholder.style.display = 'none';
        placeholder.className = 'anchor-placeholder';
        element.parentNode.insertBefore(placeholder, element.nextSibling);
        element._anchorPlaceholder = placeholder;

        // Ensure GPU acceleration from start
        requestAnimationFrame(() => {
          element.style.transform = 'translateZ(0)';
          element.style.willChange = 'transform, left, top';
        });
      },

      animate: (element) => {
        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        // Merge with defaults
        const config = {
          ...animationParams.anchor,
          ...customConfig
        };

        // Calculate target position (bottom-right)
        const targetX = window.innerWidth - (config.offsetX || 20) - element._anchorOriginalRect.width;
        const targetY = window.innerHeight - (config.offsetY || 20) - element._anchorOriginalRect.height;

        // Create ScrollTrigger that smoothly moves the element
        ScrollTrigger.create({
          trigger: element,
          start: config.start || 'center top',
          end: config.end || '+=500',
          scrub: config.scrub !== undefined ? config.scrub : 1,
          markers: config.markers || false,
          onUpdate: (self) => {
            const progress = self.progress;

            if (progress > 0) {
              // Show placeholder to maintain layout
              if (element._anchorPlaceholder.style.display === 'none') {
                element._anchorPlaceholder.style.display = 'block';
              }

              // Calculate current scroll offset
              const scrollOffset = window.scrollY - element._anchorScrollStart;

              // Get original position relative to viewport
              const originalX = element._anchorOriginalRect.left;
              const originalY = element._anchorOriginalRect.top - scrollOffset;

              // Interpolate values
              const currentX = gsap.utils.interpolate(originalX, targetX, progress);
              const currentY = gsap.utils.interpolate(originalY, targetY, progress);
              const currentScale = gsap.utils.interpolate(1, config.scale || 1, progress);
              const currentOpacity = gsap.utils.interpolate(1, config.opacity || 1, progress);

              // Apply position and transform directly to style
              element.style.position = 'fixed';
              element.style.left = currentX + 'px';
              element.style.top = currentY + 'px';
              element.style.transform = `translate3d(0, 0, 0) scale(${currentScale})`;
              element.style.opacity = currentOpacity;
              element.style.zIndex = '1000';
              element.style.visibility = 'visible';
              element.style.display = 'block';
              element.style.willChange = 'transform, left, top';

              // Force repaint
              void element.offsetHeight;

              // Add progress-based classes
              if (progress < 1) {
                element.classList.add('anchor-transitioning');
                element.classList.remove('anchor-fixed');
              } else {
                element.classList.remove('anchor-transitioning');
                element.classList.add('anchor-fixed');
              }
            } else {
              // Reset to original position
              element._anchorPlaceholder.style.display = 'none';

              // Reset styles directly
              element.style.position = '';
              element.style.left = '';
              element.style.top = '';
              element.style.transform = '';
              element.style.opacity = '1';
              element.style.zIndex = '999';
              element.style.visibility = 'visible';
              element.style.display = '';
              element.style.willChange = '';

              element.classList.remove('anchor-transitioning', 'anchor-fixed');
            }
          },
          onLeave: () => {
            // Ensure final position is set directly
            element.style.position = 'fixed';
            element.style.left = 'auto';
            element.style.right = (config.offsetX || 20) + 'px';
            element.style.top = 'auto';
            element.style.bottom = (config.offsetY || 20) + 'px';
            element.style.transform = `translate3d(0, 0, 0) scale(${config.scale || 1})`;
            element.style.opacity = config.opacity || 1;
            element.style.visibility = 'visible';
            element.style.display = 'block';
            element.style.zIndex = '1000';
            element.classList.add('anchor-complete');
          },
          onEnterBack: () => {
            // Return to interpolated position when scrolling back
            element.classList.remove('anchor-complete');
          }
        });

        return gsap.timeline(); // Return empty timeline for consistency
      }
    },

    // Anchorbottom animation - uses Flip plugin for smooth transition to bottom-right
    anchorbottom: {
      init: (element) => {
        // Register Flip plugin if available
        if (typeof Flip !== 'undefined') {
          gsap.registerPlugin(Flip);
        } else {
          console.warn('Flip plugin not found. Please include GSAP Flip plugin for anchorbottom animation.');
          return;
        }

        // Store original parent before any manipulation
        element._anchorbottomOriginalParent = element.parentNode;

        // Add identification class
        element.classList.add('anchorbottom-element');

        // Create the target wrapper that will be fixed positioned
        const targetWrapper = document.createElement('div');
        targetWrapper.className = 'anchorbottom-target';
        targetWrapper.style.position = 'fixed';
        targetWrapper.style.bottom = '20px';
        targetWrapper.style.right = '20px';
        targetWrapper.style.zIndex = '1000';
        targetWrapper.style.visibility = 'hidden'; // Hidden initially
        targetWrapper.style.pointerEvents = 'none';
        document.body.appendChild(targetWrapper);

        // Store reference
        element._anchorbottomTarget = targetWrapper;

        // Ensure element is visible
        element.style.visibility = 'visible';
        element.style.opacity = '1';
      },

      animate: (element) => {
        if (!element._anchorbottomTarget || typeof Flip === 'undefined') {
          console.warn('Anchorbottom: Target or Flip plugin not available');
          return gsap.timeline();
        }

        const customConfig = element.hasAttribute('data-gsap-config')
          ? JSON.parse(element.getAttribute('data-gsap-config'))
          : {};

        // Merge with defaults from animationParams
        const config = {
          ...animationParams.anchorbottom,
          ...customConfig
        };

        const targetWrapper = element._anchorbottomTarget;
        const originalParent = element._anchorbottomOriginalParent;

        // Update target position based on config
        targetWrapper.style.bottom = config.offsetY + 'px';
        targetWrapper.style.right = config.offsetX + 'px';

        let isFlipping = false;
        let flipState = null;

        // Create ScrollTrigger
        ScrollTrigger.create({
          trigger: element,
          start: config.start,
          end: config.end,
          scrub: config.scrub,
          markers: config.markers || false,
          onUpdate: (self) => {
            const progress = self.progress;

            if (progress > 0 && progress < 1) {
              // During transition
              if (!isFlipping) {
                // Capture the initial state
                flipState = Flip.getState(element);

                // Move element to target wrapper
                targetWrapper.style.visibility = 'visible';
                targetWrapper.style.pointerEvents = 'auto';
                targetWrapper.appendChild(element);

                // Perform the Flip animation
                Flip.from(flipState, {
                  duration: config.duration,
                  ease: config.ease,
                  scale: true,
                  absolute: true,
                  onComplete: () => {
                    element.classList.add('anchorbottom-fixed');
                  }
                });

                isFlipping = true;
              }

              // Apply progress-based scaling/opacity if needed
              if (config.scale !== 1 || config.opacity !== undefined) {
                const currentScale = gsap.utils.interpolate(1, config.scale, progress);
                const currentOpacity = config.opacity !== undefined
                  ? gsap.utils.interpolate(1, config.opacity, progress)
                  : 1;

                gsap.set(element, {
                  scale: currentScale,
                  opacity: currentOpacity
                });
              }
            } else if (progress === 0 && isFlipping) {
              // Reset when scrolled back to start
              const reverseState = Flip.getState(element);

              // Move back to original parent
              originalParent.appendChild(element);
              targetWrapper.style.visibility = 'hidden';
              targetWrapper.style.pointerEvents = 'none';

              Flip.from(reverseState, {
                duration: config.duration,
                ease: config.ease,
                scale: true,
                absolute: true,
                onComplete: () => {
                  element.classList.remove('anchorbottom-fixed');
                }
              });

              isFlipping = false;
            }
          },
          onLeave: () => {
            // Ensure element is fully in target position
            element.classList.add('anchorbottom-complete');
          },
          onEnterBack: () => {
            element.classList.remove('anchorbottom-complete');
          }
        });

        return gsap.timeline();
      }
    }
  };

  // Utility Functions

  // Check if animation should be disabled/modified for reduced motion
  function shouldReduceMotion(animationType) {
    if (!reducedMotionEnabled) return false;

    // Essential animations always run normally
    if (animationAccessibility.essential.includes(animationType)) {
      return false;
    }

    // All other animations should be reduced
    return true;
  }

  // Get the accessibility tier for an animation type
  function getAnimationTier(animationType) {
    if (animationAccessibility.essential.includes(animationType)) return 'essential';
    if (animationAccessibility.subtle.includes(animationType)) return 'subtle';
    if (animationAccessibility.interactive.includes(animationType)) return 'interactive';
    if (animationAccessibility.complex.includes(animationType)) return 'complex';
    return 'complex'; // Default to complex if not classified
  }

  function getScrollTriggerConfig(element, customConfig) {
    // Standard ScrollTrigger configuration for replay animations
    if (!customConfig || !customConfig.replay) return {};

    const config = {
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play pause resume reset",
        markers: false,
        immediateRender: false,  // Prevent immediate render issues
        refreshPriority: 1,      // Higher priority for refresh
        invalidateOnRefresh: true  // Recalculate on refresh
      }
    };

    // For reduced motion, make ScrollTrigger instant
    if (reducedMotionEnabled) {
      config.scrollTrigger.toggleActions = "play none none none";
      config.duration = 0;
    }

    return config;
  }
  
  function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // Check if element is at least partially visible
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
    
    return vertInView && horInView;
  }
  
  function isElementAboveViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.bottom < 0;
  }
  
  // Helper function to parse numeric values with automatic decimal point insertion
  function parseNumericValue(str) {
    // If string starts with '0' followed by digits (but no decimal), insert decimal after '0'
    // Examples: '05' -> '0.5', '02' -> '0.2', '005' -> '0.05'
    if (/^0\d+$/.test(str)) {
      // Insert decimal point after the first '0'
      return parseFloat('0.' + str.substring(1));
    }
    // Otherwise parse normally
    return parseFloat(str);
  }
  
  function parseAnimationKeyword(keyword) {
    // Parse keywords ending with -scroll
    // Format: animationType[-parameterName[value][-parameterName[value]...]]-scroll
    // Examples: 
    //   splitText-scroll (uses all defaults)
    //   splitText-duration2-scroll (2 second duration)
    //   splitText-duration2-stagger0.5-scroll (2s duration, 0.5s stagger)
    //   fadeIn-duration3-ease-power4.out-scroll (3s duration with power4.out ease)
    //   parallax-speed2-offset30-scroll (2x speed, 30% offset)
    
    if (!keyword || !keyword.endsWith('-scroll')) return null;
    
    // Special case for circular-scroll animation
    if (keyword === 'circular-scroll' || keyword.startsWith('circular-')) {
      const config = {
        animation: 'circular-scroll'
      };

      // Parse any custom parameters from the keyword
      // Format: circular-parametervalue-scroll (e.g., circular-starttop-scroll)
      if (keyword.startsWith('circular-') && keyword !== 'circular-scroll') {
        const paramsString = keyword.slice(9, -7); // Remove 'circular-' and '-scroll'
        const parts = paramsString.split('-');

        for (const part of parts) {
          if (part === 'starttop') {
            config.startAtTop = true;
          } else if (part === 'startcenter') {
            config.startAtCenter = true;
          } else if (part.startsWith('threshold')) {
            const value = parseNumericValue(part.substring(9));
            if (!isNaN(value)) config.activationThreshold = value;
          } else if (part.startsWith('duration')) {
            const value = parseNumericValue(part.substring(8));
            if (!isNaN(value)) config.duration = value;
          }
        }
      }

      return config;
    }

    // Special case for turnleft90-scroll animation
    if (keyword === 'turnleft90-scroll' || keyword.startsWith('turnleft90-')) {
      const config = {
        animation: 'turnleft90-scroll'
      };

      // Parse any custom parameters from the keyword
      // Format: turnleft90-parametervalue-scroll (e.g., turnleft90-scrub2-scroll)
      if (keyword.startsWith('turnleft90-') && keyword !== 'turnleft90-scroll') {
        const paramsString = keyword.slice(11, -7); // Remove 'turnleft90-' and '-scroll'
        const parts = paramsString.split('-');

        for (const part of parts) {
          if (part.startsWith('scrub')) {
            const value = parseNumericValue(part.substring(5));
            if (!isNaN(value)) config.scrub = value;
          } else if (part.startsWith('start')) {
            const value = part.substring(5);
            if (value) config.start = value.replace('_', ' '); // Replace _ with space for values like top_80%
          } else if (part.startsWith('end')) {
            const value = part.substring(3);
            if (value) config.end = value.replace('_', ' ');
          }
        }
      }

      return config;
    }

    // Check for momentum animation (momentum-<property>-scroll)
    if (keyword.startsWith('momentum-')) {
      const paramsString = keyword.slice(9, -7); // Remove 'momentum-' and '-scroll'
      const params = {};

      if (paramsString) {
        // Parse parameters like velocityMultiplier30, rotateRange20, etc.
        const paramParts = paramsString.split('-');
        for (const part of paramParts) {
          if (part.startsWith('velocity')) {
            const value = parseNumericValue(part.substring(8));
            if (!isNaN(value)) params.velocityMultiplier = value;
          } else if (part.startsWith('rotate')) {
            const value = parseNumericValue(part.substring(6));
            if (!isNaN(value)) params.rotateRange = value;
          } else if (part.startsWith('duration')) {
            const value = parseNumericValue(part.substring(8));
            if (!isNaN(value)) params.duration = value;
          } else if (part.startsWith('timescale')) {
            const value = parseNumericValue(part.substring(9));
            if (!isNaN(value)) params.timeScale = value;
          }
        }
      }

      return {
        animation: 'momentum',
        ...params
      };
    }

    // Check for 3D carousel animation (3d-<property>-scroll)
    if (keyword.startsWith('3d-')) {
      const paramsString = keyword.slice(3, -7); // Remove '3d-' and '-scroll'
      const params = {};

      if (paramsString) {
        // Parse parameters like radius500, perspective1200, etc.
        const paramParts = paramsString.split('-');
        for (const part of paramParts) {
          if (part.startsWith('radius')) {
            const value = parseInt(part.replace('radius', ''));
            if (!isNaN(value)) params.radius = value;
          } else if (part.startsWith('perspective')) {
            const value = parseInt(part.replace('perspective', ''));
            if (!isNaN(value)) params.perspective = value;
          } else if (part.startsWith('speed')) {
            const value = parseNumericValue(part.replace('speed', ''));
            if (!isNaN(value)) params.rotationSpeed = value;
          } else if (part.startsWith('distance')) {
            const value = parseInt(part.replace('distance', ''));
            if (!isNaN(value)) params.scrollDistance = value;
          } else if (part.startsWith('itemwidth')) {
            const value = parseInt(part.replace('itemwidth', ''));
            if (!isNaN(value)) params.itemWidth = value;
          } else if (part === 'autorotate') {
            params.autoRotate = true;
          } else if (part === 'drag') {
            params.enableDrag = true;
          }
        }
      }

      return {
        animation: '3d',
        ...params
      };
    }

    // Check for swapmove animation (swapmove-<property>-scroll)
    if (keyword.startsWith('swapmove-')) {
      const paramsString = keyword.slice(9, -7); // Remove 'swapmove-' and '-scroll'
      const params = {};

      if (paramsString) {
        // Parse parameters like threshold500, scale2, etc.
        const paramParts = paramsString.split('-');
        for (const part of paramParts) {
          if (part.startsWith('threshold')) {
            const value = parseInt(part.replace('threshold', ''));
            if (!isNaN(value)) params.movementThreshold = value;
          } else if (part.startsWith('rotation')) {
            const value = parseNumericValue(part.replace('rotation', ''));
            if (!isNaN(value)) params.rotationScale = value;
          } else if (part.startsWith('parallax')) {
            const value = parseNumericValue(part.replace('parallax', ''));
            if (!isNaN(value)) params.parallaxScale = value;
          } else if (part.startsWith('speed')) {
            const value = parseNumericValue(part.replace('speed', ''));
            if (!isNaN(value)) params.followSpeed = value;
          } else if (part.startsWith('scale')) {
            const value = parseNumericValue(part.replace('scale', ''));
            if (!isNaN(value)) params.containerScale = value;
          } else if (part === 'scroll') {
            params.trigger = 'scroll';
          } else if (part === 'mouse' || part === 'mousemove') {
            params.trigger = 'mousemove';
          }
        }
      }

      return {
        animation: 'swapmove',
        ...params
      };
    }

    // Check for sync animation (sync-<property>-scroll)
    if (keyword.startsWith('sync-')) {
      const paramsString = keyword.slice(5, -7); // Remove 'sync-' and '-scroll'
      const params = {};

      if (paramsString) {
        // Parse parameters like margin50, duration05, etc.
        const paramParts = paramsString.split('-');
        for (const part of paramParts) {
          if (part.startsWith('margin')) {
            const value = parseInt(part.replace('margin', ''));
            if (!isNaN(value)) {
              // Convert to rootMargin string format
              params.rootMargin = `-${value}% 0px -${value}% 0px`;
            }
          } else if (part.startsWith('duration')) {
            const value = parseNumericValue(part.replace('duration', ''));
            if (!isNaN(value)) params.transitionDuration = value;
          }
        }
      }

      return {
        animation: 'sync',
        ...params
      };
    }

    // Remove -scroll suffix
    const withoutScroll = keyword.slice(0, -7);
    const parts = withoutScroll.split('-');
    
    // First part is always the animation type
    const animationType = parts[0];
    
    // Check if animation exists
    if (!animations[animationType]) return null;
    
    // Get default configuration for this animation type
    const defaults = animationParams[animationType] || {};
    
    // Start with animation type and defaults
    const config = {
      animation: animationType,
      ...defaults  // Spread default values
    };
    
    // Parse parameters (starting from index 1)
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      // Try to match known parameter patterns
      // Match patterns like: duration2, stagger0.5, ease-power3.out, direction-x, from-center
      
      // Check for duration
      if (part.startsWith('duration')) {
        const value = parseNumericValue(part.substring(8));
        if (!isNaN(value)) {
          config.duration = value;
        }
      }
      // Check for stagger
      else if (part.startsWith('stagger')) {
        const value = parseNumericValue(part.substring(7));
        if (!isNaN(value)) {
          config.stagger = value;
        }
      }
      // Check for delay
      else if (part.startsWith('delay')) {
        const value = parseNumericValue(part.substring(5));
        if (!isNaN(value)) {
          config.delay = value;
        }
      }
      // Check for ease (might contain special characters)
      else if (part.startsWith('ease')) {
        // Handle ease functions that might span multiple parts due to dots
        let easeValue = part.substring(4);
        // Check if next part might be part of the ease function (e.g., "out" in "power3.out")
        if (i + 1 < parts.length && (parts[i + 1] === 'out' || parts[i + 1] === 'in' || parts[i + 1] === 'inOut')) {
          easeValue += '.' + parts[++i];
        }
        config.ease = easeValue;
      }
      // Animation-specific parameters
      else if (part.startsWith('y')) {
        const value = parseNumericValue(part.substring(1));
        if (!isNaN(value)) {
          config.y = value;
        }
      }
      else if (part.startsWith('x')) {
        const value = parseNumericValue(part.substring(1));
        if (!isNaN(value)) {
          config.x = value;
        }
      }
      else if (part.startsWith('scale')) {
        const value = parseNumericValue(part.substring(5));
        if (!isNaN(value)) {
          config.scale = value;
        }
      }
      else if (part.startsWith('distance')) {
        const value = parseNumericValue(part.substring(8));
        if (!isNaN(value)) {
          config.distance = value;
        }
      }
      else if (part.startsWith('rotationX')) {
        const value = parseNumericValue(part.substring(9));
        if (!isNaN(value)) {
          config.rotationX = value;
        }
      }
      else if (part.startsWith('skewY')) {
        const value = parseNumericValue(part.substring(5));
        if (!isNaN(value)) {
          config.skewY = value;
        }
      }
      else if (part.startsWith('perspective')) {
        const value = parseNumericValue(part.substring(11));
        if (!isNaN(value)) {
          config.perspective = value;
        }
      }
      else if (part.startsWith('transformOrigin')) {
        config.transformOrigin = part.substring(15);
      }
      // Parallax-specific
      else if (part.startsWith('speed')) {
        const value = parseNumericValue(part.substring(5));
        if (!isNaN(value)) {
          config.speed = value;
        }
      }
      else if (part.startsWith('offsetX')) {
        const value = parseNumericValue(part.substring(7));
        if (!isNaN(value)) {
          config.offsetX = value;
        }
      }
      else if (part.startsWith('offsetY')) {
        const value = parseNumericValue(part.substring(7));
        if (!isNaN(value)) {
          config.offsetY = value;
        }
      }
      else if (part.startsWith('offset')) {
        const value = parseNumericValue(part.substring(6));
        if (!isNaN(value)) {
          // For anchor animation, set both X and Y offset
          if (animationType === 'anchor') {
            config.offsetX = value;
            config.offsetY = value;
          } else {
            config.offset = value;
          }
        }
      }
      else if (part.startsWith('direction')) {
        config.direction = part.substring(9); // x, y, or both
      }
      // Stagger from direction
      else if (part.startsWith('from')) {
        config.from = part.substring(4); // start, end, center, edges
      }
      // Replay parameter
      else if (part === 'replay') {
        config.replay = true;
      }
      // Scrub parameter for scroll-linked animations
      else if (part.startsWith('scrub')) {
        const valueStr = part.substring(5);
        if (valueStr === '' || valueStr === 'true') {
          config.scrub = true;
        } else {
          const value = parseNumericValue(valueStr);
          if (!isNaN(value)) {
            config.scrub = value;
          }
        }
      }
      // ScrollTrigger start position (e.g., start-top_80 becomes "top 80%")
      else if (part.startsWith('start')) {
        let startValue = part.substring(5);
        // Replace underscores with spaces and add % where appropriate
        startValue = startValue.replace(/_/g, ' ');
        // Add % to numeric values (e.g., 80 becomes 80%)
        startValue = startValue.replace(/(\d+)(?!%)/g, '$1%');
        config.start = startValue;
      }
      // ScrollTrigger end position
      else if (part.startsWith('end')) {
        let endValue = part.substring(3);
        // Replace underscores with spaces and add % where appropriate
        endValue = endValue.replace(/_/g, ' ');
        // Add % to numeric values
        endValue = endValue.replace(/(\d+)(?!%)/g, '$1%');
        config.end = endValue;
      }
      // Rotation-specific
      else if (part.startsWith('rotation')) {
        const value = parseNumericValue(part.substring(8));
        if (!isNaN(value)) {
          config.rotation = value;
        }
      }
      // Tilt-specific
      else if (part.startsWith('maxTilt')) {
        const value = parseNumericValue(part.substring(7));
        if (!isNaN(value)) {
          config.maxTilt = value;
        }
      }
      else if (part.startsWith('speed') && animationType === 'tilt') {
        const value = parseNumericValue(part.substring(5));
        if (!isNaN(value)) {
          config.speed = value;
        }
      }
      // Horizontal scroll parameters
      else if (part.startsWith('gap')) {
        const value = parseNumericValue(part.substring(3));
        if (!isNaN(value)) {
          config.gap = value;
        }
      }
      else if (part.startsWith('scrub')) {
        const value = parseNumericValue(part.substring(5));
        if (!isNaN(value)) {
          config.scrub = value;
        }
      }
      else if (part.startsWith('width')) {
        config.sectionWidth = part.substring(5); // e.g., width80vw
      }
      else if (part === 'markers') {
        config.markers = true;
      }
      // ScrollTrigger start/end positions
      else if (part.startsWith('start')) {
        // Handle start positions like startTop80, startCenter, etc.
        config.start = part.substring(5).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
      }
      else if (part.startsWith('end')) {
        // Handle end positions like endBottom20, endCenter, etc.
        config.end = part.substring(3).replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
      }
      // DrawSVG-specific parameters
      else if (part.startsWith('drawFrom')) {
        // Handle drawFrom values like drawFrom50
        const value = part.substring(8);
        config.drawFrom = value + '%';
      }
      else if (part.startsWith('drawTo')) {
        // Handle drawTo values like drawTo75
        const value = part.substring(6);
        config.drawTo = value + '%';
      }
      else if (part === 'fromCenter') {
        config.fromCenter = true;
      }
      else if (part === 'reverse') {
        config.reverse = true;
      }
      // Horizontal gallery-specific parameters
      else if (part === 'pin' || part === 'nopin') {
        config.pin = part === 'pin';
      }
      else if (part === 'pincontent') {
        config.pincontent = true;
      }
      // Path gallery-specific parameters (wheel-controlled carousel)
      else if (part === 'nodynamic') {
        config.dynamicY = false;
      }
      else if (part.startsWith('sensitivity')) {
        const value = parseNumericValue(part.substring(11));
        if (!isNaN(value)) {
          config.wheelSensitivity = value;
        }
      }
      else if (part.startsWith('maxrotation')) {
        const value = parseNumericValue(part.substring(11));
        if (!isNaN(value)) {
          config.maxRotation = value;
        }
      }
      else if (part.startsWith('itemwidth')) {
        const value = part.substring(9);
        config.itemWidth = value + 'px';
      }
    }
    
    return config;
  }
  
  function extractKeywordFromHref(href) {
    // Parse animation keywords from href
    // Format: #animationType-scroll or #animationType-params-scroll
    if (!href || !href.startsWith('#')) return null;
    
    const hashContent = href.slice(1); // Remove #
    
    // Only process if it ends with -scroll
    if (hashContent.endsWith('-scroll')) {
      return parseAnimationKeyword(hashContent);
    }
    
    return null;
  }

  function processBlockAnimations() {
    // Find all links with animation patterns ending in -scroll
    const animationLinks = document.querySelectorAll('a[href*="-scroll"]');
    
    animationLinks.forEach(link => {
      const animConfig = extractKeywordFromHref(link.getAttribute('href'));
      if (!animConfig || !animConfig.animation || !animations[animConfig.animation]) return;
      
      // Find the nearest parent .sqs-block, .fe-block, or .list-item
      const block = link.closest('.sqs-block, .fe-block, .list-item');
      if (!block) return;
      
      // Add class and mark for animation
      block.classList.add(`animation-${animConfig.animation}`);
      block.setAttribute('data-gsap-animation', animConfig.animation);
      
      // Store custom parameters if present (check for any non-default params)
      const hasCustomParams = Object.keys(animConfig).some(key => 
        key !== 'animation' && animConfig[key] !== undefined
      );
      if (hasCustomParams) {
        block.setAttribute('data-gsap-config', JSON.stringify(animConfig));
      }

      // Initialize animation
      // Only skip init for the specific animations we're disabling with reduced motion
      if (animations[animConfig.animation].init) {
        const shouldSkipInit = reducedMotionEnabled &&
                              ['rotate', 'slideInLeft', 'slideInRight', 'slideOutLeft', 'slideOutRight', 'turnleft90-scroll', 'tilt', 'momentum'].includes(animConfig.animation);

        if (!shouldSkipInit) {
          animations[animConfig.animation].init(block);
        }
      }
    });

    // Find all elements with alt attributes ending with -scroll
    const elementsWithAlt = document.querySelectorAll('[alt*="-scroll"]');
    
    elementsWithAlt.forEach(element => {
      const altText = element.getAttribute('alt') || '';
      
      // Extract animation keyword from alt text (anything ending with -scroll)
      // Match patterns like: "image description splitText-scroll" or "20-0.5-splitText-scroll"
      const match = altText.match(/([\w\d.-]+-scroll)(?:\s|$)/);
      if (!match) return;
      
      const animKeyword = match[1];
      const animConfig = parseAnimationKeyword(animKeyword);
      
      if (!animConfig || !animConfig.animation || !animations[animConfig.animation]) return;
      
      // Find the nearest parent .sqs-block, .fe-block, or .list-item
      const block = element.closest('.sqs-block, .fe-block, .list-item');
      if (!block) return;
      
      // Skip if already processed
      if (block.hasAttribute('data-gsap-animation')) return;
      
      // Add class and mark for animation
      block.classList.add(`animation-${animConfig.animation}`);
      block.setAttribute('data-gsap-animation', animConfig.animation);
      
      // Store custom parameters if present (check for any non-default params)
      const hasCustomParams = Object.keys(animConfig).some(key => 
        key !== 'animation' && animConfig[key] !== undefined
      );
      if (hasCustomParams) {
        block.setAttribute('data-gsap-config', JSON.stringify(animConfig));
      }
      
      // Clean the alt text by removing the animation keyword
      const cleanedAlt = altText.replace(animKeyword, '').trim();
      element.setAttribute('alt', cleanedAlt);

      // Initialize animation
      // Only skip init for the specific animations we're disabling with reduced motion
      if (animations[animConfig.animation].init) {
        const shouldSkipInit = reducedMotionEnabled &&
                              ['rotate', 'slideInLeft', 'slideInRight', 'slideOutLeft', 'slideOutRight', 'turnleft90-scroll', 'tilt', 'momentum'].includes(animConfig.animation);

        if (!shouldSkipInit) {
          animations[animConfig.animation].init(block);
        }
      }
    });
  }

  function processHorizontalScrollSections() {
    // Use setTimeout to ensure Squarespace edit mode elements are in DOM
    setTimeout(function() {
      // Skip horizontal scroll initialization when reduced motion is enabled
      if (reducedMotionEnabled) {
        console.log('Horizontal scroll disabled: Reduced motion preference detected');
        return;
      }

      // Check if site is in edit mode (Squarespace specific)
      const isEditMode = document.querySelector('.sqs-jacquard') !== null ||
                         document.body.classList.contains('sqs-edit-mode') ||
                         document.body.classList.contains('sqs-edit-mode-active') ||
                         window.top !== window.self; // Also check if in iframe (preview mode)

      if (isEditMode) {
        console.log('Horizontal scroll disabled: Site is in edit mode');
        return;
      }
      
      // Find sections marked as horizontal scroll start and end
      const startSections = document.querySelectorAll('.page-section[id*="horizontal-start"]');
      
      startSections.forEach(startSection => {
        // Extract any parameters from the start section ID
        const startId = startSection.getAttribute('id') || '';
        let animConfig = {};
        
        // Check if it has the -scroll suffix and parse parameters
        if (startId.endsWith('-scroll')) {
          animConfig = parseAnimationKeyword(startId) || {};
        }
        
        // Find the corresponding end section
        let endSection = null;
        let nextSibling = startSection.nextElementSibling;
        const sectionsToWrap = [startSection];
        
        while (nextSibling) {
          if (nextSibling.classList.contains('page-section')) {
            sectionsToWrap.push(nextSibling);
            
            const nextId = nextSibling.getAttribute('id') || '';
            if (nextId.includes('horizontal-end')) {
              endSection = nextSibling;
              break;
            }
          }
          nextSibling = nextSibling.nextElementSibling;
        }
        
        if (!endSection) {
          console.warn('No matching horizontal-end section found for:', startId);
          return;
        }
        
        // Create horizontal scroll wrapper
        createHorizontalScrollWrapper(sectionsToWrap, animConfig);
      });
    }, 100); // Wait 100ms to ensure edit mode elements are in DOM
  }
  
  function createHorizontalScrollWrapper(sections, config = {}) {
    if (!sections || sections.length === 0) return;
    
    // Store references for cleanup
    const firstSection = sections[0];
    const parentElement = firstSection.parentNode;
    
    // Create container structure
    const outerContainer = document.createElement('section');
    outerContainer.className = 'ss-horizontal-container';
    outerContainer.setAttribute('data-horizontal-scroll', 'true');
    
    // Create sticky wrapper
    const stickyWrapper = document.createElement('div');
    stickyWrapper.className = 'ss-horizontal-sticky';
    
    // Create scroll wrapper
    const innerWrapper = document.createElement('div');
    innerWrapper.className = 'ss-horizontal-wrapper';
    
    // Insert outer container before the first section
    parentElement.insertBefore(outerContainer, firstSection);
    
    // Move all sections inside the inner wrapper
    sections.forEach(section => {
      section.classList.add('ss-horizontal-section');
      innerWrapper.appendChild(section);
    });
    
    // Build the structure
    stickyWrapper.appendChild(innerWrapper);
    outerContainer.appendChild(stickyWrapper);
    
    // Variables for scroll calculations
    let distance, horizontalStart, horizontalEnd;
    let ticking = false;
    let lastScrollTop = window.pageYOffset;
    
    // Calculate scroll distance
    const setDistance = () => {
      const scrollWrapperWidth = innerWrapper.offsetWidth;
      distance = scrollWrapperWidth - window.innerWidth;
      return distance;
    };
    
    // Set container height based on scroll distance
    const setContainerHeight = () => {
      const baseHeight = window.innerHeight;
      outerContainer.style.height = `${baseHeight + distance}px`;
    };
    
    // Calculate start position
    const setHorizontalStart = () => {
      horizontalStart = outerContainer.offsetTop;
    };
    
    // Calculate end position
    const setHorizontalEnd = () => {
      horizontalEnd = horizontalStart + distance;
    };
    
    // Initialize all calculations
    const initCalculations = () => {
      setDistance();
      setContainerHeight();
      setHorizontalStart();
      setHorizontalEnd();
    };
    
    // Handle scroll event with vanilla JS
    const handleScroll = () => {
      lastScrollTop = window.pageYOffset;
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Only apply horizontal scroll on desktop (> 767px)
          if (window.innerWidth > 767) {
            if (lastScrollTop >= horizontalStart && lastScrollTop <= horizontalEnd) {
              const percentage = (lastScrollTop - horizontalStart) / (horizontalEnd - horizontalStart);
              const horizontalScroll = percentage * distance;
              innerWrapper.style.transform = `translateX(-${horizontalScroll}px)`;
              innerWrapper.style.setProperty('--scroll-progress', percentage);
            } else if (lastScrollTop < horizontalStart) {
              innerWrapper.style.transform = 'translateX(0)';
              innerWrapper.style.setProperty('--scroll-progress', 0);
            } else if (lastScrollTop > horizontalEnd) {
              innerWrapper.style.transform = `translateX(-${distance}px)`;
              innerWrapper.style.setProperty('--scroll-progress', 1);
            }
          } else {
            // Reset on mobile
            innerWrapper.style.transform = 'translateX(0)';
            outerContainer.style.height = 'auto';
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Add necessary styles if not already added
    if (!document.querySelector('#horizontal-scroll-styles')) {
      const style = document.createElement('style');
      style.id = 'horizontal-scroll-styles';
      style.textContent = `
        .ss-horizontal-container {
          display: block;
          position: relative;
          top: 0;
          left: 0;
          width: 100vw;
          transform: translateX(0);
        }
        
        .ss-horizontal-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100vw;
          display: block;
          overflow: hidden;
        }
        
        .ss-horizontal-wrapper {
          height: 100vh;
          display: flex;
          overflow: hidden;
          width: ${sections.length * 100}vw;
          will-change: transform;
        }
        
        .ss-horizontal-section {
          flex: none;
          width: 100vw;
          height: 100vh;
          padding: 2rem;
          margin: 0;
          box-sizing: border-box;
        }
        
        /* Mobile styles - sections remain vertical (< 767px) */
        @media (max-width: 767px) {
          .ss-horizontal-container {
            height: auto !important;
          }
          
          .ss-horizontal-sticky {
            position: relative;
            height: auto;
          }
          
          .ss-horizontal-wrapper {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            transform: none !important;
          }
          
          .ss-horizontal-section {
            width: 100% !important;
            height: auto !important;
            display: block !important;
            padding: 2rem 1rem;
          }
        }
        
        /* Smooth fade-in for sections */
        .ss-horizontal-wrapper .page-section {
          opacity: 0;
          animation: fadeInHorizontal 0.5s ease forwards;
          animation-delay: 0.1s;
        }
        
        @keyframes fadeInHorizontal {
          to {
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Initialize calculations
    initCalculations();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Handle resize events
    let prevWidth = window.innerWidth;
    const handleResize = () => {
      if (window.innerWidth !== prevWidth) {
        prevWidth = window.innerWidth;
        
        // Recalculate on resize
        if (window.innerWidth > 767) {
          initCalculations();
          handleScroll(); // Update position after resize
        } else {
          // Reset for mobile
          innerWrapper.style.transform = 'translateX(0)';
          outerContainer.style.height = 'auto';
        }
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Store references for potential cleanup
    outerContainer._handleScroll = handleScroll;
    outerContainer._handleResize = handleResize;
    outerContainer._innerWrapper = innerWrapper;
    
    // Add markers if requested (for debugging)
    if (config.markers) {
      const startMarker = document.createElement('div');
      startMarker.style.cssText = 'position: absolute; top: 0; left: 10px; padding: 5px; background: red; color: white; z-index: 9999; font-size: 12px;';
      startMarker.textContent = 'Horizontal Start';
      outerContainer.appendChild(startMarker);
      
      const endMarker = document.createElement('div');
      endMarker.style.cssText = 'position: absolute; bottom: 0; left: 10px; padding: 5px; background: blue; color: white; z-index: 9999; font-size: 12px;';
      endMarker.textContent = 'Horizontal End';
      outerContainer.appendChild(endMarker);
    }
  }
  
  function processSectionAnimations() {
    // Check if site is in edit mode (Squarespace specific)
    const isEditMode = document.querySelector('.sqs-jacquard') !== null || 
                      document.body.classList.contains('sqs-edit-mode') ||
                      document.body.classList.contains('sqs-edit-mode-active') ||
                      window.top !== window.self; // Also check if in iframe (preview mode)
    
    // Process horizontal scroll sections first
    processHorizontalScrollSections();
    
    // Find all page sections with IDs ending in -scroll (excluding horizontal markers)
    const sections = document.querySelectorAll('.page-section[id$="-scroll"]');
    
    sections.forEach(section => {
      const sectionId = section.getAttribute('id') || '';
      
      // Skip horizontal scroll markers as they're handled separately
      if (sectionId.includes('horizontal-start') || sectionId.includes('horizontal-end')) {
        return;
      }
      
      // Parse the animation configuration from the ID
      const animConfig = parseAnimationKeyword(sectionId);

      // Debug logging for 3D carousel
      if (sectionId && sectionId.includes('3d')) {
        console.log('Parsing section ID:', sectionId);
        console.log('Parsed config:', animConfig);
      }

      if (!animConfig || !animConfig.animation || !animations[animConfig.animation]) return;
      
      // Skip flip, hgallery, circular-scroll, and 3d animations entirely in edit mode
      if (isEditMode && (animConfig.animation === 'flip' || animConfig.animation === 'hgallery' || animConfig.animation === 'circular-scroll' || animConfig.animation === '3d')) {
        console.log(`Skipping ${animConfig.animation} animation in edit mode for section:`, sectionId);
        return;
      }
      
      // No longer skip circular-scroll on mobile - we'll handle touch events
      // Removed the mobile/touch check for circular-scroll
      
      // Add class and mark for animation
      section.classList.add(`effect-${animConfig.animation}`);
      section.setAttribute('data-gsap-animation', animConfig.animation);

      // Store ALL parsed parameters (including radius, itemWidth, etc.)
      // Remove the animation type from config before storing
      const { animation, ...configParams } = animConfig;
      if (Object.keys(configParams).length > 0) {
        section.setAttribute('data-gsap-config', JSON.stringify(configParams));
      }

      // Initialize animation
      // Only skip init for the specific animations we're disabling with reduced motion
      if (animations[animConfig.animation].init) {
        const shouldSkipInit = reducedMotionEnabled &&
                              ['rotate', 'slideInLeft', 'slideInRight', 'slideOutLeft', 'slideOutRight', 'hgallery', 'draw', '3d', 'momentum'].includes(animConfig.animation);

        if (!shouldSkipInit) {
          animations[animConfig.animation].init(section);
        }
      }
    });
  }

  function createObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animationType = element.getAttribute('data-gsap-animation');

          if (animationType && animations[animationType]) {
            // Accessibility: Handle reduced motion for observer-triggered animations
            if (reducedMotionEnabled && shouldReduceMotion(animationType)) {
              const tier = getAnimationTier(animationType);

              if (tier === 'subtle' || tier === 'complex') {
                // Special handling for text animations that use SplitText
                if (['splitText', 'splitWords', 'splitLines'].includes(animationType)) {
                  // First, initialize the animation to set up SplitText
                  if (animations[animationType].init) {
                    animations[animationType].init(element);
                  }

                  // Then find all split text elements and make them visible immediately
                  const splitElements = element.querySelectorAll('.split-char, .split-word, .split-line');
                  if (splitElements.length > 0) {
                    gsap.set(splitElements, {
                      opacity: 1,
                      y: 0,
                      yPercent: 0,
                      rotationX: 0,
                      skewY: 0,
                      clearProps: 'transform'
                    });
                  }

                  // Ensure parent elements are visible
                  const textElements = element.querySelectorAll('.split-text-initialized, .split-words-initialized, .split-lines-initialized');
                  textElements.forEach(el => {
                    el.style.opacity = '1';
                    el.style.visibility = 'visible';
                  });
                }

                // Instantly show final state
                gsap.set(element, { clearProps: "all" });
                element.style.opacity = '1';
                element.style.visibility = 'visible';
                element.classList.add('gsap-animated');
                observer.unobserve(element);
                return;
              }
              // Interactive tier continues to animate() method for simplified behavior
            }

            // Trigger animation
            animations[animationType].animate(element);

            // Unobserve after triggering (only for non-replay animations)
            observer.unobserve(element);
          }
        }
      });
    }, config.observerOptions);

    return observer;
  }


  // Initialization
  function init() {
    // Check if GSAP and required plugins are loaded
    if (typeof gsap === 'undefined') {
      console.error('GSAP library not found. Please include GSAP before this script.');
      return;
    }

    if (typeof SplitText === 'undefined') {
      console.warn('SplitText plugin not found. Text animations will use fallback method.');
    }

    // Register plugins
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    if (typeof SplitText !== 'undefined') {
      gsap.registerPlugin(SplitText);
    }
    if (typeof DrawSVGPlugin !== 'undefined') {
      gsap.registerPlugin(DrawSVGPlugin);
    }
    if (typeof InertiaPlugin !== 'undefined') {
      gsap.registerPlugin(InertiaPlugin);
    }
    if (typeof Draggable !== 'undefined') {
      gsap.registerPlugin(Draggable);
    }

    // IMPORTANT: Check reduced motion preference FIRST, before processing any animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionEnabled = prefersReducedMotion.matches;

    if (reducedMotionEnabled) {
      console.log('GSAP Animations: Reduced motion preference detected. Animations will be minimized.');
      document.body.classList.add('gsap-reduced-motion');
    }

    // Set up listener for preference changes
    prefersReducedMotion.addEventListener('change', (e) => {
      reducedMotionEnabled = e.matches;
      if (e.matches) {
        console.log('GSAP Animations: Reduced motion enabled.');
        document.body.classList.add('gsap-reduced-motion');
      } else {
        console.log('GSAP Animations: Reduced motion disabled.');
        document.body.classList.remove('gsap-reduced-motion');
      }
    });

    // Process animations (now reducedMotionEnabled is set correctly)
    processBlockAnimations();
    processSectionAnimations();
    
    // Set up intersection observer for non-replay animations
    const observer = createObserver();
    
    // Process all elements with animations
    document.querySelectorAll('[data-gsap-animation]').forEach(element => {
      const animConfig = element.hasAttribute('data-gsap-config')
        ? JSON.parse(element.getAttribute('data-gsap-config'))
        : null;

      const animationType = element.getAttribute('data-gsap-animation');

      // Accessibility: Handle reduced motion preference
      // Only disable these specific animations: rotate, slideInLeft, slideInRight, slideOutLeft, slideOutRight
      if (reducedMotionEnabled && ['rotate', 'slideInLeft', 'slideInRight', 'slideOutLeft', 'slideOutRight'].includes(animationType)) {
        // Instantly show final state without animation
        gsap.set(element, { clearProps: "all" });
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.classList.add('gsap-animated');
        return; // Skip rest of processing
      }

      // Special handling for text animations that use SplitText
      if (reducedMotionEnabled && ['splitText', 'splitWords', 'splitLines'].includes(animationType)) {
        // First, initialize the animation to set up SplitText
        if (animations[animationType] && animations[animationType].init) {
          animations[animationType].init(element);
        }

        // Then find all split text elements and make them visible immediately
        const splitElements = element.querySelectorAll('.split-char, .split-word, .split-line');
        if (splitElements.length > 0) {
          gsap.set(splitElements, {
            opacity: 1,
            y: 0,
            yPercent: 0,
            rotationX: 0,
            skewY: 0,
            clearProps: 'transform'
          });
        }

        // Ensure parent elements are visible
        const textElements = element.querySelectorAll('.split-text-initialized, .split-words-initialized, .split-lines-initialized');
        textElements.forEach(el => {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
        });

        // Mark as complete and skip rest of processing
        element.classList.add('gsap-animated');
        return;
      }

      // Check if animation uses ScrollTrigger by default
      // Note: slideInLeft and slideInRight now use ScrollTrigger by default (scrub: 1)
      const usesScrollTrigger = ['parallax', 'flip', 'slideOutRight', 'slideOutLeft', 'rotate', 'turnleft90-scroll', 'draw', 'hgallery', 'circular-scroll', '3d', 'slideInLeft', 'slideInRight', 'sync'].includes(animationType);

      // Check if slideInLeft/slideInRight have scrub explicitly disabled
      const isSlideInWithoutScrub = (animationType === 'slideInLeft' || animationType === 'slideInRight') &&
                                     animConfig && (animConfig.scrub === false || animConfig.scrub === 0);

      if ((animConfig && animConfig.replay) || (usesScrollTrigger && !isSlideInWithoutScrub) || animationType === 'tilt') {
        // For replay animations or ScrollTrigger-based animations, call animate directly
        // Just call animate to set up the ScrollTrigger or event handlers
        if (animations[animationType]) {
          animations[animationType].animate(element);
        }
      } else {
        // For non-replay animations, check if already in viewport
        if (isElementInViewport(element)) {
          // Element is already visible on page load
          if (isElementAboveViewport(element)) {
            // Element is above viewport (user scrolled past it)
            // Skip animation and show in final state
            if (animations[animationType]) {
              // Remove initial hidden state immediately
              gsap.set(element, { clearProps: "all" });
              // You could also trigger animation with duration: 0
              // animations[animationType].animate(element);
            }
          } else {
            // Element is currently in viewport
            // Trigger animation immediately with a slight delay
            setTimeout(() => {
              if (animations[animationType]) {
                animations[animationType].animate(element);
              }
            }, 100);
          }
        } else {
          // Element is below viewport, use IntersectionObserver
          observer.observe(element);
        }
      }
    });
    
    // Refresh ScrollTrigger after all animations are set up
    // This ensures proper calculation when page loads mid-scroll
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => {
        ScrollTrigger.refresh(true);
        
        // Force check all ScrollTrigger instances
        ScrollTrigger.getAll().forEach(trigger => {
          trigger.refresh();
        });
      }, 200);
    }

    // Mark body as loaded for CSS
    document.body.classList.add('gsap-loaded');
  }

  // Compatibility with sectionstyles.js
  function waitForDependencies() {
    // Check if sectionstyles.js has already run
    if (window.SectionStylesManager) {
      // Wait a tick to ensure sectionstyles.js has finished processing
      setTimeout(init, 10);
    } else {
      // If sectionstyles.js isn't loaded, just initialize
      init();
    }
  }

  // Wait for DOM and Squarespace to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDependencies);
  } else {
    // Delay slightly to ensure Squarespace has finished rendering
    setTimeout(waitForDependencies, 100);
  }
  
  // Also listen for Squarespace lifecycle events
  window.addEventListener('mercury:load', waitForDependencies);
  
  // Debounced resize handler to prevent excessive refreshes
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        // Refresh all ScrollTriggers
        ScrollTrigger.refresh(true);
      }
    }, 250);
  });
  
  // Handle page load at scroll position (back/forward navigation, refresh)
  window.addEventListener('load', () => {
    // Give browser time to restore scroll position
    setTimeout(() => {
      if (window.scrollY > 0) {
        // Page loaded at scroll position
        console.log('Page loaded at scroll position:', window.scrollY);
        
        // Refresh all ScrollTriggers
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh(true);
        }
        
        // Check for stuck animations in viewport
        document.querySelectorAll('[data-gsap-animation]').forEach(element => {
          if (isElementInViewport(element) && !element.classList.contains('gsap-animated')) {
            const animationType = element.getAttribute('data-gsap-animation');
            const animConfig = element.hasAttribute('data-gsap-config') 
              ? JSON.parse(element.getAttribute('data-gsap-config'))
              : null;
            
            // For non-replay animations that might be stuck
            if (!animConfig || !animConfig.replay) {
              // Check if animation hasn't triggered
              const computed = window.getComputedStyle(element);
              if (computed.opacity === '0') {
                // Force trigger animation
                if (animations[animationType]) {
                  animations[animationType].animate(element);
                  element.classList.add('gsap-animated');
                }
              }
            }
          }
        });
      }
    }, 300);
  });
  
  // Export for debugging/extension
  window.GSAPAnimations = {
    animations,
    config,
    refresh: init,
    // Helper functions
    isElementInViewport,
    isElementAboveViewport,
    // Accessibility features
    reducedMotion: {
      isEnabled: () => reducedMotionEnabled,
      getAnimationTier,
      shouldReduceMotion,
      classifications: animationAccessibility
    },
    // Method to check edit mode
    isEditMode: () => {
      return document.querySelector('.sqs-jacquard') !== null ||
             document.body.classList.contains('sqs-edit-mode') ||
             document.body.classList.contains('sqs-edit-mode-active') ||
             window.top !== window.self;
    },
    // Method to manually trigger animations (useful for dynamic content)
    triggerAnimation: (element, animationType) => {
      if (animations[animationType]) {
        if (animations[animationType].init) {
          animations[animationType].init(element);
        }
        return animations[animationType].animate(element);
      }
    },
    // Notify that GSAP is ready
    ready: () => {
      // Dispatch custom event for loading screen
      window.dispatchEvent(new Event('gsap-ready'));
    }
  };

  // Auto-dispatch ready event when this script loads
  window.GSAPAnimations.ready();
})();

window.addEventListener("load", function(){
  Y.UA.ios = 0; 
})
  
document.addEventListener('DOMContentLoaded',function(){const targetImage=document.querySelector('.anchorbottom-target');if(targetImage){targetImage.setAttribute('role','button');targetImage.setAttribute('tabindex','0');targetImage.setAttribute('aria-label','Play or pause audio');targetImage.setAttribute('aria-controls','audioplay-player');targetImage.style.cursor='pointer';function updateAriaState(){const audioPlayer=document.querySelector("section[id*='audioplay'] .sqs-widgets-audio-player");if(audioPlayer){const isPlaying=audioPlayer.classList.contains('playing');targetImage.setAttribute('aria-pressed',isPlaying);targetImage.setAttribute('aria-label',isPlaying?'Pause audio':'Play audio')}}updateAriaState();targetImage.addEventListener('click',function(){const audioPlayer=document.querySelector("section[id*='audioplay'] .sqs-widgets-audio-player");const actionButton=document.querySelector("section[id*='audioplay'] .sqs-widgets-audio-player .action");if(audioPlayer&&actionButton){audioPlayer.classList.toggle('playing');actionButton.click();setTimeout(updateAriaState,100)}});targetImage.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();targetImage.click()}});const audioPlayer=document.querySelector("section[id*='audioplay'] .sqs-widgets-audio-player");if(audioPlayer&&!audioPlayer.id)audioPlayer.id='audioplay-player'}}); 