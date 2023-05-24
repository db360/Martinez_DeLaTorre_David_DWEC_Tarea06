document.addEventListener("DOMContentLoaded", function () {
  $(document).ready(function () {
    let apiKey = "bed732ac60af5977ac423955cd7a9225";

    // Funcion Para mostrar la predicción del tiempo.
    async function mostrarTiempo() {
      // Si había algun resultado, lo borramos
      $("#cardsContainer").remove();
      // Inicializamos todas las variables auxiliares
      var sunrise;
      var sunset;
      var localidadResponse;
      var latResponse;
      var lonResponse;

      // Abrimos un try/catch
      try {
        // Localidad, el valor del input
        var localidad = $("#localidad").val();
        //Si no hay ningún caracter escrito, mostramos el error, si hay más de 0, seguimos con la llamada
        if(localidad.length > 0) {
          // Llamada a la API para comprobar la localidad
          await $.ajax({
            url: `http://api.openweathermap.org/geo/1.0/direct?q=${localidad}&limit=5&appid=${apiKey}`,
            method: "GET",
            dataType: "json",
            success: function (response) {
              // Obtenemos el nombre, la latitud y longitud de la localidad.
              localidadResponse = response[0].name;
              latResponse = response[0].lat;
              lonResponse = response[0].lon;

            },
            // Si la petición falla
            error: function (xhr, estado, error_localidad) {
              console.log("Error producido: " + error_localidad);
              console.log("Estado: " + estado);
            },
            //Tanto si falla como si funciona como sino funciona.
            complete: function (xhr, estado) {
              console.log("Petición Localidad Completa, estado: " + estado + xhr);
            },
          }); // FIN buscar Localidad
        } else {
          // Error cuando el campo está vacío no llamar a la API
          var resultadoDiv = document.getElementById("resultado");
          const tituloDiv = document.createElement("div");
          tituloDiv.classList.add("titulo");
          var contenido = `
                          <h3 class="error red">Debe introducir al menos 1 carácter</h3>
          `;

          resultadoDiv.innerHTML = contenido;
        }

        // Sunrise y sunset para el dia actual de la api Weather
        await $.ajax({
          url: "https://api.openweathermap.org/data/2.5/weather",
          method: "GET",
          dataType: "json",
          data: {
            lat: latResponse,
            lon: lonResponse,
            appid: apiKey,
            units: "metric",
            lang: "ES",
          },
          /* Si la llamada es correcta, obtenemos salida y puesta de sol y lo pasamos a LocalTimeString, le multiplicamos x 1000 para convertir un valor UNIX a milisegundos y lo guardamos en un objeto Date */
          success: function (response) {
            // console.log(response);
            sunrise = new Date(response.sys.sunrise * 1000).toLocaleTimeString();
            sunset = new Date(response.sys.sunset * 1000).toLocaleTimeString();

          },
          // Si hay un error en la petición
          error: function (xhr, estado, error_prevision) {
            console.log("Error producido: " + error_prevision + xhr);
            console.log(estado);
          },
          //Tanto si falla como si funciona como sino funciona.
          complete: function (xhr, estado) {
            console.log("Petición predicción completa, estado: " + estado);
          },
        });

        // Segunda llamada a la API con la localidad de la primera llamada
        await $.ajax({
          url: `https://api.openweathermap.org/data/2.5/forecast`,
          method: "GET",
          dataType: "json",
          data: {
            lat: latResponse,
            lon: lonResponse,
            appid: apiKey,
            units: "metric",
            lang: "ES",
          },
          // Si se ha recibido una respuesta correctamente
          success: function (response) {
            // abrimos una variable para el resultado y seleccionamos el elemento
            var resultadoDiv = document.getElementById("resultado");
            //Variable para el array con los dias filtrados
            let diasFiltrados = new Array();
            // Recorremos la lista, y guardamos el valor de la fecha y hora en la variable dt_txt
            for (let index = 0; index < response.list.length; index++) {
              var listaPrediccion = response.list[index];
              var dt_txt = listaPrediccion.dt_txt;
              //si se incluye en la variable la hora 15:00, Filtramos las respuestas con hora 15:00, que son las 17:00 GMT
              if (dt_txt.includes("15:00")) {
                // Hacemos un push de los resultados al array de los dias filtrados
                diasFiltrados.push(listaPrediccion);
              }
            }

            // Crear el título
            const tituloDiv = document.createElement("div");
            /// Añadimos su clase
            tituloDiv.classList.add("titulo");
            // Variable para el contenido
            var contenido = `
                            <h2 class="titulo">Predicción para 5 días en <span class="localidad">${localidadResponse}</span></h2>
                            <h3 class="sol">El sol sale hoy a las <span class="sunrise">${sunrise}</span> y se pondrá a las <span class="sunset">${sunset}</span></h3>
            `;
            // Agregamos el contenido al div
            resultadoDiv.innerHTML = contenido;
            // Creamos un div para el contenedor de las cards
            const cardsContainer = document.createElement("div");
            //Le añadimos el nombre de clase
            cardsContainer.classList.add("cardsContainer");
            // Para obtener las fechas, iteramos sobre los dias filtrados y guardamos la fecha, el dia de la semana y la hora usando toLocaleTimeString para pasarla a nuestra zona horaria
            for (const dia of diasFiltrados) {
              var fecha = new Date(dia.dt * 1000);
              var diaSemana = fecha.toLocaleDateString("es-ES", {
                weekday: "long",
              });
              var hora = fecha.toLocaleTimeString("es-ES", {
                hour: "numeric",
                minute: "numeric",
              });
              // Funcion para convertir la variable deg(direccion del viento en grados) a puntos cardinales.
              function obtenerDireccionViento(grados) {
                // Array con los puntos de la brújula
                var puntos = [
                  "Norte",
                  "Noroeste",
                  "Este",
                  "Sureste",
                  "Sur",
                  "Suroeste",
                  "Oeste",
                  "Noroeste",
                ];

                // Calculamos el índice correspondiente al array de puntos
                // 22.5 representa un punto intermedio en la brujula
                // se redondea con 0.5
                // se aplica el modulo para obtener el residuo de la operacion de division entre 8,
                // el rango siempre estará dentro de los 8 opciones.
                var indice = Math.floor(grados / 22.5 + 0.5) % 8;

                // Obtener el punto de la brújula correspondiente
                var direccion = puntos[indice];

                return direccion;
              }

              // Variables que queremos mostrar que provienen de la llamada de la api
              var temperatura = dia.main.temp;
              var humedad = dia.main.humidity;
              var viento = dia.wind.speed;
              var vientoDeg = obtenerDireccionViento(dia.wind.deg);
              var descTiempo = dia.weather[0].description;
              var icono = dia.weather[0].icon;
              var visibilidad = dia.visibility;
              var lluvia;

              // Condicional para Si va a llover o no sacada del campo rain, si existe llueve, si no existe,no
              if (dia.rain) {
                lluvia = "Va a llover";
              } else {
                lluvia = "No va a llover";
              }
              // Elemento div para el card con los datos
              var card = document.createElement("div");
              // Añadimos la clase card al divv
              card.classList.add("card");
              // Creamos el output a mostra en el div
              var contenido = `
                          <div class="cardTitle">${diaSemana} ${hora}</div>
                          <img src="http://openweathermap.org/img/wn/${icono}.png" alt="Icono del tiempo">
                          <div class="lluvia">${lluvia}</div>
                          <div class="cardWeather">${descTiempo}</div>
                          <div class="cardTemp">${temperatura}°C</div>
                          <div class="humedad">Humedad:${humedad}%</div>
                          <div class="cardWind">Viento: ${viento} m/s</div>
                          <div class="cardWind">Direccion: ${vientoDeg}</div>
                          <div class="visibilidad">Visibilidad: ${visibilidad} m</div>
                        `;
              // Lo añadimos al card
              card.innerHTML = contenido;
              // Y éste a su vez al container con todas las cards.
              cardsContainer.appendChild(card);
            }
            // Y añadimos finalmente el container al div de mostrar los resultados.
            resultadoDiv.appendChild(cardsContainer);
          },
          // Si hay un error en la petición
          error: function (xhr, estado, error_prevision) {
            console.log("Error producido: " + error_prevision + xhr);
            console.log("Estado: " + estado);
          },
          //Tanto si falla como si funciona como sino funciona.
          complete: function (xhr, estado) {
            console.log("Petición predicción completa, estado: " + estado);
          },
        });
      } catch (error) {
        console.log("Error producido: " + error);
      }
    } // FIN Funcion mostrar tiempo

    /* Funcion para mostrar la contaminación*/
    async function mostrarContaminacion() {
      // Iniciamos variables con la localidad, latitud y longitud.
      var localidadResponse;
      var latResponse;
      var lonResponse;
      try {
        // Variable con lo obtenido en el input de localidad
        var localidad = $("#localidad").val();
        // Si hay carácteres escritos en el input, seguimos con la llamada, si no, mostramos un error
        if(localidad.length > 0) {
          // Llamada para la localidad.
          await $.ajax({
            url: `http://api.openweathermap.org/geo/1.0/direct?q=${localidad}&limit=5&appid=${apiKey}`,
            method: "GET",
            dataType: "json",
            success: function (response) {
              localidadResponse = response[0].name;
              latResponse = response[0].lat;
              lonResponse = response[0].lon;
              // console.log(latResponse);
              // console.log(lonResponse);
            },
            // Si la petición falla
            error: function (xhr, estado, error_localidad) {
              console.log("Error producido: " + error_localidad);
              console.log("Estado: " + estado);
            },
            //Tanto si falla como si funciona como sino funciona.
            complete: function (xhr, estado) {
              console.log("Petición Localidad Completa, estado: " + estado + xhr);
            },
          }); // FIN buscar Localidad
         } else {
          // Si hay error, como en la anterior función, mostramos el error del campo vacío
          var resultadoDiv = document.getElementById("resultado");
          const tituloDiv = document.createElement("div");
          tituloDiv.classList.add("titulo");
          var contenido = `
                          <h3 class="error red">Debe introducir al menos 1 carácter</h3>
          `;

          resultadoDiv.innerHTML = contenido;
        }

        // Borramos el contenido si hubiera un contenedor con cards.
        $("#cardsContainer").remove;
        // Llamada la API para obtener los datos de la polución
        $.ajax({
          url: "https://api.openweathermap.org/data/2.5/air_pollution",
          method: "GET",
          dataType: "json",
          data: {
            lat: latResponse,
            lon: lonResponse,
            appid: apiKey,
            units: "metric",
          },
          // Si se ha recibido una respuesta correctamente
          success: function (response) {
            // Seleccionamos el div del resultado y lo añadimos a su variable
            var resultadoDiv = document.getElementById("resultado");
            // Obtenemos la fecha y lo pasamos a milisegundos para crear un objeto tipo DATE
            var dt = new Date (response.list[0].dt * 1000);
            // Obtenemos el dia de la semana en carácteres
            var diaSemana = dt.toLocaleDateString("es-ES", {
                weekday: "long",
            });
            // Obtenemos el dia en dígitos
            var dia = dt.toLocaleDateString("es-ES", {
                day: "2-digit",
            })
            // Variables con los diferentes contaminantes que nos vienen  de la llamada a la api
            var co = response.list[0].components.co;
            var nh3 = response.list[0].components.nh3;
            var no = response.list[0].components.no;
            var no2 = response.list[0].components.no2;
            var o3 = response.list[0].components.o3;
            var pm10 = response.list[0].components.pm10;
            var pm2_5 = response.list[0].components.pm2_5;
            var so2 = response.list[0].components.so2;

            // Creamos el contenedor div  con clase cardsContainer
            const cardsContainer = document.createElement("div");
            cardsContainer.classList.add("cardsContainer");
            // Creamos el contenedor para el card
            var card = document.createElement("div");
            card.classList.add("card");

            /* Cogemos todas las variables que hemos obtenido y las mostramos en el div, para valores bajos y altos,
            he coloreado en verde cuando el valor está por debajo de los valores medios, y en rojo cuando están por encima (podría haber profundizado un poco más en los valores, pero todavia tengo otras actividades y los e
              examenes están muy cerca y estoy un poco agobiado...*/
            var contenido = `
                            <h3 class="contLocalidad">${localidad}</h3>
                           <div class="contaminacionTitle"> Calidad del aire para el ${diaSemana}  ${dia}</div>
                           <div class="contContainer">
                            <div class="co ${co < 9400 ? "green" : "red"}">CO2: ${co} μg/m3</div>
                            <div class="nh3 ${nh3 < 80 ? "green" : "red"}">NH3: ${nh3} μg/m3</div>
                            <div class="no ${no < 100 ? "green" : "red"}">CO2: ${no} μg/m3</div>
                            <div class="no2 ${no2 < 70 ? "green" : "red"}">NO2: ${no2} μg/m3</div>
                            <div class="o3 ${o3 < 100 ? "green" : "red"}">O3: ${o3} μg/m3</div>
                            <div class="pm10 ${pm10 < 25 ? "green" : "red"}">PM10: ${pm10} μg/m3</div>
                            <div class="pm2_5 ${pm2_5 < 25 ? "green" : "red"}">PM 2.5: ${pm2_5} μg/m3</div>
                            <div class="nso2o ${so2 < 80 ? "green" : "red"}">SO2: ${so2} μg/m3</div>
                           </div>

                         `;

            // Añadimos el card al container
            cardsContainer.appendChild(card);
            // y éste al div del resultado
            resultadoDiv.innerHTML = contenido;
          },
          error: function (xhr, estado, error_contaminacion) {
            console.log("Error producido: " + error_producido);
            console.log("Estado: " + estado);
          },
          //Tanto si falla como si funciona como sino funciona.
          complete: function (xhr, estado) {
            console.log("Petición completa, estado: " + estado);
          },
        });
      } catch (error) {
        console.log("Hubo un error: " + error);
      }
    } //FIN Función mostrarContaminacion

    /* Listeners para los clicks de los botones*/
    $("#btnTiempo").click(function (evt) {
      evt.preventDefault();
      mostrarTiempo();
    });

    $("#btnContaminacion").click(function (evt) {
      evt.preventDefault();
      mostrarContaminacion();
    });
  });
});
