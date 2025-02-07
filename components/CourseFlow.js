"use client";

import React, { useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

export default function CourseFlow({ courses }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0 });

  useEffect(() => {
    // Initialize Dagre graph
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setGraph({
      rankdir: "TB", // Set the layout direction to Top-to-Bottom (vertical)
      nodesep: 50,   // Space between nodes
      edgesep: 10,   // Space between edges
      ranksep: 100,  // Distance between levels
    });
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Create React Flow nodes from the courses data
    const nodeObjects = courses.map((course) => ({
      id: course.id,
      data: {
        label: (
          <>
            {course.name} <br />
            <span style={{ fontSize: "12px", color: "gray" }}>{course.title}</span>
          </>
        ),
      },
      draggable: false,
      connectable: false,
    }));

    // Add nodes to Dagre graph
    nodeObjects.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 100 });
    });

    // Create edges based on prerequisites
    const edgeObjects = courses.flatMap((course) =>
      course.prereqs
        ? course.prereqs.map((prereq) => ({
            id: `e${prereq}-${course.id}`,
            source: prereq,
            target: course.id,
            type: "smoothstep",
          }))
        : []
    );

    // Add edges to Dagre graph
    edgeObjects.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run the layout algorithm
    dagre.layout(dagreGraph);

    // Apply the layouted positions to the nodes
    const layoutedNodes = nodeObjects.map((node) => ({
      ...node,
      position: {
        x: dagreGraph.node(node.id).x - 75,  // Offset to center the nodes
        y: dagreGraph.node(node.id).y - 50,  // Offset to center the nodes
      },
    }));

    // Update the state with layouted nodes and edges
    setNodes(layoutedNodes);
    setEdges(edgeObjects);
  }, [courses]);

  // Handle mouse events to show/hide tooltip
  const onNodeMouseEnter = (event, node) => {
    const course = courses.find((course) => course.id === node.id);
    setTooltip({
      visible: true,
      content: (
        <>
          <strong>Credits:</strong> {course.credits} <br />
          <strong>Description:</strong> {course.description}
        </>
      ),
      x: event.clientX + 10,  // Offset to avoid covering the node
      y: event.clientY + 10,  // Offset to avoid covering the node
    });
  };

  const onNodeMouseLeave = () => {
    setTooltip({ visible: false, content: "", x: 0, y: 0 });
  };

  return (
    <div style={{ width: "100%", height: "95vh", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ height: "100%", borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          style={{ height: "100%" }}
          connectionMode="loose"  // Ensures no connection can be made
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
        >
          <Background
            color="#f0f0f0"
            gap={16}
            size={100} // Make the grid less dense
            style={{
              borderRadius: "8px",
              boxShadow: "inset 0 0 8px rgba(129, 43, 43, 0.1)",
              background: "linear-gradient(45deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)", // Gradient effect
            }}
          />
          <Controls showInteractive={true} />
        </ReactFlow>
        
        {/* Tooltip display */}
        {tooltip.visible && (
          <div
            style={{
              position: "absolute",
              top: tooltip.y,
              left: tooltip.x,
              padding: "10px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              borderRadius: "5px",
              maxWidth: "300px",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
}
