// ============================================================================
// CONTROL-SIM v2 — Traducciones: Español
// ============================================================================
window.LANG_ES = {

    // ── Documento ────────────────────────────────────────────────────────────
    document_title:         'Simulador de Sistemas de Control',
    title_main:             '⚙️ Simulador de Sistemas de Control',

    // ── Tema ─────────────────────────────────────────────────────────────────
    theme_btn_label:        'Cambiar tema o color',
    theme_section_mode:     'Modo',
    theme_auto:             'Auto (sistema)',
    theme_light:            'Claro',
    theme_dark:             'Oscuro',
    theme_section_color:    'Color',

    // ── Módulo: Lazo ─────────────────────────────────────────────────────────
    mod_loop_title:         '🔁 Tipo de Lazo',
    btn_open_loop:          'Lazo Abierto',
    btn_closed_loop:        'Lazo Cerrado',

    // ── Módulo: Generador de señal ────────────────────────────────────────────
    mod_input_title:        '📶 Generador de Señal',
    input_type_label:       'Tipo de señal:',
    input_step:             'Escalón',
    input_ramp:             'Rampa',
    input_sin:              'Senoidal',
    step_min_label:         'Valor inicial $R_0$:',
    step_max_label:         'Valor final $R_1$:',
    ramp_slope_label:       'Pendiente $m$:',
    sin_amp_label:          'Amplitud $A$:',
    sin_freq_label:         'Frecuencia $\\omega$ (rad/s):',

    // ── Módulo: Controlador ───────────────────────────────────────────────────
    mod_pid_title:          '🎛️ Controlador',
    controller_type_label:  'Tipo de controlador:',
    controller_pid:         'PID',
    controller_onoff:       'On/Off',
    kc_label:               'Ganancia $K_c$:',
    ti_label:               'Tiempo Integral $T_i$:',
    ti_inf_check:           '∞ (sin integral)',
    tdc_label:              'T. Derivativo $T_{d,c}$:',

    // ── Módulo: Proceso ───────────────────────────────────────────────────────
    mod_process_title:      '⚙️ Proceso',
    system_order_label:     'Orden:',
    order_first:            '1er Orden',
    order_second:           '2º Orden',
    kp_label:               'Ganancia $K_p$:',
    t1_label:               'Const. de Tiempo $T_1$ (s):',
    t2_label:               'Const. de Tiempo $T_2$ (s):',
    derived_title:          'Parámetros calculados:',
    derived_wn:             'Frec. natural $\\omega_n$:',
    derived_zeta:           'Amortiguamiento $\\zeta$:',
    derived_tau:            'Constante de tiempo $\\tau$:',

    // ── Módulo: Retardo ───────────────────────────────────────────────────────
    mod_delay_title:        '⏱️ Retardo de Proceso',
    td_label:               'Tiempo Muerto $T_d$ (s):',

    // ── Módulo: Realimentación ────────────────────────────────────────────────
    mod_feedback_title:     '↩️ Realimentación',
    feedback_type_label:    'Tipo:',
    feedback_unity:         'Unitaria $H(s)=1$',
    feedback_delay:         'Con Retardo',
    th_label:               'Retardo $T_h$ (s):',

    // ── FT y diagrama ─────────────────────────────────────────────────────────
    ft_section_title:       'Ecuaciones',
    diagram_section_title:  'Diagrama de Bloques',
    ft_proc_title:          'Proceso $G_p(s)$',
    ft_pid_title:           'Controlador $G_c(s)$',
    ft_open_loop_title:     'Lazo Abierto $G(s)$',
    ft_closed_loop_title:   'Lazo Cerrado $G_{LC}(s)$',
    ft_yt_label:            'Respuesta $y(t)$',
    math_yt_overdamped:     'Sobreamortiguado',
    math_yt_critical:       'Críticamente amortiguado',
    math_yt_underdamped:    'Subamortiguado',
    math_yt_2nd_complex_ramp: 'Rampa/seno en 2º orden sub/crítico — no disponible analíticamente.',
    math_yt_cl_complex:     'Con PID, retardo o realim. no unitaria no existe expresión analítica cerrada. Usa la simulación numérica.',

    // ── Botones ──────────────────────────────────────────────────────────────
    button_simulate:        '➕ Simular y Añadir',
    button_download_image:  '🖼️ Descargar PNG',
    button_download_data:   '📊 Descargar CSV',
    button_clear_responses: '🗑️ Borrar Salidas',
    button_clear_all:       '🗑️ Borrar Todo',

    // ── Gráfica ───────────────────────────────────────────────────────────────
    chart_section_title:    'Respuesta Temporal $Y(t)$',
    input_label_r:          'Entrada $R(t)$',
    abbr_step:              'Escalón',
    abbr_ramp:              'Rampa',
    abbr_sin:               'Seno',
    label_open_abbr:        'LA',
    label_closed_abbr:      'LC',
    chart_title_prefix:     'Respuesta temporal — ',
    chart_title_suffix:     ' curva(s)',
    chart_empty_text:       'Configure los módulos y pulse "Simular".',
    chart_y_axis:           'Y(t)',
    chart_x_axis:           'Tiempo (s)',
    tooltip_time:           'Tiempo: ',

    // ── Parámetros derivados del lazo cerrado ─────────────────────────────────
    cl_wn_label:            'ωn lazo cerrado',
    cl_zeta_label:          'ζ lazo cerrado',
    cl_tau_label:           'τ lazo cerrado',
    cl_approx_note:         '(Aprox. — el retardo/PID modifica los polos reales)',

    // ── Pie de página ─────────────────────────────────────────────────────────
    credit_author:          'Hecho por Julián Hernández.',
    credit_description:     'Simulador modular de sistemas de control (integración de Euler).',
};
