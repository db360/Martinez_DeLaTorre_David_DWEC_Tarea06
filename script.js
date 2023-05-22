document.addEventListener("DOMContentLoaded", function() {

    $(document).ready(function() {
        let apiKey = 'bed732ac60af5977ac423955cd7a9225';

        function mostrarTiempo() {
            var localidad = $('#localidad').val();

            $.ajax({
                url: 'https://api.openweathermap.org/data/2.5/weather',
                method: 'GET',
                dataType: 'json',
                data: {
                    q: localidad,
                    appid: apiKey,
                    units: 'metric',
                },
                success: function(response) {
                    console.log(response);
                }
            });
        } // Función mostrarTiempo

        function mostrarContaminacion() {

            var localidad = $('#localidad').val();

            $.ajax({
                url: 'https://api.openweathermap.org/data/2.5/weather',
                method: 'GET',
                dataType: 'json',
                data: {
                    q: localidad,
                    appid: apiKey,
                    units: 'metric',
                },
                success: function(response) {

                    // Datos a procesar: 
                    console.log(response);
                }
            });
        } // Función mostrarTiempo

        $('#btnTiempo').click(function(evt) {
            evt.preventDefault();
            mostrarTiempo();
        });

        $('#btnContaminacion').click(function(evt) {
            evt.preventDefault();
            mostrarContaminacion();
        });
    })


});