
gsap.registerPlugin(ScrollTrigger);

// grab the svg element from the HTML
//const svg = d3.select('#globe-svg');

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

oer
const path = d3.geoPath().projection(projection);

console.log('ready');