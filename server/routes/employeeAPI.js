const express = require('express');
const Employee = require('../models/Employees');  // attention au pluriel et chemin

const router = express.Router();

// Ajouter un employé
router.post('/', async (req, res) => {
    try {
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).send(employee);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Lister tous les employés
router.get('/', async (req, res) => {
    try {
const employees = await Employee.find();
    res.send(employees);
    } catch (err) {
res.status(500).send(err.message);
    }
});

module.exports = router;
