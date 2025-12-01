const express = require('express');
const router = express.Router();
const { models } = require('../db');
const { Task: TaskModel, User: UserModel } = models;

// POST /tasks - Új feladat létrehozása
router.post('/', async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    // Ellenőrizzük a kötelező mezőket
    if (!title || !userId) {
      return res.status(400).json({ error: 'A "title" és "userId" mezők kitöltése kötelező.' });
    }

    // Ellenőrizzük, hogy létezik-e a felhasználó
    const user = await UserModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'A megadott userId-val nem található felhasználó.' });
    }
    const newTask = await TaskModel.create({ title, description, userId });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Hiba az új feladat létrehozásakor:', error);
    res.status(500).json({ error: 'Szerveroldali hiba.' });
  }
});

// GET /tasks - Összes feladat lekérdezése
router.get('/', async (req, res) => {
  try {
    // A feladatokhoz csatoljuk a hozzájuk tartozó felhasználó adatait is
    const tasks = await TaskModel.findAll({ include: 'user' });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladatok lekérdezésekor.' });
  }
});

// GET /tasks/page/:page - Feladatok lekérdezése lapozással (max 20)
router.get('/page/:page', async (req, res) => {
  try {
    const page = parseInt(req.params.page, 10);
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: 'Érvénytelen oldalszám.' });   
    }

    const limit = 5;
    const offset = (page - 1) * limit;

      const { rows: tasks, count } = await TaskModel.findAndCountAll({
      limit: limit,
      offset: offset,
      include: 'user' // A felhasználó adatait is hozzácsatolja
    });
    res.json({ tasks, totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ error: 'Hiba a feladatok lapozott lekérdezésekor.' });
  }
});

// DELETE /tasks/:id - Feladat törlése ID alapján
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params; // ID kinyerése az URL paraméterből
    const task = await TaskModel.findByPk(id); // Feladat megkeresése az elsődleges kulcs (ID) alapján

    // Ellenőrizzük, hogy létezik-e a feladat
    if (!task) {
      // Ha nincs ilyen feladat, 404-es (Not Found) hibát küldünk
      return res.status(404).json({ error: 'A megadott ID-val nem található feladat.' });
    }

    await task.destroy(); // Feladat törlése az adatbázisból

    // Sikeres törlés esetén 200 (OK) státuszt és egy megerősítő üzenetet küldünk.
    res.status(200).json({ message: `A(z) ${id} ID-jú feladat sikeresen törölve.` });
  } catch (error) {
    console.error('Hiba a feladat törlésekor:', error);
    res.status(500).json({ error: 'Szerveroldali hiba a törlés során.' });
  }
});

module.exports = router;
