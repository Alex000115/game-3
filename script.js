const svg = document.getElementById('game-board');
const statusText = document.getElementById('status');
let gameMode = 'pvp';
let turn = 1;
let selectedGuti = null;
let p1Captured = 0;
let p2Captured = 0;

// Grid positions (Simplified for 16 beads)
const nodes = [];
const lines = [];

// Generate Sholo Guti Board Pattern
function createBoardData() {
    // This part generates the 5x5 grid plus the triangles
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            nodes.push({ x: 100 + x * 50, y: 100 + y * 50, id: nodes.length, bead: null });
        }
    }
    // Vertical/Horizontal lines
    for (let i = 0; i < 25; i++) {
        if ((i + 1) % 5 !== 0) lines.push([i, i + 1]);
        if (i < 20) lines.push([i, i + 5]);
    }
}

function initGame(mode) {
    gameMode = mode;
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    createBoardData();
    placeBeads();
    render();
    statusText.innerText = "Player 1's Turn";
}

function placeBeads() {
    nodes.forEach((node, i) => {
        if (i < 10) node.bead = 2;
        else if (i > 14) node.bead = 1;
        else node.bead = null;
    });
}

function render() {
    svg.innerHTML = '';
    // Draw lines
    lines.forEach(line => {
        const n1 = nodes[line[0]], n2 = nodes[line[1]];
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", n1.x); l.setAttribute("y1", n1.y);
        l.setAttribute("x2", n2.x); l.setAttribute("y2", n2.y);
        l.classList.add("line");
        svg.appendChild(l);
    });

    // Draw Nodes and Beads
    nodes.forEach(node => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", node.x); c.setAttribute("cy", node.y);
        c.setAttribute("r", 6); c.classList.add("node");
        svg.appendChild(c);

        if (node.bead) {
            const b = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            b.setAttribute("cx", node.x); b.setAttribute("cy", node.y);
            b.setAttribute("r", 15);
            b.classList.add("bead", node.bead === 1 ? "player1" : "player2");
            if (selectedGuti === node) b.classList.add("selected");
            b.onclick = () => selectBead(node);
            svg.appendChild(b);
        } else if (selectedGuti) {
            // Check if valid move to empty node
            if (isValidMove(selectedGuti, node)) {
                const h = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                h.setAttribute("cx", node.x); h.setAttribute("cy", node.y);
                h.setAttribute("r", 10); h.classList.add("move-hint");
                h.onclick = () => moveBead(selectedGuti, node);
                svg.appendChild(h);
            }
        }
    });
}

function selectBead(node) {
    if (node.bead !== turn) return;
    selectedGuti = node;
    render();
}

function isValidMove(start, end) {
    const dist = Math.hypot(start.x - end.x, start.y - end.y);
    return dist < 75; // Simple distance check for adjacent nodes
}

function moveBead(start, end) {
    end.bead = start.bead;
    start.bead = null;
    selectedGuti = null;
    turn = turn === 1 ? 2 : 1;
    statusText.innerText = `Player ${turn}'s Turn`;
    render();
    
    if(gameMode === 'pve' && turn === 2) {
        setTimeout(aiMove, 600);
    }
}

function aiMove() {
    const aiBeads = nodes.filter(n => n.bead === 2);
    for (let b of aiBeads) {
        const empty = nodes.find(n => n.bead === null && isValidMove(b, n));
        if (empty) {
            moveBead(b, empty);
            break;
        }
    }
}
