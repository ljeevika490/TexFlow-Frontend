import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase().replace(/\s+/g, '-');
  const badgeClass = `badge badge-${normalized.toLowerCase()}`;

  return (
    <span className={badgeClass}>
      {status}
    </span>
  );
};

export default StatusBadge;
