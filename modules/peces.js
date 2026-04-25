export const PecesModule = {
    props: ['apiUrl'],
    template: `
    <div>
        <h3>Registro de Peces</h3>
        <button @click="cargarPeces" :disabled="cargando">Recargar</button>
        <div v-if="cargando">Cargando...</div>
        <table border="1" cellpadding="5" v-else>
            <thead>
                <tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Estado</th><th>Disponible</th></tr>
            </thead>
            <tbody>
                <tr v-for="pez in lista" :key="pez.id_pece">
                    <td>{{ pez.id_pece }}</td>
                    <td>{{ pez.nombre_pez }}</td>
                    <td>{{ pez.precio }}</td>
                    <td>{{ pez.estado_salud }}</td>
                    <td>{{ pez.disponible_venta ? 'Sí' : 'No' }}</td>
                </tr>
                <tr v-if="lista.length === 0"><td colspan="5">No hay datos</td></tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
        return {
            lista: [],
            cargando: false
        };
    },
    methods: {
        async cargarPeces() {
            this.cargando = true;
            try {
                const res = await fetch(this.apiUrl + '/peces', { credentials: 'include' });
                const data = await res.json();
                console.log('Respuesta API:', data);
                this.lista = Array.isArray(data) ? data : [];
            } catch(e) {
                console.error(e);
                this.lista = [];
            } finally {
                this.cargando = false;
            }
        }
    },
    mounted() {
        this.cargarPeces();
    }
};