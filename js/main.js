var miInit = {
    method: 'GET',
    headers: {
        'X-API-Key': 'OhyexikwWU2R8czEDSVx72F6mWyXOK9OqIFOCz4T'
    }
};

var url = "";
if (document.title == "Senate Data" || document.title == "Attendance Senate" || document.title == "Party Loyalty Senate") {
    url = "https://api.propublica.org/congress/v1/113/senate/members.json"
} else {
    url = "https://api.propublica.org/congress/v1/116/house/members.json"

}


fetch(url, miInit) //para SENATE
    .then(function (response) {
        console.log('Request succeeded: ' + response.statusText);
        return response.json();
    })

    .then(function (datosjs) {
        //console.log(datosjs);
        listaDeMiembros = datosjs.results[0].members;
        if (document.title == "Senate Data") {
            filtrar(listaDeMiembros);

        } else if (document.title == "Attendance Senate") {
            llenarstatistics(listaDeMiembros);
            //dibujarTablasAttendance();
        } else {
            llenarstatistics(listaDeMiembros);
        }
        app.listaDeMiembros = datosjs.results[0].members;
    })


/*
if (document.title == "House Data" || document.title == "Attendance House" || document.title == "Party Loyalty House") {
    var house = "https://api.propublica.org/congress/v1/116/house/members.json";

    fetch(house, miInit) //para SENATE
        .then(function (response) {
            //console.log('Request succeeded: ' + response.statusText);
            return response.json();
        })

        .then(function (datosjs) {
            //console.log(datosjs);
            listaDeMiembros = datosjs.results[0].members;
            if (document.title == "House Data") {
                filtrar(listaDeMiembros);

            } else if (document.title == "Attendance House") {
                llenarstatistics(listaDeMiembros);
                //dibujarTablasAttendance();
            } else {
                llenarstatistics(listaDeMiembros);
                //dibujarTablasLoyalty();
            }

            app.listaDeMiembros = datosjs.results[0].members;
        })

}
*/
function filtrar(tablaFiltrada) {

    var estadoSelecionado = document.getElementById("state").value;

    var arrayDeCheckbox = Array.from(document.querySelectorAll('input[name=party]:checked')).map(elt => elt.value); //seleccion y transformacion con map para tener el array de checked
    var tablaFiltrada = [];
    var arrayDeState = [];
    for (var i = 0 in listaDeMiembros) {
        for (var j = 0 in arrayDeCheckbox) {
            if (((estadoSelecionado == listaDeMiembros[i].state) || estadoSelecionado == "ALL") && (listaDeMiembros[i].party == arrayDeCheckbox[j])) { // pasan solo los que estan seleccionados

                tablaFiltrada.push(listaDeMiembros[i])
            }
        }
    }
    app.listaDeMiembros = tablaFiltrada;
    //console.log(tablaFiltrada);

}

var app = new Vue({
    el: "#app",
    data: {
        listaDeMiembros: [],
        statistics: {
            porcDem: 0,
            porcIndepen: 0,
            porcRepubli: 0,
            numDeDemmocrat: 0,
            numDeIndependi: 0,
            numDeRepublica: 0,
            totalDeRepResentantesSenate: 0,
            leastLoyaltySenate: "",
            mostLoyaltySenate: "",
            listaConMenosMissed: [],
            listaConMasMissed: [],
            listaConMasLoyalty: [],
            listaConMenosLoyalty: [],
            numberTotalMembers: 0
        }
    },
});



function llenarstatistics(listaDeMiembros) {


    var promedioR = 0;
    var promedioD = 0;
    var promedioI = 0;
    var numeroDeRepublicanos = 0;
    var numeroDeDemocratas = 0;
    var numeroDeIndependientes = 0;
    var votesWithPartyR = 0;
    var votesWithPartyD = 0;
    var votesWithPartyI = 0;
    var porcentaje = 10;
    var corte = Math.ceil((porcentaje * listaDeMiembros.length) / 100);

    for (var i in listaDeMiembros) {
        if (listaDeMiembros[i].party == "R") {
            votesWithPartyR = votesWithPartyR + listaDeMiembros[i].votes_with_party_pct
            numeroDeRepublicanos++;
        }

        if (listaDeMiembros[i].party == "D") {
            votesWithPartyD = votesWithPartyD + listaDeMiembros[i].votes_with_party_pct
            numeroDeDemocratas++;
        }

        if (listaDeMiembros[i].party == "I") {
            votesWithPartyI = votesWithPartyI + listaDeMiembros[i].votes_with_party_pct
            numeroDeIndependientes++;
        }
    }
    promedioR = votesWithPartyR / numeroDeRepublicanos || 0;
    promedioD = votesWithPartyD / numeroDeDemocratas || 0;
    promedioI = votesWithPartyI / numeroDeIndependientes || 0;

    app.statistics.porcDem = promedioD.toFixed(2);
    app.statistics.porcIndepen = promedioI.toFixed(2);
    app.statistics.porcRepubli = promedioR.toFixed(2);
    app.statistics.numDeDemmocrat = numeroDeDemocratas;
    app.statistics.numDeIndependi = numeroDeIndependientes;
    app.statistics.numDeRepublica = numeroDeRepublicanos;
    app.statistics.porcTotal = ((promedioD + promedioI + promedioR) / 3).toFixed(2);
    app.statistics.numberTotalMembers = listaDeMiembros.length;

    var percVotedWithParty = [];

    var numOfAddedMembers = 0;
    var leastgeneratedArray = [];
    var mostgeneratedArray = [];
    var cantidadAcumulada = 0;
    var arrayTemporal = [];


    ////////////////////////// CALCULOS PARA TABLAS SENATE MORE LEAST 10% ///////////////



    listaDeMiembros.sort(function (a, b) { //ordenamos de menor a mayor
        return a.missed_votes_pct - b.missed_votes_pct
    });

    app.statistics.listaConMasMissed = listaDeMiembros.slice(0, corte + 1);
    var ultimoValorMissed = app.statistics.listaConMasMissed[app.statistics.listaConMasMissed.length - 1].missed_votes_pct;

    for (var i = corte; i < listaDeMiembros.length; i++) {
        if (listaDeMiembros[i].missed_votes_pct === ultimoValorMissed) {
            app.statistics.listaConMasMissed.push(listaDeMiembros[i]);
        }
    }


    listaDeMiembros.sort(function (a, b) { //ordenamos de menor a mayor
        return b.missed_votes_pct - a.missed_votes_pct
    });

    app.statistics.listaConMenosMissed = listaDeMiembros.slice(0, corte + 1);
    ultimoValorMissed = app.statistics.listaConMenosMissed[app.statistics.listaConMenosMissed.length - 1].missed_votes_pct;

    for (var i = corte; i < listaDeMiembros.length; i++) {
        if (listaDeMiembros[i].missed_votes_pct === ultimoValorMissed) {
            app.statistics.listaConMenosMissed.push(listaDeMiembros[i]);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////// CALCULOS PARA TABLAS LOYALTY MORE LEAST 10% ///////////////
    listaDeMiembros.sort(function (a, b) { //ordenamos de menor a mayor
        return b.votes_with_party_pct - a.votes_with_party_pct
    });

    app.statistics.listaConMasLoyalty = listaDeMiembros.slice(0, corte + 1);
    var ultimoValorPartPCT = app.statistics.listaConMasLoyalty[app.statistics.listaConMasLoyalty.length - 1].votes_with_party_pct;

    for (var i = corte; i < listaDeMiembros.length; i++) {
        if (listaDeMiembros[i].total_votes === ultimoValorPartPCT) {
            app.statistics.listaConMasLoyalty.push(listaDeMiembros[i]);
        }
    }


    listaDeMiembros.sort(function (a, b) { //ordenamos de menor a mayor
        return a.votes_with_party_pct - b.votes_with_party_pct
    });
    app.statistics.listaConMenosLoyalty = listaDeMiembros.slice(0, corte + 1);
    ultimoValorPartPCT = app.statistics.listaConMenosLoyalty[app.statistics.listaConMenosLoyalty.length - 1].votes_with_party_pct;

    for (var i = corte; i < listaDeMiembros.length; i++) {
        if (listaDeMiembros[i].total_votes === ultimoValorPartPCT) {
            app.statistics.listaConMenosLoyalty.push(listaDeMiembros[i]);
        }
    }
    //console.log(app.statistics);

}