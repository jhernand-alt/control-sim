// ============================================================================
// CONTROL-SIM v2 — script.js
// ============================================================================
// Motor principal: i18n, temas, módulos, simulación de Euler, gráfica.
// Se ejecuta parcialmente antes del DOM (applyStoredTheme) para evitar flash.
// ============================================================================

// Aplica tema antes de que el DOM esté listo (evita parpadeo al cargar)
applyStoredTheme();

// ============================================================================
// CONSTANTES GLOBALES
// ============================================================================

const APP_VERSION = 'v2.0.0';

const DURATION  = 40;                           // duración de la simulación (s)
const TIME_STEP = 0.01;                         // paso de integración de Euler (s)
const N_STEPS   = Math.ceil(DURATION / TIME_STEP);

// ============================================================================
// ESTADO DE LA APLICACIÓN
// ============================================================================

let loopType         = 'open';  // tipo de lazo activo: 'open' | 'closed'
let allDatasets      = [];      // líneas de simulación acumuladas en la gráfica
let lastInputDataset = null;    // señal de entrada del último "Simular"
let chartInstance    = null;    // instancia de Chart.js activa

// ============================================================================
// INTERNACIONALIZACIÓN (i18n)
// ============================================================================

/** Devuelve el código de idioma guardado (por defecto 'es'). */
function getLang() {
    return localStorage.getItem('language') || 'es';
}

/** Traduce una clave al idioma activo. Si no existe, devuelve la propia clave. */
function tr(key) {
    const map  = { es: window.LANG_ES, eu: window.LANG_EU, en: window.LANG_EN };
    const dict = map[getLang()] || window.LANG_ES;
    return dict[key] || key;
}

// SVGs inline de las banderas (evita peticiones externas y funciona offline)
const FLAG_SVGS = {
    es: `<svg class="flag-svg" width="28" height="19" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#AA151B"/><rect y="10" width="60" height="20" fill="#F1BF00"/></svg>`,
    eu: `<svg class="flag-svg" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#D8202C"/><line x1="0" y1="0" x2="60" y2="40" stroke="#007A3D" stroke-width="10"/><line x1="60" y1="0" x2="0" y2="40" stroke="#007A3D" stroke-width="10"/><rect x="25" y="0" width="10" height="40" fill="white"/><rect x="0" y="15" width="60" height="10" fill="white"/></svg>`,
    en: `<svg class="flag-svg" width="28" height="19" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="40" fill="#012169"/><line x1="0" y1="0" x2="60" y2="40" stroke="white" stroke-width="8"/><line x1="60" y1="0" x2="0" y2="40" stroke="white" stroke-width="8"/><line x1="0" y1="0" x2="60" y2="40" stroke="#C8102E" stroke-width="4.5"/><line x1="60" y1="0" x2="0" y2="40" stroke="#C8102E" stroke-width="4.5"/><rect x="24" y="0" width="12" height="40" fill="white"/><rect x="0" y="14" width="60" height="12" fill="white"/><rect x="26" y="0" width="8" height="40" fill="#C8102E"/><rect x="0" y="16" width="60" height="8" fill="#C8102E"/></svg>`
};

/**
 * Cambia el idioma activo, persiste la elección y refresca toda la UI.
 * Expuesto en window para ser invocado desde los onclick del HTML.
 */
window.setLanguage = function(lang) {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    applyTranslations();
    updateLangButton(lang);
    // Marca la opción activa en el menú
    document.querySelectorAll('.lang-option').forEach(el =>
        el.classList.toggle('active', el.dataset.lang === lang)
    );
    // Refresca todo el contenido dinámico que depende del idioma
    rebuildInputParams();
    updateDerivedInfo();
    updateFTDisplay();
    updateDiagram();
    renderChart();
    if (typeof MathJax !== 'undefined') MathJax.typeset();
};

/** Aplica las traducciones a todos los elementos con data-lang-key / data-lang-key-aria. */
function applyTranslations() {
    document.title = tr('document_title');

    // Elementos con texto traducible (opciones de <select>, párrafos, botones…)
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const val = tr(el.getAttribute('data-lang-key'));
        // Las <option> no soportan innerHTML con LaTeX; los demás sí
        if (el.tagName === 'OPTION') el.textContent = val;
        else el.innerHTML = val;
    });

    // Atributos aria-label (accesibilidad)
    document.querySelectorAll('[data-lang-key-aria]').forEach(el =>
        el.setAttribute('aria-label', tr(el.dataset.langKeyAria))
    );

    // Versión de la app en el pie
    const verEl = document.getElementById('appVersionPlaceholder');
    if (verEl) verEl.textContent = APP_VERSION;
}

/** Actualiza el botón de idioma (bandera + código) con el idioma seleccionado. */
function updateLangButton(lang) {
    const btn = document.getElementById('langButtonContent');
    if (!btn) return;
    const codes = { es: 'ES', eu: 'EU', en: 'EN' };
    btn.innerHTML = `${FLAG_SVGS[lang] || ''}<span class="lang-code">${codes[lang] || lang.toUpperCase()}</span>`;
}

// ============================================================================
// SELECTOR DE IDIOMA — lógica del menú desplegable
// ============================================================================

/** Abre/cierra el menú de idiomas y gestiona el listener de cierre externo. */
window.toggleLangMenu = function() {
    const menu   = document.getElementById('langMenu');
    const button = document.getElementById('langButton');
    menu.classList.toggle('hidden');
    const isOpen = !menu.classList.contains('hidden');
    button.setAttribute('aria-expanded', isOpen);
    if (isOpen) setTimeout(() => document.addEventListener('click', closeLangOnOutside), 0);
};

/** Cierra el menú de idiomas al hacer clic fuera de él. */
function closeLangOnOutside(e) {
    const wrap = document.getElementById('languageSelectorWrapper');
    if (!wrap.contains(e.target)) {
        document.getElementById('langMenu').classList.add('hidden');
        document.getElementById('langButton').setAttribute('aria-expanded', 'false');
        document.removeEventListener('click', closeLangOnOutside);
    }
}

// ============================================================================
// SELECTOR DE TEMA — lógica del menú
// ============================================================================

/** Abre/cierra el menú de temas. */
window.toggleThemeMenu = function() {
    const menu = document.getElementById('themeMenu');
    menu.classList.toggle('hidden');
    if (!menu.classList.contains('hidden'))
        setTimeout(() => document.addEventListener('click', closeThemeOnOutside), 0);
};

/** Cierra el menú de temas al hacer clic fuera de él. */
function closeThemeOnOutside(e) {
    const menu = document.getElementById('themeMenu');
    const btn  = document.getElementById('themeButton');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add('hidden');
        document.removeEventListener('click', closeThemeOnOutside);
    }
}

/**
 * Cambia entre modo claro, oscuro o automático (usa preferencia del sistema).
 * Persiste la elección en localStorage.
 */
window.changeTheme = function(theme) {
    const resolvedTheme = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    localStorage.setItem('theme', theme);
    toggleThemeMenu();
    updateDiagram(); // el diagrama SVG usa variables CSS de color
};

/**
 * Cambia el esquema de color (azul, verde, morado, naranja, rojo).
 * Se aplica vía atributo data-color-scheme en <html>.
 */
window.changeColorScheme = function(scheme) {
    document.documentElement.setAttribute('data-color-scheme', scheme);
    localStorage.setItem('colorScheme', scheme);
    toggleThemeMenu();
    updateDiagram();
};

/**
 * Lee tema y esquema de localStorage y los aplica al <html> antes del paint.
 * Llamado al inicio del script (antes del DOMContentLoaded) para evitar flash.
 */
function applyStoredTheme() {
    const theme  = localStorage.getItem('theme')       || 'auto';
    const scheme = localStorage.getItem('colorScheme') || 'blue';
    const resolvedTheme = theme === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-color-scheme', scheme);
}

// ============================================================================
// CONTROL DE LAZO (abierto / cerrado)
// ============================================================================

/**
 * Cambia el tipo de lazo activo.
 * En lazo abierto: oculta realimentación y desactiva PID.
 * En lazo cerrado: muestra el módulo de realimentación.
 */
window.setLoop = function(type) {
    loopType = type;
    document.getElementById('btnOpenLoop').classList.toggle('selected',   type === 'open');
    document.getElementById('btnClosedLoop').classList.toggle('selected', type === 'closed');

    if (type === 'open') {
        // El PID solo tiene sentido en lazo cerrado; se fuerza a desactivado
        document.getElementById('togglePID').checked = false;
        document.getElementById('cardPID').classList.remove('active');
    }

    document.getElementById('cardFeedback').style.display = type === 'closed' ? '' : 'none';

    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// MÓDULOS — activación / desactivación por toggle
// ============================================================================

/**
 * Maneja el cambio de estado de los toggles de módulo (PID, Process, Delay).
 * Si se intenta activar PID en lazo abierto, se cancela la activación.
 */
window.onModuleToggle = function(name) {
    const checkbox = document.getElementById('toggle' + name);
    const card     = document.getElementById('card'   + name);
    card.classList.toggle('active', checkbox.checked);

    // Guardia: PID solo opera en lazo cerrado
    if (name === 'PID' && loopType === 'open') {
        checkbox.checked = false;
        card.classList.remove('active');
    }

    // Al activar/desactivar el proceso, puede que T2 deba mostrarse u ocultarse
    if (name === 'Process') onOrderChange();

    updateDerivedInfo();
    updateFTDisplay();
    updateDiagram();
};

/** Comprueba si un módulo está activo leyendo su checkbox. */
function isModuleOn(name) {
    const cb = document.getElementById('toggle' + name);
    return cb ? cb.checked : false;
}

// ============================================================================
// MÓDULO: GENERADOR DE SEÑAL — parámetros dinámicos según tipo de señal
// ============================================================================

/** Reacciona al cambio de tipo de señal (escalón / rampa / senoidal). */
window.onInputTypeChange = function() {
    rebuildInputParams();
    updateFTDisplay();
    updateDiagram();
};

/**
 * Reconstruye dinámicamente los campos de parámetros del generador
 * según el tipo de señal seleccionado.
 */
function rebuildInputParams() {
    const type      = document.getElementById('inputTypeSelect').value;
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
    } else { // senoidal
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

/** Muestra u oculta el campo T2 según el orden del proceso seleccionado. */
window.onOrderChange = function() {
    const is2nd = document.getElementById('systemOrderSelect').value === 'second';
    // T2 solo es relevante si el proceso está activo Y es de 2º orden
    document.getElementById('t2Row').style.display = (is2nd && isModuleOn('Process')) ? '' : 'none';
    updateDerivedInfo();
    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// MÓDULO: PROCESO — cálculo de parámetros derivados (ωn, ζ)
// ============================================================================

/**
 * Calcula y devuelve los parámetros internos del proceso.
 * Para 2º orden: G(s) = Kp / ((T1·s+1)(T2·s+1))
 *   → ωn = 1/√(T1·T2),  ζ = (T1+T2) / (2·√(T1·T2))
 */
function getDerivedProcessParams() {
    const T1  = parseFloat(document.getElementById('pT1').value) || 1.0;
    const T2  = parseFloat(document.getElementById('pT2').value) || 0.1;
    const ord = document.getElementById('systemOrderSelect').value;

    if (ord === 'first') {
        return { order: 'first', tau: T1 };
    }

    const wn   = 1.0 / Math.sqrt(T1 * T2);
    const zeta = (T1 + T2) / (2.0 * Math.sqrt(T1 * T2));
    return { order: 'second', wn, zeta, T1, T2 };
}

/** Actualiza el panel de parámetros derivados (τ o ωn/ζ) en la tarjeta de proceso. */
function updateDerivedInfo() {
    const div = document.getElementById('derivedInfoDiv');
    if (!div) return;

    if (!isModuleOn('Process')) {
        div.innerHTML = '';
        return;
    }

    const p = getDerivedProcessParams();
    if (p.order === 'first') {
        div.innerHTML = `\\(\\tau = ${p.tau.toFixed(3)}\\,\\text{s}\\)`;
    } else {
        div.innerHTML = `\\(\\omega_n = ${p.wn.toFixed(4)}\\,\\text{rad/s}, \\quad \\zeta = ${p.zeta.toFixed(4)}\\)`;
    }
    if (typeof MathJax !== 'undefined') MathJax.typeset([div]);
}

/** Reacciona a cualquier cambio de parámetro numérico en los inputs. */
window.onParamChange = function() {
    updateDerivedInfo();
    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// MÓDULO: CONTROLADOR — selección PID / On-Off
// ============================================================================

/** Muestra u oculta los parámetros PID según el tipo de controlador elegido. */
window.onControllerTypeChange = function() {
    const type = document.getElementById('controllerTypeSelect').value;
    // Los parámetros PID solo aplican cuando el tipo es 'pid'
    // (On/Off no tiene parámetros lineales, reservado para implementación futura)
    document.getElementById('pidParamsDiv').style.display = (type === 'pid') ? '' : 'none';
    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// PID — checkbox Ti = ∞ (deshabilita la acción integral)
// ============================================================================

/** Activa/desactiva el campo Ti según el checkbox de integral infinita. */
window.onTiInfChange = function() {
    const inf   = document.getElementById('tiInfCheck').checked;
    const input = document.getElementById('pTi');
    input.disabled = inf;
    if (inf) input.value = '';
    updateFTDisplay();
};

// ============================================================================
// REALIMENTACIÓN — tipo unitaria / con retardo
// ============================================================================

/** Muestra u oculta el campo Th según el tipo de realimentación elegido. */
window.onFeedbackTypeChange = function() {
    const isDelay = document.getElementById('feedbackTypeSelect').value === 'delay';
    document.getElementById('thRow').style.display = isDelay ? '' : 'none';
    updateFTDisplay();
    updateDiagram();
};

// ============================================================================
// ECUACIONES — FT combinada (simbólico = numérico) + y(t) analítica
// ============================================================================

/**
 * Formatea un número: elimina ceros innecesarios (máx. dec decimales).
 * Exportada como helper local, no global.
 */
function _fmt(n, dec = 4) {
    if (!isFinite(n)) return '∞';
    return parseFloat(n.toFixed(dec)).toString();
}

/**
 * Genera un bloque de ecuación.
 * - label:      etiqueta pequeña uppercase
 * - latexExpr:  expresión LaTeX (display math)
 * - note:       texto opcional debajo. Si noteAsParam=true usa estilo .eq-params
 *               (mismo formato que la línea de parámetros); si no, texto pequeño italic.
 */
function _eqBlock(label, latexExpr, note = '', noteAsParam = false) {
    const noteHtml = note
        ? noteAsParam
            ? `<div class="eq-params" style="margin-top:6px">\\(${note}\\)</div>`
            : `<div class="eq-note">${note}</div>`
        : '';
    return `<div class="eq-block">
        <div class="eq-label">${label}</div>
        <div class="eq-line">$$${latexExpr}$$</div>
        ${noteHtml}
    </div>`;
}

/** Construye y muestra el panel de ecuaciones completo (FT + y(t)). */
function updateFTDisplay() {
    const div     = document.getElementById('ftDisplay');
    const hasProc = isModuleOn('Process');
    const hasPID  = loopType === 'closed' && isModuleOn('PID');
    const hasDel  = isModuleOn('Delay');
    const isCL    = loopType === 'closed';
    const fbType  = document.getElementById('feedbackTypeSelect').value;
    const ord     = document.getElementById('systemOrderSelect').value;

    // ── Leer parámetros ────────────────────────────────────────────────────
    const Kp  = parseFloat(document.getElementById('pKp').value)  || 1;
    const T1  = parseFloat(document.getElementById('pT1').value)  || 1;
    const T2  = parseFloat(document.getElementById('pT2').value)  || 0.1;
    const Td  = parseFloat(document.getElementById('pTd').value)  || 0;
    const Kc  = parseFloat(document.getElementById('pKc').value)  || 1;
    const inf = document.getElementById('tiInfCheck').checked;
    const Ti  = inf ? null : (parseFloat(document.getElementById('pTi').value) || 10);
    const Tdc = parseFloat(document.getElementById('pTdc').value) || 0;
    const Th  = parseFloat(document.getElementById('pTh').value)  || 0.5;

    const inputType = document.getElementById('inputTypeSelect').value;
    const stepMin = parseFloat(document.getElementById('pStepMin')?.value ?? 0);
    const stepMax = parseFloat(document.getElementById('pStepMax')?.value ?? 1);
    const E  = stepMax - stepMin;
    const m  = parseFloat(document.getElementById('pRampSlope')?.value)  || 0.5;
    const A  = parseFloat(document.getElementById('pSinAmp')?.value)    || 1;
    const w  = parseFloat(document.getElementById('pSinFreq')?.value)   || 0.5;

    let html = '';

    // ══════════════════════════════════════════════════════════════════════
    // SECCIÓN 0: PARÁMETROS ACTIVOS (como ecuaciones LaTeX inline)
    // ══════════════════════════════════════════════════════════════════════
    const params = [];
    if (hasProc) {
        params.push(`K_p=${_fmt(Kp)}`);
        params.push(`T_1=${_fmt(T1)}\\,\\text{s}`);
        if (ord === 'second') params.push(`T_2=${_fmt(T2)}\\,\\text{s}`);
    }
    if (hasDel)  params.push(`T_d=${_fmt(Td)}\\,\\text{s}`);
    if (hasPID) {
        params.push(`K_c=${_fmt(Kc)}`);
        if (!inf) params.push(`T_i=${_fmt(Ti)}\\,\\text{s}`);
        if (Tdc > 0) params.push(`T_{d,c}=${_fmt(Tdc)}\\,\\text{s}`);
    }
    if (isCL && fbType === 'delay') params.push(`T_h=${_fmt(Th)}\\,\\text{s}`);
    // Señal de entrada
    if (inputType === 'step')  params.push(`E=${_fmt(E)}`);
    if (inputType === 'ramp')  params.push(`m=${_fmt(m)}`);
    if (inputType === 'sin')   { params.push(`A=${_fmt(A)}`); params.push(`\\omega=${_fmt(w)}\\,\\text{rad/s}`); }

    if (params.length) {
        html += `<div class="eq-params">\\(${params.join(',\\quad ')}\\)</div>`;
    }

    html += `<hr class="eq-section-sep" style="margin-top:8px">`;

    // ══════════════════════════════════════════════════════════════════════
    // SECCIÓN 1: FUNCIONES DE TRANSFERENCIA
    // ══════════════════════════════════════════════════════════════════════

    // ── Gp(s) ─────────────────────────────────────────────────────────────
    if (hasProc) {
        if (ord === 'first') {
            html += _eqBlock(
                tr('ft_proc_title'),
                `G_p(s) = \\frac{K_p}{T_1 s+1} = \\frac{${_fmt(Kp)}}{${_fmt(T1)}s+1}`
            );
        } else {
            html += _eqBlock(
                tr('ft_proc_title'),
                `G_p(s) = \\frac{K_p}{(T_1 s+1)(T_2 s+1)} = \\frac{${_fmt(Kp)}}{(${_fmt(T1)}s+1)(${_fmt(T2)}s+1)}`
            );
        }
    }

    // ── Gc(s) ─────────────────────────────────────────────────────────────
    if (hasPID) {
        const ctrlType = document.getElementById('controllerTypeSelect').value;
        if (ctrlType === 'pid') {
            let tSym = '1', tNum = '1';
            if (!inf) { tSym += `+\\frac{1}{T_i s}`; tNum += `+\\frac{1}{${_fmt(Ti)}s}`; }
            if (Tdc > 0) { tSym += `+T_{d,c}s`; tNum += `+${_fmt(Tdc)}s`; }
            html += _eqBlock(
                tr('ft_pid_title'),
                `G_c(s) = K_c\\!\\left(${tSym}\\right) = ${_fmt(Kc)}\\!\\left(${tNum}\\right)`
            );
        }
    }

    // ── Retardo ───────────────────────────────────────────────────────────
    if (hasDel) {
        html += _eqBlock(
            tr('mod_delay_title'),
            `e^{-T_d s} = e^{-${_fmt(Td)}s}`
        );
    }

    // ── G(s) / G_LC(s) — siempre simbólico = numérico ─────────────────────
    if (!isCL) {
        if (hasProc && !hasPID && !hasDel) {
            // Solo proceso: forma compacta
            if (ord === 'first') {
                html += _eqBlock(
                    tr('ft_open_loop_title'),
                    `G(s) = \\frac{K_p}{T_1 s+1} = \\frac{${_fmt(Kp)}}{${_fmt(T1)}s+1}`
                );
            } else {
                const a2 = T1 * T2, a1 = T1 + T2;
                html += _eqBlock(
                    tr('ft_open_loop_title'),
                    `G(s) = \\frac{K_p}{T_1 T_2 s^2+(T_1{+}T_2)s+1} = \\frac{${_fmt(Kp)}}{${_fmt(a2)}s^2+${_fmt(a1)}s+1}`
                );
            }
        } else if (hasProc && !hasPID && hasDel) {
            // Proceso + retardo: expandir numerador/denominador
            if (ord === 'first') {
                html += _eqBlock(
                    tr('ft_open_loop_title'),
                    `G(s) = \\frac{K_p}{T_1 s+1}\\,e^{-T_d s} = \\frac{${_fmt(Kp)}}{${_fmt(T1)}s+1}\\,e^{-${_fmt(Td)}s}`
                );
            } else {
                const a2 = T1 * T2, a1 = T1 + T2;
                html += _eqBlock(
                    tr('ft_open_loop_title'),
                    `G(s) = \\frac{K_p}{T_1 T_2 s^2+(T_1{+}T_2)s+1}\\,e^{-T_d s} = \\frac{${_fmt(Kp)}}{${_fmt(a2)}s^2+${_fmt(a1)}s+1}\\,e^{-${_fmt(Td)}s}`
                );
            }
        } else if (hasPID && hasProc && !hasDel) {
            // PID + proceso
            const fwParts = ['G_c(s)', 'G_p(s)'];
            html += _eqBlock(
                tr('ft_open_loop_title'),
                `G(s) = G_c(s)\\,G_p(s)`
            );
        } else {
            // Caso general: cadena simbólica
            const fwParts = [];
            if (hasPID)  fwParts.push('G_c(s)');
            if (hasProc) fwParts.push('G_p(s)');
            if (hasDel)  fwParts.push(`e^{-T_d s}`);
            const fw = fwParts.length ? fwParts.join('\\,') : '1';
            html += _eqBlock(tr('ft_open_loop_title'), `G(s) = ${fw}`);
        }
    } else {
        // Lazo cerrado
        const H    = (fbType === 'delay') ? `e^{-T_h s}` : '1';
        const Hnum = (fbType === 'delay') ? `e^{-${_fmt(Th)}s}` : '1';

        if (hasProc && !hasPID && !hasDel && fbType === 'unity') {
            if (ord === 'first') {
                const Kcl = Kp / (1 + Kp);
                const Tcl = T1 / (1 + Kp);
                html += _eqBlock(
                    tr('ft_closed_loop_title'),
                    `G_{LC}(s) = \\frac{K_p/(1+K_p)}{\\frac{T_1}{1+K_p}s+1} = \\frac{${_fmt(Kcl)}}{${_fmt(Tcl)}s+1}`
                );
            } else {
                const a2 = T1 * T2, a1 = T1 + T2, a0 = 1 + Kp;
                const wncl   = Math.sqrt(a0 / a2);
                const zetacl = a1 / (2 * Math.sqrt(a2 * a0));
                html += _eqBlock(
                    tr('ft_closed_loop_title'),
                    `G_{LC}(s) = \\frac{K_p}{T_1 T_2 s^2+(T_1{+}T_2)s+(1{+}K_p)} = \\frac{${_fmt(Kp)}}{${_fmt(a2)}s^2+${_fmt(a1)}s+${_fmt(a0)}}`,
                    `\\omega_n=${_fmt(wncl,4)}\\,\\text{rad/s},\\;\\zeta=${_fmt(zetacl,4)}`, true
                );
            }
        } else if (hasProc && !hasPID && hasDel && fbType === 'unity') {
            // LC con retardo: forma simbólica + numérica
            if (ord === 'first') {
                html += _eqBlock(
                    tr('ft_closed_loop_title'),
                    `G_{LC}(s) = \\frac{\\frac{K_p}{T_1 s+1}e^{-T_d s}}{1+\\frac{K_p}{T_1 s+1}e^{-T_d s}} = \\frac{\\frac{${_fmt(Kp)}}{${_fmt(T1)}s+1}e^{-${_fmt(Td)}s}}{1+\\frac{${_fmt(Kp)}}{${_fmt(T1)}s+1}e^{-${_fmt(Td)}s}}`
                );
            } else {
                const fwSym = `\\frac{K_p}{(T_1 s+1)(T_2 s+1)}e^{-T_d s}`;
                const a2 = T1 * T2, a1 = T1 + T2;
                const fwNum = `\\frac{${_fmt(Kp)}}{(${_fmt(T1)}s+1)(${_fmt(T2)}s+1)}e^{-${_fmt(Td)}s}`;
                html += _eqBlock(
                    tr('ft_closed_loop_title'),
                    `G_{LC}(s) = \\frac{${fwSym}}{1+${fwSym}} = \\frac{${fwNum}}{1+${fwNum}}`
                );
            }
        } else {
            // Caso general LC
            const fwParts = [];
            if (hasPID)  fwParts.push('G_c(s)');
            if (hasProc) fwParts.push('G_p(s)');
            if (hasDel)  fwParts.push(`e^{-T_d s}`);
            const fw = fwParts.length ? fwParts.join('\\,') : '1';
            html += _eqBlock(
                tr('ft_closed_loop_title'),
                `G_{LC}(s) = \\frac{${fw}}{1+${fw}\\cdot ${H}}`
            );
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // SECCIÓN 2: RESPUESTA TEMPORAL y(t)
    // ══════════════════════════════════════════════════════════════════════

    html += `<hr class="eq-section-sep">`;

    // Sufijos de retardo (t → t−Td)
    const tdS = (hasDel && Td > 0) ? `-T_d` : '';
    const tdN = (hasDel && Td > 0) ? `-${_fmt(Td)}` : '';
    const cond  = (hasDel && Td > 0) ? `,\\;t>T_d` : '';
    const condN = (hasDel && Td > 0) ? `,\\;t>${_fmt(Td)}` : '';

    const ytLabel = tr('ft_yt_label');  // "Respuesta y(t)"

    // Sin proceso: paso directo
    if (!hasProc) {
        if (inputType === 'step') {
            html += _eqBlock(ytLabel, `y(t) = E = ${_fmt(E)}`);
        } else if (inputType === 'ramp') {
            html += _eqBlock(ytLabel, `y(t) = m\\,t = ${_fmt(m)}\\,t`);
        } else {
            html += _eqBlock(ytLabel, `y(t) = A\\sin(\\omega t) = ${_fmt(A)}\\sin(${_fmt(w)}t)`);
        }
    }

    // ── LAZO ABIERTO — 1er orden ──────────────────────────────────────────
    else if (!isCL && ord === 'first') {
        if (inputType === 'step') {
            html += _eqBlock(ytLabel,
                `y(t)=K_p E\\!\\left(1-e^{-(t${tdS})/T_1}\\right)=${_fmt(Kp*E)}\\!\\left(1-e^{-(t${tdN})/${_fmt(T1)}}\\right)${condN}`
            );
        } else if (inputType === 'ramp') {
            html += _eqBlock(ytLabel,
                `y(t)=K_p m\\!\\left[(t${tdS})-T_1\\!\\left(1-e^{-(t${tdS})/T_1}\\right)\\right]=${_fmt(Kp*m)}\\!\\left[(t${tdN})-${_fmt(T1)}\\!\\left(1-e^{-(t${tdN})/${_fmt(T1)}}\\right)\\right]${condN}`
            );
        } else {
            const wT1 = w * T1;
            const denom = 1 + wT1 * wT1;
            const M   = Kp * A / Math.sqrt(denom);
            const phi = -Math.atan(wT1);
            const Ctr = Kp * A * wT1 / denom;
            const phiDeg = (phi * 180 / Math.PI).toFixed(2);
            const phiStr = phi >= 0 ? `+${_fmt(phi,4)}` : `${_fmt(phi,4)}`;
            html += _eqBlock(ytLabel,
                `y(t)=\\frac{K_p A}{\\sqrt{1+(\\omega T_1)^2}}\\sin(\\omega t+\\varphi)-\\frac{K_p A\\,\\omega T_1}{1+(\\omega T_1)^2}e^{-t/T_1}=${_fmt(M,4)}\\sin(${_fmt(w)}t${phiStr})-${_fmt(Ctr,4)}e^{-t/${_fmt(T1)}}`,
                `\\varphi=${phiDeg}°`, true
            );
        }
    }

    // ── LAZO ABIERTO — 2º orden ───────────────────────────────────────────
    else if (!isCL && ord === 'second') {
        const d = getDerivedProcessParams();
        const { wn, zeta } = d;

        if (inputType === 'step') {
            if (zeta > 1 + 1e-4) {
                const c1 = T2 / (T1 - T2), c2 = T1 / (T1 - T2);
                html += _eqBlock(ytLabel,
                    `y(t)=K_p E\\!\\left[1+\\frac{T_2}{T_1{-}T_2}e^{-t/T_1}-\\frac{T_1}{T_1{-}T_2}e^{-t/T_2}\\right]=${_fmt(Kp*E)}\\!\\left[1+${_fmt(c1)}e^{-t/${_fmt(T1)}}-${_fmt(c2)}e^{-t/${_fmt(T2)}}\\right]${condN}`,
                    `\\zeta=${_fmt(zeta,4)}\\text{ (${tr('math_yt_overdamped')})}`, true
                );
            } else if (Math.abs(zeta - 1) <= 1e-4) {
                html += _eqBlock(ytLabel,
                    `y(t)=K_p E\\!\\left[1-\\left(1+\\frac{t${tdS}}{T_1}\\right)e^{-(t${tdS})/T_1}\\right]=${_fmt(Kp*E)}\\!\\left[1-\\left(1+\\frac{t${tdN}}{${_fmt(T1)}}\\right)e^{-(t${tdN})/${_fmt(T1)}}\\right]${condN}`,
                    `\\zeta=1\\text{ (${tr('math_yt_critical')})}`, true
                );
            } else {
                const wd  = wn * Math.sqrt(1 - zeta * zeta);
                const phi = Math.acos(zeta);
                const M   = 1 / Math.sqrt(1 - zeta * zeta);
                html += _eqBlock(ytLabel,
                    `y(t)=K_p E\\!\\left[1-\\frac{e^{-\\zeta\\omega_n(t${tdS})}}{\\sqrt{1-\\zeta^2}}\\sin(\\omega_d(t${tdS})+\\varphi)\\right]=${_fmt(Kp*E)}\\!\\left[1-${_fmt(M,4)}e^{-${_fmt(zeta*wn,4)}(t${tdN})}\\sin(${_fmt(wd,4)}(t${tdN})+${_fmt(phi,4)})\\right]${condN}`,
                    `\\zeta=${_fmt(zeta,4)},\\;\\omega_d=${_fmt(wd,4)}\\,\\text{rad/s},\\;\\varphi=${(phi*180/Math.PI).toFixed(2)}°\\text{ (${tr('math_yt_underdamped')})}`, true
                );
            }
        } else if (inputType === 'ramp' && zeta > 1 + 1e-4) {
            const c1 = T1 * T1 / (T1 - T2), c2 = T2 * T2 / (T1 - T2);
            html += _eqBlock(ytLabel,
                `y(t)=K_p m\\!\\left[(t${tdS})-(T_1+T_2)+\\frac{T_1^2}{T_1{-}T_2}e^{-t/T_1}-\\frac{T_2^2}{T_1{-}T_2}e^{-t/T_2}\\right]=${_fmt(Kp*m)}\\!\\left[(t${tdN})-${_fmt(T1+T2)}+${_fmt(c1)}e^{-t/${_fmt(T1)}}-${_fmt(c2)}e^{-t/${_fmt(T2)}}\\right]${condN}`
            );
        } else if (inputType === 'sin') {
            const r   = w / wn;
            const re  = 1 - r * r, im = 2 * zeta * r;
            const magG = Kp / Math.sqrt(re * re + im * im);
            const phi  = -Math.atan2(im, re);
            const phiDeg = (phi * 180 / Math.PI).toFixed(2);
            const phiStr = phi >= 0 ? `+${_fmt(phi,4)}` : `${_fmt(phi,4)}`;
            html += _eqBlock(ytLabel,
                `y_{ss}(t)=|G(j\\omega)|A\\sin(\\omega t+\\varphi)=${_fmt(magG*A,4)}\\sin(${_fmt(w)}t${phiStr})`,
                `|G(j\\omega)|=${_fmt(magG,4)},\\;\\varphi=${phiDeg}°`, true
            );
        } else {
            html += `<div class="eq-block"><div class="eq-unavailable">${tr('math_yt_2nd_complex_ramp')}</div></div>`;
        }
    }

    // ── LAZO CERRADO — 1er orden, H=1, sin PID ni retardo ─────────────────
    else if (isCL && ord === 'first' && !hasPID && !hasDel && fbType === 'unity') {
        const Kcl = Kp / (1 + Kp);
        const Tcl = T1 / (1 + Kp);
        const Kv  = Kp / T1;

        if (inputType === 'step') {
            html += _eqBlock(ytLabel,
                `y(t)=\\frac{K_p}{1+K_p}E\\!\\left(1-e^{-t/\\tau_{cl}}\\right)=${_fmt(Kcl*E,4)}\\!\\left(1-e^{-t/${_fmt(Tcl,4)}}\\right)`,
                `\\tau_{cl}=${_fmt(Tcl,4)}\\,\\text{s},\\;e_{ss}=${_fmt(E/(1+Kp),4)}`, true
            );
        } else if (inputType === 'ramp') {
            html += _eqBlock(ytLabel,
                `y(t)=m\\!\\left[t-\\tau_{cl}\\!\\left(1-e^{-t/\\tau_{cl}}\\right)\\right]-\\frac{m}{K_v}=${_fmt(m)}\\!\\left[t-${_fmt(Tcl,4)}\\!\\left(1-e^{-t/${_fmt(Tcl,4)}}\\right)\\right]-${_fmt(m/Kv,4)}`,
                `\\tau_{cl}=${_fmt(Tcl,4)}\\,\\text{s},\\;e_{v,ss}=${_fmt(m/Kv,4)}`, true
            );
        } else {
            const wTcl = w * Tcl;
            const Mcl  = Kcl / Math.sqrt(1 + wTcl * wTcl);
            const phi  = -Math.atan(wTcl);
            const phiDeg = (phi * 180 / Math.PI).toFixed(2);
            const phiStr = phi >= 0 ? `+${_fmt(phi,4)}` : `${_fmt(phi,4)}`;
            html += _eqBlock(ytLabel,
                `y_{ss}(t)=\\frac{K_p/(1+K_p)}{\\sqrt{1+(\\omega\\tau_{cl})^2}}A\\sin(\\omega t+\\varphi)=${_fmt(Mcl*A,4)}\\sin(${_fmt(w)}t${phiStr})`,
                `\\varphi=${phiDeg}°`, true
            );
        }
    }

    // ── LAZO CERRADO — 2º orden, H=1, sin PID ni retardo — escalón ────────
    else if (isCL && ord === 'second' && !hasPID && !hasDel && fbType === 'unity' && inputType === 'step') {
        const a2 = T1 * T2, a1 = T1 + T2, a0 = 1 + Kp;
        const wncl   = Math.sqrt(a0 / a2);
        const zetacl = a1 / (2 * Math.sqrt(a2 * a0));
        const Kcl    = Kp / a0;

        if (zetacl > 1 + 1e-4) {
            const sq  = Math.sqrt(zetacl * zetacl - 1);
            const p1  = -zetacl * wncl + wncl * sq;
            const p2  = -zetacl * wncl - wncl * sq;
            const A1  = Kcl * p2 / (p2 - p1);
            const A2  = -Kcl * p1 / (p2 - p1);
            html += _eqBlock(ytLabel,
                `y(t)=${_fmt(Kcl*E,4)}+${_fmt(A1*E,4)}e^{${_fmt(p1,4)}t}+${_fmt(A2*E,4)}e^{${_fmt(p2,4)}t}`,
                `\\zeta=${_fmt(zetacl,4)},\\;\\omega_n=${_fmt(wncl,4)}\\,\\text{rad/s}\\text{ (${tr('math_yt_overdamped')})}`, true
            );
        } else if (Math.abs(zetacl - 1) <= 1e-4) {
            html += _eqBlock(ytLabel,
                `y(t)=${_fmt(Kcl*E,4)}\\!\\left[1-e^{-${_fmt(wncl,4)}t}(1+${_fmt(wncl,4)}t)\\right]`,
                `\\omega_n=${_fmt(wncl,4)}\\,\\text{rad/s}\\text{ (${tr('math_yt_critical')})}`, true
            );
        } else {
            const wdcl = wncl * Math.sqrt(1 - zetacl * zetacl);
            const phi  = Math.acos(zetacl);
            const Mnorm = 1 / Math.sqrt(1 - zetacl * zetacl);
            html += _eqBlock(ytLabel,
                `y(t)=${_fmt(Kcl*E,4)}\\!\\left[1-${_fmt(Mnorm,4)}e^{-${_fmt(zetacl*wncl,4)}t}\\sin(${_fmt(wdcl,4)}t+${_fmt(phi,4)})\\right]`,
                `\\zeta=${_fmt(zetacl,4)},\\;\\omega_d=${_fmt(wdcl,4)}\\,\\text{rad/s},\\;\\varphi=${(phi*180/Math.PI).toFixed(2)}°\\text{ (${tr('math_yt_underdamped')})}`, true
            );
        }
    }

    // ── Caso no disponible analíticamente ─────────────────────────────────
    else if (hasProc) {
        html += `<div class="eq-block"><div class="eq-unavailable">${tr('math_yt_cl_complex')}</div></div>`;
    }

    div.innerHTML = html;
    if (typeof MathJax !== 'undefined') MathJax.typeset([div]);
}

// ============================================================================
// DIAGRAMA SVG DE BLOQUES
// ============================================================================

/**
 * Regenera el diagrama de bloques SVG según el estado actual de los módulos.
 * Usa variables CSS para respetar el tema (claro/oscuro) y el esquema de color.
 */
function updateDiagram() {
    const svg     = document.getElementById('diagramSvg');
    const hasPID  = loopType === 'closed' && isModuleOn('PID');
    const hasProc = isModuleOn('Process');
    const hasDel  = isModuleOn('Delay');
    const isCL    = loopType === 'closed';
    const fbType  = document.getElementById('feedbackTypeSelect').value;

    // Colores según tema activo
    const isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgCol   = isDark ? '#1e293b' : '#ffffff';
    const txCol   = isDark ? '#e2e8f0' : '#2d3748';
    const lineCol = isDark ? '#94a3b8' : '#64748b';

    // Color primario actual (varía con el esquema de color)
    const acCol  = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#1e40af';
    const pidCol = '#9333ea';
    const delCol = '#ea580c';
    const fbCol  = '#16a34a';

    // Dimensiones del canvas SVG — más alto para aprovechar el panel
    const W  = 800;
    const H  = isCL ? 260 : 160;   // más alto en LC (necesita rama de realimentación)
    const CY = isCL ? 72 : 80;     // centro vertical de la cadena directa
    const BH  = 44;    // alto de cada caja de bloque
    const BFS = 12;    // tamaño de fuente dentro de las cajas
    const SR  = 18;    // radio del círculo sumador
    const GAP = 16;    // espacio entre bloques

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // ── Helpers de dibujo SVG ──────────────────────────────────────────────

    /** Crea la definición de un marcador de punta de flecha para el color dado. */
    function mkArrow(id, color) {
        return `<marker id="${id}" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                    <path d="M0,0 L0,7 L9,3.5 z" fill="${color}"/>
                </marker>`;
    }

    /** Genera un id de marcador estable a partir del color hex. */
    function arrId(col) { return 'arr_' + col.replace('#', '').substring(0, 6); }

    /** Dibuja una línea, opcionalmente con punta de flecha y/o trazo discontinuo. */
    function line(x1, y1, x2, y2, col, arrow = true, dash = false) {
        const mEnd = arrow ? `marker-end="url(#${arrId(col)})"` : '';
        const dArr = dash  ? 'stroke-dasharray="5,3"' : '';
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
                    stroke="${col}" stroke-width="2" ${mEnd} ${dArr}/>`;
    }

    /** Dibuja un bloque rectangular con etiqueta de texto multilinea. */
    function box(x, y, w, h, fill, stroke, label) {
        const lines  = label.split('\n');
        const lineH  = BFS * 1.3;
        const yStart = y + h / 2 - (lines.length * lineH) / 2 + lineH * 0.7;
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

    /** Dibuja una etiqueta de texto (p.ej. R(s), Y(s)). */
    function nodeLabel(x, y, txt, col = txCol, size = 13, anchor = 'middle') {
        return `<text x="${x}" y="${y}" font-size="${size}"
                    font-family="Segoe UI,sans-serif" font-weight="700"
                    fill="${col}" text-anchor="${anchor}"
                    dominant-baseline="middle">${txt}</text>`;
    }

    // ── Cálculo de posiciones horizontales de cada bloque ─────────────────
    let cx = 12;

    const rLabelX   = cx + 18; cx += 42;
    const wireStartX = cx;

    // Sumador (solo en lazo cerrado)
    let sumCX = null;
    if (isCL) { sumCX = cx + SR; cx += SR * 2 + GAP; }

    // Bloque PID
    let pidX = null;
    const pidW = 74;
    if (hasPID) { pidX = cx; cx += pidW + GAP; }

    // Bloque Proceso
    let procX = null;
    const procW = 84;
    if (hasProc) { procX = cx; cx += procW + GAP; }

    // Bloque Retardo
    let delX = null;
    const delW = 80;
    if (hasDel) { delX = cx; cx += delW + GAP; }

    const yLabelX  = cx + 18;
    const wireEndX = yLabelX - 6;
    const outputX  = yLabelX + 18;

    // ── Construcción del SVG ───────────────────────────────────────────────

    // Definiciones de marcadores de flechas (uno por color usado)
    let s = '<defs>';
    [lineCol, acCol, pidCol, delCol, fbCol].forEach(c => { s += mkArrow(arrId(c), c); });
    s += '</defs>';

    // Etiquetas R(s) e Y(s) encima del hilo
    s += nodeLabel(rLabelX, CY - 18, 'R(s)');
    s += nodeLabel(yLabelX, CY - 18, 'Y(s)');

    // Hilo de señal principal
    s += line(wireStartX, CY, wireEndX, CY, lineCol, false);

    // Sumador (lazo cerrado)
    if (isCL && sumCX) {
        s += line(wireStartX, CY, sumCX - SR - 2, CY, lineCol, true);
        s += `<circle cx="${sumCX}" cy="${CY}" r="${SR}"
                fill="${bgCol}" stroke="${acCol}" stroke-width="2"/>`;
        // Símbolo + en el centro
        s += `<text x="${sumCX}" y="${CY + 2}" text-anchor="middle"
                dominant-baseline="middle" font-size="18" font-weight="bold"
                fill="${acCol}">+</text>`;
        // Símbolo − en la entrada de realimentación (parte inferior)
        s += `<text x="${sumCX}" y="${CY + SR + 10}" text-anchor="middle"
                font-size="11" fill="${acCol}">−</text>`;
        const nextX = pidX ?? procX ?? delX ?? yLabelX;
        s += line(sumCX + SR, CY, nextX, CY, lineCol, true);
    } else {
        // Lazo abierto: hilo directo hasta el primer bloque
        const firstX = pidX ?? procX ?? delX ?? yLabelX;
        s += line(wireStartX, CY, firstX, CY, lineCol, true);
    }

    // Bloque Controlador
    if (hasPID) {
        const ctrlType = document.getElementById('controllerTypeSelect').value;
        const ctrlLbl  = ctrlType === 'pid' ? 'PID\nGc(s)' : 'On/Off\nGc(s)';
        s += box(pidX, CY - BH / 2, pidW, BH, bgCol, pidCol, ctrlLbl);
        const nextX = procX ?? delX ?? yLabelX;
        s += line(pidX + pidW, CY, nextX, CY, lineCol, true);
    }

    // Bloque Proceso
    if (hasProc) {
        const ord  = document.getElementById('systemOrderSelect').value;
        const plbl = ord === 'first' ? '1er Orden\nGp(s)' : '2º Orden\nGp(s)';
        s += box(procX, CY - BH / 2, procW, BH, bgCol, acCol, plbl);
        const nextX = delX ?? yLabelX;
        s += line(procX + procW, CY, nextX, CY, lineCol, true);
    }

    // Bloque Retardo
    if (hasDel) {
        const Td = parseFloat(document.getElementById('pTd').value) || 0;
        s += box(delX, CY - BH / 2, delW, BH, bgCol, delCol, `Retardo\nTd = ${Td} s`);
        s += line(delX + delW, CY, yLabelX - 6, CY, lineCol, true);
    }

    // Ruta de realimentación (solo lazo cerrado)
    if (isCL && sumCX) {
        const fbY   = CY + 110;    // más espacio para la rama de realimentación
        const fromX = outputX - 10;
        const Th    = parseFloat(document.getElementById('pTh').value) || 0.5;

        // Trayecto: salida → abajo → izquierda → arriba al sumador
        s += line(fromX, CY,   fromX, fbY,        fbCol, false);
        s += line(fromX, fbY,  sumCX, fbY,         fbCol, false);
        s += line(sumCX, fbY,  sumCX, CY + SR + 2, fbCol, true);

        // Bloque H(s) en la rama de realimentación
        if (fbType === 'delay') {
            const fbBW = 90, fbBH = 36;
            const fbBx = (fromX + sumCX) / 2 - fbBW / 2;
            s += box(fbBx, fbY - fbBH / 2, fbBW, fbBH, bgCol, fbCol, `H(s)\nTh = ${Th} s`);
        } else {
            // Realimentación unitaria: solo etiqueta H(s)=1
            s += `<text x="${(fromX + sumCX) / 2}" y="${fbY - 8}"
                    text-anchor="middle" font-size="12"
                    font-family="Segoe UI,sans-serif" font-weight="600"
                    fill="${fbCol}">H(s) = 1</text>`;
        }
    }

    svg.innerHTML = s;
}

// ============================================================================
// MOTOR DE SIMULACIÓN — integración de Euler paso a paso
// ============================================================================

/**
 * Calcula el valor de la señal de referencia R(t) en el instante t.
 * Soporta: escalón, rampa y senoidal.
 */
function R_t(t, inputType) {
    if (inputType === 'step') {
        const min = parseFloat(document.getElementById('pStepMin')?.value) ?? 0;
        const max = parseFloat(document.getElementById('pStepMax')?.value) ?? 1;
        return t >= 0 ? max : min;
    } else if (inputType === 'ramp') {
        const slope = parseFloat(document.getElementById('pRampSlope')?.value) || 0.5;
        return t >= 0 ? slope * t : 0;
    } else { // senoidal
        const A = parseFloat(document.getElementById('pSinAmp')?.value)  || 1.0;
        const w = parseFloat(document.getElementById('pSinFreq')?.value) || 0.5;
        return A * Math.sin(w * t);
    }
}

/**
 * Ejecuta la simulación temporal (integración de Euler) con la configuración actual.
 * Devuelve los datos de la señal de entrada y de la respuesta del sistema.
 *
 * Modelo del proceso:
 *   1er orden: T1·ẋ1 + x1 = Kp·u  →  ẋ1 = (Kp·u − x1) / T1
 *   2º orden:  cascada de dos polos reales en T1 y T2
 *
 * Los retardos se implementan con buffers circulares (outBuf, fbBuf).
 */
function runSimulation() {
    const inputType = document.getElementById('inputTypeSelect').value;
    const hasProc   = isModuleOn('Process');
    const hasPID    = loopType === 'closed' && isModuleOn('PID');
    const hasDelay  = isModuleOn('Delay');
    const isCL      = loopType === 'closed';
    const fbType    = document.getElementById('feedbackTypeSelect').value;

    // Parámetros del proceso
    const Kp  = parseFloat(document.getElementById('pKp').value) || 1.0;
    const T1  = parseFloat(document.getElementById('pT1').value) || 1.0;
    const T2  = parseFloat(document.getElementById('pT2').value) || 0.1;
    const ord = document.getElementById('systemOrderSelect').value;

    // Retardos
    const Td = hasDelay ? Math.max(0, parseFloat(document.getElementById('pTd').value) || 0) : 0;
    const Th = (isCL && fbType === 'delay')
        ? Math.max(0, parseFloat(document.getElementById('pTh').value) || 0) : 0;

    // Parámetros PID
    const Kc  = hasPID ? (parseFloat(document.getElementById('pKc').value)  || 1.0) : 1.0;
    const inf  = document.getElementById('tiInfCheck').checked;
    const Ti  = (hasPID && !inf) ? (parseFloat(document.getElementById('pTi').value) || 10.0) : 1e9;
    const Tdc = hasPID ? (parseFloat(document.getElementById('pTdc').value) || 0.0) : 0.0;

    // Buffers de retardo (implementan líneas de retardo puras)
    const Td_steps = Math.floor(Td / TIME_STEP);
    const Th_steps = Math.floor(Th / TIME_STEP);
    const outBuf = new Array(Td_steps + 1).fill(0.0);  // retardo de proceso (Td)
    const fbBuf  = new Array(Th_steps + 1).fill(0.0);  // retardo de realimentación (Th)

    const inputData    = [];
    const responseData = [];

    // Variables de estado del proceso
    let x1 = 0.0;  // estado del 1er integrador (1er orden) o 1ª etapa (2º orden)
    let x2 = 0.0;  // estado de la 2ª etapa (solo 2º orden)

    // Variables del PID
    let integral_e = 0.0;
    let error_prev = 0.0;

    for (let i = 0; i <= N_STEPS; i++) {
        const t = i * TIME_STEP;
        const R = R_t(t, inputType);
        inputData.push({ x: t, y: R });

        // Señal de salida retardada Td (lo que "ve" la realimentación desde el proceso)
        const Y_td = outBuf[Td_steps];
        // Señal de realimentación retardada Th (lo que llega al sumador)
        const Y_fb = fbBuf[Th_steps];

        // ── Cálculo de la señal de control ──
        let Uc = R;
        if (isCL) {
            const err = R - Y_fb;
            integral_e += err * TIME_STEP;
            const deriv = (i > 0) ? (err - error_prev) / TIME_STEP : 0.0;

            Uc = hasPID
                ? Kc * (err + (inf ? 0 : integral_e / Ti) + Tdc * deriv)
                : err; // lazo cerrado sin PID: señal de error directa

            error_prev = err;
        }

        // ── Integración del proceso (Euler explícito) ──
        if (hasProc) {
            if (ord === 'first') {
                x1 += ((Kp * Uc - x1) / T1) * TIME_STEP;
            } else {
                // Cascada: etapa 1 (T1) alimenta a etapa 2 (T2)
                x1 += ((Kp * Uc - x1) / T1) * TIME_STEP;
                x2 += ((x1 - x2) / T2) * TIME_STEP;
            }
        } else {
            // Sin proceso: paso directo de la señal de control
            x1 = Uc;
            x2 = Uc;
        }

        const yPlant = (ord === 'second' && hasProc) ? x2 : x1;

        // Actualizar buffers (insertar al frente, descartar el último)
        outBuf.unshift(yPlant);  outBuf.pop();
        fbBuf.unshift(Y_td);     fbBuf.pop();

        // La salida observable incluye el retardo de proceso
        responseData.push({ x: t, y: Y_td });
    }

    return { inputData, responseData };
}

// ============================================================================
// AÑADIR LÍNEA DE SIMULACIÓN A LA GRÁFICA
// ============================================================================

/** Simula con la configuración actual y añade el resultado como nueva línea. */
window.addSimulationLine = function() {
    const { inputData, responseData } = runSimulation();

    // Paleta de colores para las líneas de respuesta
    const COLORS = [
        'rgb(54, 162, 235)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)',
        'rgb(255, 159, 64)', 'rgb(201, 203, 207)', 'rgb(255, 205, 86)',
    ];
    const color = COLORS[allDatasets.length % COLORS.length];

    // Etiqueta descriptiva con los parámetros clave del ensayo
    const loopAbbr = loopType === 'open' ? tr('label_open_abbr') : tr('label_closed_abbr');
    const ord = document.getElementById('systemOrderSelect').value;

    let lbl = `Y${allDatasets.length + 1} [${loopAbbr}`;
    if (isModuleOn('Process')) {
        lbl += ord === 'first'
            ? ` Kp=${document.getElementById('pKp').value} T1=${document.getElementById('pT1').value}`
            : ` Kp=${document.getElementById('pKp').value} T1=${document.getElementById('pT1').value} T2=${document.getElementById('pT2').value}`;
    }
    if (isModuleOn('Delay'))                          lbl += ` Td=${document.getElementById('pTd').value}`;
    if (loopType === 'closed' && isModuleOn('PID'))   lbl += ` Kc=${document.getElementById('pKc').value}`;
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

    // Actualizar la señal de referencia mostrada
    const inputType = document.getElementById('inputTypeSelect').value;
    lastInputDataset = {
        label:           `${tr('input_label_r')} (${tr('abbr_' + inputType)})`,
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
// BORRAR DATOS DE LA GRÁFICA
// ============================================================================

/** Elimina solo las líneas de respuesta (mantiene la señal de entrada). */
window.clearResponses = function() {
    allDatasets = [];
    renderChart();
};

/** Elimina todas las líneas, incluida la señal de entrada. */
window.clearAllLines = function() {
    allDatasets      = [];
    lastInputDataset = null;
    renderChart();
};

// ============================================================================
// RENDERIZADO DE LA GRÁFICA (Chart.js)
// ============================================================================

/** Destruye la gráfica anterior y la recrea con los datasets actuales. */
function renderChart() {
    if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

    const ctx      = document.getElementById('responseChart').getContext('2d');
    const datasets = [];
    if (lastInputDataset) datasets.push(lastInputDataset);
    datasets.push(...allDatasets);

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive:          true,
            maintainAspectRatio: false,
            animation:           false,   // desactivado para respuesta inmediata al simular
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
                        title: ctx => `${tr('tooltip_time')}${ctx[0].parsed.x.toFixed(2)} s`,
                        label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)}`,
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
                    title: { display: true, text: tr('chart_y_axis') },
                },
            },
        },
    });
}

// ============================================================================
// EXPORTACIÓN — PNG y CSV
// ============================================================================

/** Descarga la gráfica actual como imagen PNG. */
window.downloadChartAsImage = function() {
    if (!chartInstance) return;
    const a   = document.createElement('a');
    a.href     = chartInstance.toBase64Image('image/png');
    a.download = `control-sim_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

/**
 * Descarga los datos de la gráfica como CSV (separador ';', decimal ',').
 * Formato: columna de tiempo + una columna por cada dataset.
 */
window.downloadChartDataAsCSV = function() {
    if (!chartInstance || !chartInstance.data.datasets.length) return;
    const ds    = chartInstance.data.datasets;
    const times = ds[0].data.map(p => p.x);

    // Cabecera
    let csv = 'Tiempo (s)';
    ds.forEach(d => { csv += ';' + d.label.replace(/;/g, ''); });
    csv += '\n';

    // Filas de datos
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
// INICIALIZACIÓN — se ejecuta cuando el DOM está listo
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {

    // Mostrar versión en el pie de página
    const verEl = document.getElementById('appVersionPlaceholder');
    if (verEl) verEl.textContent = APP_VERSION;

    // Estado inicial: todos los módulos opcionales desactivados
    ['PID', 'Process', 'Delay'].forEach(name => {
        document.getElementById('card' + name).classList.remove('active');
    });
    document.getElementById('t2Row').style.display        = 'none';
    document.getElementById('cardFeedback').style.display = 'none';
    document.getElementById('thRow').style.display        = 'none';

    // Aplicar idioma guardado (dispara toda la cadena de actualización de UI)
    setLanguage(getLang());

    // Gráfica vacía inicial
    renderChart();
});
