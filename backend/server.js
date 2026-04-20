require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DB CONNECTION ================= */

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lab_inventory_system",
});

db.connect((err) => {
  if (err) {
    console.error("DB Connection Failed:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

/* ================= RFID SCAN ================= */
// Used to identify student or employee

app.post("/scan", (req, res) => {
  const { rfid_uid } = req.body;

  const studentQuery = "SELECT * FROM students WHERE rfid_uid = ?";
  const employeeQuery = "SELECT * FROM employees WHERE rfid_uid = ?";

  db.query(studentQuery, [rfid_uid], (err, studentResult) => {
    if (studentResult.length > 0) {
      return res.json({ type: "student", data: studentResult[0] });
    }

    db.query(employeeQuery, [rfid_uid], (err, employeeResult) => {
      if (employeeResult.length > 0) {
        return res.json({ type: "employee", data: employeeResult[0] });
      }

      res.status(404).json({ message: "RFID not found" });
    });
  });
});

/* ================= ISSUE EQUIPMENT ================= */

app.post("/issue", (req, res) => {
  const { student_id, employee_id, equipment_id, project_id, handled_by } =
    req.body;

  const insertQuery = `
    INSERT INTO transactions 
    (student_id, employee_id, equipment_id, project_id, issue_time, status, handled_by)
    VALUES (?, ?, ?, ?, NOW(), 'IN_USE', ?)
  `;

  db.query(
    insertQuery,
    [
      student_id || null,
      employee_id || null,
      equipment_id,
      project_id,
      handled_by,
    ],
    (err) => {
      if (err) return res.status(500).json(err);

      const updateEquipment = `
      UPDATE equipment 
      SET available_quantity = available_quantity - 1
      WHERE equipment_id = ?
    `;

      db.query(updateEquipment, [equipment_id], () => {
        res.json({ message: "Equipment Issued" });
      });
    },
  );
});

/* ================= RETURN EQUIPMENT ================= */

app.post("/return", (req, res) => {
  const { transaction_id, condition } = req.body;

  const updateTransaction = `
    UPDATE transactions
    SET return_time = NOW(),
        status = 'RETURNED',
        condition_on_return = ?
    WHERE transaction_id = ?
  `;

  db.query(updateTransaction, [condition, transaction_id], (err) => {
    if (err) return res.status(500).json(err);

    const getEquipment = `SELECT equipment_id FROM transactions WHERE transaction_id = ?`;

    db.query(getEquipment, [transaction_id], (err, result) => {
      const equipment_id = result[0].equipment_id;

      const updateEquipment = `
        UPDATE equipment 
        SET available_quantity = available_quantity + 1
        WHERE equipment_id = ?
      `;

      db.query(updateEquipment, [equipment_id], () => {
        res.json({ message: "Equipment Returned" });
      });
    });
  });
});

/* ================= ACTIVE BORROWED ITEMS ================= */

app.get("/active", (req, res) => {
  const query = `
    SELECT 
      t.transaction_id,
      s.name AS student_name,
      e.name AS equipment,
      p.project_name,
      t.issue_time
    FROM transactions t
    LEFT JOIN students s ON t.student_id = s.student_id
    JOIN equipment e ON t.equipment_id = e.equipment_id
    JOIN projects p ON t.project_id = p.project_id
    WHERE t.status = 'IN_USE'
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ================= STUDENT HISTORY ================= */

app.get("/student/:id", (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT 
      e.name AS equipment,
      p.project_name,
      t.issue_time,
      t.return_time,
      t.status
    FROM transactions t
    JOIN equipment e ON t.equipment_id = e.equipment_id
    JOIN projects p ON t.project_id = p.project_id
    WHERE t.student_id = ?
    ORDER BY t.issue_time DESC
  `;

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
