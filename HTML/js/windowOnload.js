
window.onload = function() {
    addJs("js/d3.min.js");
    addJs("js/d3.js");
}

function addJs(jsName) {
    var jsFile = document.createElement("script");
    jsFile.setAttribute("type","text/javascript");
    jsFile.setAttribute("src", jsName);
    document.getElementsByTagName("head")[0].appendChild(jsFile)
}
