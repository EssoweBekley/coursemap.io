import React, { useState, useEffect } from 'react';
import ReactFlow, { Background } from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

export default function CourseFlow({ courses }) {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        if (!courses) return;

        // Create a new Dagre graph instance
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setGraph({
            rankdir: 'TB', // Left-to-Right layout, can also use 'TB' for Top-to-Bottom
            nodesep: 100,  // Space between nodes
            edgesep: 50,   // Space between edges
            ranksep: 200,  // Distance between different levels (depth)
        });

        dagreGraph.setDefaultEdgeLabel(() => ({}));

        const nodeMap = {}; // To keep track of node IDs for easy access

        // Create nodes from courses and add them to the Dagre graph
        courses.forEach(course => {
            nodeMap[course._id] = course; // Store course by _id for easy access later
            dagreGraph.setNode(course._id, { width: 200, height: 100 }); // Set a fixed size for each node
        });

        // Create edges based on prerequisites and add them to the Dagre graph
        courses.forEach(course => {
            if (course.prereqs) {
                course.prereqs.forEach(prereq => {
                    dagreGraph.setEdge(prereq, course._id); // Add edge between prerequisite and course
                });
            }
        });

        // Run the layout algorithm (this will compute the node positions)
        dagre.layout(dagreGraph);

        // Apply the layouted positions to the nodes
        const newNodes = courses.map(course => {
            const { x, y } = dagreGraph.node(course._id);
            return {
                id: course._id, // Set node id as the course _id
                data: {
                    label: (
                        <>
                            {course.name} <br />
                            <span style={{ fontSize: '12px', color: 'gray' }}>{course.title}</span>
                        </>
                    ),
                },
                position: { x: x - 100, y: y - 50 }, // Adjust position to center node
            };
        });

        // Create edges based on prerequisites
        const newEdges = courses.flatMap(course =>
            course.prereqs.map(prereq => ({
                id: `e${prereq}-${course._id}`,
                source: prereq, // Prereq should be a valid course _id
                target: course._id,
                type: 'smoothstep',
            }))
        );

        setNodes(newNodes);
        setEdges(newEdges);
    }, [courses]);

    return (
        <div style={{ height: 900 }}>
            <ReactFlow nodes={nodes} edges={edges}>
                <Background color="#f0f0f0" gap={16} size={100} />
            </ReactFlow>
        </div>
    );
}
