
//I added everything inside window.onload to make sure JS would wait for the whole html and css to be loaded before it runs. 
window.onload = function() {
  //Turning on GSAP and ScrollTrigger, TextPlugin since GSAP is modular.
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.normalizeScroll(true); //Added this line so that Github Pages scroll works 

  // about panel toggle
document.getElementById('about-btn').addEventListener('click', function() {
  document.getElementById('about-panel').classList.toggle('open');
});

document.getElementById('about-close').addEventListener('click', function() {
  document.getElementById('about-panel').classList.remove('open');
});


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
  end: 'bottom center',
  scrub: 5,
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
    scrub: 2,
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
      self.progress < 0.5 ? '#f0ebff' : '#1a1a4e';
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

// Language translation:
//Source: Claude AI (Anthropic), conversation April–May 2026
// All text is stored as a constant object. Each constant has two keys: 'es' for Spanish and 'en' for English.  When the user clicks the EN/ES button, the function applyLanguage(lang) runs and takes the language code as an argument, looks up the matching content object, and uses innerText to change every text element on the page at once. Making it easy for a user to go back and fourth or simply change it once. 

const content = {
  es: {
    aboutBtn: '¿Qué es esto?',
    aboutText: 'Esta experiencia fue creada como parte de BridgED — una plataforma digital que usa narrativa para conectar a los jóvenes colombianos con su historia. A través del scrollytelling, este sitio recorre el proceso de paz de Colombia, el plebiscito de 2016, y las voces de quienes no pudieron — o no quisieron — votar. El objetivo no es decirte qué pensar. Es recordarte que tu voto tiene peso.',
    aboutSources: 'Fuentes: Centro Nacional de Memoria Histórica · Registraduría Nacional · International Crisis Group · Indepaz · BBC News · The Guardian',
    logoText: 'El precio del silencio',
    tagline: 'Antes de votar · Recuerda',
    scrollHint: 'Desliza',
    counterLabel: 'votos separaron la paz de la guerra',
    msgLine1: 'Cada voto cuenta.',
    msgLine2: 'El tuyo también.',
    noLabel: 'No',
    siLabel: 'Sí',
    anaLocation: 'Tumaco, Nariño · 2016',
    anaName: 'Ana, 34 años.',
    anaQuote: '"El río estaba crecido ese día. No había lancha, no había cómo llegar al pueblo a votar. Nosotros queríamos votar. Simplemente no pudimos."',
    anaContext: 'Tumaco fue una de las regiones más afectadas por el conflicto. También una de las que menos pudo votar ese día.',
    jorgeLocation: 'Bogotá, D.C. · 2016',
    jorgeName: 'Jorge, 28 años.',
    jorgeQuote: '"El acuerdo tenía 297 páginas. Nadie me lo explicó. Escuché rumores de lo que decía. Al final preferí no votar a votar sin entender."',
    jorgeContext: 'Más del 60% de colombianos elegibles no votaron ese día. La desinformación fue una de las razones más citadas.',
    luciaLocation: 'Medellín, Antioquia · 2016',
    luciaName: 'Lucía, 19 años.',
    luciaQuote: '"Pensé que mi voto no iba a cambiar nada. Que ya estaba decidido. Que era solo un trámite. Después vi el resultado y no pude dormir."',
    luciaContext: '53.894 votos decidieron el resultado. Lucía tenía edad para votar. No lo hizo.',
    ctaTop: '10 años después.',
    ctaHeadline: 'El silencio ya tuvo consecuencias. No lo repitas.',
    ctaBody: 'Lo que pase ahora depende de quién gobierne. Y quién gobierne depende de ti.',
    btnVote: 'Verifica dónde votar',
    btnShare: 'Comparte esta historia',
    events: [
      { year: '2016', text: 'El acuerdo de paz es firmado.' },
      { year: '2018', text: 'Primera elección post-conflicto.' },
      { year: '2021', text: 'Paro Nacional. Millones en las calles.' },
      { year: '2022', text: 'Primera presidente de izquierda en la historia.' },
      { year: '2024', text: 'La violencia regresa al Valle del Cauca.' },
      { year: '2025', text: 'Masacres en Catatumbo. El proceso de paz, en crisis.' },
      { year: '2026', text: 'Colombia vuelve a las urnas.' }
    ]
  },
  en: {
    aboutBtn: 'What is this?',
    aboutText: 'This experience was created as part of BridgED — a digital platform that uses narrative to connect young Colombians with their history. Through scrollytelling, this site walks through Colombia\'s peace process, the 2016 plebiscite, and the voices of those who couldn\'t — or didn\'t — vote. The goal is not to tell you what to think. It is to remind you that your vote carries weight.',
    aboutSources: 'Sources: Centro Nacional de Memoria Histórica · Registraduría Nacional · International Crisis Group · Indepaz · BBC News · The Guardian',
    logoText: 'The Price of Silence',
    tagline: 'Before you vote · Remember',
    scrollHint: 'Scroll',
    counterLabel: 'votes separated peace from war',
    msgLine1: 'Every vote counts.',
    msgLine2: 'Including yours.',
    noLabel: 'No',
    siLabel: 'Yes',
    anaLocation: 'Tumaco, Nariño · 2016',
    anaName: 'Ana, 34 years old.',
    anaQuote: '"The river was flooded that day. There was no boat, no way to get to town to vote. We wanted to vote. We simply couldn\'t."',
    anaContext: 'Tumaco was one of the regions most affected by the conflict — and one of the areas with the lowest voter turnout that day.',
    jorgeLocation: 'Bogotá, D.C. · 2016',
    jorgeName: 'Jorge, 28 years old.',
    jorgeQuote: '"The agreement was 297 pages long. Nobody explained it to me. I heard rumors about what it said. In the end I preferred not to vote than to vote without understanding."',
    jorgeContext: 'More than 60% of eligible Colombians did not vote that day. Misinformation was one of the most cited reasons.',
    luciaLocation: 'Medellín, Antioquia · 2016',
    luciaName: 'Lucía, 19 years old.',
    luciaQuote: '"I thought my vote wouldn\'t change anything. That it was already decided. That it was just a formality. Then I saw the result and couldn\'t sleep."',
    luciaContext: '53,894 votes decided the result. Lucía was old enough to vote. She didn\'t.',
    ctaTop: '10 years later.',
    ctaHeadline: 'Silence already had consequences. Don\'t repeat it.',
    ctaBody: 'What happens now depends on who governs. And who governs depends on you.',
    btnVote: 'Find your polling station',
    btnShare: 'Share this story',
    events: [
      { year: '2016', text: 'The peace agreement is signed.' },
      { year: '2018', text: 'First post-conflict election.' },
      { year: '2021', text: 'National Strike. Millions in the streets.' },
      { year: '2022', text: 'First left-wing president in history.' },
      { year: '2024', text: 'Violence returns to Valle del Cauca.' },
      { year: '2025', text: 'Massacres in Catatumbo. The peace process, in crisis.' },
      { year: '2026', text: 'Colombia returns to the polls.' }
    ]
  }
};

let currentLang = 'es';

function applyLanguage(lang) {
  const c = content[lang];

  // intro
  document.getElementById('about-btn').innerText = c.aboutBtn;
  document.getElementById('about-text').innerText = c.aboutText;
  document.getElementById('about-sources').innerText = c.aboutSources;
  document.querySelector('.logo-text').innerText = c.logoText;
  document.querySelector('.tagline').innerText = c.tagline;
  document.querySelector('.scroll-text').innerText = c.scrollHint;

  // counter
  document.getElementById('counter-label').innerText = c.counterLabel;

  // vote message
  document.getElementById('msg-line1').innerText = c.msgLine1;
  document.getElementById('msg-line2').innerText = c.msgLine2;

  // bar labels
  document.querySelector('#no-bar .vote-label').innerText = c.noLabel;
  document.querySelector('#si-bar .vote-label').innerText = c.siLabel;

  // story ana
  document.querySelector('#story-ana .story-location').innerText = c.anaLocation;
  document.querySelector('#story-ana .story-name').innerText = c.anaName;
  document.querySelector('#story-ana .story-quote').innerText = c.anaQuote;
  document.querySelector('#story-ana .story-context').innerText = c.anaContext;

  // story jorge
  document.querySelector('#story-jorge .story-location').innerText = c.jorgeLocation;
  document.querySelector('#story-jorge .story-name').innerText = c.jorgeName;
  document.querySelector('#story-jorge .story-quote').innerText = c.jorgeQuote;
  document.querySelector('#story-jorge .story-context').innerText = c.jorgeContext;

  // story lucia
  document.querySelector('#story-lucia .story-location').innerText = c.luciaLocation;
  document.querySelector('#story-lucia .story-name').innerText = c.luciaName;
  document.querySelector('#story-lucia .story-quote').innerText = c.luciaQuote;
  document.querySelector('#story-lucia .story-context').innerText = c.luciaContext;

  // cta
  document.getElementById('cta-top').innerText = c.ctaTop;
  document.getElementById('cta-headline').innerText = c.ctaHeadline;
  document.getElementById('cta-body').innerText = c.ctaBody;
  document.getElementById('btn-vote').innerText = c.btnVote;
  document.getElementById('btn-share').innerText = c.btnShare;

  // timeline events
  events.length = 0;
  c.events.forEach(function(e, i) {
    events.push({
      year: e.year,
      text: e.text,
      progress: i / (c.events.length - 1)
    });
  });

  // update button label
  document.getElementById('lang-btn').innerText = lang === 'es' ? 'EN' : 'ES';
  currentLang = lang;
}

// toggle on click
document.getElementById('lang-btn').addEventListener('click', function() {
  applyLanguage(currentLang === 'es' ? 'en' : 'es');
});
}




