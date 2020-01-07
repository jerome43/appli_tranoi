window.oncontextmenu = function () {
    //return false;
};

utils.redirect();

mapG.parseXmlListeMap('data/ListeMap.xml', cbOnLoadListeMap);

function cbOnLoadListeMap() {
    mapG.initPhaser();
    menuG.loadMenuGeneral();
}