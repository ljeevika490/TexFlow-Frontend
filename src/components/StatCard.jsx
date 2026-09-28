import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#0d9488', bgLight = '#ccfbf1' }) => {
  return (
    <div className="stat-card">
      <div
        className="stat-icon-wrapper"
        style={{ backgroundColor: bgLight, color: color }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value !== undefined ? value : 0}</div>
      </div>
    </div>
  );
};

export default StatCard;
