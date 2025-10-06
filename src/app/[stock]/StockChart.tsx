'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { StockDataResponse } from '@/types/stock';

interface ChartProps {
  percentage: string;
  dates: string[];
  data: StockDataResponse;
  displayDays: number;
  maxScale?: number;
}

interface ChartDataPoint {
  date: string;
  roi: number;
  close: number;
  strike: number;
}

export default function StockChart({ percentage, dates, data, displayDays, maxScale }: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const displayedDates = dates.slice(-displayDays);
  
  const chartData: ChartDataPoint[] = displayedDates.map(date => {
    const dayData = data[date];
    const contracts = dayData?.percentages[percentage] || [];
    const bestContract = contracts[0];
    
    return {
      date,
      roi: bestContract?.annualizedRoi || 0,
      close: dayData?.close || 0,
      strike: bestContract ? Number(bestContract.strike) : 0
    };
  });

  console.log(`Chart data for ${percentage}%:`, chartData);

  const averageRoi = chartData.reduce((sum, day) => sum + day.roi, 0) / chartData.length;

  useEffect(() => {
    if (!svgRef.current || chartData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const container = svgRef.current.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    svg.attr('width', containerRect.width).attr('height', containerRect.height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(displayedDates)
      .range([0, width])
      .padding(0.1);

    const maxRoi = d3.max(chartData, d => d.roi) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxScale || maxRoi * 1.35]) // Add 10% padding to the top
      .range([height, 0]);

    // Line generators
    const line = d3.line<ChartDataPoint>()
      .x(d => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.roi))
      .curve(d3.curveMonotoneX);

    const averageLine = d3.line<ChartDataPoint>()
      .x(d => (xScale(d.date) || 0) + xScale.bandwidth() / 2)
      .y(() => yScale(averageRoi))
      .curve(d3.curveLinear);

    // Create average data for the line
    const averageData = chartData.map(d => ({ ...d, roi: averageRoi }));

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat(() => ''))
      .style('stroke', 'currentColor')
      .style('opacity', 0.1);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(() => ''))
      .style('stroke', 'currentColor')
      .style('opacity', 0.1);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => {
          const date = new Date(d);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }))
      .style('font-size', '12px')
      .style('color', 'currentColor')
      .style('opacity', 0.7);

    g.append('g')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${(Number(d) * 100).toFixed(1)}%`))
      .style('font-size', '12px')
      .style('color', 'currentColor')
      .style('opacity', 0.7);

    // Add average line
    g.append('path')
      .datum(averageData)
      .attr('fill', 'none')
      .attr('stroke', 'rgb(75, 192, 192)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('d', averageLine);

    // Add main line
    g.append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', 'rgb(255, 99, 132)')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add invisible overlay for mouse tracking
    const overlay = g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair');

    // Add vertical line for hover
    const hoverLine = g.append('line')
      .attr('class', 'hover-line')
      .attr('stroke', 'currentColor')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    // Add hover circles
    const hoverCircleActual = g.append('circle')
      .attr('class', 'hover-circle-actual')
      .attr('r', 6)
      .attr('fill', 'rgb(255, 99, 132)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    const hoverCircleAverage = g.append('circle')
      .attr('class', 'hover-circle-average')
      .attr('r', 6)
      .attr('fill', 'rgb(75, 192, 192)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    // Mouse tracking
    overlay
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event, this);
        const xPos = Math.max(0, Math.min(width, mouseX));
        
        // Find the closest data point
        const xValue = xScale.domain().find(d => {
          const pos = (xScale(d) || 0) + xScale.bandwidth() / 2;
          return Math.abs(pos - xPos) < xScale.bandwidth() / 2;
        });

        if (xValue) {
          const dataPoint = chartData.find(d => d.date === xValue);
          if (dataPoint) {
            const xPos = (xScale(xValue) || 0) + xScale.bandwidth() / 2;
            
            // Show vertical line
            hoverLine
              .attr('x1', xPos)
              .attr('x2', xPos)
              .attr('y1', 0)
              .attr('y2', height)
              .style('opacity', 1);

            // Show circles
            hoverCircleActual
              .attr('cx', xPos)
              .attr('cy', yScale(dataPoint.roi))
              .style('opacity', 1);

            hoverCircleAverage
              .attr('cx', xPos)
              .attr('cy', yScale(averageRoi))
              .style('opacity', 1);

            // Update tooltip
            if (tooltipRef.current) {
              const containerRect = container.getBoundingClientRect();
              const tooltipWidth = 200; // Approximate tooltip width
              const tooltipHeight = 120; // Approximate tooltip height
              
              let tooltipX = containerRect.left + margin.left + xPos + 10;
              let tooltipY = containerRect.top + margin.top + Math.min(yScale(dataPoint.roi), yScale(averageRoi)) + 40;
              
              // Check if tooltip would go off the right edge
              if (tooltipX + tooltipWidth > window.innerWidth) {
                tooltipX = containerRect.left + margin.left + xPos - tooltipWidth - 10;
              }
              
              // Check if tooltip would go off the bottom edge
              if (tooltipY + tooltipHeight > window.innerHeight) {
                tooltipY = containerRect.top + margin.top + Math.min(yScale(dataPoint.roi), yScale(averageRoi)) - tooltipHeight - 10;
              }
              
              // Ensure tooltip doesn't go off the left edge
              if (tooltipX < 10) {
                tooltipX = 10;
              }
              
              // Ensure tooltip doesn't go off the top edge
              if (tooltipY < 10) {
                tooltipY = 10;
              }
              
              tooltipRef.current.style.display = 'block';
              tooltipRef.current.style.left = `${tooltipX}px`;
              tooltipRef.current.style.top = `${tooltipY}px`;
              tooltipRef.current.style.position = 'fixed';
              tooltipRef.current.innerHTML = `
                <div class="bg-gray-900 text-white p-3 rounded shadow-lg text-sm min-w-[200px]">
                  <div class="font-semibold mb-2">${new Date(xValue).toLocaleDateString()}</div>
                  <div class="space-y-1">
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 rounded-full" style="background-color: rgb(255, 99, 132)"></div>
                      <span><strong>Actual ROI:</strong> ${(dataPoint.roi * 100).toFixed(2)}%</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-3 h-3 rounded-full" style="background-color: rgb(75, 192, 192)"></div>
                      <span><strong>Average ROI:</strong> ${(averageRoi * 100).toFixed(2)}%</span>
                    </div>
                    <div class="pt-1 border-t border-gray-600">
                      <div><strong>Stock Price:</strong> $${dataPoint.close.toFixed(2)}</div>
                      <div><strong>Strike:</strong> $${dataPoint.strike.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              `;
            }
          }
        }
      })
      .on('mouseleave', function() {
        // Hide all hover elements
        hoverLine.style('opacity', 0);
        hoverCircleActual.style('opacity', 0);
        hoverCircleAverage.style('opacity', 0);
        
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      });

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 200}, 20)`);

    // Add background rectangle
    legend.append('rect')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', 190)
      .attr('height', 40)
      .attr('fill', 'hsl(var(--background))')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 1)
      .attr('rx', 6)
      .style('opacity', 0.95);

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', 'rgb(255, 99, 132)')
      .attr('stroke-width', 3);

    legend.append('text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .text('Annualized ROI')
      .style('font-size', '12px')
      .style('fill', 'hsl(var(--foreground))');

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 20)
      .attr('y1', 20)
      .attr('y2', 20)
      .attr('stroke', 'rgb(75, 192, 192)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    legend.append('text')
      .attr('x', 25)
      .attr('y', 20)
      .attr('dy', '0.35em')
      .text('Average ROI')
      .style('font-size', '12px')
      .style('fill', 'hsl(var(--foreground))');

  }, [chartData, displayedDates, maxScale, averageRoi]);

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="flex-1 relative">
        <svg ref={svgRef} className="w-full h-full text-foreground" />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none z-10 hidden"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
} 