// components/Courseflow/edge.js
import React from 'react';
import { getBezierPath } from 'reactflow';

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY }) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <g>
      {/* Edge Path */}
      <path
        id={id}
        d={edgePath}
        stroke="blue" // Custom stroke color
        strokeWidth={10} // Thickness
        fill="none"
      />
      
      {/* Arrow Marker */}
      <defs>
        <marker
          id="arrowhead"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
        </marker>
      </defs>
    </g>
  );
};

export default CustomEdge;
