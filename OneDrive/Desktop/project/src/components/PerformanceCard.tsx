import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PerformanceCardProps {
  title: string;
  value: string;
  change: string;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ title, value, change, color }) => {
  const isPositive = change.startsWith('+');
  
  const getBackgroundColor = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50';
      case 'green':
        return 'bg-green-50';
      case 'red':
        return 'bg-red-50';
      case 'purple':
        return 'bg-purple-50';
      case 'yellow':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };
  
  const getIconColor = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      case 'purple':
        return 'text-purple-600';
      case 'yellow':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const getChangeColor = () => {
    if (change === '0%') return 'text-gray-500';
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`${getBackgroundColor()} rounded-lg shadow p-6 transition-transform duration-300 hover:scale-105`}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className={`p-2 rounded-full ${getBackgroundColor()}`}>
          <span className={`${getIconColor()}`}>
            {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </span>
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold">{value}</p>
          <p className={`ml-2 text-sm font-medium ${getChangeColor()}`}>
            {change}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;