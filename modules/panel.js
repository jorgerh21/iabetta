export const PanelModule = {
    props: ['apiUrl'],
    template: `
    <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="text-info m-0 fw-bold">Panel de Administracion</h3>
        </div>

        <!-- Pestañas de navegacion -->
        <ul class="nav nav-tabs border-secondary mb-4">
            <li class="nav-item">
                <button @click="seccion = 'dashboard'" :class="['nav-link', seccion === 'dashboard' ? 'active text-info border-info' : 'text-muted']">
                    Dashboard
                </button>
            </li>
            <li class="nav-item">
                <button @click="seccion = 'usuarios'" :class="['nav-link', seccion === 'usuarios' ? 'active text-info border-info' : 'text-muted']">
                    Usuarios
                </button>
            </li>
            <li class="nav-item">
                <button @click="seccion = 'papelera'" :class="['nav-link', seccion === 'papelera' ? 'active text-info border-info' : 'text-muted']">
                    Papelera
                </button>
            </li>
            <li class="nav-item">
                <button @click="seccion = 'especies'" :class="['nav-link', seccion === 'especies' ? 'active text-info border-info' : 'text-muted']">
                    Especies
                </button>
            </li>
            <li class="nav-item">
                <button @click="seccion = 'configuracion'" :class="['nav-link', seccion === 'configuracion' ? 'active text-info border-info' : 'text-muted']">
                    Configuracion
                </button>
            </li>
        </ul>

        <!-- DASHBOARD -->
        <div v-if="seccion === 'dashboard'">
            <div class="row g-3">
                <div class="col-md-3">
                    <div class="card-custom p-3 text-center">
                        <div class="display-6 text-info">{{ stats.totalPeces || 0 }}</div>
                        <div class="small text-muted">Peces totales</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card-custom p-3 text-center">
                        <div class="display-6 text-success">{{ stats.pecesVendidos || 0 }}</div>
                        <div class="small text-muted">Peces vendidos</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card-custom p-3 text-center">
                        <div class="display-6 text-warning">{{ stats.acuariosActivos || 0 }}</div>
                        <div class="small text-muted">Acuarios activos</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card-custom p-3 text-center">
                        <div class="display-6 text-primary">{{ stats.ventasMes || 0 }}</div>
                        <div class="small text-muted">Ventas este mes</div>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card-custom p-3">
                        <h6 class="text-info">Ultimas ventas</h6>
                        <div class="table-responsive">
                            <table class="table table-sm table-dark">
                                <thead>
                                    <tr>
                                        <th>Pez</th>
                                        <th>Cliente</th>
                                        <th>Precio</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="venta in ultimasVentas" :key="venta.id_pece">
                                        <td>{{ venta.nombre_pez ? venta.nombre_pez : '#'+venta.id_pece }}</td>
                                        <td>{{ venta.cliente_nombre ? venta.cliente_nombre : '-' }}</td>
                                        <td>{{ formatNumber(venta.precio_venta) }}</td>
                                        <td>{{ venta.fecha_venta }}</td>
                                    </tr>
                                    <tr v-if="ultimasVentas.length === 0">
                                        <td colspan="4" class="text-muted text-center">Sin ventas registradas</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- USUARIOS -->
        <div v-if="seccion === 'usuarios'">
            <div class="card-custom p-3">
                <button @click="nuevoUsuario" class="btn btn-sm btn-primary mb-3">+ Nuevo usuario</button>
                <div class="table-responsive">
                    <table class="table table-dark table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Usuario</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in usuarios" :key="user.id_usuario">
                                <td>{{ user.id_usuario }}</td>
                                <td>{{ user.usuario }}</td>
                                <td>{{ user.nombre }}</td>
                                <td>{{ user.email }}</td>
                                <td>
                                    <select v-model="user.rol" @change="actualizarRol(user)" class="form-select form-select-sm bg-dark" style="width: 120px;">
                                        <option value="admin">Admin</option>
                                        <option value="criador">Criador</option>
                                        <option value="visitante">Visitante</option>
                                    </select>
                                </td>
                                <td>
                                    <button @click="resetPassword(user)" class="btn btn-sm btn-outline-warning">Reset</button>
                                    <button v-if="user.id_usuario !== usuarioActualId" @click="eliminarUsuario(user.id_usuario)" class="btn btn-sm btn-outline-danger ms-1">Borrar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- PAPELERA -->
        <div v-if="seccion === 'papelera'">
            <div class="card-custom p-3">
                <div class="mb-3">
                    <label class="small me-2">Tabla:</label>
                    <select v-model="papeleraTabla" @change="cargarPapelera" class="form-select custom-input w-auto d-inline-block">
                        <option value="peces">Peces</option>
                        <option value="acuarios">Acuarios</option>
                        <option value="puestas_reproduccion">Puestas</option>
                    </select>
                </div>
                <div class="table-responsive">
                    <table class="table table-dark table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre/Identificador</th>
                                <th>Fecha eliminacion</th>
                                <th>Accion</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in papeleraItems" :key="item.id">
                                <td>{{ item.id }}</td>
                                <td>{{ item.nombre }}</td>
                                <td>{{ formatFecha(item.deleted_at) }}</td>
                                <td>
                                    <button @click="restaurarItem(item)" class="btn btn-sm btn-outline-success">Restaurar</button>
                                </td>
                            </tr>
                            <tr v-if="papeleraItems.length === 0">
                                <td colspan="4" class="text-muted text-center">No hay registros eliminados</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ESPECIES -->
        <div v-if="seccion === 'especies'">
            <div class="card-custom p-3">
                <button @click="nuevaEspecie" class="btn btn-sm btn-primary mb-3">+ Nueva especie/variedad</button>
                <div class="table-responsive">
                    <table class="table table-dark table-sm">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre cientifico</th>
                                <th>Nombre comun</th>
                                <th>Variedad</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="esp in especies" :key="esp.id_especie">
                                <td>{{ esp.id_especie }}</td>
                                <td>{{ esp.nombre_cientifico }}</td>
                                <td>{{ esp.nombre_comun }}</td>
                                <td>{{ esp.variedad }}</td>
                                <td>
                                    <button @click="editarEspecie(esp)" class="btn btn-sm btn-outline-warning">Editar</button>
                                    <button @click="eliminarEspecie(esp.id_especie)" class="btn btn-sm btn-outline-danger ms-1">Borrar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- CONFIGURACION -->
        <div v-if="seccion === 'configuracion'">
            <div class="card-custom p-3">
                <h6 class="text-info mb-3">Valores por defecto para mantenimiento</h6>
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label small">pH por defecto</label>
                        <input v-model.number="config.ph_default" type="number" step="0.1" class="form-control custom-input">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small">Temperatura (C)</label>
                        <input v-model.number="config.temp_default" type="number" step="0.1" class="form-control custom-input">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small">% Cambio agua</label>
                        <input v-model.number="config.cambio_default" type="number" class="form-control custom-input">
                    </div>
                </div>
                <button @click="guardarConfig" class="btn btn-sm btn-primary mt-3">Guardar configuracion</button>
            </div>
        </div>

        <!-- MODAL: Usuario -->
        <div class="modal fade" id="modalUsuario" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content card-custom">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-info">{{ editandoUsuario ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input v-model="usuarioForm.usuario" type="text" class="form-control custom-input mb-2" placeholder="Usuario">
                        <input v-model="usuarioForm.nombre" type="text" class="form-control custom-input mb-2" placeholder="Nombre completo">
                        <input v-model="usuarioForm.email" type="email" class="form-control custom-input mb-2" placeholder="Email">
                        <input v-model="usuarioForm.password" type="password" class="form-control custom-input mb-2" placeholder="Contrasena (dejar vacio para no cambiar)">
                        <select v-model="usuarioForm.rol" class="form-select custom-input">
                            <option value="admin">Admin</option>
                            <option value="criador">Criador</option>
                            <option value="visitante">Visitante</option>
                        </select>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Cancelar</button>
                        <button @click="guardarUsuario" class="btn btn-primary">Guardar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- MODAL: Especie -->
        <div class="modal fade" id="modalEspecie" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content card-custom">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-info">{{ editandoEspecie ? 'Editar Especie' : 'Nueva Especie' }}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input v-model="especieForm.nombre_cientifico" type="text" class="form-control custom-input mb-2" placeholder="Nombre cientifico">
                        <input v-model="especieForm.nombre_comun" type="text" class="form-control custom-input mb-2" placeholder="Nombre comun">
                        <input v-model="especieForm.variedad" type="text" class="form-control custom-input mb-2" placeholder="Variedad">
                        <textarea v-model="especieForm.descripcion" class="form-control custom-input" rows="2" placeholder="Descripcion"></textarea>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Cancelar</button>
                        <button @click="guardarEspecie" class="btn btn-primary">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            seccion: 'dashboard',
            stats: {
                totalPeces: 0,
                pecesVendidos: 0,
                acuariosActivos: 0,
                ventasMes: 0
            },
            ultimasVentas: [],
            usuarios: [],
            papeleraTabla: 'peces',
            papeleraItems: [],
            especies: [],
            config: {
                ph_default: 7.0,
                temp_default: 26.0,
                cambio_default: 20
            },
            usuarioActualId: null,
            editandoUsuario: false,
            editandoEspecie: false,
            usuarioForm: {
                id_usuario: null,
                usuario: '',
                nombre: '',
                email: '',
                password: '',
                rol: 'criador'
            },
            especieForm: {
                id_especie: null,
                nombre_cientifico: '',
                nombre_comun: '',
                variedad: '',
                descripcion: ''
            }
        }
    },
    methods: {
        formatNumber(value) {
            if (value === null || value === undefined) {
                return '0';
            }
            return Number(value).toLocaleString('es-CO');
        },
        formatFecha(fechaISO) {
            if (!fechaISO) {
                return '';
            }
            var fecha = new Date(fechaISO);
            return fecha.toLocaleDateString('es-ES');
        },
        cargarStats: function() {
            var self = this;
            fetch(this.apiUrl + '/stats', { credentials: 'include' })
                .then(function(res) {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then(function(data) {
                    if (data) {
                        self.stats = data;
                    }
                })
                .catch(function(e) {
                    console.error('Error cargando stats:', e);
                });
        },
        cargarUltimasVentas: function() {
            var self = this;
            fetch(this.apiUrl + '/ultimas_ventas', { credentials: 'include' })
                .then(function(res) {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then(function(data) {
                    if (data) {
                        self.ultimasVentas = data;
                    }
                })
                .catch(function(e) {
                    console.error('Error cargando ventas:', e);
                });
        },
        cargarUsuarios: function() {
            var self = this;
            fetch(this.apiUrl + '/usuarios', { credentials: 'include' })
                .then(function(res) {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then(function(data) {
                    if (data) {
                        self.usuarios = data;
                    }
                })
                .catch(function(e) {
                    console.error('Error cargando usuarios:', e);
                });
        },
        cargarEspecies: function() {
            var self = this;
            fetch(this.apiUrl + '/especies', { credentials: 'include' })
                .then(function(res) {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then(function(data) {
                    if (data) {
                        self.especies = data;
                    }
                })
                .catch(function(e) {
                    console.error('Error cargando especies:', e);
                });
        },
        cargarPapelera: function() {
            var self = this;
            fetch(this.apiUrl + '/papelera/' + this.papeleraTabla, { credentials: 'include' })
                .then(function(res) {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then(function(data) {
                    if (data) {
                        self.papeleraItems = data;
                    }
                })
                .catch(function(e) {
                    console.error('Error cargando papelera:', e);
                });
        },
        restaurarItem: function(item) {
            var self = this;
            if (confirm('Restaurar este registro?')) {
                fetch(this.apiUrl + '/restore/' + this.papeleraTabla + '/' + item.id, {
                    method: 'POST',
                    credentials: 'include'
                })
                .then(function(res) {
                    if (res.ok) {
                        alert('Registro restaurado');
                        self.cargarPapelera();
                    }
                })
                .catch(function(e) {
                    console.error(e);
                });
            }
        },
        actualizarRol: function(user) {
            fetch(this.apiUrl + '/usuarios/' + user.id_usuario, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rol: user.rol })
            }).catch(function(e) {
                console.error(e);
            });
        },
        nuevoUsuario: function() {
            this.editandoUsuario = false;
            this.usuarioForm = {
                id_usuario: null,
                usuario: '',
                nombre: '',
                email: '',
                password: '',
                rol: 'criador'
            };
            new bootstrap.Modal(document.getElementById('modalUsuario')).show();
        },
        guardarUsuario: function() {
            var self = this;
            var url = this.editandoUsuario ? this.apiUrl + '/usuarios/' + this.usuarioForm.id_usuario : this.apiUrl + '/usuarios';
            var method = this.editandoUsuario ? 'PUT' : 'POST';
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(this.usuarioForm)
            })
            .then(function(res) {
                if (res.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
                    self.cargarUsuarios();
                } else {
                    alert('Error al guardar usuario');
                }
            })
            .catch(function(e) {
                console.error(e);
            });
        },
        eliminarUsuario: function(id) {
            var self = this;
            if (confirm('Eliminar este usuario?')) {
                fetch(this.apiUrl + '/usuarios/' + id, {
                    method: 'DELETE',
                    credentials: 'include'
                })
                .then(function() {
                    self.cargarUsuarios();
                })
                .catch(function(e) {
                    console.error(e);
                });
            }
        },
        resetPassword: function(user) {
            var newPass = prompt('Nueva contrasena para ' + user.usuario);
            if (newPass && newPass.length > 0) {
                alert('Funcionalidad: cambiar contrasena (requiere endpoint especifico)');
            }
        },
        nuevaEspecie: function() {
            this.editandoEspecie = false;
            this.especieForm = {
                id_especie: null,
                nombre_cientifico: '',
                nombre_comun: '',
                variedad: '',
                descripcion: ''
            };
            new bootstrap.Modal(document.getElementById('modalEspecie')).show();
        },
        editarEspecie: function(esp) {
            this.editandoEspecie = true;
            this.especieForm = {
                id_especie: esp.id_especie,
                nombre_cientifico: esp.nombre_cientifico,
                nombre_comun: esp.nombre_comun,
                variedad: esp.variedad,
                descripcion: esp.descripcion
            };
            new bootstrap.Modal(document.getElementById('modalEspecie')).show();
        },
        guardarEspecie: function() {
            var self = this;
            var url = this.editandoEspecie ? this.apiUrl + '/especies/' + this.especieForm.id_especie : this.apiUrl + '/especies';
            var method = this.editandoEspecie ? 'PUT' : 'POST';
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(this.especieForm)
            })
            .then(function(res) {
                if (res.ok) {
                    bootstrap.Modal.getInstance(document.getElementById('modalEspecie')).hide();
                    self.cargarEspecies();
                } else {
                    alert('Error al guardar especie');
                }
            })
            .catch(function(e) {
                console.error(e);
            });
        },
        eliminarEspecie: function(id) {
            var self = this;
            if (confirm('Eliminar esta especie?')) {
                fetch(this.apiUrl + '/especies/' + id, {
                    method: 'DELETE',
                    credentials: 'include'
                })
                .then(function() {
                    self.cargarEspecies();
                })
                .catch(function(e) {
                    console.error(e);
                });
            }
        },
        guardarConfig: function() {
            localStorage.setItem('iabetta_config', JSON.stringify(this.config));
            alert('Configuracion guardada localmente');
        },
        cargarConfig: function() {
            var saved = localStorage.getItem('iabetta_config');
            if (saved) {
                this.config = JSON.parse(saved);
            }
        },
        cargarUsuarioActual: function() {
            var self = this;
            fetch(this.apiUrl + '/verify', { credentials: 'include' })
                .then(function(res) {
                    if (res.ok) {
                        return res.json();
                    }
                })
                .then(function(data) {
                    if (data && data.id_usuario) {
                        self.usuarioActualId = data.id_usuario;
                    }
                })
                .catch(function(e) {
                    console.error(e);
                });
        }
    },
    mounted: function() {
        this.cargarStats();
        this.cargarUltimasVentas();
        this.cargarUsuarios();
        this.cargarEspecies();
        this.cargarConfig();
        this.cargarUsuarioActual();
    }
};