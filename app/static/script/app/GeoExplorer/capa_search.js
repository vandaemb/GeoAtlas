/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/** api: (define)
* module = gxp.plugins
* class = GeocoderMetPointer
*/

/** api: (extends)
* plugins/Tool.js
*/
Ext.namespace("gxp.plugins");

/** api: constructor
* .. class:: GeocoderMetPointer(config)
*
* Plugin for removing a selected layer from the map.
* TODO Make this plural - selected layers
*/
gxp.plugins.GeocoderMetPointer2 = Ext.extend(gxp.plugins.Tool, {
    
/** api: ptype = gxp_geocodermetpointer2 */
    ptype: "gxp_geocodermetpointer2",
    
/** api: config[addActionMenuText]
* ``String``
* Text for add menu item (i18n).
*/
    addActionMenuText: "Zoek op ident8",

/** api: config[addActionTip]
* ``String``
* Text for add action tooltip (i18n).
*/
    addActionTip: "Inzoomen naar een ident8 met referentiepunt",

/** api: config[addLayerSourceErrorText]
* ``String``
* Text for an error message when WMS GetCapabilities retrieval fails (i18n).
*/
    addLayerSourceErrorText: "Error getting WMS capabilities ({msg}).\nPlease check the url and try again.",

/** api: config[availableLayersText]
* ``String``
* Text for the available layers (i18n).
*/
    availableLayersText: "Zoeken op ident8 met referentiepunt",

/** api: config[availableLayersText]
* ``String``
* Text for the grid expander (i18n).
*/
    expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>",
    
/** api: config[availableLayersText]
* ``String``
* Text for the layer title (i18n).
*/
    panelTitleText: "Title",
    
/** api: config[instructionsText]
* ``String``
* Text for additional instructions at the bottom of the grid (i18n).
* None by default.
*/
    
/** api: config[doneText]
* ``String``
* Text for Done button (i18n).
*/
    doneText: "Done",

/** api: config[upload]
* ``Object | Boolean``
* If provided, a :class:`gxp.LayerUploadPanel` will be made accessible
* from a button on the Available Layers dialog. This panel will be
* constructed using the provided config. By default, no upload
* functionality is provided.
*/
    
/** api: config[uploadText]
* ``String``
* Text for upload button (only renders if ``upload`` is provided).
*/
    menuText: "Zoek perceel",
    
    outputConfig: {
		url: "http://gis.wegenenverkeer.be:8080/geoserver/wfs",
		//url: "http://geo.zaanstad.nl/geoserver/wfs",
		featureType: "GRO_KADASTER",
		featurePrefix: "urilimburg",
		srsName: "EPSG:102113",
		fieldName: "capakey",
		geometryName: "the_geom",
		emptyText: "Bijvoorbeeld: 72502D020001/00Y000",
		listEmptyText: "- niets gevonden -",
		customSortInfo: {
			matcher: "^[a-zA-Z]\\s+(\\d*)+.*$",
			//matcher: "^(\\d+)\\s+(.*)$",
			parts: [
				{order: 0, sortType: "asUCString"},
				{order: 1, sortType: "asInt"}
			]
		}
	},

	zoom: 18,
    
/** api: method[addActions]
*/
	 /** private: method[constructor]
	*/
    constructor: function(config) {
        gxp.plugins.GeocoderMetPointer2.superclass.constructor.apply(this, arguments);
    },

    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.GeocoderMetPointer2.superclass.addActions.apply(this, [{
            tooltip : this.addActionTip,
            menuText: this.addActionMenuText,
            text: this.menuText,
            iconCls: "gxp-icon-find",
            cls: 'adres-button',
            handler : this.showCapabilitiesGrid,
            scope: this
        }]);
        
        this.target.on("ready", function() {
            actions[0].enable();
        });
        return actions;
    },

    /** api: method[addOutput]
     */
    addOutput: function(config) {
        return gxp.plugins.GeocoderMetPointer2.superclass.addOutput.call(this, this.combo);
    },
    
    /** private: method[onComboSelect]
     *  Listener for combo's select event.
     */
    onComboSelect: function(combo, record) {
        var map = this.target.mapPanel.map;
		var location = record.get("feature").geometry.getBounds().getCenterLonLat();

		
		map.setCenter(new OpenLayers.LonLat(location.lon, location.lat),18);
		
		//var feature = new OpenLayers.Geometry.Point(location.lon, location.lat);
		   var feature = new OpenLayers.Feature.Vector();
            feature.fid = 1;
            feature.geometry = new OpenLayers.Geometry.Point(location.lon, location.lat);

            symboollayer1.removeAllFeatures();
            symboollayer1.addFeatures([feature]);
            symboollayer1.redraw();
            
            

       
    },
    
    
/** api: method[showCapabilitiesGrid]
* Shows the window with a capabilities grid.
*/
    showCapabilitiesGrid: function() {        
        this.initCapGrid();
        Tool_button = this.target.toolbar.items.items[15];
        Tool_button.disable();
    },

    /**
* private: method[initCapGrid]
* Constructs a window with a capabilities grid.
*/
    initCapGrid: function() {
        //this.baseUrl =  window.location.host;
        this.baseUrl = "";

        function trim(s)
        {
            return rtrim(ltrim(s));
        };

        function ltrim(s)
        {
            var l=0;
            while(l < s.length && s[l] == ' ')
            {
                l++;
            };
            return s.substring(l, s.length);
        };

        function rtrim(s)
        {
            var r=s.length -1;
            while(r > 0 && s[r] == ' ')
            {
                r-=1;
            };
            return s.substring(0, r+1);
        };		
        
        function getElementsByTag(doc, url, tag) {
            var urlArray = url.split( "/" );
            var ns = urlArray[urlArray.length-1];
            var value = doc.getElementsByTagName(ns + ":" +  tag);
            if(!value || value == null || value.length == 0){
                value = doc.getElementsByTagNameNS(url,  tag);
            };
            return value;
        };

        var style =new OpenLayers.StyleMap({
			// Set the external graphic and background graphic images.
			externalGraphic: "../theme/app/img/flag.png",
			backgroundGraphic: "../theme/app/img/marker-shadow.png",

			// Makes sure the background graphic is placed correctly relative
			// to the external graphic.
			backgroundXOffset:  0,
			backgroundYOffset: -24,

			//graphicXOffset: -0.5,
			graphicYOffset: -27,

			// Set the z-indexes of both graphics to make sure the background
			// graphics stay in the background (shadows on top of markers looks
			// odd; let's not do that).
			//graphicZIndex: 10,
			//backgroundGraphicZIndex: 11,
            pointRadius: 15
        });
        var capalayer = new OpenLayers.Layer.WMS("Adres",
                                   "http://gis.wegenenverkeer.be:8080/geoserver/wms",
                                   {layers: "GRO_KADASTER_11", transparent:true}, {displayInLayerSwitcher: false});
    

        symboollayer1 = new OpenLayers.Layer.Vector("Adres", {styleMap: style, displayInLayerSwitcher: false});	
        //symboollayer1.opacity = 0.5;	
        kaart = this.target.mapPanel;
        kaart.map.addLayers([capalayer]);

        var kaart1 = this.target.mapPanel;
        kaart.map.addLayers([symboollayer1]);
		var kaartposition = kaart.getPosition();
		var kaartsize = kaart.getSize();


		var combo = new gxp.form.AutoCompleteComboBox(Ext.apply({
        	width: 250,
        	selectOnFocus: true,
            listeners: {
                select: this.onComboSelect,
                scope: this
            }
        }, this.outputConfig));
        
        //var bounds = target.mapPanel.map.restrictedExtent;
        
        var bounds = this.target.mapPanel.map.maxExtent;
        if (bounds && !combo.bounds) {
            this.target.on({
                ready: function() {
                    combo.bounds = bounds.clone().transform(
                        this.target.mapPanel.map.getProjectionObject(),
                        new OpenLayers.Projection("EPSG:4326"));
                }
            })
        };

        this.combo = combo;

		var items = [combo];

        this.capGrid = new Ext.Window({
            title: "Zoeken op CAPAKEY",
            //fieldDefaults: {labelAlign: 'top'},
            bodyStyle:'padding:5px 5px 0',
            closeAction: "close",
            layout: "fit",
            height: 80,
            width: 370,
            x: kaartposition[0] + kaartsize.width - 370,
            y: kaartposition[1],
            //maxWidth: 600,
            //maxHeight: 150,
            //modal: true,
            resizable: false, 
            items: items,
            listeners: {
                destroy: function(win) {
                    Tool_button.enable();
                    var aantal = kaart.map.layers.length;
                    for(var p = 0; p < aantal; p++) {
                        if (kaart.map.layers[p].name == "Adres") { 
                            //map.layers[p].destroy();
                            kaart.map.removeLayer(kaart.map.layers[p]);
                        };	
                    };
                },
                scope: this
            }
        });

        this.capGrid.show();
        formulier = this.capGrid;    	
    }
});
Ext.preg(gxp.plugins.GeocoderMetPointer2.prototype.ptype, gxp.plugins.GeocoderMetPointer2);
