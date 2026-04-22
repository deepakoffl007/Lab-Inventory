require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= TEST ================= */
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

/* ================= RFID SCAN ================= */
app.post("/scan", async (req, res) => {
  const { rfid_uid } = req.body;

  try {
    // check student
    let result = await db.query("SELECT * FROM students WHERE rfid_uid = $1", [
      rfid_uid,
    ]);

    if (result.rows.length > 0) {
      return res.json({ type: "student", data: result.rows[0] });
    }

    // check employee
    result = await db.query("SELECT * FROM employees WHERE rfid_uid = $1", [
      rfid_uid,
    ]);

    if (result.rows.length > 0) {
      return res.json({ type: "employee", data: result.rows[0] });
    }

    res.status(404).json({ message: "RFID not found" });
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= ACTIVE ITEMS ================= */
app.get("/active", async (req, res) => {
  try {
    const result = await db.query(`
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
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= ISSUE ================= */
app.post("/issue", async (req, res) => {
  const { student_id, employee_id, equipment_id, project_id, handled_by } =
    req.body;

  try {
    await db.query(
      `INSERT INTO transactions 
      (student_id, employee_id, equipment_id, project_id, issue_time, status, handled_by)
      VALUES ($1, $2, $3, $4, NOW(), 'IN_USE', $5)`,
      [
        student_id || null,
        employee_id || null,
        equipment_id,
        project_id,
        handled_by,
      ],
    );

    await db.query(
      `UPDATE equipment 
       SET available_quantity = available_quantity - 1
       WHERE equipment_id = $1`,
      [equipment_id],
    );

    res.json({ message: "Equipment Issued" });
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= RETURN ================= */
app.post("/return", async (req, res) => {
  const { transaction_id, condition } = req.body;

  try {
    const result = await db.query(
      `UPDATE transactions 
       SET return_time = NOW(),
           status = 'RETURNED',
           condition_on_return = $1
       WHERE transaction_id = $2
       RETURNING equipment_id`,
      [condition, transaction_id],
    );

    const equipment_id = result.rows[0].equipment_id;

    await db.query(
      `UPDATE equipment 
       SET available_quantity = available_quantity + 1
       WHERE equipment_id = $1`,
      [equipment_id],
    );

    res.json({ message: "Equipment Returned" });
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= STUDENT HISTORY ================= */
app.get("/student/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query(
      `SELECT 
        e.name AS equipment,
        p.project_name,
        t.issue_time,
        t.return_time,
        t.status
      FROM transactions t
      JOIN equipment e ON t.equipment_id = e.equipment_id
      JOIN projects p ON t.project_id = p.project_id
      WHERE t.student_id = $1
      ORDER BY t.issue_time DESC`,
      [id],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= STATS ================= */
app.get("/stats", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM equipment) AS total_types,
        (SELECT SUM(total_quantity) FROM equipment) AS total_items,
        (SELECT SUM(available_quantity) FROM equipment) AS available_items,
        (SELECT COUNT(*) FROM transactions WHERE status = 'IN_USE') AS borrowed_items
    `);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});
app.post("/login", async (req, res) => {
  const { username, password, role } = req.body; // 👈 role comes from frontend

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // password check
    if (user.password_hash !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 🔥 ROLE CHECK (IMPORTANT)
    if (user.role !== role) {
      return res.status(403).json({ message: "Access denied for this login" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
