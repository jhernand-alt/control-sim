# ⚙️ Simulador de Respuesta Temporal de Sistemas de Control (Primer y Segundo Orden)

Este proyecto es una aplicación web interactiva diseñada para simular y visualizar la **respuesta temporal** de sistemas de control en lazo abierto y lazo cerrado. Permite a ingenieros, estudiantes y entusiastas de la automática experimentar con los efectos de los parámetros del sistema (ganancia, constante de tiempo, frecuencia natural, etc.) y los controladores PID en la dinámica de sistemas de **Primer y Segundo Orden (FO/SO)**.

---

## 🚀 Características Principales

* **Tipos de Sistemas:** Simulación de sistemas de **Primer Orden (FO)** y **Segundo Orden (SO)**.
* **Configuración de Lazo:** Soporte para **Lazo Abierto** y **Lazo Cerrado** con un controlador **PID**.
* **Entradas Comunes:** Generación de respuestas para entradas tipo **Escalón**, **Rampa** y **Senoidal**.
* **Modelado de Retardo:** Inclusión de **Tiempo Muerto ($T_d$)** en la simulación.
* **Visualización Interactiva:** Gráfico en tiempo real que permite añadir múltiples curvas de respuesta para comparar diferentes configuraciones.
* **Fórmulas Claras:** Muestra las funciones de transferencia ($G_p(s)$ y $G_c(s)$) correspondientes al orden y configuración de lazo seleccionados, renderizadas mediante **LaTeX (MathJax)**.
* **Exportación de Datos:** Funcionalidad para descargar la gráfica (PNG) y los datos de la simulación (CSV).
* **Multilenguaje:** Soporte para **español (es)** e **inglés (en)**.

---

## 🛠️ Estructura del Proyecto

El proyecto está construido principalmente con tecnologías web estándar:

* **`index.html`**: Estructura principal de la aplicación.
* **`style.css`**: Estilos y apariencia visual.
* **`script.js`**: Contiene toda la lógica de simulación (modelo de Euler), la gestión de la interfaz y las interacciones con Chart.js y MathJax.
* **`lib/`**: Directorio para librerías externas.
    * `chart.min.js`: Librería para la generación de gráficos.
    * `mathjax-config.js`: Configuración del motor de renderizado LaTeX.
* **`lang/`**: Directorio con los archivos de traducción.
    * `es.js`: Traducciones al español.
    * `en.js`: Traducciones al inglés.

---

## ⚙️ Parámetros de Simulación

Los usuarios pueden configurar los siguientes parámetros:

### 1. Sistema ($G_p(s)$)

| Parámetro | Símbolo | Descripción | Rango Típico |
| :--- | :--- | :--- | :--- |
| **Ganancia** | $K_p$ | Ganancia estática del proceso. | [0.1, 10] |
| **Constante de Tiempo** | $\tau$ | (Solo FO) Velocidad de respuesta. | [0.1, 100] |
| **Frecuencia Natural** | $\omega_n$ | (Solo SO) Frecuencia de oscilación libre. | [0.1, 10] |
| **Factor de Amortiguamiento** | $\zeta$ | (Solo SO) Define el tipo de respuesta (subamortiguada, sobreamortiguada, etc.). | [-5, 5] |
| **Tiempo Muerto** | $T_d$ | Retardo físico de la señal de salida. | [0.0, 20] |

### 2. Controlador PID ($G_c(s)$ - Solo Lazo Cerrado)

La función de transferencia del controlador utilizada es la forma **ideal PID**:
$$G_c(s) = K_c \left(1 + \frac{1}{T_i s} + T_{d,c} s\right)$$

| Parámetro | Símbolo | Descripción | Rango Típico |
| :--- | :--- | :--- | :--- |
| **Ganancia de Control** | $K_c$ | Ganancia proporcional del controlador. | [0.1, 100] |
| **Tiempo Integral** | $T_i$ | Tiempo de acción integral (residuos). | [0.001, $\approx\infty$] |
| **Tiempo Derivativo** | $T_{d,c}$ | Tiempo de acción derivativa (predicción). | [0.0, 100] |

---

## 💻 Uso y Despliegue

### Requisitos

* Un navegador web moderno (Chrome, Firefox, Edge, etc.).

### Ejecución

Dado que la aplicación está construida enteramente con HTML, CSS y JavaScript vainilla, puede ser ejecutada de dos maneras:

1.  **Directamente desde el Archivo:** Simplemente abre el archivo `index.html` en tu navegador web.
2.  **Servidor Local:** Para evitar posibles restricciones de seguridad del navegador, se recomienda servir la carpeta del proyecto a través de un servidor web local (por ejemplo, usando la extensión "Live Server" en VS Code, o con `python -m http.server`).

---

## 🗺️ Diagrama de Bloques

El simulador se basa en el siguiente diagrama para la configuración de **Lazo Cerrado con Realimentación Unitaria** y compensación de Retardo:

R(s) ---> (+) ---> [ Gc(s) ] ---> [ Gp(s) ] ---> [ Retardo Td ] ---> Y(s) ^ | |--------------------[ H(s)=1 ]-----------------


---

## 📝 Notas del Desarrollador

### Integración de MathJax

Para asegurar que los símbolos matemáticos complejos (como $\omega_n$, $\zeta$, $G_c(s)$, etc.) se muestren correctamente fuera del área de fórmulas, se ha añadido la función `MathJax.typeset()` a los *event listeners* clave en `script.js` (especialmente `setLanguage` y `toggleSystemParams`). Esto garantiza el renderizado consistente de LaTeX en títulos y etiquetas de parámetros.

### Método de Simulación

La respuesta temporal se calcula mediante un método numérico de discretización (aproximación del **Modelo de Euler**) aplicado a las ecuaciones diferenciales que describen los sistemas de primer y segundo orden en función de la entrada controlada $U_c$.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT** (o la que decidas aplicar).