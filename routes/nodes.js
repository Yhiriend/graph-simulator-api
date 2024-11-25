const express = require("express");
const router = express.Router();
const db = require("../db");

// Ruta para guardar un array de nodos en una tabla dinámica
router.post("/update-vertices", (req, res) => {
  const { vertices } = req.body; // Arreglo de registros con id, x, y

  if (!Array.isArray(vertices) || vertices.length === 0) {
    return res.status(400).json({
      error: "El cuerpo de la solicitud debe incluir un arreglo de vértices.",
    });
  }

  // Iniciar la transacción
  db.beginTransaction((err) => {
    if (err) {
      console.error("Error al iniciar la transacción:", err);
      return res.status(500).json({ error: "Error al iniciar la transacción" });
    }

    // Ejecutar cada consulta de actualización
    const updatePromises = vertices.map((vertex) => {
      return new Promise((resolve, reject) => {
        const query = `UPDATE vertices SET x = ?, y = ? WHERE id = ?`;
        db.query(query, [vertex.x, vertex.y, vertex.id], (err, result) => {
          if (err) {
            return reject(err);
          }
          resolve(result);
        });
      });
    });

    // Procesar todas las consultas
    Promise.all(updatePromises)
      .then(() => {
        // Hacer commit de la transacción
        db.commit((err) => {
          if (err) {
            console.error("Error al hacer commit:", err);
            return db.rollback(() => {
              res.status(500).json({ error: "Error al hacer commit" });
            });
          }

          // Respuesta exitosa
          res
            .status(200)
            .json({ message: "Vértices actualizados correctamente." });
        });
      })
      .catch((err) => {
        console.error("Error al actualizar vértices:", err);
        db.rollback(() => {
          res.status(500).json({ error: err.message });
        });
      });
  });
});

router.get("/graph", (req, res) => {
  // Consultar los nodos de la tabla 'vertices'
  const queryNodes = `SELECT * FROM vertices`;
  db.query(queryNodes, (err, nodeResults) => {
    if (err) {
      console.error("Error al obtener los nodos:", err);
      return res.status(500).json({ error: "Error al obtener los nodos" });
    }

    // Consultar los edges de la tabla 'aristas'
    const queryEdges = `SELECT * FROM aristas`;
    db.query(queryEdges, (err, edgeResults) => {
      if (err) {
        console.error("Error al obtener los edges:", err);
        return res.status(500).json({ error: "Error al obtener los edges" });
      }

      // Devolver los nodos y edges juntos en la respuesta
      console.log({ nodeResults, edgeResults });
      res.json({
        nodes: nodeResults, // Nodos obtenidos
        edges: edgeResults, // Edges obtenidos
      });
    });
  });
});

module.exports = router;
