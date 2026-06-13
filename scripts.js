// ==========================================================================
// CONTROLADOR LOGICO: ADVIENTO - FASE CAJONES
// ==========================================================================
const JuegoAdviento = {
    silenciado: false,
    conteoEncontrados: 0,
    
    progreso: {
        caja: false,
        cerillas: false,
        candela: false,
        porta: false
    },

    init: function() {
        this.conectarEventos();
    },

    conectarEventos: function() {
        const btnMute = document.getElementById('btn-mute');
        btnMute.addEventListener('click', () => this.alternarSilencio());
    },

    // Oculta el modal de inicio y libera la escena
    comenzarJuego: function() {
        document.getElementById('pantalla-inicio').classList.add('oculto');
        console.log("Fase 1: Búsqueda iniciada.");
    },

    alternarSilencio: function() {
        this.silenciado = !this.silenciado;
        const btnMute = document.getElementById('btn-mute');
        const iconoOn = btnMute.querySelector('.icono-audio-on');
        const iconoOff = btnMute.querySelector('.icono-audio-off');

        if (this.silenciado) {
            btnMute.classList.add('silenciado');
            iconoOn.classList.add('oculto');
            iconoOff.classList.remove('oculto');
        } else {
            btnMute.classList.remove('silenciado');
            iconoOn.classList.remove('oculto');
            iconoOff.classList.add('oculto');
        }
    },

// Disparador cuando pulsas una hitbox correcta
    objetoEncontrado: function(idObjeto) {
        if (this.progreso[idObjeto]) return;
        this.crearChispas(idObjeto);

        // Registrar progreso
        this.progreso[idObjeto] = true;
        this.conteoEncontrados++;

        // Ocultar de inmediato la zona interactiva activa
        document.getElementById(`hitbox-${idObjeto}`).style.display = 'none';

        // Añadir la clase CSS que activa el filtro gris, el tachado y el check visible
        const itemInterfaz = document.getElementById(`obj-${idObjeto}`);
        itemInterfaz.classList.add('encontrado');

        // Actualizar el contador de la esquina superior
        document.getElementById('contador-objetos').innerText = `Objetos: ${this.conteoEncontrados} / 4`;

        this.comprobarVictoria();
    },
    crearChispas: function(idObjeto) {
        const hitbox = document.getElementById(`hitbox-${idObjeto}`);
        const escenario = document.getElementById('escenario-busqueda');
        
        // Obtenemos las coordenadas y el tamaño de la hitbox clickeada
        const rectHitbox = hitbox.getBoundingClientRect();
        const rectEscenario = escenario.getBoundingClientRect();

        // Calculamos el centro exacto de la hitbox relativo al escenario
        const centroX = (rectHitbox.left - rectEscenario.left) + (rectHitbox.width / 2);
        const centroY = (rectHitbox.top - rectEscenario.top) + (rectHitbox.height / 2);

        const cantidadChispas = 15; // Número de partículas que saltarán

        for (let i = 0; i < cantidadChispas; i++) {
            const chispa = document.createElement('div');
            chispa.classList.add('chispa-magica');
            
            // Colocamos la chispa en el centro del objeto
            chispa.style.left = `${centroX}px`;
            chispa.style.top = `${centroY}px`;

            // Calculamos un ángulo y distancia aleatoria para que exploten en círculo
            const angulo = Math.random() * Math.PI * 2;
            const distancia = Math.random() * 80 + 30; // Volarán entre 30px y 110px de distancia
            
            const tx = Math.cos(angulo) * distancia;
            const ty = Math.sin(angulo) * distancia;
            
            // Inyectamos las coordenadas finales al CSS
            chispa.style.setProperty('--tx', `${tx}px`);
            chispa.style.setProperty('--ty', `${ty}px`);

            // Añadimos la chispa a la pantalla
            escenario.appendChild(chispa);

            // Limpieza: Eliminamos el div de la chispa una vez termine la animación (600ms)
            setTimeout(() => {
                chispa.remove();
            }, 1500);
        }
    },


    comprobarVictoria: function() {
        const victoria = Object.values(this.progreso).every(item => item === true);

        if (victoria) {
            // Muestra el modal final sin alertas molestas
            setTimeout(() => {
                document.getElementById('pantalla-final').classList.remove('oculto');
            }, 500);
        }
    },

iniciarFaseOscura: function() {
        // 1. Evitar reinicios accidentales si ya está activo
        if (this.faseOscuraActiva) return;
        this.faseOscuraActiva = true;

        // 2. Ocultamos el cartel de victoria (ajusta el ID si es distinto)
        const pantallaFinal = document.getElementById('pantalla-final');
        if (pantallaFinal) pantallaFinal.classList.add('oculto');
        
        // 3. Obtenemos el escenario
    const imagenEscenario = document.querySelector('.imagen-escenario');
        if (imagenEscenario) {
        imagenEscenario.src = './altillo.png'; // Cambia la ruta a tu nueva imagen
        }
        
        // 4. Activamos la clase en el contenedor para el efecto visual
        escenario.classList.add('fase-oscura-activa');
        
        // 5. Creamos el elemento de luz
        const luz = document.createElement('div');
        luz.id = 'luz-vela';
        escenario.appendChild(luz);
        
        // 6. Evento de movimiento (Coordenadas relativas al contenedor)
        escenario.addEventListener('mousemove', function(e) {
            const rect = escenario.getBoundingClientRect();
            
            // Calculamos la posición del ratón dentro del div del escenario
            const posX = e.clientX - rect.left;
            const posY = e.clientY - rect.top;
            
            // Aplicamos la posición directamente
            // El CSS (translate -50%) se encarga de centrar el halo en el ratón
            luz.style.left = posX + 'px';
            luz.style.top = posY + 'px';
        });

        console.log("🕯️ La vela ha sido encendida. Modo noche activado.");
 } };


// Autoarranque al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    JuegoAdviento.init();
});