// ============================================================================
// CONTROL-SIM v2 — Translations: English
// ============================================================================
window.LANG_EN = {

    // ── Document ──────────────────────────────────────────────────────────────
    document_title:         'Control Systems Simulator',
    title_main:             '⚙️ Control Systems Simulator',

    // ── Theme ─────────────────────────────────────────────────────────────────
    theme_btn_label:        'Change theme or colour',
    theme_section_mode:     'Mode',
    theme_auto:             'Auto (system)',
    theme_light:            'Light',
    theme_dark:             'Dark',
    theme_section_color:    'Colour',

    // ── Module: Loop ──────────────────────────────────────────────────────────
    mod_loop_title:         '🔁 Loop Type',
    btn_open_loop:          'Open Loop',
    btn_closed_loop:        'Closed Loop',

    // ── Module: Signal Generator ──────────────────────────────────────────────
    mod_input_title:        '📶 Signal Generator',
    input_type_label:       'Signal type:',
    input_step:             'Step',
    input_ramp:             'Ramp',
    input_sin:              'Sinusoidal',
    step_min_label:         'Initial value $R_0$:',
    step_max_label:         'Final value $R_1$:',
    ramp_slope_label:       'Slope $m$:',
    sin_amp_label:          'Amplitude $A$:',
    sin_freq_label:         'Frequency $\\omega$ (rad/s):',

    // ── Module: Controller ────────────────────────────────────────────────────
    mod_pid_title:          '🎛️ Controller',
    controller_type_label:  'Controller type:',
    controller_pid:         'PID',
    controller_onoff:       'On/Off',
    kc_label:               'Gain $K_c$:',
    ti_label:               'Integral Time $T_i$:',
    ti_inf_check:           '∞ (no integral)',
    tdc_label:              'Derivative Time $T_{d,c}$:',

    // ── Module: Process ───────────────────────────────────────────────────────
    mod_process_title:      '⚙️ Process',
    system_order_label:     'Order:',
    order_first:            '1st Order',
    order_second:           '2nd Order',
    kp_label:               'Gain $K_p$:',
    t1_label:               'Time Constant $T_1$ (s):',
    t2_label:               'Time Constant $T_2$ (s):',
    derived_title:          'Calculated parameters:',
    derived_wn:             'Natural freq. $\\omega_n$:',
    derived_zeta:           'Damping $\\zeta$:',
    derived_tau:            'Time constant $\\tau$:',

    // ── Module: Delay ─────────────────────────────────────────────────────────
    mod_delay_title:        '⏱️ Process Delay',
    td_label:               'Dead Time $T_d$ (s):',

    // ── Module: Feedback ──────────────────────────────────────────────────────
    mod_feedback_title:     '↩️ Feedback',
    feedback_type_label:    'Type:',
    feedback_unity:         'Unity $H(s)=1$',
    feedback_delay:         'With Delay',
    th_label:               'Delay $T_h$ (s):',

    // ── FT and diagram ────────────────────────────────────────────────────────
    ft_section_title:       'Equations',
    diagram_section_title:  'Block Diagram',
    ft_proc_title:          'Process $G_p(s)$',
    ft_pid_title:           'Controller $G_c(s)$',
    ft_open_loop_title:     'Open Loop $G(s)$',
    ft_closed_loop_title:   'Closed Loop $G_{LC}(s)$',
    ft_yt_label:            'Response $y(t)$',
    math_yt_overdamped:     'Overdamped',
    math_yt_critical:       'Critically damped',
    math_yt_underdamped:    'Underdamped',
    math_yt_2nd_complex_ramp: 'Ramp/sine for under/critical 2nd order — no closed-form available.',
    math_yt_cl_complex:     'No closed-form expression with PID, delay or non-unity feedback. Use numerical simulation.',

    // ── Buttons ───────────────────────────────────────────────────────────────
    button_simulate:        '➕ Simulate & Add',
    button_download_image:  '🖼️ Download PNG',
    button_download_data:   '📊 Download CSV',
    button_clear_responses: '🗑️ Clear Outputs',
    button_clear_all:       '🗑️ Clear All',

    // ── Chart ─────────────────────────────────────────────────────────────────
    chart_section_title:    'Time Response $Y(t)$',
    input_label_r:          'Input $R(t)$',
    abbr_step:              'Step',
    abbr_ramp:              'Ramp',
    abbr_sin:               'Sine',
    label_open_abbr:        'OL',
    label_closed_abbr:      'CL',
    chart_title_prefix:     'Time response — ',
    chart_title_suffix:     ' curve(s)',
    chart_empty_text:       'Configure modules and click "Simulate".',
    chart_y_axis:           'Y(t)',
    chart_x_axis:           'Time (s)',
    tooltip_time:           'Time: ',

    // ── Closed-loop derived parameters ───────────────────────────────────────
    cl_wn_label:            'ωn closed loop',
    cl_zeta_label:          'ζ closed loop',
    cl_tau_label:           'τ closed loop',
    cl_approx_note:         '(Approx. — delay/PID modifies the actual poles)',

    // ── Footer ────────────────────────────────────────────────────────────────
    credit_author:          'Made by Julián Hernández.',
    credit_description:     'Modular control systems simulator (Euler integration).',
};
