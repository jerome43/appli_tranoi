/**
 * Created by jerome on 29/02/16.
 * le menuG droit des exposants
 */

const menuG = {
    //   Objet repésentant un stand dans la liste déroulante
    StandMenu : function(nom, secteur, salle, numero, genre) {
        this.nom = nom;
        this.secteur = secteur;
        this.salle = salle;
        this.numero = numero;
        this.genre = genre;
    },
    
    listeStandsMenu : [],   // création de l'objet liste des stands du menuG
    csvFile : "data/listing.csv",    // le fichier csv qui contient la liste de tous les stands dans toutes les salles
    lastMenuTop: 0,  // la dernièr position du menuG, par défaut à 0px
    timeOutAnimMenu:null, // utilsé dans l'animation du menuG
    requestAnimationMenu:null, // utilsé dans l'animation du menuG
    isMenuGeneral: true, // pour savoir si on affiche le menu général ou par salleLoaded
    standMenuSearched : null,// le stand sur lequel on veut aller

    // pour charger la liste des stands afichés dans le menuG, posède un callback
    parseCsvListeStandsMenu: function(csvFile, callback) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', csvFile);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) { // Si le fichier est chargé sans erreur
                // pour lecture du fichier csv, voir http://papaparse.com/
                let config =  {
                    delimiter: ";",
                    newline: "",// auto-detect
                    header: false,
                    dynamicTyping: false,
                    preview: 0,
                    encoding: "",
                    worker: false,
                    comments: false,
                    step: undefined,
                    // fonction à lancer quand la lecture du csv a été effectuée
                    complete: (results, file)=> {
                        //console.log("Parsing complete:", results, file);
                        putListStandMenu(results.data);
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
        function putListStandMenu(data) {
            if (data.length <= 1) { // si le tableau n'a pas plus d'une ligne, c'est qu'il est mal formé
                //console.log("erreur probable au niveau du chargement de la lecture du fichier csv")
            } else {
                for (let i = 0; i < data.length; i++) {
                    if (data[i][0] && data[i][1] && data[i][2] && data[i][3] && data[i][4]) {
                        let stand = new menuG.StandMenu(
                            data[i][0].toString().toUpperCase(),
                            data[i][4].toString().toUpperCase(),
                            data[i][2].toString().toUpperCase(),
                            data[i][3].toString().toUpperCase(),
                            data[i][1].toString());
                        menuG.listeStandsMenu.push(stand);
                    }
                }
            }
            callback();
        }
    },

    getStandMenu: function(numero = "", nom = "") {
        //console.log("getstandMenufromNumero : id : " + numero + " / nom : " + nom);
        let index;
        for (let i=0; i<menuG.listeStandsMenu.length; i++) {
            //console.log("nom clique : " + nom + " / nom liste : " + menuG.listeStandsMenu[i].nom);
            if (menuG.listeStandsMenu[i].numero === numero && menuG.listeStandsMenu[i].nom === nom) {
                index = i;
                break;
            } else {
                index = 0;
            }
        }
        //console.log(" getstandMenufromNumer index : " + index);
        return new menuG.StandMenu(
            menuG.listeStandsMenu[index].nom,
            menuG.listeStandsMenu[index].secteur,
            menuG.listeStandsMenu[index].salle,
            menuG.listeStandsMenu[index].numero,
            menuG.listeStandsMenu[index].genre);
    },

    reduceMenu: function(listeStandArray) {
        if (listeStandArray) {
            let list = document.getElementById("searchContainer_liste_ul");
            let newLi;
            if (menuG.isMenuGeneral) { // si on est dans le menuG paris
                while (list.hasChildNodes()) { // on enlève au préalables les anciennes listes si il y en a
                    list.removeChild(list.firstChild);
                }
                for (let i = 0; i < listeStandArray.length; i++) {
                    newLi = document.createElement('li');
                    newLi.id = listeStandArray[i].numero;
                    newLi.innerText = listeStandArray[i].nom;
                    menuG.attributeClass(listeStandArray[i].secteur,listeStandArray[i].genre, newLi);
                    newLi.addEventListener("click", (e)=> {
                        track.addMenuInteraction();
                        utils.redirect();
                        if (e.target.id !== "") {
                            let standMenu = menuG.getStandMenu(e.target.id, e.target.innerText);
                            //console.log(" click and getMap : " + standMenu.nom + " / " + standMenu.salleLoaded + " / " + standMenu.secteur);
                            if (menuG.isMenuGeneral) {
                                navigation.showMap();
                            }
                            mapG.displayNewMap(standMenu.salle, standMenu.secteur);
                            menuG.standMenuSearched = standMenu;
                        }
                    }, false);
                    // récupération de l'ul et affectation de l'enfant
                    document.getElementById('searchContainer_liste_ul').appendChild(newLi);
                }
            } else { // si on est dans une salleLoaded
                while (list.hasChildNodes()) {// As long as <ul> has a child node, remove it
                    list.removeChild(list.firstChild);
                }
                // puis on charge le nouveau menuG avec les éléments de listeStandMenu
                for (let i = 0; i<listeStandArray.length; i++) {
                    // on ne va garder que ceux de la salleLoaded en question
                    if (listeStandArray[i].salle.toString() === mapG.map.salle.toString()) {
                        //console.log("listeStandArray["+i+"].salleLoaded :" + listeStandArray[i].salleLoaded + "/ salleLoaded :" + mapG.map.salle);
                        newLi = document.createElement('li');
                        newLi.id = listeStandArray[i].numero;
                        newLi.innerText = listeStandArray[i].nom + " | " + listeStandArray[i].numero+ " |";
                        menuG.attributeClass(listeStandArray[i].secteur, listeStandArray[i].genre, newLi);
                        newLi.addEventListener("click", (e) => {
                            track.addMenuInteraction();
                            utils.redirect(); // mise en place de la redirection en cas d'inactivité
                            clavier.clearClavier(); // on ferme le clavier éventuel
                            mapG.stand = mapG.getStand(e.target.id);
                            mapG.animateTranslate();
                            menuG.centerMenu(mapG.stand.numero);
                        }, false);
                        // récupération de l'ul et affectation de l'enfant
                        document.getElementById('searchContainer_liste_ul').appendChild (newLi);
                    }
                    else {
                        //console.log("no same salleLoaded found");
                        //console.log("isteStandsMenu["+i+"].salleLoaded :" + listeStandArray[i].salleLoaded + "/ salleLoaded :" + mapG.map.salle);
                    }
                }
            }
        }
    },

    // pour lancer le centrage de la liste des stands sur le stand où l'on vient de cliquer
    centerMenu: function(numero) {
        // on arrêt d'abord les animationsFrame
        if (menuG.requestAnimationMenu) {
            window.cancelAnimationFrame(menuG.requestAnimationMenu);
            menuG.requestAnimationMenu = undefined;
        }
        let standMenu = document.getElementById(numero);
        if (standMenu) {
            //console.log("center menuG :" + standMenu);
            let menu = document.getElementById("searchContainer_liste_ul");
            var v = 40; // vitesse de défilement du menuG
            // on commence par enlever la classe selected à tous les noeuds de la liste
            removeClassMenuSelected(menu);
            // trouver l'index de la position du stand recherché dans la liste
            let index = findRow(standMenu);
            //console.log("index center menuG :" + index);
            let top = -40 * index;
            //console.log("top :" + top);
            var iFromLastTop = menu.lastMenuTop;

            // condition pour ne pas scroller le menuG si l'on a cliqué sur les 12 premiers items
            // on scrolle

            // on garde en mémoire la position du menuG pour s'en resservir au prochain appel
            menu.lastMenuTop = top;
            standMenu.classList.add("menuSelected");
            menu.style.top = top + 40 + "px";
            animation();
        } else {
            //console.log("no stand menuG find : " + numero)
        }

        // pour faire défiler le menuG vers le bas ou le haut
        function moveMenuUp() {
            // on incrémente
            iFromLastTop = iFromLastTop - v;
            // on affiche et on relance l'incrémentation tant qu'on a pas atteints la valeur du top rechercée
            if (iFromLastTop >= top) {
                //console.log("movemenu iFromLastTop : " +iFromLastTop);
                menuG.style.top = iFromLastTop + 40 + "px";
                menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                    moveMenuUp();
                });
            }

            else {
                //console.log("movemenu iFromLastTop : " +iFromLastTop);
            }
            // on ajoute la classe css menuSelected
            standMenu.classList.add("menuSelected");
        }


        function moveMenuDown() {
            // on incrémente
            iFromLastTop = iFromLastTop + v;
            // on affiche et on relance l'incrémentation tant qu'on a pas atteints la valeur du top rechercée
            if (iFromLastTop <= top) {
                //console.log("movemenu iFromLastTop : " +iFromLastTop);
                menuG.style.top = iFromLastTop + 40 + "px";
                menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                    moveMenuDown();
                });
            }

            else {
                //console.log("movemenu iFromLastTop : " +iFromLastTop);
            }
            // on ajoute la classe css menuSelected
            standMenu.classList.add("menuSelected");
        }

        // pour récupérer l'index du noeud du stand dans le menuG
        function findRow(node) {
            if (node) {
                let i = 1;
                while (node.previousElementSibling !== null) {
                    i++;
                    node = node.previousElementSibling;
                }
                return i;
            } else return 0;
        }

        // pour enlever une classe à tous les enfants d'un noeud
        function removeClassMenuSelected(parent) {
            // para est une référence à un élément <p>
            if (parent.hasChildNodes()) // On vérifie d'abord si l'objet n'est pas vide, c.-à-d. s'il a des enfants
            {
                let collEnfants = parent.childNodes;
                for (let i = 0; i < collEnfants.length; i++) {
                    //console.log(collEnfants[iFromLastTop]);
                    if (collEnfants[i].classList) { // on vérifie qu'une classe a déjà été attribuée avant de l'enlever
                        collEnfants[i].classList.remove("menuSelected");// NOTE : la liste n'est pas une copie, l'ajout ou le retrait
                        // d'éléments modifiera la liste
                    }
                }
            }
        }

        function animation() {
            clearTimeout(menuG.timeOutAnimMenu);
            let searchContainer_list_animation = document.getElementById("searchContainer_liste_animation");
            let searchContainer_list_animation_old = searchContainer_list_animation.parentNode.removeChild(searchContainer_list_animation);

            let searchContainer_liste = document.getElementById('searchContainer_liste'),
                searchContainer_liste_firstChild = searchContainer_liste.childNodes[1];
            if (searchContainer_liste && searchContainer_liste_firstChild) {
                searchContainer_liste_firstChild.parentNode.insertBefore(searchContainer_list_animation_old, searchContainer_liste_firstChild.nextSibling);
            }
            searchContainer_list_animation.style.display = "block";
            searchContainer_list_animation.style.animationName = "animationMenu";
            searchContainer_list_animation.style.animationDuration = "3s";
            menuG.timeOutAnimMenu = setTimeout(function(){searchContainer_list_animation.style.display = "none";}, 3000);
        }
    },

    attributeClass : function(secteur, genre, newLi) { // pour diférencier graphiquement les items du menu
         switch (genre) {
            case "NORMAL" : newLi.classList.add("normal");
                break;
            case "NEW" : newLi.classList.add("new");
                break;
            case "ONLY AT TRANOI" : newLi.classList.add("mixte");
                break;
            case "JEWEL DISTRICT" : newLi.classList.add("jewel");
                break;
        }
    },

    // ajout de listener sur le menuG pour détecter un scrolls sur le menuG
    addMenuListener: function() {
        let lastYtouch = [];// va récupérer la dernière position de touchmove et en le comparrant à posY, on saura s'il faut scroller vers le haut ou le bas
        let firstTimestamp; // récupère la date à laquelle on a commencé à cliquer, utile pour savoir si on scrolle vite ou pas
        let menu=document.getElementById("searchContainer_liste_ul");

        function touchStart(evt) {
            firstTimestamp = new Date().getTime();
            // on arrêt d'abord les animationsFrame
            if (menuG.requestAnimationMenu !== null) {
                window.cancelAnimationFrame(menuG.requestAnimationMenu);
                menuG.requestAnimationMenu = null;
            }
        }

        function touchUp(evt) {
            utils.redirect(); // mise en place de la redirection en cas d'inactivité
            let ecartTime = new Date().getTime() - firstTimestamp;
            let ecartScroll = lastYtouch[lastYtouch.length-1] - lastYtouch[0];
            let ratioScroll = ecartScroll/ecartTime;
            let speed=1; // multiplicateur de vitesse qu'on va affecter au scrol
            //console.log(ratioScroll);
            if (Math.abs(ratioScroll)<0.5) {
                speed = 0.5;
            }
            else if (Math.abs(ratioScroll)>=0.5 && Math.abs(ratioScroll)<=0.75) {
                speed = 0.75;
            }
            else if (Math.abs(ratioScroll)>=0.75 && Math.abs(ratioScroll)<=1) {
                speed = 1;
            }
            else if (Math.abs(ratioScroll)>1 && Math.abs(ratioScroll)<=1.25) {
                speed = 2;
            }
            else if (Math.abs(ratioScroll)>1.25 && Math.abs(ratioScroll)<=1.5) {
                speed = 3;
            }
            else if (Math.abs(ratioScroll)>1.5) {
                speed = 4;
            }

            // léger scroll automatique du menuG lorsque l'on relache le doigt
            function requestAnimationScrollMenu(i) {
                if (ratioScroll>0) {
                    i++;
                    if (i <= ratioScroll * 40/5) { // valeur qui contrôle la longueur du scroll
                        scrollMenu(5*speed, true);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }
                    else if(i > ratioScroll * 40/5 && i <= ratioScroll * 40/5*2) {
                        scrollMenu(4*speed, true);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }
                    else if(i > ratioScroll * 40/5*2 && i <= ratioScroll * 40/5*3) {
                        scrollMenu(3*speed, true);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }
                    else if(i > ratioScroll * 40/5*3 && i <= ratioScroll * 40/5*4) {
                        scrollMenu(2*speed, true);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }

                    else if (i > ratioScroll * 40/5*4 && i<ratioScroll * 40) {
                        scrollMenu(speed, true);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }

                    else {
                        scrollMenuInverse(); // à la fin, on corrige les éventuels déplacements hors limite du menuG
                    }
                }

                else {
                    i++;
                    if (i <= Math.abs(ratioScroll) * 40/5) { // valeur qui contrôle la longueur du scroll
                        scrollMenu(5*speed, false);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }
                    else if(i > Math.abs(ratioScroll) * 40/5 && i <= Math.abs(ratioScroll) * 40/5*2) {
                        scrollMenu(4*speed, false);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }
                    else if(i > Math.abs(ratioScroll) * 40/5*2 && i <= Math.abs(ratioScroll) * 40/5*3) {
                        scrollMenu(3*speed, false);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }
                    else if(i > Math.abs(ratioScroll) * 40/5*3 && i <= Math.abs(ratioScroll) * 40/5*4) {
                        scrollMenu(2*speed, false);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }

                    else if (i > Math.abs(ratioScroll) * 40/5*4 && i<Math.abs(ratioScroll) * 40) {
                        scrollMenu(speed, false);
                        menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                            requestAnimationScrollMenu(i);
                        });
                    }

                    else {
                        scrollMenuInverse(); // à la fin, on corrige les éventuels déplacements hors limite du menuG
                    }
                }
            }
            requestAnimationScrollMenu(0); // premier lancement

            lastYtouch = [];// réinitialisation
        }

        function touchMove(evt) {
            utils.redirect(); // mise en place de la redirection en cas d'inactivité
            //evt.preventDefault();
            //console.log("toucheMove");
            if (evt.targetTouches.length === 1) {// on s'assure qu'il n'y a qu'un doigt qui a cliqué
                let touch = evt.targetTouches[0];
                if (touch.pageY < lastYtouch[lastYtouch.length-1]) // on scrolle vers le haut
                {scrollMenu((touch.pageY - lastYtouch[lastYtouch.length-1]), true);}
                else if (touch.pageY > lastYtouch[lastYtouch.length-1]) // on scrolle vers le bas
                {scrollMenu((lastYtouch[lastYtouch.length-1] - touch.pageY), false);}
                else {
                    //console.log("no Move")
                }
                //console.log(" firstTouchY : " + lastYtouch[lastYtouch.length-1] + " pageY : " + touch.pageY);
                lastYtouch.push(touch.pageY);
            }
        }

// pour déplacer le menuG vers le haut ou vers le bas
        function scrollMenu(scroll, boolean) {
            let menu=document.getElementById("searchContainer_liste_ul");
            let top = parseInt(getComputedStyle(menu, null).top);
            let height = parseInt(getComputedStyle(menu, null).height);
            if (boolean) { // scroll vers le haut
                if (parseInt(Math.abs(top+scroll)) <  height-750) { // empêche le menuG de monter plus haut que le dernier élément de la liste
                    //menuG.style.top = (top + scroll) + "px";
                }
                menu.style.top = (top + scroll) + "px";
            }
            else { // scroll vers le bas
                if (top + scroll < 0) { // empêche le menuG de descendre plus bas que le premier élément de la liste
                    //menuG.style.top = (top - scroll) + "px";
                }
                menu.style.top = (top - scroll) + "px";
            }
        }


        // pour replacer le menuG après scroll automatique car requestAnimationFrame ne permet pas que les conditions
        // de limitation de scroll s'appliquent dans scrollMenu et le menuG peut disparaître

        function scrollMenuInverse() {
            //console.log("scroll menuG inversé");
            // on arrêt d'abord les animationsFrame
            if (menuG.requestAnimationMenu) {
                window.cancelAnimationFrame(menuG.requestAnimationMenu);
                menuG.requestAnimationMenu = undefined;
            }
            let scroll=10;
            let menu=document.getElementById("searchContainer_liste_ul");
            let top = parseInt(getComputedStyle(menu, null).top);
            let height = parseInt(getComputedStyle(menu, null).height);

            //if (height>800 && parseInt(height-Math.abs(top)) < 400) { // si le menuG dépasse la hauteur du container et que son dernier élément
            if (height>800 && height-Math.abs(top) < 800) { // si le menuG dépasse la hauteur du container et que son dernier élément
                //est à moins de 800px de la ligne du container
                menu.style.top = (top + scroll) + "px";  // scroll vers le bas
                menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                    requestAnimationScrollMenuInverse();
                });
            }
            if (height<=800 && top<-11) { // si le menuG dépasse la hauteur du container et que son dernier élément
                //est à moins de sa propre hauteur de la ligne du container
                menu.style.top = (top + scroll) + "px";  // scroll vers le bas
                menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                    requestAnimationScrollMenuInverse();
                });
            }

            if (top>0) { // si le haut du menuG est plus bas que le haut du container
                menu.style.top = (top - scroll) + "px"; // scroll vers le haut
                menuG.requestAnimationMenu = window.requestAnimationFrame(function () {
                    requestAnimationScrollMenuInverse();
                });
            }
        }

        function requestAnimationScrollMenuInverse() {
            scrollMenuInverse();
        }

        //  menuG.addEventListener("touchstart", touchStart, false);
        //  menuG.addEventListener("touchend", touchUp, false);
        //  menuG.addEventListener("touchmove", touchMove, false);
        menu.addEventListener("touchstart", touchStart, {passive: true});
        menu.addEventListener("touchend", touchUp, {passive: true});
        menu.addEventListener("touchmove", touchMove, {passive: true});
    },

    addSearchListener : function() {
        // -------------------- LISTENER DU CLAVIER ------------------------------
        let touches = document.getElementsByClassName("toucheClavier");
        let lg = touches.length;
        for (let i=0; i<lg; i++) {
            touches[i].addEventListener("click", function(e) {
                track.addClavierInteraction();
                //let touche = e.target.id;
                let touche = e.target.getAttribute("data-value");
                let innerTxt = document.getElementById('textSearch').value;
                //console.log('innerTxt : ' + innerTxt);
                if (touche === "suppr") {
                    innerTxt = innerTxt.toString().slice(0, -1); // on supprime le dernier caractère
                    document.getElementById('textSearch').value = innerTxt;
                } else {
                    document.getElementById('textSearch').value = innerTxt + touche;
                }
                searchAlpha();
                search();
            }, false);
        }

        // pour réinitialiser le clavier
        document.getElementById('clearClavier').addEventListener("click", function() {
            clavier.clearClavier();
            mapG.clearMap();
           // menuG.reduceMenu(menuG.listeStandsMenu);
        }, false);

        // -------------------- LISTENER DU FORMULAIRE ------------------------------

        let inputSearch = document.getElementById("textSearch");
        // à chaque fois qu'une touche de clavier est relachée
        inputSearch.addEventListener("keyup", searchAlpha, false);
        inputSearch.addEventListener("keyup", search, false);

        // pour la recherche sur un terme exact
        // renvoie un stand quand il est seul dans la liste à correspondre au critère demandé
        function search() {
            // récupération du text tapé en majuscule pour uniformiser
            let resultArray = [];
            for (let i = 0; i < menuG.listeStandsMenu.length; i++) {
                // on cherche à savoir si le texte recherché est contenu dans chaque chaîne de la liste des stands
                if (menuG.listeStandsMenu[i].nom.indexOf(inputSearch.value.toUpperCase()) !== -1) {
                    resultArray.push(menuG.listeStandsMenu[i]);
                }
            }
            // à la fin de la boucle, si on est dans le menuG d'une salleLoaded
            // si le tableau contient une seule réponse, c'est la bonne
            if (resultArray.length === 1 && !menuG.isMenuGeneral) {
                track.addMenuInteraction();
               //console.log("find in Menu salleLoaded : " + resultArray[0].name);
                mapG.stand = mapG.getStand(resultArray[0].numero, resultArray[0].nom);
                mapG.animateTranslate();
                menuG.centerMenu(resultArray[0].numero);
            } else if (resultArray.length === 0) {
               //console.log("search : null results");
            }

            // à la fin de la boucle, si on est dans le menuG Paris
            // si le tableau contient une seule réponse, c'est la bonne
            else if (resultArray.length === 1 && menuG.isMenuGeneral) {
                track.addMenuInteraction();
               //console.log("find in Menu Paris: " + resultArray[0].name);
                let standMenu = menuG.getStandMenu(resultArray[0].numero, resultArray[0].nom);
                //console.log(" click and getMap : " + standMenu.nom + " / " + standMenu.salleLoaded + " / " + standMenu.secteur);
                if (menuG.isMenuGeneral) {
                    navigation.showMap();
                }
                mapG.displayNewMap(standMenu.salle, standMenu.secteur);
                menuG.standMenuSearched = standMenu;
            }
        }

        // pour la recherche par ordre alphabétique
        // renvoie un ensemble de stands
        function searchAlpha() {
            utils.redirect(); // mise en place de la redirection en cas d'inactivité
            //console.log("Search Alpha length listeStand Menu : " + length);
            let resultArray = []; // tableau final des résultats
            let resultArrayTemp1 = [];
            let resultArrayTemp2 = [];
            for (let i = 0; i < menuG.listeStandsMenu.length; i++) {
                // on cherche à savoir si le texte recherché est contenu dans chaque chaîne de la liste des stands
                if (menuG.listeStandsMenu[i].nom.indexOf(inputSearch.value.toUpperCase()) !== -1) {
                    // si oui (result renvoie la position de la recherche dans la chaîne, sinon -1)
                    if (menuG.listeStandsMenu[i].nom.indexOf(inputSearch.value.toUpperCase()) === 0) {
                        // ce qui nous intéresse d'abord est la première position (0) pour permettre un classement alphabétique
                        resultArrayTemp1.push(menuG.listeStandsMenu[i]);
                    } else {
                        resultArrayTemp2.push(menuG.listeStandsMenu[i]);
                    }
                }
            }

            if (resultArrayTemp1.length>0) {// on stocke d'abord les valeurs commenceant par la première lettre tapée dans le tableau final des résultats
                for (let i=0; i<resultArrayTemp1.length; i++) {
                    resultArray.push(resultArrayTemp1[i]);
                }
            }

            if (resultArrayTemp2.length>0) {
                for (let i=0; i<resultArrayTemp2.length; i++) {// puis on stocke les autres valeurs dans le tableau final des résultats
                    resultArray.push(resultArrayTemp2[i]);
                }
            }

            // à la fin de la boucle si le tableau final comprend des réponses
            // si on est dans le menuG d'une salleLoaded
            if (resultArray.length !== 0 && !menuG.isMenuGeneral) {
                //console.log("search alphabetical in salleLoaded");
                for (let j= 0; j<resultArray.length; j++) {
                    // il faut vérifier au préalable qu'ils appartiennt à la même salleLoaded
                    // car seuls les items de la salleLoaded sont affichés dans le menuG
                    // or resulatArray se base sur les items de l'ensemble des salles
                    if (resultArray[j].salle === mapG.map.salle) {
                        //console.log("find : " + resultArray[j].numero);
                        menuG.reduceMenu(resultArray); // on réduit le menuG
                        menuG.centerMenu(resultArray[j].numero);// on centre sur le premier numéro trouvé
                        // on arrête la boucle après avoir trouvé le premier
                        break;
                    }
                }
            }
            // si on est dans le menuG Paris
            else if (resultArray.length !== 0 && menuG.isMenuGeneral) {
                //console.log("search alphabetical in menuG Paris");
                //console.log("find : " + resultArray[0].numero);
                menuG.reduceMenu(resultArray); // on réduit la liste du menuG
                menuG.centerMenu(resultArray[0].numero);// on centre sur le premier numéro trouvé
            }
        }
    },

    loadMenuGeneral : function() {
        menuG.parseCsvListeStandsMenu(menuG.csvFile, menuG.cbOnLoadMenuGeneral);
    },

    cbOnLoadMenuGeneral : function() {
        const list = document.getElementById("searchContainer_liste_ul");
        while (list.hasChildNodes()) { // on enlève au préalables les anciennes listes si il y en a
            list.removeChild(list.firstChild);
        }
        for (let i= 0; i < menuG.listeStandsMenu.length ; i++) {
            const newLi = document.createElement('li');
            newLi.id = menuG.listeStandsMenu[i].numero;
            menuG.attributeClass(menuG.listeStandsMenu[i].secteur, menuG.listeStandsMenu[i].genre, newLi);
            newLi.innerText = menuG.listeStandsMenu[i].nom;
            newLi.addEventListener("click", (e)=> {
                track.addMenuInteraction();
                utils.redirect();
                //console.log("click id : " + e.target.id + " / nom : " + e.target.innerText);
                if (e.target.id !== "") {
                    const standMenu = menuG.getStandMenu(e.target.id, e.target.innerText);
                    // console.log(standMenu.numero + " / " + standMenu.nomStand);
                    //console.log(" click and mapG.displayNewMap : " + standMenu.nom + " / " + standMenu.salleLoaded + " / " + standMenu.secteur);
                    clavier.clearClavier();
                    if (menuG.isMenuGeneral) {
                        navigation.showMap();
                    }
                    mapG.displayNewMap(standMenu.salle, standMenu.secteur);
                    menuG.standMenuSearched = standMenu;
                }
            }, false);
            document.getElementById('searchContainer_liste_ul').appendChild(newLi);
        }
    },

    loadMenuSalle : function () {
        menuG.parseCsvListeStandsMenu(menuG.csvFile, menuG.cbOnLoadMenuSalle);
    },

    cbOnLoadMenuSalle : function () {
        //console.log("cbOnLoadMenuSalle");
        const list = document.getElementById("searchContainer_liste_ul");
        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
        for (let i= 0; i < menuG.listeStandsMenu.length; i++) {
            // on ne va garder que ceux de la salleLoaded en question
            if (menuG.listeStandsMenu[i].salle.toString() === mapG.map.salle.toString()) {
                //console.log("isteStandsMenu["+i+"].salleLoaded :" + menuG.listeStandsMenu[i].salleLoaded + "/ salleLoaded :" + mapG.map.salle);
                const newLi = document.createElement('li');
                newLi.id = menuG.listeStandsMenu[i].numero;
                newLi.innerText = menuG.listeStandsMenu[i].nom + " | " + menuG.listeStandsMenu[i].numero+ " |";
                menuG.attributeClass(menuG.listeStandsMenu[i].secteur, menuG.listeStandsMenu[i].genre, newLi);
                newLi.addEventListener("click", (e)=> {
                    utils.redirect();
                    clavier.clearClavier();
                    mapG.stand = mapG.getStand(e.target.id);
                    mapG.animateTranslate();
                    menuG.centerMenu(e.target.id);
                }, false);
                document.getElementById('searchContainer_liste_ul').appendChild (newLi);
            }
            else {
                //console.log("no same salleLoaded found");
             }
        }
        menuG.lastMenuTop = 0;
        if (menuG.standMenuSearched !== null) {
            menuG.centerMenu(menuG.standMenuSearched.numero);
        } else { // sinon on remt le menuG en position 0, par défaut
            document.getElementById("searchContainer_liste_ul").style.top = "0";
        }
        menuG.standMenuSearched = null;
        menuG.isMenuGeneral=false;
    }
};

(function() {
    menuG.addMenuListener();
    menuG.addSearchListener();
})();
