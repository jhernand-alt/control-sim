// --- MAPA GLOBAL DE TRADUCCIONES (Asume que lang/es.js y lang/en.js fueron cargados) ---
// Estos archivos externos deben definir las constantes globales: translations_es y translations_en
const translations = {
    'es': translations_es,
    'en': translations_en
};

let currentLang = 'es'; 
let chartInstance = null; 
const DURATION = 40;     
const START_TIME = 0.0;  
const END_TIME = DURATION; 
const TIME_STEP = 0.01;  
const N_STEPS = Math.ceil((END_TIME - START_TIME) / TIME_STEP); 

let allResponseDatasets = []; 
let currentInputDataset = null; 

// --- FUNCIONES DE SOPORTE ---

/**
 * Traduce todos los elementos de la interfaz.
 */
window.setLanguage = function(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // Traducciones estáticas (data-lang-key)
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (t[key]) {
            // Manejar opciones de select
            if (el.tagName === 'OPTION') {
                el.textContent = t[key];
            } else {
                // Manejar elementos generales
                el.innerHTML = t[key];
            }
        }
    });

    // Traducciones para opciones de select
    document.querySelectorAll('select').forEach(select => {
        Array.from(select.options).forEach(option => {
            const key = option.getAttribute('data-lang-key');
            if (key && t[key]) {
                 option.textContent = t[key];
            }
        });
    });

    // Actualizar dinámicos
    toggleInputParams();
    updateFTFromInputs();
    updateDiagram();

    // Re-renderizar el gráfico si existe para actualizar etiquetas y títulos
    if (chartInstance) {
        renderChart(generateTimeLabels(), currentInputDataset ? currentInputDataset.data : [], allResponseDatasets, document.getElementById('inputSelector').value);
    }
};

/**
 * Genera el array de etiquetas de tiempo [0.00, 0.01, ..., DURATION].
 */
function generateTimeLabels() {
    const times = [];
    for (let i = 0; i <= N_STEPS; i++) {
        times.push((i * TIME_STEP).toFixed(2));
    }
    return times;
}

/**
 * Genera un color aleatorio que sea distinguible.
 */
function getNextColor() {
    const colors = [
        'rgb(54, 162, 235)',  // Azul
        'rgb(75, 192, 192)',  // Verde azulado
        'rgb(153, 102, 255)', // Púrpura
        'rgb(255, 159, 64)',  // Naranja
        'rgb(201, 203, 207)', // Gris
        'rgb(255, 205, 86)',  // Amarillo
    ];
    const index = allResponseDatasets.length % colors.length;
    return colors[index];
}

// --- MANEJO DE LA INTERFAZ ---

/**
 * Muestra/oculta los parámetros específicos según el tipo de entrada R(s).
 */
window.toggleInputParams = function() {
    const container = document.getElementById('inputParamsContainer');
    const inputType = document.getElementById('inputSelector').value;
    const t = translations[currentLang];
    
    // Limpiar contenido anterior
    container.innerHTML = '';

    let htmlContent = '';
    
    // Parámetros para Escalón
    if (inputType === 'step') {
        htmlContent = `
            <div>
                <label class="selector-label" for="paramStepMin">${t.step_min_label}</label>
                <input type="number" id="paramStepMin" class="input-param" value="0.0" step="0.5" min="-100.0" max="100.0">
            </div>
            <div>
                <label class="selector-label" for="paramStepMax">${t.step_max_label}</label>
                <input type="number" id="paramStepMax" class="input-param" value="1.0" step="0.5" min="-100.0" max="100.0">
            </div>
        `;
    } 
    // Parámetros para Rampa
    else if (inputType === 'ramp') {
        htmlContent = `
            <div>
                <label class="selector-label" for="paramRampSlope">${t.ramp_slope_label}</label>
                <input type="number" id="paramRampSlope" class="input-param" value="0.5" step="0.1" min="0.1" max="10.0">
            </div>
        `;
    } 
    // Parámetros para Senoidal
    else if (inputType === 'sinusoidal') {
        htmlContent = `
            <div>
                <label class="selector-label" for="paramSinAmp">${t.sin_amp_label}</label>
                <input type="number" id="paramSinAmp" class="input-param" value="1.0" step="0.1" min="0.1" max="10.0">
            </div>
            <div>
                <label class="selector-label" for="paramSinFreq">${t.sin_freq_label}</label>
                <input type="number" id="paramSinFreq" class="input-param" value="0.5" step="0.1" min="0.1" max="10.0">
            </div>
        `;
    }
    
    container.innerHTML = htmlContent;
}

/**
 * Muestra/oculta los parámetros específicos según el orden del sistema.
 */
window.toggleSystemParams = function() {
    const order = document.getElementById('systemOrderSelector').value;
    document.getElementById('firstOrderParams').style.display = (order === 'first' ? 'block' : 'none');
    document.getElementById('secondOrderParams').style.display = (order === 'second' ? 'block' : 'none');
}

/**
 * Muestra/oculta los parámetros del controlador PID.
 */
window.toggleControllerInputs = function() {
    const loopType = document.getElementById('loopSelector').value;
    const controllerWrapper = document.getElementById('controllerParamsWrapper');
    controllerWrapper.style.display = (loopType === 'closed' ? 'block' : 'none');
    updateFTFromInputs();
}

/**
 * Limpia solo las líneas de respuesta Y(t) del gráfico, manteniendo la entrada R(t).
 */
window.clearResponses = function() {
    allResponseDatasets = [];
    const times = generateTimeLabels();
    // Renderiza solo la entrada R(t)
    renderChart(times, currentInputDataset ? currentInputDataset.data : [], allResponseDatasets, document.getElementById('inputSelector').value);
}

/**
 * Limpia todas las líneas (R(t) y Y(t)) del gráfico.
 */
window.clearAllLines = function() {
    allResponseDatasets = [];
    currentInputDataset = null;
    const times = generateTimeLabels();
    renderChart(times, [], allResponseDatasets, document.getElementById('inputSelector').value);
}


// --- MANEJO DE FT Y DIAGRAMA ---

/**
 * Llama a updateFT y updateDiagram cada vez que un input del sistema o controlador cambie.
 */
window.updateFTFromInputs = function() {
    const kp = parseFloat(document.getElementById('paramKp').value);
    const order = document.getElementById('systemOrderSelector').value;
    const loopType = document.getElementById('loopSelector').value;
    
    let tau = 0;
    let wn = 0;
    let zeta = 0;

    if (order === 'first') {
        tau = parseFloat(document.getElementById('paramTau').value);
    } else {
        wn = parseFloat(document.getElementById('paramWn').value);
        zeta = parseFloat(document.getElementById('paramZeta').value);
    }
    
    let kc = 0;
    let ti = 0;
    let tdc = 0;
    
    if (loopType === 'closed') {
        kc = parseFloat(document.getElementById('paramKc').value);
        ti = parseFloat(document.getElementById('paramTi').value);
        tdc = parseFloat(document.getElementById('paramTd_c').value);
    }

    updateFT(kp, tau, wn, zeta, order, loopType, kc, ti, tdc);
    updateDiagram();
}

/**
 * Construye y renderiza la Función de Transferencia (FT) con MathJax.
 */
function updateFT(Kp, Tau, Wn, Zeta, order, loopType, Kc, Ti, Tdc) {
    let Gp_s = '';
    let Gc_s = '';
    let G_s = '';
    
    const display = document.getElementById('ftDisplay');

    // 1. FT del Proceso (Gp(s))
    if (order === 'first') {
        Gp_s = `G_p(s) = \\frac{${Kp}}{${Tau}s + 1}`;
    } else { // Second Order
        Gp_s = `G_p(s) = \\frac{${Kp}\\omega_n^2}{s^2 + 2\\zeta\\omega_n s + \\omega_n^2}`;
        // Para simplificar la visualización de la FT:
        const twoZetaWn = (2 * Zeta * Wn).toFixed(3);
        const WnSquared = (Wn * Wn).toFixed(3);
        Gp_s = `G_p(s) = \\frac{${Kp * WnSquared}}{s^2 + ${twoZetaWn}s + ${WnSquared}}`;
    }

    // 2. FT del Controlador (Gc(s)) y FT Total (G(s) o G_LC(s))
    if (loopType === 'open') {
        // Lazo Abierto: G(s) = Gp(s) * Exp(-Td*s)
        G_s = Gp_s;
        G_s += (parseFloat(document.getElementById('paramTd').value) > 0) 
            ? ` \\cdot e^{-${parseFloat(document.getElementById('paramTd').value)}s}` 
            : '';
        display.innerHTML = `$$\\text{FT Proceso: } ${G_s}$$`;
        
    } else { // Lazo Cerrado (PID)
        const kp_term = (Ti < 999999.0 && Ti > 0) ? `\\frac{1}{${Ti}s} + ` : '';
        const kd_term = (Tdc > 0) ? `+ ${Tdc}s` : '';
        
        // Controlador Gc(s) = Kc * (1 + 1/Ti*s + Tdc*s)
        if (Ti >= 999999.0) { // Prácticamente PI (Pura) si Ti es infinito
             Gc_s = (Tdc > 0) ? `G_c(s) = ${Kc} (1 + ${Tdc}s)` : `G_c(s) = ${Kc}`;
        } else {
             Gc_s = `G_c(s) = ${Kc} \\left(1 + ${kp_term}${kd_term}\\right)`;
        }
        
        // G_LC(s) = Gc(s) * Gp(s) / (1 + Gc(s) * Gp(s) * H(s))
        // Suponiendo H(s) = 1 (realimentación unitaria)
        const G_LC_s_formula = 'G_{LC}(s) = \\frac{G_c(s) G_p(s)}{1 + G_c(s) G_p(s)}';

        display.innerHTML = `
            $$\\text{FT Proceso: } ${Gp_s}$$
            $$\\text{FT Controlador: } ${Gc_s}$$
            $$\\text{FT Lazo Cerrado (con Retardo): } ${G_LC_s_formula} \\cdot e^{-T_d s}$$
        `;
    }

    // Renderizar las ecuaciones
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset([display]);
    }
}

/**
 * Dibuja un diagrama de bloques simplificado (texto) según el tipo de lazo.
 */
window.updateDiagram = function() {
    const loopType = document.getElementById('loopSelector').value;
    const diagramBlock = document.getElementById('diagramBlock');
    const t = translations[currentLang];
    
    let diagram = '';
    let title = '';

    // Usar la clave de traducción para el bloque de retardo
    const delayBlockText = t.diagram_delay_block; 
    
    if (loopType === 'open') {
        title = t.diagram_title_open;
        diagram = `
              R(s) ---> [ Gp(s) ] ---> [ ${delayBlockText} ] ---> Y(s)
        `;
    } else {
        title = t.diagram_title_closed;
        // La realimentación usa H(s)=1, que es neutral. El bloque de retardo ya está traducido.
        diagram = `
                                            +
                                            |
        R(s) ---> (+) ---> [ Gc(s) ] ---> [ Gp(s) ] ---> [ ${delayBlockText} ] ---> Y(s)
                 ^                                             |
                 |--------------------[ H(s)=1 ]-----------------
        `;
    }
    
    diagramBlock.innerHTML = `<div class="diagram-title">${title}</div>${diagram}`;
}

// --- FUNCIONES DE SIMULACIÓN ---

/**
 * Implementación del algoritmo de Euler Forward.
 */
function calculateResponse(Kp, Tau, Wn, Zeta, Td, order, loopType, Kc, Ti, Tdc, inputType) {
    
    // 1. Inicialización de arrays de datos y variables de estado
    const inputData = [];
    const responseData = new Array(N_STEPS + 1).fill(0);
    const errorData = new Array(N_STEPS + 1).fill(0); // Para Lazo Cerrado
    
    // Variables de estado (y, y_dot) y variables auxiliares
    let y_prev = 0.0;
    let y_dot_prev = 0.0; // Solo para segundo orden
    let integral_error = 0.0; // Acumulador del error (para integral)
    let error_prev = 0.0; // Error anterior (para derivativo)

    // Buffer para el tiempo muerto (Td)
    const Td_steps = Math.floor(Td / TIME_STEP);
    const bufferSize = Td_steps > 0 ? Td_steps : 1;
    const outputBuffer = new Array(bufferSize).fill(0.0);
    
    // 2. Cálculo de la entrada R(t)
    function R_t(t) {
        if (inputType === 'step') {
            const min = parseFloat(document.getElementById('paramStepMin').value);
            const max = parseFloat(document.getElementById('paramStepMax').value);
            return (t >= 0) ? max : min;
        } else if (inputType === 'ramp') {
            const slope = parseFloat(document.getElementById('paramRampSlope').value);
            return (t >= 0) ? slope * t : 0.0;
        } else if (inputType === 'sinusoidal') {
            const amplitude = parseFloat(document.getElementById('paramSinAmp').value);
            const frequency = parseFloat(document.getElementById('paramSinFreq').value);
            return amplitude * Math.sin(frequency * t);
        }
        return 0.0;
    }
    
    // 3. Bucle de Simulación (Euler Forward)
    for (let i = 0; i <= N_STEPS; i++) {
        const t = i * TIME_STEP;
        const R = R_t(t);
        inputData.push(R);

        // --- CÁLCULO DE LA SEÑAL DE CONTROL (Uc) O FUERZA DE ENTRADA AL PROCESO ---
        let Uc = R; 
        
        if (loopType === 'closed') {
            // El valor de Y(t) usado para calcular el error es el valor sin el retardo (y_prev)
            const Y_feedback = y_prev; 
            const error = R - Y_feedback;
            errorData[i] = error;

            // 3.1. Acción Integral (PI/PID)
            // Se usa el error acumulado
            if (Ti < 999999.0) {
                 integral_error += error * TIME_STEP;
            } else {
                 integral_error = 0.0; // Desactivar si Ti es 'infinito'
            }
            
            // 3.2. Acción Derivativa (PD/PID)
            let derivative_term = 0.0;
            if (Tdc > 0.0 && i > 0) {
                // Cálculo de la derivada del error (discreto)
                derivative_term = (error - error_prev) / TIME_STEP;
            }
            
            // 3.3. Señal de Control Uc
            // Gc(s) = Kc * [ P + I + D ]
            Uc = Kc * (error + (integral_error) + (Tdc * derivative_term));
            
            // Actualizar error_prev
            error_prev = error; 
        }

        // --- CÁLCULO DE LA DERIVADA DEL SISTEMA (dx/dt) ---
        let dy_dt = 0.0;
        let d2y_dt2 = 0.0;

        if (order === 'first') {
            // Primer Orden: Tau * dy/dt + y = Kp * Uc(t)
            // dy/dt = (1/Tau) * (Kp * Uc - y_prev)
            dy_dt = (1.0 / Tau) * (Kp * Uc - y_prev);
            
            // Nueva posición (Euler Forward): y_new = y_prev + dy/dt * dt
            y_prev += dy_dt * TIME_STEP;

        } else { // Segundo Orden
            // Segundo Orden: d2y/dt2 + 2*zeta*wn*dy/dt + wn^2*y = Kp*wn^2*Uc(t)
            const wn_sq = Wn * Wn;
            const two_zeta_wn = 2.0 * Zeta * Wn;
            
            // d2y/dt2 = Kp*wn^2*Uc - 2*zeta*wn*dy/dt - wn^2*y
            d2y_dt2 = (Kp * wn_sq * Uc) - (two_zeta_wn * y_dot_prev) - (wn_sq * y_prev);
            
            // Nuevas variables de estado (Euler Forward)
            y_dot_prev += d2y_dt2 * TIME_STEP; // y_dot_new = y_dot_prev + d2y/dt2 * dt
            y_prev += y_dot_prev * TIME_STEP;  // y_new = y_prev + y_dot_new * dt
        }

        // --- APLICAR RETARDO (Td) ---
        
        // El valor de y_prev (salida del proceso Gp(s)) se guarda en el buffer
        outputBuffer.unshift(y_prev); // Añadir al inicio
        outputBuffer.pop(); // Eliminar el último (el más antiguo)
        
        // La respuesta Y(t) es el valor de la salida del proceso retrasado
        responseData[i] = outputBuffer[Td_steps]; 
    }
    
    return { inputData, responseData };
}

/**
 * Lee los parámetros de los inputs y llama a la simulación.
 */
window.addSimulationLine = function() {
    const loopType = document.getElementById('loopSelector').value;
    const order = document.getElementById('systemOrderSelector').value;
    const inputType = document.getElementById('inputSelector').value;
    const t = translations[currentLang];
    
    // Parámetros del Proceso (Gp)
    const Kp = parseFloat(document.getElementById('paramKp').value);
    const Td = parseFloat(document.getElementById('paramTd').value);
    let Tau = (order === 'first') ? parseFloat(document.getElementById('paramTau').value) : 0;
    let Wn = (order === 'second') ? parseFloat(document.getElementById('paramWn').value) : 0;
    let Zeta = (order === 'second') ? parseFloat(document.getElementById('paramZeta').value) : 0;

    // Parámetros del Controlador (Gc)
    let Kc = 0;
    let Ti = 0;
    let Tdc = 0;
    if (loopType === 'closed') {
        Kc = parseFloat(document.getElementById('paramKc').value);
        Ti = parseFloat(document.getElementById('paramTi').value);
        Tdc = parseFloat(document.getElementById('paramTd_c').value);
    }
    
    // 1. Ejecutar Simulación
    const { inputData, responseData } = calculateResponse(Kp, Tau, Wn, Zeta, Td, order, loopType, Kc, Ti, Tdc, inputType);

    // 2. Construir la Etiqueta (Leyenda)
    const loopAbbr = (loopType === 'open') ? t.label_open_loop_abbr : t.label_closed_loop_abbr;
    const orderAbbr = (order === 'first') ? t.label_first_order_abbr : t.label_second_order_abbr;
    
    let paramsLabel = '';
    if (order === 'first') {
        paramsLabel = `Kp=${Kp}, τ=${Tau}`;
    } else {
        paramsLabel = `Kp=${Kp}, ζ=${Zeta}, ωn=${Wn}`;
    }
    
    if (loopType === 'closed') {
        let ti_label = (Ti < 999999.0) ? `Ti=${Ti}` : '';
        let tdc_label = (Tdc > 0.0) ? `Tdc=${Tdc}` : '';
        paramsLabel += `, Kc=${Kc}`;
        if (ti_label) paramsLabel += `, ${ti_label}`;
        if (tdc_label) paramsLabel += `, ${tdc_label}`;
    }

    if (Td > 0.0) {
         paramsLabel += `, Td=${Td}`;
    }

    const newLabel = `Y${allResponseDatasets.length + 1} (${orderAbbr} - ${loopAbbr}): ${paramsLabel}`;
    
    // 3. Crear el nuevo dataset
    const newDataset = {
        label: newLabel,
        data: responseData, 
        borderColor: getNextColor(),
        backgroundColor: getNextColor(),
        borderWidth: 2,
        fill: false,
        pointRadius: 0
    };

    // 4. Almacenar y Renderizar
    allResponseDatasets.push(newDataset);
    const times = generateTimeLabels();
    renderChart(times, inputData, allResponseDatasets, inputType);
}

// --- FUNCIONES DE DESCARGA (NUEVAS) ---

/**
 * Descarga la gráfica actual como una imagen PNG.
 */
window.downloadChartAsImage = function() {
    if (!chartInstance) {
        alert(currentLang === 'es' ? 'No hay gráfica para descargar.' : 'No chart to download.');
        return;
    }

    // 1. Obtener la URL de la imagen (el fondo blanco se fuerza en getChartOptions)
    const imageURL = chartInstance.toBase64Image('image/png');

    // 2. Crear un enlace temporal para forzar la descarga
    const a = document.createElement('a');
    a.href = imageURL;
    a.download = `respuesta_temporal_${new Date().toISOString().slice(0, 10)}.png`;

    // 3. Simular el clic en el enlace
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

/**
 * Descarga los datos de la gráfica (Tiempo, R(t) y todos los Y(t)) como CSV.
 */
window.downloadChartDataAsCSV = function() {
    if (!chartInstance || chartInstance.data.datasets.length === 0) {
        alert(currentLang === 'es' ? 'No hay datos para descargar.' : 'No data to download.');
        return;
    }

    const data = chartInstance.data;
    const labels = data.labels;
    const datasets = data.datasets;

    // 1. Crear la cabecera del CSV
    // Usamos el punto y coma (;) como delimitador para compatibilidad con Excel
    let csv = 'Tiempo (s)';
    
    // Añadir etiquetas de las series (R(t) y todas las Y(t))
    datasets.forEach(d => {
        csv += ';' + d.label.replace(/,/g, ''); // Quitamos las comas internas de las etiquetas
    });
    csv += '\n';

    // 2. Añadir los datos
    for (let i = 0; i < labels.length; i++) {
        let row = labels[i].replace(',', '.'); // Usamos punto como separador decimal estándar
        
        datasets.forEach(d => {
            const value = d.data[i] !== undefined ? d.data[i].toFixed(6).replace('.', ',') : ''; // Formato decimal con coma
            row += ';' + value;
        });
        csv += row + '\n';
    }

    // 3. Crear el blob y el enlace de descarga
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `datos_simulacion_${new Date().toISOString().slice(0, 10)}.csv`;
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;

    // 4. Simular el clic
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
};


// --- RENDERIZADO DEL GRÁFICO (Chart.js) ---

/**
 * Renderiza el gráfico con la línea de entrada actual y todas las respuestas almacenadas.
 */
window.renderChart = function(times, currentInputData, allResponses, inputType) {
     if (chartInstance) {
        chartInstance.destroy();
    }
    
    const ctx = document.getElementById('responseChart').getContext('2d');
    const t = translations[currentLang];
    
    // 1. Crear el Dataset de la Entrada R(t)
    let inputDataset = null;
    if (currentInputData && currentInputData.length > 0) {
        
        // --- CONSTRUCCIÓN DE LA ETIQUETA DE LEYENDA (R(t)) ---
        let inputAbbr;
        if (inputType === 'step') {
            inputAbbr = t.input_abbr_step;
        } else if (inputType === 'ramp') {
            inputAbbr = t.input_abbr_ramp;
        } else if (inputType === 'sinusoidal') {
            inputAbbr = t.input_abbr_sin;
        }
        let currentInputLabel = `${t.input_label_r} (${inputAbbr})`;
        
        // Leer parámetros actuales de la entrada desde el DOM
        if (inputType === 'step') {
            const min = parseFloat(document.getElementById('paramStepMin')?.value) || 0.0;
            const max = parseFloat(document.getElementById('paramStepMax')?.value) || 1.0;
            currentInputLabel += ` [${min.toFixed(1)} → ${max.toFixed(1)}]`; 
        } else if (inputType === 'ramp') {
            const slope = parseFloat(document.getElementById('paramRampSlope')?.value) || 0.5;
            currentInputLabel += ` [m=${slope.toFixed(1)}]`; 
        } else if (inputType === 'sinusoidal') {
            const amplitude = parseFloat(document.getElementById('paramSinAmp')?.value) || 1.0;
            const frequency = parseFloat(document.getElementById('paramSinFreq')?.value) || 0.5;
            currentInputLabel += ` [A=${amplitude.toFixed(1)}, ω=${frequency.toFixed(1)}]`; 
        }
        // --- FIN CONSTRUCCIÓN DE LA ETIQUETA ---

        inputDataset = {
            label: currentInputLabel,
            data: currentInputData, 
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgb(255, 99, 132, 0.5)',
            borderWidth: 2,
            fill: false, 
            pointRadius: 0,
        };
    }
    
    // 2. Combinar Entrada y Respuestas
    const finalDatasets = [];
    if (inputDataset) {
        finalDatasets.push(inputDataset);
        currentInputDataset = inputDataset; // Almacenar el dataset de la entrada
    } else {
        currentInputDataset = null; // Reiniciar si no hay datos de entrada
    }
    finalDatasets.push(...allResponses);


    // Manejo de caso inicial o sin datos
    if (finalDatasets.length === 0) {
         chartInstance = new Chart(ctx, {
            type: 'line', 
            data: { labels: times, datasets: [] }, 
            options: getChartOptions(t, allResponses.length) 
        });
        return;
    }
    
    chartInstance = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: times,
            datasets: finalDatasets
        },
        options: getChartOptions(t, allResponses.length) 
    });
}

/**
 * Genera las opciones de configuración del gráfico, incluyendo las traducciones.
 */
function getChartOptions(t, numResponses) {
    return {
        responsive: true,
        maintainAspectRatio: false, 
        animation: false, 
        plugins: {
            // CONFIGURACIÓN PARA EL FONDO BLANCO EN LA DESCARGA
            backgroundColor: 'white', 
            // ----------------------------------------------------
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: numResponses > 0 
                    ? `${t.chart_title_sim_prefix}${numResponses}${t.chart_title_sim_suffix}`
                    : t.chart_empty_text
            },
            tooltip: {
                callbacks: {
                    title: (context) => `${t.tooltip_time}${context[0].label}s`,
                    label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(3)}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false, 
                title: {
                    display: true,
                    text: t.chart_y_axis
                }
            },
            x: {
                title: {
                    display: true,
                    text: t.chart_x_axis
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20,
                    callback: function(value, index, values) {
                        const timeValue = parseFloat(this.getLabelForValue(value));
                        if (timeValue % 5 === 0) { 
                            return timeValue.toFixed(0);
                        } else if (timeValue % 1 === 0) {
                             return timeValue.toFixed(0);
                        }
                        return null;
                    }
                }
            }
        }
    };
}


// --- INICIALIZACIÓN AL CARGAR LA PÁGINA ---
window.onload = function() {
    setLanguage(currentLang);
    document.getElementById('languageSelector').value = currentLang;

    toggleSystemParams(); 
    updateFTFromInputs(); 
    
    renderChart(generateTimeLabels(), [], allResponseDatasets, 'step'); 
};