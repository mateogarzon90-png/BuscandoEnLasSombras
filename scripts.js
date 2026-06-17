// ==========================================================================
// CONTROLADOR LÓGICO: ADVIENTO - JUEGO DE BÚSQUEDA INTEGRADO
// ==========================================================================
const JuegoAdviento = {
    silenciado: false,
    faseActual: 1,           // 1 = Cajones (Día), 2 = Altillo (Noche)
    faseOscuraActiva: false,
    conteoEncontrados: 0,
    
    // Progreso de la Fase 1 (Cajones - 4 Objetos)
    progresoFase1: {
        caja: false,
        cerillas: false,
        candela: false,
        porta: false
    },

    // Progreso de la Fase 2 (Altillo - 5 Objetos Nuevos)
    progresoFase2: {
        angel: false,
        bell: false,
        books: false,
        foto: false,
        star: false
    },

    // Diccionario de configuración para los nuevos objetos de la Fase 2
    // NOTA: Los valores de 'top' y 'left' son provisionales. Puedes calibrar 
    // sus posiciones exactas modificando estos porcentajes.
    objetosFase2: {
        angel: { nombre: 'Ángel de madera', imagen: 'objetos/Angel2.png', top: '42%', left: '3%', width: '5%', height: '10%' },
        bell: {  nombre: 'Campana antigua',  imagen: 'objetos/Bell2.png',  top: '30%', left: '85%', width: '5%', height: '9%' },
        books: { nombre: 'Libros de cuentos', imagen: 'objetos/Books2.png', top: '75%', left: '3%', width: '7%', height: '11%' },
        foto: {  nombre: 'Fotografía familiar', imagen: 'objetos/Foto2.png',  top: '58%', left: '53%', width: '5%', height: '8%' },
        star: {  nombre: 'Estrella dorada',  imagen: 'objetos/Star2.png',  top: '87%', left: '77%', width: '5%', height: '6%' }
    },

    init: function() {
        this.conectarEventos();
    },

    conectarEventos: function() {
        const btnMute = document.getElementById('btn-mute');
        if (btnMute) {
            btnMute.addEventListener('click', () => this.alternarSilencio());
        }
    },

    // Oculta el modal de inicio y libera la escena
    comenzarJuego: function() {
        const pantallaInicio = document.getElementById('pantalla-inicio');
        if (pantallaInicio) pantallaInicio.classList.add('oculto');
        console.log("Fase 1: Búsqueda iniciada.");
    },

    alternarSilencio: function() {
        this.silenciado = !this.silenciado;
        const btnMute = document.getElementById('btn-mute');
        if (!btnMute) return;

        const iconoOn = btnMute.querySelector('.icono-audio-on');
        const iconoOff = btnMute.querySelector('.icono-audio-off');

        if (this.silenciado) {
            btnMute.classList.add('silenciado');
            if (iconoOn) iconoOn.classList.add('oculto');
            if (iconoOff) iconoOff.classList.remove('oculto');
        } else {
            btnMute.classList.remove('silenciado');
            if (iconoOn) iconoOn.classList.remove('oculto');
            if (iconoOff) iconoOff.classList.add('oculto');
        }
    },

    // Disparador único para cuando se encuentra un objeto válido en cualquier fase
    objetoEncontrado: function(idObjeto) {
        // 1. Identificamos qué objeto de progreso usar según la fase actual
        const progresoActual = this.faseActual === 1 ? this.progresoFase1 : this.progresoFase2;

        // Si por alguna razón no encuentra el progreso o ya se descubrió, salimos
        if (!progresoActual || progresoActual[idObjeto]) return;

        // 2. Disparamos la animación visual de las chispas
        this.crearChispas(idObjeto);

        // 3. Registramos el progreso en la fase correspondiente y sumamos el contador
        progresoActual[idObjeto] = true;
        this.conteoEncontrados++;

        // 4. Ocultamos de inmediato la hitbox interactiva clickeada
        const hitbox = document.getElementById(`hitbox-${idObjeto}`);
        if (hitbox) hitbox.style.display = 'none';

        // 5. Añadimos la clase CSS que activa el check verde en el menú inferior
        const itemInterfaz = document.getElementById(`obj-${idObjeto}`);
        if (itemInterfaz) itemInterfaz.classList.add('encontrado');

        // 6. Calculamos el total de objetos de ESTA fase de forma dinámica
        const totalObjetosFase = Object.keys(progresoActual).length;
        
        const contadorVisual = document.getElementById('contador-objetos');
        if (contadorVisual) {
            contadorVisual.innerText = `Objetos: ${this.conteoEncontrados} / ${totalObjetosFase}`;
        }

        // 7. Comprobamos si se completó la habitación actual
        this.comprobarVictoria();
    },
    crearChispas: function(idObjeto) {
        const hitbox = document.getElementById(`hitbox-${idObjeto}`);
        const escenario = document.getElementById('escenario-busqueda');
        if (!hitbox || !escenario) return;
        
        const rectHitbox = hitbox.getBoundingClientRect();
        const rectEscenario = escenario.getBoundingClientRect();

        const centroX = (rectHitbox.left - rectEscenario.left) + (rectHitbox.width / 2);
        const centroY = (rectHitbox.top - rectEscenario.top) + (rectHitbox.height / 2);

        const cantidadChispas = 15; 

        for (let i = 0; i < cantidadChispas; i++) {
            const chispa = document.createElement('div');
            chispa.classList.add('chispa-magica');
            
            chispa.style.left = `${centroX}px`;
            chispa.style.top = `${centroY}px`;

            const angulo = Math.random() * Math.PI * 2;
            const distancia = Math.random() * 80 + 30; 
            
            const tx = Math.cos(angulo) * distancia;
            const ty = Math.sin(angulo) * distancia;
            
            chispa.style.setProperty('--tx', `${tx}px`);
            chispa.style.setProperty('--ty', `${ty}px`);

            escenario.appendChild(chispa);

            setTimeout(() => {
                chispa.remove();
            }, 1500);
        }
    },

    comprobarVictoria: function() {
        // Seleccionamos el progreso de la fase que se está jugando
        const progresoActual = this.faseActual === 1 ? this.progresoFase1 : this.progresoFase2;
        
        if (!progresoActual) return;

        // Comprobamos si todos los elementos de esta fase están en true
        const victoriaFase = Object.values(progresoActual).every(item => item === true);

        if (victoriaFase) {
            setTimeout(() => {
                if (this.faseActual === 1) {
                    // Fin de los Cajones -> Mostramos transición al Altillo
                    const modalAltillo = document.getElementById('pantalla-transicion-altillo');
                    if (modalAltillo) modalAltillo.classList.remove('oculto');
                    
                } else if (this.faseActual === 2) {
                    // Fin del Altillo -> Mostramos transición a los Niños
                    const modalNinos = document.getElementById('pantalla-transicion-ninos');
                    if (modalNinos) modalNinos.classList.remove('oculto');
                }
            }, 600);
        }
    },

    // Transición controlada hacia la Fase Nocturna (Altillo)
    iniciarFaseOscura: function() {
        if (this.faseOscuraActiva) return;
        this.faseOscuraActiva = true;
        
        this.faseActual = 2;       // Cambiamos el puntero a la fase 2
        this.conteoEncontrados = 0; // Reiniciamos el contador parcial

        // 1. Esconder modal de victoria intermedio
        const pantallaFinal = document.getElementById('pantalla-final');
        if (pantallaFinal) pantallaFinal.classList.add('oculto');
        
        // 2. Localizar y validar escenario base
        const escenario = document.getElementById('escenario-busqueda');
        if (!escenario) {
            console.error("No se encontró el elemento #escenario-busqueda");
            return;
        }

        // 3. Reemplazar fondo gráfico por el nuevo archivo del altillo
        const imagenEscenario = escenario.querySelector('.imagen-escenario');
        if (imagenEscenario) {
            imagenEscenario.src = './altillo.png'; 
        }

        // 4. Limpieza absoluta del DOM: removemos físicamente las hitboxes de los cajones
        const hitboxesAntiguas = escenario.querySelectorAll('.hitbox');
        hitboxesAntiguas.forEach(hb => hb.remove());
        
        // 5. Vaciar y reconstruir el contenedor visual del inventario de objetivos
        const panelInventario = document.querySelector('.inventario-objetivos');
        if (panelInventario) {
            panelInventario.innerHTML = ''; // Limpiamos las tarjetas de las cerillas y velas antiguas
        }

        // 6. Actualizar textos de la interfaz de usuario de forma inmediata
        document.getElementById('contador-objetos').innerText = `Objetos: 0 / 5`;
        const tituloHeader = document.querySelector('.interfaz-superior h1');
        if (tituloHeader) tituloHeader.innerText = "🕯️ 2º Domingo: El Altillo a Oscuras";

        // 7. Renderizar dinámicamente los nuevos elementos recortados y sus hitboxes correspondientes
        for (const key in this.objetosFase2) {
            const obj = this.objetosFase2[key];

            // A. Inyección de la nueva tarjeta de inventario en el HTML
            if (panelInventario) {
                const estructuraTarjeta = `
                    <div class="item-objetivo" id="obj-noche-${key}">
                        <div class="contenedor-icono">
                            <img src="${obj.imagen}" alt="${obj.nombre}" class="icono-objeto">
                            <span class="check-completado"></span>
                        </div>
                        <span class="nombre-objeto">${obj.nombre}</span>
                    </div>
                `;
                panelInventario.innerHTML += estructuraTarjeta;
            }

            // B. Creación dinámica de la nueva zona interactiva (hitbox) en el escenario
            const nuevaHitbox = document.createElement('button');
            nuevaHitbox.className = 'hitbox';
            nuevaHitbox.id = `hitbox-${key}`;
            nuevaHitbox.title = obj.nombre;
            
            // Posicionamiento porcentual escalable heredado del diccionario de configuración
            nuevaHitbox.style.top = obj.top;
            nuevaHitbox.style.left = obj.left;
            nuevaHitbox.style.width = obj.width;
            nuevaHitbox.style.height = obj.height;
            
            // Vinculación segura del evento click del botón hacia nuestro manejador global
            nuevaHitbox.setAttribute('onclick', `JuegoAdviento.objetoEncontrado('${key}')`);
            
            escenario.appendChild(nuevaHitbox);
        }
        
        // 8. Inicialización y acople del efecto vela (Filtro e iluminación localizada)
        escenario.classList.add('fase-oscura-activa');
        
        const luz = document.createElement('div');
        luz.id = 'luz-vela';
        escenario.appendChild(luz);
        
        const self = this;
        
        // Captura interactiva del movimiento dentro del contenedor adaptada a coordenadas locales
        escenario.addEventListener('mousemove', function(e) {
            if (!self.faseOscuraActiva) return;

            const rect = escenario.getBoundingClientRect();
            const posX = e.clientX - rect.left;
            const posY = e.clientY - rect.top;
            
            luz.style.left = posX + 'px';
            luz.style.top = posY + 'px';
        });

        console.log("🕯️ La vela ha sido encendida. Modo noche activado perfectamente.");
    },

    // Nueva función dentro de JuegoAdviento
    iniciarHabitacionNinos: function() {
        console.log("🚂 Entrando a la habitación de los niños...");

        document.getElementById('pantalla-transicion-ninos').classList.add('oculto');
        
        // ACTUALIZAMOS EL MOTOR DEL JUEGO
        this.faseActual = 3; // ¡Clave para que comprobarVictoria sepa dónde estamos!
        this.conteoEncontrados = 0;

        // 1. Cambiamos la imagen de fondo
        const escenario = document.getElementById('escenario-busqueda');
        const imagenEscenario = escenario.querySelector('.imagen-escenario');
        if (imagenEscenario) {
            imagenEscenario.src = './habitacion2.png'; 
        }

        // 2. Limpiamos las hitboxes del altillo para que no estorben
        const hitboxesAntiguas = escenario.querySelectorAll('.hitbox');
        hitboxesAntiguas.forEach(hb => hb.remove());

        // 3. Reseteamos el progreso para esta nueva fase
        this.conteoEncontrados = 0;
        this.progreso = {
            cuentos: false,
            maleta: false,
            osito: false,
            trencito: false,
            adornoangel: false
        };

        // 4. Actualizamos el marcador superior
        document.getElementById('contador-objetos').innerText = `Objetos: 0 / 5`;

        // 5. Inyectamos los nuevos objetos en el panel de inventario HTML
        const panelInventario = document.querySelector('.inventario-objetivos');
        panelInventario.innerHTML = `
            <div class="item-objetivo" id="obj-cuentos">
                <div class="contenedor-icono"><img src="./objetos/Cuentos.png" class="icono-objeto" alt="Cuentos"></div>
                <span class="nombre-objeto">Cuentos</span>
            </div>
            <div class="item-objetivo" id="obj-maleta">
                <div class="contenedor-icono"><img src="./objetos/Maleta.png" class="icono-objeto" alt="Maleta"></div>
                <span class="nombre-objeto">Maleta</span>
            </div>
            <div class="item-objetivo" id="obj-osito">
                <div class="contenedor-icono"><img src="./objetos/Osito.png" class="icono-objeto" alt="Osito"></div>
                <span class="nombre-objeto">Osito</span>
            </div>
            <div class="item-objetivo" id="obj-trencito">
                <div class="contenedor-icono"><img src="./objetos/Trencito.png" class="icono-objeto" alt="Trencito"></div>
                <span class="nombre-objeto">Trencito</span>
            </div>
            <div class="item-objetivo" id="obj-adornoangel">
                <div class="contenedor-icono"><img src="./objetos/AdornoAngel.png" class="icono-objeto" alt="Ángel"></div>
                <span class="nombre-objeto">Ángel</span>
            </div>
        `;

        // 6. Creamos las nuevas hitboxes dinámicamente y les asignamos el evento
        const idsObjetos = ['cuentos', 'maleta', 'osito', 'trencito', 'adornoangel'];
        idsObjetos.forEach(id => {
            const hitbox = document.createElement('div');
            hitbox.id = `hitbox-${id}`;
            hitbox.className = 'hitbox';
            
            // Le damos un color rojo temporal con CSS inline para que las veas y las calibres
            hitbox.style.background = 'rgba(255, 0, 0, 0.35)';
            
            // Reutilizamos tu función objetoEncontrado
            hitbox.addEventListener('click', () => this.objetoEncontrado(id));
            escenario.appendChild(hitbox);
        });
    }
};

// Vinculación segura del ciclo de arranque del juego
window.addEventListener('DOMContentLoaded', () => {
    JuegoAdviento.init();
});