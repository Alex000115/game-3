/**
 * Sholo Guti - Pro Version
 * Authentic Layout with Top/Bottom Triangles
 * Developer: NAZRUL | GitHub: Alex000115
 */

const svg = document.getElementById('game-board');
const statusText = document.getElementById('status');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');

let turn = 1; 
let selectedNode = null;
let p1Captured = 0, p2Captured = 0;
let nodes = [];
let connections = new Set();

function setupBoard() {
    nodes = [];
    connections.clear();

    // 1. Create Main 5x5 Grid (Rows 2 to 6)
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            nodes.push({ x: 80 + c * 60, y: 160 + r * 60, r: r + 2, c: c });
        }
    }

    // 2. Create Top Triangle (Rows 0 and 1)
    const topApex = { x: 200, y: 40, r: 0, c: 2 };
    nodes.push(topApex);
    const topBase = [
        { x: 140, y: 100, r: 1, c: 1 },
        { x: 200, y: 100, r: 1, c: 2 },
        { x: 260, y: 100, r: 1, c: 3 }
    ];
    topBase.forEach(n => nodes.push(n));

    // 3. Create Bottom Triangle (Rows 7 and 8)
    const botApex = { x: 200, y: 520, r: 8, c: 2 };
    nodes.push(botApex);
    const botBase = [
        { x: 140, y: 460, r: 7, c: 1 },
        { x: 200, y: 460, r: 7, c: 2 },
        { x: 260, y: 460, r: 7, c: 3 }
    ];
    botBase.forEach(n => nodes.push(n));

    // 4. Define All Valid Paths (Horizontal, Vertical, and Diagonals)
    nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
            if (i >= j) return;
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            // Connect points within a specific distance (~60 for straight, ~85 for diagonal)
            if (dist < 86) {
                connections.add(`${i}-${j}`);
            }
        });
    });
}

function initGame(mode) {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    setupBoard();
    
    // Fill pieces based on Row position to match the Sholo Guti 16 layout
    nodes.forEach((node) => {
        if (node.r < 4) node.bead = 2; // Dark pieces on top
        else if (node.r > 4) node.bead = 1; // Red pieces on bottom
        else node.bead = null; // Middle row stays empty
    });
    
    render();
}

function render() {
    svg.innerHTML = '';
    
    // Draw connections (Board Lines)
    connections.forEach(pair => {
        const [i, j] = pair.split('-').map(Number);
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", nodes[i].x); l.setAttribute("y1", nodes[i].y);
        l.setAttribute("x2", nodes[j].x); l.setAttribute("y2", nodes[j].y);
        l.classList.add("line");
        svg.appendChild(l);
    });

    // Draw Nodes and Pieces
    nodes.forEach((node) => {
        if (node.bead) {
            const b = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            b.setAttribute("cx", node.x); b.setAttribute("cy", node.y);
            b.setAttribute("r", 18);
            b.classList.add("bead", node.bead === 1 ? "player1" : "player2");
            if (selectedNode === node) b.classList.add("selected");
            b.onclick = () => { if(node.bead === turn) { selectedNode = node; render(); } };
            svg.appendChild(b);
        } else if (selectedNode) {
            // Check for valid move hints
            const move = checkMove(selectedNode, node);
            if (move.valid) {
                const hint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                hint.setAttribute("cx", node.x); hint.setAttribute("cy", node.y);
                hint.setAttribute("r", 12); hint.classList.add("move-hint");
                hint.onclick = () => performMove(selectedNode, node, move.captured);
                svg.appendChild(hint);
            }
        }
    });
}

function checkMove(start, end) {
    const si = nodes.indexOf(start);
    const ei = nodes.indexOf(end);

    // 1. Check for normal adjacent move
    if (connections.has(`${Math.min(si, ei)}-${Math.max(si, ei)}`)) {
        return { valid: true, captured: null };
    }

    // 2. Check for Capture Move (Jump)
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    // Find if there is a node exactly in the middle of the jump
    const midNode = nodes.find(n => Math.abs(n.x - midX) < 5 && Math.abs(n.y - midY) < 5);

    if (midNode && midNode.bead && midNode.bead !== turn) {
        const mi = nodes.indexOf(midNode);
        // Ensure paths exist from Start -> Middle and Middle -> End
        const path1 = `${Math.min(si, mi)}-${Math.max(si, mi)}`;
        const path2 = `${Math.min(mi, ei)}-${Math.max(mi, ei)}`;
        if (connections.has(path1) && connections.has(path2)) {
            return { valid: true, captured: midNode };
        }
    }
    return { valid: false };
}

function performMove(start, end, captured) {
    end.bead = start.bead;
    start.bead = null;
    if (captured) {
        captured.bead = null;
        if (turn === 1) p1Captured++; else p2Captured++;
        p1ScoreEl.innerText = p1Captured;
        p2ScoreEl.innerText = p2Captured;
    }
    selectedNode = null;
    turn = turn === 1 ? 2 : 1;
    statusText.innerText = `Player ${turn}'s Turn`;
    render();
    
    // Win Condition (16 pieces total)
    if (p1Captured === 16 || p2Captured === 16) {
        alert(p1Captured === 16 ? "NAZRUL Wins!" : "Player 2 Wins!");
        location.reload();
    }
}
