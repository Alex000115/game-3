/**
 * Sholo Guti - Perfect Authentic Layout & Coordinate Fix
 * Developer: NAZRUL
 */

const svg = document.getElementById('game-board');
const statusText = document.getElementById('status');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');

let turn = 1, selectedNode = null;
let p1Captured = 0, p2Captured = 0;
let nodes = [], connections = new Set();

function setupBoard() {
    nodes = [];
    connections.clear();

    // 1. TOP TRIANGLE (Apex and Base)
    nodes.push({ x: 200, y: 30, r: 0, c: 2 }); // Top Apex
    const topBase = [
        { x: 130, y: 90, r: 1, c: 1 },
        { x: 200, y: 90, r: 1, c: 2 },
        { x: 270, y: 90, r: 1, c: 3 }
    ];
    topBase.forEach(n => nodes.push(n));

    // 2. MAIN 5x5 GRID (Rows 2 to 6)
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            nodes.push({ 
                x: 60 + c * 70, 
                y: 150 + r * 70, 
                r: r + 2, 
                c: c 
            });
        }
    }

    // 3. BOTTOM TRIANGLE (Base and Apex)
    const botBase = [
        { x: 130, y: 490, r: 7, c: 1 },
        { x: 200, y: 490, r: 7, c: 2 },
        { x: 270, y: 490, r: 7, c: 3 }
    ];
    botBase.forEach(n => nodes.push(n));
    nodes.push({ x: 200, y: 550, r: 8, c: 2 }); // Bottom Apex

    // 4. SMART PATH DETECTION
    nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
            if (i >= j) return;
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            // Allow horizontal, vertical, and diagonal paths within reach
            if (dist < 105) { 
                connections.add(`${i}-${j}`);
            }
        });
    });
}

function initGame(mode) {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    setupBoard();
    
    // Position 16 pieces for each player
    nodes.forEach((node) => {
        if (node.r < 4) node.bead = 2; // Top 16 pieces
        else if (node.r > 4) node.bead = 1; // Bottom 16 pieces
        else node.bead = null; // Middle row empty
    });
    
    render();
}

function render() {
    svg.innerHTML = '';
    // Draw all board lines
    connections.forEach(pair => {
        const [i, j] = pair.split('-').map(Number);
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", nodes[i].x); l.setAttribute("y1", nodes[i].y);
        l.setAttribute("x2", nodes[j].x); l.setAttribute("y2", nodes[j].y);
        l.classList.add("line");
        svg.appendChild(l);
    });

    // Draw active pieces and hints
    nodes.forEach((node) => {
        if (node.bead) {
            const b = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            b.setAttribute("cx", node.x); b.setAttribute("cy", node.y);
            b.setAttribute("r", 22);
            b.classList.add("bead", node.bead === 1 ? "player1" : "player2");
            if (selectedNode === node) b.classList.add("selected");
            b.onclick = () => { if(node.bead === turn) { selectedNode = node; render(); } };
            svg.appendChild(b);
        } else if (selectedNode) {
            const move = checkMove(selectedNode, node);
            if (move.valid) {
                const hint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                hint.setAttribute("cx", node.x); hint.setAttribute("cy", node.y);
                hint.setAttribute("r", 14); hint.classList.add("move-hint");
                hint.onclick = () => performMove(selectedNode, node, move.captured);
                svg.appendChild(hint);
            }
        }
    });
}

function checkMove(start, end) {
    const si = nodes.indexOf(start), ei = nodes.indexOf(end);
    // Simple move
    if (connections.has(`${Math.min(si, ei)}-${Math.max(si, ei)}`)) return { valid: true, captured: null };
    
    // Capture move logic
    const midX = (start.x + end.x) / 2, midY = (start.y + end.y) / 2;
    const mid = nodes.find(n => Math.abs(n.x - midX) < 5 && Math.abs(n.y - midY) < 5);

    if (mid && mid.bead && mid.bead !== turn) {
        const mi = nodes.indexOf(mid);
        if (connections.has(`${Math.min(si, mi)}-${Math.max(si, mi)}`) && 
            connections.has(`${Math.min(mi, ei)}-${Math.max(mi, ei)}`)) {
            return { valid: true, captured: mid };
        }
    }
    return { valid: false };
}

function performMove(start, end, captured) {
    end.bead = start.bead; start.bead = null;
    if (captured) {
        captured.bead = null;
        if (turn === 1) p1Captured++; else p2Captured++;
        p1ScoreEl.innerText = p1Captured; p2ScoreEl.innerText = p2Captured;
    }
    selectedNode = null;
    turn = turn === 1 ? 2 : 1;
    statusText.innerText = `Player ${turn}'s Turn`;
    render();
    if (p1Captured === 16 || p2Captured === 16) {
        alert(p1Captured === 16 ? "NAZRUL Wins!" : "AI Wins!");
        location.reload();
    }
}
