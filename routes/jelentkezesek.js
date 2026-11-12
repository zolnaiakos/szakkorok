import pool from '../data/db.js'
import { Router } from 'express'

const router = Router();

router.post('/', async(req,res)=>{
    //hibakezelésekhez AI segítségét használtam
    const {diakId, szakkorId} = req.body;

    const hibak = []

    if (!Number.isInteger(diakId) || diakId <= 0) {
    hibak.push('A diakId pozitív egész szám kell legyen!');
    }

    if (!Number.isInteger(szakkorId) || szakkorId <= 0) {
    hibak.push('A szakkorId pozitív egész szám kell legyen!');
    }

    if (hibak.length > 0) {
    return res.status(400).json({ hibak });
    }

    const [diak] = await pool.query(
        'SELECT * FROM diakok WHERE id = ?',
        [diakId]
    );

    if (diak.length === 0) {
        return res.status(404).json({ uzenet: 'Diák nem található' });
    }

    const [szakkor] = await pool.query(
        'SELECT * FROM szakkorok WHERE id = ?',
        [szakkorId]
    );

    if (szakkor.length === 0) {
        return res.status(404).json({ uzenet: 'Szakkör nem található' });
    }

    const [jelentkezes] = await pool.query(
    'SELECT * FROM jelentkezesek WHERE diak_id = ? AND szakkor_id = ?',
    [diakId, szakkorId]
    );

    if (jelentkezes.length > 0) {
    return res.status(409).json({
        uzenet: 'A sakk szakkör betelt'
    });
    }

    const [letszam] = await pool.query(
    `SELECT COUNT(*) AS jelentkezettek
     FROM jelentkezesek
     WHERE szakkor_id = ?`,
    [szakkorId]
    );

    if (letszam[0].jelentkezettek >= szakkor[0].max_letszam) {
    return res.status(409).json({
        uzenet: 'A szakkör betelt!'
    });
    }

    const [utkozes] = await pool.query(`
    SELECT s.nev, s.nap
    FROM jelentkezesek j
    JOIN szakkorok s ON j.szakkor_id = s.id
    WHERE j.diak_id = ?
    AND s.nap = ?
`,  [diakId, szakkor[0].nap]);

    if (utkozes.length > 0) {
    return res.status(409).json({
        uzenet: `${diak[0].nev}-nak/ ${utkozes[0].nap} már van szakköre: ${utkozes[0].nev}`
    });
    }

    const [beszuras] = await pool.query(
        'INSERT INTO jelentkezesek (diak_id, szakkor_id, datum) VALUES (?, ?, CURDATE())',
        [diakId, szakkorId]
    );

    const sql = `
        SELECT j.diak_id AS diakId, j.szakkor_id AS szakkorId, j.datum, d.nev AS diak, s.nev AS szakkor, s.nap    
        FROM jelentkezesek j
        JOIN diakok d ON j.diak_id = d.id
        JOIN szakkorok s ON j.szakkor_id = s.id
        WHERE j.diak_id = ? 
`;

    const [eredmeny] = await pool.query(sql, [beszuras.insertId]);

    res.status(201).json(eredmeny[0]);
})

export default router