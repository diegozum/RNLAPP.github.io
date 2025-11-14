// --- LÓGICA DE DEMO (SIMULACIÓN DE ESTADO) ---
const circulo = document.getElementById('status-circle');
const mensaje = document.getElementById('status-message');
const textoEstado = document.querySelector('.status-text');
const btnRegistrar = document.getElementById('btn-register-change');

function setEstado(estado) {
    // Es posible que los elementos no existan si esta función se llama demasiado pronto, 
    // por eso la movemos al DOMContentLoaded.
    if (!circulo || !textoEstado || !mensaje) return; 

    circulo.classList.remove('optimo', 'alerta', 'peligro');
    textoEstado.classList.remove('optimo', 'alerta', 'peligro');

    if (estado === 'optimo') {
        circulo.classList.add('optimo');
        textoEstado.classList.add('optimo');
        circulo.innerText = "100%";
        mensaje.innerText = "Óptimo";
    } else if (estado === 'alerta') {
        circulo.classList.add('alerta');
        textoEstado.classList.add('alerta');
        circulo.innerText = "20%";
        mensaje.innerText = "Reemplazar Pronto";
    } else if (estado === 'peligro') {
        circulo.classList.add('peligro');
        textoEstado.classList.add('peligro');
        circulo.innerText = "0%";
        mensaje.innerText = "¡Reemplazar Ahora!";
    }
}

btnRegistrar.addEventListener('click', () => {
    alert('¡Filtro nuevo registrado! (Simulación)');
    setEstado('optimo');
});

// --- LÓGICA DE LA MODAL DE HÁBITOS (Modal 1) ---
const modalHabits = document.getElementById('modal-habits');
const btnOpenHabits = document.getElementById('btn-open-habits');
const btnCloseHabits = document.getElementById('btn-close-habits');

function openModalHabits() { modalHabits.classList.remove('hidden'); }
function closeModalHabits() { modalHabits.classList.add('hidden'); }

btnOpenHabits.addEventListener('click', openModalHabits);
btnCloseHabits.addEventListener('click', closeModalHabits);
modalHabits.addEventListener('click', (event) => {
    if (event.target === modalHabits) {
        closeModalHabits();
    }
});

// --- LÓGICA DE LA MODAL DE CALCULADORA (Modal 2) ---
const modalCalc = document.getElementById('modal-calculator');
const btnOpenCalc = document.getElementById('btn-open-calculator');
const btnCloseCalc = document.getElementById('btn-close-calculator');
const btnCalculate = document.getElementById('btn-calculate');

function openModalCalc() { modalCalc.classList.remove('hidden'); }
function closeModalCalc() { modalCalc.classList.add('hidden'); }

btnOpenCalc.addEventListener('click', openModalCalc);
btnCloseCalc.addEventListener('click', closeModalCalc);

btnCalculate.addEventListener('click', () => {
    // --- PARÁMETROS DE INGENIERÍA ---
    const ALTURA_PROMEDIO_M = 2.5; // Altura estándar de una habitación
    
    // Leemos el CADR seleccionado por el usuario desde el <select>
    const CADR_PROTOTIPO_M3H = parseFloat(document.getElementById('select-filtro').value);
    
    // --- LECTURA DE INPUTS ---
    const ancho = parseFloat(document.getElementById('input-ancho').value);
    const largo = parseFloat(document.getElementById('input-largo').value);
    const resultadoBox = document.getElementById('calculator-result-box');
    const resultadoTexto = document.getElementById('result-text');

    // Validación
    if (!ancho || !largo || isNaN(ancho) || isNaN(largo) || ancho <= 0 || largo <= 0) {
        alert("Por favor, ingresa números válidos para el ancho y largo.");
        resultadoBox.classList.add('hidden');
        return;
    }
    
    if (!CADR_PROTOTIPO_M3H || isNaN(CADR_PROTOTIPO_M3H)) {
        alert("Error: No se seleccionó un filtro válido.");
        return;
    }

    // --- CÁLCULO DE INGENIERÍA ---
    const area = ancho * largo; // m²
    const volumen = area * ALTURA_PROMEDIO_M; // m³
    
    // Cambios de Aire por Hora (ACH)
    const ach = CADR_PROTOTIPO_M3H / volumen;
    
    // Minutos para un cambio de aire completo
    const minutosPorCambio = 60 / ach;

    // --- MOSTRAR RESULTADO ---
    resultadoTexto.innerHTML = `Con este filtro, tu purificador logrará <strong>${ach.toFixed(1)} cambios de aire por hora</strong>.
                               <br><br>
                               Reciclará todo el aire de la habitación cada
                               <strong>~${minutosPorCambio.toFixed(0)} minutos</strong>.`;
    
    resultadoBox.classList.remove('hidden');
});

modalCalc.addEventListener('click', (event) => {
    if (event.target === modalCalc) {
        closeModalCalc();
    }
});

// --- LÓGICA DE INTEGRACIÓN DE API (Calidad del Aire) ---

// ** TU TOKEN DE API WAQI **
const WAQI_TOKEN = "06b85b997fefb00481769fc568e61657d54e7c64"; 

// URL para obtener datos de la estación de San Pedro Garza García (Monterrey)
const WAQI_URL = `https://api.waqi.info/feed/san-pedro-garza-garcia/?token=${WAQI_TOKEN}`;


async function fetchAirQuality() {
    const displayElement = document.getElementById('air-quality-display');
    if (!displayElement) return;

    try {
        const response = await fetch(WAQI_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP! Estado: ${response.status}`);
        }
        const data = await response.json();

        if (data.status === 'ok') {
            
            const pm25Value = data.data.iaqi.pm25 ? data.data.iaqi.pm25.v : data.data.aqi; 
            const stationName = data.data.city.name.replace(" (San Pedro Garza García)", "");

            let statusClass = '';
            let statusText = '';
            
            if (pm25Value <= 50) {
                statusClass = 'buena';
                statusText = 'Buena';
            } else if (pm25Value <= 100) {
                statusClass = 'moderada';
                statusText = 'Moderada';
            } else if (pm25Value <= 150) {
                statusClass = 'mala';
                statusText = 'Mala';
            } else if (pm25Value <= 200) {
                statusClass = 'peligrosa';
                statusText = 'Peligrosa';
            } else {
                statusClass = 'peligrosa'; 
                statusText = 'Extremadamente Peligrosa';
            }

            // Actualizar la interfaz con los datos
            displayElement.classList.remove('buena', 'moderada', 'mala', 'peligrosa');
            displayElement.classList.add(statusClass);
            displayElement.innerHTML = `Aire Exterior (${stationName}): <strong>${pm25Value} PM2.5 (${statusText})</strong>`;

        } else {
            displayElement.innerHTML = 'Error de API (Estación no encontrada).';
            displayElement.classList.add('mala'); 
        }

    } catch (error) {
        console.error("Error al obtener calidad del aire:", error);
        displayElement.innerHTML = 'Error de conexión (Verifica la red).';
        displayElement.classList.add('mala');
    }
}

// ** FIX: USAR DOMContentLoaded en lugar de window.onload **
document.addEventListener('DOMContentLoaded', (event) => {
    // 1. Inicializa el estado del filtro (¡El fix!)
    setEstado('optimo'); 
    
    // 2. Carga los datos de la API (esta función es asíncrona)
    fetchAirQuality(); 
});

// --- LÓGICA DE LA MODAL DE DISEÑO (Modal 3) ---
const modalDesign = document.getElementById('modal-design');
const btnOpenDesign = document.getElementById('btn-open-design');
const btnCloseDesign = document.getElementById('btn-close-design');

function openModalDesign() { modalDesign.classList.remove('hidden'); }
function closeModalDesign() { modalDesign.classList.add('hidden'); }

btnOpenDesign.addEventListener('click', openModalDesign);
btnCloseDesign.addEventListener('click', closeModalDesign);

modalDesign.addEventListener('click', (event) => {
    if (event.target === modalDesign) {
        closeModalDesign();
    }
});