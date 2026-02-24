// ============================================================================
// CONTROL-SIM — Translations: English
// ============================================================================

window.LANG_EN = {

    // ── Document and header ──────────────────────────────────────────────────
    document_title:     'First and Second Order System Analysis',
    title_main:         '⚙️ Time Response of First and Second Order Systems',

    // ── Language selector ────────────────────────────────────────────────────
    language_label:     'Language',

    // ── Theme selector ───────────────────────────────────────────────────────
    theme_btn_label:    'Change theme or colour scheme',
    theme_section_mode: 'Mode',
    theme_auto:         'Auto (system)',
    theme_light:        'Light',
    theme_dark:         'Dark',
    theme_section_color:'Colour',
    theme_blue:         'Blue',
    theme_green:        'Green',
    theme_purple:       'Purple',
    theme_orange:       'Orange',
    theme_red:          'Red',

    // ── Titles and headers ───────────────────────────────────────────────────
    config_title:           '1. Loop Configuration',
    input_params_title:     '2. Input Type $R(s)$',
    controller_title:       'PID Controller ($G_c(s)$)',
    system_params_title:    '3. System Parameters ($G_p(s)$)',
    ft_title_static:        'Transfer Function (Formulas)',
    ft_diagram_title:       'Block Diagram',
    chart_title:            'System Time Response $Y(t)$',

    // ── Selectors ────────────────────────────────────────────────────────────
    loop_type_label:    'Loop Type:',
    loop_open:          'Open Loop',
    loop_closed:        'Closed Loop (PID Controller)',
    input_type_label:   'Input Type $R(s)$: ',
    input_step:         'Step',
    input_ramp:         'Ramp',
    input_sin:          'Sinusoidal',
    system_order_label: 'System Order:',
    order_first:        'First Order (FO)',
    order_second:       'Second Order (SO)',

    // ── Parameters ───────────────────────────────────────────────────────────
    step_min_label:     'Minimum Value ($R_{min}$):',
    step_max_label:     'Maximum Value ($R_{max}$):',
    ramp_slope_label:   'Slope ($m$):',
    sin_amp_label:      'Amplitude ($A$):',
    sin_freq_label:     'Frequency ($\\omega$):',
    kp_label:           'Gain ($K_p$) [0.1, 10]:',
    tau_label:          'Time Constant ($\\tau$) [0.1, 100]:',
    wn_label:           'Natural Frequency ($\\omega_n$) [0.1, 10]:',
    zeta_label:         'Damping Factor ($\\zeta$) [-5, 5]:',
    td_label:           'Physical Dead Time ($T_d$) [0.0, 20]:',
    kc_label:           'Control Gain ($K_c$) [0.1, 100]:',
    ti_label:           'Integral Time ($T_i$) [0.001, $\\approx\\infty$]:',
    tdc_label:          'Derivative Time ($T_{d,c}$) [0.0, 100]:',

    // ── Static formulas ──────────────────────────────────────────────────────
    ft_proc_title:          'T.F. Process ($G_p(s)$):',
    ft_cont_title_latex:    'Controller Transfer Function $G_c(s)$ (PID):',
    ft_closed_loop_title:   'T.F. Closed Loop (General):',
    ft_open_loop_title:     'T.F. Open Loop (General):',

    // ── Buttons ──────────────────────────────────────────────────────────────
    button_simulate:         '➕ Simulate and Add Line',
    button_download_image:   '🖼️ Download Chart (PNG)',
    button_download_data:    '📊 Download Data (CSV)',
    button_clear_responses:  '🗑️ Clear Outputs $Y(t)$',
    button_clear_all:        '🗑️ Clear All',

    // ── Legend and axes ──────────────────────────────────────────────────────
    input_label_r:              'Input $R(t)$',
    input_abbr_step:            'Step',
    input_abbr_ramp:            'Ramp',
    input_abbr_sin:             'Sinusoidal',
    label_open_loop_abbr:       'Open Loop',
    label_closed_loop_abbr:     'Closed Loop',
    label_first_order_abbr:     'FO',
    label_second_order_abbr:    'SO',
    chart_title_sim_prefix:     'Time Response with ',
    chart_title_sim_suffix:     ' Simulations',
    chart_empty_text:           'Simulate a response to see the chart here.',
    chart_y_axis:               'Response $Y(t)$',
    chart_x_axis:               'Time ($s$)',
    tooltip_time:               'Time: ',

    // ── Block diagram ────────────────────────────────────────────────────────
    diagram_title_open:     'Block Diagram (Open Loop)',
    diagram_title_closed:   'Block Diagram (Closed Loop - PID Controller)',
    diagram_delay_block:    'Delay $T_d$',
    diagram_feedback_block: '$H(s)=1$',

    // ── Footer ───────────────────────────────────────────────────────────────
    credit_author:      'Made by Julián Hernández.',
    credit_description: 'Simulation tool based on the Euler model for control system analysis.',
    credit_no_data:     '',
};
