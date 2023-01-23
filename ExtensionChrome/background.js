import * as util from "./util.js"
import * as util_html from "./util_html.js"
import * as dao_almacenamiento from "./dao_almacenamiento.js"

var mb = 0

var request_Almacenar = []
var ventanas_attached = []
var dias_expiracion = 30
var cargos_baneados = ['cloud architect', 'back-end', 'front-end', 'android', 
						'node[.]js', '[.]net', 'django', 'react[.]js', 'vue[.]js',
						'front end', 'back end', 'devops', 'backend', 'frontend',
						'intern', 'sr', 'senior', 'jefe', 'usd', 'oracle', 'lider', 
						'product owner', 'lead', 'practica', 'site reliability engineer', 
						'sre', 'software engineer', 'data scientist', 'fullstack', 'full stack',
						'us[$]','scrum master']
var reg = new RegExp(/\d+/)
//var regex = /(?:al menos (?:de )?|entre )?(?:(\d)|(\d) [aoy] \d|(\d)-\d) a[ññ]{1,2}o[s]?(?:(?:(?: de)? experiencia)?)/guim;
var regex = /(?:al menos|minimo|desde|experiencia (?:de|de al menos|minima de)) (?:\d{1,2}|\d{1,2}[aoy\- ]*\d{1,2}) año[s]? (?:de experiencia(?: en el cargo)?|en cargos similares)/guim///.{20}\d año[s]?.{20}/guim;
var urls_sitios = {
    "linkedin" : "https://www.linkedin.com/voyager/api/graphql?variables=(jobCardPrefetchQuery"
}

/*
por hacer

ejecutar un script cuando se entra a la pagina que extraiga las ids de las descartadas y sacar las publicaciones que tengan la id--

consultar el webservice de google, direcciones de la empresa y guardar las coordenadas

en la lista de ofertas, agregar un boton para descartar ofertas manualmente--

en la lista de ofertas, agregar un mapa para mostrar las coordenadas guardadas

guardar las fotos de empresa

agregar un script que recorra la base y descarte las ofertas,

agregar script para extraer los años requeridos por oferta--

arreglar las peticiones duplicadas --

agregar compatibilidad con duoc y computrabajo

listar las solicitudes en la lista de ofertas

al volver Atras, se pierden los descartados y el divDescartados no vuelve a aparecer

no se extraen los datos cuando se realizan busquedas personalizadas fuera del jobs

al descartar en pagina, agregar un color por tipo de descarte para evitar confusion

agregar, buscar ofertas en la bd cuando se busca fuera de linkedin

mover las funciones de utilidad a un archivo nuevo

agregar opcion para agregar o quitar botones en el action

compatibildad en extraccion de experiencia para los empleos que estan en ingles
*/




/*
Empresas a Descartar 
revelo
Oowlish
Apiux Tecnologia

*/








let regx = new class {
	//Las palabras se podria pasar a un config o al storage para que sea dinamico y modificable desde js

	expresion = cargos_baneados.join('|')
	Ofertasregex = new RegExp(this.expresion, 'gium')

	AciertosMatch(palabra, InputRegex) {
		let respuesta = palabra.match(new RegExp(InputRegex, 'giu'))
		if (respuesta) {
			return respuesta[0]
		}
	}

	cargo_baneado(titulo) {
		titulo = util.quitarAcentos(titulo)
		let temp_regex = new RegExp(this.expresion, 'gium')
	
		let respuesta = temp_regex.exec(titulo)
		console.log('Probando regex titulo con', titulo, respuesta)
		//if respuesta == null, devolver el titulo convertido en unicode o algo asi


		return respuesta != null
	}
}


/*
	Enviar texto literal
*/
function DuocLaboral(Respuesta) {


}

function Computrabajo() {

}

function Talent() {

}

const modelo_imagen_compania = {
	id_imagen: "",
	uri_imagen: "",
	id_compania: 0
}

const modelo_oferta = {
	id_compania: 0,
	id_empleo: 0,
	cargo: "",
	empresa: "",
	localizacion_empleo: "",
	fecha_publicacion: "",
	cantidad_solicitudes: [],
	descripcion_empleo: "",
	link_incripcion: "",
	link_oferta: "",
	tipo_jornada: "",
	tipo_modalidad: "",
	fecha_recoleccion_registro: "",
	pagina_recoleccion: "",
	oferta_repetida: false,
	uri_foto_empresa: "",
	nombre_publicador: "",
	link_empresa: "",
	aplicado: false,
	tipo_solicitud: "",
	info_empresa: "",
	descartada: false,
	coordenadas: "",
	fecha_descarte: 0,
	tipo_descarte: {},
	esta_en_ingles: false

}


function adjuntar_debugger(tabid){

    if(ventanas_attached.includes(tabid)){
        console.log('El debugger ya se encuentra en la ventana', tabid)
        return;
    }
    //Al estar dentro de una funcion, los parametros con nombre dan error, ej: targer = {tabid : tabid}
    chrome.debugger.attach({tabId : tabid}, "1.3", () => {
        chrome.debugger.sendCommand({tabId: tabid}, "Network.enable");
        ventanas_attached.push(tabid)
        console.log('se ha adjuntado el listener correctamente en ', tabid)
    })        
}



async function Linkedin(respuesta, tabId) {
	var Lista_oferta = {}
	var tiempo_llamado = new Date().getTime()
	const resp = JSON.parse(respuesta.replaceAll("\n", "\\n"))

	for (var i = 0, len = resp.included.length; i < len; ++i) {
		let fila = resp.included[i]
		let id_oferta = 0
		let id_compania = 0

		switch (fila.$type) {
			case 'com.linkedin.voyager.dash.jobs.JobPosting':
				id_oferta = reg.exec(fila.trackingUrn)[0]

				let saltar_oferta = false;
				await chrome.storage.local.get(id_oferta).then((oferta) => {
					if (!util.objectoEstaVacio(oferta)) {
						console.log('oferta ya existente, saltando ', id_oferta)
						saltar_oferta = true;
						if (oferta[id_oferta].descartada) {
							chrome.scripting.executeScript({
								target : {tabId : tabId} ,
								func :  util_html.descartar_oferta,
								args : [id_oferta]
							})
							
							
						}
					}
				})
				/*
var regex = /.{0,50}\d{1,3} año[s]?.{0,50}/guim
chrome.storage.local.get(null, lista => {
	Object.entries(lista).forEach(oferta => {
		let match;
		while((match = regex.exec(oferta[1].descripcion_empleo) ) !== null){
			console.log(match[0])    
		}
	})
})
print('\n'.join(exrex.generate('(?:Al menos|mínimo|Desde|Experiencia (?:de|de al menos|minima de)) (?:\d{1,2}|\d{1,2}[aoy\- ]*\d{1,2}) año[s]? (?:de experiencia|de experiencia en el cargo|en cargos similares)')))

(?:Al menos|mínimo|Desde|Experiencia (?:de|de al menos|minima de)) (?:\d{1,2}|\d{1,2}[aoy\- ]*\d{1,2}) año[s]? (?:de experiencia|de experiencia en el cargo|en cargos similares)
(?:Al menos|mínimo|Desde|Experiencia de|Experiencia de al menos|Experiencia mínima de) (?:\d{1,2}|\d{1,2}[aoy\- ]*\d{1,2}) año[s]? (?:de experiencia|de experiencia en el cargo|en cargos similares)
(?:mínimo |al menos |Experiencia(?: laboral)? mínima (?:de )?|entre )[+]?\d
(?:\d{1,2}|\d{1,2}[aoy\- ]*\d{1,2}) año[s]?
(?:Al menos|mínimo|Desde|Experiencia de|Experiencia de al menos|Experiencia mínima de) \d año[s]? (?:de experiencia|de experiencia en el cargo|en cargos similares)
(?:(\d)|(\d) [aoy] \d|(\d)-\d) a[ññ]{1,2}o[s]?(?:(?:(?: de)? experiencia)?)
*/
				let match;
				let HTML_Lista_Experiencia = "";
				while ((match = regex.exec(fila.description.text)) !== null) {
					HTML_Lista_Experiencia += `<li class='job-card-list__insight' >${match[0]}</li>`
				}
				chrome.scripting.executeScript({
					target : {tabId : tabId} ,
					func :  util_html.insertarAñosExpDiv,
					args : [id_oferta , HTML_Lista_Experiencia]
				})
				if (saltar_oferta) {
					break;
				}

				var oferta_temp = Object.assign({}, modelo_oferta)
				oferta_temp.tipo_descarte = {
					expirada: false,
					tecnologias: false,
					annos_exp: false,
					cargo: false,
					distancia_oficina: false,
					manual: false,
					empresa: false
				}
				if (regx.cargo_baneado(fila.title)) {
					oferta_temp.tipo_descarte.cargo = true
					oferta_temp.descartada = true
					chrome.scripting.executeScript({
						target : {tabId : tabId} ,
						func :  util_html.descartar_oferta,
						args : [id_oferta]
					})

				}
				oferta_temp.id_empleo = id_oferta
				oferta_temp.descripcion_empleo = util.quitarAcentos(fila.description.text)
				oferta_temp.pagina_recoleccion = "Linkedin"
				oferta_temp.cargo = fila.title
				oferta_temp.fecha_recoleccion_registro = tiempo_llamado
				Lista_oferta[id_oferta] = oferta_temp
				break;

			case 'com.linkedin.voyager.dash.jobs.JobPostingCard':
				id_oferta = reg.exec(fila.entityUrn)[0]

				if (Lista_oferta[id_oferta] == null) {
					await chrome.storage.local.get(id_oferta).then((oferta) => {
						try {
							oferta[id_oferta].cantidad_solicitudes.push({
								cantidad_solicitudes: regx.AciertosMatch(fila.primaryDescription.text, /(\d+)(?= solicitud)/),
								fecha_extraccion: tiempo_llamado
							})
						} catch (error) {
							console.error('Error en la asignacion del cant solicitudes', Lista_oferta, id_oferta, error)
						}
						chrome.storage.local.set(oferta)
					})
					break;
				}

				try {
					Lista_oferta[id_oferta].empresa = regx.AciertosMatch(fila.primaryDescription.text, /^([\s\.\wÀ-ÿ]*\b)/)
					Lista_oferta[id_oferta].localizacion_empleo = regx.AciertosMatch(fila.primaryDescription.text, /(\b[\s\w,À-ÿ]*chile)/)
					Lista_oferta[id_oferta].tipo_modalidad = regx.AciertosMatch(fila.primaryDescription.text, /(híbrido|remoto|presencial)/)

					
					Lista_oferta[id_oferta].cantidad_solicitudes = [{
						cantidad_solicitudes: regx.AciertosMatch(fila.primaryDescription.text, /(\d+)(?= solicitud)/),
						fecha_extraccion: tiempo_llamado
					}]


					//Buscar el epoch 
					for (var modulo of fila.primaryDescription.attributesV2) {
						var epoch = modulo.detailData.epoch
						if (epoch) {
							Lista_oferta[id_oferta].fecha_publicacion = epoch.epochAt
							break;
						}
					}

					Lista_oferta[id_oferta].link_empresa = util.getSafe(() => fila.logo.actionTarget, '')
					Lista_oferta[id_oferta].info_empresa = util.getSafe(() => fila.jobInsightsV2ResolutionResults[1].insightViewModel.text.text, '')
					Lista_oferta[id_oferta].tipo_jornada = util.getSafe(() => fila.jobInsightsV2ResolutionResults[0].insightViewModel.text.text, '')
					Lista_oferta[id_oferta].id_compania = reg.exec(fila.logo.attributes[0].detailData["*companyLogo"])[0]
				} catch (error) {
					console.error(error, fila)
				}
				break;
			case 'com.linkedin.voyager.dash.jobs.JobSeekerApplicationDetail':
				id_oferta = reg.exec(fila.entityUrn)[0]
				if (Lista_oferta[id_oferta] == null) {
					break;
				}

				Lista_oferta[id_oferta].link_incripcion = fila.companyApplyUrl

				break;
			case 'com.linkedin.voyager.dash.organization.Company':
				let id_imagen = fila.logoResolutionResult.vectorImage.digitalmediaAsset.match(/urn:li:digitalmediaAsset:(.*)/ui)[1]
				// let obj_imagen = imagenes_almacenar[id_imagen]


				/*
				if(obj_imagen.uri_imagen != ""){
					if(obj_imagen.uri_imagen != ""){
					request.getContent(
						function(content, enconding){
										obj_imagen.uri_imagen = content
										chrome.storage.local.set(obj_imagen.id_compania, obj_imagen)
										})
					}
					break; 
				}
				imagenes_almacenar[regex_result[1]] = {
										id_imagen : regex_result[1],
										uri_imagen : "",
										id_compania : 0
														}

			*/
				break;
			default:
				break;
		}
	}
	return Lista_oferta;
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	
	switch(message.type){
		case "ATTACH_DEBUGGER":
			adjuntar_debugger(sender.tab.id)
			break;
		case "DESCARTAR_OFERTA":
			dao_almacenamiento.descartar_oferta_almacenada(message.id_oferta)
			break;

	}
});

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 	chrome.storage.local.getBytesInUse(function(Bytes){  
// 		mb = (Bytes / (1024*1024)).toFixed(2)
// 		document.getElementById("cantUso").innerText = `${mb} mb`
// 		console.log(Bytes)
// 	})		
// });

chrome.debugger.onDetach.addListener((source, reason) => {
    ventanas_attached.splice(ventanas_attached.indexOf(source.tabId) , 1)
})

chrome.debugger.onEvent.addListener((Debuggee, message, params) => {

    if (message === 'Network.responseReceived') {
        if( params.response.status == 200 && params.response.url.startsWith(urls_sitios.linkedin)){
            request_Almacenar.push(params.requestId)
        }
    }

    if(message == 'Network.loadingFinished' && request_Almacenar.length > 0){
        let encontrado = false
        
        for(var index in request_Almacenar){
            if(request_Almacenar[index] == params.requestId){
                encontrado = true
                request_Almacenar.splice(index, 1) 
                break;
            }
        }
        if(!encontrado){
            return;
        }
        chrome.debugger.sendCommand({tabId: Debuggee.tabId}, "Network.getResponseBody", {requestId: params.requestId}, (body , base64Encoded) => {
			
            Linkedin(body.body, Debuggee.tabId ).then(resp => {
				chrome.storage.local.set(resp)
				
				chrome.scripting.executeScript({
					target : {tabId : Debuggee.tabId} ,
					func :  util_html.AgregarBotonesDescarte})
				})
        });
  
    }


});




//chrome.runtime.onConnect.addListener(function(devToolsConnection) {})
/*

//Main
var imagenes_almacenar = {}
const interceptedIds = new Set();


const imagen_compania = {
	id_imagen : "",
	uri_imagen : "",
	id_compania : 0
}

if(request._resourceType == 'image'){
			let regex_result = request.request.url.match(/https:\/\/media.licdn.com\/dms\/image\/([\w\d]{10,})\/company-logo_/iu)
			if(regex_result){
				let obj_imagen = imagenes_almacenar[regex_result[1]]
				
				if(obj_imagen){
					if(obj_imagen.id_compania != 0){
						request.getContent(
							function(content, enconding){
											obj_imagen.uri_imagen = content
											chrome.storage.local.set(obj_imagen.id_compania, obj_imagen)
											})
						return;
					} 
				}
				imagenes_almacenar[regex_result[1]] = {
										id_imagen : regex_result[1],
										uri_imagen : content,
										id_compania : 0
														}

				
				//si la id de regex[1] esta en la lista, agarrar el objecto e insertarlo en el storage
				// si no, crear el objeto



			}
		}
chrome.devtools.inspectedWindow.getResources(e => 
	e.forEach(i => {
		if(i.type == 'image' && i.url.match(/https:\/\/media.licdn.com\/dms\/image\/[\w\d]{10,}\/company-logo_/iu)){
			i.getContent( (content, encoding) => {
				console.log(content, encoding, i.url)
			})
		    
		}
	}))

chrome.storage.local.get(null, e => {
	Object.entries(e).forEach(i => {
		for(const a of i){
			if(a[1].descartada == false){
				let divEmpleo = document.createElement('div')
				divEmpleo.className += 'oferta-elemento'
				divEmpleo.innerText = JSON.stringify(a[1])
				document.body.append(divEmpleo)
			}    
		}
	    
	})
    
})
  const ctx = document.getElementById('myChart').getContext('2d');
  const data = {
	labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
	datasets: [{
	  label: 'My Data',
	  data: [65, 59, 80, 81, 56, 55, 40],
	  backgroundColor: 'rgba(255, 99, 132, 0.2)',
	  borderColor: 'rgba(255, 99, 132, 1)',
	  borderWidth: 1
	}]
  };
  const options = {};
  const chart = new Chart(ctx, {
	type: 'line',
	data: data,
	options: options
  });

chrome.storage.local.get(e => {
	let empleos = {}
	for (const [key, lista_empleos] of Object.entries(e)) {
		lista_empleos.forEach(empleo => {
		let temp_id = empleo.id_empleo
		if(empleos[temp_id] == null){
			empleos[temp_id] = {
					descripcion_empleo : empleo.descripcion_empleo
				    
				}
		    
		}
	    
	})
    
	}
})
chrome.storage.local.get(e => {
	var empleos = {}
	for (const [key, lista_empleo] of Object.entries(e)) {

		lista_empleo.forEach(empleo => {
	    
		let temp_id = empleo.id_empleo
	    
		let registro_cant_solicitudes = {
				cantidad_solicitudes : empleo.cantidad_solicitudes,
				fecha_extraccion : empleo.fecha_recoleccion_registro
			} 
	    
		if(empleos[temp_id]){
	    
			empleos[temp_id].cantidad_solicitudes.push(registro_cant_solicitudes)
	    
		}else{
			empleos[temp_id] = empleo
		    
			empleos[temp_id].cantidad_solicitudes = [registro_cant_solicitudes]
	    
		}
	    
							 })}
	console.log(empleos)
    
})

chrome.storage.local.get(null, e => {
	var ids_duplicadas = []
	const lista = Object.entries(e)
	for(let i = 1; i < lista.length ; i++){
	    
		let resultado = lista[i-1][0] - lista[i][0]
	    
		if(resultado > -100){
			ids_duplicadas.push(lista[i][0])
		}
		console.log(i, resultado)
	}
	console.log(ids_duplicadas)
   
})
chrome.storage.local.get(null, e => {
	var ids_duplicadas = []
	const lista = Object.entries(e)
	for(let i = 1; i < lista.length ; i++){
	    
		let resultado = lista[i-1][0] - lista[i][0]
	    
		if(resultado > -100){
			ids_duplicadas.push(lista[i][0])
		}
	    
	}
	chrome.storage.local.remove(ids_duplicadas, () => console.log(`cantidad de ofertas duplicadas ${ids_duplicadas.length}`))
	   
})

			





var test = new Set()
var valores = []
chrome.storage.local.get(null,function(e){

for (const [key, value] of Object.entries(e)) {
  for(const subValue of value){
	  if(test.has(subValue.id_empleo)){
		  break;
	  }else{
		  test.add(subValue.id_empleo)
		  valores.push(new Date(subValue.fecha_publicacion).getDay())
	  }

	  
  }
}
console.log(valores)
})

*/
