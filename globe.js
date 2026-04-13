
gsap.registerPlugin(ScrollTrigger);

// grab the svg element from the HTML
//const svg = d3.select('#globe-svg');

window.onload = function() {
  gsap.registerPlugin(ScrollTrigger);

  // ... all your existing code goes inside here

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

// ── OCEAN ──
const ocean = svg.append('circle')
  .attr('cx', width / 2)
  .attr('cy', height / 2)
  .attr('r', Math.min(width, height) * 0.38)
  .attr('fill', '#1a1a4e');

// ── GRID LINES (graticule) ──
const graticule = d3.geoGraticule()();

const gridLines = svg.append('path')
  .datum(graticule)
  .attr('d', path)
  .attr('fill', 'none')
  .attr('stroke', 'rgba(255,255,255,0.08)')
  .attr('stroke-width', 0.5);

// 
const countriesGroup = svg.append('g');

// goes virtually and gets the file and awaits for result
fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(world) {
    console.log('map data loaded');

    // convert the  data into usable  features
    //topojson is how is the format it comes in, converts it into GeoJSON so that D3 can read it and render
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


  //This section is for the scroll trigerred earth rotation
  let autoRotate = true;

  function spin(time) {
    if (autoRotate) {
      const currentRotation = projection.rotate();
      projection.rotate([ //adds 0.3 to the longitude 
        currentRotation[0] + 0.3,
        currentRotation[1],
        currentRotation[2]
      ]);
      
      // redraw 
      countriesGroup.selectAll('path').attr('d', path);
      
      requestAnimationFrame(spin);
    }
  }

  requestAnimationFrame(spin);
  //Stopped from autoRotate
  ScrollTrigger.create({
    trigger: '#globe-scene',
    start: 'top top',
    onEnter: function() {
      autoRotate = false;
    }
  });

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

  }