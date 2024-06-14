const fs = require('fs');
const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const conn_uri = "mongodb://localhost:27017/";
const db_name = "livros";

const client = new MongoClient(conn_uri, { useNewUrlParser: true, useUnifiedTopology: true });

const importCSV = async () => {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB");

        const db = client.db(db_name);
        const collection = db.collection("livro");

        const csvFilePath = path.join(__dirname, 'livros.csv');
        const data = fs.readFileSync(csvFilePath, 'utf8');
        const lines = data.split('\n');

        for (const line of lines) {
            const livro_info = line.split(';');
            if (livro_info.length === 5) {
                const [titulo, autor, isbn, paginas, ano] = livro_info;
                const valor = parseFloat((Math.random() * (100 - 40) + 40).toFixed(2));

                const livro = {
                    titulo: titulo.replace("'", ""),
                    autor,
                    isbn,
                    paginas: parseInt(paginas),
                    ano: parseInt(ano.replace('\r', '')),
                    valor
                };

                await collection.insertOne(livro);
            }
        }
    } catch (e) {
        console.error("Ocorreu um erro:", e);
    } finally {
        await client.close();
    }
};

// Endpoint para obter livros paginados
app.get('/api/livros', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(db_name);
        const collection = db.collection('livro');

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const livros = await collection.find().skip(skip).limit(limit).toArray();
        const total = await collection.countDocuments();

        res.json({
            livros,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// Servir o frontend estático
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
    importCSV();
});
