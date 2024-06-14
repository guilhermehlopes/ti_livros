// Importação dos módulos necessários
const fs = require('fs');
const { MongoClient } = require('mongodb');
const random = require('random');
const path = require('path');

// Parâmetros de conexão
const conn_uri = "mongodb://localhost:27017/";
const db_name = "livros";

// Função principal
const importCSV = async () => {
  const client = new MongoClient(conn_uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const start = Date.now();

    // Conexão ao MongoDB
    await client.connect();
    console.log("Conectado ao MongoDB");

    // Seleção do banco de dados e coleção
    const db = client.db(db_name);
    const collection = db.collection("livro");

    // Caminho para o arquivo CSV
    const csvFilePath = path.join(__dirname, 'livros.csv');
    
    // Leitura do arquivo CSV
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

        // Adicionando o livro na coleção
        await collection.insertOne(livro);
      }
    }

    const end = Date.now();
    const time_taken = (end - start) / 1000;

    // Impressão do tempo de processamento
    console.log(`Tempo de processamento: ${time_taken} segundos`);
  } catch (e) {
    console.error("Ocorreu um erro:", e);
  } finally {
    await client.close();
  }
};

// Executa a função principal
importCSV();
