import { AcuariosModule } from './modules/acuarios.js';
import { PecesModule } from './modules/peces.js';
import { PuestasModule } from './modules/puestas.js'; 
import { ParametrosModule } from './modules/parametros.js'; 
import { PanelModule } from './modules/panel.js';

const { createApp } = Vue;

const app = createApp({
    components: {
        'modulo-acuarios': AcuariosModule,
        'modulo-peces': PecesModule,
        'modulo-puestas': PuestasModule,
        'modulo-parametros': ParametrosModule,
        'modulo-panel': PanelModule
    },
    data() {
        return {
            seccion: 'peces',
            logeado: false,
            apiBase: 'https://api.sitioz.com/', 
            formLogin: { usuario: '', password: '' },
            errorLogin: ''
        }
    },
    computed: {
        moduloActual() {
            return 'modulo-' + this.seccion;
        }
    },
    mounted() {
        // Verificar sesion al cargar la pagina
        this.verificarSesion();
    },
    methods: {
        async verificarSesion() {
            try {
                const res = await fetch(`${this.apiBase}/verify`, {
                    credentials: 'include' // Importante: enviar la cookie
                });
                if (res.ok) {
                    this.logeado = true;
                } else {
                    this.logeado = false;
                }
            } catch (e) {
                this.logeado = false;
            }
        },
        async hacerLogin() {
            this.errorLogin = '';
            try {
                const res = await fetch(`${this.apiBase}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // Importante: recibir la cookie
                    body: JSON.stringify(this.formLogin)
                });
                const data = await res.json();
                
                if (res.ok && data.status === 'success') {
                    this.logeado = true;
                    this.formLogin = { usuario: '', password: '' }; // Limpiar formulario
                } else {
                    this.errorLogin = data.message || "Acceso incorrecto";
                }
            } catch (e) {
                this.errorLogin = "Error de conexion";
            }
        },
        async cerrarSesion() {
            try {
                await fetch(`${this.apiBase}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (e) {
                console.error('Error al cerrar sesion:', e);
            }
            this.logeado = false;
        }
    }
});

app.mount('#app');