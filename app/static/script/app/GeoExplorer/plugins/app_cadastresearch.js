/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/

/** 
* Code based upon Zaanatlas geocodermetpointer (github.com/teamgeo)
*/

Ext.namespace("gxp.plugins");
gxp.plugins.cadastresearch = Ext.extend(gxp.plugins.Tool, {
    

    ptype: "app_cadastresearch",
    addActionMenuText: "Perceel zoeken",
    addActionTip: "Een perceel zoeken op basis van CAPAKEY",
    menuText: "Perceel zoeken",
    
    outputConfig: {
		url: "http://gis.wegenenverkeer.be:8080/geoserver/wfs",
		featureType: "GRO_KADASTER",
		featurePrefix: "urilimburg",
		srsName: "EPSG:102113",
		fieldName: "capakey",
		geometryName: "the_geom",
		emptyText: "Bijvoorbeeld: 72502D020001/00Y000",
		listEmptyText: "- niets gevonden -",
		customSortInfo: {
			matcher: "^[a-zA-Z]\\s+(\\d*)+.*$",
			parts: [
				{order: 0, sortType: "asUCString"},
				{order: 1, sortType: "asInt"}
			]
		}
	},

	zoom: 18,
    

    constructor: function(config) {
        gxp.plugins.cadastresearch.superclass.constructor.apply(this, arguments);
    },

    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.cadastresearch.superclass.addActions.apply(this, [{
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

    addOutput: function(config) {
        return gxp.plugins.cadastresearch.superclass.addOutput.call(this, this.combo);
    },
    
    onComboSelect: function(combo, record) {
        var map = this.target.mapPanel.map;
		var location = record.get("feature").geometry.getBounds().getCenterLonLat();

		
		map.setCenter(new OpenLayers.LonLat(location.lon, location.lat),18);
		
		   var feature = new OpenLayers.Feature.Vector();
            feature.fid = 1;
            feature.geometry = new OpenLayers.Geometry.Point(location.lon, location.lat);

            pointerlayer.removeAllFeatures();
            pointerlayer.addFeatures([feature]);
            pointerlayer.redraw();
            
            

       
    },
    

    showCapabilitiesGrid: function() {        
        this.initCapGrid();
        Tool_button = this.target.toolbar.items.items[15];
        Tool_button.disable();
    },


    initCapGrid: function() {

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

			externalGraphic: "../theme/app/img/flag.png",
			backgroundGraphic: "../theme/app/img/marker-shadow.png",

			backgroundXOffset:  0,
			backgroundYOffset: -24,

			graphicYOffset: -27,

            pointRadius: 15
        });
        var capalayer = new OpenLayers.Layer.WMS("Adres",
                                   "http://gis.wegenenverkeer.be:8080/geoserver/wms",
                                   {layers: "GRO_KADASTER_11", transparent:true}, {displayInLayerSwitcher: false});
    

        pointerlayer = new OpenLayers.Layer.Vector("Adres", {styleMap: style, displayInLayerSwitcher: false});	
        kaart = this.target.mapPanel;
        kaart.map.addLayers([capalayer]);

        kaart.map.addLayers([pointerlayer]);
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
            bodyStyle:'padding:5px 5px 0',
            closeAction: "close",
            layout: "fit",
            height: 80,
            width: 370,
            x: kaartposition[0] + kaartsize.width - 370,
            y: kaartposition[1],

            resizable: false, 
            items: items,
            listeners: {
                destroy: function(win) {
                    Tool_button.enable();
                    var aantal = kaart.map.layers.length;
                    for(var p = 0; p < aantal; p++) {
                        if (kaart.map.layers[p].name == "Adres") { 
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
Ext.preg(gxp.plugins.cadastresearch.prototype.ptype, gxp.plugins.cadastresearch);
