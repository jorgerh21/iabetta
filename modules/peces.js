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
                <!-- Loader de tabla -->
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
                        </tr>
                        <tr v-if="(!lista || lista.length === 0) && !cargando">
                            <td colspan="8" class="text-center text-muted py-4">No hay peces registrados</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal para crear/editar pez -->
        <div class="modal fade" id="modalPez" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content card-custom border-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-info fw-bold">{{ editando ? 'Editar Pez' : 'Registrar Nuevo Pez' }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="cargando" class="text-center py-5">
                            <div class="spinner-border text-info" role="status">
                                <span class="visually-hidden">Guardando...</span>
                            </div>
                            <div class="mt-2">Procesando, por favor espere...</div>
                        </div>
                        <div v-else>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label small">Nombre del pez</label>
                                    <input v-model="form.nombre_pez" type="text" class="form-control custom-input" placeholder="Ej: Azulito">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Especie / Variedad</label>
                                    <select v-model="form.id_especie" class="form-select custom-input">
                                        <option v-for="esp in especies" :value="esp.id_especie">
                                            {{ esp.nombre_cientifico }} - {{ esp.variedad }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Sexo</label>
                                    <select v-model="form.sexo" class="form-select custom-input">
                                        <option value="Macho">Macho</option>
                                        <option value="Hembra">Hembra</option>
                                        <option value="Alevin/Sin sexar">Alevin/Sin sexar</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Acuario</label>
                                    <select v-model="form.id_acuario" class="form-select custom-input">
                                        <option v-for="ac in acuarios" :value="ac.id_acuario">{{ ac.nombre_identificador }}</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small">Estado salud</label>
                                    <select v-model="form.estado_salud" class="form-select custom-input" @change="actualizarDisponibilidadPorSalud">
                                        <option value="Sano">Sano</option>
                                        <option value="Enfermo">Enfermo</option>
                                        <option value="En Tratamiento">En Tratamiento</option>
                                        <option value="Fallecido">Fallecido</option>
                                        <option value="Vendido">Vendido</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Fecha ingreso</label>
                                    <input v-model="form.fecha_ingreso" type="date" class="form-control custom-input">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Procedencia</label>
                                    <input v-model="form.procedencia" type="text" class="form-control custom-input">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Fecha nacimiento (aprox)</label>
                                    <input v-model="form.fecha_nacimiento" type="date" class="form-control custom-input">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Tamaño (cm)</label>
                                    <input v-model.number="form.tamaño_cm" type="number" step="0.1" class="form-control custom-input">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Color principal</label>
                                    <input v-model="form.color_principal" type="text" class="form-control custom-input">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Precio de venta ($)</label>
                                    <input v-model.number="form.precio" type="number" step="0.01" class="form-control custom-input" :disabled="!form.disponible_venta">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Disponible para venta</label>
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" v-model="form.disponible_venta" id="disponibleVenta" :disabled="!puedeSerDisponible()">
                                        <label class="form-check-label" for="disponibleVenta">Sí</label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label small">Descripción corta (para chatbot)</label>
                                    <textarea v-model="form.descripcion_venta" class="form-control custom-input" rows="2" placeholder="Texto atractivo para mostrar en WhatsApp"></textarea>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small">Foto (URL o subir)</label>
                                    <input type="file" @change="onFotoSeleccionada" class="form-control custom-input" accept="image/*">
                                    <div v-if="form.foto" class="mt-2">
                                        <img :src="getImageUrl(form.foto)" width="60" class="rounded">
                                        <button @click="form.foto = null" type="button" class="btn btn-sm btn-danger ms-2">X</button>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <label class="form-label small">Observaciones salud</label>
                                    <textarea v-model="form.observaciones_salud" class="form-control custom-input" rows="2"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal" :disabled="cargando">Cancelar</button>
                        <button @click="guardar" class="btn btn-primary px-4 fw-bold" :disabled="cargando">
                            <span v-if="cargando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de DETALLE del pez -->
        <div class="modal fade" id="modalDetallePez" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content card-custom border-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-info fw-bold">Detalle de {{ pezSeleccionado.nombre_pez || 'Pez' }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="cargando" class="text-center py-5">
                            <div class="spinner-border text-info" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                        <div v-else>
                            <div class="row">
                                <div class="col-md-4 text-center">
                                    <img v-if="pezSeleccionado.foto" :src="getImageUrl(pezSeleccionado.foto)" class="img-fluid rounded" style="max-height: 200px;">
                                    <div v-else class="bg-secondary rounded p-5 text-white">Sin foto</div>
                                </div>
                                <div class="col-md-8">
                                    <table class="table table-sm table-borderless text-white">
                                        <tr><th>Nombre:</th><td>{{ pezSeleccionado.nombre_pez || '--' }}</td></td>
                                        <tr><th>Especie:</th><td>{{ pezSeleccionado.especie_nombre || (especiesMap[pezSeleccionado.id_especie] ? especiesMap[pezSeleccionado.id_especie].nombre_cientifico : 'ID: '+pezSeleccionado.id_especie) }} - {{ pezSeleccionado.variedad || (especiesMap[pezSeleccionado.id_especie] ? especiesMap[pezSeleccionado.id_especie].variedad : '') }}</td></tr>
                                        <tr><th>Sexo:</th><td>{{ pezSeleccionado.sexo || '--' }}</td></tr>
                                        <tr><th>Acuario:</th><td>{{ pezSeleccionado.nombre_acuario || (acuariosMap[pezSeleccionado.id_acuario] ? acuariosMap[pezSeleccionado.id_acuario].nombre_identificador : 'ID: '+pezSeleccionado.id_acuario) }}</td></tr>
                                        <tr><th>Nacimiento:</th><td>{{ pezSeleccionado.fecha_nacimiento || 'Desconocida' }}</td></tr>
                                        <tr><th>Tamaño:</th><td>{{ pezSeleccionado.tamaño_cm ? pezSeleccionado.tamaño_cm + ' cm' : '--' }}</td></tr>
                                        <tr><th>Color:</th><td>{{ pezSeleccionado.color_principal || '--' }}</td></tr>
                                        <tr><th>Ingreso:</th><td>{{ pezSeleccionado.fecha_ingreso || '--' }}</td></tr>
                                        <tr><th>Procedencia:</th><td>{{ pezSeleccionado.procedencia || '--' }}</td></tr>
                                        <tr><th>Precio:</th><td class="text-success fw-bold">{{ formatPrice(pezSeleccionado.precio) }}</td></tr>
                                        <tr><th>Disponible:</th><td><span :class="['badge', pezSeleccionado.disponible_venta ? 'bg-success' : 'bg-secondary']">{{ pezSeleccionado.disponible_venta ? 'Sí' : 'No' }}</span></td></tr>
                                        <tr><th>Descripción venta:</th><td>{{ pezSeleccionado.descripcion_venta || 'Sin descripción' }}</td></tr>
                                        <tr><th>Salud:</th><td :class="getEstadoSaludClass(pezSeleccionado.estado_salud, true)">{{ pezSeleccionado.estado_salud || '--' }}</td></tr>
                                        <tr><th>Observaciones:</th><td>{{ pezSeleccionado.observaciones_salud || '--' }}</td></tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button v-if="pezSeleccionado.disponible_venta && pezSeleccionado.estado_salud !== 'Vendido'" class="btn btn-success" @click="simularVenta(pezSeleccionado)" :disabled="cargando">Marcar como Vendido</button>
                    </div>
                </div>
            </div>
        </div>
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
            form: {
                id_pece: null,
                id_especie: null,
                id_acuario: null,
                nombre_pez: '',
                foto: null,
                sexo: 'Alevin/Sin sexar',
                fecha_nacimiento: null,
                tamaño_cm: null,
                color_principal: '',
                fecha_ingreso: new Date().toISOString().slice(0, 10),
                procedencia: '',
                precio: null,
                disponible_venta: true,
                descripcion_venta: '',
                estado_salud: 'Sano',
                observaciones_salud: ''
            }
        };
    },
    computed: {
        baseUrl() {
            const match = this.apiUrl.match(/^(https?:\/\/[^\/]+)/);
            return match ? match[1] : '';
        },
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
        getImageUrl(photoPath) {
            if (!photoPath) return '';
            if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
                return photoPath;
            }
            return this.baseUrl + '/' + photoPath.replace(/^\/+/, '');
        },
        formatPrice(value) {
            if (value === null || value === undefined) return 'N/A';
            return '$' + parseFloat(value).toFixed(2);
        },
        getEstadoSaludClass(estado, isTableCell = false) {
            const baseClass = isTableCell ? '' : 'badge ';
            switch (estado) {
                case 'Sano':
                    return baseClass + 'bg-success';
                case 'Enfermo':
                    return baseClass + 'bg-warning text-dark';
                case 'En Tratamiento':
                    return baseClass + 'bg-info text-dark';
                case 'Fallecido':
                    return baseClass + 'bg-secondary';
                case 'Vendido':
                    return baseClass + 'bg-primary';
                default:
                    return baseClass + 'bg-light text-dark';
            }
        },
        puedeSerDisponible() {
            const noVenta = ['Enfermo', 'En Tratamiento', 'Fallecido', 'Vendido'];
            return !noVenta.includes(this.form.estado_salud);
        },
        actualizarDisponibilidadPorSalud() {
            if (!this.puedeSerDisponible()) {
                this.form.disponible_venta = false;
            }
        },
        enriquecerListaPeces() {
            if (!Array.isArray(this.lista)) return;
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
        },
        async cargarPeces() {
            this.cargando = true;
            try {
                const res = await fetch(this.apiUrl + '/peces', { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    this.lista = Array.isArray(data) ? data : [];
                    if (this.especies.length && this.acuarios.length) {
                        this.enriquecerListaPeces();
                    }
                } else if (res.status === 401) {
                    this.$root.cerrarSesion();
                } else {
                    this.lista = [];
                }
            } catch (e) {
                console.error(e);
                this.lista = [];
            } finally {
                this.cargando = false;
            }
        },
        async cargarEspecies() {
            const res = await fetch(this.apiUrl + '/especies', { credentials: 'include' });
            if (res.ok) {
                this.especies = await res.json();
                if (this.lista.length) this.enriquecerListaPeces();
            }
        },
        async cargarAcuarios() {
            const res = await fetch(this.apiUrl + '/acuarios', { credentials: 'include' });
            if (res.ok) {
                this.acuarios = await res.json();
                if (this.lista.length) this.enriquecerListaPeces();
            }
        },
        onFotoSeleccionada(e) {
            this.archivoFoto = e.target.files[0];
            if (this.archivoFoto) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.form.foto = ev.target.result;
                };
                reader.readAsDataURL(this.archivoFoto);
            } else {
                this.form.foto = null;
            }
        },
        prepararNuevo() {
            this.editando = false;
            this.archivoFoto = null;
            this.form = {
                id_pece: null,
                id_especie: this.especies[0] ? this.especies[0].id_especie : null,
                id_acuario: this.acuarios[0] ? this.acuarios[0].id_acuario : null,
                nombre_pez: '',
                foto: null,
                sexo: 'Alevin/Sin sexar',
                fecha_nacimiento: null,
                tamaño_cm: null,
                color_principal: '',
                fecha_ingreso: new Date().toISOString().slice(0, 10),
                procedencia: '',
                precio: null,
                disponible_venta: true,
                descripcion_venta: '',
                estado_salud: 'Sano',
                observaciones_salud: ''
            };
        },
        prepararEdicion(pez) {
            if (!pez) return;
            this.editando = true;
            this.archivoFoto = null;
            this.form = JSON.parse(JSON.stringify(pez));
            if (this.form.fecha_ingreso) this.form.fecha_ingreso = this.form.fecha_ingreso.slice(0, 10);
            if (this.form.fecha_nacimiento) this.form.fecha_nacimiento = this.form.fecha_nacimiento.slice(0, 10);
            this.form.disponible_venta = !!this.form.disponible_venta;
            this.actualizarDisponibilidadPorSalud();
        },
        verDetalle(pez) {
            if (!pez) return;
            this.pezSeleccionado = JSON.parse(JSON.stringify(pez));
            if (this.pezSeleccionado.precio === undefined) this.pezSeleccionado.precio = null;
            const modal = new bootstrap.Modal(document.getElementById('modalDetallePez'));
            modal.show();
        },
        async simularVenta(pez) {
            if (!pez) return;
            if (!confirm(`¿Marcar a ${pez.nombre_pez || pez.id_pece} como VENDIDO? Esto lo hará no disponible para venta.`)) return;
            this.cargando = true;
            try {
                const payload = {
                    disponible_venta: 0,
                    estado_salud: 'Vendido'
                };
                const res = await fetch(this.apiUrl + '/peces/' + pez.id_pece, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert('Pez marcado como vendido');
                    await this.cargarPeces();
                    bootstrap.Modal.getInstance(document.getElementById('modalDetallePez')).hide();
                } else {
                    const error = await res.text();
                    alert('Error: ' + error);
                }
            } catch (e) {
                console.error(e);
            } finally {
                this.cargando = false;
            }
        },
        async guardar() {
            this.cargando = true;
            let url = this.editando ? this.apiUrl + '/peces/' + this.form.id_pece : this.apiUrl + '/peces';
            let metodo = this.editando ? 'PUT' : 'POST';
            let body;

            this.actualizarDisponibilidadPorSalud();

            if (this.archivoFoto) {
                const formData = new FormData();
                for (let key in this.form) {
                    if (this.form[key] !== null && this.form[key] !== undefined && key !== 'foto') {
                        formData.append(key, this.form[key]);
                    }
                }
                formData.append('foto', this.archivoFoto);
                if (this.editando) {
                    formData.append('_method', 'PUT');
                    metodo = 'POST';
                }
                body = formData;
            } else {
                body = JSON.stringify(this.form);
            }

            try {
                const res = await fetch(url, {
                    method: metodo,
                    headers: this.archivoFoto ? {} : { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: body
                });
                if (res.ok) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPez'));
                    if (modal) modal.hide();
                    await this.cargarPeces();
                } else if (res.status === 401) {
                    this.$root.cerrarSesion();
                } else {
                    const error = await res.text();
                    alert('Error: ' + error);
                }
            } catch (e) {
                console.error(e);
                alert('Error de red');
            } finally {
                this.cargando = false;
            }
        },
        async confirmarBorrado(id) {
            if (!id) return;
            if (confirm('¿Borrar este pez?')) {
                this.cargando = true;
                try {
                    const res = await fetch(this.apiUrl + '/peces/' + id, { method: 'DELETE', credentials: 'include' });
                    if (res.ok) {
                        await this.cargarPeces();
                    } else if (res.status === 401) {
                        this.$root.cerrarSesion();
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    this.cargando = false;
                }
            }
        }
    },
    async mounted() {
        await Promise.all([
            this.cargarEspecies(),
            this.cargarAcuarios(),
            this.cargarPeces()
        ]);
        if (this.especies.length && this.acuarios.length && this.lista.length) {
            this.enriquecerListaPeces();
        }
    }
};