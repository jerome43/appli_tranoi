const partenaires = {

    addPartenairesListener : function (element) {
          if (element.hasChildNodes()) {
            let childNode = element.lastElementChild;
            while (childNode) {
                childNode.addEventListener("click", (e)=> {
                    partenaires.clickLogoPartenaire(e);
                }, false);
                childNode = childNode.previousElementSibling;
            }
        }
    },

    clickLogoPartenaire : function (e) {
        track.addPartenaireInteraction();
        utils.redirect();
        let id = e.target.id;
        let nom = e.target.dataset.name;
        //console.log("click :", id, " / ", nom);
        if (id !== "" && id.length >3 && nom !=="") {
            id = id.toString().slice(0, -3); // on supprime les trois derniers caractères
            menuG.standMenuSearched = menuG.getStandMenu(id, nom);
         if (menuG.isMenuGeneral) {
             navigation.showMap();
         }
            mapG.displayNewMap(menuG.standMenuSearched.salle, menuG.standMenuSearched.secteur);
            clavier.clearClavier();
        }
    }
};
(function() {
    partenaires.addPartenairesListener(document.getElementById("mapContainer_designers"));
    partenaires.addPartenairesListener(document.getElementById("partenaires"));
})();