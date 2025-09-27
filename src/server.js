require('dotenv').config();
const express = require('express');

const { getHistory } = require('./services/historyService');
const { getConversation } = require('./services/conversationService');
const { getRental } = require('./services/rentalService');

const app = express();
const port = process.env.PORT || 3000;

app.get('/history', async (req, res) => {
  try {
    const history = await getHistory();
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico', error);
    res.status(500).json({ message: 'Erro ao buscar registros de history.' });
  }
});

app.get('/conversation', async (req, res) => {
  try {
    const conversation = await getConversation();
    res.json(conversation);
  } catch (error) {
    console.error('Erro ao buscar conversation', error);
    res.status(500).json({ message: 'Erro ao buscar registros de conversation.' });
  }
});

app.get('/rental', async (req, res) => {
  try {
    const rental = await getRental();
    res.json(rental);
  } catch (error) {
    console.error('Erro ao buscar rental', error);
    res.status(500).json({ message: 'Erro ao buscar registros de rental.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
