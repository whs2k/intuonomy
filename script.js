// State Management
const state = {
    model: 'aadd', // 'islm' or 'aadd', starts as islm conceptually? Wait, HTML has islm active.
    variables: {
        M: 0, // Shift amount
        G: 0
    },
    activeArrows: {
        M: null, // 'up', 'down', or null
        G: null
    },
    outputs: {
        1: 'minus', // 'up', 'minus', 'down'
        2: 'minus'
    }
};

// Base Intersections
const BASE_X = 210;
const BASE_Y = 160;

const FORMULAS = {
    islm: `
        <div class="tile yellow">Y</div> <span class="op">=</span>
        <div class="tile yellow">C</div> <span class="op">+</span>
        <div class="tile yellow">I</div> <span class="op">+</span>
        <div class="tile lightgray">G</div> <span class="op">+</span>
        <div class="tile yellow">NX</div>
        <span style="margin: 0 15px;"></span>
        <div class="fraction">
            <div class="tile lightgray">M</div>
            <hr>
            <div class="fraction-bottom">
                <div class="tile yellow">P</div>
            </div>
        </div>
        <span class="op">=</span>
        <div class="tile yellow">L</div><span class="bracket">(</span><div class="tile yellow">R</div><span class="op">,</span><div class="tile yellow">Y</div><span class="bracket">)</span>
    `,
    aadd: `
        <div class="tile yellow">C</div> <span class="op">+</span>
        <div class="tile yellow">I</div> <span class="op">+</span>
        <div class="tile lightgray">G</div> <span class="op">-</span>
        <span class="bracket">(</span> <div class="tile yellow">X</div> <span class="op">-</span> <div class="tile yellow">M</div> <span class="bracket">)</span>
        <span class="op">=</span> <div class="tile yellow">Y</div> <span class="op">=</span>
        <div class="fraction">
            <div class="tile lightgray">M</div>
            <hr>
            <div class="fraction-bottom">
                <div class="tile yellow">L</div> <div class="tile yellow">P</div>
            </div>
        </div>
        <span class="big-bracket">[</span>
        <div class="fraction-inline">
            <div class="tile yellow">R*</div> <span class="op">+</span> <div class="tile yellow">E*</div> <span class="op">-</span> <span>1</span>
            <hr>
            <div class="tile lightgray" style="margin: 0 auto; display: block; width: max-content;">E</div>
        </div>
        <span class="big-bracket">]</span>
    `
};

document.addEventListener('DOMContentLoaded', () => {
    // Determine initial model from HTML active button
    const activeModelBtn = document.querySelector('.model-btn.active');
    if (activeModelBtn) state.model = activeModelBtn.dataset.model;
    
    updateUIForModel();
    attachEventListeners();
    updateGraph();
});

function updateUIForModel() {
    // Update Equation
    document.getElementById('equation-container').innerHTML = FORMULAS[state.model];
    
    // Update Tags & Labels
    document.getElementById('current-model-tag').textContent = state.model === 'islm' ? 'IS-LM' : 'AA-DD';
    document.getElementById('y-axis-label').textContent = state.model === 'islm' ? 'R' : 'E';
    document.getElementById('out-label-1').textContent = state.model === 'islm' ? 'R' : 'E';
    
    // Update Summary Outputs
    document.getElementById('summary-outputs').innerHTML = `<div class="tile outline">${state.model === 'islm' ? 'R' : 'E'}</div>`;
    
    // Reset shifts on model change
    state.variables.M = 0;
    state.variables.G = 0;
    state.activeArrows.M = null;
    state.activeArrows.G = null;
    
    updateInputArrows();
    calculateOutputs();
    updateOutputArrows();
}

function attachEventListeners() {
    // Model Selection
    document.querySelectorAll('.model-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.model-btn').forEach(b => {
                b.classList.remove('active');
                b.classList.add('inactive');
            });
            const target = e.currentTarget;
            target.classList.add('active');
            target.classList.remove('inactive');
            
            state.model = target.dataset.model;
            
            updateUIForModel();
            updateGraph();
        });
    });

    // Input Buttons
    document.querySelectorAll('.side-col .circle').forEach(btn => {
        if (!btn.hasAttribute('data-var')) return; // skip output buttons
        
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const variable = target.dataset.var; // M or G
            const dir = target.dataset.dir; // up or down
            
            if (state.activeArrows[variable] === dir) {
                // Toggle off
                state.activeArrows[variable] = null;
                state.variables[variable] = 0;
            } else {
                state.activeArrows[variable] = dir;
                state.variables[variable] = dir === 'up' ? 20 : -20;
            }
            
            updateInputArrows();
            calculateOutputs();
            updateOutputArrows();
            updateGraph();
        });
    });
}

function updateInputArrows() {
    ['M', 'G'].forEach(v => {
        const upBtn = document.querySelector(`button[data-var="${v}"][data-dir="up"]`);
        const downBtn = document.querySelector(`button[data-var="${v}"][data-dir="down"]`);
        
        if (upBtn && downBtn) {
            upBtn.className = 'circle up inactive';
            downBtn.className = 'circle down inactive';
            
            if (state.activeArrows[v] === 'up') {
                upBtn.className = 'circle up active';
            } else if (state.activeArrows[v] === 'down') {
                downBtn.className = 'circle down active';
            }
        }
    });
}

function calculateOutputs() {
    const dG = state.variables.G;
    const dM = state.variables.M;
    
    if (state.model === 'aadd') {
        const shiftDD = dG;
        const shiftAA = dM;
        const dE = - (shiftDD - shiftAA) / 2;
        if (dE > 5) state.outputs[1] = 'down';
        else if (dE < -5) state.outputs[1] = 'up';
        else state.outputs[1] = 'minus';
        
        const dY = (shiftDD + shiftAA) / 2;
        if (dY > 5) state.outputs[2] = 'up';
        else if (dY < -5) state.outputs[2] = 'down';
        else state.outputs[2] = 'minus';
        
    } else {
        const shiftIS = dG;
        const shiftLM = dM;
        const dR = - (shiftIS - shiftLM) / 2; 
        if (dR < -5) state.outputs[1] = 'up';
        else if (dR > 5) state.outputs[1] = 'down';
        else state.outputs[1] = 'minus';
        
        const dY = (shiftIS + shiftLM) / 2;
        if (dY > 5) state.outputs[2] = 'up';
        else if (dY < -5) state.outputs[2] = 'down';
        else state.outputs[2] = 'minus';
    }
}

function updateOutputArrows() {
    [1, 2].forEach(num => {
        const group = document.getElementById(`out-group-${num}`);
        if (!group) return;
        const stateVal = state.outputs[num];
        
        const up = group.querySelector('.up');
        const minus = group.querySelector('.minus');
        const down = group.querySelector('.down');
        
        up.className = 'circle up inactive';
        minus.className = 'circle minus inactive';
        down.className = 'circle down inactive';
        
        if (stateVal === 'up') up.className = 'circle up active';
        else if (stateVal === 'minus') minus.className = 'circle minus active';
        else if (stateVal === 'down') down.className = 'circle down active';
    });
}

function updateGraph() {
    const curve1 = document.getElementById('curve1'); // Downward
    const curve2 = document.getElementById('curve2'); // Upward
    const ghost = document.getElementById('curve1-ghost');
    const ghost2 = document.getElementById('curve2-ghost');
    
    // Create ghost2 if it doesn't exist
    if (!ghost2) {
        const newGhost = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newGhost.setAttribute("id", "curve2-ghost");
        newGhost.setAttribute("x1", "110");
        newGhost.setAttribute("y1", "260");
        newGhost.setAttribute("x2", "310");
        newGhost.setAttribute("y2", "60");
        newGhost.setAttribute("stroke", "#684a68");
        newGhost.setAttribute("stroke-width", "6");
        newGhost.setAttribute("stroke-linecap", "round");
        newGhost.setAttribute("opacity", "0");
        document.getElementById("curves-group").appendChild(newGhost);
    }
    
    const ghost2El = document.getElementById('curve2-ghost');
    
    let shift1 = 0; 
    let shift2 = 0; 
    
    if (state.model === 'aadd') {
        shift1 = state.variables.M; 
        shift2 = state.variables.G; 
    } else {
        shift1 = state.variables.G; 
        shift2 = state.variables.M; 
    }
    
    // Hardcode base coordinates instead of transforms to ensure it works across all SVGs properly
    curve1.setAttribute('x1', 110 + shift1);
    curve1.setAttribute('x2', 310 + shift1);
    
    curve2.setAttribute('x1', 110 + shift2);
    curve2.setAttribute('x2', 310 + shift2);
    
    const shiftArrows = document.getElementById('shift-arrows');
    const shiftArrows2 = document.getElementById('shift-arrows-2');
    
    if (shift1 !== 0) {
        ghost.setAttribute('opacity', '0.3');
        shiftArrows.setAttribute('opacity', '1');
        document.getElementById('arr1-line').setAttribute('x2', 170 + shift1);
        document.getElementById('arr2-line').setAttribute('x2', 250 + shift1);
    } else {
        ghost.setAttribute('opacity', '0');
        shiftArrows.setAttribute('opacity', '0');
    }
    
    if (shift2 !== 0) {
        ghost2El.setAttribute('opacity', '0.3');
        if (shiftArrows2) {
            shiftArrows2.setAttribute('opacity', '1');
            document.getElementById('arr3-line').setAttribute('x2', 170 + shift2);
            document.getElementById('arr4-line').setAttribute('x2', 250 + shift2);
        }
    } else {
        ghost2El.setAttribute('opacity', '0');
        if (shiftArrows2) shiftArrows2.setAttribute('opacity', '0');
    }
    
    const newX = BASE_X + (shift1 + shift2) / 2;
    const newY = BASE_Y - (shift1 - shift2) / 2;
    
    const yGuide2 = document.getElementById('y-guide-2');
    const xGuide2 = document.getElementById('x-guide-2');
    
    yGuide2.setAttribute('x1', newX);
    yGuide2.setAttribute('y1', newY);
    yGuide2.setAttribute('x2', newX);
    
    xGuide2.setAttribute('x1', 60);
    xGuide2.setAttribute('y1', newY);
    xGuide2.setAttribute('x2', newX);
    xGuide2.setAttribute('y2', newY);
    
    if (shift1 !== 0 || shift2 !== 0) {
        yGuide2.setAttribute('opacity', '1');
        xGuide2.setAttribute('opacity', '1');
    } else {
        yGuide2.setAttribute('opacity', '0');
        xGuide2.setAttribute('opacity', '0');
    }
}
