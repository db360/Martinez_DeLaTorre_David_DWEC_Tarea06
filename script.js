document.addEventListener("DOMContentLoaded", function () {
  $(document).ready(function () {
    let apiKey = "bed732ac60af5977ac423955cd7a9225";

    async function mostrarTiempo() {
      $("#cardsContainer").remove();

      var sunrise;
      var sunset;
      var localidadResponse;
      var latResponse;
      var lonResponse;

      try {
        var localidad = $("#localidad").val();
        // Llamada a la API para comprobar la localidad
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

        // Sunrise y sunset para el dia actual
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
          success: function (response) {
            console.log(response);
            sunrise = new Date(
              response.sys.sunrise * 1000
            ).toLocaleTimeString();
            sunset = new Date(response.sys.sunset * 1000).toLocaleTimeString();
            console.log(sunrise);
            console.log(sunset);
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
        ///console.log(localidadResponse);
        var fechaActual = new Date();
        console.log(fechaActual);
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
            var resultadoDiv = document.getElementById("resultado");
            let diasFiltrados = new Array();

            for (let index = 0; index < response.list.length; index++) {
              var listaPrediccion = response.list[index];
              var dt_txt = listaPrediccion.dt_txt;
              //Filtramos las respuestas con hora 15:00
              if (dt_txt.includes("15:00")) {
                // Borramos el contenido anterior
                diasFiltrados.push(listaPrediccion); // Agregamos el nuevo elemento
              }
            }
            console.log(diasFiltrados);

            // console.log(diasFiltrados)
            // Crear el título
            const tituloDiv = document.createElement("div");
            tituloDiv.classList.add("titulo");
            var contenido = `
                            <h2 class="titulo">Predicción para 5 días en <span class="localidad">${localidadResponse}</span></h2>
                            <h3 class="sol">El sol sale hoy a las <span class="sunrise">${sunrise}</span> y se pondrá a las <span class="sunset">${sunset}</span></h3>
            `;

            resultadoDiv.innerHTML = contenido;

            const cardsContainer = document.createElement("div");
            cardsContainer.classList.add("cardsContainer");

            for (const dia of diasFiltrados) {
              var fecha = new Date(dia.dt * 1000);
              var diaSemana = fecha.toLocaleDateString("es-ES", {
                weekday: "long",
              });
              var hora = fecha.toLocaleTimeString("es-ES", {
                hour: "numeric",
                minute: "numeric",
              });

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

                // Calcular el índice correspondiente al array de puntos
                var indice = Math.floor(grados / 22.5 + 0.5) % 8;

                // Obtener el punto de la brújula correspondiente
                var direccion = puntos[indice];

                return direccion;
              }

              var temperatura = dia.main.temp;
              var humedad = dia.main.humidity;
              var viento = dia.wind.speed;
              var vientoDeg = obtenerDireccionViento(dia.wind.deg);
              var descTiempo = dia.weather[0].description;
              var icono = dia.weather[0].icon;
              var visibilidad = dia.visibility;
              var lluvia;

              console.log(vientoDeg);

              if (dia.rain) {
                lluvia = "Va a llover";
              } else {
                lluvia = "No va a llover";
              }

              var card = document.createElement("div");
              card.classList.add("card");

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
              card.innerHTML = contenido;

              cardsContainer.appendChild(card);
            }

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
      var localidadResponse;
      var latResponse;
      var lonResponse;
      try {
        var localidad = $("#localidad").val();

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

        $("#cardsContainer").remove;

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
            var resultadoDiv = document.getElementById("resultado");



            console.log(response);
            var dt = new Date (response.list[0].dt * 1000);
            var diaSemana = dt.toLocaleDateString("es-ES", {
                weekday: "long",
            });
            var dia = dt.toLocaleDateString("es-ES", {
                day: "2-digit",
            })

            var co = response.list[0].components.co;
            var nh3 = response.list[0].components.nh3;
            var no = response.list[0].components.no;
            var no2 = response.list[0].components.no2;
            var o3 = response.list[0].components.o3;
            var pm10 = response.list[0].components.pm10;
            var pm2_5 = response.list[0].components.pm2_5;
            var so2 = response.list[0].components.so2;

            const cardsContainer = document.createElement("div");
            cardsContainer.classList.add("cardsContainer");

            var card = document.createElement("div");
            card.classList.add("card");

            var contenido = `
                            <h3 class="contLocalidad">${localidad}</h3>
                           <div class="contaminacionTitle"> Contaminación para el ${diaSemana}  ${dia}</div>
                           <div class="contContainer">
                            <div class="co">CO2: ${co}</div>
                            <div class="nh3">NH3: ${nh3}</div>
                            <div class="no">CO2: ${no}</div>
                            <div class="no2">NO2: ${no2}</div>
                            <div class="o3">O3: ${o3}</div>
                            <div class="pm10">PM10: ${pm10}</div>
                            <div class="pm2_5">PM 2.5: ${pm2_5}</div>
                            <div class="nso2o">SO2: ${so2}</div>
                           </div>

                         `;
            card.innerHTML = contenido;

            resultadoDiv.innerHTML = contenido;

            cardsContainer.appendChild(card);
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
