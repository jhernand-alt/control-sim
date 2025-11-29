// --- MAPA GLOBAL DE TRADUCCIONES ---
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
 * Traduce todos los elementos de la interfaz y fuerza la renderización de MathJax.
 */
window.setLanguage = function(lang) {
    currentLang = lang;
    const t = translations[lang];
    
    // Traducciones estáticas (data-lang-key)
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.getAttribute('data-lang-key');
        if (t[key]) {
            if (el.tagName === 'OPTION') {
                el.textContent = t[key];
            } else {
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
    updateDiagram(); 
    toggleSystemParams(); // Esto asegura que los parámetros del sistema se actualicen

    // Forzar la renderización de MathJax en todo el cuerpo después de traducir
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset();
    }
    
    // Re-renderizar el gráfico si existe para actualizar etiquetas y títulos
    if (chartInstance) {
        renderChart(currentInputDataset ? currentInputDataset.data : [], allResponseDatasets, document.getElementById('inputSelector').value);
    }
};

/**
 * Genera un color aleatorio que sea distinguible.
 */
function getNextColor() {
    const colors = [
        'rgb(54, 162, 235)',  
        'rgb(75, 192, 192)',  
        'rgb(153, 102, 255)', 
        'rgb(255, 159, 64)',  
        'rgb(201, 203, 207)', 
        'rgb(255, 205, 86)',  
    ];
    const index = allResponseDatasets.length % colors.length;
    return colors[index];
}

// --- MANEJO DE LA INTERFAZ ---

window.toggleInputParams = function() {
    const container = document.getElementById('inputParamsContainer');
    const inputType = document.getElementById('inputSelector').value;
    const t = translations[currentLang];
    
    container.innerHTML = '';
    let htmlContent = '';
    
    // (Resto del código de toggleInputParams sin cambios en la estructura)
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
    else if (inputType === 'ramp') {
        htmlContent = `
            <div>
                <label class="selector-label" for="paramRampSlope">${t.ramp_slope_label}</label>
                <input type="number" id="paramRampSlope" class="input-param" value="0.5" step="0.1" min="0.1" max="10.0">
            </div>
        `;
    } 
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

    // Forzar renderización de MathJax en los nuevos labels
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset([container]);
    }
}

window.toggleSystemParams = function() {
    const order = document.getElementById('systemOrderSelector').value;
    document.getElementById('firstOrderParams').style.display = (order === 'first' ? 'block' : 'none');
    document.getElementById('secondOrderParams').style.display = (order === 'second' ? 'block' : 'none');
    
    updateDiagram(); 
    
    // Forzar renderización de MathJax en los parámetros del sistema
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset([document.getElementById('firstOrderParams'), document.getElementById('secondOrderParams'), document.getElementById('controllerParamsWrapper')]);
    }
}

window.toggleControllerInputs = function() {
    const loopType = document.getElementById('loopSelector').value;
    const controllerWrapper = document.getElementById('controllerParamsWrapper');
    controllerWrapper.style.display = (loopType === 'closed' ? 'block' : 'none');
    
    updateFTFromInputs(); 
    
    // Forzar renderización de MathJax en los parámetros del controlador
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset([controllerWrapper]);
    }
}

window.clearResponses = function() {
    allResponseDatasets = [];
    renderChart(currentInputDataset ? currentInputDataset.data : [], allResponseDatasets, document.getElementById('inputSelector').value);
}

window.clearAllLines = function() {
    allResponseDatasets = [];
    currentInputDataset = null;
    renderChart([], allResponseDatasets, document.getElementById('inputSelector').value);
}


// --- MANEJO DE FT Y DIAGRAMA ---

window.updateFTFromInputs = function() {
    updateDiagram();
}

/**
 * Muestra las fórmulas de la Función de Transferencia de forma estática (simbólica),
 * renderizando solo las que se utilizan en la simulación actual (orden y lazo).
 */
function renderStaticFT() {
    const display = document.getElementById('ftDisplay');
    const loopType = document.getElementById('loopSelector').value;
    const order = document.getElementById('systemOrderSelector').value; 
    const t = translations[currentLang];

    // Fórmulas base
    const Gp_FO = `G_p(s) = \\frac{K_p}{\\tau s + 1}`;
    const Gp_SO = `G_p(s) = \\frac{K_p \\omega_n^2}{s^2 + 2 \\zeta \\omega_n s + \\omega_n^2}`;
    
    // Fórmula del controlador PID (única a mostrar en lazo cerrado)
    const Gc_PID = `G_c(s) = K_c \\left(1 + \\frac{1}{T_i s} + T_{d,c} s\\right)`;
    
    let htmlContent = '';
    
    // 1. F.T. del Proceso Gp(s)
    htmlContent += `<h3>${t.ft_proc_title}</h3>`;
    if (order === 'first') {
        htmlContent += `$$\\text{Primer Orden: } ${Gp_FO}$$`;
    } else {
        htmlContent += `$$\\text{Segundo Orden: } ${Gp_SO}$$`;
    }

    // 2. F.T. de Lazo y Controlador
    if (loopType === 'closed') {
        // Fórmula del Controlador Gc(s)
        const G_LC_s_formula = 'G_{LC}(s) = \\frac{Y(s)}{R(s)} = \\frac{G_c(s) G_p(s)}{1 + G_c(s) G_p(s)} \\cdot e^{-T_d s}';
        
        htmlContent += `
            <h3>${t.ft_cont_title_latex}</h3> 
            $$${Gc_PID}$$
            <h3>${t.ft_closed_loop_title}</h3>
            $$${G_LC_s_formula}$$
        `;
    } else {
         // Fórmulas de Lazo Abierto
         htmlContent += `
            <h3>${t.ft_open_loop_title}</h3>
            $$G(s) = \\frac{Y(s)}{R(s)} = G_p(s) \\cdot e^{-T_d s}$$
        `;
    }

    display.innerHTML = htmlContent;
    
    // MathJax for the FT Display is already correct here.
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset([display]);
    }
}


window.updateDiagram = function() {
    const loopType = document.getElementById('loopSelector').value;
    const diagramBlock = document.getElementById('diagramBlock');
    const t = translations[currentLang];
    
    renderStaticFT();

    let diagram = '';
    let title = '';

    const delayBlockText = t.diagram_delay_block; 
    
    if (loopType === 'open') {
        title = t.diagram_title_open;
        diagram = `
              R(s) ---> [ Gp(s) ] ---> [ ${delayBlockText} ] ---> Y(s)
        `;
    } else {
        title = t.diagram_title_closed;
        const feedbackBlockText = t.diagram_feedback_block;
        diagram = `
                                            +
                                            |
        R(s) ---> (+) ---> [ Gc(s) ] ---> [ Gp(s) ] ---> [ ${delayBlockText} ] ---> Y(s)
                 ^                                             |
                 |--------------------[ ${feedbackBlockText} ]-----------------
        `;
    }
    
    diagramBlock.innerHTML = `<div class="diagram-title">${title}</div>${diagram}`;

    // Forzar renderización de MathJax en el diagrama de bloques
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset([diagramBlock]);
    }
}

// --- FUNCIONES DE SIMULACIÓN Y CHART.JS (Sin cambios en la lógica de simulación) ---

function calculateResponse(Kp, Tau, Wn, Zeta, Td, order, loopType, Kc, Ti, Tdc, inputType) {
    
    const inputData = []; 
    const responseData = []; 
    
    let y_prev = 0.0;
    let y_dot_prev = 0.0; 
    let integral_error = 0.0; 
    let error_prev = 0.0; 

    const Td_steps = Math.floor(Td / TIME_STEP);
    const bufferSize = Td_steps > 0 ? Td_steps : 1;
    const outputBuffer = new Array(bufferSize).fill(0.0);
    
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
    
    for (let i = 0; i <= N_STEPS; i++) {
        const t = i * TIME_STEP;
        const R = R_t(t);
        inputData.push({x: t, y: R}); 

        let Uc = R; 
        
        if (loopType === 'closed') {
            const Y_feedback = y_prev; 
            const error = R - Y_feedback;

            if (Ti < 999999.0) {
                 integral_error += error * TIME_STEP;
            } else {
                 integral_error = 0.0; 
            }
            
            let derivative_term = 0.0;
            if (Tdc > 0.0 && i > 0) {
                derivative_term = (error - error_prev) / TIME_STEP;
            }
            
            Uc = Kc * (error + (integral_error) + (Tdc * derivative_term));
            
            error_prev = error; 
        }

        let dy_dt = 0.0;
        let d2y_dt2 = 0.0;

        if (order === 'first') {
            dy_dt = (1.0 / Tau) * (Kp * Uc - y_prev);
            y_prev += dy_dt * TIME_STEP;

        } else { 
            const wn_sq = Wn * Wn;
            const two_zeta_wn = 2.0 * Zeta * Wn;
            
            d2y_dt2 = (Kp * wn_sq * Uc) - (two_zeta_wn * y_dot_prev) - (wn_sq * y_prev);
            
            y_dot_prev += d2y_dt2 * TIME_STEP;
            y_prev += y_dot_prev * TIME_STEP;
        }

        outputBuffer.unshift(y_prev);
        outputBuffer.pop();
        
        const Y_out = outputBuffer[Td_steps];
        responseData.push({x: t, y: Y_out}); 
    }
    
    return { inputData, responseData };
}

window.addSimulationLine = function() {
    const loopType = document.getElementById('loopSelector').value;
    const order = document.getElementById('systemOrderSelector').value;
    const inputType = document.getElementById('inputSelector').value;
    const t = translations[currentLang];
    
    const Kp = parseFloat(document.getElementById('paramKp').value);
    const Td = parseFloat(document.getElementById('paramTd').value);
    let Tau = (order === 'first') ? parseFloat(document.getElementById('paramTau').value) : 0;
    let Wn = (order === 'second') ? parseFloat(document.getElementById('paramWn').value) : 0;
    let Zeta = (order === 'second') ? parseFloat(document.getElementById('paramZeta').value) : 0;

    let Kc = 0;
    let Ti = 0;
    let Tdc = 0;
    if (loopType === 'closed') {
        Kc = parseFloat(document.getElementById('paramKc').value);
        Ti = parseFloat(document.getElementById('paramTi').value);
        Tdc = parseFloat(document.getElementById('paramTd_c').value);
    }
    
    const { inputData, responseData } = calculateResponse(Kp, Tau, Wn, Zeta, Td, order, loopType, Kc, Ti, Tdc, inputType);

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
    
    const newDataset = {
        label: newLabel,
        data: responseData, 
        borderColor: getNextColor(),
        backgroundColor: getNextColor(),
        borderWidth: 2,
        fill: false,
        pointRadius: 0
    };

    allResponseDatasets.push(newDataset);
    renderChart(inputData, allResponseDatasets, inputType);
}

window.downloadChartAsImage = function() {
    if (!chartInstance) {
        alert(currentLang === 'es' ? 'No hay gráfica para descargar.' : 'No chart to download.');
        return;
    }

    const imageURL = chartInstance.toBase64Image('image/png');

    const a = document.createElement('a');
    a.href = imageURL;
    a.download = `respuesta_temporal_${new Date().toISOString().slice(0, 10)}.png`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

window.downloadChartDataAsCSV = function() {
    if (!chartInstance || chartInstance.data.datasets.length === 0) {
        alert(currentLang === 'es' ? 'No hay datos para descargar.' : 'No data to download.');
        return;
    }

    const data = chartInstance.data;
    const datasets = data.datasets;

    const timeData = datasets.length > 0 ? datasets[0].data.map(p => p.x) : [];
    
    let csv = 'Tiempo (s)';
    datasets.forEach(d => {
        csv += ';' + d.label.replace(/,/g, '');
    });
    csv += '\n';

    for (let i = 0; i < timeData.length; i++) {
        let row = timeData[i].toFixed(2).replace('.', ','); 

        datasets.forEach(d => {
            const value = d.data[i]?.y !== undefined ? d.data[i].y.toFixed(6).replace('.', ',') : '';
            row += ';' + value;
        });
        csv += row + '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `datos_simulacion_${new Date().toISOString().slice(0, 10)}.csv`;
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
};


window.renderChart = function(currentInputData, allResponses, inputType) {
     if (chartInstance) {
        chartInstance.destroy();
    }
    
    const ctx = document.getElementById('responseChart').getContext('2d');
    const t = translations[currentLang];
    
    let inputDataset = null;
    if (currentInputData && currentInputData.length > 0) {
        
        let inputAbbr;
        if (inputType === 'step') {
            inputAbbr = t.input_abbr_step;
        } else if (inputType === 'ramp') {
            inputAbbr = t.input_abbr_ramp;
        } else if (inputType === 'sinusoidal') {
            inputAbbr = t.input_abbr_sin;
        }
        let currentInputLabel = `${t.input_label_r} (${inputAbbr})`;
        
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
    
    const finalDatasets = [];
    if (inputDataset) {
        finalDatasets.push(inputDataset);
        currentInputDataset = inputDataset;
    } else {
        currentInputDataset = null;
    }
    finalDatasets.push(...allResponseDatasets);


    if (finalDatasets.length === 0) {
         chartInstance = new Chart(ctx, {
            type: 'line', 
            data: { datasets: [] }, 
            options: getChartOptions(t, allResponses.length) 
        });
        return;
    }
    
    chartInstance = new Chart(ctx, {
        type: 'line', 
        data: {
            datasets: finalDatasets
        },
        options: getChartOptions(t, allResponses.length) 
    });
}

function getChartOptions(t, numResponses) {
    return {
        responsive: true,
        maintainAspectRatio: false, 
        animation: false, 
        plugins: {
            backgroundColor: 'white', 
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
                    title: (context) => `${t.tooltip_time}${context[0].parsed.x.toFixed(2)}s`,
                    label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(3)}`
                }
            },
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
                type: 'linear', 
                title: {
                    display: true,
                    text: t.chart_x_axis
                },
                min: 0,
                max: DURATION, 
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20,
                    callback: function(value, index, ticks) {
                        return value.toFixed(1) + 's';
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

    // Ya no es necesario llamar a toggleSystemParams() o toggleControllerInputs() aquí
    // ya que setLanguage() llama a toggleInputParams(), updateDiagram() y toggleSystemParams(),
    // y updateDiagram() llama a renderStaticFT() y toggleControllerInputs() se llama dentro de setLanguage.
    
    renderChart([], allResponseDatasets, 'step'); 
};