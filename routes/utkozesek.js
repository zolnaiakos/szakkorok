import pool from "../data/db.js";
import { Router } from "express";

const router = Router();

router.get('/', async(req,res)=>{

    //sql lekérdezés Ai segítségével készült
    const sql = `
    SELECT
            d.id AS diakId,
            d.nev AS diak,
            s.nap,
            GROUP_CONCAT(DISTINCT s.nev ORDER BY s.nev SEPARATOR '|') AS szakkorok
        FROM diakok d
        JOIN jelentkezesek j ON d.id = j.diak_id
        JOIN szakkorok s ON j.szakkor_id = s.id
        GROUP BY d.id, d.nev, s.nap
        HAVING COUNT(DISTINCT s.id) >= 2
        ORDER BY d.nev ASC
`
    const [eredmeny] = await pool.query(sql);

    res.json(eredmeny.map(d => ({
        diak: d.diak,
        nap: d.nap,
        szakkorok: d.szakkorok.split('|')
    })));
});



export default router