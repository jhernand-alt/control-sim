# ⚙️ Respuesta Temporal de Sistemas de Primer y Segundo Orden

Este proyecto es una herramienta de simulación interactiva diseñada para analizar la respuesta temporal de sistemas dinámicos de primer y segundo orden. Permite experimentar con lazos abiertos y cerrados (con control PID), diferentes tipos de entradas y la incorporación de tiempo muerto físico ($T_d$).

## 🚀 Características Principales

* **Sistemas Dinámicos:** Simulación de sistemas de **Primer Orden (FO)** y **Segundo Orden (SO)**.
* **Tipos de Lazo:** Simulación en **Lazo Abierto** o **Lazo Cerrado** con un controlador **PID** sintonizable ($G_c(s)$).
* **Entradas Comunes:** Soporte para entradas de **Escalón**, **Rampa** y **Senoidal** ($R(s)$).
* **Parámetros Físicos:** Inclusión de **Tiempo Muerto Físico ($T_d$)** en lazo abierto y cerrado.
* **Visualización:** Gráficas de respuesta temporal **Y(t)** dinámicas con Chart.js.
* **Documentación Matemática:** Visualización de la **Función de Transferencia (FT)** del sistema y del controlador con MathJax.
* **Internacionalización (i18n):** Soporte para **Español (ES)** e **Inglés (EN)**, con todas las etiquetas y diagramas traducidos.
* **Exportación:** Descarga de la gráfica como imagen (PNG) y de los datos crudos de la simulación (CSV).

## 🗂️ Estructura del Proyecto

La estructura de archivos ha sido organizada para separar el código de simulación del código de traducción: