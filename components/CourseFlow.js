"use client";

import React from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

export default function CourseFlow({ courses }) {
  const nodes = courses.map((course) => ({
    id: course.id,
    position: { x: course.x, y: course.y },
    data: { label: course.name },
  }));

  const edges = courses
    .flatMap((course) =>
      course.prereqs
        ? course.prereqs.map((prereq) => ({
            id: `e${prereq}-${course.id}`,
            source: prereq,
            target: course.id,
          }))
        : []
    );

  return (
    <div style={{ width: "100vw", height: "75vh" }}>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
