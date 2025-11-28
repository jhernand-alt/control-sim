# ⚙️ Simulador de Respuesta Temporal de Sistemas de Control (FO y SO)

Una herramienta interactiva y multilingüe para el análisis de la respuesta temporal de sistemas de control de Primer y Segundo Orden, tanto en Lazo Abierto como en Lazo Cerrado (con controlador PID).

---

## 🌟 Características Principales

Este simulador permite a estudiantes e ingenieros de control explorar el impacto de los parámetros del sistema y del controlador en la respuesta transitoria y en estado estacionario.

### 📈 Simulación Avanzada
* **Sistemas Dinámicos:** Soporte para simulación de **Sistemas de Primer Orden (FO)** y **Sistemas de Segundo Orden (SO)**.
* **Tipos de Lazo:** Simulación en **Lazo Abierto** o en **Lazo Cerrado** mediante un controlador PID.
* **Entradas Comunes:** Analice la respuesta ante entradas de **Escalón (Step)**, **Rampa** y **Senoidal (Seno)**.
* **Retardo:** Inclusión de **Tiempo Muerto Físico ($T_d$)** en la respuesta del proceso.

### 📉 Análisis de Estabilidad
* **Factor de Amortiguamiento Negativo ($\zeta < 0$):** Se permite introducir valores negativos de $\zeta$ para simular y estudiar explícitamente el comportamiento de sistemas **inestables** con respuesta divergente.
* **Comportamiento Crítico:** Permite simular el sistema no amortiguado ($\zeta = 0$).

### 🌐 Soporte Multilingüe
* **Traducción en Tiempo Real:** Selector simple de idioma (**Español/English**) ubicado en la esquina superior derecha, que traduce de manera dinámica toda la interfaz y los textos de la gráfica.

### 🖼️ Documentación en Pantalla
* Visualización de la **Función de Transferencia (FT)** del sistema (en Lazo Abierto o Cerrado).
* Diagrama de **Bloques Funcional** actualizado según la selección del tipo de lazo.

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 / CSS3:** Estructura y estilos de la interfaz de usuario.
* **JavaScript (Puro):**
    * **Simulación Numérica:** Implementación del algoritmo de simulación temporal (Euler Forward).
    * **Controladores:** Lógica para la acción Proporcional, Integral y Derivativa (PID).
    * **i18n:** Lógica para la traducción y cambio de idioma dinámico.
* **Chart.js:** Biblioteca para la generación de gráficos de respuesta temporal.
* **MathJax:** Renderizado de ecuaciones matemáticas (LaTeX) para las Funciones de Transferencia.

---

## 🚀 Uso e Interfaz

La aplicación se ejecuta completamente en el navegador y no requiere instalación. Simplemente abra el archivo `index.html`.

### 1. Parámetros del Sistema ($G_p(s)$)
Seleccione el **Orden del Sistema** y ajuste sus parámetros clave:
* **Primer Orden (FO):**
    * Ganancia ($K_p$)
    * Constante de Tiempo ($\tau$)
* **Segundo Orden (SO):**
    * Ganancia ($K_p$)
    * Frecuencia Natural ($\omega_n$)
    * **Factor de Amortiguamiento ($\zeta$):** Se acepta el rango **[-5, 5]**.

### 2. Controlador PID ($G_c(s)$)
Aparece solo si selecciona **"Lazo Cerrado"** como tipo de lazo.
* Ganancia de Control ($K_c$)
* Tiempo Integral ($T_i$): Si $T_i \to \infty$ (valor alto, p. ej., `999999.0`), el controlador actúa como **P** o **PD**.
* Tiempo Derivativo ($T_{d,c}$)

### 3. Simulación y Visualización
1.  Configure los parámetros de la **Entrada** ($R(s)$) (Escalón, Rampa o Senoidal).
2.  Pulse el botón **`➕ Simular y Añadir Línea`** para ejecutar la simulación y agregar la respuesta **$Y(t)$** al gráfico.
3.  El gráfico permite superponer múltiples respuestas para comparar diferentes configuraciones.
4.  Utilice **`🗑️ Borrar Salidas Y(t)`** para mantener solo la señal de entrada **$R(t)$** y **`🗑️ Borrar Todo`** para limpiar completamente el gráfico.

---

## ⚠️ Nota sobre la Simulación

La simulación se realiza mediante el método numérico de **Euler Forward** con un paso de tiempo de **$0.01$ segundos**. Aunque es rápido y sencillo, debe tenerse en cuenta que los sistemas inestables (como los de $\zeta < 0$ o lazos cerrados mal sintonizados) o los sistemas muy rápidos (con $\omega_n$ o $K_c$ altos) pueden requerir un paso de tiempo menor para una precisión total.