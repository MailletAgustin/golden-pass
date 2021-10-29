const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const uri = 'mongodb+srv://admin:5WKcfdvGZrpAVJj8@cluster0.frc5d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
}).catch(err => console.log(err));
mongoose.connection.once('open', () => {
    console.log('Conexion a la base de datos creada con exito');
});

var UsuarioSchema = mongoose.Schema({
    email: String,
    pass: String,
    role: String,
    qrPath: String,
    data: {},
    sessionToken: String,
});



exports.Usuario = mongoose.model("Usuario", UsuarioSchema);