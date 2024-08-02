
    export function mainFuntionComandas(token, apiURL) {

        var Token = token;
        var apiUrl = apiURL;
        var idPreparacionComandas = '';
        var tipoComandas = '';
        var idPartida = '';
        var id_cancelada = '';
        var dataComandas = '';

       
 
    obtenerComandas();

    // Agregar eventos a los botones
    document.getElementById('vistaLista').addEventListener('click', function() {
        cambiarVista('lista');
    });

    document.getElementById('vistaMesas').addEventListener('click', function() {
        cambiarVista('mesas');
    });

    document.getElementById('tipo').addEventListener('change', filtrarComandas);
    document.getElementById('lugarPreparacion').addEventListener('change', filtrarComandas);
    document.getElementById('mesa').addEventListener('change', filtrarComandas);

    document.getElementById('obtenerComandas').addEventListener('click', obtenerComandas);
    document.getElementById('historicoComandas').addEventListener('click', comandaHistorico);


function cambiarVista(vista) {
    console.log("Cambiando vista a:", vista);
    const tablaComandas = document.getElementById('tabla-comandas');
    const mesasContainer = document.getElementById('mesas-view');
    let tipo = document.getElementById("tipo").value;
    let lugarPreparacion = document.getElementById("lugarPreparacion").value;
    let mesa = document.getElementById("mesa").value;

    let filteredData = dataComandas.partidas.filter(item => {
        let matchTipo = tipo === "todas" || item.tipo === tipo;
        let matchLugar = lugarPreparacion === "todos" || item.lugarPreparacion === lugarPreparacion;
        let matchMesa = mesa === "todas" || item.mesa === mesa;
        return matchTipo && matchLugar && matchMesa;
    });

    if (vista === 'lista') {
        tablaComandas.style.display = 'block';
        mesasContainer.style.display = 'none';
        renderizarComandas(filteredData);
    } else if (vista === 'mesas') {
        tablaComandas.style.display = 'none';
        mesasContainer.style.display = 'flex';
        renderizarMesas(filteredData);
    }
}

function filtrarComandas() {
    const tipoElement = document.getElementById("tipo");
    const lugarPreparacionElement = document.getElementById("lugarPreparacion");
    const mesaElement = document.getElementById("mesa");

    if (!tipoElement || !lugarPreparacionElement || !mesaElement) {
        console.error("Uno o más elementos de filtro no se encontraron en el DOM.");
        return;
    }

    let tipo = tipoElement.value;
    let lugarPreparacion = lugarPreparacionElement.value;
    let mesa = mesaElement.value;

    console.log("Filtrando comandas por tipo:", tipo, "lugar de preparación:", lugarPreparacion, "mesa:", mesa);

    let filteredData = dataComandas.partidas.filter(item => {
        let matchTipo = tipo === "todas" || item.tipo === tipo;
        let matchLugar = lugarPreparacion === "todos" || item.lugarPreparacion === lugarPreparacion;
        let matchMesa = mesa === "todas" || item.mesa === mesa;
        return matchTipo && matchLugar && matchMesa;
    });

    // Verificar si estamos en vista de mesas
    const mesasContainer = document.getElementById('mesas-view');
    if (mesasContainer && mesasContainer.style.display === 'flex') {
        renderizarMesas(filteredData);
    } else {
        renderizarComandas(filteredData);
    }
}


function obtenerComandas() {
    let token =Token;
    console.log('Token recuperado de localStorage:', token);
    fetch(apiUrl + '/web/ventas/comanda', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_lugar_preparacion: idPreparacionComandas,
            tipo: tipoComandas
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            dataComandas = data.data; // Save the data globally for switching views
            console.log("Datos comandas:", dataComandas);
            renderizarComandas(dataComandas.partidas);
            actualizarFiltroMesas(dataComandas.partidas); // Actualizar el filtro de mesas
        } else {
            console.error('Error en la obtención de datos de comandas:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la obtención de datos de comandas:', error);
    });
}

function actualizarFiltroMesas(data) {
    let mesaSelect = document.getElementById("mesa");
    mesaSelect.innerHTML = '<option value="todas">TODAS</option>'; // Reset options

    let mesas = new Set(); // Usar un Set para evitar duplicados

    data.forEach(item => {
        mesas.add(item.mesa);
    });

    mesas.forEach(mesa => {
        let option = document.createElement("option");
        option.value = mesa;
        option.text = `Mesa: ${mesa}`;
        mesaSelect.appendChild(option);
    });
}

function obtenerActualizarComanda(idPartida) {
    let token =Token;
    console.log('Token recuperado de localStorage:', token);
    fetch(apiUrl + '/web/ventas/actualizaComanda', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_partida: idPartida,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log("Comanda actualizada:", data.data);
            obtenerComandas(); // Refrescar la lista de comandas
        } else {
            console.error('Error en la actualización de la comanda:', data.message);
        }
    })
    .catch(error => {
        console.error('Error en la actualización de la comanda:', error);
    });
}

function comandaHistorico() {
    let token =Token;
    console.log('Token recuperado de localStorage:', token);
    fetch(apiUrl + '/web/ventas/comandaHistorico', {  // Verifica que esta URL sea la correcta para histórico de comandas
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_lugar_preparacion: idPreparacionComandas,  // Asegúrate de enviar todos los parámetros requeridos
            tipo: tipoComandas
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            let dataComandaHistorico = data.data;
            console.log("Datos de histórico de comandas:", dataComandaHistorico);
            renderizarComandas(dataComandaHistorico, true);  // Indicar que es el histórico
        } else {
            console.error('Error al obtener el histórico de comandas:', data.message);
        }
    })
    .catch(error => {
        console.error('Error al obtener el histórico de comandas:', error);
    });
}

function obtenerRecuperarComandas(idPartida) {
    let token =Token;
    console.log('Token recuperado de localStorage:', token);
    fetch(apiUrl + '/web/ventas/recuperaComanda', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            id_partida: idPartida,
            id_lugar_preparacion: idPreparacionComandas,  // Asegúrate de enviar todos los parámetros requeridos
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log("Datos de recuperación de comandas:", data.data);
            obtenerComandas(); // Actualizar la lista de comandas
        } else {
            console.error('Error al recuperar las comandas:', data.message);
        }
    })
    .catch(error => {
        console.error('Error al recuperar las comandas:', error);
    });
}

function renderizarComandas(data, esHistorico = false) {
    const cuerpoTabla = document.getElementById("cuerpo-tabla-comandas");
    cuerpoTabla.innerHTML = ""; // Limpiar la tabla antes de renderizar nuevos datos

    data.forEach((item) => {
        let fila = document.createElement("tr");
        fila.innerHTML = `
            <td style="width: 50px;"><button class="info-btn" data-id="${item.id_partida}">i</button></td>
            <td>${item.transcurrido} min.</td>
            <td>${item.cantidad}</td>
            <td>
                ${item.nombre}
                ${item.partidas && item.partidas.length > 0 ? '<br><strong style="font-size: smaller;">Ingredientes:</strong> <ul style="font-size: x-small; list-style-type: none; padding-left: 0;">' + item.partidas.map(subItem => `<li>${subItem.nombre} (${subItem.cantidad})</li>`).join('') + '</ul>' : ''}
            </td>
            <td>${item.observaciones || 'N/A'}</td>
            <td>${item.tiempo || '-'}</td>
            <td>${item.mesa}</td>
            <td>
                ${esHistorico ? `<button class="recuperarComanda" data-id="${item.id_partida}">Recuperar</button>` : `<button class="actualizarComanda" data-id="${item.id_partida}">Actualizar</button>`}
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });

    // Agregar eventos a los nuevos botones
    document.querySelectorAll('.info-btn').forEach(button => {
        button.addEventListener('click', function () {
            mostrarDetallesComanda(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.actualizarComanda').forEach(button => {
        button.addEventListener('click', function () {
            obtenerActualizarComanda(this.getAttribute('data-id'));
        });
    });

    document.querySelectorAll('.recuperarComanda').forEach(button => {
        button.addEventListener('click', function () {
            obtenerRecuperarComandas(this.getAttribute('data-id'));
        });
    });
}

function mostrarDetallesComanda(idPartida) {
    let comanda = dataComandas.partidas.find(item => item.id_partida == idPartida);
    if (comanda) {
        let detallesContent = document.getElementById('detalles-comanda-content');
        detallesContent.innerHTML = `
            <p><strong>Transcurrido:</strong> ${comanda.transcurrido} min.</p>
            <p><strong>Cantidad:</strong> ${comanda.cantidad}</p>
            <p><strong>Nombre:</strong> ${comanda.nombre}</p>
            <p><strong>Observaciones:</strong> ${comanda.observaciones || 'N/A'}</p>
            <p><strong>Tiempo:</strong> ${comanda.tiempo || '-'}</p>
            <p><strong>Mesa:</strong> ${comanda.mesa}</p>
        `;
        document.getElementById('modal-detalles-comanda').style.display = 'block';
    }
}

function cerrarModal() {
    document.getElementById('modal-detalles-comanda').style.display = 'none';
}

function renderizarMesas(data) {
    const mesasContainer = document.getElementById('mesas-view');
    mesasContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar nuevos datos

    let mesas = {};

    // Agrupar comandas por mesa
    data.forEach((item) => {
        if (!mesas[item.mesa]) {
            mesas[item.mesa] = [];
        }
        mesas[item.mesa].push(item);
    });

    // Renderizar cada mesa con sus comandas
    for (let mesa in mesas) {
        let mesaCard = document.createElement('div');
        mesaCard.className = 'mesa-card';

        let mesaHeader = document.createElement('div');
        mesaHeader.className = 'mesa-header';
        mesaHeader.textContent = `MESA ${mesa}`;
        mesaCard.appendChild(mesaHeader);

        let mesaTable = document.createElement('table');
        mesaTable.className = 'mesa-table';

        let tableHeader = `
            <tr>
                <th>CANTIDAD</th>
                <th>NOMBRE</th>
                <th>TIEMPO</th>
                <th></th>
            </tr>
        `;
        mesaTable.innerHTML = tableHeader;

        mesas[mesa].forEach((item, index) => {
            let mesaRow = document.createElement('tr');
            mesaRow.innerHTML = `
                <td>${item.cantidad}</td>
                <td>
                    ${item.nombre}
                    ${item.partidas && item.partidas.length > 0 ? '<ul class="ingredientes">' + item.partidas.map(subItem => `<li>${subItem.nombre} (${subItem.cantidad})</li>`).join('') + '</ul>' : ''}
                </td>
                <td>${item.transcurrido} min.</td>
                <td>
                    <button class="actualizarComanda" data-id="${item.id_partida}">Actualizar</button>
                </td>
            `;
            mesaTable.appendChild(mesaRow);

            // Agregar separador entre comandas
            if (index < mesas[mesa].length - 1) {
                let separatorRow = document.createElement('tr');
                let separatorCell = document.createElement('td');
                separatorCell.colSpan = 4;
                separatorCell.className = 'separator';
                separatorRow.appendChild(separatorCell);
                mesaTable.appendChild(separatorRow);
            }
        });

        mesaCard.appendChild(mesaTable);
        mesasContainer.appendChild(mesaCard);
    }

    // Agregar eventos a los nuevos botones
    document.querySelectorAll('.actualizarComanda').forEach(button => {
        button.addEventListener('click', function () {
            obtenerActualizarComanda(this.getAttribute('data-id'));
        });
    });
}

    }



//CorteZ
export function mainFuntionCorteZ(token, apiURL){

    var Token = token;
    var apiUrl = apiURL;

    // Asignar eventos a los botones de incremento y decremento
    document.querySelectorAll('.minus-cortez').forEach(button => {
        button.addEventListener('click', function() {
            updateCount(button.parentElement.parentElement.id, -1);
        });
    });

    document.querySelectorAll('.plus-cortez').forEach(button => {
        button.addEventListener('click', function() {
            updateCount(button.parentElement.parentElement.id, 1);
        });
    });

    // Asignar evento al botón de enviar
    document.getElementById('submitCorteZ').addEventListener('click', submitCorteZ);

    // Asignar evento al botón de cerrar modal
    document.getElementById('closeModal').addEventListener('click', closeModal);

    // Asignar evento al botón de imprimir modal
    document.getElementById('modalPrintButton').addEventListener('click', printCorteZ);


// Función para actualizar el conteo
function updateCount(denomination, amount) {
    console.log(`Actualizando ${denomination} por ${amount}`);
    const input = document.getElementById(denomination.split('-')[1]);
    const currentValue = parseInt(input.value);
    const newValue = currentValue + amount;
    if (newValue >= 0) {
        input.value = newValue;
    }
    console.log(`Nuevo valor para ${denomination}: ${input.value}`);
}

// Función para abrir el modal
function openModal(title, message, cierre, showPrintButton) {
    console.log('Abriendo modal...');
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('modalCierre').innerText = cierre ? 'Cierre: ' + cierre : '';
    document.getElementById('modalPrintButton').style.display = showPrintButton ? 'block' : 'none';
    document.getElementById('modalCorteZ').style.display = 'block';
    console.log('Modal abierto con título:', title, 'mensaje:', message, 'cierre:', cierre, 'mostrar botón de imprimir:', showPrintButton);
}

// Función para cerrar el modal
function closeModal() {
    console.log('Cerrando modal...');
    document.getElementById('modalCorteZ').style.display = 'none';
}

// Función para imprimir el corte Z
function printCorteZ() {
    console.log('Imprimiendo corte Z...');
    window.print();
}

function submitCorteZ() {
console.log('Enviando Corte Z...');
// Obtener el token de localStorage
let token =Token;

// Verificar si el token existe
if (!token) {
    console.error('No hay token disponible, por favor inicia sesión primero.');
    return;
}

// Recolectar los datos de billetes y monedas
const denomination_1000 = document.getElementById('1000').value;
const denomination_500 = document.getElementById('500').value;
const denomination_200 = document.getElementById('200').value;
const denomination_100 = document.getElementById('100').value;
const denomination_50 = document.getElementById('50').value;
const denomination_20 = document.getElementById('20').value;
const denomination_10 = document.getElementById('10').value;
const denomination_5 = document.getElementById('5').value;
const denomination_2 = document.getElementById('2').value;
const denomination_1 = document.getElementById('1').value;
const denomination_0_5 = document.getElementById('05').value;

console.log('Datos recolectados:', {
    "1000": denomination_1000,
    "500": denomination_500,
    "200": denomination_200,
    "100": denomination_100,
    "50": denomination_50,
    "20": denomination_20,
    "10": denomination_10,
    "5": denomination_5,
    "2": denomination_2,
    "1": denomination_1,
    "05": denomination_0_5
});

// Enviar los datos a la API de Corte Z
fetch(apiUrl + '/web/ventas/creaCorte', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        token: token,
        "1000": denomination_1000,
        "500": denomination_500,
        "200": denomination_200,
        "100": denomination_100,
        "50": denomination_50,
        "20": denomination_20,
        "10": denomination_10,
        "5": denomination_5,
        "2": denomination_2,
        "1": denomination_1,
        "05": denomination_0_5
    })
})
.then(response => response.json())
.then(data => {
    console.log('Respuesta de creaCorte:', data);
    if (data.response) {
        const id_corte = data.data.id_corte;
        fetchCorteData(token, id_corte);
    } else {
        console.log('Error al procesar solicitud:', data.message);
        openModal('Error al procesar solicitud', data.message, '', false);
    }
})
.catch((error) => {
    console.error('Error:', error);
    alert('Error al enviar el Corte Z');
});
}

// Función para obtener los datos del Corte Z
function fetchCorteData(token, id_corte) {
console.log('Obteniendo datos del Corte Z:', id_corte);
fetch(apiUrl + '/web/ventas/corte', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        token: token,
        id_corte: id_corte
    })
})
.then(response => response.json())
.then(data => {
    console.log('Respuesta de corte:', data);
    if (data.response) {
        const cierre = data.data[0].cierre;
        openModal('Solicitud completada', 'Corte creado correctamente', cierre, true);
    } else {
        alert('Error al obtener los datos del Corte Z');
    }
})
.catch((error) => {
    console.error('Error:', error);
    alert('Error al obtener los datos del Corte Z');
});

}

}

export function mainFuntionCorteX(token, apiURL){
  	var Token = token;
    var apiUrl = apiURL;


    obtenerDatosCorteX();


function obtenerDatosCorteX() {
    const token = Token;

    fetch(apiUrl + '/web/ventas/cortex', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: token,
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log("Datos de Corte X obtenidos exitosamente:", data);
            renderizarCorteX(data.data);
        } else {
            console.error("Error al obtener los datos de Corte X:", data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function renderizarCorteX(datos) {
    document.querySelector('.fecha').textContent = `Fecha: ${new Date().toLocaleDateString()}`;
    document.querySelector('.corte-detalles').innerHTML = `
        <div class="corte-item">
            <div>Ventas en efectivo</div>
            <span>$ ${datos.ventas_efectivo.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Ventas con tarjeta</div>
            <span>$ ${datos.ventas_tarjeta.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Ventas con otros</div>
            <span>$ ${datos.ventas_otro.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Ventas en aplicación</div>
            <span>$ ${datos.ventas_aplicacion.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Total de ventas</div>
            <span>$ ${datos.ventas_total.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Propinas en efectivo</div>
            <span>$ ${datos.propinas_efectivo.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Propinas en tarjeta</div>
            <span>$ ${datos.propinas_tarjeta.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Total de propinas</div>
            <span>$ ${datos.propinas_total.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Fondo de caja</div>
            <span>$ ${datos.fondo_caja ? datos.fondo_caja.toFixed(2) : '0.00'}</span>
        </div>
        <div class="corte-item">
            <div>Ingresos</div>
            <span>$ ${datos.ingresos.toFixed(2)}</span>
        </div>
        <div class="corte-item">
            <div>Egresos</div>
            <span>$ ${datos.egresos.toFixed(2)}</span>
        </div>
        <div class="corte-item total-caja">
            <div>Total en caja</div>
            <span>$ ${datos.total_caja.toFixed(2)}</span>
        </div>
    `;
}

function imprimirTicket() {
    window.print();
}

}
//EnSaDi 
 export function mainFuntionEnSaDi(token, apiURL) {
	var Token = token;
    var apiUrl = apiURL;
 document.getElementById('submit-button').addEventListener('click', crearFlujo);
document.getElementById('minus').addEventListener('click', decrement);
document.getElementById('plus').addEventListener('click', increment);
document.getElementById('cantidad').addEventListener('input', validateInput);

function mostrarModalError() {
  var modal = document.getElementById("errorModal");
  var span = document.getElementsByClassName("EnSaDi-close")[0];

  modal.style.display = "block";

  span.onclick = function() {
    modal.style.display = "none";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

function crearFlujo() {
  let token = Token;
  if (!token) {
    console.error("No hay token disponible, por favor inicia sesión primero.");
    mostrarModalError();
    return;
  }

  let tipo = document.querySelector('input[name="tipo"]:checked').value;
  let concepto = document.getElementById("concepto").value;
  let cantidad = document.getElementById("cantidad").value;
  let pago = document.getElementById("pago").value;
  let pin = document.getElementById("pin").value;

  // Mostrar los datos que serán enviados
  console.log("Token:", token);
  console.log("Tipo:", tipo);
  console.log("Concepto:", concepto);
  console.log("Cantidad:", cantidad);
  console.log("Pago:", pago);
  console.log("Pin:", pin);

  fetch(apiUrl + "/web/flujos/crea", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Token: token,
      tipo: tipo,
      concepto: concepto,
      cantidad: cantidad,
      pago: pago,
      pin: pin,
    }),
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    console.log("Respuesta de la API: ", data);
    if (data.response) {
      console.log("Flujo creado exitosamente:", data.data);
      mostrarFlujoCreado(data.data);
    } else {
      console.error("Error al crear el flujo:", data.message);
	  mostrarModalError();
    }
  })
  .catch((error) => {
    console.error("Fetch error:", error);
    mostrarModalError();
  });
}


function mostrarFlujoCreado(data) {
  let flujoDiv = document.getElementById("flujoCreado");
  flujoDiv.innerHTML = `
    <h3>Flujo Creado:</h3>
    <p>Tipo: ${data.tipo}</p>
    <p>Fecha: ${new Date(data.fecha).toLocaleString()}</p>
    <p>Concepto: ${data.concepto}</p>
    <p>Importe: ${data.importe}</p>
    <p>Responsable: ${data.responsable}</p>
  `;
}

function decrement() {
  let cantidadInput = document.getElementById("cantidad");
  let value = parseInt(cantidadInput.value, 10);
  if (value > 0) {
    cantidadInput.value = value - 1;
  }
}

function increment() {
  let cantidadInput = document.getElementById("cantidad");
  let value = parseInt(cantidadInput.value, 10);
  cantidadInput.value = value + 1;
}

function validateInput() {
  let cantidadInput = document.getElementById("cantidad");
  let warning = document.getElementById("warning");
  if (isNaN(cantidadInput.value)) {
    warning.style.display = "block";
  } else {
    warning.style.display = "none";
  }
}

 }
 
 //ajustes
 
export function mainFuntionAjustes(token, apiURL){


    var Token = token;
    var apiUrl = apiURL;
	

			/*Actualiza Ajustes Alterno*/
			var mesas = ''; // string
			var cajon_dinero = 0; // 0 = No // 1 = Si
			var mostrar_comensales = 0; // 0 = No // 1 = Si
			var mostrar_tiempos = 0; // 0 = No // 1 = Si
			var mostrar_comandas = 0; // 0 = No // 1 = Si
			var redireccion_comanda = 0; // 0 = No // 1 = Si
			var orden_comandas = 1; // 1 = Las nuevas van arriba
									// 2 = Las nuevas van abajo
			var confirmacion_descuento = 0; // 0 = No // 1 = Si
			var ticket_horas = 0; // 0 = No // 1 = Si
			var propina_sugerida = 0; // 0 = No // 1 = Si
			var propina_sugerida_porcentaje = 10; //opcional

			/*Actualiza Ajustes*/
			var impresion = 0; // 0 = No // 1 = Si
			var printer
			var tray 
			var paper 
			var key

			/*Areas Mesas*/
			/*Crea*/
			var nombre = '';
			var mesas = 0;
			/*Actualiza*/
			var id_area_mesa = 0;
			var nombre = '';
			var mesas = 0;

			/*Ventas Promociones*/
			/*Crea*/
			var nombre = '';
			var tipo = 1; // 1 = Directo // 2 = Porcentual
			var cantidad = 0;

			/*Promociones*/
			// Solo obtiene Token

			/*Actualiza*/
			var id_promocion = 0;
			var nombre = '';
			var tipo = 1; // 1 = Directo // 2 = Porcentual
			var cantidad = 0;

    // Event Listeners
document.getElementById('actualiza-ajustes-punto-venta').addEventListener('click', actualizaAjustesPuntoVenta);
document.getElementById('actualiza-ajustes-comandas').addEventListener('click', actualizaAjustesComandas);
document.getElementById('actualiza-ajustes-promociones').addEventListener('click', actualizaAjustesPromociones);
document.getElementById('actualiza-ajustes-ticket').addEventListener('click', actualizaAjustesTicket);
document.getElementById('ver-areas').addEventListener('click', verAreas);
document.getElementById('crear-area').addEventListener('click', mostrarFormularioCrearArea);
document.getElementById('actualizar-area').addEventListener('click', mostrarFormularioActualizarArea);
document.getElementById('crea-area-mesas').addEventListener('click', creaAreaMesas);
document.getElementById('actualiza-area-mesas').addEventListener('click', actualizaAreaMesas);
document.getElementById('obtener-promociones').addEventListener('click', obtenerPromociones);
document.getElementById('crear-promocion').addEventListener('click', mostrarFormularioCrearPromocion);
document.getElementById('actualizar-promocion').addEventListener('click', mostrarFormularioActualizarPromocion);
document.getElementById('crea-promocion').addEventListener('click', creaPromocion);
document.getElementById('actualiza-promocion').addEventListener('click', actualizaPromocion);
document.getElementById('propina-sugerida').addEventListener('change', togglePropinaPorcentaje);

function createRequestBody() {
    let token = Token;
    const mesas = document.getElementById('mesas').value || 0;
    const cajon_dinero = document.getElementById('cajon-dinero').value;
    const mostrar_comensales = document.getElementById('mostrar-comensales').value;
    const mostrar_tiempos = document.getElementById('mostrar-tiempos').value;
    const mostrar_comandas = document.getElementById('mostrar-comandas').value;
    const redireccion_comanda = document.getElementById('redireccion-comanda').value;
    const orden_comandas = document.getElementById('orden-comandas').value;
    const confirmacion_descuento = document.getElementById('confirmacion-descuento').value;
    const ticket_horas = document.getElementById('ticket-horas').value || 0;
    const propina_sugerida = document.getElementById('propina-sugerida').checked ? 1 : 0;
    const propina_sugerida_porcentaje = document.getElementById('propina-sugerida').checked 
        ? (document.getElementById('propina-sugerida-porcentaje').value || 0)
        : 0;

    return {
        token,
        mesas,
        cajon_dinero,
        mostrar_comensales,
        mostrar_tiempos,
        mostrar_comandas,
        redireccion_comanda,
        orden_comandas,
        confirmacion_descuento,
        ticket_horas,
        propina_sugerida,
        propina_sugerida_porcentaje
    };
}

function actualizaAjustes() {
    let token = Token;
    const body = createRequestBody();

    fetch(apiUrl + '/web/empresas/actualizaAjustesAlterno', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(body).toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log('Ajustes actualizados exitosamente:', data.message);
        } else {
            console.error('Error al actualizar ajustes:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function togglePropinaPorcentaje() {
    let propinaCheckbox = document.getElementById('propina-sugerida').checked;
    let propinaPorcentajeLabel = document.getElementById('propina-porcentaje-label');
    if (propinaCheckbox) {
        propinaPorcentajeLabel.classList.remove('hidden');
    } else {
        propinaPorcentajeLabel.classList.add('hidden');
    }
}

function verAreas() {
    let token = Token;
    let body = JSON.stringify({
        token: token
    });

    console.log('Token:', token);
    console.log('API URL:', apiUrl + '/web/empresas/empresa');

    fetch(apiUrl + '/web/empresas/empresa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log('Áreas de mesas obtenidas:', data.data[0].areas_mesas);
            mostrarAreas(data.data[0].areas_mesas);
        } else {
            console.error('Error al obtener áreas de mesas:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function mostrarAreas(areas) {
    let areasLista = document.getElementById('areas-lista');
    let areasUl = document.getElementById('areas-ul');
    areasUl.innerHTML = ''; // Limpia la lista actual

    areas.forEach(area => {
        let li = document.createElement('li');
        li.textContent = `ID: ${area.id_area_mesa}, Nombre: ${area.nombre}, Mesas: ${area.mesas}`;
        areasUl.appendChild(li);
    });

    areasLista.classList.remove('hidden'); // Muestra la sección de áreas
}

function mostrarFormularioCrearArea() {
    document.getElementById('formulario-crear-area').classList.remove('hidden');
    document.getElementById('formulario-actualizar-area').classList.add('hidden');
}

function mostrarFormularioActualizarArea() {
    document.getElementById('formulario-crear-area').classList.add('hidden');
    document.getElementById('formulario-actualizar-area').classList.remove('hidden');
}

function creaAreaMesas() {
    let token = Token;
    let nombre = document.getElementById('crear-area-nombre').value;
    let mesas = document.getElementById('crear-area-mesas').value;

    let body = new URLSearchParams({
        token: token,
        nombre: nombre,
        mesas: mesas
    }).toString();

    fetch(apiUrl + '/web/areas_mesas/crea', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log('Área creada correctamente:', data.message);
        } else {
            console.error('Error al crear el área:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function actualizaAreaMesas() {
    let token = Token;
    let id_area_mesa = document.getElementById('actualizar-area-id').value;
    let nombre = document.getElementById('actualizar-area-nombre').value;
    let mesas = document.getElementById('actualizar-area-mesas').value;

    let body = new URLSearchParams({
        token: token,
        id_area_mesa: id_area_mesa,
        nombre: nombre,
        mesas: mesas
    }).toString();

    fetch(apiUrl + '/web/areas_mesas/actualiza', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log('Área actualizada correctamente:', data.message);
        } else {
            console.error('Error al actualizar el área:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function obtenerPromociones() {
    let token = Token;
    let body = JSON.stringify({
        token: token
    });

    console.log('Token:', token);
    console.log('API URL:', apiUrl + '/web/ventas_promociones/promociones');

    fetch(apiUrl + '/web/ventas_promociones/promociones', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log('Promociones obtenidas:', data.data);
            mostrarPromociones(data.data);
        } else {
            console.error('Error al obtener promociones:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function mostrarPromociones(promociones) {
    let promocionesLista = document.getElementById('promociones-lista');
    let promocionesUl = document.getElementById('promociones-ul');
    promocionesUl.innerHTML = '';

    promociones.forEach(promocion => {
        let tipoTexto = promocion.tipo === 1 ? 'Directo' : 'Porcentual';
        let li = document.createElement('li');
        li.textContent = `ID: ${promocion.id_promocion}, Nombre: ${promocion.nombre}, Tipo: ${tipoTexto}, Cantidad: ${promocion.cantidad}`;
        promocionesUl.appendChild(li);
    });

    promocionesLista.classList.remove('hidden');
}

function mostrarFormularioCrearPromocion() {
    document.getElementById('formulario-crear-promocion').classList.remove('hidden');
    document.getElementById('formulario-actualizar-promocion').classList.add('hidden');
}

function mostrarFormularioActualizarPromocion() {
    document.getElementById('formulario-crear-promocion').classList.add('hidden');
    document.getElementById('formulario-actualizar-promocion').classList.remove('hidden');
}

// ADMINISTRAR PROMOCIONES Crear Promoción
function creaPromocion() {
    let token = Token;
    let nombre = document.getElementById('crear-promocion-nombre').value;
    let tipo = document.getElementById('crear-promocion-tipo').value;
    let cantidad = document.getElementById('crear-promocion-cantidad').value;

    let body = JSON.stringify({
        token: token,
        nombre: nombre,
        tipo: tipo,
        cantidad: cantidad
    });

    fetch(apiUrl + '/web/ventas_promociones/crea', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log('Promoción creada correctamente:', data.message);
        } else {
            console.error('Error al crear la promoción:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// ADMINISTRAR PROMOCIONES Actualizar Promoción
function actualizaPromocion() {
    let token = Token;
    let id_promocion = document.getElementById('actualizar-promocion-id').value;
    let nombre = document.getElementById('actualizar-promocion-nombre').value;
    let tipo = document.getElementById('actualizar-promocion-tipo').value;
    let cantidad = document.getElementById('actualizar-promocion-cantidad').value;

    let body = JSON.stringify({
        token: token,
        id_promocion: id_promocion,
        nombre: nombre,
        tipo: tipo,
        cantidad: cantidad
    });

    fetch(apiUrl + '/web/ventas_promociones/actualiza', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log('Promoción actualizada correctamente:', data.message);
        } else {
            console.error('Error al actualizar la promoción:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//Actualizar ajustes Promociones 
function actualizaAjustesPromociones() {
    let token = Token;
    const confirmacion_descuento = document.getElementById('confirmacion-descuento').value;

    let body = JSON.stringify({
        token: token,
        confirmacion_descuento: confirmacion_descuento
    });

    fetch(apiUrl + '/web/empresas/actualizaAjustesPromociones', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.response) {
            console.log('Ajustes de promociones actualizados exitosamente:', data.message);
        } else {
            console.error('Error al actualizar ajustes de promociones:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function actualizaAjustesPuntoVenta() {
    actualizaAjustes();
}

function actualizaAjustesComandas() {
    actualizaAjustes();
}

function actualizaAjustesPromociones() {
    actualizaAjustes();
}

function actualizaAjustesTicket() {
    actualizaAjustes();
}

}
