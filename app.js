const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const db = require("./database");
const helpers = require("./helpers");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const formidable = require('formidable');
const { Formidable } = require("formidable");

app.set("port", process.env.port || 3000);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

app.use("/", express.static(__dirname + "/public_html"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.json());


// Routing
app.get("/usuarios/iniciar-sesion", (req, res, next) => {
  res.render("usuarios/iniciar-sesion");
});
app.post("/usuarios/iniciar-sesion", (req, res, next) => {
  if (req.body.email && req.body.pass) {
    db.Usuario.findOne({ email: req.body.email }, (err, doc) => {
      if (doc) {
        if (doc.pass == req.body.pass) {
          // Crear session token, guardarlo en DB, enviar cookie al usuario y redirigir
          sessionToken = helpers.CrearSesion();
          doc.sessionToken = sessionToken;

          // Si no existe, crear el QR
          fs.exists('public_html/' + doc.qrPath, (exists) => {
            if (!exists) {
              if (helpers.CrearQr(doc.qrPath, doc.role, doc._id)) {
                console.log("asd");
              }
            }
          });

          doc.save();
          res.cookie("sessionToken", sessionToken).redirect("/usuarios/panel");
        } else {
          res.redirect("/usuarios/iniciar-sesion");
        }
      } else {
        res.redirect("/usuarios/iniciar-sesion");
      }
    });
  }
});

app.get("/usuarios/registrarse", (req, res, next) => {
  res.render("usuarios/registrarse");
});

app.post("/usuarios/registrarse", (req, res, next) => {
  if (
    req.body.email &&
    req.body.pass &&
    req.body.passValidation &&
    req.body.claveRegistro
  ) {
    db.Usuario.findOne({ email: req.body.email }, (err, doc) => {
      if (!err && doc) {
        res.redirect("/usuarios/registrarse");
      } else {
        if (req.body.pass == req.body.passValidation) {
          // Alojamiento
          if (req.body.claveRegistro == "65465129") {
            db.Usuario.create({
              role: "alojamiento",
              email: req.body.email,
              pass: req.body.pass,
              qrPath: "qrFolder/" + helpers.CrearSesion(),
              sessionToken: ""
            });
            res.redirect("/usuarios/iniciar-sesion");
          }

          // Comercio
          if (req.body.claveRegistro == "65477987") {
            db.Usuario.create({
              role: "comercio",
              email: req.body.email,
              pass: req.body.pass,
              qrPath: "qrFolder/" + helpers.CrearSesion(),
              sessionToken: ""
            });
            res.redirect("/usuarios/iniciar-sesion");
          }
        }
      }
    });
  }
});

app.get("/usuarios/panel", (req, res, next) => {
  if (req.cookies.sessionToken) {
    db.Usuario.findOne(
      { sessionToken: req.cookies.sessionToken },
      (err, doc) => {
        if (doc) {
          res.render("usuarios/panel", { user: doc });
        } else {
          res.redirect("/usuarios/iniciar-sesion");
        }
      }
    );
  } else {
    res.redirect("/usuarios/iniciar-sesion");
  }
});

app.post("/usuarios/panel", (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    db.Usuario.findOne({_id: fields.id}, (err, doc) => {
      if (doc) {
        doc.data = {
          'name': fields.name,
          'link': fields.link,
          'adress': fields.adress,
        }
        doc.save();
      }
      if (files.logo) {
        fs.rename(files.logo.path, 'public_html/' + doc.qrPath + '/logo.png', (err) => {
          if (err) {console.log(err)}
        });
      }
    })
  });
  res.redirect('/usuarios/panel');
});

app.listen(app.get("port"), (server) => {
  console.info(`Server listen on port ${app.get("port")}`);
});
