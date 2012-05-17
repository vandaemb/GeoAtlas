    <!-- GEOATLAS Limburg 
         Gemaakt in opdracht van Wegen en Verkeer Limburg
         Gebaseerd op Opengeo GeoExplorer (https://github.com/opengeo/GeoExplorer)
         marc.vandael@mow.vlaanderen.be
    -->
    <link rel="stylesheet" type="text/css" href="../theme/app/geoexplorer.css" />
    <!--[if IE]><link rel="stylesheet" type="text/css" href="../theme/app/ie.css"/><![endif]-->        
    <link rel="stylesheet" type="text/css" href="../theme/ux/colorpicker/color-picker.ux.css" />
    <script type="text/javascript" src="../script/GeoExplorer.js"></script>
    <link rel="stylesheet" type="text/css" href="../externals/PrintPreview/resources/css/printpreview.css">

    
    
    <script>
        // optionally set locale based on query string parameter

        Ext.BLANK_IMAGE_URL = "../theme/app/img/blank.gif";
        OpenLayers.ImgPath = "../theme/app/img/";

        var app = new GeoExplorer.Composer({
            authStatus: {{status}},
            proxy: "../proxy/?url=",
            printService: "/geoserver/pdf/",
            apiKeys: {
                "localhost": "ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw",
                "localhost:8080": "ABQIAAAAeDjUod8ItM9dBg5_lz0esxTnme5EwnLVtEDGnh-lFVzRJhbdQhQBX5VH8Rb3adNACjSR5kaCLQuBmw",
                "gis.wegenenverkeer.be": "AIzaSyC0dy0fh5gqiW4Og2k9xi60EZnMQWNfhlo",
                "gis.wegenenverkeer.be:8080": "AIzaSyC0dy0fh5gqiW4Og2k9xi60EZnMQWNfhlo"
            },
            about: {
                title: "Basiskaart GeoAtlas v1.0",
                "abstract": "De GeoAtlas basiskaart met enkele aangevinkte lagen. Voor nog meer lagen, klik op de groene plus boven de lagencatalogus.",
                contact: "Voor meer info en vragen, contacteer <a href='mailto:marc.vandael@mow.vlaanderen.be'>Marc Vandael, gis cel Limburg</a>."
            },
            defaultSourceType: "gxp_wmscsource",
            sources: {
                local: {
                    url: "http://gis.wegenenverkeer.be:8080/geoserver/ows",
                    title: "GEOATLAS LIMBURG",
                    ptype: "gxp_wmscsource"
                },
                bing: {
                    ptype: "gxp_bingsource"
                },
                ol: {
                    ptype: "gxp_olsource"
                },
                google: {
                    ptype: "gxp_googlesource",
                    title: "GOOGLE"
                },
                mapquest: {
                    ptype: "gxp_mapquestsource"
                }
            },
            map: { 
                projection: "EPSG:102113",
                
                
                //maxExtent: [524569.78866095, 6549710.1079428, 680654.20039755, 6681946.1668578],
                restrictedExtent: [524569.78866095, 6549710.1079428, 680654.20039755, 6681946.1668578],
                
                layers: [
                
                //Onderlagen
                    {
                        source:"ol",
                        name:"empty",
                        group:"background",
                        type:"OpenLayers.Layer",
                        args:["Geen onderlaag"]
                    },
                    {
                        source: "local",
                        name: "limburg:RAS_TOPOGRAFIE",
                        group: "background"
                    },
                    {
                        source: "local",
                        name: "limburg:RAS_GEWESTPLAN",
                        group: "background"
                    },              
                    {
                        source: "bing",
                        name: "Aerial",
                        group: "background"
                    },
                    {
                        source: "local",
                        name: "limburg:GRB_BASISKAART",
                        group: "background"
                    },  
                    {
                        source: "google",
                        name: "SATELLITE",
                        group: "background"
                    },

                
                //WEGEN & TRANSPORT
                    {
                        source: "local",
                        name: "limburg:WEG_gewestwegen",

                        visibility: true
                    },
                    {
                        source: "local",
                        name: "limburg:WEG_gemeentewegen",

                        visibility: false
                    },

                //REFERENTIEPUNTEN
                    {
                        source: "local",
                        name: "limburg:POI_ROTONDE",
                        group:"POI",
                    },
                    {
                        source: "local",
                        name: "REFERENTIEPALEN",
                        group:"POI",
                    },
                    {
                        source: "local",
                        name: "limburg:POI_KUNSTWERKEN",
                        group:"POI",
                    },
                
                
                //ONGEVALGEGEVENS
                    {
                        source: "local",
                        name: "limburg:ONG_ONGEVALLOCATIES0608",
                        group:"ongeval",
                        visibility: false
                    },    
                    {
                        source: "local",
                        name: "limburg:ONG_FIETS_ONGEVALLOCATIES0608",
                        group:"ongeval",
                        visibility: false
                    },   
                    {
                        source: "local",
                        name: "limburg:ONG_GEVAARLIJKEPUNTEN0608",
                        group:"ongeval",
                        visibility: false
                    }
                ],
                center: [607043.84979312, 6618170.9297806],
                zoom: 10
            }
        });
        

    </script>
