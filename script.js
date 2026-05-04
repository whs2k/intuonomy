// State Management
const state = {
    model: 'aadd', // 'islm' or 'aadd'
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

document.addEventListener('DOMContentLoaded', () => {
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
            e.target.classList.add('active');
            e.target.classList.remove('inactive');
            
            state.model = e.target.dataset.model;
            document.getElementById('current-model-tag').textContent = state.model === 'islm' ? 'IS-LM' : 'AA-DD';
            document.getElementById('y-axis-label').textContent = state.model === 'islm' ? 'R' : 'E';
            document.getElementById('out-label-1').textContent = state.model === 'islm' ? 'R' : 'E';
            
            // Reset shifts on model change
            state.variables.M = 0;
            state.variables.G = 0;
            state.activeArrows.M = null;
            state.activeArrows.G = null;
            
            updateInputArrows();
            calculateOutputs();
            updateOutputArrows();
            updateGraph();
        });
    });

    // Input Buttons
    document.querySelectorAll('.side-col .circle').forEach(btn => {
        if (!btn.hasAttribute('data-var')) return; // skip output buttons
        
        btn.addEventListener('click', (e) => {
            const variable = e.target.dataset.var; // M or G
            const dir = e.target.dataset.dir; // up or down
            
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
        
        upBtn.className = 'circle up inactive';
        downBtn.className = 'circle down inactive';
        
        if (state.activeArrows[v] === 'up') {
            upBtn.className = 'circle up active';
        } else if (state.activeArrows[v] === 'down') {
            downBtn.className = 'circle down active';
        }
    });
}

function calculateOutputs() {
    const dG = state.variables.G;
    const dM = state.variables.M;
    
    // Model specific logic
    if (state.model === 'aadd') {
        // AA-DD Model
        // 1: E, 2: Y
        
        // G up shifts DD right
        // M up shifts AA right
        const shiftDD = dG;
        const shiftAA = dM;
        
        // E (y-axis) changes
        const dE = - (shiftDD - shiftAA) / 2;
        if (dE > 5) state.outputs[1] = 'down';
        else if (dE < -5) state.outputs[1] = 'up'; // Wait, in standard AA-DD, E axis has exchange rate. Up is depreciation.
        else state.outputs[1] = 'minus';
        
        // Y (x-axis) changes
        const dY = (shiftDD + shiftAA) / 2;
        if (dY > 5) state.outputs[2] = 'up';
        else if (dY < -5) state.outputs[2] = 'down';
        else state.outputs[2] = 'minus';
        
    } else {
        // IS-LM Model
        // 1: R, 2: Y
        
        const shiftIS = dG;
        const shiftLM = dM;
        
        // R (y-axis) changes (axis visually goes down for higher values? No, y=0 is top. so y increases going down. But R is up on y axis)
        const dR = - (shiftIS - shiftLM) / 2; 
        if (dR < -5) state.outputs[1] = 'up';
        else if (dR > 5) state.outputs[1] = 'down';
        else state.outputs[1] = 'minus';
        
        // Y changes
        const dY = (shiftIS + shiftLM) / 2;
        if (dY > 5) state.outputs[2] = 'up';
        else if (dY < -5) state.outputs[2] = 'down';
        else state.outputs[2] = 'minus';
    }
}

function updateOutputArrows() {
    [1, 2].forEach(num => {
        const group = document.getElementById(`out-group-${num}`);
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
    const curve1 = document.getElementById('curve1'); // Downward (AA or IS)
    const curve2 = document.getElementById('curve2'); // Upward (DD or LM)
    const ghost = document.getElementById('curve1-ghost');
    
    // Default stroke colors based on wireframe
    curve1.setAttribute('stroke', '#3a3a3a'); // dark gray
    curve2.setAttribute('stroke', '#684a68'); // purple
    ghost.setAttribute('stroke', '#3a3a3a');
    
    let shift1 = 0; // shift for downward curve
    let shift2 = 0; // shift for upward curve
    
    if (state.model === 'aadd') {
        shift1 = state.variables.M; // AA shifts with M
        shift2 = state.variables.G; // DD shifts with G
    } else {
        shift1 = state.variables.G; // IS shifts with G
        shift2 = state.variables.M; // LM shifts with M
    }
    
    // Apply transforms
    curve1.style.transform = `translateX(${shift1}px)`;
    curve2.style.transform = `translateX(${shift2}px)`;
    
    // Handle ghost and arrows (if there is a shift in curve 1)
    const shiftArrows = document.getElementById('shift-arrows');
    if (shift1 !== 0) {
        ghost.style.opacity = '0.3';
        shiftArrows.style.opacity = '1';
        
        // Position arrows to show shift direction
        const dx = shift1 > 0 ? 20 : -20;
        const dy = 0;
        
        document.getElementById('arr1-line').setAttribute('x2', 150 + dx);
        document.getElementById('arr1-line').setAttribute('y2', 150 + dy);
        
        document.getElementById('arr2-line').setAttribute('x2', 250 + dx);
        document.getElementById('arr2-line').setAttribute('y2', 250 + dy);
        
    } else {
        ghost.style.opacity = '0';
        shiftArrows.style.opacity = '0';
    }
    
    // Update Intersection Guides
    const newX = BASE_X + (shift1 + shift2) / 2;
    const newY = BASE_Y - (shift1 - shift2) / 2;
    
    document.getElementById('y-guide-2').setAttribute('x1', newX);
    document.getElementById('y-guide-2').setAttribute('y1', newY);
    document.getElementById('y-guide-2').setAttribute('x2', newX);
    
    document.getElementById('x-guide-2').setAttribute('x1', 60);
    document.getElementById('x-guide-2').setAttribute('y1', newY);
    document.getElementById('x-guide-2').setAttribute('x2', newX);
    
    if (shift1 !== 0 || shift2 !== 0) {
        document.getElementById('y-guide-2').setAttribute('opacity', '1');
        document.getElementById('x-guide-2').setAttribute('opacity', '1');
    } else {
        document.getElementById('y-guide-2').setAttribute('opacity', '0');
        document.getElementById('x-guide-2').setAttribute('opacity', '0');
    }
}
