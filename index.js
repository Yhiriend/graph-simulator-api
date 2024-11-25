require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Crear conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error de conexión a la base de datos:", err);
    process.exit(1);
  }
  console.log("Conectado a la base de datos");
});

// Middlewares
app.use(express.json());

// Endpoints
app.get("/", (req, res) => {
  res.send("Bienvenido a la API de Dijkstra");
});

// Rutas para los datos
const nodesRouter = require("./routes/nodes");
const edgesRouter = require("./routes/edges");
app.use("/api/nodes", nodesRouter);
app.use("/api/edges", edgesRouter);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
