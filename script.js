const svg = document.getElementById('game-board');
const statusText = document.getElementById('status');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');

let turn = 1, selectedNode = null;
let p1Captured = 0, p2Captured = 0, gameActive = true;
let nodes = [], connections = new Set();

function setupBoard() {
    nodes = []; connections.clear();
    // ৫x৫ মেইন গ্রিড তৈরি
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            nodes.push({ x: 80 + c * 60, y: 130 + r * 60, r: r, c: c });
        }
    }
    // সব কানেকশন (Horizontal, Vertical, All Diagonals)
    nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
            if (i >= j) return;
            const dr = Math.abs(n1.r - n2.r), dc = Math.abs(n1.c - n2.c);
            if ((dr <= 1 && dc <= 1) && (dr + dc > 0)) {
                // শোলগুটির মেইন গ্রিডে সব পয়েন্টে কোণাকুণি চাল দেওয়া যায়
                connections.add(`${i}-${j}`);
            }
        });
    });
}

function initGame(mode) {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    setupBoard();
    nodes.forEach((n, i) => {
        if (i < 10) n.bead = 2; // Dark pieces
        else if (i > 14) n.bead = 1; // Red pieces
        else n.bead = null;
    });
    render();
}

function render() {
    svg.innerHTML = '';
    connections.forEach(pair => {
        const [i, j] = pair.split('-').map(Number);
        const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
        l.setAttribute("x1", nodes[i].x); l.setAttribute("y1", nodes[i].y);
        l.setAttribute("x2", nodes[j].x); l.setAttribute("y2", nodes[j].y);
        l.classList.add("line");
        svg.appendChild(l);
    });

    nodes.forEach((node, idx) => {
        if (node.bead) {
            const b = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            b.setAttribute("cx", node.x); b.setAttribute("cy", node.y); b.setAttribute("r", 18);
            b.classList.add("bead", node.bead === 1 ? "player1" : "player2");
            if (selectedNode === node) b.classList.add("selected");
            b.onclick = () => { if(node.bead === turn) { selectedNode = node; render(); } };
            svg.appendChild(b);
        } else if (selectedNode) {
            const move = getMove(selectedNode, node);
            if (move.valid) {
                const hint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                hint.setAttribute("cx", node.x); hint.setAttribute("cy", node.y);
                hint.setAttribute("r", 12); hint.classList.add("move-hint");
                hint.onclick = () => performMove(selectedNode, node, move.cap);
                svg.appendChild(hint);
            }
        }
    });
}

function getMove(s, e) {
    const si = nodes.indexOf(s), ei = nodes.indexOf(e);
    // সাধারণ চাল
    if (connections.has(`${Math.min(si, ei)}-${Math.max(si, ei)}`)) return { valid: true, cap: null };
    
    // ক্যাপচার লজিক (মাঝখানের গুটি খাওয়া)
    const midR = (s.r + e.r) / 2, midC = (s.c + e.c) / 2;
    if (Number.isInteger(midR) && Number.isInteger(midC)) {
        const mid = nodes.find(n => n.r === midR && n.c === midC);
        if (mid && mid.bead && mid.bead !== turn) {
            const mi = nodes.indexOf(mid);
            if (connections.has(`${Math.min(si, mi)}-${Math.max(si, mi)}`) && 
                connections.has(`${Math.min(mi, ei)}-${Math.max(mi, ei)}`)) {
                return { valid: true, cap: mid };
            }
        }
    }
    return { valid: false };
}

function performMove(s, e, cap) {
    e.bead = s.bead; s.bead = null;
    if (cap) {
        cap.bead = null;
        if (turn === 1) p1Captured++; else p2Captured++;
        p1ScoreEl.innerText = p1Captured; p2ScoreEl.innerText = p2Captured;
    }
    selectedNode = null;
    turn = turn === 1 ? 2 : 1;
    statusText.innerText = `Player ${turn}'s Turn`;
    render();
    if (p1Captured === 10 || p2Captured === 10) {
        alert(p1Captured === 10 ? "NAZRUL Wins!" : "Player 2 Wins!");
        location.reload();
    }
}
