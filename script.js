// ============================================================================
// CONTROL-SIM v2 — script.js
// ============================================================================

// Aplicar tema antes del DOM para evitar parpadeo
applyStoredTheme();

// ============================================================================
// CONSTANTES GLOBALES
// ============================================================================

const APP_VERSION = 'v2.0.0';

const DURATION  = 40;       // segundos de simulación
const TIME_STEP = 0.01;     // paso de integración Euler
const N_STEPS   = Math.ceil(DURATION / TIME_STEP);

// ============================================================================
// ESTADO DE LA APLICACIÓN
// ============================================================================

let loopType        = 'open';       // 'open' | 'closed'
let allDatasets     = [];
let lastInputDataset = null;
let chartInstance   = null;

// ============================================================================
// INTERNACIONALIZACIÓN
// ============================================================================

function getLang() {
    return localStorage.getItem('language') || 'es';
}

function tr(key) {
    const lang = getLang();
    const map  = { es: window.LANG_ES, eu: window.LANG_EU, en: window.LANG_EN };
    const dict = map[lang] || window.LANG_ES;
    return dict[key] || key;
}

const FLAG_SVGS = {
    es: `<svg class="flag-svg" width="28" height="19" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#AA151B"/><rect y="10" width="60" height="20" fill="#F1BF00"/></svg>`,
    eu: `<svg class="flag-svg" width="28" height="19" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#D8202C"/><rect x="24" y="0" width="12" height="40" fill="white"/><rect x="0" y="14" width="60" height="12" fill="white"/><rect x="26.5" y="0" width="7" height="40" fill="#007A3D"/><rect x="0" y="16.5" width="60" height="7" fill="#007A3D"/></svg>`,
    en: `<svg class="flag-svg" width="28" height="19" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#012169"/><line x1="0" y1="0" x2="60" y2="40" stroke="white" stroke-width="8"/><line x1="60" y1="0" x2="0" y2="40" stroke="white" stroke-width="8"/><line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" stroke-width="4.5"/><line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" stroke-width="4.5"/><rect x="24" y="0" width="12" height="40" fill="white"/><rect x="0" y="14" width="60" height="12" fill="white"/><rect x="26" y="0" width="8" height="40" fill="#C8102E"/><rect x="0" y="16" width="60" height="8" fill="#C8102E"/></svg>`
};

window.setLanguage = function(lang) {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    updateLangButton(lang);
    document.querySelectorAll('.lang-option').forEach(el =>
        el.classList.toggle('active', el.dataset.lang === lang)
    );
    rebuildInputParams();
    updateDerivedInfo();
    updateFTDisplay();
    updateDiagram();
    renderChart();
    if (typeof MathJax !== 'undefined') MathJax.typeset();
};

function applyTranslations() {
    const lang = getLang();
    document.title = tr('document_title');

    // Elementos estáticos con data-lang-key
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        const val = tr(key);
        if (el.tagName === 'OPTION') el.textContent = val;
        else el.innerHTML = val;
    });

    // Atributos aria-label
    document.querySelectorAll('[data-lang-key-aria]').forEach(el => {
        const key = el.dataset.langKeyAria;
        el.setAttribute('aria-label', tr(key));
    });

    const verEl = document.getElementById('appVersionPlaceholder');
    if (verEl) verEl.textContent = APP_VERSION;
}

function updateLangButton(lang) {
    const btn = document.getElementById('langButtonContent');
    if (!btn) return;
    const codes = { es: 'ES', eu: 'EU', en: 'EN' };
    btn.innerHTML = `${FLAG_SVGS[lang] || ''}<span class="lang-code">${codes[lang] || lang.toUpperCase()}</span>`;
}

// ============================================================================
// SELECTOR DE IDIOMA (UI)
// ============================================================================

window.toggleLangMenu = function() {
    const menu   = document.getElementById('langMenu');
    const button = document.getElementById('langButton');
    menu.classList.toggle('hidden');
    const open = !menu.classList.contains('hidden');
    button.setAttribute('aria-expanded', open);
    if (open) setTimeout(() => document.addEventListener('click', closeLangOnOutside), 0);
};

function closeLangOnOutside(e) {
    const wrap = document.getElementById('languageSelectorWrapper');
    if (!wrap.contains(e.target)) {
        document.getElementById('langMenu').classList.add('hidden');
        document.getElementById('langButton').setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', closeLangOnOutside);
    }
}

// ============================================================================
// SELECTOR DE TEMA
// ============================================================================

window.toggleThemeMenu = function() {
    const menu = document.getElementById('themeMenu');
    menu.classList.toggle('hidden');
    if (!menu.classList.contains('hidden'))
        setTimeout(() => document.addEventListener('click', closeThemeOnOutside), 0);
};

function closeThemeOnOutside(e) {
    const menu = document.getElementById('themeMenu');
    const btn  = document.getElementById('themeButton');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add('hidden');
        document.removeEventListener('click', closeThemeOnOutside);
    }
}

window.changeTheme = function(theme) {
    const root = document.documentElement;
    if (theme === 'auto') {
        root.setAttribute('data-theme',
            window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
        root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
    toggleThemeMenu();
    updateDiagram(); // el diagrama SVG usa colores del tema
};

window.changeColorScheme = function(scheme) {
    document.documentElement.setAttribute('data-color-scheme', scheme);
    localStorage.setItem('colorScheme', scheme);
    toggleThemeMenu();
    updateDiagram();
};

function applyStoredTheme() {
    const t  = localStorage.getItem('theme')       || 'auto';
    const cs = localStorage.getItem('colorScheme') || 'blue';
    document.documentElement.setAttribute('data-theme',
        t === 'auto'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : t
    );
    document.documentElement.setAttribute('data-color-scheme', cs);
}

// ============================================================================
// CONTROL DE LAZO
// ============================================================================

window.setLoop = function(type) {
    loopType = type;
    document.getElementById('btnOpenLoop').classList.toggle('selected',   type === 'open');
    document.getElementById('btnClosedLoop').classList.toggle('selected', type === 'closed');

    // PID solo visible en lazo cerrado
    const pidCard = document.getElementById('cardPID');
    if (type === 'open') {
        document.getElementById('togglePID').checked = false;
        pidCard.classList.remove('active');
    }

    // Realimentación solo en lazo cerrado
    document.getElementById('cardFeedback').style.display = type === 'closed' ? '' : 'none';

    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// CONTROL DE MÓDULOS (TOGGLES)
// ============================================================================

window.onModuleToggle = function(name) {
    const checkbox = document.getElementById('toggle' + name);
    const card     = document.getElementById('card'   + name);
    const isOn     = checkbox.checked;
    card.classList.toggle('active', isOn);

    // PID solo funciona en lazo cerrado
    if (name === 'PID' && loopType === 'open') {
        checkbox.checked = false;
        card.classList.remove('active');
    }

    if (name === 'Process') onOrderChange(); // muestra/oculta T2
    updateDerivedInfo();
    updateFTDisplay();
    updateDiagram();
};

function isModuleOn(name) {
    const cb = document.getElementById('toggle' + name);
    return cb ? cb.checked : false;
}

// ============================================================================
// MÓDULO: GENERADOR DE SEÑAL — parámetros dinámicos
// ============================================================================

window.onInputTypeChange = function() {
    rebuildInputParams();
    updateFTDisplay();
    updateDiagram();
};

function rebuildInputParams() {
    const type = document.getElementById('inputTypeSelect').value;
    const container = document.getElementById('inputParamsContainer');
    let html = '';

    if (type === 'step') {
        html = `
            <label class="field-label" for="pStepMin">${tr('step_min_label')}</label>
            <input  class="field-input" type="number" id="pStepMin" value="0"   step="0.5">
            <label class="field-label" for="pStepMax">${tr('step_max_label')}</label>
            <input  class="field-input" type="number" id="pStepMax" value="1"   step="0.5">
        `;
    } else if (type === 'ramp') {
        html = `
            <label class="field-label" for="pRampSlope">${tr('ramp_slope_label')}</label>
            <input  class="field-input" type="number" id="pRampSlope" value="0.5" step="0.1" min="0.01">
        `;
    } else { // sin
        html = `
            <label class="field-label" for="pSinAmp">${tr('sin_amp_label')}</label>
            <input  class="field-input" type="number" id="pSinAmp"  value="1.0" step="0.1" min="0.01">
            <label class="field-label" for="pSinFreq">${tr('sin_freq_label')}</label>
            <input  class="field-input" type="number" id="pSinFreq" value="0.5" step="0.1" min="0.01">
        `;
    }

    container.innerHTML = html;
    if (typeof MathJax !== 'undefined') MathJax.typeset([container]);
}

// ============================================================================
// MÓDULO: PROCESO — orden 1º / 2º
// ============================================================================

window.onOrderChange = function() {
    const is2nd = document.getElementById('systemOrderSelect').value === 'second';
    document.getElementById('t2Row').style.display = (is2nd && isModuleOn('Process')) ? '' : 'none';
    updateDerivedInfo();
    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// MÓDULO: PROCESO — parámetros derivados (ωn, ζ desde T1, T2)
// ============================================================================

function getDerivedProcessParams() {
    const T1  = parseFloat(document.getElementById('pT1').value) || 1.0;
    const T2  = parseFloat(document.getElementById('pT2').value) || 0.1;
    const ord = document.getElementById('systemOrderSelect').value;

    if (ord === 'first') {
        return { order: 'first', tau: T1 };
    }
    // 2º orden: G(s) = Kp / ((T1s+1)(T2s+1))
    // → wn = 1/sqrt(T1·T2),  ζ = (T1+T2)/(2·sqrt(T1·T2))
    const wn   = 1.0 / Math.sqrt(T1 * T2);
    const zeta = (T1 + T2) / (2.0 * Math.sqrt(T1 * T2));
    return { order: 'second', wn, zeta, T1, T2 };
}

function updateDerivedInfo() {
    const div = document.getElementById('derivedInfoDiv');
    if (!div) return;

    if (!isModuleOn('Process')) {
        div.innerHTML = '';
        return;
    }

    const p = getDerivedProcessParams();
    if (p.order === 'first') {
        div.innerHTML =
            `<span>${tr('derived_tau')}</span> <span class="derived-value">${p.tau.toFixed(3)} s</span>`;
    } else {
        div.innerHTML =
            `<span>${tr('derived_wn')}</span> <span class="derived-value">${p.wn.toFixed(4)} rad/s</span><br>` +
            `<span>${tr('derived_zeta')}</span> <span class="derived-value">${p.zeta.toFixed(4)}</span>`;
    }
    if (typeof MathJax !== 'undefined') MathJax.typeset([div]);
}

window.onParamChange = function() {
    updateDerivedInfo();
    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// MÓDULO: CONTROLADOR — tipo PID / On-Off
// ============================================================================

window.onControllerTypeChange = function() {
    // Por ahora solo PID está implementado — preparado para on-off en futuro
    const type = document.getElementById('controllerTypeSelect').value;
    document.getElementById('pidParamsDiv').style.display = (type === 'pid') ? '' : 'none';
    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// PID: checkbox Ti = ∞
// ============================================================================

window.onTiInfChange = function() {
    const inf   = document.getElementById('tiInfCheck').checked;
    const input = document.getElementById('pTi');
    input.disabled = inf;
    if (inf) input.value = '';
    updateFTDisplay();
};

// ============================================================================
// REALIMENTACIÓN: tipo unitaria / con retardo
// ============================================================================

window.onFeedbackTypeChange = function() {
    const isDelay = document.getElementById('feedbackTypeSelect').value === 'delay';
    document.getElementById('thRow').style.display = isDelay ? '' : 'none';
    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// FUNCIÓN DE TRANSFERENCIA — visualización simbólica
// ============================================================================

function updateFTDisplay() {
    const div      = document.getElementById('ftDisplay');
    const hasProc  = isModuleOn('Process');
    const hasPID   = loopType === 'closed' && isModuleOn('PID');
    const hasDelay = isModuleOn('Delay');
    const isCL     = loopType === 'closed';
    const fbType   = document.getElementById('feedbackTypeSelect').value;

    const Kp  = parseFloat(document.getElementById('pKp').value)  || 1;
    const T1  = parseFloat(document.getElementById('pT1').value)  || 1;
    const T2  = parseFloat(document.getElementById('pT2').value)  || 0.1;
    const Td  = parseFloat(document.getElementById('pTd').value)  || 0;
    const Kc  = parseFloat(document.getElementById('pKc').value)  || 1;
    const inf = document.getElementById('tiInfCheck').checked;
    const Ti  = inf ? null : (parseFloat(document.getElementById('pTi').value) || 10);
    const Tdc = parseFloat(document.getElementById('pTdc').value) || 0;
    const Th  = parseFloat(document.getElementById('pTh').value)  || 0.5;
    const ord = document.getElementById('systemOrderSelect').value;

    let html = '';

    // ── Proceso Gp(s)
    if (hasProc) {
        html += `<h3>${tr('ft_proc_title')}</h3>`;
        if (ord === 'first') {
            html += `$$G_p(s) = \\frac{${Kp}}{${T1}\\,s + 1}$$`;
        } else {
            // Solo la fórmula — ωn y ζ del proceso ya se muestran en la tarjeta
            html += `$$G_p(s) = \\frac{${Kp}}{(${T1}\\,s+1)(${T2}\\,s+1)}$$`;
        }
    }

    // ── Controlador Gc(s)
    if (hasPID) {
        html += `<h3>${tr('ft_pid_title')}</h3>`;
        const ctrlType = document.getElementById('controllerTypeSelect').value;
        if (ctrlType === 'pid') {
            let terms = '1';
            if (!inf) terms += ` + \\frac{1}{${Ti}\\,s}`;
            if (Tdc > 0) terms += ` + ${Tdc}\\,s`;
            html += `$$G_c(s) = ${Kc}\\left(${terms}\\right)$$`;
        }
        // On/Off: sin FT analítica (no lineal) — se añadirá en futuro
    }

    // ── Cadena directa (forward path string)
    // Nota: usar \\, entre términos para separar correctamente en LaTeX
    const fwParts = [];
    if (hasPID)   fwParts.push('G_c(s)');
    if (hasProc)  fwParts.push('G_p(s)');
    if (hasDelay) fwParts.push(`e^{-${Td}\\,s}`);
    const fw = fwParts.length ? fwParts.join('\\,') : '1';

    if (!isCL) {
        html += `<h3>${tr('ft_open_loop_title')}</h3>`;
        html += `$$G(s) = ${fw}$$`;
    } else {
        const H = (fbType === 'delay') ? `e^{-${Th}\\,s}` : '1';
        html += `<h3>${tr('ft_closed_loop_title')}</h3>`;
        html += `$$G_{LC}(s) = \\frac{${fw}}{1 + ${fw}\\,${H}}$$`;

        // ── Parámetros del lazo cerrado
        // Solo calculables analíticamente sin PID ni retardo (polos exactos)
        // Con PID o retardo, los polos cambian pero mostramos igualmente una nota
        if (hasProc) {
            const d = getDerivedProcessParams();
            const hasModifiers = hasPID || hasDelay;

            if (d.order === 'first') {
                // Sin modificadores: G_LC = Kp/(T1s+1+Kp)  → τ_cl = T1/(1+Kp)
                if (!hasModifiers) {
                    const tau_cl = T1 / (1 + Kp);
                    html += `<div class="cl-derived-box">`;
                    html += `<span class="cl-derived-label">${tr('cl_tau_label')}:</span> `;
                    html += `<span class="cl-derived-value">${tau_cl.toFixed(4)} s</span>`;
                    html += `</div>`;
                }
                // Con PID/retardo no se puede dar τ_cl exacto → silencio (demasiado complejo)
            } else {
                // 2º orden: G_LC = Kp / (T1T2 s² + (T1+T2)s + 1+Kp)
                // ωn_cl = sqrt((1+Kp)/(T1·T2))
                // ζ_cl  = (T1+T2) / (2·sqrt(T1·T2·(1+Kp)))
                // Estas fórmulas son exactas SIN PID ni retardo.
                // Con retardo/PID cambia el denominador, pero ωn_cl y ζ_cl del
                // proceso solo son una aproximación → se indica con "≈"
                const wn_cl   = Math.sqrt((1 + Kp) / (T1 * T2));
                const zeta_cl = (T1 + T2) / (2 * Math.sqrt(T1 * T2 * (1 + Kp)));
                const approx  = hasModifiers ? '≈' : '';
                html += `<div class="cl-derived-box">`;
                html += `<div><span class="cl-derived-label">${tr('cl_wn_label')}:</span> `;
                html += `<span class="cl-derived-value">${approx}${wn_cl.toFixed(4)} rad/s</span></div>`;
                html += `<div><span class="cl-derived-label">${tr('cl_zeta_label')}:</span> `;
                html += `<span class="cl-derived-value">${approx}${zeta_cl.toFixed(4)}</span></div>`;
                if (hasModifiers) {
                    html += `<div class="cl-derived-note">${tr('cl_approx_note')}</div>`;
                }
                html += `</div>`;
            }
        }
    }

    div.innerHTML = html;
    if (typeof MathJax !== 'undefined') MathJax.typeset([div]);
}

// ============================================================================
// DIAGRAMA SVG DE BLOQUES
// ============================================================================

function updateDiagram() {
    const svg     = document.getElementById('diagramSvg');
    const hasPID  = loopType === 'closed' && isModuleOn('PID');
    const hasProc = isModuleOn('Process');
    const hasDel  = isModuleOn('Delay');
    const isCL    = loopType === 'closed';
    const fbType  = document.getElementById('feedbackTypeSelect').value;

    const isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgCol   = isDark ? '#1e293b' : '#ffffff';
    const txCol   = isDark ? '#e2e8f0' : '#2d3748';
    const lineCol = isDark ? '#94a3b8' : '#64748b';

    // Leer color primario actual del CSS
    const style   = getComputedStyle(document.documentElement);
    const acCol   = style.getPropertyValue('--color-primary').trim()  || '#1e40af';
    const pidCol  = '#9333ea';
    const delCol  = '#ea580c';
    const fbCol   = '#16a34a';

    const W  = 800, H = 195;
    const CY = 62;     // centro vertical cadena directa
    const BH = 40;     // altura de caja
    const BFS = 11;    // font-size en cajas
    const SR = 17;     // radio del sumador
    const GAP = 14;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // ── Helper functions ─────────────────────────────────────────────────────
    function mkArrow(id, color) {
        return `<marker id="${id}" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L9,3.5 z" fill="${color}"/>
                </marker>`;
    }

    // Genera id único de marcador a partir del color hex
    function arrId(col) { return 'arr_' + col.replace('#', '').substring(0, 6); }

    function line(x1, y1, x2, y2, col, arrow = true, dash = false) {
        const mEnd = arrow ? `marker-end="url(#${arrId(col)})"` : '';
        const dArr = dash  ? 'stroke-dasharray="5,3"' : '';
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                    stroke="${col}" stroke-width="2" ${mEnd} ${dArr}/>`;
    }

    function box(x, y, w, h, fill, stroke, label) {
        const lines  = label.split('\n');
        const nLines = lines.length;
        const lineH  = BFS * 1.3;
        const totalH = nLines * lineH;
        const yStart = y + h / 2 - totalH / 2 + lineH * 0.7;
        const tspans = lines.map((l, i) =>
            `<tspan x="${x + w / 2}" dy="${i === 0 ? '0' : `${lineH}px`}">${l}</tspan>`
        ).join('');
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"
                    fill="${fill}" stroke="${stroke}" stroke-width="2"/>
                <text x="${x + w / 2}" y="${yStart}"
                    text-anchor="middle"
                    font-size="${BFS}" font-family="Segoe UI,sans-serif"
                    font-weight="600" fill="${txCol}">${tspans}</text>`;
    }

    function nodeLabel(x, y, txt, col = txCol, size = 13, anchor = 'middle') {
        return `<text x="${x}" y="${y}" font-size="${size}"
                    font-family="Segoe UI,sans-serif" font-weight="700"
                    fill="${col}" text-anchor="${anchor}"
                    dominant-baseline="middle">${txt}</text>`;
    }

    // ── Calcular posiciones ──────────────────────────────────────────────────
    let cx = 12;

    const rLabelX = cx + 18; cx += 42;
    const wireStartX = cx;

    let sumCX = null;
    if (isCL) { sumCX = cx + SR; cx += SR * 2 + GAP; }

    let pidX = null, pidW = 74;
    if (hasPID) { pidX = cx; cx += pidW + GAP; }

    let procX = null, procW = 84;
    if (hasProc) { procX = cx; cx += procW + GAP; }

    let delX = null, delW = 80;
    if (hasDel) { delX = cx; cx += delW + GAP; }

    const yLabelX  = cx + 18;
    const wireEndX = yLabelX - 6;
    const outputX  = yLabelX + 18;

    // ── Arrow markers ────────────────────────────────────────────────────────
    const arrowColors = [lineCol, acCol, pidCol, delCol, fbCol];
    let s = '<defs>';
    arrowColors.forEach(c => { s += mkArrow(arrId(c), c); });
    s += '</defs>';

    // ── Etiquetas R(s) e Y(s) — encima del hilo, no solapadas ────────────────
    // R(s): centrado sobre el inicio del hilo, encima
    s += nodeLabel(rLabelX, CY - 18, 'R(s)');
    // Y(s): a la derecha del último elemento, también encima
    s += nodeLabel(yLabelX, CY - 18, 'Y(s)');

    // ── Línea horizontal principal (sin flecha, solo el fondo) ───────────────
    s += line(wireStartX, CY, wireEndX, CY, lineCol, false);

    // ── Sumador ──────────────────────────────────────────────────────────────
    if (isCL && sumCX) {
        s += line(wireStartX, CY, sumCX - SR - 2, CY, lineCol, true);
        s += `<circle cx="${sumCX}" cy="${CY}" r="${SR}"
                fill="${bgCol}" stroke="${acCol}" stroke-width="2"/>`;
        s += `<text x="${sumCX}" y="${CY + 2}" text-anchor="middle"
                dominant-baseline="middle" font-size="18" font-weight="bold"
                fill="${acCol}">+</text>`;
        // signo − en la parte inferior del círculo (entrada realimentación)
        s += `<text x="${sumCX}" y="${CY + SR + 10}" text-anchor="middle"
                font-size="11" fill="${acCol}">−</text>`;
        const nextX = pidX ?? procX ?? delX ?? yLabelX;
        s += line(sumCX + SR, CY, nextX, CY, lineCol, true);
    } else {
        const firstX = pidX ?? procX ?? delX ?? yLabelX;
        s += line(wireStartX, CY, firstX, CY, lineCol, true);
    }

    // ── Bloque Controlador ───────────────────────────────────────────────────
    if (hasPID) {
        const ctrlType = document.getElementById('controllerTypeSelect').value;
        const ctrlLbl  = ctrlType === 'pid' ? 'PID\nGc(s)' : 'On/Off\nGc(s)';
        s += box(pidX, CY - BH / 2, pidW, BH, bgCol, pidCol, ctrlLbl);
        const nextX = procX ?? delX ?? yLabelX;
        s += line(pidX + pidW, CY, nextX, CY, lineCol, true);
    }

    // ── Bloque Proceso ───────────────────────────────────────────────────────
    if (hasProc) {
        const ord  = document.getElementById('systemOrderSelect').value;
        const plbl = ord === 'first' ? '1er Orden\nGp(s)' : '2º Orden\nGp(s)';
        s += box(procX, CY - BH / 2, procW, BH, bgCol, acCol, plbl);
        const nextX = delX ?? yLabelX;
        s += line(procX + procW, CY, nextX, CY, lineCol, true);
    }

    // ── Bloque Retardo ───────────────────────────────────────────────────────
    if (hasDel) {
        const Td = parseFloat(document.getElementById('pTd').value) || 0;
        s += box(delX, CY - BH / 2, delW, BH, bgCol, delCol, `Retardo\nTd = ${Td} s`);
        s += line(delX + delW, CY, yLabelX - 6, CY, lineCol, true);
    }

    // ── Ruta de realimentación (solo lazo cerrado) ────────────────────────────
    if (isCL && sumCX) {
        const fbY   = CY + 78;
        const fromX = outputX - 10;
        const Th    = parseFloat(document.getElementById('pTh').value) || 0.5;

        // Bajada desde nodo Y
        s += line(fromX, CY,   fromX, fbY,  fbCol, false);
        // Línea horizontal inferior
        s += line(fromX, fbY,  sumCX, fbY,  fbCol, false);
        // Subida al sumador
        s += line(sumCX, fbY,  sumCX, CY + SR + 2, fbCol, true);

        // Bloque H(s)
        if (fbType === 'delay') {
            const fbBW = 82, fbBH = 32;
            const fbBx = (fromX + sumCX) / 2 - fbBW / 2;
            s += box(fbBx, fbY - fbBH / 2, fbBW, fbBH, bgCol, fbCol, `H(s)\nTh = ${Th} s`);
        } else {
            s += `<text x="${(fromX + sumCX) / 2}" y="${fbY - 7}"
                    text-anchor="middle" font-size="11"
                    font-family="Segoe UI,sans-serif" font-weight="600"
                    fill="${fbCol}">H(s) = 1</text>`;
        }
    }

    svg.innerHTML = s;
}

// ============================================================================
// MOTOR DE SIMULACIÓN (integración de Euler)
// ============================================================================

function R_t(t, inputType) {
    if (inputType === 'step') {
        const min = parseFloat(document.getElementById('pStepMin')?.value) ?? 0;
        const max = parseFloat(document.getElementById('pStepMax')?.value) ?? 1;
        return t >= 0 ? max : min;
    } else if (inputType === 'ramp') {
        const slope = parseFloat(document.getElementById('pRampSlope')?.value) || 0.5;
        return t >= 0 ? slope * t : 0;
    } else { // sin
        const A = parseFloat(document.getElementById('pSinAmp')?.value)  || 1.0;
        const w = parseFloat(document.getElementById('pSinFreq')?.value) || 0.5;
        return A * Math.sin(w * t);
    }
}

function runSimulation() {
    const inputType = document.getElementById('inputTypeSelect').value;
    const hasProc   = isModuleOn('Process');
    const hasPID    = loopType === 'closed' && isModuleOn('PID');
    const hasDelay  = isModuleOn('Delay');
    const isCL      = loopType === 'closed';
    const fbType    = document.getElementById('feedbackTypeSelect').value;

    // Parámetros del proceso
    const Kp  = parseFloat(document.getElementById('pKp').value)  || 1.0;
    const T1  = parseFloat(document.getElementById('pT1').value)  || 1.0;
    const T2  = parseFloat(document.getElementById('pT2').value)  || 0.1;
    const ord = document.getElementById('systemOrderSelect').value;

    // Retardo del proceso
    const Td = hasDelay ? Math.max(0, parseFloat(document.getElementById('pTd').value) || 0) : 0;

    // PID
    const Kc  = hasPID ? (parseFloat(document.getElementById('pKc').value)  || 1.0) : 1.0;
    const inf  = document.getElementById('tiInfCheck').checked;
    const Ti  = (hasPID && !inf) ? (parseFloat(document.getElementById('pTi').value)  || 10.0) : 1e9;
    const Tdc = hasPID ? (parseFloat(document.getElementById('pTdc').value) || 0.0) : 0.0;

    // Retardo realimentación
    const Th = (isCL && fbType === 'delay')
        ? Math.max(0, parseFloat(document.getElementById('pTh').value) || 0) : 0;

    // Buffers de retardo
    const Td_steps = Math.floor(Td / TIME_STEP);
    const Th_steps = Math.floor(Th / TIME_STEP);
    const outBuf = new Array(Td_steps + 1).fill(0.0);   // salida con retardo Td
    const fbBuf  = new Array(Th_steps + 1).fill(0.0);   // señal de realimentación con Th

    const inputData    = [];
    const responseData = [];

    // Variables de estado del integrador
    let x1 = 0.0;  // estado del 1er integrador (1er orden) o 1ª etapa (2º orden)
    let x2 = 0.0;  // estado de la 2ª etapa (solo 2º orden)

    // Variables del PID
    let integral_e = 0.0;
    let error_prev  = 0.0;

    for (let i = 0; i <= N_STEPS; i++) {
        const t = i * TIME_STEP;
        const R = R_t(t, inputType);
        inputData.push({ x: t, y: R });

        // Señal de realimentación (con doble retardo: Td + Th)
        const Y_td  = outBuf[Td_steps];    // salida del proceso retardada Td
        const Y_fb  = fbBuf[Th_steps];     // señal de realimentación retardada Th

        // Señal de error y controlador
        let Uc = R;
        if (isCL) {
            const err = R - Y_fb;
            integral_e += err * TIME_STEP;
            const deriv = (i > 0) ? (err - error_prev) / TIME_STEP : 0.0;

            if (hasPID) {
                Uc = Kc * (err + (inf ? 0 : integral_e / Ti) + Tdc * deriv);
            } else {
                Uc = err;  // lazo cerrado sin PID: error directo
            }
            error_prev = err;
        }

        // Integración del proceso
        if (hasProc) {
            if (ord === 'first') {
                // T1·ẋ1 + x1 = Kp·Uc  →  ẋ1 = (Kp·Uc − x1)/T1
                x1 += ((Kp * Uc - x1) / T1) * TIME_STEP;
            } else {
                // Cascada de 2 polos reales:
                // T1·ẋ1 + x1 = Kp·Uc  →  ẋ1 = (Kp·Uc − x1)/T1
                // T2·ẋ2 + x2 = x1     →  ẋ2 = (x1 − x2)/T2
                x1 += ((Kp * Uc - x1) / T1) * TIME_STEP;
                x2 += ((x1 - x2) / T2) * TIME_STEP;
            }
        } else {
            // Sin proceso: paso directo
            x1 = Uc;
            x2 = Uc;
        }

        const yPlant = (ord === 'second' && hasProc) ? x2 : x1;

        // Actualizar buffers de retardo
        outBuf.unshift(yPlant);
        outBuf.pop();
        fbBuf.unshift(Y_td);
        fbBuf.pop();

        // La salida observable es la salida retardada por Td
        responseData.push({ x: t, y: Y_td });
    }

    return { inputData, responseData };
}

// ============================================================================
// AÑADIR LÍNEA DE SIMULACIÓN
// ============================================================================

window.addSimulationLine = function() {
    const { inputData, responseData } = runSimulation();

    const COLORS = [
        'rgb(54, 162, 235)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)',
        'rgb(255, 159, 64)', 'rgb(201, 203, 207)', 'rgb(255, 205, 86)',
    ];
    const color = COLORS[allDatasets.length % COLORS.length];

    // Construir etiqueta descriptiva
    const loopAbbr = loopType === 'open' ? tr('label_open_abbr') : tr('label_closed_abbr');
    const ord  = document.getElementById('systemOrderSelect').value;
    const Kp   = document.getElementById('pKp').value;
    const T1   = document.getElementById('pT1').value;
    const T2   = document.getElementById('pT2').value;
    const Td   = document.getElementById('pTd').value;

    let lbl = `Y${allDatasets.length + 1} [${loopAbbr}`;
    if (isModuleOn('Process')) {
        lbl += ord === 'first'
            ? ` Kp=${Kp} T1=${T1}`
            : ` Kp=${Kp} T1=${T1} T2=${T2}`;
    }
    if (isModuleOn('Delay')) lbl += ` Td=${Td}`;
    if (loopType === 'closed' && isModuleOn('PID')) {
        lbl += ` Kc=${document.getElementById('pKc').value}`;
    }
    lbl += ']';

    allDatasets.push({
        label:           lbl,
        data:            responseData,
        borderColor:     color,
        backgroundColor: color,
        borderWidth:     2,
        fill:            false,
        pointRadius:     0,
    });

    // Guardar entrada actual
    const inputType = document.getElementById('inputTypeSelect').value;
    const abbrKey   = 'abbr_' + inputType;
    lastInputDataset = {
        label:           `${tr('input_label_r')} (${tr(abbrKey)})`,
        data:            inputData,
        borderColor:     'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.4)',
        borderWidth:     2,
        fill:            false,
        pointRadius:     0,
        borderDash:      [5, 3],
    };

    renderChart();
};

// ============================================================================
// BORRAR DATOS
// ============================================================================

window.clearResponses = function() {
    allDatasets = [];
    renderChart();
};

window.clearAllLines = function() {
    allDatasets      = [];
    lastInputDataset = null;
    renderChart();
};

// ============================================================================
// RENDERIZADO DE LA GRÁFICA
// ============================================================================

function renderChart() {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

    const ctx = document.getElementById('responseChart').getContext('2d');
    const datasets = [];
    if (lastInputDataset) datasets.push(lastInputDataset);
    datasets.push(...allDatasets);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive:          true,
            maintainAspectRatio: false,
            animation:           false,
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: allDatasets.length > 0
                        ? `${tr('chart_title_prefix')}${allDatasets.length}${tr('chart_title_suffix')}`
                        : tr('chart_empty_text'),
                },
                tooltip: {
                    callbacks: {
                        title: ctx  => `${tr('tooltip_time')}${ctx[0].parsed.x.toFixed(2)} s`,
                        label: ctx  => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)}`,
                    }
                },
            },
            scales: {
                x: {
                    type:  'linear',
                    min:   0,
                    max:   DURATION,
                    title: { display: true, text: tr('chart_x_axis') },
                    ticks: {
                        maxTicksLimit: 20,
                        callback: v => v + 's',
                    },
                },
                y: {
                    beginAtZero: false,
                    title:       { display: true, text: tr('chart_y_axis') },
                },
            },
        },
    });
}

// ============================================================================
// DESCARGA DE PNG Y CSV
// ============================================================================

window.downloadChartAsImage = function() {
    if (!chartInstance) return;
    const a = document.createElement('a');
    a.href     = chartInstance.toBase64Image('image/png');
    a.download = `control-sim_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

window.downloadChartDataAsCSV = function() {
    if (!chartInstance || !chartInstance.data.datasets.length) return;
    const ds    = chartInstance.data.datasets;
    const times = ds[0].data.map(p => p.x);

    let csv = 'Tiempo (s)';
    ds.forEach(d => { csv += ';' + d.label.replace(/;/g, ''); });
    csv += '\n';

    for (let i = 0; i < times.length; i++) {
        let row = times[i].toFixed(2).replace('.', ',');
        ds.forEach(d => {
            const val = d.data[i]?.y !== undefined
                ? d.data[i].y.toFixed(6).replace('.', ',') : '';
            row += ';' + val;
        });
        csv += row + '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `control-sim_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
    // Versión
    const verEl = document.getElementById('appVersionPlaceholder');
    if (verEl) verEl.textContent = APP_VERSION;

    // Estado inicial de módulos
    ['PID', 'Process', 'Delay'].forEach(name => {
        document.getElementById('card' + name).classList.remove('active');
    });
    document.getElementById('t2Row').style.display     = 'none';
    document.getElementById('cardFeedback').style.display = 'none';
    document.getElementById('thRow').style.display     = 'none';

    // Aplicar idioma guardado
    const lang = getLang();
    setLanguage(lang);   // dispara applyTranslations, rebuildInputParams, etc.

    // Gráfica vacía inicial
    renderChart();
});
