am5.ready(function() {

    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
            var root = am5.Root.new("chartdiv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
            root.setThemes([
                am5themes_Animated.new(root)
            ]);

    // Create the map chart
    // https://www.amcharts.com/docs/v5/charts/map-chart/
            var chart = root.container.children.push(am5map.MapChart.new(root, {
                panX: "rotateX",
                projection: am5map.geoMercator(),
                layout: root.horizontalLayout
            }));

            /*am5.net.load("https://www.amcharts.com/tools/country/?v=xz6Z", chart).then(function (result) {
                var geo = am5.JSONParser.parse(result.response);
                loadGeodata(geo.country_code);
            });*/
            var geos = "HN";
            loadGeodata(geos);

    // Create polygon series for continents
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
            var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
                calculateAggregates: true,
                valueField: "value"
            }));

            polygonSeries.mapPolygons.template.setAll({
                tooltipText: "{name}",
                interactive: true
            });

            polygonSeries.mapPolygons.template.states.create("hover", {
                fill: am5.color(0x3D868E),
                fillOpacity: 0.5
            });

            polygonSeries.set("heatRules", [{
                target: polygonSeries.mapPolygons.template,
                dataField: "value",
                min: am5.color(vihoAdminConfig.primary),
                max: am5.color(0x3D868E),
                key: "fill"
            }]);

            polygonSeries.mapPolygons.template.events.on("pointerover", function(ev) {
                heatLegend.showValue(ev.target.dataItem.get("value"));
            });
            polygonSeries.mapPolygons.template.events.on("click", function (ev) {
                // Clicked on a continent
                // ev.dataItem will container clicked polygon's data item
                var ids = ev.target.dataItem.get("id");
                /*$.get("{{ url('ajax/states') }}/"+ids, function( data ) {

                });*/
                /*$.ajax({
                    type: "GET",
                    url: "{{ url('ajax/states') }}/"+ids,
                    beforeSend: function() {
                        $(".resultgeo").html('<div class="loader-wrapper" style="opacity: 0.07096754713817766;"><div class="loader-index"><span></span></div> <svg> <defs></defs> <filter id="goo"> <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur"></feGaussianBlur> <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"> </feColorMatrix> </filter> </svg> </div>');
                    },
                    success: function(data) {
                        $(".resultgeo").html(data);
                        $('#export-button').DataTable( {
                            dom: 'Bfrtip',
                            buttons: [
                                'copyHtml5',
                                'excelHtml5',
                                'csvHtml5',
                                'pdfHtml5',
                                {
                                    text: 'JSON',
                                    action: function ( e, dt, button, config ) {
                                        var data = dt.buttons.exportData();

                                        $.fn.dataTable.fileSave(
                                            new Blob( [ JSON.stringify( data ) ] ),
                                            'Export.json'
                                        );
                                    }
                                }
                            ]
                        } );
                        $('html, body').animate({
                            scrollTop: $("#export-button").offset().top
                        }, 1000);
                    }
                });*/
                //console.log(ev.target.dataItem.get("name"));
            });

            function loadGeodata(country) {

                // Default map
                var defaultMap = "usaLow";

                if (country == "US") {
                    chart.set("projection", am5map.geoAlbersUsa());
                }
                else {
                    chart.set("projection", am5map.geoMercator());
                }

                // calculate which map to be used
                var currentMap = defaultMap;
                var title = "";
                if (am5geodata_data_countries2[country] !== undefined) {
                    currentMap = am5geodata_data_countries2[country]["maps"][0];

                    // add country title
                    if (am5geodata_data_countries2[country]["country"]) {
                        title = am5geodata_data_countries2[country]["country"];
                    }
                }

                am5.net.load("../assets/ajax/"+currentMap+".json", chart).then(function (result) {
                    var geodata = am5.JSONParser.parse(result.response);
                    //alert(result.response);
                    var data = [];
                    //alert(geodata.features);
                    /*for(var i = 0; i < geodata.features.length; i++) {
                        //alert(geodata.features[i].properties.name);
                        data.push({
                            id: geodata.features[i].id,
                            value: Math.round( Math.random() * 10000 )
                        });
                    }*/

                    /*data.push({
                        id: "HN-FM",
                        value: 0
                    });
                    data.push({
                        id: "HN-CR",
                        value: 0
                    });*/

                    polygonSeries.set("geoJSON", geodata);
                    polygonSeries.data.setAll(data)
                });

                chart.seriesContainer.children.push(am5.Label.new(root, {
                    x: 5,
                    y: 5,
                    text: title,
                    background: am5.RoundedRectangle.new(root, {
                        fill: am5.color(0x357EBD),
                        fillOpacity: 0.4
                    })
                }))

            }

            var heatLegend = chart.children.push(
                am5.HeatLegend.new(root, {
                    orientation: "vertical",
                    startColor: am5.color(vihoAdminConfig.primary),
                    endColor: am5.color(0x3D868E),
                    startText: "Cantidad baja de tramites",
                    endText: "Cantidad alta de tramites",
                    stepCount: 5
                })
            );

            heatLegend.startLabel.setAll({
                fontSize: 12,
                fill: heatLegend.get("startColor")
            });

            heatLegend.endLabel.setAll({
                fontSize: 12,
                fill: heatLegend.get("endColor")
            });

    // change this to template when possible
            polygonSeries.events.on("datavalidated", function () {
                heatLegend.set("startValue", polygonSeries.getPrivate("valueLow"));
                heatLegend.set("endValue", polygonSeries.getPrivate("valueHigh"));
            });

        }); // end am5.ready()
