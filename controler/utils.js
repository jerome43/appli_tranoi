const utils = {

    timeoutID : null,

    redirect : function () {
        clearTimeout(utils.timeoutID);
        utils.timeoutID = setTimeout(
            function () {
                navigation.goHome();
            },
            120000);
    }
};