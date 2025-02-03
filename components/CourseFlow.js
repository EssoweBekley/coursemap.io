"use client";

import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function CourseFlow({ courses }) {
  const nodes = courses.map((course) => ({
    id: course.id,
    position: { x: course.x, y: course.y },
    data: {
      label: `${course.name}\nCredits: ${course.credits}\n${course.description}`, // Add credits and description
    },
    draggable: false,  // Disable dragging
    connectable: true,  // Disable edge drawing
  }));

  const edges = courses
    .flatMap((course) =>
      course.prereqs
        ? course.prereqs.map((prereq) => ({
            id: `e${prereq}-${course.id}`,
            source: prereq,
            target: course.id,
            type: "smoothstep",
          }))
        : []
    );

  return (
    <div style={{ width: "100%", height: "95vh", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ height: "100%", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          style={{ height: "100%" }}
          connectionMode="loose"  // Ensures no connection can be made
          nodesDraggable={false}  // Disable node dragging
        >
          <Background
            color="#f0f0f0"
            gap={16}
            size={2} // Make the grid less dense
            style={{
              borderRadius: "8px",
              boxShadow: "inset 0 0 8px rgba(129, 43, 43, 0.1)",
              background: "linear-gradient(45deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", // Gradient effect
            }}
          />
          <Controls showInteractive={true} />
        </ReactFlow>
      </div>
    </div>
  );
}
