export const ParametrosModule = {
    props: ['apiUrl'],
    template: `
    <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="text-info m-0 fw-bold">Parámetros de Calidad de Agua</h3>
            <button @click="prepararNuevo" class="btn btn-primary btn-sm shadow-sm px-3" data-bs-toggle="modal" data-bs-target="#modalParametro">
                + Nuevo Registro
            </button>
        </div>

        <!-- Filtro por acuario -->
        <div class="card card-custom border-secondary p-3 mb-4">
            <div class="row align-items-end">
                <div class="col-md-4">
                    <label class="form-label small text-muted">Filtrar por Acuario</label>
                    <select v-model="filtroAcuario" class="form-select custom-input text-white bg-dark">
                        <option value="">Todos los acuarios</option>
                        <option v-for="ac in acuarios" :key="ac.id_acuario" :value="ac.id_acuario">
                            {{ ac.nombre_identificador }}
                        </option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button @click="filtroAcuario = ''" class="btn btn-outline-secondary w-100">Limpiar</button>
                </div>
            </div>
        </div>

        <!-- Listado de registros -->
        <div class="card card-custom border-secondary shadow-sm">
            <div class="table-responsive">
                <table class="table table-dark table-hover m-0">
                    <thead>
                        <tr class="text-muted small">
                            <th>Fecha</th>
                            <th>Acuario</th>
                            <th>pH</th>
                            <th>Temperatura</th>
                            <th>Amonio</th>
                            <th>Nitritos</th>
                            <th>Nitratos</th>
                            <th>GH</th>
                            <th>KH</th>
                            <th>Cambio %</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="reg in listaFiltrada" :key="reg.id_registro" class="align-middle">
                            <td class="small">{{ formatearFecha(reg.fecha_registro) }}</td>
                            <td>{{ nombreAcuario(reg.id_acuario) }}</td>
                            <td :class="alertaPh(reg.ph)">{{ reg.ph ?? '-' }}</td>
                            <td :class="alertaTemp(reg.temperatura)">{{ reg.temperatura ?? '-' }} °C</td>
                            <td :class="alertaAmonio(reg.amonio)">{{ reg.amonio ?? '-' }}</td>
                            <td :class="alertaNitritos(reg.nitritos)">{{ reg.nitritos ?? '-' }}</td>
                            <td>{{ reg.nitratos ?? '-' }}</td>
                            <td>{{ reg.dureza_gh ?? '-' }}</td>
                            <td>{{ reg.dureza_kh ?? '-' }}</td>
                            <td>{{ reg.porcentaje_cambio_agua ?? 0 }}%</td>
                            <td class="text-end">
                                <button @click="prepararEdicion(reg)" class="btn btn-sm btn-outline-warning me-2" data-bs-toggle="modal" data-bs-target="#modalParametro">
                                    Editar
                                </button>
                                <button @click="confirmarBorrado(reg.id_registro)" class="btn btn-sm btn-outline-danger">
                                    Borrar
                                </button>
                            </td>
                        </tr>
                        <tr v-if="listaFiltrada.length === 0">
                            <td colspan="11" class="text-center text-muted py-4">No hay registros de parámetros. ¡Agrega el primero!</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar -->
        <div class="modal fade" id="modalParametro" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content card-custom border-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-info fw-bold">{{ editando ? 'Editar Registro' : 'Nuevo Registro' }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small">Acuario</label>
                                <select v-model="form.id_acuario" class="form-select custom-input text-white bg-dark">
                                    <option v-for="ac in acuarios" :key="ac.id_acuario" :value="ac.id_acuario">
                                        {{ ac.nombre_identificador }}
                                    </option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small">Fecha y Hora</label>
                                <input v-model="form.fecha_registro" type="datetime-local" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">pH</label>
                                <input v-model="form.ph" type="number" step="0.1" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Temperatura (°C)</label>
                                <input v-model="form.temperatura" type="number" step="0.1" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Amonio (mg/L)</label>
                                <input v-model="form.amonio" type="number" step="0.001" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Nitritos (mg/L)</label>
                                <input v-model="form.nitritos" type="number" step="0.001" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Nitratos (mg/L)</label>
                                <input v-model="form.nitratos" type="number" step="0.001" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Dureza GH</label>
                                <input v-model="form.dureza_gh" type="number" step="0.1" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Dureza KH</label>
                                <input v-model="form.dureza_kh" type="number" step="0.1" class="form-control custom-input">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">% Cambio Agua</label>
                                <input v-model="form.porcentaje_cambio_agua" type="number" class="form-control custom-input">
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch mt-4">
                                    <input class="form-check-input" type="checkbox" v-model="form.uso_almendro" true-value="1" false-value="0">
                                    <label class="form-check-label small">¿Hoja de almendro?</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch mt-4">
                                    <input class="form-check-input" type="checkbox" v-model="form.sifoneado_fondo" true-value="1" false-value="0">
                                    <label class="form-check-label small">¿Sifoneado fondo?</label>
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label small">Observaciones</label>
                                <textarea v-model="form.observaciones" class="form-control custom-input" rows="2"></textarea>
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
            lista: [],
            acuarios: [],
            filtroAcuario: '',
            editando: false,
            form: {
                id_registro: null,
                id_acuario: null,
                fecha_registro: new Date().toISOString().slice(0, 16),
                ph: null,
                temperatura: null,
                amonio: null,
                nitritos: null,
                nitratos: null,
                dureza_gh: null,
                dureza_kh: null,
                porcentaje_cambio_agua: 0,
                uso_almendro: 0,
                sifoneado_fondo: 0,
                observaciones: ''
            }
        }
    },
    computed: {
        listaFiltrada() {
            if (!this.filtroAcuario) return this.lista;
            return this.lista.filter(reg => reg.id_acuario == this.filtroAcuario);
        }
    },
    methods: {
        formatearFecha(fechaISO) {
            if (!fechaISO) return '-';
            const fecha = new Date(fechaISO);
            return fecha.toLocaleString();
        },
        nombreAcuario(id) {
            const ac = this.acuarios.find(a => a.id_acuario == id);
            return ac ? ac.nombre_identificador : `ID ${id}`;
        },
        alertaPh(valor) {
            if (!valor) return '';
            if (valor < 6.5 || valor > 7.5) return 'text-warning fw-bold';
            return '';
        },
        alertaTemp(valor) {
            if (!valor) return '';
            if (valor < 24 || valor > 28) return 'text-warning fw-bold';
            return '';
        },
        alertaAmonio(valor) {
            if (!valor) return '';
            if (valor > 0.5) return 'text-danger fw-bold';
            if (valor > 0.2) return 'text-warning fw-bold';
            return '';
        },
        alertaNitritos(valor) {
            if (!valor) return '';
            if (valor > 0.5) return 'text-danger fw-bold';
            if (valor > 0.1) return 'text-warning fw-bold';
            return '';
        },
        async cargarParametros() {
            const res = await fetch(`${this.apiUrl}/parametros`, { credentials: 'include' });
            if (res.ok) this.lista = await res.json();
        },
        async cargarAcuarios() {
            const res = await fetch(`${this.apiUrl}/acuarios`, { credentials: 'include' });
            if (res.ok) this.acuarios = await res.json();
        },
        prepararNuevo() {
            this.editando = false;
            this.form = {
                id_registro: null,
                id_acuario: this.acuarios[0]?.id_acuario || null,
                fecha_registro: new Date().toISOString().slice(0, 16),
                ph: null,
                temperatura: null,
                amonio: null,
                nitritos: null,
                nitratos: null,
                dureza_gh: null,
                dureza_kh: null,
                porcentaje_cambio_agua: 0,
                uso_almendro: 0,
                sifoneado_fondo: 0,
                observaciones: ''
            };
        },
        prepararEdicion(reg) {
            this.editando = true;
            this.form = { ...reg };
            // Ajustar formato datetime-local
            if (this.form.fecha_registro) {
                this.form.fecha_registro = this.form.fecha_registro.slice(0, 16);
            }
            // Asegurar booleanos
            this.form.uso_almendro = this.form.uso_almendro ? 1 : 0;
            this.form.sifoneado_fondo = this.form.sifoneado_fondo ? 1 : 0;
        },
        async guardar() {
            const metodo = this.editando ? 'PUT' : 'POST';
            const url = this.editando 
                ? `${this.apiUrl}/parametros/${this.form.id_registro}` 
                : `${this.apiUrl}/parametros`;

            try {
                const res = await fetch(url, {
                    method: metodo,
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(this.form)
                });
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalParametro'));
                    if (modal) modal.hide();
                    this.cargarParametros();
                } else if (res.status === 401) {
                    alert("Sesión expirada");
                } else {
                    alert("Error al guardar");
                }
            } catch (e) {
                console.error(e);
                alert("Error de conexión");
            }
        },
        async confirmarBorrado(id) {
            if (confirm("¿Eliminar este registro?")) {
                await fetch(`${this.apiUrl}/parametros/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                this.cargarParametros();
            }
        }
    },
    mounted() {
        this.cargarParametros();
        this.cargarAcuarios();
    }
};