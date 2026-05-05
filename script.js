// State Management
const state = {
    model: 'islm', 
    selectedInputs: ['M', 'G'], 
    selectedOutputs: ['R', 'Y'],
    variables: {}, 
    activeArrows: {},
    env: {
        run: 'short',
        openness: 'closed',
        size: 'small'
    }
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

const VARIABLE_DESCRIPTIONS = {
    islm: [
        { v: 'Y', d: 'Output / Income', e: 'Total annual GDP.' },
        { v: 'C', d: 'Consumption', e: 'Household grocery spending.' },
        { v: 'I', d: 'Investment', e: 'Business computer purchases.' },
        { v: 'G', d: 'Govt Spending', e: 'Public bridge building.' },
        { v: 'NX', d: 'Net Exports', e: 'Software sold abroad.' },
        { v: 'M', d: 'Money Supply', e: 'Total cash in circulation.' },
        { v: 'P', d: 'Price Level', e: 'Average cost of bread.' },
        { v: 'R', d: 'Interest Rate', e: 'Mortgage borrowing cost.' }
    ],
    aadd: [
        { v: 'Y', d: 'Output / Income', e: 'Total annual GDP.' },
        { v: 'C', d: 'Consumption', e: 'Household grocery spending.' },
        { v: 'I', d: 'Investment', e: 'Business computer purchases.' },
        { v: 'G', d: 'Govt Spending', e: 'Public bridge building.' },
        { v: 'NX', d: 'Net Exports', e: 'Software sold abroad.' },
        { v: 'M', d: 'Money Supply', e: 'Total cash in circulation.' },
        { v: 'P', d: 'Price Level', e: 'Average cost of bread.' },
        { v: 'E', d: 'Exchange Rate', e: 'Dollars needed per Euro.' },
        { v: 'R*', d: 'Foreign Rate', e: 'European bond yields.' },
        { v: 'E*', d: 'Expected Rate', e: 'Sentiment on future value.' }
    ]
};

const MODEL_DESCRIPTIONS = {
    islm: "<b>IS-LM Model</b>: Analyzes the equilibrium between the goods market (IS) and the money market (LM) to determine real interest rates and national income.",
    aadd: "<b>AA-DD Model</b>: Examines the relationship between the exchange rate (AA) and output (DD) in an open economy, focusing on asset market and goods market balance."
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
    // Environmental Toggles
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const group = target.dataset.group;
            const val = target.dataset.val;

            document.querySelectorAll(`.toggle-btn[data-group="${group}"]`).forEach(b => {
                b.classList.remove('active');
            });
            target.classList.add('active');

            state.env[group] = val;
            
            // Auto-remove NX if closed
            if (group === 'openness' && val === 'closed') {
                state.selectedInputs = state.selectedInputs.filter(v => v !== 'NX');
            }

            updateUIForModel();
            updateGraph();
        });
    });
}

function updateUIForModel() {
    // Update Equation
    let formulaHtml = FORMULAS[state.model];
    if (state.env.openness === 'closed') {
        // Remove NX part from IS/DD formula
        formulaHtml = formulaHtml.replace(/<span class="op">\+<\/span>\s*<div[^>]*data-var="NX"[^>]*>NX<\/div>/g, '');
    }
    document.getElementById('equation-container').innerHTML = formulaHtml;
    
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
    
    // Update Variable Info
    const infoContainer = document.getElementById('variable-info');
    let descriptions = VARIABLE_DESCRIPTIONS[state.model];
    if (state.env.openness === 'closed') {
        descriptions = descriptions.filter(d => d.v !== 'NX');
    }
    infoContainer.innerHTML = descriptions.map(item => `
        <div class="var-item"><b>${item.v}</b>: ${item.d}. <i>Ex: ${item.e}</i></div>
    `).join('');

    // Update Model Description
    let modelDesc = MODEL_DESCRIPTIONS[state.model];
    if (state.env.run === 'long') {
        modelDesc += " <br><br><i>Long Run Mode: Prices are flexible and output is fixed at the full-employment level, making the " + (state.model === 'islm' ? 'LM' : 'AA') + " curve vertical.</i>";
    }
    document.getElementById('model-description').innerHTML = modelDesc;

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
    
    // Environmental Multipliers
    const multiplier = state.env.size === 'big' ? 1.5 : 1.0;
    const slope2 = state.env.run === 'long' ? 100 : 1; // Vertical LM in Long Run
    
    let s1 = (dC + dI + dG + dNX) * multiplier; 
    let s2 = 0;
    if (state.model === 'aadd') {
        s2 = (dM - dP + dRstar + dEstar) * multiplier;
    } else {
        s2 = (dM - dP) * multiplier;
    }
    
    // Intersection Math: 
    // y = -x + (210 + s1) + 160
    // y = slope2 * (x - (210 + s2)) + 160
    // -x + 370 + s1 = slope2*x - slope2*210 - slope2*s2 + 160
    // x(slope2 + 1) = 210 + s1 + slope2*210 + slope2*s2
    // x = 210 + (s1 + slope2*s2)/(slope2 + 1)
    
    const dY_val = (s1 + slope2 * s2) / (slope2 + 1);
    const dVert_val = s1 - dY_val; // For IS-LM this is dR, for AA-DD this is dE
    
    const results = {};
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
    const curve1 = document.getElementById('curve1');
    const curve2 = document.getElementById('curve2');
    const ghost = document.getElementById('curve1-ghost');
    const ghost2El = document.getElementById('curve2-ghost');
    
    if (!ghost2El) {
        const newGhost = document.createElementNS("http://www.w3.org/2000/svg", "line");
        newGhost.setAttribute("id", "curve2-ghost");
        document.getElementById("curves-group").appendChild(newGhost);
    }
    const ghost2 = document.getElementById('curve2-ghost');
    
    // Variables & Toggles
    const dC = state.variables.C || 0;
    const dI = state.variables.I || 0;
    const dG = state.variables.G || 0;
    const dNX = state.variables.NX || 0;
    const dM = state.variables.M || 0;
    const dP = state.variables.P || 0;
    const dRstar = state.variables['R*'] || 0;
    const dEstar = state.variables['E*'] || 0;
    
    const multiplier = state.env.size === 'big' ? 1.5 : 1.0;
    const slope2 = state.env.run === 'long' ? 100 : 1;
    
    let s1 = (dC + dI + dG + dNX) * multiplier; 
    let s2 = 0;
    if (state.model === 'aadd') {
        s2 = (dM - dP + dRstar + dEstar) * multiplier;
    } else {
        s2 = (dM - dP) * multiplier;
    }

    // Update Curve 1 (Slope -1)
    curve1.setAttribute('x1', 110 + s1);
    curve1.setAttribute('y1', 60);
    curve1.setAttribute('x2', 310 + s1);
    curve1.setAttribute('y2', 260);
    
    // Update Curve 2 (Dynamic Slope)
    // Base center is (210, 160). If s2=0, line passes through (210, 160).
    // y - 160 = slope2 * (x - (210 + s2))
    // x1 = 110 + s2, y1 = 160 + slope2 * (110 - 210) = 160 - 100*slope2
    // x2 = 310 + s2, y2 = 160 + slope2 * (310 - 210) = 160 + 100*slope2
    curve2.setAttribute('x1', 210 + s2 - 100/Math.sqrt(slope2)); // Scale for visual
    curve2.setAttribute('y1', 160 + slope2 * (-100/Math.sqrt(slope2)));
    curve2.setAttribute('x2', 210 + s2 + 100/Math.sqrt(slope2));
    curve2.setAttribute('y2', 160 + slope2 * (100/Math.sqrt(slope2)));
    curve2.setAttribute('stroke', '#684a68');
    curve2.setAttribute('stroke-width', '6');
    curve2.setAttribute('stroke-linecap', 'round');

    // Ghosts
    ghost.setAttribute('x1', 110); ghost.setAttribute('y1', 60); ghost.setAttribute('x2', 310); ghost.setAttribute('y2', 260);
    ghost.setAttribute('opacity', s1 !== 0 ? '0.3' : '0');
    
    ghost2.setAttribute('x1', 210 - 100/Math.sqrt(slope2)); 
    ghost2.setAttribute('y1', 160 - 100*slope2/Math.sqrt(slope2));
    ghost2.setAttribute('x2', 210 + 100/Math.sqrt(slope2)); 
    ghost2.setAttribute('y2', 160 + 100*slope2/Math.sqrt(slope2));
    ghost2.setAttribute('stroke', '#684a68'); ghost2.setAttribute('stroke-width', '6'); ghost2.setAttribute('opacity', s2 !== 0 ? '0.3' : '0');

    // Perpendicular Arrows
    const shiftArrows = document.getElementById('shift-arrows');
    const shiftArrows2 = document.getElementById('shift-arrows-2');
    
    if (s1 !== 0) {
        shiftArrows.setAttribute('opacity', '1');
        const d = s1 > 0 ? 15 : -15;
        // Curve 1 perpendicular is (1, 1)
        document.getElementById('arr1-line').setAttribute('x1', 170);
        document.getElementById('arr1-line').setAttribute('y1', 120);
        document.getElementById('arr1-line').setAttribute('x2', 170 + d);
        document.getElementById('arr1-line').setAttribute('y2', 120 + d);
        
        document.getElementById('arr2-line').setAttribute('x1', 250);
        document.getElementById('arr2-line').setAttribute('y1', 200);
        document.getElementById('arr2-line').setAttribute('x2', 250 + d);
        document.getElementById('arr2-line').setAttribute('y2', 200 + d);
    } else {
        shiftArrows.setAttribute('opacity', '0');
    }
    
    if (s2 !== 0) {
        shiftArrows2.setAttribute('opacity', '1');
        const d = s2 > 0 ? 15 : -15;
        // Curve 2 perpendicular is (-slope2, 1)
        const len = Math.sqrt(slope2*slope2 + 1);
        const dx = -slope2 / len * d;
        const dy = 1 / len * d;
        
        document.getElementById('arr3-line').setAttribute('x1', 170 + (slope2 > 1 ? 20 : 0));
        document.getElementById('arr3-line').setAttribute('y1', 160 + slope2*(170-210));
        document.getElementById('arr3-line').setAttribute('x2', 170 + (slope2 > 1 ? 20 : 0) + dx);
        document.getElementById('arr3-line').setAttribute('y2', 160 + slope2*(170-210) + dy);
        
        document.getElementById('arr4-line').setAttribute('x1', 250 - (slope2 > 1 ? 20 : 0));
        document.getElementById('arr4-line').setAttribute('y1', 160 + slope2*(250-210));
        document.getElementById('arr4-line').setAttribute('x2', 250 - (slope2 > 1 ? 20 : 0) + dx);
        document.getElementById('arr4-line').setAttribute('y2', 160 + slope2*(250-210) + dy);
    } else {
        shiftArrows2.setAttribute('opacity', '0');
    }
    
    // Equilibrium Intersections
    const newX = 210 + (s1 + slope2 * s2) / (slope2 + 1);
    const newY = 160 - (newX - (210 + s1)); // y = -x + 210 + s1 + 160 => y = 370 + s1 - newX
    
    const yGuide2 = document.getElementById('y-guide-2');
    const xGuide2 = document.getElementById('x-guide-2');
    
    yGuide2.setAttribute('x1', newX); yGuide2.setAttribute('y1', newY); yGuide2.setAttribute('x2', newX);
    xGuide2.setAttribute('x1', 60); xGuide2.setAttribute('y1', newY); xGuide2.setAttribute('x2', newX); xGuide2.setAttribute('y2', newY);
    
    const hasShift = s1 !== 0 || s2 !== 0;
    yGuide2.setAttribute('opacity', hasShift ? '1' : '0');
    xGuide2.setAttribute('opacity', hasShift ? '1' : '0');
}
