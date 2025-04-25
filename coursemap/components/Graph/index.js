// components/Courseflow/index.js
import React, { useState, useEffect } from 'react';
import ReactFlow, { Background } from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

import Node from '@/components/Graph/node'; // Custom Node
import CustomEdge from '@/components/Graph/edge'; // Custom Edge

export default function CourseFlow({ courses }) {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        if (!courses) return;

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, edgesep: 50, ranksep: 200 });
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        courses.forEach(course => {
            dagreGraph.setNode(course._id, { width: 200, height: 100 });
        });

        courses.forEach(course => {
            if (course.prereqs) {
                course.prereqs.forEach(prereq => {
                    dagreGraph.setEdge(prereq, course._id);
                });
            }
        });

        dagre.layout(dagreGraph);

        const newNodes = courses.map(course => {
            const { x, y } = dagreGraph.node(course._id);
            return {
                id: course._id,
                type: 'custom', // Use custom node type
                data: {
                    name: course.name,
                    title: course.title,
                },
                position: { x: x - 100, y: y - 50 },
            };
        });

        const newEdges = courses.flatMap(course =>
            course.prereqs.map(prereq => ({
                id: `e${prereq}-${course._id}`,
                source: prereq,
                target: course._id,
                type: 'loose', // Pass the edge type here
            }))
        );

        setNodes(newNodes);
        setEdges(newEdges);
    }, [courses]);

    return (
        <div style={{ height: 900 }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={{ custom: Node}} // Register custom node type
                edgeTypes={{ custom: CustomEdge }} // Register custom edge type
            >
                <Background color="#f0f0f0" gap={16} size={100} />
            </ReactFlow>
        </div>
    );
}
