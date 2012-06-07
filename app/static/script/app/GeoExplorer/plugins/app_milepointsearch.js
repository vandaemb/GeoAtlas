/**
* Copyright (c) 2008-2011 The Open Planning Project
*
* Published under the GPL license.
* See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
* of the license.
*/


Ext.namespace("gxp.plugins");


gxp.plugins.milepointsearch = Ext.extend(gxp.plugins.Tool, {
    

    ptype: "app_milepointsearch",
    

    addActionMenuText: "Referentiepaal zoeken",


    addActionTip: "Inzoomen naar een ident8 met referentiepunt",


    menuText: "Zoek referentiepunt",
    
    outputConfig: {
		url: "http://gis.wegenenverkeer.be:8080/geoserver/wfs",
		featureType: "referentiepalen",
		featurePrefix: "urilimburg",
		srsName: "EPSG:102113",
		fieldName: "combine",
		geometryName: "the_geom",
		emptyText: "Bijvoorbeeld: N0740001 9.7",
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
    

    constructor: function(config) {
        gxp.plugins.milepointsearch.superclass.constructor.apply(this, arguments);
    },

    addActions: function() {
        var selectedLayer;
        var actions = gxp.plugins.milepointsearch.superclass.addActions.apply(this, [{
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
        return gxp.plugins.milepointsearch.superclass.addOutput.call(this, this.combo);
    },
    

    onComboSelect: function(combo, record) {
        var map = this.target.mapPanel.map;
        var location = record.get("feature").geometry;
        if (location instanceof OpenLayers.Geometry.Point) {
            map.setCenter(new OpenLayers.LonLat(location.x, location.y), this.zoom);

            var feature = new OpenLayers.Feature.Vector();
            feature.fid = 1;
            feature.geometry = location;

            pointerlayer.removeAllFeatures();
            pointerlayer.addFeatures([feature]);
            pointerlayer.redraw();
            
        }
    },
    
    

    showCapabilitiesGrid: function() {        
        this.initCapGrid();
        Tool_button = this.target.toolbar.items.items[15];
        Tool_button.disable();
    },


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

        pointerlayer = new OpenLayers.Layer.Vector("Adres", {styleMap: style, displayInLayerSwitcher: false});	
        //pointerlayer.opacity = 0.5;	
        kaart = this.target.mapPanel;
        var kaart1 = this.target.mapPanel;
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
            title: "Zoeken op ident8 met referentiepunt",
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
Ext.preg(gxp.plugins.milepointsearch.prototype.ptype, gxp.plugins.milepointsearch);
