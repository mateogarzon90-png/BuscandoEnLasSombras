// ==========================================================================
// CONTROLADOR LÓGICO: ADVIENTO - JUEGO DE BÚSQUEDA INTEGRADO
// ==========================================================================
const JuegoAdviento = {
    silenciado: false,
    faseActual: 1,           
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
    
    // Progreso de la Fase 3 (Niños - 5 Objetos) 
    progresoFase3: {
        cuentos: false,
        maleta: false,
        osito: false,
        trencito: false,
        adornoangel: false
    },

    // Progreso de la Fase 4 (Salón - 6 Objetos)
    progresoFase4: {
        boligrafo: false,
        cintapegante: false,
        etiquetas: false,
        lazo: false,
        tijeras: false
    },

    objetosFase2: {
        angel: { nombre: 'Ángel de madera', imagen: 'objetos/Angel2.png', top: '42%', left: '3%', width: '5%', height: '10%' },
        bell: {  nombre: 'Campana antigua',  imagen: 'objetos/Bell2.png',  top: '30%', left: '85%', width: '5%', height: '9%' },
        books: { nombre: 'Libros de cuentos', imagen: 'objetos/Books2.png', top: '75%', left: '3%', width: '7%', height: '11%' },
        foto: {  nombre: 'Fotografía familiar', imagen: 'objetos/Foto2.png',  top: '58%', left: '53%', width: '5%', height: '8%' },
        star: {  nombre: 'Estrella dorada',  imagen: 'objetos/Star2.png',  top: '87%', left: '77%', width: '5%', height: '6%' }
    },

    // 🎵 GESTOR DE AUDIOS
    sonidos: {
        acierto: new Audio('./sonidos/shineReward.mp3'),
        transicion: new Audio('./sonidos/door.mp3'),
        victoria: new Audio('./sonidos/ending.mp3'),
        fondo: new Audio('./sonidos/magic-night.mp3'),
        inicio: new Audio('./sonidos/openDrawer.mp3'),
        encender: new Audio('./sonidos/match-lighting.mp3'),
        candela: new Audio('./sonidos/candle.mp3')
    },

    init: function() {
        this.sonidos.fondo.loop = true;
        this.sonidos.candela.loop = true;
        
        // Ajustamos un poco el volumen del fondo para que no tape los efectos
        this.sonidos.fondo.volume = 0.4;
        this.sonidos.candela.volume = 0.6;

        this.conectarEventos();
    },

    conectarEventos: function() {
        const btnMute = document.getElementById('btn-mute');
        if (btnMute) {
            btnMute.addEventListener('click', () => this.alternarSilencio());
        }
    },

    // Oculta el modal de inicio e inicia los audios base
    comenzarJuego: function() {
        const pantallaInicio = document.getElementById('pantalla-inicio');
        if (pantallaInicio) pantallaInicio.classList.add('oculto');
        
        // 🎵 Iniciar el cajón y la música de fondo
        this.reproducirSonido('inicio');
        this.reproducirSonido('fondo');
        
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

        // 🌟 EL TRUCO: Silencia/Desilencia todos los audios a la vez
        for (const key in this.sonidos) {
            this.sonidos[key].muted = this.silenciado;
        }
    },

    reproducirSonido: function(tipoSonido) {
        if (this.silenciado) return; 

        if (this.sonidos[tipoSonido]) {
            // Solo reiniciamos al segundo 0 si NO es música de fondo
            if (tipoSonido !== 'fondo' && tipoSonido !== 'candela') {
                this.sonidos[tipoSonido].currentTime = 0; 
            }
            this.sonidos[tipoSonido].play().catch(e => console.log("Esperando interacción del usuario."));
        }
    },

    objetoEncontrado: function(idObjeto) {
        let progresoActual;
        if (this.faseActual === 1) progresoActual = this.progresoFase1;
        else if (this.faseActual === 2) progresoActual = this.progresoFase2;
        else if (this.faseActual === 3) progresoActual = this.progresoFase3;
        else if (this.faseActual === 4) progresoActual = this.progresoFase4;

        if (!progresoActual || progresoActual[idObjeto]) return;

        this.crearChispas(idObjeto);
        
        // 🎵 Disparamos el sonido de acierto
        this.reproducirSonido('acierto');

        progresoActual[idObjeto] = true;
        this.conteoEncontrados++;

        const hitbox = document.getElementById(`hitbox-${idObjeto}`);
        if (hitbox) hitbox.style.display = 'none';

        const itemInterfaz = document.getElementById(`obj-${idObjeto}`);
        if (itemInterfaz) itemInterfaz.classList.add('encontrado');

        const totalObjetosFase = Object.keys(progresoActual).length;
        
        const contadorVisual = document.getElementById('contador-objetos');
        if (contadorVisual) {
            contadorVisual.innerText = `Objetos: ${this.conteoEncontrados} / ${totalObjetosFase}`;
        }

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
        let progresoActual;
        if (this.faseActual === 1) progresoActual = this.progresoFase1;
        else if (this.faseActual === 2) progresoActual = this.progresoFase2;
        else if (this.faseActual === 3) progresoActual = this.progresoFase3;
        else if (this.faseActual === 4) progresoActual = this.progresoFase4;

        if (!progresoActual) return;

        const victoriaFase = Object.values(progresoActual).every(item => item === true);

        if (victoriaFase) {
            setTimeout(() => {
                if (this.faseActual === 1) {
                    const modalAltillo = document.getElementById('pantalla-transicion-altillo');
                    if (modalAltillo) modalAltillo.classList.remove('oculto');
                    
                    // 🎵 Encendemos la cerilla y el bucle de la candela
                    this.reproducirSonido('encender');
                    this.reproducirSonido('candela');
                    
                } else if (this.faseActual === 2) {
                    const modalNinos = document.getElementById('pantalla-transicion-ninos');
                    if (modalNinos) modalNinos.classList.remove('oculto');
                    
                } else if (this.faseActual === 3) {
                    const modalSalon = document.getElementById('pantalla-transicion-salon');
                    if (modalSalon) modalSalon.classList.remove('oculto');

                } else if (this.faseActual === 4) {
                    const pantallaFinal = document.getElementById('pantalla-final');
                    if (pantallaFinal) pantallaFinal.classList.remove('oculto');
                    
                    // 🎵 Música final y apagamos los ambientes
                    this.sonidos.fondo.pause();
                    this.sonidos.candela.pause();
                    this.reproducirSonido('victoria');
                }
            }, 600);
        }
    },

    iniciarFaseOscura: function() {
        if (this.faseOscuraActiva) return;
        this.faseOscuraActiva = true;
        
        this.faseActual = 2;       
        this.conteoEncontrados = 0; 

        const modalAltillo = document.getElementById('pantalla-transicion-altillo');
        if (modalAltillo) modalAltillo.classList.add('oculto');

        const pantallaFinal = document.getElementById('pantalla-final');
        if (pantallaFinal) pantallaFinal.classList.add('oculto');
        
        const escenario = document.getElementById('escenario-busqueda');
        if (!escenario) return;

        const imagenEscenario = escenario.querySelector('.imagen-escenario');
        if (imagenEscenario) {
            imagenEscenario.src = './altillo.png'; 
            imagenEscenario.style.filter = 'brightness(80%)';
        }

        const hitboxesAntiguas = escenario.querySelectorAll('.hitbox');
        hitboxesAntiguas.forEach(hb => hb.remove());
        
        const panelInventario = document.querySelector('.inventario-objetivos');
        if (panelInventario) {
            panelInventario.innerHTML = ''; 
        }

        document.getElementById('contador-objetos').innerText = `Objetos: 0 / 5`;
        const tituloHeader = document.querySelector('.interfaz-superior h1');
        if (tituloHeader) tituloHeader.innerText = "🕯️ El Altillo a Oscuras";

        for (const key in this.objetosFase2) {
            const obj = this.objetosFase2[key];

            if (panelInventario) {
                const estructuraTarjeta = `
                    <div class="item-objetivo" id="obj-${key}">
                        <div class="contenedor-icono">
                            <img src="${obj.imagen}" alt="${obj.nombre}" class="icono-objeto">
                            <span class="check-completado"></span>
                        </div>
                        <span class="nombre-objeto">${obj.nombre}</span>
                    </div>
                `;
                panelInventario.innerHTML += estructuraTarjeta;
            }

            const nuevaHitbox = document.createElement('button');
            nuevaHitbox.className = 'hitbox';
            nuevaHitbox.id = `hitbox-${key}`;
            nuevaHitbox.title = obj.nombre;
            
            nuevaHitbox.style.top = obj.top;
            nuevaHitbox.style.left = obj.left;
            nuevaHitbox.style.width = obj.width;
            nuevaHitbox.style.height = obj.height;
            
            nuevaHitbox.setAttribute('onclick', `JuegoAdviento.objetoEncontrado('${key}')`);
            
            escenario.appendChild(nuevaHitbox);
        }
        
        escenario.classList.add('fase-oscura-activa');
        
        const luz = document.createElement('div');
        luz.id = 'luz-vela';
        escenario.appendChild(luz);
        
        const self = this;
        
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

    iniciarHabitacionNinos: function() {
        console.log("🚂 Entrando a la habitación de los niños...");
        
        // 🎵 Suena la puerta al cambiar de habitación
        this.reproducirSonido('transicion');

        document.getElementById('pantalla-transicion-ninos').classList.add('oculto');
        
        this.faseActual = 3; 
        this.conteoEncontrados = 0;

        const escenario = document.getElementById('escenario-busqueda');
        const imagenEscenario = escenario.querySelector('.imagen-escenario');
        if (imagenEscenario) {
            imagenEscenario.src = './habitacion2.png'; 
            imagenEscenario.style.filter = 'brightness(50%)';
        }

        const hitboxesAntiguas = escenario.querySelectorAll('.hitbox');
        hitboxesAntiguas.forEach(hb => hb.remove());

        this.conteoEncontrados = 0;
        this.progresoFase3 = {
            cuentos: false,
            maleta: false,
            osito: false,
            trencito: false,
            adornoangel: false
        };

        document.getElementById('contador-objetos').innerText = `Objetos: 0 / 5`;
        
        // Actualizamos el título de la sala
        const tituloHeader = document.querySelector('.interfaz-superior h1');
        if (tituloHeader) tituloHeader.innerText = "🚂 Habitación de los Niños";

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

        const idsObjetos = ['cuentos', 'maleta', 'osito', 'trencito', 'adornoangel'];
        idsObjetos.forEach(id => {
            const hitbox = document.createElement('div');
            hitbox.id = `hitbox-${id}`;
            hitbox.className = 'hitbox';
            
            hitbox.addEventListener('click', () => this.objetoEncontrado(id));
            escenario.appendChild(hitbox);
        });
    },

    iniciarHabitacionSalon: function() {
        console.log("🎁 Entrando al salón principal...");
        
        // 🎵 Suena la puerta al cambiar de habitación
        this.reproducirSonido('transicion');

        const modalSalon = document.getElementById('pantalla-transicion-salon');
        if (modalSalon) modalSalon.classList.add('oculto');
        
        this.faseActual = 4;
        this.conteoEncontrados = 0;

        const escenario = document.getElementById('escenario-busqueda');
        const imagenEscenario = escenario.querySelector('.imagen-escenario');
        if (imagenEscenario) {
            imagenEscenario.src = './salon3.png'; 
            imagenEscenario.style.filter = 'brightness(35%)';
        }

        const hitboxesAntiguas = escenario.querySelectorAll('.hitbox');
        hitboxesAntiguas.forEach(hb => hb.remove());

        this.progresoFase4 = {
            boligrafo: false,
            cintapegante: false,
            etiquetas: false,
            lazo: false,
            tijeras: false
        };

        document.getElementById('contador-objetos').innerText = `Objetos: 0 / 5`;
        
        // Actualizamos el título de la sala
        const tituloHeader = document.querySelector('.interfaz-superior h1');
        if (tituloHeader) tituloHeader.innerText = "🎁 El Salón Principal";

        const panelInventario = document.querySelector('.inventario-objetivos');
        panelInventario.innerHTML = `
            <div class="item-objetivo" id="obj-boligrafo">
                <div class="contenedor-icono"><img src="./objetos/Boligrafo.png" class="icono-objeto" alt="Bolígrafo"></div>
                <span class="nombre-objeto">Bolígrafo</span>
            </div>
            <div class="item-objetivo" id="obj-cintapegante">
                <div class="contenedor-icono"><img src="./objetos/CintaPegante.png" class="icono-objeto" alt="Cinta Pegante"></div>
                <span class="nombre-objeto">Cinta Pegante</span>
            </div>
            <div class="item-objetivo" id="obj-etiquetas">
                <div class="contenedor-icono"><img src="./objetos/Etiquetas.png" class="icono-objeto" alt="Etiquetas"></div>
                <span class="nombre-objeto">Etiquetas</span>
            </div>
            <div class="item-objetivo" id="obj-lazo">
                <div class="contenedor-icono"><img src="./objetos/Lazo.png" class="icono-objeto" alt="Lazo"></div>
                <span class="nombre-objeto">Lazo</span>
            </div>
            <div class="item-objetivo" id="obj-tijeras">
                <div class="contenedor-icono"><img src="./objetos/Tijeras.png" class="icono-objeto" alt="Tijeras"></div>
                <span class="nombre-objeto">Tijeras</span>
            </div>
        `;

        // Añadido el rompenueces al array de IDs
        const idsObjetos = ['boligrafo', 'cintapegante', 'etiquetas', 'lazo','tijeras'];
        idsObjetos.forEach(id => {
            const hitbox = document.createElement('div');
            hitbox.id = `hitbox-${id}`;
            hitbox.className = 'hitbox';  
            hitbox.addEventListener('click', () => this.objetoEncontrado(id));
            escenario.appendChild(hitbox);
        });
    }
};

// Vinculación segura del ciclo de arranque del juego
window.addEventListener('DOMContentLoaded', () => {
    JuegoAdviento.init();
});