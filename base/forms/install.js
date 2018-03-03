window.forms = {};
window.forms.LoadJS = function (ralativeFullName) {
    var js = document.scripts;
    js = js[js.length - 1].src.substring(0, js[js.length - 1].src.lastIndexOf("/") + 1);
    document.write("<script src='" + js + ralativeFullName + "'><\/script>");
};
//加载JS文件
window.forms.LoadJS("css.js");
window.forms.LoadJS("Wizard.js");
window.forms.LoadJS("Event.js");
window.forms.LoadJS("Map.js");
window.forms.LoadJS("Form.js");

window.forms.LoadJS("Json.js");
window.forms.LoadJS("HttpRequest.js");

window.forms.LoadJS("Controls.js");
window.forms.LoadJS("Converters.js");