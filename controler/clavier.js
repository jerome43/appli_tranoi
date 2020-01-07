/**
 * les fonctions liées au clavier
 */

const clavier = {
    clearClavier: function() {
        utils.redirect(); // mise en place de la redirection en cas d'inactivité
        document.getElementById('textSearch').value = "";
        menuG.reduceMenu(menuG.listeStandsMenu);    // on réaffiche d'abord l'ensembles des stands dans le menuG
        document.getElementById("searchContainer_liste_ul").style.top = "0"; // on remet le menuG au début de la liste
        menuG.lastMenuTop = 0;
    }
};