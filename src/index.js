/* global apex */

const d3 = require('d3');

const template = document.createElement('template');
template.innerHTML = `
  <style>
    #dataviz {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 0px;
    }
  </style>
  <div id="dataviz"></div>
`;

class MultipleBarChart extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  renderChart(w) {
    const margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50,
    };
    const width = w / 3 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Define scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(this.data, (d) => new Date(d.time * 1000)))
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => +d.amount)])
      .range([height, 0]);

    // Process data
    const groups = d3.group(this.data, (d) => d.name);

    const svg = d3
      .select(this.chartEl)
      .selectAll('uniqueChart')
      .data(groups)
      .enter()
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(3));

    svg.append('g').call(d3.axisLeft(yScale).ticks(1));

    // color palette
    const color = d3
      .scaleOrdinal()
      // .domain(allKeys)
      .range([
        '#309fdb',
        '#81bb5f',
        '#ed813e',
        '#e85d88',
        '#5a68ad',
        '#42c5d9',
        '#24a475',
        '#d9b13c',
        '#773492',
      ]);

    function getLine(d) {
      return d3
        .line()
        .x((v) => xScale(new Date(v.time * 1000)))
        .y((v) => yScale(+v.amount))(d[1]);
    }

    // Generate lines and append to SVG
    // groups.forEach((values, name) => {
    svg
      .append('path')
      // .datum(values)
      .attr('fill', 'none')
      .attr('stroke', (d) => color(d[0]))
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 1.5)
      .attr('d', (d) => getLine(d));

    // Add titles
    svg
      .append('text')
      .attr('text-anchor', 'start')
      .attr('y', -5)
      .attr('x', 0)
      .text((d) => d[0])
      .style('fill', (d) => color(d[0]));
  }

  connectedCallback() {
    this.data = [];

    Array.from(this.children).forEach((child) => {
      const row = {};
      row.name = child.getAttribute('name');
      row.time = parseInt(child.getAttribute('time'), 10);
      row.amount = parseInt(child.getAttribute('amount'), 10);

      if (row.name && row.time && row.amount) {
        this.data.push(row);
      }
    });
    if (window.apex) {
      apex.debug.trace('tc-multiple-bar-chart', this.data);
    }

    window.requestAnimationFrame(() => {
      this.renderChart(this.offsetWidth);
    });
    this.text = this.getAttribute('text');
    this.chartEl = this.shadowRoot.querySelector('#dataviz');
  }
}

window.customElements.define('tc-multiple-bar-chart', MultipleBarChart);
