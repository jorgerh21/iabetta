export const PecesModule = {
    props: ['apiUrl'],
    template: `
    <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="text-info m-0 fw-bold">Registro de Peces</h3>
            <button @click="prepararNuevo" class="btn btn-primary btn-sm shadow-sm px-3" data-bs-toggle="modal" data-bs-target="#modalPez" :disabled="cargando">
                + Nuevo Pez
            </button>
        </div>

        <div class="card card-custom border-secondary shadow-sm">
            <div class="table-responsive position-relative" style="min-height: 200px;">
                <div v-if="cargando" class="position-absolute top-50 start-50 translate-middle text-center">
                    <div class="spinner-border text-info" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <div class="mt-2 text-muted">Cargando peces...</div>
                </div>
                <table v-else class="table table-dark table-hover m-0">
                    <thead>
                        <tr class="text-muted small">
                            <th>Foto</th>
                            <th>Nombre / Especie</th>
                            <th>Sexo</th>
                            <th>Acuario</th>
                            <th>Precio</th>
                            <th>Disponible</th>
                            <th>Salud</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="pez in lista" :key="pez.id_pece" v-if="pez" class="align-middle" style="cursor:pointer" @click="verDetalle(pez)">
                            <td style="width: 60px;">
                                <img v-if="pez.foto" :src="getImageUrl(pez.foto)" class="rounded-circle" width="40" height="40" style="object-fit: cover;">
                                <div v-else class="bg-secondary rounded-circle d-inline-block" style="width:40px; height:40px;"></div>
                            </td>
                            <td>
                                <div class="fw-bold">{{ pez.nombre_pez || 'Sin nombre' }}</div>
                                <div class="text-muted small">
                                    {{ pez.especie_nombre || (especiesMap[pez.id_especie] ? especiesMap[pez.id_especie].nombre_cientifico : 'ID: '+pez.id_especie) }}
                                    -
                                    {{ pez.variedad || (especiesMap[pez.id_especie] ? especiesMap[pez.id_especie].variedad : '') }}
                                </div>
                            </td>
                            <td>
                                <span :class="['badge', pez.sexo === 'Macho' ? 'bg-primary' : (pez.sexo === 'Hembra' ? 'bg-danger' : 'bg-secondary')]">
                                    {{ pez.sexo }}
                                </span>
                            </td>
                            <td>{{ pez.nombre_acuario || (acuariosMap[pez.id_acuario] ? acuariosMap[pez.id_acuario].nombre_identificador : 'ID: '+pez.id_acuario) }}</td>
                            <td class="fw-bold text-success">{{ formatPrice(pez.precio) }}</td>
                            <td>
                                <span :class="['badge', pez.disponible_venta ? 'bg-success' : 'bg-secondary']">
                                    {{ pez.disponible_venta ? 'Sí' : 'No' }}
                                </span>
                            </td>
                            <td>
                                <span :class="getEstadoSaludClass(pez.estado_salud)">
                                    {{ pez.estado_salud }}
                                </span>
                            </td>
                            <td class="text-end" @click.stop>
                                <button @click="prepararEdicion(pez)" class="btn btn-sm btn-outline-warning me-2" data-bs-toggle="modal" data-bs-target="#modalPez" :disabled="cargando">
                                    Editar
                                </button>
                                <button @click="confirmarBorrado(pez.id_pece)" class="btn btn-sm btn-outline-danger" :disabled="cargando">
                                    Borrar
                                </button>
                            </td>
                        </td>
                        <tr v-if="(!lista || lista.length === 0) && !cargando">
                            <td colspan="8" class="text-center text-muted py-4">No hay peces registrados</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar pez (igual que antes, pero no lo copio entero por brevedad, lo dejaremos igual) -->
        <!-- ... el resto del template se mantiene igual ... -->
    </div>
    `,
    data() {
        return {
            lista: [],
            especies: [],
            acuarios: [],
            editando: false,
            archivoFoto: null,
            cargando: false,
            pezSeleccionado: {
                id_pece: null,
                nombre_pez: '',
                foto: null,
                precio: null,
                disponible_venta: false,
                estado_salud: ''
            },
            form: { /* ... mismo de antes ... */ }
        };
    },
    computed: {
        baseUrl() {
            const match = this.apiUrl.match(/^(https?:\/\/[^\/]+)/);
            return match ? match[1] : '';
        },
        // Mapas para acceso rápido en el template
        especiesMap() {
            const map = {};
            this.especies.forEach(esp => {
                map[esp.id_especie] = esp;
            });
            return map;
        },
        acuariosMap() {
            const map = {};
            this.acuarios.forEach(ac => {
                map[ac.id_acuario] = ac;
            });
            return map;
        }
    },
    methods: {
        getImageUrl(photoPath) { /* ... igual ... */ },
        formatPrice(value) { /* ... igual ... */ },
        getEstadoSaludClass(estado) { /* ... igual ... */ },
        puedeSerDisponible() { /* ... igual ... */ },
        actualizarDisponibilidadPorSalud() { /* ... igual ... */ },
        onFotoSeleccionada(e) { /* ... igual ... */ },
        
        // NUEVO método para enriquecer SIN eliminar peces
        enriquecerListaPeces() {
            if (!Array.isArray(this.lista)) return;
            // Creamos mapas locales
            const especiesMap = new Map();
            this.especies.forEach(esp => {
                especiesMap.set(esp.id_especie, {
                    nombre: esp.nombre_cientifico,
                    variedad: esp.variedad
                });
            });
            const acuariosMap = new Map();
            this.acuarios.forEach(ac => {
                acuariosMap.set(ac.id_acuario, ac.nombre_identificador);
            });

            // Enriquecer cada pez, pero sin filtrar ninguno
            this.lista = this.lista.map(pez => {
                if (!pez) return null;
                const especieInfo = especiesMap.get(pez.id_especie) || {};
                return {
                    ...pez,
                    especie_nombre: especieInfo.nombre || null,
                    variedad: especieInfo.variedad || null,
                    nombre_acuario: acuariosMap.get(pez.id_acuario) || null
                };
            }).filter(pez => pez !== null);
            
            console.log('Peces después de enriquecer:', this.lista);
        },
        
        async cargarPeces() {
            this.cargando = true;
            try {
                const res = await fetch(this.apiUrl + '/peces', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    console.log('Datos recibidos de /peces:', data);
                    // Asegurar que data sea un array
                    this.lista = Array.isArray(data) ? data : [];
                    // Si no hay especies o acuarios aún, igual mostramos los peces (con IDs)
                    // Luego cuando se carguen especies/acuarios se enriquecerán de nuevo
                    if (this.especies.length && this.acuarios.length) {
                        this.enriquecerListaPeces();
                    }
                } else if (res.status === 401) {
                    this.$root.cerrarSesion();
                } else {
                    console.error('Error al cargar peces:', res.status);
                    this.lista = [];
                }
            } catch (e) {
                console.error('Excepción en cargarPeces:', e);
                this.lista = [];
            } finally {
                this.cargando = false;
            }
        },
        
        async cargarEspecies() {
            const res = await fetch(this.apiUrl + '/especies', { credentials: 'include' });
            if (res.ok) {
                this.especies = await res.json();
                console.log('Especies cargadas:', this.especies);
                // Si ya hay peces, enriquecerlos
                if (this.lista.length) this.enriquecerListaPeces();
            }
        },
        
        async cargarAcuarios() {
            const res = await fetch(this.apiUrl + '/acuarios', { credentials: 'include' });
            if (res.ok) {
                this.acuarios = await res.json();
                console.log('Acuarios cargados:', this.acuarios);
                if (this.lista.length) this.enriquecerListaPeces();
            }
        },
        
        prepararNuevo() { /* ... igual ... */ },
        prepararEdicion(pez) { /* ... igual ... */ },
        verDetalle(pez) { /* ... igual ... */ },
        async simularVenta(pez) { /* ... igual ... */ },
        async guardar() { /* ... igual ... */ },
        async confirmarBorrado(id) { /* ... igual ... */ }
    },
    async mounted() {
        await Promise.all([
            this.cargarEspecies(),
            this.cargarAcuarios(),
            this.cargarPeces()
        ]);
        // Al final, aseguramos enriquecimiento por si acaso
        if (this.especies.length && this.acuarios.length && this.lista.length) {
            this.enriquecerListaPeces();
        }
    }
};