// ============================================================================
// CONTROL-SIM — Traducciones: Español (España)
// ============================================================================

window.LANG_ES = {

    // ── Documento y cabecera ─────────────────────────────────────────────────
    document_title:     'Análisis de Sistemas de Primer y Segundo Orden',
    title_main:         '⚙️ Respuesta Temporal de Sistemas de Primer y Segundo Orden',

    // ── Selector de idioma ───────────────────────────────────────────────────
    language_label:     'Idioma',

    // ── Selector de tema ─────────────────────────────────────────────────────
    theme_btn_label:    'Cambiar tema o esquema de color',
    theme_section_mode: 'Modo',
    theme_auto:         'Auto (sistema)',
    theme_light:        'Claro',
    theme_dark:         'Oscuro',
    theme_section_color:'Color',
    theme_blue:         'Azul',
    theme_green:        'Verde',
    theme_purple:       'Púrpura',
    theme_orange:       'Naranja',
    theme_red:          'Rojo',

    // ── Títulos y cabeceras ──────────────────────────────────────────────────
    config_title:           '1. Configuración de Lazo',
    input_params_title:     '2. Tipo de Entrada $R(s)$',
    controller_title:       'Controlador **PID** ($G_c(s)$)',
    system_params_title:    '3. Parámetros del Sistema ($G_p(s)$)',
    ft_title_static:        'Función de Transferencia (Fórmulas)',
    ft_diagram_title:       'Diagrama de Bloques',
    chart_title:            'Respuesta Temporal del Sistema $Y(t)$',

    // ── Selectores ───────────────────────────────────────────────────────────
    loop_type_label:    'Tipo de Lazo:',
    loop_open:          'Lazo Abierto',
    loop_closed:        'Lazo Cerrado (Controlador PID)',
    input_type_label:   'Tipo de Entrada $R(s)$: ',
    input_step:         'Escalón (Step)',
    input_ramp:         'Rampa',
    input_sin:          'Senoidal (Seno)',
    system_order_label: 'Orden del Sistema:',
    order_first:        'Primer Orden (FO)',
    order_second:       'Segundo Orden (SO)',

    // ── Parámetros ───────────────────────────────────────────────────────────
    step_min_label:     'Valor Mínimo ($R_{min}$):',
    step_max_label:     'Valor Máximo ($R_{max}$):',
    ramp_slope_label:   'Pendiente ($m$):',
    sin_amp_label:      'Amplitud ($A$):',
    sin_freq_label:     'Frecuencia ($\\omega$):',
    kp_label:           'Ganancia ($K_p$) [0.1, 10]:',
    tau_label:          'Constante de Tiempo ($\\tau$) [0.1, 100]:',
    wn_label:           'Frecuencia Natural ($\\omega_n$) [0.1, 10]:',
    zeta_label:         'Factor de Amort. ($\\zeta$) [-5, 5]:',
    td_label:           'Tiempo Muerto Físico ($T_d$) [0.0, 20]:',
    kc_label:           'Ganancia Control ($K_c$) [0.1, 100]:',
    ti_label:           'Tiempo Integral ($T_i$) [0.001, $\\approx\\infty$]:',
    tdc_label:          'Tiempo Derivativo ($T_{d,c}$) [0.0, 100]:',

    // ── Fórmulas estáticas ───────────────────────────────────────────────────
    ft_proc_title:          'F.T. Proceso ($G_p(s)$):',
    ft_cont_title_latex:    'Función de Transferencia del Controlador $G_c(s)$ (PID):',
    ft_closed_loop_title:   'F.T. Lazo Cerrado (General):',
    ft_open_loop_title:     'F.T. Lazo Abierto (General):',

    // ── Botones ──────────────────────────────────────────────────────────────
    button_simulate:         '➕ Simular y Añadir Línea',
    button_download_image:   '🖼️ Descargar Gráfica (PNG)',
    button_download_data:    '📊 Descargar Datos (CSV)',
    button_clear_responses:  '🗑️ Borrar Salidas $Y(t)$',
    button_clear_all:        '🗑️ Borrar Todo',

    // ── Leyenda y ejes ───────────────────────────────────────────────────────
    input_label_r:              'Entrada $R(t)$',
    input_abbr_step:            'Escalón',
    input_abbr_ramp:            'Rampa',
    input_abbr_sin:             'Seno',
    label_open_loop_abbr:       'Lazo Abierto',
    label_closed_loop_abbr:     'Lazo Cerrado',
    label_first_order_abbr:     'FO',
    label_second_order_abbr:    'SO',
    chart_title_sim_prefix:     'Respuesta Temporal con ',
    chart_title_sim_suffix:     ' Simulaciones',
    chart_empty_text:           'Simule una respuesta para ver el gráfico aquí.',
    chart_y_axis:               'Respuesta $Y(t)$',
    chart_x_axis:               'Tiempo ($s$)',
    tooltip_time:               'Tiempo: ',

    // ── Diagrama de bloques ──────────────────────────────────────────────────
    diagram_title_open:     'Diagrama de Bloques (Lazo Abierto)',
    diagram_title_closed:   'Diagrama de Bloques (Lazo Cerrado - Controlador PID)',
    diagram_delay_block:    'Retardo $T_d$',
    diagram_feedback_block: '$H(s)=1$',

    // ── Pie de página ────────────────────────────────────────────────────────
    credit_author:      'Hecho por Julián Hernández.',
    credit_description: 'Herramienta de simulación por el modelo de Euler para el análisis de sistemas de control.',
    credit_no_data:     '',
};
