require("dotenv").config();
const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");

const { getHistory } = require("./src/services/historyService");
const {
  getConversation,
  removeConversationDuplicates,
} = require("./src/services/conversationService");
const { getRental, removeRentalDuplicates } = require(
  "./src/services/rentalService"
);

const app = express();
const port = process.env.PORT || 3000;

app.get("/history", async (req, res) => {
  try {
    const history = await getHistory();
    res.json(history);
  } catch (error) {
    console.error("Erro ao buscar histórico", error);
    res.status(500).json({ message: "Erro ao buscar registros de history." });
  }
});

app.get("/conversation", async (req, res) => {
  try {
    const conversation = await getConversation();
    res.json(conversation);
  } catch (error) {
    console.error("Erro ao buscar conversation", error);
    res
      .status(500)
      .json({ message: "Erro ao buscar registros de conversation." });
  }
});

app.get("/rental", async (req, res) => {
  try {
    const rental = await getRental();
    res.json(rental);
  } catch (error) {
    console.error("Erro ao buscar rental", error);
    res.status(500).json({ message: "Erro ao buscar registros de rental." });
  }
});

app.post("/rental/deduplicate", async (req, res) => {
  try {
    const result = await removeRentalDuplicates();
    res.json(result);
  } catch (error) {
    console.error("Erro ao remover duplicatas de rental", error);
    res.status(500).json({ message: "Erro ao remover duplicatas de rental." });
  }
});

app.post("/conversation/deduplicate", async (req, res) => {
  try {
    const result = await removeConversationDuplicates();
    res.json(result);
  } catch (error) {
    console.error("Erro ao remover duplicatas de conversation", error);
    res
      .status(500)
      .json({ message: "Erro ao remover duplicatas de conversation." });
  }
});

const startServer = () => {
  const useHttps = process.env.SSL_ENABLED === "true";

  if (useHttps) {
    try {
      const keyPath = process.env.SSL_KEY_PATH;
      const certPath = process.env.SSL_CERT_PATH;

      if (!keyPath || !certPath) {
        throw new Error(
          "SSL_KEY_PATH e SSL_CERT_PATH devem ser definidos quando SSL está habilitado."
        );
      }

      const httpsOptions = {
        key: fs.readFileSync(path.resolve(process.cwd(), keyPath)),
        cert: fs.readFileSync(path.resolve(process.cwd(), certPath)),
      };

      https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`Servidor HTTPS iniciado na porta ${port}`);
      });
      return;
    } catch (error) {
      console.error(
        "Não foi possível iniciar com HTTPS. Iniciando em HTTP.",
        error
      );
    }
  }

  app.listen(port, () => {
    console.log(`Servidor HTTP iniciado na porta ${port}`);
  });
};

startServer();
