import pool from '../data/db.js'
import { Router } from 'express'

const router = Router();

router.get('/', async(req,res)=>{
    let sql = `
    SELECT s.id, s.nev, s.tanar, s.nap, s.max_letszam AS maxLetszam, COUNT(DISTINCT j.diak_id) AS jelentkezett, s.max_letszam - COUNT(DISTINCT j.diak_id) AS szabadHely 
    FROM szakkorok s 
    LEFT JOIN jelentkezesek j ON s.id = j.szakkor_id  
    GROUP BY s.id, s.nev, s.tanar, s.nap, s.max_letszam 
    ORDER BY FIELD(s.nap, 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'),
    s.nev ASC
`

    const [eredmeny] = await pool.query(sql)

    res.json(eredmeny)

})


export default router