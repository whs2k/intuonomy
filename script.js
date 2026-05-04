// State Management
const state = {
    model: 'islm', 
    selectedInputs: ['M', 'G'], 
    selectedOutputs: ['R', 'Y'],
    variables: {}, 
    activeArrows: {} 
};

// Base Intersections
const BASE_X = 210;
const BASE_Y = 160;

const FORMULAS = {
    islm: `
        <div class="tile yellow cursor-pointer" data-var="Y" data-type="en">Y</div> <span class="op">=</span>
        <div class="tile yellow cursor-pointer" data-var="C" data-type="ex">C</div> <span class="op">+</span>
        <div class="tile yellow cursor-pointer" data-var="I" data-type="ex">I</div> <span class="op">+</span>
        <div class="tile yellow cursor-pointer" data-var="G" data-type="ex">G</div> <span class="op">+</span>
        <div class="tile yellow cursor-pointer" data-var="NX" data-type="ex">NX</div>
        <span style="margin: 0 15px;"></span>
        <div class="fraction">
            <div class="tile yellow cursor-pointer" data-var="M" data-type="ex">M</div>
            <hr>
            <div class="fraction-bottom">
                <div class="tile yellow cursor-pointer" data-var="P" data-type="ex">P</div>
            </div>
        </div>
        <span class="op">=</span>
        <div class="tile yellow">L</div><span class="bracket">(</span><div class="tile yellow cursor-pointer" data-var="R" data-type="en">R</div><span class="op">,</span><div class="tile yellow cursor-pointer" data-var="Y" data-type="en">Y</div><span class="bracket">)</span>
    `,
    aadd: `
        <div class="tile yellow cursor-pointer" data-var="C" data-type="ex">C</div> <span class="op">+</span>
        <div class="tile yellow cursor-pointer" data-var="I" data-type="ex">I</div> <span class="op">+</span>
        <div class="tile yellow cursor-pointer" data-var="G" data-type="ex">G</div> <span class="op">+</span>
        <div class="tile yellow cursor-pointer" data-var="NX" data-type="ex">NX</div>
        <span class="op">=</span> <div class="tile yellow cursor-pointer" data-var="Y" data-type="en">Y</div> <span class="op">=</span>
        <div class="fraction">
            <div class="tile yellow cursor-pointer" data-var="M" data-type="ex">M</div>
            <hr>
            <div class="fraction-bottom">
                <div class="tile yellow">L</div> <div class="tile yellow cursor-pointer" data-var="P" data-type="ex">P</div>
            </div>
        </div>
        <span class="big-bracket">[</span>
        <div class="fraction-inline">
            <div class="tile yellow cursor-pointer" data-var="R*" data-type="ex">R*</div> <span class="op">+</span> <div class="tile yellow cursor-pointer" data-var="E*" data-type="ex">E*</div> <span class="op">-</span> <span>1</span>
            <hr>
            <div class="tile yellow cursor-pointer" data-var="E" data-type="en" style="margin: 0 auto; display: block; width: max-content;">E</div>
        </div>
        <span class="big-bracket">]</span>
    `
};

document.addEventListener('DOMContentLoaded', () => {
    // Determine initial model from HTML active button
    const activeModelBtn = document.querySelector('.model-btn.active');
    if (activeModelBtn) state.model = activeModelBtn.dataset.model;
    
    // Set initial default selections based on model
    if (state.model === 'islm') {
        state.selectedInputs = ['M', 'G'];
        state.selectedOutputs = ['R', 'Y'];
    } else {
        state.selectedInputs = ['M', 'G'];
        state.selectedOutputs = ['E', 'Y'];
    }
    
    updateUIForModel();
    attachEventListeners();
    updateGraph();
});

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
            
            // Reset to defaults on model switch
            if (state.model === 'islm') {
                state.selectedInputs = ['M', 'G'];
                state.selectedOutputs = ['R', 'Y'];
            } else {
                state.selectedInputs = ['M', 'G'];
                state.selectedOutputs = ['E', 'Y'];
            }
            state.variables = {};
            state.activeArrows = {};
            
            updateUIForModel();
            updateGraph();
        });
    });
}

function updateUIForModel() {
    // Update Equation
    document.getElementById('equation-container').innerHTML = FORMULAS[state.model];
    
    // Attach click listeners to new equation tiles
    document.querySelectorAll('#equation-container .cursor-pointer').forEach(tile => {
        tile.addEventListener('click', (e) => {
            const v = e.currentTarget.dataset.var;
            const t = e.currentTarget.dataset.type;
            
            if (t === 'ex') {
                if (state.selectedInputs.includes(v)) {
                    state.selectedInputs = state.selectedInputs.filter(x => x !== v);
                } else {
                    state.selectedInputs.push(v);
                    state.variables[v] = 0;
                    state.activeArrows[v] = null;
                }
            } else if (t === 'en') {
                if (state.selectedOutputs.includes(v)) {
                    state.selectedOutputs = state.selectedOutputs.filter(x => x !== v);
                } else {
                    state.selectedOutputs.push(v);
                }
            }
            renderDynamicColumns();
            updateGraph();
        });
    });
    
    // Update Tags & Labels
    document.getElementById('current-model-tag').textContent = state.model === 'islm' ? 'IS-LM' : 'AA-DD';
    document.getElementById('y-axis-label').textContent = state.model === 'islm' ? 'R' : 'E';
    
    renderDynamicColumns();
}

function renderDynamicColumns() {
    // 1. Render Left Inputs Column
    const leftCol = document.getElementById('left-inputs-col');
    let leftHtml = '';
    state.selectedInputs.forEach((v, index) => {
        const isActiveUp = state.activeArrows[v] === 'up' ? 'active' : 'inactive';
        const isActiveDown = state.activeArrows[v] === 'down' ? 'active' : 'inactive';
        
        leftHtml += `
            <div class="control-row">
                <div class="number">${index + 1}</div> 
                <div class="tile outline yellow-fill">${v}</div> 
                <button class="circle up ${isActiveUp}" data-var="${v}" data-dir="up">↑</button> 
                <button class="circle down ${isActiveDown}" data-var="${v}" data-dir="down">↓</button>
            </div>
        `;
    });
    leftCol.innerHTML = leftHtml;
    
    // Attach event listeners to new input arrows
    leftCol.querySelectorAll('.circle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const variable = target.dataset.var;
            const dir = target.dataset.dir;
            
            if (state.activeArrows[variable] === dir) {
                state.activeArrows[variable] = null;
                state.variables[variable] = 0;
            } else {
                state.activeArrows[variable] = dir;
                state.variables[variable] = dir === 'up' ? 20 : -20;
            }
            
            renderDynamicColumns(); // Re-render to update classes
            updateGraph();
        });
    });

    // 2. Render Right Outputs Column
    const rightCol = document.getElementById('right-outputs-col');
    let rightHtml = '';
    
    // Calculate theoretical shifts first
    const shifts = calculateOutputs();
    
    state.selectedOutputs.forEach((v, index) => {
        const val = shifts[v] || 'minus';
        const upClass = val === 'up' ? 'active' : 'inactive';
        const minusClass = val === 'minus' ? 'active' : 'inactive';
        const downClass = val === 'down' ? 'active' : 'inactive';
        
        rightHtml += `
            <div class="control-row">
                <div class="number">${index + 1}</div> 
                <div class="tile outline yellow-fill">${v}</div> 
                <div class="output-circles">
                    <div class="circle up ${upClass}">↑</div> 
                    <div class="circle minus ${minusClass}">━</div> 
                    <div class="circle down ${downClass}">↓</div>
                </div>
            </div>
        `;
    });
    rightCol.innerHTML = rightHtml;
    
    // 3. Update Summary Boxes
    document.getElementById('summary-inputs').innerHTML = state.selectedInputs.map(v => `<div class="tile outline">${v}</div>`).join('');
    document.getElementById('summary-outputs').innerHTML = state.selectedOutputs.map(v => `<div class="tile outline">${v}</div>`).join('');
    
    // Highlight equation tiles that are selected
    document.querySelectorAll('#equation-container .cursor-pointer').forEach(tile => {
        const v = tile.dataset.var;
        if (state.selectedInputs.includes(v) || state.selectedOutputs.includes(v)) {
            tile.style.border = "2px solid #333";
            tile.style.boxShadow = "2px 2px 0px rgba(0,0,0,0.5)";
        } else {
            tile.style.border = "1px solid var(--border-color)";
            tile.style.boxShadow = "none";
        }
    });
}

function calculateOutputs() {
    const dC = state.variables.C || 0;
    const dI = state.variables.I || 0;
    const dG = state.variables.G || 0;
    const dNX = state.variables.NX || 0;
    
    const dM = state.variables.M || 0;
    const dP = state.variables.P || 0;
    const dRstar = state.variables['R*'] || 0;
    const dEstar = state.variables['E*'] || 0;
    
    let shift1 = 0; 
    let shift2 = 0; 
    
    if (state.model === 'aadd') {
        shift1 = dC + dI + dG + dNX; // DD curve shifts right
        shift2 = dM - dP + dRstar + dEstar; // AA curve shifts right
    } else {
        shift1 = dC + dI + dG + dNX; // IS curve shifts right
        shift2 = dM - dP; // LM curve shifts right
    }
    
    const dY_val = (shift1 + shift2) / 2;
    const dVert_val = (shift1 - shift2) / 2; // For IS-LM this is dR, for AA-DD this is dE
    
    const results = {};
    
    // Convert numerical shift to 'up', 'down', 'minus' state
    if (dY_val > 5) results['Y'] = 'up';
    else if (dY_val < -5) results['Y'] = 'down';
    else results['Y'] = 'minus';
    
    if (dVert_val > 5) {
        results['R'] = 'up';
        results['E'] = 'up';
    } else if (dVert_val < -5) {
        results['R'] = 'down';
        results['E'] = 'down';
    } else {
        results['R'] = 'minus';
        results['E'] = 'minus';
    }
    
    return results;
}

function updateGraph() {
    const curve1 = document.getElementById('curve1'); // Downward
    const curve2 = document.getElementById('curve2'); // Upward
    const ghost = document.getElementById('curve1-ghost');
    const ghost2El = document.getElementById('curve2-ghost');
    
    // Create ghost2 if it doesn't exist
    if (!ghost2El) {
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
    
    const ghost2 = document.getElementById('curve2-ghost');
    
    const dC = state.variables.C || 0;
    const dI = state.variables.I || 0;
    const dG = state.variables.G || 0;
    const dNX = state.variables.NX || 0;
    const dM = state.variables.M || 0;
    const dP = state.variables.P || 0;
    const dRstar = state.variables['R*'] || 0;
    const dEstar = state.variables['E*'] || 0;
    
    let shift1 = 0; 
    let shift2 = 0; 
    
    if (state.model === 'aadd') {
        shift1 = dC + dI + dG + dNX; 
        shift2 = dM - dP + dRstar + dEstar; 
    } else {
        shift1 = dC + dI + dG + dNX; 
        shift2 = dM - dP; 
    }
    
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
        ghost2.setAttribute('opacity', '0.3');
        if (shiftArrows2) {
            shiftArrows2.setAttribute('opacity', '1');
            document.getElementById('arr3-line').setAttribute('x2', 170 + shift2);
            document.getElementById('arr4-line').setAttribute('x2', 250 + shift2);
        }
    } else {
        ghost2.setAttribute('opacity', '0');
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
