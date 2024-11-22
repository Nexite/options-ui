'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  ChartOptions
} from 'chart.js';
import { StockDataResponse } from '@/types/stock';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const mostRecentRoi = chartData[chartData.length - 1]?.roi || 0;

  const currentRoiColor = mostRecentRoi > averageRoi 
    ? 'text-green-600/75' 
    : mostRecentRoi < averageRoi 
      ? 'text-red-600/75' 
      : 'text-gray-600';

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const dataIndex = context.dataIndex;
            const close = chartData[dataIndex].close;
            const value = context.raw as number;
            
            if (context.dataset.label === 'Average Annualized ROI') {
              return `${context.dataset.label}: ${(value * 100).toFixed(2)}%`;
            }
            
            return [
              `${context.dataset.label}: ${(value * 100).toFixed(2)}%`,
              `Stock Price: $${Number(close).toFixed(2)}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxScale,
        min: 0,
        ticks: {
          callback: function(value: any) {
            return `${(Number(value) * 100).toFixed(1)}%`;
          }
        }
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">
          {percentage}% Strike
        </h3>
        <div className="text-sm space-x-4">
          <span className="text-gray-600">Avg ROI: {(averageRoi * 100).toFixed(2)}%</span>
          <span className={currentRoiColor}>Current ROI: {(mostRecentRoi * 100).toFixed(2)}%</span>
        </div>
      </div>
      <div className="flex-1">
        <Line
          options={chartOptions}
          data={{
            labels: displayedDates,
            datasets: [
              {
                label: 'Annualized ROI',
                data: chartData.map(day => day.roi),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
              },
              {
                label: 'Average Annualized ROI',
                data: Array(displayedDates.length).fill(averageRoi),
                borderColor: 'rgb(75, 192, 192)',
                borderDash: [5, 5],
                tension: 0,
              },
            ],
          }}
        />
      </div>
    </div>
  );
} 