// ============================================================================
// CONTROL-SIM v2 — Itzulpenak: Euskara
// ============================================================================
window.LANG_EU = {

    // ── Dokumentua ───────────────────────────────────────────────────────────
    document_title:         'Kontrol Sistemen Simulagailua',
    title_main:             '⚙️ Kontrol Sistemen Simulagailua',

    // ── Gaia ─────────────────────────────────────────────────────────────────
    theme_btn_label:        'Gaia edo kolorea aldatu',
    theme_section_mode:     'Modua',
    theme_auto:             'Automatikoa (sistema)',
    theme_light:            'Argia',
    theme_dark:             'Iluna',
    theme_section_color:    'Kolorea',

    // ── Modulu: Begizta ───────────────────────────────────────────────────────
    mod_loop_title:         '🔁 Begizta mota',
    btn_open_loop:          'Begizta irekia',
    btn_closed_loop:        'Begizta itxia',

    // ── Modulu: Seinu-sorgailua ───────────────────────────────────────────────
    mod_input_title:        '📶 Seinu-sorgailua',
    input_type_label:       'Seinu mota:',
    input_step:             'Eskaloia',
    input_ramp:             'Rampa',
    input_sin:              'Sinusoidala',
    step_min_label:         'Hasierako balioa $R_0$:',
    step_max_label:         'Azken balioa $R_1$:',
    ramp_slope_label:       'Malda $m$:',
    sin_amp_label:          'Anplitudea $A$:',
    sin_freq_label:         'Maiztasuna $\\omega$ (rad/s):',

    // ── Modulu: Kontrolagailua ────────────────────────────────────────────────
    mod_pid_title:          '🎛️ Kontrolagailua',
    controller_type_label:  'Kontrolagailu mota:',
    controller_pid:         'PID',
    controller_onoff:       'On/Off',
    kc_label:               'Irabazia $K_c$:',
    ti_label:               'Denbora integrala $T_i$:',
    ti_inf_check:           '∞ (integralik gabe)',
    tdc_label:              'Denbora deribatuak $T_{d,c}$:',

    // ── Modulu: Prozesua ──────────────────────────────────────────────────────
    mod_process_title:      '⚙️ Prozesua',
    system_order_label:     'Ordena:',
    order_first:            'Lehen ordena',
    order_second:           'Bigarren ordena',
    kp_label:               'Irabazia $K_p$:',
    t1_label:               'Denbora-konstantea $T_1$ (s):',
    t2_label:               'Denbora-konstantea $T_2$ (s):',
    derived_title:          'Kalkulatutako parametroak:',
    derived_wn:             'Maiztasun naturala $\\omega_n$:',
    derived_zeta:           'Motigazioa $\\zeta$:',
    derived_tau:            'Denbora-konstantea $\\tau$:',

    // ── Modulu: Atzerapena ────────────────────────────────────────────────────
    mod_delay_title:        '⏱️ Prozesu-atzerapena',
    td_label:               'Denbora hila $T_d$ (s):',

    // ── Modulu: Errealimenua ──────────────────────────────────────────────────
    mod_feedback_title:     '↩️ Errealimenua',
    feedback_type_label:    'Mota:',
    feedback_unity:         'Unitarioa $H(s)=1$',
    feedback_delay:         'Atzerapen batekin',
    th_label:               'Atzerapena $T_h$ (s):',

    // ── TF eta diagrama ───────────────────────────────────────────────────────
    ft_section_title:       'Ekuazioak',
    diagram_section_title:  'Bloke-diagrama',
    ft_proc_title:          'Prozesua $G_p(s)$',
    ft_pid_title:           'Kontrolagailua $G_c(s)$',
    ft_open_loop_title:     'Begizta irekia $G(s)$',
    ft_closed_loop_title:   'Begizta itxia $G_{LC}(s)$',
    ft_yt_label:            'Erantzuna $y(t)$',
    math_yt_overdamped:     'Gainmotigatua',
    math_yt_critical:       'Muga-motiga',
    math_yt_underdamped:    'Azpimotigatua',
    math_yt_2nd_complex_ramp: 'Rampa/sinusoidal 2. ordenan — ez dago adierazpen analitikorik.',
    math_yt_cl_complex:     'PID/atzerapena/errealimenua ez-unitarioa — ez dago adierazpen itxirik. Erabili simulazio numerikoa.',

    // ── Botoiak ──────────────────────────────────────────────────────────────
    button_simulate:        '➕ Simulatu eta gehitu',
    button_download_image:  '🖼️ PNG deskargatu',
    button_download_data:   '📊 CSV deskargatu',
    button_clear_responses: '🗑️ Irteerak ezabatu',
    button_clear_all:       '🗑️ Dena ezabatu',

    // ── Grafika ───────────────────────────────────────────────────────────────
    chart_section_title:    'Denbora-erantzuna $Y(t)$',
    input_label_r:          'Sarrera $R(t)$',
    abbr_step:              'Eskaloia',
    abbr_ramp:              'Rampa',
    abbr_sin:               'Sinusoidala',
    label_open_abbr:        'BI',
    label_closed_abbr:      'BIT',
    chart_title_prefix:     'Denbora-erantzuna — ',
    chart_title_suffix:     ' kurba(k)',
    chart_empty_text:       'Moduluak konfiguratu eta "Simulatu" sakatu.',
    chart_y_axis:           'Y(t)',
    chart_x_axis:           'Denbora (s)',
    tooltip_time:           'Denbora: ',

    // ── Begizta itxiaren parametro eratorriak ─────────────────────────────────
    cl_wn_label:            'ωn begizta itxia',
    cl_zeta_label:          'ζ begizta itxia',
    cl_tau_label:           'τ begizta itxia',
    cl_approx_note:         '(Hurbilketa — atzerapena/PIDak benetako poloak aldatzen ditu)',

    // ── Oinorria ──────────────────────────────────────────────────────────────
    credit_author:          'Julián Hernándezek egina.',
    credit_description:     'Kontrol-sistemen simulagailu modularra (Euler eredua).',
};
