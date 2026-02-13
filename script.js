/**
 * Sholo Guti - Perfect Authentic Layout & Logic
 * Developer: NAZRUL
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

// ১. বোর্ডের পয়েন্ট এবং লাইন তৈরি (Authentic Shape)
function setupBoard() {
    nodes = [];
    connections.clear();

    // গ্রিড পয়েন্ট তৈরি (5x5 center)
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            nodes.push({ x: 80 + col * 60, y: 160 + row * 60, row: row + 2, col: col });
        }
    }
    // উপরের ত্রিভুজ (Top Triangle)
    nodes.push({ x: 200, y: 40, row: 0, col: 2 });
    nodes.push({ x: 140, y: 100, row: 1, col: 1 }, { x: 200, y: 100, row: 1, col: 2 }, { x: 260, y: 100, row: 1, col: 3 });

    // নিচের ত্রিভুজ (Bottom Triangle)
    nodes.push({ x: 200, y: 520, row: 8, col: 2 });
    nodes.push({ x: 140, y: 460, row: 7, col: 1 }, { x: 200, y: 460, row: 7, col: 2 }, { x: 260, y: 460, row: 7, col: 3 });

    // কানেকশন লজিক (প্রতিটি পয়েন্টের সাথে পাশের পয়েন্টের লাইন)
    nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
            if (i >= j) return;
            const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
            if (dist < 86) connections.add(`${i}-${j}`);
        });
    });
}

function initGame(mode) {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    setupBoard();
    
    // শুরুতে গুটি বসানো
    nodes.forEach((node, i) => {
        if (node.row < 4) node.bead = 2; // Enemy
        else if (node.row > 4) node.bead = 1; // Player
        else node.bead = null;
    });
    
    render();
}

function render() {
    svg.innerHTML = '';
    // লাইন আঁকা
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
            b.onclick = () => { if(node.bead === turn) selectedNode = node; render(); };
            svg.appendChild(b);
        } else if (selectedNode) {
            const move = checkMove(selectedNode, node);
            if (move.valid) {
                const hint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                hint.setAttribute("cx", node.x); hint.setAttribute("cy", node.y);
                hint.setAttribute("r", 10); hint.classList.add("move-hint");
                hint.onclick = () => performMove(selectedNode, node, move.captured);
                svg.appendChild(hint);
            }
        }
    });
}

function checkMove(start, end) {
    const startIdx = nodes.indexOf(start);
    const endIdx = nodes.indexOf(end);

    // ১. সাধারণ চাল (Adjacent move)
    if (connections.has(`${Math.min(startIdx, endIdx)}-${Math.max(startIdx, endIdx)}`)) {
        return { valid: true, captured: null };
    }

    // ২. গুটি খাওয়া (Capture Logic)
    // মাঝখানের পয়েন্ট বের করা
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const midNode = nodes.find(n => Math.abs(n.x - midX) < 5 && Math.abs(n.y - midY) < 5);

    if (midNode && midNode.bead && midNode.bead !== turn) {
        const midIdx = nodes.indexOf(midNode);
        const p1 = `${Math.min(startIdx, midIdx)}-${Math.max(startIdx, midIdx)}`;
        const p2 = `${Math.min(midIdx, endIdx)}-${Math.max(midIdx, endIdx)}`;
        
        if (connections.has(p1) && connections.has(p2)) {
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
}
