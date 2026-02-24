// ============================================================================
// CONTROL-SIM — Itzulpenak: Euskara
// ============================================================================

window.LANG_EU = {

    // ── Dokumentua eta goiburua ──────────────────────────────────────────────
    document_title:     'Lehen eta Bigarren Ordenako Sistemen Analisia',
    title_main:         '⚙️ Lehen eta Bigarren Ordenako Sistemen Denbora-erantzuna',

    // ── Hizkuntza-hautatzailea ───────────────────────────────────────────────
    language_label:     'Hizkuntza',

    // ── Gai-hautatzailea ─────────────────────────────────────────────────────
    theme_btn_label:    'Gaia edo kolore-eskema aldatu',
    theme_section_mode: 'Modua',
    theme_auto:         'Automatikoa (sistema)',
    theme_light:        'Argia',
    theme_dark:         'Iluna',
    theme_section_color:'Kolorea',
    theme_blue:         'Urdina',
    theme_green:        'Berdea',
    theme_purple:       'Morea',
    theme_orange:       'Laranja',
    theme_red:          'Gorria',

    // ── Izenburuak ───────────────────────────────────────────────────────────
    config_title:           '1. Begizta-konfigurazioa',
    input_params_title:     '2. Sarrera mota $R(s)$',
    controller_title:       'PID Kontrolagailua ($G_c(s)$)',
    system_params_title:    '3. Sistemaren parametroak ($G_p(s)$)',
    ft_title_static:        'Transferentzia-funtzioa (Formulak)',
    ft_diagram_title:       'Bloke-diagrama',
    chart_title:            'Sistemaren denbora-erantzuna $Y(t)$',

    // ── Hautatzaileak ────────────────────────────────────────────────────────
    loop_type_label:    'Begizta mota:',
    loop_open:          'Begizta irekia',
    loop_closed:        'Begizta itxia (PID kontrolagailua)',
    input_type_label:   'Sarrera mota $R(s)$: ',
    input_step:         'Eskaloia',
    input_ramp:         'Rampa',
    input_sin:          'Sinusoidala',
    system_order_label: 'Sistemaren ordena:',
    order_first:        'Lehen ordena (LO)',
    order_second:       'Bigarren ordena (BO)',

    // ── Parametroak ──────────────────────────────────────────────────────────
    step_min_label:     'Gutxieneko balioa ($R_{min}$):',
    step_max_label:     'Gehieneko balioa ($R_{max}$):',
    ramp_slope_label:   'Malda ($m$):',
    sin_amp_label:      'Anplitudea ($A$):',
    sin_freq_label:     'Maiztasuna ($\\omega$):',
    kp_label:           'Irabazia ($K_p$) [0.1, 10]:',
    tau_label:          'Denbora-konstantea ($\\tau$) [0.1, 100]:',
    wn_label:           'Maiztasun naturala ($\\omega_n$) [0.1, 10]:',
    zeta_label:         'Motigazioaren faktorea ($\\zeta$) [-5, 5]:',
    td_label:           'Fisikoko denbora hila ($T_d$) [0.0, 20]:',
    kc_label:           'Kontrol-irabazia ($K_c$) [0.1, 100]:',
    ti_label:           'Denbora integrala ($T_i$) [0.001, $\\approx\\infty$]:',
    tdc_label:          'Denbora deribatuak ($T_{d,c}$) [0.0, 100]:',

    // ── Formula estatikoak ───────────────────────────────────────────────────
    ft_proc_title:          'T.F. Prozesua ($G_p(s)$):',
    ft_cont_title_latex:    'Kontrolagailuaren transferentzia-funtzioa $G_c(s)$ (PID):',
    ft_closed_loop_title:   'T.F. Begizta itxia (Orokorra):',
    ft_open_loop_title:     'T.F. Begizta irekia (Orokorra):',

    // ── Botoiak ──────────────────────────────────────────────────────────────
    button_simulate:         '➕ Simulatu eta lerroa gehitu',
    button_download_image:   '🖼️ Deskargatu grafika (PNG)',
    button_download_data:    '📊 Deskargatu datuak (CSV)',
    button_clear_responses:  '🗑️ Ezabatu irteerak $Y(t)$',
    button_clear_all:        '🗑️ Dena ezabatu',

    // ── Kondaira eta ardatzak ─────────────────────────────────────────────────
    input_label_r:              'Sarrera $R(t)$',
    input_abbr_step:            'Eskaloia',
    input_abbr_ramp:            'Rampa',
    input_abbr_sin:             'Sinusoidala',
    label_open_loop_abbr:       'Begizta irekia',
    label_closed_loop_abbr:     'Begizta itxia',
    label_first_order_abbr:     'LO',
    label_second_order_abbr:    'BO',
    chart_title_sim_prefix:     'Denbora-erantzuna ',
    chart_title_sim_suffix:     ' simulaziorekin',
    chart_empty_text:           'Simulatu erantzun bat hemen grafikoa ikusteko.',
    chart_y_axis:               'Erantzuna $Y(t)$',
    chart_x_axis:               'Denbora ($s$)',
    tooltip_time:               'Denbora: ',

    // ── Bloke-diagrama ───────────────────────────────────────────────────────
    diagram_title_open:     'Bloke-diagrama (Begizta irekia)',
    diagram_title_closed:   'Bloke-diagrama (Begizta itxia - PID kontrolagailua)',
    diagram_delay_block:    'Atzerapena $T_d$',
    diagram_feedback_block: '$H(s)=1$',

    // ── Oinorria ─────────────────────────────────────────────────────────────
    credit_author:      'Julián Hernándezek egina.',
    credit_description: 'Kontrol-sistemen analisirako Euler ereduaren simulazio-tresna.',
    credit_no_data:     '',
};
