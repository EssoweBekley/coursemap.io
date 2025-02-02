"use client"; // Required for Next.js app router

import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const nodes = [
  { id: "1", position: { x: 250, y: 0 }, data: { label: "CSE 1010" } },
  { id: "2", position: { x: 250, y: 100 }, data: { label: "CSE 2050" } },
  { id: "3", position: { x: 250, y: 200 }, data: { label: "CSE 2100" } },
];

const edges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

export default function CourseFlow() {
  return (
    <div style={{ width: "100%", height: "500px" }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
