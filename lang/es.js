const translations_es = {
    // TÍTULOS Y CABECERAS
    'document_title': 'Análisis de Sistemas de Primer y Segundo Orden',
    'title_main': '⚙️ Respuesta Temporal de Sistemas de Primer y Segundo Orden',
    'config_title': '1. Configuración de Lazo',
    'input_params_title': '2. Tipo de Entrada $R(s)$',
    'controller_title': 'Controlador **PID** ($G_c(s)$)',
    'system_params_title': '3. Parámetros del Sistema ($G_p(s)$)',
    'ft_title_static': 'Función de Transferencia (Fórmulas)',
    'ft_diagram_title': 'Diagrama de Bloques',
    'chart_title': 'Respuesta Temporal del Sistema $Y(t)$',
    'credit': 'Herramienta de simulación por el modelo de Euler para el análisis de sistemas de control.',

    // SELECTORES
    'loop_type_label': 'Tipo de Lazo:',
    'loop_open': 'Lazo Abierto',
    'loop_closed': 'Lazo Cerrado (Controlador PID)',
    'input_type_label': 'Tipo de Entrada $R(s)$: ',
    'input_step': 'Escalón (Step)',
    'input_ramp': 'Rampa',
    'input_sin': 'Senoidal (Seno)',
    'system_order_label': 'Orden del Sistema:',
    'order_first': 'Primer Orden (FO)',
    'order_second': 'Segundo Orden (SO)',

    // PARÁMETROS
    // Entradas
    'step_min_label': 'Valor Mínimo ($R_{min}$):',
    'step_max_label': 'Valor Máximo ($R_{max}$):',
    'ramp_slope_label': 'Pendiente ($m$):',
    'sin_amp_label': 'Amplitud ($A$):',
    'sin_freq_label': 'Frecuencia ($\omega$):',
    // Proceso
    'kp_label': 'Ganancia ($K_p$) [0.1, 10]:',
    'tau_label': 'Constante de Tiempo ($\tau$) [0.1, 100]:',
    'wn_label': 'Frecuencia Natural ($\omega_n$) [0.1, 10]:',
    'zeta_label': 'Factor de Amort. ($\zeta$) [-5, 5]:',
    'td_label': 'Tiempo Muerto Físico ($T_d$) [0.0, 20]:',
    // Controlador
    'kc_label': 'Ganancia Control ($K_c$) [0.1, 100]:',
    'ti_label': 'Tiempo Integral ($T_i$) [0.001, $\\approx\\infty$]:',
    'tdc_label': 'Tiempo Derivativo ($T_{d,c}$) [0.0, 100]:',

    // FÓRMULAS ESTÁTICAS
    'ft_proc_title': 'F.T. Proceso ($G_p(s)$):',
    'ft_cont_title_latex': 'Función de Transferencia del Controlador $G_c(s)$ (PID):',
    'ft_closed_loop_title': 'F.T. Lazo Cerrado (General):',
    'ft_open_loop_title': 'F.T. Lazo Abierto (General):',

    // BOTONES
    'button_simulate': '➕ Simular y Añadir Línea',
    'button_download_image': '🖼️ Descargar Gráfica (PNG)',
    'button_download_data': '📊 Descargar Datos (CSV)',
    'button_clear_responses': '🗑️ Borrar Salidas $Y(t)$',
    'button_clear_all': '🗑️ Borrar Todo',

    // ETIQUETAS DE LEYENDA Y EJE
    'input_label_r': 'Entrada $R(t)$',
    'input_abbr_step': 'Escalón',
    'input_abbr_ramp': 'Rampa',
    'input_abbr_sin': 'Seno',
    'label_open_loop_abbr': 'Lazo Abierto',
    'label_closed_loop_abbr': 'Lazo Cerrado',
    'label_first_order_abbr': 'FO',
    'label_second_order_abbr': 'SO',
    'chart_title_sim_prefix': 'Respuesta Temporal con ',
    'chart_title_sim_suffix': ' Simulaciones',
    'chart_empty_text': 'Simule una respuesta para ver el gráfico aquí.',
    'chart_y_axis': 'Respuesta $Y(t)$',
    'chart_x_axis': 'Tiempo ($s$)',
    'tooltip_time': 'Tiempo: ',
    
    // DIAGRAMA DE BLOQUES
    'diagram_title_open': 'Diagrama de Bloques (Lazo Abierto)',
    'diagram_title_closed': 'Diagrama de Bloques (Lazo Cerrado - Controlador PID)',
    'diagram_delay_block': 'Retardo $T_d$',
    'diagram_feedback_block': '$H(s)=1$',
};