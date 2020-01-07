/**
 * Les éléments de naivigation : menu du haut et le bouton de retour à l'accueil
 */

const navigation = {

    navHeader : [
        ["PALAIS DE LA BOURSE", ["GROUND FLOOR", "FIRST FLOOR"], ""],
        ["CARROUSEL DU LOUVRE", ["FOYER", "GABRIEL DELORME", "LE NOTRE"], ""]
    ],

    // pour charger le menuG de navigation par salles affectées à un secteur
    loadNavHeader: function(secteur, salle) {
       //console.log('load NavHeader');
        const menuTop_ul = document.getElementById('menuTop_ul');
        while (menuTop_ul.hasChildNodes()) {
            menuTop_ul.removeChild(menuTop_ul.firstChild);
        }
        const menuTop_li_home = document.createElement('li');
        menuTop_li_home.innerText = "HOME";
        menuTop_li_home.id= "buttonHome";
        menuTop_li_home.addEventListener("click", (e)=> {
            navigation.goHome(e);
            }, false);
        menuTop_ul.appendChild(menuTop_li_home);
        const menuTop_li_secteur = document.createElement('li');
        menuTop_li_secteur.innerHTML = secteur.toString();
        switch (secteur) {
            // à activer ou désactiver suivant les cas
               case "CARROUSEL DU LOUVRE" :
                menuTop_li_secteur.innerHTML ="LOUVRE"; // ajouté pour racourcir CARROUSEL DU LOUVRE EN LOUVRE
                break;
            //case "CARREAU DU TEMPLE" :
            //    menuTop_li_secteur.innerHTML ="&nbsp;";  // ajouté pour enlever le doublon de nom salleLoaded
            //    break;
            case "PALAIS DE LA BOURSE" :
               // menuTop_li_secteur.innerHTML ="&nbsp;";// ajouté pour enlever le doublon de nom salleLoaded
                menuTop_li_secteur.innerHTML ="BOURSE";// ajouté pour enlever le doublon de nom salleLoaded
                break;
        }
        menuTop_li_secteur.id = "menuTop_li_secteur";
        menuTop_ul.appendChild (menuTop_li_secteur);

        for (let i=0; i<navigation.navHeader.length; i++) {
           //console.log('load NavHeader : secteur : ' + navigation.navHeader[i][0] + " / " + secteur);
            if (navigation.navHeader[i][0] === secteur) {
                // création des items salles dans le menu de navigation
                for (let j=0; j<navigation.navHeader[i][1].length; j++) {
                    const menuTop_li_salle = document.createElement('li');
                    menuTop_li_salle.id = navigation.navHeader[i][1][j]; // id = le nom de la salle
                    menuTop_li_salle.dataset.secteur = navigation.navHeader[i][0]; // le nom du secteur
                    menuTop_li_salle.innerHTML = navigation.navHeader[i][1][j]; // le nom de la salle
                    if (navigation.navHeader[i][1][j] === salle) {
                        menuTop_li_salle.classList.add("menuTop_li_salle_selected");
                    }
                    menuTop_li_salle.addEventListener("click", (e)=> {
                        track.addNavigationInteraction();
                        utils.redirect();
                        mapG.displayNewMap(e.target.id, e.target.dataset.secteur);
                    }, false);
                    menuTop_ul.appendChild (menuTop_li_salle);
                }
            }
        }
    },

    loadButtonAccueilListener :  function() {
        document.getElementById("logo").addEventListener("click", (e)=> {
            navigation.goHome(e);
            }, false);
    },

    loadThumbmailListener: function () {
        document.getElementById("PALAIS_DE_LA_BOURSE").addEventListener("click", function (e) {
            track.addNavigationInteraction();
            utils.redirect();
            if (menuG.standMenuSearched !== null && menuG.standMenuSearched.secteur === e.target.dataset.secteur) {
                navigation.showMap();
                mapG.displayNewMap(menuG.standMenuSearched.salle, e.target.dataset.secteur);
            } else if (menuG.standMenuSearched !== null && menuG.standMenuSearched.secteur !== e.target.dataset.seceteur) {

            } else {
                navigation.showMap();
                mapG.displayNewMap("GROUND FLOOR", e.target.dataset.secteur); // on charge la map par défaut
            }
        }, false);

        // a activer / désactiver quand carroussel est utilisé ou pas
        /*
         document.getElementById("CARREAU_DU_TEMPLE").addEventListener("click", function(e) {
            track.addNavigationInteraction();
            utils.redirect();
            if (menuG.standMenuSearched.secteur === e.target.dataset.secteur) {
            navigation.showMap();
                mapG.displayNewMap(menuG.standMenuSearched.salle, e.target.dataset.secteur); // on charge la map
            } else if(menuG.standMenuSearched.secteur !== e.target.dataset.secteur) {
                } else {
                navigation.showMap();
                mapG.displayNewMap("CARREAU DU TEMPLE", e.target.dataset.secteur);
            }
            }, false);
         */

        document.getElementById("CARROUSEL_DU_LOUVRE").addEventListener("click", function (e) {
            track.addNavigationInteraction();
            utils.redirect();
            if (menuG.standMenuSearched !== null && menuG.standMenuSearched.secteur === e.target.dataset.secteur) {
                navigation.showMap();
                mapG.displayNewMap(menuG.standMenuSearched.salle, e.target.dataset.secteur); // on charge la nouvelle mapG
            } else if (menuG.standMenuSearched !== null && menuG.standMenuSearched.secteur !== e.target.dataset.secteur) {

            } else {
                navigation.showMap();
                mapG.displayNewMap("FOYER", e.target.dataset.secteur);
            }
        }, false);
    },

    showMap : function (){
        document.getElementById("mapContainer_home").style.display = "none";
        document.getElementById("mapContainer_designers").style.display = "none";
        document.getElementById("menuTop").style.display = "block";
        document.getElementById("mapContainer_phaser").style.display = "block";
    },

    showHome : function (){
        document.getElementById("mapContainer_home").style.display = "block";
        document.getElementById("mapContainer_designers").style.display = "block";
        document.getElementById("menuTop").style.display = "none";
        document.getElementById("mapContainer_phaser").style.display = "none";
    },

    goHome : function(e) {
        track.addNavigationInteraction();
        utils.redirect();
        mapG.clearMap();
        navigation.showHome();
        clavier.clearClavier();
        menuG.listeStandsPartenaires = []; // on remet à 0 la liste des stands car elle va être chargé par à nouveau
        menuG.loadMenuGeneral();
        menuG.isMenuGeneral = true;
    }
};

(function(){
    navigation.loadButtonAccueilListener();
    navigation.loadThumbmailListener();
})();