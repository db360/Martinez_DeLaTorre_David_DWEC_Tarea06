document.addEventListener("DOMContentLoaded", function () {
  $(document).ready(function () {
    let apiKey = "bed732ac60af5977ac423955cd7a9225";
    var localidadResponse;

    async function mostrarTiempo() {
      var localidad = $("#localidad").val();
      var latResponse;
      var lonResponse;
      var sunrise;
      var sunset;

      try {
        $("#resultado").empty();
        // Primera llamada a la API para comprobar la localidad

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
        });

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
            console.log(response)
            sunrise = new Date(response.sys.sunrise);
            sunset = new Date(response.sys.sunset);
            console.log(sunrise);
            console.log(sunset);

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
                            <h2 class="titulo">Predicción para 5 días en <span>" ${localidadResponse} "</span></h2>
                            <h3 class="sol">El sol sale hoy a las ${sunrise} y se pondrá a las ${sunset}</h3>
            `;

            resultadoDiv.innerHTML= contenido;

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

              var temperatura = dia.main.temp;
              var viento = dia.wind.speed;
              var descTiempo = dia.weather[0].description;
              var icono = dia.weather[0].icon;
              var lluvia;
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
                          <div class="cardWind">Viento: ${viento} m/s</div>
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
    function mostrarContaminacion() {
      $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        dataType: "json",
        data: {
          q: localidadResponse,
          appid: apiKey,
          units: "metric",
        },
        // Si se ha recibido una respuesta correctamente
        success: function (response) {
          console.log(response);
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
