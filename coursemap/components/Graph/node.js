import React from 'react';
import { Handle } from 'reactflow';

const CustomNode = ({ data, isConnectable }) => {
  return (
    <div
      style={{
        backgroundColor: 'white', // Ensures solid background
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '180px',
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{data.name}</h3>
      <p style={{ fontSize: '12px', color: 'gray' }}>{data.title}</p>

      {/* Handles for Connections */}
      <Handle type="target" position="top" isConnectable={isConnectable} />
      <Handle type="source" position="bottom" isConnectable={isConnectable} />
    </div>
  );
};

export default CustomNode;
