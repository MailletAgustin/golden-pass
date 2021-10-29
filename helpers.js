const { fstat } = require("fs");
const qr = require("qr-image");

function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

exports.CrearQr = function crearQr(finalPath, role, id) {
  var qr_png = qr.image("192.168.0.107:3000/qr/" + role + "/" + id, { type: "png" });
  qr_png.pipe(require("fs").createWriteStream("qr.png"));
  require("fs").mkdir('public_html/' + finalPath, (e) => {
    if (e) {
      console.log(e);
    }
  });
  require("fs").rename("qr.png", 'public_html/' + finalPath + "/qr.png", (e) => {
    if (e) {
      console.log(e);
      return false;
    } else {
      return true;
    }
  });
  return false;
};

exports.CrearSesion = function CrearSesion() {
  return generateUUID();
};
