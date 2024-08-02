var token = "";
var apiUrl = "https://api-dev.taskplanning.com.mx/api";
var idVenta = "";
var dataEmpresa = "";
//var capaModalPartida = "";

//Definición de variables que dependen de la empresa
var mostrar_comensales = 1;
var mostrar_tiempos = 1; 
var mostrar_comandas = 1;
var confirmacion_descuento = 1;


export function mainFunctionMesaAbierta(token, apiUrl, idVenta, dataEmpresa){

	token = token;
	//apiUrl = apiUrl;
	idVenta = idVenta;
	dataEmpresa = dataEmpresa;
	//capaModalPartida = capaModal;
	
	
	muestraFamilias(0);
	obtenerTicket	();
	
	//Listener Menu
	
	const boton0 = document.querySelector('.boton_tipo-0');
    const boton1 = document.querySelector('.boton_tipo-1');
    const boton2 = document.querySelector('.boton_tipo-2');
    const boton3 = document.querySelector('.boton_tipo-3');

    // Añade el event listener para cada botón
    boton0.addEventListener('click', function() {
        muestraFamilias(0);
    });

    boton1.addEventListener('click', function() {
        muestraFamilias(1);
    });

    boton2.addEventListener('click', function() {
        muestraFamilias(2);
    });

    boton3.addEventListener('click', function() {
        muestraFamiliasArticulos();
    });
	
	//Listener Opciones
	
	document.getElementById("boton_enviar_comanda").addEventListener("click", envia);
    document.getElementById("boton_dividir_cuenta").addEventListener("click", muestraDivideCuenta);
	document.getElementById("boton_actualizar_comensales").addEventListener("click", muestraActualizaComensales);
	document.getElementById("boton_descuento").addEventListener("click", muestraActualizaDescuento);
	document.getElementById("boton_cuenta_resumida").addEventListener("click", obtenerCuentaResumida);
	document.getElementById("boton_enviar_ticket").addEventListener("click", muestraEnviaTicket);

	console.log("LLAMO A LA FUNCION PRICIPAL Y EL TOKEN ES: " + token + "LA URL ES: " +apiUrl);
	
	
	
	/**MESA ABIERTA**/

/*MENÚ*/

function formato_hora(fecha)
{
	var f=new Date(fecha.replace(/-/g, '\/'));

	var formato=f.toLocaleString('en-US',{hour:'numeric', minute:'numeric', hour12:true});

	return formato;
}

function formato_precio(numero)
{
	var formato=numero.toLocaleString("es-MX",{style:"currency",currency:"MXN"});

	return formato;
}

function cierraModal()
{
    document.getElementById("modal").innerHTML='';
}

/*MENÚ*/

//Obtiene menú
function obtenerMenu() {
    fetch(apiUrl + '/web/ventas/offline_menu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataMenu = data.data;
            console.log("Datos menú:", dataMenu);

            localStorage.setItem('menu',JSON.stringify(dataMenu));
			
			console.log("PASO OBTENER MENU, LA DATA DEL MENU ES: " + dataMenu);

        } else {
            console.error('Error en la obtención de datos de menú:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la obtención de datos de menú:', error);
    });
} 

function muestraFamilias(tipo) {
    if (!localStorage.getItem('menu'))
        obtenerMenu();

    var menu = JSON.parse(localStorage.getItem('menu'));

    // Actualizar estilo de botones por tipo
    var botonesTipo = document.getElementsByClassName("boton_tipo");
    for (var i = 0; i < botonesTipo.length; i++) {
        botonesTipo[i].style.backgroundColor = "white";
    }
    
    document.getElementsByClassName("boton_tipo-" + tipo)[0].style.backgroundColor = "orange";

    // Configurar búsqueda en el input
    var inputBusqueda = document.getElementById("b");
    inputBusqueda.value = '';
    inputBusqueda.onkeyup = muestraBusqueda; // Simplificado para asignar directamente la función

    // Construcción del menú de familias
    var familias = '';
   
    menu.familias.forEach(familia => {
        if (tipo != 0 && tipo != familia.categoria)
            return;

        var imagen = familia.imagen && familia.imagen != "null"
            ? '<img src="' + familia.imagen + '" alt="">' : '';

     
        familias += '\
            <a href="#" id="familia-' + familia.id_familia + '">\
                ' + imagen + '\
                <p>' + familia.nombre + '</p>\
            </a>\
        ';
    });

    var menuElement = document.getElementById("menu");
    menuElement.innerHTML = familias;

    // Agregar event listeners para cada enlace creado
    menu.familias.forEach(familia => {
        if (tipo != 0 && tipo != familia.categoria)
            return;

        var enlace = document.getElementById("familia-" + familia.id_familia);
        if (familia.tiene_subfamilias == 0) {
            enlace.addEventListener('click', function() {
                muestraFamilia(familia.id_familia);
            });
        } else {
            enlace.addEventListener('click', function() {
                muestraSubfamilias(familia.id_familia);
            });
        }
    });
}
function muestraFamilia(id_familia) {
    localStorage.setItem('id_familia', id_familia);
    localStorage.setItem('id_subfamilia', 0);

    var menu = JSON.parse(localStorage.getItem('menu'));
    var familia = menu.familias.find(familia => familia.id_familia == id_familia);

    var recetas = '<h3>Familia: ' + familia.nombre + '</h3>\
                   <a href="#" id="regresarFamilias">Regresar a familias</a>\
                   <hr>';

    familia.recetas.forEach(receta => {
        var imagen = receta.imagen && receta.imagen != "null"
            ? '<img src="' + receta.imagen + '" alt="">' : '';
        var descripcion = receta.descripcion || '';

        recetas += '\
            <a class="familia" href="#" id="receta-' + receta.id_receta + '">\
                ' + imagen + '\
                <p><b>' + receta.nombre + '</b></p>\
                <p>' + descripcion + '</p>\
                <p>' + formato_precio(receta.precio) + '</p>\
            </a>\
            <hr>\
        ';
    });

    var menuElement = document.getElementById("menu");
    menuElement.innerHTML = recetas;

    // Agregar listener para regresar a familias
    document.getElementById("regresarFamilias").addEventListener('click', function() {
        muestraFamilias(0);
    });

    // Agregar listeners para cada receta
    familia.recetas.forEach(receta => {
        document.getElementById("receta-" + receta.id_receta).addEventListener('click', function() {
            muestraReceta(receta.id_receta);
        });
    });
}


function muestraSubfamilias(id_familia) {
    localStorage.setItem('id_familia', id_familia);
    localStorage.setItem('id_subfamilia', 0);

    var menu = JSON.parse(localStorage.getItem('menu'));
    var familia = menu.familias.find(f => f.id_familia == id_familia);

    var subfamilias = '<h3>Familia: ' + familia.nombre + '</h3>\
                       <a href="#" id="regresarFamilias">Regresar a familias</a>\
                       <hr>';

    familia.subfamilias.forEach(subfamilia => {
        var imagen = subfamilia.imagen && subfamilia.imagen != "null"
            ? '<img src="' + subfamilia.imagen + '" alt="">' : '';

        subfamilias += '\
            <a href="#" id="subfamilia-' + subfamilia.id_subfamilia + '">\
                ' + imagen + '\
                <p>' + subfamilia.nombre + '</p>\
            </a>\
        ';
    });

    var menuElement = document.getElementById("menu");
    menuElement.innerHTML = subfamilias;

    // Agregar listener para regresar a familias
    document.getElementById("regresarFamilias").addEventListener('click', function() {
        muestraFamilias(0);
    });

    // Agregar listeners para cada subfamilia
    familia.subfamilias.forEach(subfamilia => {
        document.getElementById("subfamilia-" + subfamilia.id_subfamilia).addEventListener('click', function() {
            muestraSubfamilia(subfamilia.id_subfamilia);
        });
    });
}

function muestraSubfamilia(id_subfamilia) {
    localStorage.setItem('id_subfamilia', id_subfamilia);

    var id_familia = localStorage.getItem('id_familia');
    var menu = JSON.parse(localStorage.getItem('menu'));
    var familia = menu.familias.find(f => f.id_familia == id_familia);
    var subfamilia = familia.subfamilias.find(s => s.id_subfamilia == id_subfamilia);

    var recetas = '<h3>Familia: ' + familia.nombre + '</h3>\
                   <h3>Subfamilia: ' + subfamilia.nombre + '</h3>\
                   <a href="#" id="regresarSubfamilias">Regresar a ' + familia.nombre + '</a>\
                   <hr>';

    subfamilia.recetas.forEach(receta => {
        var imagen = receta.imagen && receta.imagen != "null"
            ? '<img src="' + receta.imagen + '" alt="">' : '';
        var descripcion = receta.descripcion || '';

        recetas += '\
            <a href="#" id="receta-' + receta.id_receta + '">\
                ' + imagen + '\
                <p><b>' + receta.nombre + '</b></p>\
                <p>' + descripcion + '</p>\
                <p><span>' + formato_precio(receta.precio) + '</span></p>\
            </a>\
            <hr>\
        ';
    });

    var menuElement = document.getElementById("menu");
    menuElement.innerHTML = recetas;

    // Agregar listener para regresar a subfamilias
    document.getElementById("regresarSubfamilias").addEventListener('click', function() {
        muestraSubfamilias(id_familia);
    });

    // Agregar listeners para cada receta
    subfamilia.recetas.forEach(receta => {
        document.getElementById("receta-" + receta.id_receta).addEventListener('click', function() {
            muestraReceta(receta.id_receta);
        });
    });
}

function muestraBusqueda() {
    var menu = JSON.parse(localStorage.getItem('menu'));
    var b = document.getElementById("b").value.toLowerCase();
    var recetas = '';

    menu.familias.forEach(familia => {
        var recetasFiltradas = familia.tiene_subfamilias > 0 ? 
            familia.subfamilias.flatMap(subfamilia => subfamilia.recetas) : familia.recetas;

        recetasFiltradas.filter(receta => receta.nombre.toLowerCase().includes(b)).forEach(receta => {
            var imagen = receta.imagen && receta.imagen != "null"
                ? '<img src="' + receta.imagen + '" alt="">' : '';
            var descripcion = receta.descripcion || '';

            recetas += '\
                <a href="#" id="receta-' + receta.id_receta + '">\
                    ' + imagen + '\
                    <p><b>' + receta.nombre + '</b></p>\
                    <p>' + descripcion + '</p>\
                    <p>' + formato_precio(receta.precio) + '</p>\
                </a>\
            ';
        });
    });

    if (b === '') {
        muestraFamilias(0);
    } else {
        if (recetas === '')
            recetas = '<p>No se encontraron resultados</p>';

        var menuElement = document.getElementById("menu");
        menuElement.innerHTML = recetas;

        // Agregar listeners para cada receta
        menu.familias.flatMap(familia => familia.tiene_subfamilias > 0 ? 
            familia.subfamilias.flatMap(subfamilia => subfamilia.recetas) : familia.recetas)
            .filter(receta => receta.nombre.toLowerCase().includes(b))
            .forEach(receta => {
                document.getElementById("receta-" + receta.id_receta).addEventListener('click', function() {
                    muestraReceta(receta.id_receta, receta.id_familia, receta.id_subfamilia);
                });
            });
    }
}


function muestraReceta(id_receta, id_familia, id_subfamilia) {
    if (!id_familia)
        var id_familia = localStorage.getItem('id_familia');

    if (!id_subfamilia)
        var id_subfamilia = localStorage.getItem('id_subfamilia');

    var menu = JSON.parse(localStorage.getItem('menu'));
    var familia = menu.familias.find(familia => familia.id_familia == id_familia);

    if (id_subfamilia == 0)
        var receta = familia.recetas.find(receta => receta.id_receta == id_receta);
    else {
        var subfamilia = familia.subfamilias.find(subfamilia => subfamilia.id_subfamilia == id_subfamilia);
        var receta = subfamilia.recetas.find(receta => receta.id_receta == id_receta);
    }

    var modal = '\
        <h3>Agregar partida</h3>\
        <p><b>Receta:</b> ' + receta.nombre + '</p>\
        <p><b>Precio:</b> ' + formato_precio(receta.precio) + '</p>\
    ';

    //Renderiza los comensales
    if (mostrar_comensales == 0)
        modal += '<input id="comensal" type="hidden" value="1">';
    else {
        var comensales = localStorage.getItem('comensales');
        
        modal += '\
            <p>Comensal*</p>\
            <select id="comensal">\
        ';

        for (var i = 1; i <= parseInt(comensales); i++) {
            modal += '<option value=' + i + '>Comensal ' + i + '</option>';
        }

        modal += '</select>';
    }

    //Renderiza los tiempos
    if (mostrar_tiempos == 0)
        modal += '<input id="tiempo" type="hidden" value="0">';
    else {
        modal += '\
            <p>Tiempo*</p>\
            <select id="tiempo">\
                <option value="0">Ninguno</option>\
                <option value="1">Entrada</option>\
                <option value="2">Primer tiempo</option>\
                <option value="3">Segundo tiempo</option>\
                <option value="4">Tercer tiempo</option>\
                <option value="5">Postre</option>\
            </select>\
        ';
    }

    //Renderiza el resto de las opciones
    modal += '\
        <p>Cantidad (Opcional)</p>\
        <input id="cantidad" type="text" value="1">\
        <p>Observacioes (Opcional)</p>\
        <input id="observaciones" type="text" placeholder="Escribe...">\
    ';

    //Renderiza los extras
    if (receta.tipo == 3) { // Verifica si es combo para obtener sus recetas y extras
        modal += '\
            <p>Selecciona las opciones:</p>\
            <table border="1">\
                <tr>\
                    <th>Nombre</th>\
                    <th>Precio unitario</th>\
                    <th>Cantidad</th>\
                </tr>\
        ';

        receta.extras.forEach(extra => {
            if (extra.id_extra != null) {
                // Verifica si es obligatorio
                var obligatorio = 1;

                extra.extras.forEach(extra2 => {
                    if (extra2.precio != 0)
                        obligatorio = 0;
                });

                if (obligatorio == 1) {
                    modal += '\
                        <tr><td colspan="4">\
                            <p><b>' + extra.nombre + '*</b></p>\
                            <input name="obligatorio" type="hidden" value="' + extra.id_receta + '">\
                        </td></tr>\
                    ';
                } else
                    modal += '<tr><td colspan="4"><p><b>' + extra.nombre + '</b></p></td></tr>';

                extra.extras.forEach(extra2 => {
                    modal += '\
                        <tr>\
                            <td>' + extra2.nombre + '</td>\
                            <td>' + formato_precio(extra2.precio) + '</td>\
                            <td>\
                                <input name="combo" type="hidden" value="' + extra2.id_extra + '">\
                                <input id="combo_' + extra2.id_extra + '" type="hidden" value="' + extra.id_receta + '">\
                                <input id="cantidad_extra_' + extra2.id_extra + '" name="opciones_' + extra.id_receta + '" type="text" value="0">\
                            </td>\
                        </tr>\
                    ';
                });
            }
        });

        modal += '</table>';
    } else if (familia.extras.length > 0) { // Verifica si tiene extras
        modal += '\
            <p>Extras (Opcional)</p>\
            <table border="1">\
                <tr>\
                    <th>Nombre</th>\
                    <th>Precio unitario</th>\
                    <th>Cantidad</th>\
                </tr>\
        ';

        familia.extras.forEach(extra => {
            modal += '\
                <tr>\
                    <td>' + extra.nombre + '</td>\
                    <td>' + formato_precio(extra.precio) + '</td>\
                    <td>\
                        <input name="extra" type="hidden" value="' + extra.id_extra + '">\
                        <input id="cantidad_extra_' + extra.id_extra + '" type="text" value="0">\
                    </td>\
                </tr>\
            ';
        });

        modal += '</table>';
    }

 
    modal += '<input type="button" value="Agregar" id="botonAgregarReceta">';

    document.getElementById("modal").innerHTML = modal;

    // Agrega el EventListener al botón
    document.getElementById("botonAgregarReceta").addEventListener("click", function() {
        creaPartida(id_receta);
    });
	
	/*capaModalPartida.visible = true;
    capaModalPartida.opacity = 1;
  	capaModalPartida.isInteractive = true;*/
}


function muestraFamiliasArticulos() {
    var menu = JSON.parse(localStorage.getItem('menu'));

    //Tipo
    var botonesTipo = document.getElementsByClassName("boton_tipo");
    for (var i = 0; i < botonesTipo.length; i++) {
        botonesTipo[i].style.backgroundColor = "white";
    }
    
    document.getElementsByClassName("boton_tipo-3")[0].style.backgroundColor = "orange";
    document.getElementById("b").value = '';
    document.getElementById("b").onkeyup = function() {
        return muestraBusquedaArticulos();
    };
    
    //Menu
    var familias = '';
   
    menu.familias_articulos.forEach(familia => {
        var imagen = (familia.imagen != null && familia.imagen != "null") 
                     ? '<img src="' + familia.imagen + '" alt="">' 
                     : '';

        familias += '\
            <a href="#" class="familia-articulo" data-id-familia="' + familia.id_familia + '">\
                ' + imagen + '\
                <p>' + familia.nombre + '</p>\
            </a>\
        ';
    });

    document.getElementById("menu").innerHTML = familias;

    // Agregar event listeners a los enlaces de las familias
    var enlacesFamilia = document.getElementsByClassName("familia-articulo");
    for (var i = 0; i < enlacesFamilia.length; i++) {
        enlacesFamilia[i].addEventListener("click", function(event) {
            event.preventDefault();
            var idFamilia = this.getAttribute("data-id-familia");
            muestraFamiliaArticulo(idFamilia);
        });
    }
}


function muestraFamiliaArticulo(id_familia) {
    localStorage.setItem('id_familia', id_familia);
    var menu = JSON.parse(localStorage.getItem('menu'));
    var familia = menu.familias_articulos.find(familia => familia.id_familia == id_familia);

    var articulos = '\
        <h3>Familia: ' + familia.nombre + '</h3>\
        <a href="#" id="regresarFamilias">Regresar</a>\
        <hr>\
    ';
   
    familia.articulos.forEach(articulo => {
        var imagen = (articulo.imagen != null && articulo.imagen != "null") 
                     ? '<img src="' + articulo.imagen + '" alt="">' 
                     : '';

        articulos += '\
            <a href="#" class="articulo" data-id-inventario="' + articulo.id_inventario + '">\
                ' + imagen + '\
                <p><b>' + articulo.nombre + '</b></p>\
                <p>' + formato_precio(articulo.precio) + '</p>\
            </a>\
            <hr>\
        ';
    });

    document.getElementById("menu").innerHTML = articulos;

    // Agregar event listener al enlace de "Regresar"
    document.getElementById("regresarFamilias").addEventListener("click", function(event) {
        event.preventDefault();
        muestraFamiliasArticulos();
    });

    // Agregar event listeners a los enlaces de los artículos
    var enlacesArticulo = document.getElementsByClassName("articulo");
    for (var i = 0; i < enlacesArticulo.length; i++) {
        enlacesArticulo[i].addEventListener("click", function(event) {
            event.preventDefault();
            var idInventario = this.getAttribute("data-id-inventario");
            muestraArticulo(idInventario);
        });
    }
}


function muestraBusquedaArticulos() {
    var menu = JSON.parse(localStorage.getItem('menu'));
    var b = document.getElementById("b").value;

    var articulos = '';

    menu.familias_articulos.forEach(familia => {
        var filtro = familia.articulos.filter(articulo => articulo.nombre.toLowerCase().includes(b.toLowerCase()));

        filtro.forEach(articulo => {
            var imagen = (articulo.imagen != null && articulo.imagen != "null") 
                         ? '<img src="' + articulo.imagen + '" alt="">' 
                         : '';

            articulos += '\
                <a href="#" class="articulo" data-id-inventario="' + articulo.id_inventario + '" data-id-familia="' + articulo.id_familia + '">\
                    ' + imagen + '\
                    <p><b>' + articulo.nombre + '</b></p>\
                    <p>' + formato_precio(articulo.precio) + '</p>\
                </a>\
            ';
        });
    });

    if (b == '')
        muestraFamiliasArticulos(0);
    else {
        if (articulos == '')
            articulos = '<p>No se encontraron resultados</p>';

        document.getElementById("menu").innerHTML = articulos;

        // Agregar event listeners a los enlaces de los artículos buscados
        var enlacesArticulo = document.getElementsByClassName("articulo");
        for (var i = 0; i < enlacesArticulo.length; i++) {
            enlacesArticulo[i].addEventListener("click", function(event) {
                event.preventDefault();
                var idInventario = this.getAttribute("data-id-inventario");
                var idFamilia = this.getAttribute("data-id-familia");
                muestraArticulo(idInventario, idFamilia);
            });
        }
    }
}


function muestraArticulo(id_inventario, id_familia) {
    if (!id_familia)
        var id_familia = localStorage.getItem('id_familia');

    var menu = JSON.parse(localStorage.getItem('menu'));
    var familia = menu.familias_articulos.find(familia => familia.id_familia == id_familia);
    var articulo = familia.articulos.find(articulo => articulo.id_inventario == id_inventario);
  
    var modal = '\
        <h3>Agregar partida</h3>\
        <p><b>Artículo/Servicio:</b> ' + articulo.nombre + '</p>\
        <p><b>Precio:</b> ' + formato_precio(articulo.precio) + '</p>\
    ';

    // Renderiza los comensales
    if (mostrar_comensales == 0)
        modal += '<input id="comensal" type="hidden" value="1">';
    else {
        var comensales = localStorage.getItem('comensales');
        
        modal += '\
            <p>Comensal*</p>\
            <select id="comensal">\
        ';

        for (var i = 1; i <= parseInt(comensales); i++) { 
            modal += '<option value=' + i + '>Comensal ' + i + '</option>';
        }

        modal += '</select>';
    }

    // Renderiza el resto de las opciones
    modal += '\
        <p>Cantidad (Opcional)</p>\
        <input id="cantidad" type="text" value="1">\
        <p>Observacioes (Opcional)</p>\
        <input id="observaciones" type="text" placeholder="Escribe...">\
        <input type="button" value="Agregar" id="botonAgregarArticulo">\
    ';

    document.getElementById("modal").innerHTML = modal;

    // Agrega el EventListener al botón
    document.getElementById("botonAgregarArticulo").addEventListener("click", function() {
        creaPartidaArticulo(id_inventario);
    });
}



/*TICKET----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

//Obtiene ticket
function obtenerTicket() {
    console.log(idVenta);
    console.log(apiUrl);
    
    fetch(apiUrl + '/web/ventas/venta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data.data[0];
            console.log("Datos ticket:", dataTicket);

            if (dataTicket.estado == 1)
                window.location.href = "mesas.html";

            localStorage.setItem('comensales', dataTicket.comensales);
            localStorage.setItem('descuento', dataTicket.descuento);
            localStorage.setItem('motivo_descuento', dataTicket.motivo_descuento);
            localStorage.setItem('partidas', JSON.stringify(dataTicket.partidas));

            document.getElementById("folio_anterior").innerHTML = dataTicket.folio_anterior;
            document.getElementById("ventas_dia").innerHTML = dataTicket.ventas_dia;
            document.getElementById("folio").innerHTML = dataTicket.folio;
            document.getElementById("apertura").innerHTML = formato_hora(dataTicket.fecha);
            document.getElementById("mesero").innerHTML = dataTicket.mesero;
            document.getElementById("area").innerHTML = dataTicket.area;
            document.getElementById("mesa").innerHTML = dataTicket.mesa;
            document.getElementById("comensales").innerHTML = dataTicket.comensales;

            var partidas = `
                <tr>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Total</th>
                </tr>
            `;

            var cantidad_partidas = 0;

            for (var i = 1; i <= dataTicket.comensales; i++) {
                if (mostrar_comensales == 1) {
                    partidas += `
                        <tr style="background-color:orange">
                            <td>Comensal ${i}</td>
                            <td colspan="2"></td>
                            <td><a href="#" class="cambioMesa openModal" data-comensal="${i}">Cambio de mesa</a></td>
                        </tr>
                    `;
                }

                dataTicket.partidas.forEach(partida => {
                    if (partida.comensal == i) {
                        var tiempo = '';
                        switch (partida.tiempo) {
                            case 0: tiempo = `<td colspan="3">${partida.nombre}</td>`; break;
                            case 1: tiempo = `<td>Entrada</td><td colspan="2">${partida.nombre}</td>`; break;
                            case 2: tiempo = `<td>Primer tiempo</td><td colspan="2">${partida.nombre}</td>`; break;
                            case 3: tiempo = `<td>Segundo tiempo</td><td colspan="2">${partida.nombre}</td>`; break;
                            case 4: tiempo = `<td>Tercer tiempo</td><td colspan="2">${partida.nombre}</td>`; break;
                            case 5: tiempo = `<td>Postre</td><td colspan="2">${partida.nombre}</td>`; break;
                        }

                        var estado = '';
                        var opciones_partida = '';

                        switch (partida.estado) {
                            case 0:
                                if (mostrar_comandas == 1)
                                    estado += 'No enviado';

                                opciones_partida += `
                                    <a href="#" class="actualizaPartida openModal" data-id="${partida.id_partida}">Editar</a> | 
                                    <a href="#" class="creaExtra openModal" data-id="${partida.id_partida}">Extras</a> | 
                                `;
                                break;
                            case 1:
                                if (mostrar_comandas == 1)
                                    estado += 'En preparación';

                                if (mostrar_comensales == 1)
                                    opciones_partida += `<a href="#" class="actualizaPartida openModal" data-id="${partida.id_partida}">Editar</a> | `;
                                break;
                            case 2:
                                if (mostrar_comandas == 1)
                                    estado += 'Terminado';

                                if (mostrar_comensales == 1)
                                    opciones_partida += `<a href="#" class="actualizaPartida openModal" data-id="${partida.id_partida}">Editar</a> | `;
                                break;
                        }

                        var descuento = partida.descuento == 0 ? '-' : formato_precio(partida.descuento);

                        partidas += `
                            <tr>
                                ${tiempo}
                                <td>${estado}</td>
                            </tr>
                            <tr>
                                <td>${partida.cantidad}</td>
                                <td>${formato_precio(partida.precio)}</td>
                                <td>${descuento}</td>
                                <td>${formato_precio(partida.total)}</td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    ${opciones_partida}
                                    <a href="#" class="actualizaObservaciones openModal" data-id="${partida.id_partida}">Observaciones</a> |
                                    <a href="#" class="actualizaDescuentoPartida openModal" data-id="${partida.id_partida}">Descuentos</a> |
                                    <a href="#" class="transferirPartida openModal" data-id="${partida.id_partida}">Transferir</a> |
                                    <a href="#" class="eliminaPartida openModal" data-id="${partida.id_partida}">Eliminar</a>
                                </td>
                            </tr>
                        `;

                        cantidad_partidas++;

                        if (partida.extras.length != 0) {
                            partida.extras.forEach(extra => {
                                var opciones_extra = '';
                                switch (partida.estado) {
                                    case 0:
                                        opciones_extra = `
                                            <a href="#" class="actualizaExtra" data-partida-id="${partida.id_partida}" data-extra-id="${extra.id_extra}">Editar</a> | 
                                            <a href="#" class="eliminaExtra" data-partida-id="${partida.id_partida}" data-extra-id="${extra.id_extra}">Eliminar</a>
                                        `;
                                        break;
                                }

                                partidas += `
                                    <tr style="background-color:yellow">
                                        <td>Extra</td>
                                        <td colspan="2">(${extra.cantidad}) ${extra.nombre}</td>
                                        <td>${formato_precio(extra.precio)}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="4">${opciones_extra}</td>
                                    </tr>
                                `;
                            });
                        }

                        partidas += '<tr><td colspan="4"><hr></td></tr>';
                    }
                });
            }

            var descuento = dataTicket.descuento == 0 ? '-' : formato_precio(dataTicket.descuento);

            partidas += `
                <tr style="background-color:red">
                    <th>${cantidad_partidas}</th>
                    <th>${formato_precio(dataTicket.subtotal + dataTicket.iva)}</th>
                    <th>${descuento}</th>
                    <th>${formato_precio(dataTicket.total)}</th>
                </tr>
            `;

            document.getElementById("partidas").innerHTML = partidas;

            // Event listeners
            document.querySelectorAll('.cambioMesa').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraCambioMesa(e.target.dataset.comensal);
                });
            });

            document.querySelectorAll('.actualizaPartida').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraActualizaPartida(e.target.dataset.id);
                });
            });

            document.querySelectorAll('.creaExtra').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraCreaExtra(e.target.dataset.id);
                });
            });

            document.querySelectorAll('.actualizaObservaciones').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraActualizaObservaciones(e.target.dataset.id);
                });
            });

            document.querySelectorAll('.actualizaDescuentoPartida').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraActualizaDescuentoPartida(e.target.dataset.id);
                });
            });

            document.querySelectorAll('.transferirPartida').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraTransferirPartida(e.target.dataset.id);
                });
            });

            document.querySelectorAll('.eliminaPartida').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraEliminaPartida(e.target.dataset.id);
                });
            });

            document.querySelectorAll('.actualizaExtra').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraActualizaExtra(e.target.dataset.partidaId, e.target.dataset.extraId);
                });
            });

            document.querySelectorAll('.eliminaExtra').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    muestraEliminaExtra(e.target.dataset.partidaId, e.target.dataset.extraId);
                });
            });

        } else {
            console.error('Error en la obtención de datos de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la obtención de datos de ticket:', error);
    });
}


//Crea partida
function verifica_obligatorios()
{ 
    var num_obligatorios=0;
    var num_seleccionadas=0;
    
    document.getElementsByName("obligatorio").forEach(obligatorio => { 
        var seleccionadas=0;

        document.getElementsByName("opciones_"+obligatorio.value).forEach(opcion => { 
            if(opcion.value!=0)
                seleccionadas++;
        });

        if(seleccionadas!=0)
            num_seleccionadas++;

        num_obligatorios++;
	});

    if(num_obligatorios==num_seleccionadas)
        return true;
    else
        return false;
}

function creaPartida(id_receta) {
    var comensal=document.getElementById('comensal').value;
    var tiempo=document.getElementById('tiempo').value;
    var observaciones=document.getElementById('observaciones').value;
    var cantidad=document.getElementById('cantidad').value;

    //Verifica extras
    var extras=[];

    document.getElementsByName("extra").forEach(extra => { 
		cantidad=document.getElementById("cantidad_extra_"+extra.value).value;

		if(cantidad>0)
		{
			tmp={
				id_receta: extra.value,
				cantidad: cantidad,
			}
			
			extras.push(tmp);
		}
	});

    extras=JSON.stringify(extras);

    //Verifica combo
    var combos=[];

    document.getElementsByName("combo").forEach(combo => { 
        id_receta2=document.getElementById("combo_"+combo.value).value;
        cantidad=document.getElementById("cantidad_extra_"+combo.value).value;

        if(cantidad>0)
        {
            tmp={
                id_receta: id_receta2,
                id_extra: combo.value,
                cantidad: cantidad,
            }
            
            combos.push(tmp);
        }
    });

    combos=JSON.stringify(combos);

    var paso=verifica_obligatorios();

    if(paso)
    {
        fetch(apiUrl + '/web/ventas/creaPartida', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                id_venta: idVenta,
                id_receta: id_receta,
                comensal: comensal,
                tiempo: tiempo,
                observaciones: observaciones,
                cantidad: cantidad,
                extras: extras,
                combo: combos,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.response) {
                let dataPartida = data;
                console.log("Datos partida:", dataPartida);

                obtenerTicket();
                document.getElementById("modal").innerHTML='';
            } else {
                console.error('Error en la creación de partida:', data.message);
            }
        })
        .catch(error => {
            console.error('Error en la creación de partida:', error);
        });
    }
    else
        alert('Seleccione todas las opciones obligatorias para agregar la partida');
} 

//Actualiza partida
function muestraActualizaPartida(id_partida) {
    var partidas = JSON.parse(localStorage.getItem('partidas'));
    var partida = partidas.find(partida => partida.id_partida == id_partida);

    var modal = `
        <h3>Editar partida</h3>
        <p><b>Partida:</b> ${partida.nombre}</p>
    `;

    // Renderiza los comensales
    if (mostrar_comensales == 0) {
        modal += '<input id="comensal" type="hidden" value="1">';
    } else {
        var comensales = localStorage.getItem('comensales');
        
        modal += `
            <p>Comensal*</p>
            <select id="comensal">
        `;

        for (var i = 1; i <= parseInt(comensales); i++) { 
            if (partida.comensal == i)
                modal += `<option value="${i}" selected>Comensal ${i}</option>`;
            else
                modal += `<option value="${i}">Comensal ${i}</option>`;
        }

        modal += '</select>';
    }

    if (partida.tipo == 2 || partida.estado == 0) { // Solo puede editar la cantidad si es de un artículo o cuando no se ha procesado
        modal += `
            <p>Cantidad*</p>
            <input id="cantidad" type="text" value="${partida.cantidad}">
        `;
    } else {
        modal += `<input id="cantidad" type="hidden" value="${partida.cantidad}">`;
    }

    modal += '<input id="btnEditar" type="button" value="Editar">';

    document.getElementById("modal").innerHTML = modal;

    document.getElementById("btnEditar").addEventListener("click", () => actualizaPartida(id_partida));
}


function actualizaPartida(id_partida) {
    var comensal=document.getElementById('comensal').value;
    var cantidad=document.getElementById('cantidad').value;

    fetch(apiUrl + '/web/ventas/actualizaPartida', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_partida: id_partida,
            comensal: comensal,
            cantidad: cantidad,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataPartida = data;
            console.log("Datos partida:", dataPartida);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de partida:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de partida:', error);
    });
} 

//Actualiza observaciones
function muestraActualizaObservaciones(id_partida) {
    var partidas = JSON.parse(localStorage.getItem('partidas'));
    var partida = partidas.find(partida => partida.id_partida == id_partida);

    var observaciones = partida.observaciones || '';

    var modal = `
        <h3>Editar observaciones</h3>
        <p><b>Partida:</b> ${partida.nombre}</p>
        <p>Observaciones*</p>
        <input id="observaciones" type="text" value="${observaciones}" placeholder="Escribe...">
        <input id="btnEditarObservaciones" type="button" value="Editar">
    `;

    document.getElementById("modal").innerHTML = modal;

    document.getElementById("btnEditarObservaciones").addEventListener("click", () => actualizaObservaciones(id_partida));
}


function actualizaObservaciones(id_partida) {
    var observaciones=document.getElementById('observaciones').value;
            
    fetch(apiUrl + '/web/ventas/actualizaObservaciones', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_partida: id_partida,
            observaciones: observaciones,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataPartida = data;
            console.log("Datos partida:", dataPartida);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de partida:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de partida:', error);
    });
} 

//Actualiza descuento partida
function muestraActualizaDescuentoPartida(id_partida) {
    var menu = JSON.parse(localStorage.getItem('menu'));
    var promociones = menu.promociones;

    var modal = '<h3>Descuento</h3>';

    if (confirmacion_descuento == 1) { // Determina si debe mostrar campos de correo y contraseña para confirmar el descuento
        modal += `
            <p>Correo electrónico*</p>
            <input id="correo" type="text" placeholder="Escribe...">
            <p>Contraseña*</p>
            <input id="contrasena" type="password" placeholder="Escribe...">
        `;
    }

    modal += `
        <p>Tipo de descuento*</p>
        <select id="id_promocion">
            <option value="">Seleccionar</option>
    `;

    promociones.forEach(promocion => {
        var cantidad = promocion.tipo == 1 ? formato_precio(promocion.cantidad) : parseFloat(promocion.cantidad).toFixed(2) + '%';
        modal += `<option value="${promocion.id_promocion}">${promocion.nombre} (${cantidad})</option>`;
    });

    modal += `
            <option value="0">Personalizado</option>
        </select>
        <div id="personalizado"></div>
        <input id="btnConfirmarDescuento" type="button" value="Confirmar">
    `;

    document.getElementById("modal").innerHTML = modal;

    document.getElementById("id_promocion").addEventListener("change", muestraDescuentoPersonalizado);
    document.getElementById("btnConfirmarDescuento").addEventListener("click", () => actualizaDescuentoPartida(id_partida));

    // Verifica si ya tenía un descuento asignado para mostrarlo
    var partidas = JSON.parse(localStorage.getItem('partidas'));
    var partida = partidas.find(partida => partida.id_partida == id_partida);
    var motivo = localStorage.getItem('motivo_descuento');

    if (partida.descuento > 0) {
        document.getElementById("id_promocion").value = 0;
        muestraDescuentoPersonalizado();
        document.getElementById("motivo").value = motivo;
        document.getElementById("tipo").value = 1;
        document.getElementById("cantidad").value = partida.descuento;
    }
}


function muestraDescuentoPersonalizado() {
    var id_promocion=document.getElementById("id_promocion").value;

    if(id_promocion==0)
    {
        var personalizado='\
            <p>Motivo de descuento*</p>\
            <input id="motivo" type="text" placeholder="Escribe...">\
            <p>Tipo de descuento*</p>\
            <select id="tipo">\
                <option value="0">Seleccionar</option>\
                <option value="1">Directo</option>\
                <option value="2">Porcentual</option>\
            </select>\
            <p>Cantidad*</p>\
            <input id="cantidad" type="text" value="0">\
        ';
    }
    else
        var personalizado='';

    document.getElementById("personalizado").innerHTML=personalizado;
}

function actualizaDescuentoPartida(id_partida) {
    var id_promocion=document.getElementById("id_promocion").value;

    if(confirmacion_descuento==0)
    {
        var correo='';
        var contrasena='';
    }
    else
    {
        var correo=document.getElementById("correo").value;
        var contrasena=document.getElementById("contrasena").value;
    }

    if(id_promocion==0)
    {
        var tipo=document.getElementById("tipo").value;
        var cantidad=document.getElementById("cantidad").value;
        var motivo=document.getElementById("motivo").value;
    }
    else
    {
        var tipo=''
        var cantidad='';
        var motivo='';
    }

    fetch(apiUrl + '/web/ventas/actualizaDescuentoPartida', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_partida: id_partida,
            id_promocion: id_promocion,
            tipo: tipo,
            cantidad: cantidad,
            motivo_descuento: motivo,
            correo: correo,
            contrasena: contrasena
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataPartida = data;
            console.log("Datos partida:", dataPartida);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de partida:', data.message);

            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de partida:', error);
    });
} 

//Elimina partida
function muestraEliminaPartida(id_partida) {
    var partidas = JSON.parse(localStorage.getItem('partidas'));
    var partida = partidas.find(partida => partida.id_partida == id_partida);

    var modal = `
        <h3>Eliminar partida</h3>
        <p>¿Estas seguro que quieres cancelar la partida de: "${partida.nombre}"?</p>
    `;

    if (partida.tipo == 1) { // Solo aplica para partidas de recetas, los artículos se eliminan directo
        modal += `<input id="estado" type="hidden" value="${partida.estado}">`;

        if (partida.estado == 1) { // Cuando ya se envió a comanda y está en preparación
            modal += `
                <p>Solo un supervisor puede cancelar una partida que ya fue enviada a comanda</p>
                <p>Correo electrónico*</p>
                <input id="correo" type="text" placeholder="Escribe...">
                <p>Contraseña*</p>
                <input id="contrasena" type="password" placeholder="Escribe...">
                <p>Cantidad*</p>
                <input id="cantidad" type="text" value="1">
                <input class="openModal" id="btnSustituir" type="button" value="Sustituir">
            `;
        } else if (partida.estado == 2) { // Cuando ya se envió a comanda y está terminado
            modal += `
                <p>Solo un supervisor puede cancelar una partida que ya fue enviada a comanda</p>
                <p>Correo electrónico*</p>
                <input id="correo" type="text" placeholder="Escribe...">
                <p>Contraseña*</p>
                <input id="contrasena" type="password" placeholder="Escribe...">
                <p>Motivo*</p>
                <input id="motivo" type="text" placeholder="Escribe...">
            `;
        }
    } else {
        modal += '<input id="estado" type="hidden" value="0">';
    }
        
    modal += `
        <input id="btnConfirmar" type="button" value="Confirmar">
        <input id="btnCancelar" type="button" value="Cancelar">
    `;

    document.getElementById("modal").innerHTML = modal;

    document.getElementById("btnSustituir")?.addEventListener("click", () => muestraSustituyePartida(id_partida));
    document.getElementById("btnConfirmar").addEventListener("click", () => eliminaPartida(id_partida));
    document.getElementById("btnCancelar").addEventListener("click", cierraModal);
}


function eliminaPartida(id_partida) {
    var estado=document.getElementById("estado").value;

    if(estado==0)
    {
        var correo='';
        var contrasena='';
        var cantidad='';
        var motivo='';
    }
    else
    {
        var correo=document.getElementById("correo").value;
        var contrasena=document.getElementById("contrasena").value;
        
        if(estado==1)
        {
            var cantidad=document.getElementById("cantidad").value;
            var motivo='';
        }
        else
        {
            var cantidad='';
            var motivo=document.getElementById("motivo").value;
        }
    }

    fetch(apiUrl + '/web/ventas/eliminaPartida', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_partida: id_partida,
            correo: correo,
            contrasena: contrasena,
            cantidad: cantidad,
            motivo: motivo,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataPartida = data;
            console.log("Datos partida:", dataPartida);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la eliminación de partida:', data.message);

            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error en la eliminación de partida:', error);
    });
} 

//Busca
function busca() {
    fetch(apiUrl + '/web/ventas/busca', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            b: busqueda,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataBusca = data.data;
            console.log("Datos busqueda:", dataBusca);

        } else {
            console.error('Error en la busqueda:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la busqueda:', error);
    });
} 

function muestraSustituyePartida(id_partida) {
    var modal = `
        <h3>Sustituir partida</h3>
        <p>Solo un supervisor puede sustituir una partida que ya fue enviada a comanda</p>
        <p>Correo electrónico*</p>
        <input id="correo" type="text" placeholder="Escribe...">
        <p>Contraseña*</p>
        <input id="contrasena" type="password" placeholder="Escribe...">
        <p>Cantidad*</p>
        <input id="cantidad" type="text" value="1">
        <p>Nuevo producto*</p>
        <input id="id_receta" type="hidden">
        <input id="nombre" type="text" disabled>
        <input id="busca" type="text" placeholder="Escribe...">
        <input id="btnBuscar" type="button" value="Buscar">
        <div id="resultados"></div>
        <input id="btnConfirmarSustitucion" type="button" value="Confirmar">
    `;

    document.getElementById("modal").innerHTML = modal;

    document.getElementById("btnBuscar").addEventListener("click", muestraBuscarReceta);
    document.getElementById("btnConfirmarSustitucion").addEventListener("click", () => sustituyePartida(id_partida));
}


function muestraBuscarReceta() {
    var menu = JSON.parse(localStorage.getItem('menu'));
    var b = document.getElementById("busca").value;

    var recetas = `
        <table border="1">
        <tr>
            <th>Receta</th>
            <th>Precio</th>
            <th></th>
        </tr>
    `;

    menu.familias.forEach(familia => {
        if (familia.tiene_subfamilias > 0) {
            familia.subfamilias.forEach(subfamilia => {
                var filtro = subfamilia.recetas.filter(receta => receta.nombre.toLowerCase().includes(b.toLowerCase()));

                filtro.forEach(receta => {
                    recetas += `
                        <tr>
                            <input id="nombre_${receta.id_receta}" type="hidden" value="${receta.nombre}">
                            <td>${receta.nombre}</td>
                            <td>${formato_precio(receta.precio)}</td>
                            <td><input id="btnSeleccionar_${receta.id_receta}" type="button" value="Seleccionar"></td>
                        </tr>
                    `;
                });
            });
        } else {
            var filtro = familia.recetas.filter(receta => receta.nombre.toLowerCase().includes(b.toLowerCase()));

            filtro.forEach(receta => {
                recetas += `
                    <tr>
                        <input id="nombre_${receta.id_receta}" type="hidden" value="${receta.nombre}">
                        <td>${receta.nombre}</td>
                        <td>${formato_precio(receta.precio)}</td>
                        <td><input id="btnSeleccionar_${receta.id_receta}" type="button" value="Seleccionar"></td>
                    </tr>
                `;
            });
        }
    });

    recetas += '</table>';
    document.getElementById("resultados").innerHTML = recetas;

    // Asignar event listeners para cada botón "Seleccionar"
    menu.familias.forEach(familia => {
        if (familia.tiene_subfamilias > 0) {
            familia.subfamilias.forEach(subfamilia => {
                var filtro = subfamilia.recetas.filter(receta => receta.nombre.toLowerCase().includes(b.toLowerCase()));
                filtro.forEach(receta => {
                    document.getElementById(`btnSeleccionar_${receta.id_receta}`).addEventListener("click", () => asignaReceta(receta.id_receta));
                });
            });
        } else {
            var filtro = familia.recetas.filter(receta => receta.nombre.toLowerCase().includes(b.toLowerCase()));
            filtro.forEach(receta => {
                document.getElementById(`btnSeleccionar_${receta.id_receta}`).addEventListener("click", () => asignaReceta(receta.id_receta));
            });
        }
    });
}


function asignaReceta(id_receta) {
    var nombre=document.getElementById("nombre_"+id_receta).value;

    document.getElementById("id_receta").value=id_receta;
    document.getElementById("nombre").value=nombre;

    document.getElementById("resultados").innerHTML='';
}

function sustituyePartida(id_partida) {
    var correo=document.getElementById("correo").value;
    var contrasena=document.getElementById("contrasena").value;
    var id_receta=document.getElementById("id_receta").value;
    var cantidad=document.getElementById("cantidad").value;

    fetch(apiUrl + '/web/ventas/sustituye', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            correo: correo,
            contrasena: contrasena,
            id_venta: idVenta,
            id_partida: id_partida,
            id_receta: id_receta,
            cantidad: cantidad,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataPartida = data;
            console.log("Datos partida:", dataPartida);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de partida:', data.message);

            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de partida:', error);
    });
}

function muestraCreaExtra(id_partida) {
    fetch(apiUrl + '/web/ventas/buscaExtra', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_partida: id_partida,
            b: ""
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataExtras = data.data;
            console.log("Datos extra:", dataExtras);

            var modal = `
                <h3>Agregar extra</h3>
                <table border="1">
                    <tr>
                        <th>Nombre</th>
                        <th>Precio unitario</th>
                        <th>Cantidad</th>
                    </tr>
            `;

            dataExtras.forEach(extra => {
                modal += `
                    <tr>
                        <td>${extra.nombre}</td>
                        <td>${formato_precio(extra.precio)}</td>
                        <td>
                            <input name="extra" type="hidden" value="${extra.id_receta}">
                            <input id="cantidad_extra_${extra.id_receta}" type="text" value="0">
                        </td>
                    </tr>
                `;
            });

            modal += `
                </table>
                <input id="btnConfirmarExtra" type="button" value="Confirmar">
            `;

            document.getElementById("modal").innerHTML = modal;

            // Asignar event listener para el botón "Confirmar"
            document.getElementById("btnConfirmarExtra").addEventListener("click", () => creaExtra(id_partida));

        } else {
            console.error('Error en la creación de extra:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la creación de extra:', error);
    });
}


function creaExtra(id_partida) {
    //Verifica extras
    var extras=[];

    document.getElementsByName("extra").forEach(extra => { 
		cantidad=document.getElementById("cantidad_extra_"+extra.value).value;

		if(cantidad>0)
		{
			tmp={
				id_receta: extra.value,
				cantidad: cantidad,
			}
			
			extras.push(tmp);
		}
	});

    extras=JSON.stringify(extras);

    fetch(apiUrl + '/web/ventas/creaExtra', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
            id_partida: id_partida,
            extras: extras,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataExtra = data;
            console.log("Datos extra:", dataExtra);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la creación de extra:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la creación de extra:', error);
    });
}

//Actualiza extra
function muestraActualizaExtra(id_partida, id_extra) {
    var partidas = JSON.parse(localStorage.getItem('partidas'));
    var partida = partidas.find(partida => partida.id_partida == id_partida);
    var extra = partida.extras.find(extra => extra.id_extra == id_extra);

    var modal = `
        <h3>Editar extra</h3>
        <p><b>Extra:</b> ${extra.nombre}</p>
        <p>Cantidad*</p>
        <input id="cantidad" type="text" value="${extra.cantidad}">
        <input id="btnEditarExtra" type="button" value="Editar">
    `;

    document.getElementById("modal").innerHTML = modal;

    // Asignar event listener para el botón "Editar"
    document.getElementById("btnEditarExtra").addEventListener("click", () => actualizaExtra(id_extra));
}


function actualizaExtra(id_extra) {
    var cantidad=document.getElementById('cantidad').value;

    fetch(apiUrl + '/web/ventas/actualizaExtra', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_extra: id_extra,
            cantidad: cantidad,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataExtra = data;
            console.log("Datos extra:", dataExtra);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de extra:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de extra:', error);
    });
}

function muestraEliminaExtra(id_partida, id_extra) {
    var partidas = JSON.parse(localStorage.getItem('partidas'));
    var partida = partidas.find(partida => partida.id_partida == id_partida);
    var extra = partida.extras.find(extra => extra.id_extra == id_extra);

    var modal = `
        <h3>Eliminar extra</h3>
        <p>¿Estás seguro que quieres eliminar el extra "${extra.nombre}" para "${partida.nombre}"?</p>
        <input id="btnConfirmarEliminaExtra" style="background-color:red" type="button" value="Confirmar">
        <input id="btnCancelarEliminaExtra" type="button" value="Cancelar">
    `;

    document.getElementById("modal").innerHTML = modal;

    // Asignar event listeners para los botones "Confirmar" y "Cancelar"
    document.getElementById("btnConfirmarEliminaExtra").addEventListener("click", () => eliminaExtra(id_extra));
    document.getElementById("btnCancelarEliminaExtra").addEventListener("click", cierraModal);
}

function eliminaExtra(id_extra) {
    fetch(apiUrl + '/web/ventas/eliminaExtra', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_extra: id_extra,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataExtra = data;
            console.log("Datos extra:", dataExtra);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la eliminación de extra:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la eliminación de extra:', error);
    });
}

function muestraCambioMesa(comensal) {
    fetch(apiUrl + '/web/ventas/ventas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            tipo: 1,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataMesas = data.data;
            console.log("Datos mesas:", dataMesas);

            var modal = `
                <h3>Cambio de cuenta</h3>
                <p>Mesas abiertas</p>
                <select id="id_venta_nueva">
                    <option value="0">Seleccionar</option>
            `;

            dataMesas.forEach(venta => {
                var area = venta.area === 'NA' ? 'Principal' : venta.area;
                modal += `<option value="${venta.id_venta}">(Folio ${venta.folio}) Área ${area} - Mesa ${venta.mesa}</option>`;
            });

            modal += `
                </select>
                <input id="btnActualizarMesa" type="button" value="Actualizar">
            `;

            document.getElementById("modal").innerHTML = modal;

            // Asignar event listener para el botón "Actualizar"
            document.getElementById("btnActualizarMesa").addEventListener("click", () => cambioMesa(comensal));
        } else {
            console.error('Error en la actualización de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de ticket:', error);
    });
}


function cambioMesa(comensal) {
    var id_venta_nueva=document.getElementById("id_venta_nueva").value;

    fetch(apiUrl + '/web/ventas/actualizaComensal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta_actual: idVenta,
            id_venta_nueva: id_venta_nueva,
            comensal: comensal,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data;
            console.log("Datos ticket:", dataTicket);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de ticket:', error);
    });
} 

//Transferir partida
function muestraTransferirPartida(id_partida) {
    fetch(apiUrl + '/web/ventas/ventas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            tipo: 1,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataMesas = data.data;
            console.log("Datos mesas:", dataMesas);

            var modal = `
                <h3>Transferir partida</h3>
                <p>Mesas disponibles*</p>
                <select id="id_venta">
                    <option value="0">Seleccionar</option>
            `;

            var comensales = '';

            dataMesas.forEach(venta => {
                var area = venta.area === 'NA' ? 'Principal' : venta.area;

                modal += `<option value="${venta.id_venta}">(Folio ${venta.folio}) Área ${area} - Mesa ${venta.mesa}</option>`;
                comensales += `<input id="comensales_${venta.id_venta}" type="hidden" value="${venta.comensales}">`;
            });

            modal += `
                </select>
                ${comensales}
                <p>Comensal*</p>
                <select id="comensal">
                    <option value="0">Seleccionar</option>
                </select>
                <input id="btnConfirmarTransferencia" type="button" value="Confirmar">
            `;

            document.getElementById("modal").innerHTML = modal;

            // Asignar event listeners para el select y el botón "Confirmar"
            document.getElementById("id_venta").addEventListener("change", muestraComensales);
            document.getElementById("btnConfirmarTransferencia").addEventListener("click", () => transferirPartida(id_partida));

        } else {
            console.error('Error en la actualización de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de ticket:', error);
    });
}


function muestraComensales() {
    var id_venta=document.getElementById("id_venta").value;
    var comensales=document.getElementById("comensales_"+id_venta).value;

    var opciones='<option value="0">Seleccionar</option>';

    for(var i=1; i<=parseInt(comensales); i++){ 
        opciones+='<option value='+i+'>Comensal '+i+'</option>';
    }

    document.getElementById("comensal").innerHTML=opciones;
}

function transferirPartida(id_partida) {
    var id_venta=document.getElementById("id_venta").value;
    var comensal=document.getElementById("comensal").value;

    fetch(apiUrl + '/web/ventas/traspasaPartida', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_partida: id_partida,
            id_venta: id_venta,
            comensal: comensal,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataPartida = data;
            console.log("Datos partida:", dataPartida);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de partida:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de partida:', error);
    });
} 

//Crea partida articulo
function creaPartidaArticulo(id_inventario) {
    var comensal=document.getElementById('comensal').value;
    var observaciones=document.getElementById('observaciones').value;
    var cantidad=document.getElementById('cantidad').value;

    fetch(apiUrl + '/web/ventas/creaPartidaArticulo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
            id_inventario: id_inventario,
            comensal: comensal,
            observaciones: observaciones,
            cantidad: cantidad,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataPartida = data;
            console.log("Datos partida:", dataPartida);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la creación de partida:', data.message);

        }
    })
    .catch(error => {
        console.error('Error en la creación de partida:', error);
    });
}

/*OPCIONES------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------*/

//Divide cuenta global
function muestraDivideCuenta() {
    var modal = `
        <h3>Dividir la cuenta</h3>
        <p>Cómo dividir</p>
        <input id="btnPorComensal" type="button" value="Por comensal">
        <input id="btnGlobal" type="button" value="Global">
        <input id="btnCancelarDivideCuenta" type="button" value="Cancelar">
    `;

    document.getElementById("modal").innerHTML = modal;

    // Asignar event listeners para los botones
    document.getElementById("btnPorComensal").addEventListener("click", muestraDivideCuentaComensal);
    document.getElementById("btnGlobal").addEventListener("click", muestraDivideCuentaGlobal);
    document.getElementById("btnCancelarDivideCuenta").addEventListener("click", cierraModal);
}


function muestraDivideCuentaComensal() {
    var comensales = localStorage.getItem("comensales");
    var opciones = '<option value="0">Seleccionar</option>';

    for (var i = 1; i <= parseInt(comensales); i++) { 
        opciones += `<option value="${i}">Comensal ${i}</option>`;
    }

    var modal = `
        <h3>Dividir la cuenta</h3>
        <p>Por comensal</p>
        <p>Comensal a dividir*</p>
        <select id="comensalSelect">
            ${opciones}
        </select>
        <input id="btnCancelarComensal" type="button" value="Cancelar">
    `;

    document.getElementById("modal").innerHTML = modal;

    // Asignar event listeners para el select y el botón "Cancelar"
    document.getElementById("comensalSelect").addEventListener("change", muestraDivideCuentaComensalConfirmacion);
    document.getElementById("btnCancelarComensal").addEventListener("click", cierraModal);
}

function muestraDivideCuentaComensalConfirmacion() {
    var comensal = document.getElementById("comensalSelect").value;

    var modal = `
        <h3>Dividir la cuenta</h3>
        <p>Por comensal</p>
        <p>¿Desea dividir la cuenta del <b>Comensal ${comensal}</b> y generar una nueva mesa?</p>
        <input id="btnConfirmarDivide" type="button" value="Confirmar">
        <input id="btnCancelarDivide" type="button" value="Cancelar">
    `;

    document.getElementById("modal").innerHTML = modal;

    // Asignar event listeners para los botones "Confirmar" y "Cancelar"
    document.getElementById("btnConfirmarDivide").addEventListener("click", () => divideCuenta(comensal));
    document.getElementById("btnCancelarDivide").addEventListener("click", cierraModal);
}


function muestraDivideCuentaGlobal() {
    var modal = `
        <h3>Dividir la cuenta</h3>
        <p>Global</p>
        <p>Número de comensales*</p>
        <input id="comensales_dividir" type="text" value="2">
        <input id="btnActualizarGlobal" type="button" value="Actualizar">
        <input id="btnCancelarGlobal" type="button" value="Cancelar">
    `;

    document.getElementById("modal").innerHTML = modal;

    // Asignar event listeners para los botones "Actualizar" y "Cancelar"
    document.getElementById("btnActualizarGlobal").addEventListener("click", divideCuentaGlobal);
    document.getElementById("btnCancelarGlobal").addEventListener("click", cierraModal);
}


function divideCuentaGlobal() {
    var comensales=document.getElementById("comensales_dividir").value;

    fetch(apiUrl + '/web/ventas/divideCuentaGlobal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
            comensales: comensales,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data;
            console.log("Datos ticket:", dataTicket);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de datos de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de datos de ticket:', error);
    });
} 

//Divide cuenta
function divideCuenta(comensal) {
    fetch(apiUrl + '/web/ventas/divideCuenta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
            comensal: comensal,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data;
            console.log("Datos ticket:", dataTicket);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de datos de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de datos de ticket:', error);
    });
} 

//Obtiene promociones
function obtenerPromociones() {
    fetch(apiUrl + '/web/ventas_promociones/promociones', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataPromociones = data.data;
            console.log("Datos promociones:", dataPromociones);

        } else {
            console.error('Error en la obtención de datos de promociones:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la obtención de datos de promociones:', error);
    });
} 

//Actualiza descuento
function muestraActualizaDescuento() {
    var menu = JSON.parse(localStorage.getItem('menu'));
    var promociones = menu.promociones;

    var modal = '<h3>Descuento</h3>';

    if (confirmacion_descuento == 1) { // Determina si debe mostrar campos de correo y contraseña para confirmar el descuento
        modal += `
            <p>Correo electrónico*</p>
            <input id="correo" type="text" placeholder="Escribe...">
            <p>Contraseña*</p>
            <input id="contrasena" type="password" placeholder="Escribe...">
        `;
    }

    modal += `
        <p>Tipo de descuento*</p>
        <select id="id_promocion">
            <option value="">Seleccionar</option>
    `;

    promociones.forEach(promocion => {
        var cantidad = promocion.tipo == 1 ? formato_precio(promocion.cantidad) : parseFloat(promocion.cantidad).toFixed(2) + '%';
        modal += `<option value="${promocion.id_promocion}">${promocion.nombre} (${cantidad})</option>`;
    });

    modal += `
            <option value="0">Personalizado</option>
        </select>
        <div id="personalizado"></div>
        <input id="btnConfirmarDescuento" type="button" value="Confirmar">
    `;

    document.getElementById("modal").innerHTML = modal; // AQUI

    // Asignar event listeners para el select y el botón "Confirmar"
    document.getElementById("id_promocion").addEventListener("change", muestraDescuentoPersonalizado);
    document.getElementById("btnConfirmarDescuento").addEventListener("click", actualizaDescuento);

    // Verifica si ya tenía un descuento asignado para mostrarlo
    var descuento = localStorage.getItem('descuento');
    var motivo = localStorage.getItem('motivo_descuento');

    if (descuento > 0) {
        document.getElementById("id_promocion").value = 0;
        muestraDescuentoPersonalizado();
        document.getElementById("motivo").value = motivo;
        document.getElementById("tipo").value = 1;
        document.getElementById("cantidad").value = descuento;
    }
}


function actualizaDescuento() {
    var id_promocion=document.getElementById("id_promocion").value;
    
    if(confirmacion_descuento==0)
    {
        var correo='';
        var contrasena='';
    }
    else
    {
        var correo=document.getElementById("correo").value;
        var contrasena=document.getElementById("contrasena").value;
    }

    if(id_promocion==0)
    {
        var tipo=document.getElementById("tipo").value;
        var cantidad=document.getElementById("cantidad").value;
        var motivo=document.getElementById("motivo").value;
    }
    else
    {
        var tipo=''
        var cantidad='';
        var motivo='';
    }
        
    fetch(apiUrl + '/web/ventas/actualizaDescuento', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
            id_promocion: id_promocion,
            tipo: tipo,
            cantidad: cantidad,
            motivo_descuento: motivo,
            correo: correo,
            contrasena: contrasena
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data;
            console.log("Datos ticket:", dataTicket);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de ticket:', data.message);

            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de ticket:', error);
    });
} 

//Envia comanda
function envia() {
    fetch(apiUrl + '/web/ventas/envia', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data.data;
            console.log("Datos ticket:", dataTicket);

            if(dataTicket.redireccion_comanda==0)
                obtenerTicket();
            else
                window.location.href="mesas.html";
        } else {
            console.error('Error en la actualización de datos de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de datos de ticket:', error);
    });
} 

//Actualiza comensales
function muestraActualizaComensales() {
    var comensales = localStorage.getItem("comensales");

    var modal = `
        <h3>Actualizar comensales</h3>
        <p>Comensales</p>
        <input id="comensales_cantidad" type="text" value="${comensales}">
        <input id="btnActualizarComensales" type="button" value="Actualizar">
    `;

    document.getElementById("modal").innerHTML = modal;

    // Asignar event listener para el botón "Actualizar"
    document.getElementById("btnActualizarComensales").addEventListener("click", actualizaComensales);
}

function actualizaComensales() {
    var comensales=document.getElementById("comensales_cantidad").value;

    fetch(apiUrl + '/web/ventas/actualizaComensales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
            comensales: comensales,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data;
            console.log("Datos ticket:", dataTicket);

            obtenerTicket();
            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de ticket:', error);
    });
} 

//Cuenta resumida
function obtenerCuentaResumida() {
    console.log(apiUrl);
    
    fetch(apiUrl + '/web/ventas/cuentaResumida', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data.data;
            console.log("Datos ticket:", dataTicket);

            var modal = `
                <h3>Cuenta resumida</h3>
                <table border="1">
                    <tr>
                        <th>Cantidad</th>
                        <th>Platillo</th>
                        <th>Extras</th>
                    </tr>
            `;

            dataTicket.forEach(partida => {
                modal += `
                    <tr>
                        <td>${partida.cantidad}</td>
                        <td>${partida.nombre}</td>
                        <td>${partida.extras.length}</td>
                    </tr>
                `;

                if (partida.extras.length > 0) {
                    modal += `
                        <tr>
                            <td>${partida.extras[0].cantidad}</td>
                            <td>${partida.extras[0].nombre}</td>
                            <td></td>
                        </tr>
                    `;
                }
            });

            modal += `
                </table>
                <input id="btnRegresarCuentaResumida" type="button" value="Regresar">
            `;

            document.getElementById("modal").innerHTML = modal;

            // Asignar event listener para el botón "Regresar"
            document.getElementById("btnRegresarCuentaResumida").addEventListener("click", cierraModal);

        } else {
            console.error('Error en la obtención de datos de ticket:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la obtención de datos de ticket:', error);
    });
}


//Envia ticket
function muestraEnviaTicket() {
    var modal = `
        <h3>Enviar ticket al correo</h3>
        <p>Correo electrónico*</p>
        <input id="correo" type="text">
        <input id="btnEnviarTicket" type="button" value="Enviar">
    `;

    document.getElementById("modal").innerHTML = modal;

    // Asignar event listener para el botón "Enviar"
    document.getElementById("btnEnviarTicket").addEventListener("click", enviarTicket);
}


function enviarTicket() {
    var correo=document.getElementById("correo").value;

    fetch(apiUrl + '/web/ventas/ticketCorreo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_venta: idVenta,
            correo: correo,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataTicket = data;
            console.log("Datos ticket:", dataTicket);

            document.getElementById("modal").innerHTML='';
        } else {
            console.error('Error en la actualización de ticket:', data.message);

            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de ticket:', error);
    });
} 

	
}

