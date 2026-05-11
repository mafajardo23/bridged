//Turning on GSAP and ScrollTrigger, TextPlugin since GSAP is modular.
gsap.registerPlugin(ScrollTrigger);


//I added everything inside window.onload to make sure JS would wait for the whole html and css to be loaded before it runs. 
window.onload = function() {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.normalizeScroll(true); //Added this line so that Github Pages scroll works 

// set the width and height of the screen
const width = window.innerWidth;
const height = window.innerHeight;

// sets the size of svg
const svg = d3.select('#globe-svg')
  .attr('width', width)
  .attr('height', height);

// Chosen: orthogaprahic, looks like a sphere you're viewing from space.
/* ── d3 globe movement ──
   Source: Claude AI (Anthropic), conversation April 2026
   Used for: movement*/
const projection = d3.geoOrthographic()
  .scale(Math.min(width, height) * 0.38)
  .translate([width / 2, height / 2])
  .rotate([0, -20, 0])
  .clipAngle(90);

const path = d3.geoPath().projection(projection);

console.log('ready');

// Ocean
const ocean = svg.append('circle')
  .attr('cx', width / 2)
  .attr('cy', height / 2)
  .attr('r', Math.min(width, height) * 0.38)
  .attr('fill', '#1a1a4e');

// Graticule (grid lines)
const graticule = d3.geoGraticule()();

const gridLines = svg.append('path')
  .datum(graticule)
  .attr('d', path)
  .attr('fill', 'none')
  .attr('stroke', 'rgba(255,255,255,0.08)')
  .attr('stroke-width', 0.5);

const countriesGroup = svg.append('g');

// goes virtually and gets the file and awaits for result
fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(world) {
    console.log('map data loaded');

    // convert the  data into usable  features
    //topojson is the format it comes in, converts it into GeoJSON so that D3 can read it and render
    const countries = topojson.feature(world, world.objects.countries);

    // draws each country as a path
    countriesGroup.selectAll('path')
      .data(countries.features)
      .join('path')
      .attr('d', path)
      .attr('fill', 'rgba(255,255,255,0.15)')
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-width', 0.3);

  });

  /*  ── HOW GSAP's SCROLLTRIGGER WORKS ──

  Every animation I used follows the same pattern.
  ScrollTrigger watches a specific HTML element (trigger).
  When the user scrolls to it, the animation begins.

  start: when the trigger begins. 'top top' means when the 
  top of the element hits the top of the viewport.

  end: when the trigger ends. 'bottom bottom' means when the 
  bottom of the element hits the bottom of the viewport.

  scrub: its how much the animation will "lag" before catching up. 
  scrub: 1 adds a small lag so it feels smooth, not instant.

  onUpdate: runs every time the user scrolls inside the trigger zone.
  self.progress is a number from 0 to 1.

  All animations are just math using self.progress to change values over time.

  Example: 
  - opacity = self.progress fades something in as you scroll.
  - y = 300 - (self.progress * 300) moves something upward.
  - current = Math.floor(self.progress * 53894) counts up a number.
*/

  //Make it rotate towards Colombia
  ScrollTrigger.create({
  trigger: '#globe-scene',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1,
  onUpdate: function(self) {
    const startLon = 0;
    const endLon = 74;
    const startLat = -20;
    const endLat = -4;

    // rotation happens in the first 60% of the scroll
    const rotateProgress = Math.min(self.progress / 0.6, 1);

    const currentLon = startLon + (endLon - startLon) * rotateProgress;
    const currentLat = startLat + (endLat - startLat) * rotateProgress;

    projection.rotate([currentLon, currentLat, 0]);
      
    // zoom only starts after 60% of the scroll
    const zoomProgress = Math.max((self.progress - 0.6) / 0.4, 0);

    const startScale = Math.min(width, height) * 0.38;
    const endScale = Math.min(width, height) * 2.5;
    const currentScale = startScale + (endScale - startScale) * zoomProgress;

    projection.scale(currentScale);
    ocean.attr('r', currentScale);
    ocean.attr('cx', width / 2);
    ocean.attr('cy', height / 2);
    gridLines.attr('d', path);
    countriesGroup.selectAll('path').attr('d', path); 
  }
  
  });

  //Typewriter text effect 
ScrollTrigger.create({
  trigger: '#globe-scene',
  start: '50% top',
  end: '70% top',
  scrub: 10, 
  onUpdate: function(self) {
    const spans = document.querySelectorAll('#globe-text span');
    const total = spans.length;
    const charsToShow = Math.floor(self.progress * total);

    spans.forEach(function(span, index) {
      if (index < charsToShow) {
        span.style.opacity = 1;
      } else {
        span.style.opacity = 0;
      }
    });
  }
});


  //Fade 
ScrollTrigger.create({
  trigger: '#globe-scene',
  start: '85% top',
  end: '100% top',
  scrub: 1,
  onUpdate: function(self) {
    gsap.set('#fade-overlay', {
      opacity: self.progress
    });
  },
  onLeaveBack: function() {
    gsap.to('#fade-overlay', {
      opacity: 0,
      duration: 0.3
    });
  }
});

//Vote counter for peace
ScrollTrigger.create({
  trigger: '#counter-section',
  start: 'top center',
  end: '80% center',
  scrub: 2,
  onUpdate: function(self) {
    const countProgress = Math.min(self.progress / 0.3, 1);
    const target = 53894;
    const current = Math.floor(countProgress * target);
    const padded = String(current).padStart(5, '0');
    padded.split('').forEach(function(digit, i) {
      document.getElementById('d' + i).textContent = digit;
    });
  }
});

//Yes and No bar graph function
ScrollTrigger.create({
  trigger: '#vote-breakdown',
  start: 'top center',
  end: '40% center',
  scrub: 2,
  onUpdate: function(self) {
    const noHeight = self.progress * 280;
    const siHeight = self.progress * 270;
    document.getElementById('no-bar').style.height = noHeight + 'px';
    document.getElementById('si-bar').style.height = siHeight + 'px';
    document.getElementById('no-pct').style.opacity = self.progress;
    document.getElementById('si-pct').style.opacity = self.progress;
  }
});

//Vote message
ScrollTrigger.create({
  trigger: '#vote-breakdown',
  start: '30% top',
  onEnter: function() {
    document.getElementById('msg-line1').style.opacity = 1;
    document.getElementById('msg-line1').style.transform = 'translateY(0)';
    setTimeout(function() {
      document.getElementById('msg-line2').style.opacity = 1;
      document.getElementById('msg-line2').style.transform = 'translateY(0)';
    }, 800);
  },
  onLeaveBack: function() {
    document.getElementById('msg-line1').style.opacity = 0;
    document.getElementById('msg-line1').style.transform = 'translateY(12px)';
    document.getElementById('msg-line2').style.opacity = 0;
    document.getElementById('msg-line2').style.transform = 'translateY(12px)';
  }
});

//Stories
['#story-ana', '#story-jorge', '#story-lucia'].forEach(function(id) {
  ScrollTrigger.create({
    trigger: id,
    start: 'top 60%',
    onEnter: function() {
      document.querySelector(id).classList.add('visible');
    },
    onLeaveBack: function() {
      document.querySelector(id).classList.remove('visible');
    }
  });
});

// Timeline of events. The progress value determines which event shows at what point of the scroll. 
const events = [
  { year: '2016', text: 'El acuerdo de paz es firmado.', progress: 0 },
  { year: '2018', text: 'Primera elección post-conflicto.', progress: 0.17 },
  { year: '2021', text: 'Paro Nacional. Millones en las calles.', progress: 0.34 },
  { year: '2022', text: 'Primera presidente de izquierda en la historia.', progress: 0.5 },
  { year: '2024', text: 'La violencia regresa al Valle del Cauca.', progress: 0.67 },
  { year: '2025', text: 'Masacres en Catatumbo. El proceso de paz, en crisis.', progress: 0.83 },
  { year: '2026', text: 'Colombia vuelve a las urnas.', progress: 1 }
];

//Timeline animation
ScrollTrigger.create({
  trigger: '#timeline-section',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1,
  onUpdate: function(self) {
    // find which event to show loop
    let current = events[0];
    for (let i = 0; i < events.length; i++) {
      if (self.progress >= events[i].progress) {
        current = events[i];
      }
    }

    document.getElementById('timeline-year').innerText = current.year;
    document.getElementById('timeline-event').innerText = current.text;

    // background transitions from dark to light
    const dark = [13, 10, 26];
    const light = [247, 245, 242];
    const r = Math.floor(dark[0] + (light[0] - dark[0]) * self.progress);
    const g = Math.floor(dark[1] + (light[1] - dark[1]) * self.progress);
    const b = Math.floor(dark[2] + (light[2] - dark[2]) * self.progress);

    document.getElementById('timeline-sticky').style.background = 
      'rgb(' + r + ',' + g + ',' + b + ')';

    // text color flips from light to dark
    const textOpacity = self.progress;
    document.getElementById('timeline-year').style.color = 
      self.progress < 0.5 ? '#f0ebff' : '#1a1a1a';
    document.getElementById('timeline-event').style.color = 
      self.progress < 0.5 ? 'rgba(240,235,255,0.6)' : 'rgba(26,26,26,0.6)';
  }
});

// cta fade in
ScrollTrigger.create({
  trigger: '#cta-section',
  start: 'top 70%',
  onEnter: function() {
    document.querySelector('#cta-section').classList.add('visible');
  }
});

// share button 
document.getElementById('btn-share').addEventListener('click', function() {
  if (navigator.share) {
    navigator.share({
      title: 'El Precio del Silencio',
      text: '53.894 votos cambiaron la historia. El tuyo puede ser uno de ellos.',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('¡Enlace copiado!');
  }
});

}




