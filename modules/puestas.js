export const PuestasModule = {
    props: ['apiUrl'],
    template: `
    <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="text-info m-0 fw-bold">Gestión de Reproducción</h3>
            <button @click="prepararNuevo" class="btn btn-primary btn-sm shadow-sm px-3" data-bs-toggle="modal" data-bs-target="#modalPuesta">
                + Nueva Puesta
            </button>
        </div>

        <div class="card card-custom border-secondary shadow-sm">
            <div class="table-responsive">
                <table class="table table-dark table-hover m-0">
                    <thead>
                        <tr class="text-muted small">
                            <th>ID / Pareja</th>
                            <th>Fechas</th>
                            <th>Estado</th>
                            <th>Huevos / Alevines</th>
                            <th>Acuario Cría</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="puesta in lista" :key="puesta.id_puesta" class="align-middle">
                            <td>
                                <div class="fw-bold text-white">#{{ puesta.id_puesta }}</div>
                                <div class="small">
                                    <span class="text-info">M:</span> {{ nombreMacho(puesta.id_macho) }}<br>
                                    <span class="text-info">H:</span> {{ nombreHembra(puesta.id_hembra) }}
                                </div>
                            </td>
                            <td class="small">
                                <div>Juntado: {{ puesta.fecha_juntado || '-' }}</div>
                                <div>Desove: {{ puesta.fecha_desove || '-' }}</div>
                            </td>
                            <td>
                                <span :class="estadoBadge(puesta.estado_puesta)" class="badge">
                                    {{ puesta.estado_puesta || 'Sin definir' }}
                                </span>
                            </td>
                            <td class="small">
                                🥚 {{ puesta.cantidad_huevos ?? '-' }}<br>
                                🐟 {{ puesta.cantidad_alevines ?? '-' }}
                            </td>
                            <td>
                                <span class="badge bg-dark border border-secondary text-info">
                                    {{ nombreAcuario(puesta.id_acuario_cria) }}
                                </span>
                            </td>
                            <td class="text-end">
                                <button @click="prepararEdicion(puesta)" class="btn btn-sm btn-outline-warning me-2" data-bs-toggle="modal" data-bs-target="#modalPuesta">
                                    Editar
                                </button>
                                <button @click="confirmarBorrado(puesta.id_puesta)" class="btn btn-sm btn-outline-danger">
                                    Borrar
                                </button>
                            </td>
                        </tr>
                        <tr v-if="lista.length === 0">
                            <td colspan="6" class="text-center text-muted py-4">No hay registros de puestas. ¡Agrega la primera!</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar puesta -->
        <div class="modal fade" id="modalPuesta" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content card-custom border-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-info fw-bold">{{ editando ? 'Editar Puesta' : 'Registrar Nueva Puesta' }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small">Macho</label>
                                <select v-model="form.id_macho" class="form-select custom-input text-white bg-dark">
                                    <option v-for="pez in pecesMacho" :key="pez.id_pece" :value="pez.id_pece">
                                        {{ pez.nombre_pez || '#'+pez.id_pece }} - {{ pez.variedad || pez.id_especie }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small">Hembra</label>
                                <select v-model="form.id_hembra" class="form-select custom-input text-white bg-dark">
                                    <option v-for="pez in pecesHembra" :key="pez.id_pece" :value="pez.id_pece">
                                        {{ pez.nombre_pez || '#'+pez.id_pece }} - {{ pez.variedad || pez.id_especie }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small">Acuario de Cría</label>
                                <select v-model="form.id_acuario_cria" class="form-select custom-input text-white bg-dark">
                                    <option v-for="ac in acuarios" :key="ac.id_acuario" :value="ac.id_acuario">
                                        {{ ac.nombre_identificador }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Fecha Juntado</label>
                                <input v-model="form.fecha_juntado" type="date" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Fecha Desove</label>
                                <input v-model="form.fecha_desove" type="date" class="form-control custom-input">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small">Estado de la Puesta</label>
                                <select v-model="form.estado_puesta" class="form-select custom-input text-white bg-dark">
                                    <option value="Nido">Nido</option>
                                    <option value="Huevos">Huevos</option>
                                    <option value="Alevines-Infusorios">Alevines - Infusorios</option>
                                    <option value="Alevines-Artemia">Alevines - Artemia</option>
                                    <option value="Juveniles">Juveniles</option>
                                    <option value="Fallida">Fallida</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Cantidad Huevos</label>
                                <input v-model="form.cantidad_huevos" type="number" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Cantidad Alevines</label>
                                <input v-model="form.cantidad_alevines" type="number" class="form-control custom-input">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small">Clima Exterior</label>
                                <input v-model="form.clima_exterior" type="text" class="form-control custom-input" placeholder="Ej: Soleado, Lluvioso">
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch mt-4">
                                    <input class="form-check-input" type="checkbox" v-model="form.tapa_puesta" true-value="1" false-value="0">
                                    <label class="form-check-label small">¿Usó tapa?</label>
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label small">Observaciones Genéticas</label>
                                <textarea v-model="form.observaciones_geneticas" class="form-control custom-input" rows="2" placeholder="Notas sobre colores, patrones, etc."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Cancelar</button>
                        <button @click="guardar" class="btn btn-primary px-4 fw-bold">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            lista: [],           // puestas
            todosLosPeces: [],   // todos los peces (para mapear nombres)
            pecesMacho: [],      // filtrados
            pecesHembra: [],
            acuarios: [],
            editando: false,
            form: {
                id_puesta: null,
                id_macho: null,
                id_hembra: null,
                id_acuario_cria: null,
                fecha_juntado: '',
                fecha_desove: '',
                estado_puesta: 'Nido',
                cantidad_huevos: null,
                cantidad_alevines: null,
                clima_exterior: '',
                tapa_puesta: 1,
                observaciones_geneticas: ''
            }
        }
    },
    methods: {
        estadoBadge(estado) {
            const clases = {
                'Nido': 'bg-secondary',
                'Huevos': 'bg-warning text-dark',
                'Alevines-Infusorios': 'bg-info',
                'Alevines-Artemia': 'bg-primary',
                'Juveniles': 'bg-success',
                'Fallida': 'bg-danger'
            };
            return clases[estado] || 'bg-secondary';
        },
        nombreMacho(id) {
            const pez = this.todosLosPeces.find(p => p.id_pece == id);
            return pez ? (pez.nombre_pez || `#${pez.id_pece} - ${pez.variedad || pez.id_especie}`) : `ID ${id}`;
        },
        nombreHembra(id) {
            return this.nombreMacho(id); // misma lógica
        },
        nombreAcuario(id) {
            const ac = this.acuarios.find(a => a.id_acuario == id);
            return ac ? ac.nombre_identificador : `ID ${id}`;
        },
        async cargarPuestas() {
            const res = await fetch(`${this.apiUrl}/reproducciones`, { credentials: 'include' });
            if (res.ok) this.lista = await res.json();
        },
        async cargarPeces() {
            const res = await fetch(`${this.apiUrl}/peces`, { credentials: 'include' });
            if (res.ok) {
                this.todosLosPeces = await res.json();
                this.pecesMacho = this.todosLosPeces.filter(p => p.sexo === 'Macho' && p.estado_salud !== 'Fallecido');
                this.pecesHembra = this.todosLosPeces.filter(p => p.sexo === 'Hembra' && p.estado_salud !== 'Fallecido');
            }
        },
        async cargarAcuarios() {
            const res = await fetch(`${this.apiUrl}/acuarios`, { credentials: 'include' });
            if (res.ok) this.acuarios = await res.json();
        },
        prepararNuevo() {
            this.editando = false;
            this.form = {
                id_puesta: null,
                id_macho: this.pecesMacho[0]?.id_pece || null,
                id_hembra: this.pecesHembra[0]?.id_pece || null,
                id_acuario_cria: this.acuarios[0]?.id_acuario || null,
                fecha_juntado: new Date().toISOString().substr(0,10),
                fecha_desove: '',
                estado_puesta: 'Nido',
                cantidad_huevos: null,
                cantidad_alevines: null,
                clima_exterior: '',
                tapa_puesta: 1,
                observaciones_geneticas: ''
            };
        },
        prepararEdicion(puesta) {
            this.editando = true;
            this.form = { ...puesta };
            this.form.tapa_puesta = this.form.tapa_puesta ? 1 : 0;
        },
        async guardar() {
            const metodo = this.editando ? 'PUT' : 'POST';
            const url = this.editando 
                ? `${this.apiUrl}/reproducciones/${this.form.id_puesta}` 
                : `${this.apiUrl}/reproducciones`;

            try {
                const res = await fetch(url, {
                    method: metodo,
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(this.form)
                });
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPuesta'));
                    if (modal) modal.hide();
                    this.cargarPuestas();
                } else if (res.status === 401) {
                    alert("Sesión expirada, vuelva a iniciar sesión.");
                } else {
                    alert("Error al guardar la puesta.");
                }
            } catch (e) {
                console.error(e);
                alert("Error de conexión.");
            }
        },
        async confirmarBorrado(id) {
            if (confirm("¿Eliminar este registro de reproducción?")) {
                await fetch(`${this.apiUrl}/reproducciones/${id}`, { 
                    method: 'DELETE',
                    credentials: 'include'
                });
                this.cargarPuestas();
            }
        }
    },
    mounted() {
        this.cargarPuestas();
        this.cargarPeces();
        this.cargarAcuarios();
    }
};