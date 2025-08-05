const express = require('express');
const Employee = require('../models/employees'); // tout en minuscule ici aussi

const router = express.Router();

// POST - Ajouter un employé
router.post('/', async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).send(employee);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// GET - Lister tous les employés
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.send(employees);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
// Supprimer un employé par ID
router.delete('/:id', async (req, res) => {
try {
    const result = await Employee.findByIdAndDelete(req.params.id);
    if (!result) {
    return res.status(404).send('Employé non trouvé');
    }
    res.send('Employé supprimé avec succès');
} catch (err) {
    res.status(500).send(err.message);
}
});
