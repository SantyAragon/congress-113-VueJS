Vue.createApp({
    data() {
        return {
            UrlAPI: "",
            init: {
                method: "GET",
                headers: {
                    "X-API-Key": "ayEQKIOE9pPw2ACZf9laT7NHVztG9hZ5no8SiYsr"
                }
            },
            data: [],
            allMembers: [],
            allMembers2: [],

            allChecks: [],
            estadosFiltrados: [],
            select: "all",

            miembrosFiltradosPorEstado: [],
            miembrosFiltradosPorEstadoYPartido: [],

            estadisticas: {
                todosLosDemocratas: [],
                todosLosRepublicanos: [],
                todosLosIndependientes: [],
                todosLosMiembrosConVotos: [],
                todosLosMiembrosConVotos2: [],

                miembrosOrdenadosPorVotosAsc: [],
                miembrosOrdenadosPorVotosDes: [],

                diezPorCiento: 0,

                porcentajeDemocratas: 0,
                porcentajeRepublicanos: 0,
                porcentajeIndependientes: 0,

                totalPorcentajeDemocratas: 0,
                totalPorcentajeRepublicanos: 0,
                totalPorcentajeIndependientes: 0,

                totalPorcentajeDeTodos: 0,
                miembrosOrdenadosPorVtWPartyAsc: []
            }
        }
    },

    created() {
        // this.objeto1.prop2 = this.objeto1.prop1 + 3
        this.UrlAPI = document.querySelector("#table-senate") ? "https://api.propublica.org/congress/v1/113/senate/members.json" : "https://api.propublica.org/congress/v1/113/house/members.json"

        fetch(this.UrlAPI, this.init)
            .then(response => response.json())
            .then(contenidoDeJson => {
                this.allMembers = contenidoDeJson.results[0].members
                this.allMembers2 = contenidoDeJson.results[0].members

                this.estadosOrdenados(this.allMembers)
                this.miembrosFiltradosPorEstadoYPartido = this.allMembers

                this.rellenarEstadisticas();

                this.estadisticas.miembrosOrdenadosPorVotosAsc = this.ordenarPorAsc(this.estadisticas.todosLosMiembrosConVotos, "missed_votes_pct").slice(0, this.estadisticas.diezPorCiento)

                this.estadisticas.miembrosOrdenadosPorVotosDes = this.ordenarPorDes(this.estadisticas.todosLosMiembrosConVotos2, "missed_votes_pct").slice(0, this.estadisticas.diezPorCiento)

                this.estadisticas.miembrosOrdenadosPorVtWPartyAsc = this.ordenarPorAsc(this.estadisticas.todosLosMiembrosConVotos, "votes_with_party_pct").slice(0, this.estadisticas.diezPorCiento)

                this.estadisticas.miembrosOrdenadosPorVtWPartyDes = this.ordenarPorDes(this.estadisticas.todosLosMiembrosConVotos2, "votes_with_party_pct").slice(0, this.estadisticas.diezPorCiento)

                let loading = document.querySelector("#loader-container")
                loading.classList.add("loader-desactive")
            })
    },

    methods: {
        getMember(array) {
            array.forEach(member => this.allMembers.push(member))
        },
        estadosOrdenados(array) {

            array.forEach(member => {
                if (!this.estadosFiltrados.includes(member.state)) {
                    this.estadosFiltrados.push(member.state);
                }
            })
            this.estadosFiltrados.sort()
        },
        filtrarPorEstado(array, condition) {
            let filtradosPorEstado = [];
            if (condition === "all") {
                filtradosPorEstado = array
            } else {
                filtradosPorEstado = array.filter(member => member.state == condition)
            }
            this.miembrosFiltradosPorEstado = filtradosPorEstado
        },
        filtrarPorPartidos(array, condicion) {
            let aux = [];
            if (condicion.length === 0) {
                this.miembrosFiltradosPorEstadoYPartido = array;
            } else {
                array.forEach(miembro =>
                    condicion.forEach(check => miembro.party == check ? aux.push(miembro) : ""))
                this.miembrosFiltradosPorEstadoYPartido = aux;
            }
            return aux
        },
        rellenarEstadisticas() {
            this.estadisticas.todosLosDemocratas = this.filtrarPorPartidos(this.allMembers, ["D"]);
            this.estadisticas.todosLosRepublicanos = this.filtrarPorPartidos(this.allMembers, ["R"]);
            this.estadisticas.todosLosIndependientes = this.filtrarPorPartidos(this.allMembers, ["ID"]);

            this.estadisticas.todosLosMiembrosConVotos = this.allMembers.filter(member => member.total_votes > 0)
            this.estadisticas.todosLosMiembrosConVotos2 = this.allMembers.filter(member => member.total_votes > 0)

            this.estadisticas.diezPorCiento = Math.floor(this.allMembers.length * 0.1);

            this.estadisticas.porcentajeDemocratas = this.estadisticas.todosLosDemocratas.map(member => member.votes_with_party_pct).reduce((a, b) => a + b, 0);
            this.estadisticas.porcentajeRepublicanos = this.estadisticas.todosLosRepublicanos.map(member => member.votes_with_party_pct).reduce((a, b) => a + b, 0);
            this.estadisticas.porcentajeIndependientes = this.estadisticas.todosLosIndependientes.map(member => member.votes_with_party_pct).reduce((a, b) => a + b, 0);

            this.estadisticas.totalPorcentajeDemocratas = (this.estadisticas.porcentajeDemocratas / this.estadisticas.todosLosDemocratas.length);
            this.estadisticas.totalPorcentajeRepublicanos = (this.estadisticas.porcentajeRepublicanos / this.estadisticas.todosLosRepublicanos.length);
            this.estadisticas.totalPorcentajeIndependientes = (this.estadisticas.porcentajeIndependientes > 0) ? (this.estadisticas.porcentajeIndependientes / this.estadisticas.todosLosIndependientes.length) : 0;

            this.estadisticas.totalPorcentajeDeTodos = ((this.estadisticas.porcentajeDemocratas + this.estadisticas.porcentajeRepublicanos + this.estadisticas.porcentajeIndependientes) / this.allMembers.length);

        },
        ordenarPorAsc(array, propierty) {
            return array.sort((a, b) => {
                return a[propierty] - b[propierty]
            })
        },
        ordenarPorDes(array, propierty) {
            return array.sort((a, b) => {
                return b[propierty] - a[propierty]
            })
        }
    },

    computed: {
        actualizarForm() {
            this.filtrarPorEstado(this.allMembers, this.select)
            this.filtrarPorPartidos(this.miembrosFiltradosPorEstado, this.allChecks);
        }
    }
}).mount('#app')