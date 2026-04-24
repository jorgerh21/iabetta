export const AcuariosModule = {
    props: ['apiUrl'],
    template: `
    <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="text-info m-0 fw-bold">Gestión de Acuarios</h3>
            <button @click="prepararNuevo" class="btn btn-primary btn-sm shadow-sm px-3" data-bs-toggle="modal" data-bs-target="#modalAcuario">
                + Nuevo Acuario
            </button>
        </div>

        <div class="row g-3">
            <div v-for="acuario in lista" :key="acuario.id_acuario" class="col-12 col-md-6 col-lg-4">
                <div class="card card-custom h-100 p-3 shadow-sm border-secondary">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="text-info m-0 fw-bold">{{ acuario.nombre_identificador }}</h5>
                            <span class="text-muted small">{{ acuario.tipo_acuario }}</span>
                        </div>
                        <span class="badge bg-dark border border-info text-info px-3 py-2">
                            {{ acuario.litraje_real }} L
                        </span>
                    </div>
                    
                    <!-- Datos técnicos -->
                    <div class="mt-2 small text-muted">
                        <div v-if="acuario.volumen_agua_actual">💧 Vol. agua: {{ acuario.volumen_agua_actual }} L</div>
                        <div>⚙️ Estabilidad: {{ acuario.estado_estabilidad || 'N/A' }}</div>
                        <div>🧱 Material: {{ acuario.material_base || 'N/A' }}</div>
                    </div>

                    <!-- Fechas de mantenimiento -->
                    <div class="mt-2 small">
                        <div class="text-info">🕒 Último mantenimiento:</div>
                        <div>{{ ultimoMantenimiento(acuario.id_acuario) || 'Sin registros' }}</div>
                        <div class="text-warning mt-1">🔮 Próximo mantenimiento:</div>
                        <div>{{ proximoMantenimiento(acuario.id_acuario) || 'No programado' }}</div>
                    </div>

                    <!-- Botones -->
                    <div class="d-flex gap-2 mt-4">
                        <button @click="prepararEdicion(acuario)" class="btn btn-outline-warning btn-sm flex-grow-1" data-bs-toggle="modal" data-bs-target="#modalAcuario">
                            ✏️ Editar
                        </button>
                        <button @click="abrirModalMantenimiento(acuario)" class="btn btn-outline-info btn-sm flex-grow-1" data-bs-toggle="modal" data-bs-target="#modalMantenimiento">
                            ➕ Mantenimiento
                        </button>
                        <button @click="confirmarBorrado(acuario.id_acuario)" class="btn btn-outline-danger btn-sm px-3">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
            <div v-if="lista.length === 0" class="text-center py-5 text-muted">
                <p>No hay acuarios registrados. ¡Agrega el primero!</p>
            </div>
        </div>

        <!-- MODAL: Acuario (Crear/Editar) -->
        <div class="modal fade" id="modalAcuario" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content card-custom border-secondary shadow-lg">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-info fw-bold">
                            {{ editando ? 'Actualizar Acuario' : 'Nuevo Acuario' }}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label small">Nombre identificador</label>
                            <input v-model="form.nombre_identificador" type="text" class="form-control custom-input" placeholder="Ej: Estante A1">
                        </div>
                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="form-label small">Tipo</label>
                                <select v-model="form.tipo_acuario" class="form-select custom-input">
                                    <option value="Cría">Cría</option>
                                    <option value="Engorde">Engorde</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Comunitario">Comunitario</option>
                                    <option value="Hospital">Hospital</option>
                                </select>
                            </div>
                            <div class="col-6 mb-3">
                                <label class="form-label small">Litraje real (L)</label>
                                <input v-model.number="form.litraje_real" type="number" step="0.01" class="form-control custom-input">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-6 mb-3">
                                <label class="form-label small">Material base</label>
                                <select v-model="form.material_base" class="form-select custom-input">
                                    <option value="">Seleccionar</option>
                                    <option value="Hierro">Hierro</option>
                                    <option value="Madera">Madera</option>
                                    <option value="Vidrio directo">Vidrio directo</option>
                                </select>
                            </div>
                            <div class="col-6 mb-3">
                                <label class="form-label small">Estado estabilidad</label>
                                <select v-model="form.estado_estabilidad" class="form-select custom-input">
                                    <option value="">Seleccionar</option>
                                    <option value="Ciclado">Ciclado</option>
                                    <option value="Nuevo/En Ciclado">Nuevo/En Ciclado</option>
                                    <option value="Inestable">Inestable</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small">Volumen agua actual (L)</label>
                            <input v-model.number="form.volumen_agua_actual" type="number" step="0.01" class="form-control custom-input">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small">Notas estructura</label>
                            <textarea v-model="form.notas_estructura" class="form-control custom-input" rows="2"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Cancelar</button>
                        <button @click="guardar" class="btn btn-primary px-4 fw-bold">Guardar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL: Mantenimiento (Registrar parámetros) -->
        <div class="modal fade" id="modalMantenimiento" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content card-custom border-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-info fw-bold">
                            Registrar Mantenimiento - {{ acuarioSeleccionado?.nombre_identificador }}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small">📅 Fecha y hora</label>
                                <input v-model="mantenimientoForm.fecha_registro" type="datetime-local" class="form-control custom-input">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small">💧 % Cambio agua</label>
                                <input v-model.number="mantenimientoForm.porcentaje_cambio_agua" type="number" class="form-control custom-input">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small">🧪 pH</label>
                                <input v-model.number="mantenimientoForm.ph" type="number" step="0.1" class="form-control custom-input">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small">🌡️ Temperatura (°C)</label>
                                <input v-model.number="mantenimientoForm.temperatura" type="number" step="0.1" class="form-control custom-input">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small">🧴 Amonio (mg/L)</label>
                                <input v-model.number="mantenimientoForm.amonio" type="number" step="0.001" class="form-control custom-input">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small">🧪 Nitritos (mg/L)</label>
                                <input v-model.number="mantenimientoForm.nitritos" type="number" step="0.001" class="form-control custom-input">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small">🌿 Nitratos (mg/L)</label>
                                <input v-model.number="mantenimientoForm.nitratos" type="number" step="0.001" class="form-control custom-input">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small">💎 GH (dureza)</label>
                                <input v-model.number="mantenimientoForm.dureza_gh" type="number" step="0.1" class="form-control custom-input">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small">🧼 KH (alcalinidad)</label>
                                <input v-model.number="mantenimientoForm.dureza_kh" type="number" step="0.1" class="form-control custom-input">
                            </div>
                            <div class="col-md-12">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" v-model="mantenimientoForm.uso_almendro" true-value="1" false-value="0">
                                    <label class="form-check-label small">🌿 Hoja de almendro</label>
                                </div>
                                <div class="form-check form-switch mt-1">
                                    <input class="form-check-input" type="checkbox" v-model="mantenimientoForm.sifoneado_fondo" true-value="1" false-value="0">
                                    <label class="form-check-label small">🧹 Sifoneado de fondo</label>
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label small">📝 Observaciones</label>
                                <textarea v-model="mantenimientoForm.observaciones" class="form-control custom-input" rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Cancelar</button>
                        <button @click="guardarMantenimiento" class="btn btn-primary px-4 fw-bold">Guardar Mantenimiento</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            lista: [],                 // acuarios
            mantenimientos: [],        // todos los registros de mantenimiento_parametros
            editando: false,
            acuarioSeleccionado: null,
            form: {
                id_acuario: null,
                nombre_identificador: '',
                litraje_real: 0,
                volumen_agua_actual: null,
                tipo_acuario: 'Comunitario',
                material_base: '',
                estado_estabilidad: '',
                notas_estructura: ''
            },
            mantenimientoForm: {
                id_acuario: null,
                fecha_registro: '',
                porcentaje_cambio_agua: 20,
                ph: 7.0,
                temperatura: 26.0,
                amonio: 0.0,
                nitritos: 0.0,
                nitratos: 5.0,
                dureza_gh: 8.0,
                dureza_kh: 4.0,
                uso_almendro: 0,
                sifoneado_fondo: 0,
                observaciones: ''
            }
        }
    },
    methods: {
        async cargarAcuarios() {
            try {
                const res = await fetch(`${this.apiUrl}/acuarios`, { credentials: 'include' });
                if (res.ok) this.lista = await res.json();
                else if (res.status === 401) this.$root.cerrarSesion();
            } catch (e) { console.error(e); }
        },
        async cargarMantenimientos() {
            try {
                const res = await fetch(`${this.apiUrl}/mantenimiento_parametros`, { credentials: 'include' });
                if (res.ok) this.mantenimientos = await res.json();
                else if (res.status === 401) this.$root.cerrarSesion();
            } catch (e) { console.error(e); }
        },
        // Obtener el último registro de mantenimiento para un acuario
        ultimoMantenimiento(idAcuario) {
            const registros = this.mantenimientos.filter(m => m.id_acuario == idAcuario);
            if (registros.length === 0) return null;
            const ultimo = registros.reduce((a, b) => new Date(a.fecha_registro) > new Date(b.fecha_registro) ? a : b);
            return this.formatearFecha(ultimo.fecha_registro);
        },
        // Calcular próxima fecha (último + 7 días)
        proximoMantenimiento(idAcuario) {
            const registros = this.mantenimientos.filter(m => m.id_acuario == idAcuario);
            if (registros.length === 0) return null;
            const ultimo = registros.reduce((a, b) => new Date(a.fecha_registro) > new Date(b.fecha_registro) ? a : b);
            const fechaUlt = new Date(ultimo.fecha_registro);
            fechaUlt.setDate(fechaUlt.getDate() + 7);
            return this.formatearFecha(fechaUlt.toISOString());
        },
        formatearFecha(fechaISO) {
            if (!fechaISO) return '';
            const fecha = new Date(fechaISO);
            return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        },
        prepararNuevo() {
            this.editando = false;
            this.form = {
                id_acuario: null,
                nombre_identificador: '',
                litraje_real: 0,
                volumen_agua_actual: null,
                tipo_acuario: 'Comunitario',
                material_base: '',
                estado_estabilidad: '',
                notas_estructura: ''
            };
        },
        prepararEdicion(acuario) {
            this.editando = true;
            this.form = { ...acuario };
        },
        async guardar() {
            const metodo = this.editando ? 'PUT' : 'POST';
            const url = this.editando ? `${this.apiUrl}/acuarios/${this.form.id_acuario}` : `${this.apiUrl}/acuarios`;
            try {
                const res = await fetch(url, {
                    method: metodo,
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(this.form)
                });
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAcuario'));
                    modal.hide();
                    this.cargarAcuarios();
                } else if (res.status === 401) this.$root.cerrarSesion();
                else alert('Error al guardar');
            } catch (e) { console.error(e); }
        },
        async confirmarBorrado(id) {
            if (confirm('¿Eliminar este acuario?')) {
                try {
                    const res = await fetch(`${this.apiUrl}/acuarios/${id}`, { method: 'DELETE', credentials: 'include' });
                    if (res.ok) this.cargarAcuarios();
                    else if (res.status === 401) this.$root.cerrarSesion();
                } catch (e) { console.error(e); }
            }
        },
        // Abre el modal de mantenimiento con auto-llenado (últimos valores o estándar)
        abrirModalMantenimiento(acuario) {
            this.acuarioSeleccionado = acuario;
            
            // Filtrar mantenimientos de este acuario
            const registros = this.mantenimientos.filter(m => m.id_acuario == acuario.id_acuario);
            let ultimo = null;
            if (registros.length > 0) {
                ultimo = registros.reduce((a, b) => new Date(a.fecha_registro) > new Date(b.fecha_registro) ? a : b);
            }
            
            // Fecha actual en formato datetime-local (YYYY-MM-DDThh:mm)
            const ahora = new Date();
            const fechaActual = ahora.toISOString().slice(0, 16);
            
            if (ultimo) {
                // Usar valores del último registro (excepto fecha)
                this.mantenimientoForm = {
                    id_acuario: acuario.id_acuario,
                    fecha_registro: fechaActual,
                    porcentaje_cambio_agua: ultimo.porcentaje_cambio_agua ?? 20,
                    ph: ultimo.ph ?? 7.0,
                    temperatura: ultimo.temperatura ?? 26.0,
                    amonio: ultimo.amonio ?? 0.0,
                    nitritos: ultimo.nitritos ?? 0.0,
                    nitratos: ultimo.nitratos ?? 5.0,
                    dureza_gh: ultimo.dureza_gh ?? 8.0,
                    dureza_kh: ultimo.dureza_kh ?? 4.0,
                    uso_almendro: ultimo.uso_almendro ?? 0,
                    sifoneado_fondo: ultimo.sifoneado_fondo ?? 0,
                    observaciones: ultimo.observaciones ?? ''
                };
            } else {
                // Valores estándar (primer mantenimiento)
                this.mantenimientoForm = {
                    id_acuario: acuario.id_acuario,
                    fecha_registro: fechaActual,
                    porcentaje_cambio_agua: 20,
                    ph: 7.0,
                    temperatura: 26.0,
                    amonio: 0.0,
                    nitritos: 0.0,
                    nitratos: 5.0,
                    dureza_gh: 8.0,
                    dureza_kh: 4.0,
                    uso_almendro: 0,
                    sifoneado_fondo: 0,
                    observaciones: ''
                };
            }
        },
        async guardarMantenimiento() {
            try {
                const datos = { ...this.mantenimientoForm };
                // Asegurar valores numéricos
                datos.porcentaje_cambio_agua = Number(datos.porcentaje_cambio_agua);
                datos.ph = datos.ph ? Number(datos.ph) : null;
                datos.temperatura = datos.temperatura ? Number(datos.temperatura) : null;
                datos.amonio = datos.amonio ? Number(datos.amonio) : null;
                datos.nitritos = datos.nitritos ? Number(datos.nitritos) : null;
                datos.nitratos = datos.nitratos ? Number(datos.nitratos) : null;
                datos.dureza_gh = datos.dureza_gh ? Number(datos.dureza_gh) : null;
                datos.dureza_kh = datos.dureza_kh ? Number(datos.dureza_kh) : null;
                
                const res = await fetch(`${this.apiUrl}/mantenimiento_parametros`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(datos)
                });
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalMantenimiento'));
                    modal.hide();
                    await this.cargarMantenimientos();  // recargar lista
                    this.cargarAcuarios();              // refrescar fechas en tarjetas
                } else if (res.status === 401) {
                    this.$root.cerrarSesion();
                } else {
                    const err = await res.json();
                    alert('Error al guardar mantenimiento: ' + (err.message || 'desconocido'));
                }
            } catch (e) {
                console.error(e);
                alert('Error de conexión');
            }
        }
    },
    mounted() {
        this.cargarAcuarios();
        this.cargarMantenimientos();
    }
};