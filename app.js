// 1. Importáljuk az Express modult
const express = require('express');

const { Sequelize } = require('sequelize'); // Importáljuk a Sequelize-t

// 2. Létrehozzuk az alkalmazás példányát
const app = express();
//middleware a JSON body-k kezeléséhez
app.use(express.json());

// 3. Beállítunk egy portot, amit a szerver figyelni fog
const PORT = 3000;

// 1. Sequelize Kapcsolat Létrehozása (SQLite fájl)
// Ez automatikusan létrehozza a 'database.sqlite' fájlt.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Az adatbázis fájl neve
  logging: false, // Kikapcsolja a Sequelize SQL logjait
});

// 2. Modell importálása és beállítása
const TaskModel = require('./models/Task')(sequelize); 

// 3. Adatbázis Szinkronizálása és Szerver Indítása
async function initializeApp() {
  try {
    // Kapcsolat ellenőrzése
    await sequelize.authenticate();
    console.log('Adatbázis kapcsolat létrejött.');

    // Táblák létrehozása a modell alapján, ha még nem léteznek.
    // Figyelem: A { force: true } minden indításnál ÚJRAHOZZA a táblákat! 
    // Fejlesztés elején hasznos, éles környezetben SOHA!
    await sequelize.sync({ force: false }); 
    console.log("Minden modell szinkronizálva az adatbázissal.");

    // Szerver indítása
    app.listen(PORT, () => {
      console.log(`A Szerver fut a http://localhost:${PORT} címen.`);
    });

  } catch (error) {
    console.error('Hiba az inicializáláskor:', error);
  }
}

initializeApp();

app.post('/tasks', async (req, res) => {
  try {
    // 1. Kinyerjük a 'task' mezőt a kérés testéből
    const { task } = req.body; 

    // 2. Ellenőrzés: A mező nem lehet üres
    if (!task) {
      return res.status(400).json({ error: 'A feladat szövege hiányzik.' });
    }

    // 3. Sequelize: Új rekord létrehozása a modell alapján
    const newTask = await TaskModel.create({ task: task });

    // 4. Válasz küldése a létrehozott objektummal (HTTP 201 Created)
    res.status(201).json(newTask);
    
  } catch (error) {
    console.error('Hiba az új feladat létrehozásakor:', error);
    res.status(500).json({ error: 'Szerveroldali hiba.' });
  }
});

// 4. Létrehozunk egy egyszerű GET végpontot
// Példa: Összes feladat lekérdezése Sequelize-vel
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await TaskModel.findAll(); // SQL helyett JS metódus!
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladatok lekérdezésekor.' });
  }
});

// 5. Elindítjuk a szervert
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
