/**
 * Sholo Guti - Core Logic
 * Fully Client-Side / No Backend
 * Features: Capture mechanics, Path validation, Score tracking, and AI.
 * Developer: NAZRUL | GitHub: https://github.com/Alex000115
 */

const svg = document.getElementById('game-board');
const statusText = document.getElementById('status');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');

let gameMode = 'pvp';
let turn = 1; 
let selectedGuti = null;
let p1Captured = 0;
let p2Captured = 0;
let nodes = [];
let lines = [];

function createBoardData() {
    nodes = [];
    lines = [];
    // Creating 5x5 Grid
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            nodes.push({ 
                x: 60 + x * 70, 
                y: 60 + y * 70, 
                id: nodes.length, 
                bead: null, 
                row: y, 
                col: x 
            });
        }
    }

    // Creating connections (Horizontal, Vertical, Diagonal)
    for (let i = 0; i < 25; i++) {
        let r = nodes[i].row, c = nodes[i].col;
        if (c < 4) lines.push([i, i + 1]); 
        if (r < 4) lines.push([i, i + 5]); 
        if (r < 4 && c < 4 && (r + c) % 2 === 0) lines.push([i, i + 6]); 
        if (r < 4 && c > 0 && (r + c) % 2 === 0) lines.push([i, i + 4]); 
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
        if (i < 10) node.bead = 2; // Top 10 for Player 2
        else if (i > 14) node.bead = 1; // Bottom 10 for Player 1
        else node.bead = null;
    });
}

function render() {
    svg.innerHTML = '';
    
    // Draw grid lines
    lines.forEach(line => {
        const n1 = nodes[line[0]], n2 = nodes[line[1]];
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", n1.x); l.setAttribute("y1", n1.y);
        l.setAttribute("x2", n2.x); l.setAttribute("y2", n2.y);
        l.classList.add("line");
        svg.appendChild(l);
    });

    // Draw nodes and pieces
    nodes.forEach(node => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", node.x); c.setAttribute("cy", node.y);
        c.setAttribute("r", 5); c.classList.add("node");
        svg.appendChild(c);

        if (node.bead) {
            const b = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            b.setAttribute("cx", node.x); b.setAttribute("cy", node.y);
            b.setAttribute("r", 20);
            b.classList.add("bead", node.bead === 1 ? "player1" : "player2");
            if (selectedGuti === node) b.classList.add("selected");
            b.onclick = () => selectBead(node);
            svg.appendChild(b);
        } else if (selectedGuti) {
            const move = getMoveType(selectedGuti, node);
            if (move.valid) {
                const h = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                h.setAttribute("cx", node.x); h.setAttribute("cy", node.y);
                h.setAttribute("r", 12); h.classList.add("move-hint");
                h.onclick = () => executeMove(selectedGuti, node, move.capturedNode);
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

function getMoveType(start, end) {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    const distSq = rowDiff * rowDiff + colDiff * colDiff;

    // Normal move (1 step)
    if (distSq === 1 || distSq === 2) {
        if (isPathConnected(start.id, end.id)) {
            return { valid: true, capturedNode: null };
        }
    }

    // Capture move (Jump over enemy)
    if (distSq === 4 || distSq === 8) {
        const midRow = start.row + rowDiff / 2;
        const midCol = start.col + colDiff / 2;
        const midNode = nodes.find(n => n.row === midRow && n.col === midCol);
        
        if (midNode && midNode.bead && midNode.bead !== turn) {
            if (isPathConnected(start.id, midNode.id) && isPathConnected(midNode.id, end.id)) {
                return { valid: true, capturedNode: midNode };
            }
        }
    }
    return { valid: false };
}

function isPathConnected(id1, id2) {
    return lines.some(l => (l[0] === id1 && l[1] === id2) || (l[0] === id2 && l[1] === id1));
}

function executeMove(start, end, captured) {
    end.bead = start.bead;
    start.bead = null;
    
    if (captured) {
        captured.bead = null;
        if (turn === 1) p1Captured++; else p2Captured++;
        updateScores();
    }

    selectedGuti = null;
    turn = turn === 1 ? 2 : 1;
    statusText.innerText = turn === 1 ? "Player 1's Turn" : "Player 2's Turn";
    render();

    if (gameMode === 'pve' && turn === 2) {
        setTimeout(aiMove, 800);
    }
}

function updateScores() {
    p1ScoreEl.innerText = p1Captured;
    p2ScoreEl.innerText = p2Captured;
    if (p1Captured === 10) {
        statusText.innerText = "Game Over: NAZRUL Wins!";
        alert("NAZRUL Wins!");
    }
    if (p2Captured === 10) {
        statusText.innerText = "Game Over: AI Wins!";
        alert("AI Wins!");
    }
}

function aiMove() {
    if (turn !== 2) return;
    const aiBeads = nodes.filter(n => n.bead === 2);
    
    // 1. Try to capture
    for (let b of aiBeads) {
        for (let target of nodes.filter(n => !n.bead)) {
            const move = getMoveType(b, target);
            if (move.valid && move.capturedNode) {
                executeMove(b, target, move.capturedNode);
                return;
            }
        }
    }
    // 2. Otherwise, make a random valid move
    const possibleMoves = [];
    for (let b of aiBeads) {
        for (let target of nodes.filter(n => !n.bead)) {
            const move = getMoveType(b, target);
            if (move.valid) possibleMoves.push({ b, target });
        }
    }

    if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        executeMove(randomMove.b, randomMove.target, null);
    }
}
