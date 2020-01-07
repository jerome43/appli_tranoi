const mapG = {

    // Objet repésentant un stand
    Stand: function (numero, posX, posY, width, height) {
        this.numero = numero;
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
    },

    // Objet repésentant un plan
    Map: function (secteur, salle, path, pathXml, width, heigth) {
        this.secteur = secteur;
        this.salle = salle;
        this.path = path;
        this.pathXml = pathXml;
        this.width = width;
        this.height = heigth;
    },

    planGame: null, // le sprite du plan en cours dans phaser
    game: null, // la session de "jeu" phaser
    ellipse: null, // le cercle entourant le stand
    tap: false,
    xStart: null, // valeur de décalage initial de la carte (et du cercle) utilsé dans phaser drag
    yStart: null, // valeur de décalage initial de la carte (et du cercle) utilsé dans phaser drag
    dragStartX: 0, // utilsé dans phaser drag
    dragStartY: 0, // utilsé dans phaser drag
    dragStartXPlanGame: 0,// utilsé dans phaser drag
    dragStartYPlanGame: 0,// utilsé dans phaser drag

    pinch: false,
    panStart: false,
    panMove: false,

    listeStands: [],  // tableau des stands de la map
    listeMaps: [],    // tableau des maps du canvas
    stand: "", // le stand en cours d'affichage
    map: null, // la map en cours

    zoom: 1, // le niveau de zoom, 1 par défaut (aucun zoom)
    lastZoom: 1, // utilisé dans le pinch pour connaître le zoom au début du pinch
    timeOutClick: null, // utilsé pour les clicks
    requestAnimationCanvas: null, // utilisé dans l'animation du menuG

    // pour charger la liste des mapG affichables sur la canvas
    parseXmlListeMap: function (xmlFile, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', xmlFile);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                for (let i = 0; i < xhr.responseXML.getElementsByTagName('Map').length; i++) {
                    const map = new mapG.Map(
                        xhr.responseXML.getElementsByTagName('Map').item(i).getAttribute("secteur").toString().toUpperCase(),
                        xhr.responseXML.getElementsByTagName('Map').item(i).getAttribute("salle").toString().toUpperCase(),
                        xhr.responseXML.getElementsByTagName('Map').item(i).getAttribute("path"),
                        xhr.responseXML.getElementsByTagName('Map').item(i).getAttribute("pathXml"),
                        xhr.responseXML.getElementsByTagName('Map').item(i).getAttribute("width"),
                        xhr.responseXML.getElementsByTagName('Map').item(i).getAttribute("height")
                    );
                    mapG.listeMaps.push(map);
                }
                callback();
            }
        };
        xhr.send(null);
    },

    // pour charger la liste des stands afichés dans la mapG (version fichier csv), possède un callback
    parseCsvListeStandsMap: function (csvFile, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', csvFile);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) { // Si le fichier est chargé sans erreur
                // pour lecture du fichier csv, voir http://papaparse.com/
                let config = {
                    delimiter: ";",
                    newline: "", // auto-detect
                    header: false,
                    dynamicTyping: false,
                    preview: 0,
                    encoding: "",
                    worker: false,
                    comments: false,
                    step: undefined,
                    // fonction à lancer quand la lecture du csv a été effectuée
                    complete: function (results, file) {
                        //console.log("Parsing complete:", results, file);
                        putListStandMap(results.data);
                    },
                    error: undefined,
                    download: false,
                    skipEmptyLines: false,
                    chunk: undefined,
                    fastMode: undefined,
                    beforeFirstChunk: undefined
                };
                Papa.parse(xhr.responseText, config);
            }
        };
        xhr.send(null); // La requête est prête, on envoie tout !

        // fonction à lancer quand la lecture du csv s'est bien passé
        function putListStandMap(data) {
            if (data.length <= 1) { // si le tableau n'a pas plus d'une ligne, c'est qu'il est mal formé
                //console.log("erreur probable au niveau du chargement de la lecture du fichier csv")
            } else {
                for (let i = 0; i < data.length; i++) {
                    if (data[i][0] && data[i][1] && data[i][2] && data[i][3] && data[i][4]) {
                        const stand = new mapG.Stand(data[i][0].toString().toUpperCase(), data[i][1],data[i][2], data[i][3], data[i][4]);
                        mapG.listeStands.push(stand);
                        //console.log("parseCsvListeStandsMap ok : numero stand" + stand.numero);
                    }
                }
            }
            callback();
        }
    },

    getStand: function (numero = "") {
        let index = 0;
        for (let i = 0; i < mapG.listeStands.length; i++) {
            //console.log("getStand : numero : " + numero + " / found : " + numeroStand);
            if (mapG.listeStands[i].numero === numero) {
                index = i;
                break;
            }
        }
        return new mapG.Stand(
            mapG.listeStands[index].numero,
            mapG.listeStands[index].posX,
            mapG.listeStands[index].posY,
            mapG.listeStands[index].width,
            mapG.listeStands[index].height
        );
    },

    getMap: function (salle = "") {
        //console.log("salle : " + salle);
        let index = 0;
        for (let i = 0; i < mapG.listeMaps.length; i++) {
            if (mapG.listeMaps[i].salle.toString() === salle.toString()) {
                index = i;
                break;
            }
        }
        return new mapG.Map(mapG.listeMaps[index].secteur,
            mapG.listeMaps[index].salle,
            mapG.listeMaps[index].path,
            mapG.listeMaps[index].pathXml,
            mapG.listeMaps[index].width,
            mapG.listeMaps[index].height);
    },

    addHammerListener: function () {
        const mc = new Hammer(document.getElementById("mapContainer_phaser"));
        mc.get('pinch').set({enable: true});
        mc.on("pinchstart", function (ev) {
            mapG.lastZoom = mapG.zoom;
            mapG.pinch = true;
            if (mapG.ellipse != null) {
                mapG.ellipse.visible = false;
            }
        });

        mc.on("pinchin", function (ev) {
            mapG.zoom = mapG.zoom - 0.01;
            if (mapG.zoom < 0.5) {
                mapG.zoom = 0.5;
            }
            mapG.planGame.scale.setTo(mapG.zoom, mapG.zoom);
        });

        mc.on("pinchout", function (ev) {
            mapG.zoom = mapG.zoom + 0.01;
            if (mapG.zoom > 2) {
                mapG.zoom = 2;
            }
            mapG.planGame.scale.setTo(mapG.zoom, mapG.zoom);
        });

        mc.on("pinchend", function (ev) {
            if (mapG.ellipse != null) {
                mapG.ellipse.width = mapG.ellipse.width * mapG.zoom / (mapG.lastZoom);
                mapG.ellipse.height = mapG.ellipse.height * mapG.zoom / (mapG.lastZoom);
                mapG.ellipse.x = mapG.planGame.x + ((mapG.ellipse.x - mapG.planGame.x) / mapG.lastZoom) * mapG.zoom;
                mapG.ellipse.y = mapG.planGame.y + ((mapG.ellipse.y - mapG.planGame.y) / mapG.lastZoom) * mapG.zoom;
                mapG.ellipse.visible = true;
            }
            window.setTimeout(function () {
                mapG.pinch = false;
            }, 500);
        });

        mc.on("tap", function (ev) {
            //console.log(ev.type + " / " + ev.center.x);
            mapG.tap = true;
        });

        mc.get('pan').set({direction: Hammer.DIRECTION_ALL});

        mc.on("panstart", function (ev) {
            mapG.panStart = true;
        });
        mc.on("panleft panright panup pandown", function (ev) {
            mapG.panMove = true;
        });
        mc.on("panend", function (ev) {
            mapG.panMove = false;
        });
    },

    // pour initialiser phaser dessiner une mapG de taille fixe dans la canvas
    initPhaser: function (w = 1072, h = 900) {
        mapG.game = new Phaser.Game(w, h, Phaser.CANVAS, 'mapContainer_phaser', {
            preload: preload,
            create: create,
            update: update,
            render: render
        }, true);

        function preload() {
            // à activer ou désactiver
            mapG.game.load.image('map_pb_gf', "image/maps/pb_rdc.webp");
            mapG.game.load.image('map_pb_ff', "image/maps/pb_etage.webp");
            mapG.game.load.image('map_cdl_foyer', "image/maps/cdl_foyer.webp");
            mapG.game.load.image('map_cdl_gd', "image/maps/cdl_gd.webp");
            mapG.game.load.image('map_cdl_lenotre', "image/maps/cdl_lenotre.webp");
            //mapG.game.load.image('map_cdl_soufflot', "image/maps/cdl_soufflot.png");
            //mapG.game.load.image('map_carreau_temple', "image/maps/carreauTemple.png");
        }

        function create() {
            mapG.game.physics.startSystem(Phaser.Physics.ARCADE);
            mapG.zoom = 0.5;
            mapG.planGame = mapG.game.add.sprite(mapG.game.world.width / 2, mapG.game.world.height / 2, 'map_pb_gf');
            mapG.planGame.anchor.setTo(0.5, 0.5);
            mapG.planGame.scale.setTo(mapG.zoom, mapG.zoom);
            mapG.planGame.inputEnabled = true;
            mapG.game.input.addMoveCallback(moveCallback, this);
            mapG.planGame.events.onInputDown.add(onInputDown, this);
            mapG.planGame.events.onInputUp.add(onInputUp, this);
        }

        function onInputDown(sprite, pointer) {
        }

        function onInputUp(sprite, pointer) {
            window.setTimeout(function () { // pour laisser le temps à hammer onTap de s'exécuter avant onInputUp
                if (mapG.tap && !mapG.pinch) { // pour empêcher la recherche si on drag ou pinch
                    mapG.tap = false;
                    //console.log("onInputUp pointer : " + pointer.x + " / " + pointer.y + " - onInputUp sprite : " + sprite.x + " / " + sprite.y);
                    let xSearch = (pointer.x / mapG.zoom - sprite.x / mapG.zoom + mapG.map.width / 2);
                    let ySearch = (pointer.y / mapG.zoom - sprite.y / mapG.zoom + mapG.map.height / 2);
                    //console.log("listStand.length :" + length);
                    for (let i = 0; i < mapG.listeStands.length; i++) {
                        mapG.stand = mapG.listeStands[i];
                        let xMax = parseFloat(mapG.stand.posX) + parseFloat(mapG.stand.width),
                            yMax = parseFloat(mapG.stand.posY) + parseFloat(mapG.stand.height);
                        if (xSearch > parseFloat(mapG.stand.posX) && xSearch < xMax && ySearch > parseFloat(mapG.stand.posY) && ySearch < yMax) {
                            //console.log("click on stand numero : " + mapG.listeStands[i].numero);
                            track.addMapInteraction();
                            utils.redirect();
                            menuG.reduceMenu(menuG.listeStandsMenu);
                            menuG.centerMenu(mapG.stand.numero);
                            mapG.animateTranslate();
                            break;
                        }
                    }
                }
            }, 200);
        }

        function update() {
            if (mapG.changeMap) {
                //console.log("map.salleLoaded : " + mapG.map.path);
                switch (mapG.map.path) {
                    case "image/maps/pb_rdc.webp":
                        mapG.planGame.loadTexture('map_pb_gf');
                        break;
                    case "image/maps/pb_etage.webp":
                        mapG.planGame.loadTexture('map_pb_ff');
                        break;
                    case "image/maps/cdl_foyer.webp":
                        mapG.planGame.loadTexture('map_cdl_foyer');
                        break;
                    case "image/maps/cdl_gd.webp":
                        mapG.planGame.loadTexture('map_cdl_gd');
                        break;
                    case "image/maps/cdl_lenotre.webp":
                        mapG.planGame.loadTexture('map_cdl_lenotre');
                        break;
                    // à activer ou désactiver
                    /*
                    case "image/maps/cdl_soufflot.png":
                        mapG.planGame.loadTexture('map_cdl_soufflot');
                        break;
                     case "image/maps/carreauTemple.png":
                        mapG.planGame.loadTexture('map_carreau_temple');
                        break;
                    */
                }
                mapG.zoom = 0.5;
                mapG.planGame.scale.setTo(mapG.zoom, mapG.zoom);
                mapG.planGame.x = mapG.game.world.width / 2;
                mapG.planGame.y = mapG.game.world.height / 2;
                mapG.changeMap = false;
            }
        }

        function render() {
            // for debug only
            //game2.debug.text(result, 10, 20);
            //for ( let i= 0; i<placeArray.length; i++) {
            //game2.debug.rectangle(placeArray[i]);
            //}
        }

        function moveCallback(pointer, x, y, click) {
            //console.log("moveCallBack : " + pointer.x + " / " + pointer.y );
            //console.log("click : " +click);
            if (mapG.panStart) {
                mapG.panStart = false;
                //console.log("click movecallback - mapG " + mapG.planGame.x + " / " + mapG.planGame.y);
                mapG.xStart = x;
                mapG.yStart = y;
                mapG.dragStartXPlanGame = mapG.planGame.x;
                mapG.dragStartYPlanGame = mapG.planGame.y;

                if (mapG.ellipse != null) {
                    //console.log("click movecallback -  ellipse : " + mapG.ellipse.x + " / " + mapG.ellipse.y);
                    mapG.dragStartX = mapG.ellipse.x;
                    mapG.dragStartY = mapG.ellipse.y;
                }
            } else if (mapG.panMove) {
                //console.log("moveCallBack");
                if (mapG.pinch === false) {
                    if (mapG.ellipse != null) {
                        mapG.ellipse.x = mapG.dragStartX + x - mapG.xStart;
                        mapG.ellipse.y = mapG.dragStartY + y - mapG.yStart;
                    }
                    mapG.planGame.x = mapG.dragStartXPlanGame + x - mapG.xStart;
                    mapG.planGame.y = mapG.dragStartYPlanGame + y - mapG.yStart;
                }
            }
        }
    },

    // création d'un cercle autour du stand
    drawCircleCenter: function () {
        //console.log("drawCircleCenter");

        let ellipseW = parseFloat(mapG.stand.width) / 2 * 1.5;
        let ellipseH = parseFloat(mapG.stand.height) / 2 * 1.5;

        if (mapG.ellipse != null) {
            mapG.ellipse.destroy();
        }
        //console.log(mapG.game.world.centerX + " / " + mapG.game.world.centerY);

        mapG.ellipse = mapG.game.add.graphics(mapG.game.world.width / 2, mapG.game.world.height / 2);
        mapG.ellipse.lineStyle(12, 0xffffff, 0.9);
        mapG.ellipse.drawEllipse(0, 0, ellipseW * mapG.zoom, ellipseH * mapG.zoom);
    },

    // animation de scroll de la carte qui se centre sur le stand recherché
    animateTranslate: function () {
        //console.log("translateAndScale" + stand.numero);
        if (mapG.ellipse != null) {
            mapG.ellipse.visible = false;
        }
        let xStand = parseFloat(mapG.stand.posX);
        let yStand = parseFloat(mapG.stand.posY);
        let wStand = parseFloat(mapG.stand.width);
        let hStand = parseFloat(mapG.stand.height);

        // translation du stand par rapport au centre de la carte
        let tSx = Math.round(mapG.map.width / 2 - xStand - wStand / 2) * mapG.zoom,
            tSy = Math.round(mapG.map.height / 2 - yStand - hStand / 2) * mapG.zoom; // valeurs de la translation à opérer par rapport à la carte d'origine, centrée

        // on récupère les valeurs du dernier emplacement de la mapG en terme de translation
        let tMx = mapG.planGame.x, tMy = mapG.planGame.y;

        // tanslation à opérer
        let tx = mapG.map.width / 4 - tMx + tSx, ty = mapG.map.height / 4 - tMy + tSy;

        let v = 8; // vitesse de translation

        // on va déplacer dans une direction précise en fonction de la nouvelle position par rapport à l'ancienne

        if (tx >= 0 && ty >= 0) {
            //console.log("translation BD - tx : " + tx + " / ty : " + ty );
            translateBD();
        } else if (tx < 0 && ty < 0) {
            //console.log("translation HG - tx : " + tx + " / ty : " + ty );
            translateHG();
        } else if (tx >= 0 && ty < 0) {
            //console.log("translation HD - tx : " + tx + " / ty : " + ty );
            translateHD();
        } else if (tx < 0 && ty >= 0) {
            //console.log("translation BG - tx : " + tx + " / ty : " + ty );
            translateBG();
        } else {
            //console.log("no translation possible - tx : " + tx + " / ty : " + ty);
        }

        function translateHG() {
            // on opère la translation par axe si nécessaire
            if (tx <= -v) {
                mapG.planGame.x = mapG.planGame.x - v;
                tx = tx + v;
            }
            if (ty <= -v) {
                mapG.planGame.y = mapG.planGame.y - v;
                ty = ty + v;
            }
            if (tx <= -v || ty <= -v) {
                mapG.requestAnimationCanvas = window.requestAnimationFrame(function () {
                    translateHG();
                }); // on relance la boucle car tous les déplacements ne sont pas terminés
            } else {
                // on s'assure avant de quitter de recentrer exactement sur tx et ty car itx et ity peuvent varier de +8 à -8px (vitesse de décalage)
                mapG.planGame.x = mapG.planGame.x + tx;
                mapG.planGame.y = mapG.planGame.y + ty;

                mapG.drawCircleCenter();// dessin du cercle
                //console.log("fin translate HG");
            }
        }

        function translateBG() {
            // on opère la translation par axe si nécessaire
            if (tx <= -v) {
                mapG.planGame.x = mapG.planGame.x - v;
                tx = tx + v;
            }
            if (ty >= v) {
                mapG.planGame.y = mapG.planGame.y + v;
                ty = ty - v;
            }
            if (tx <= -v || ty >= v) {
                mapG.requestAnimationCanvas = window.requestAnimationFrame(function () {
                    translateBG();
                }); // on relance la boucle car tous les déplacements ne sont pas terminés
            } else {
                // on s'assure avant de quitter de recentrer exactement sur tx et ty car itx et ity peuvent varier de +8 à -8px (vitesse de décalage)
                mapG.planGame.x = mapG.planGame.x + tx;
                mapG.planGame.y = mapG.planGame.y + ty;
                mapG.drawCircleCenter();// dessin du cercle
                //console.log("fin translate BG");
            }
        }

        function translateBD() {

            // on opère la translation par axe si nécessaire
            if (tx >= v) {
                mapG.planGame.x = mapG.planGame.x + v;
                tx = tx - v;
            }
            if (ty >= v) {
                mapG.planGame.y = mapG.planGame.y + v;
                ty = ty - v;
            }
            if (tx >= v || ty >= v) {
                mapG.requestAnimationCanvas = window.requestAnimationFrame(function () {
                    translateBD();
                }); // on relance la boucle car tous les déplacements ne sont pas terminés
            } else {
                // on s'assure avant de quitter de recentrer exactement sur tx et ty car itx et ity peuvent varier de +8 à -8px (vitesse de décalage)
                mapG.planGame.x = mapG.planGame.x + tx;
                mapG.planGame.y = mapG.planGame.y + ty;
                mapG.drawCircleCenter();// dessin du cercle
                //console.log("fin translate BD");
            }
        }

        function translateHD() {

            // on opère la translation par axe si nécessaire
            if (tx >= v) {
                mapG.planGame.x = mapG.planGame.x + v;
                tx = tx - v;
            }
            if (ty <= -v) {
                mapG.planGame.y = mapG.planGame.y - v;
                ty = ty + v;
            }
            if (tx >= v || ty <= -v) {
                mapG.requestAnimationCanvas = window.requestAnimationFrame(function () {
                    translateHD();
                }); // on relance la boucle car tous les déplacements ne sont pas terminés
            } else {
                // on s'assure avant de quitter de recentrer exactement sur tx et ty car itx et ity peuvent varier de +8 à -8px (vitesse de décalage)
                mapG.planGame.x = mapG.planGame.x + tx;
                mapG.planGame.y = mapG.planGame.y + ty;
                mapG.drawCircleCenter();// dessin du cercle
                //console.log("fin translate HD");
            }
        }
    },

    displayNewMap : function (salle, secteur) {
        navigation.loadNavHeader(secteur, salle);
        mapG.initMap();// on efface d'abord les données précédentes
        mapG.map = mapG.getMap(salle.toString().toUpperCase());
        mapG.changeMap=true;// on indique à phaser que l'on change de mapG
        mapG.parseCsvListeStandsMap(mapG.map.pathXml, mapG.cbOnLoadListStandMap);
    },

    cbOnLoadListStandMap : function () {
        if (menuG.standMenuSearched !== null) {
            mapG.stand = mapG.getStand(menuG.standMenuSearched.numero);
            //console.log("stand nom : " + mapG.stand.numero);
            setTimeout(()=> { // timeout sinon Phaser n'a pas le temps de se charger
                mapG.animateTranslate();
            }, 500);
        }
        menuG.loadMenuSalle();
    },

    initMap: function () { // pour tout réinitialiser
        mapG.listeStands = [];
        menuG.listeStandsMenu = [];
        mapG.map = null;
        mapG.clearMap();
    },

    clearMap: function () { // pour remettre la mapG à sa position initiale
        if (mapG.requestAnimationCanvas !== null) {
            cancelAnimationFrame(mapG.requestAnimationCanvas);
        }
        if (mapG.ellipse != null) {
            mapG.ellipse.destroy();
        }
        mapG.ellipse = null;
        mapG.tap = false;
        mapG.xStart = null;
        mapG.yStart = null;
        mapG.pinch = false;
        mapG.panStart = false;
        mapG.panMove = false;
        mapG.dragStartX = 0;
        mapG.dragStartY = 0;
        mapG.dragStartXPlanGame = 0;
        mapG.dragStartYPlanGame = 0;
        mapG.timeOutClick = null;
        mapG.requestAnimationCanvas = null;
        mapG.zoom = 0.5;
        mapG.lastZoom = 0.5;
        mapG.stand = "";
        mapG.planGame.x = mapG.game.world.width / 2;
        mapG.planGame.y = mapG.game.world.height / 2;
        mapG.planGame.scale.setTo(mapG.zoom, mapG.zoom);
    }
};

(function() {
        mapG.addHammerListener();
    }
)();