import pool from '../data/db.js'
import { Router } from 'express'

const router = Router();

router.get('/', async(req,res)=>{
    const {osztaly} = req.query

    let sql = `SELECT d.id, d.nev, d.osztaly, COUNT (DISTINCT j.szakkor_id) AS szakkorDb 
    FROM diakok d 
    LEFT JOIN jelentkezesek j ON d.id = j.diak_id
`

    const parameterek = [];

    if(osztaly){
        sql += 'WHERE d.osztaly=?'
        parameterek.push(osztaly)
    }

    sql += 'GROUP BY d.id, d.nev, d.osztaly ORDER BY d.id ASC'

    const [eredmeny] = await pool.query(sql,parameterek)

    res.json(eredmeny);
})

router.get('/szakkor-nelkul', async(req,res)=>{

    let sql = `SELECT d.id, d.nev, d.osztaly 
    FROM diakok d
    LEFT JOIN jelentkezesek j ON d.id = j.diak_id
    WHERE j.diak_id IS NULL
    ORDER BY d.nev ASC
`

    const [eredmeny] = await pool.query(sql)

    res.json(eredmeny)

})

router.get('/:id', async(req,res)=>{
    const id = Number(req.params.id)

    let sql = `
    SELECT d.id AS diakId, d.nev AS diakNev, d.osztaly, s.id AS szakkorId, s.nev AS szakkorNev, s.tanar, s.nap
    FROM diakok d
    LEFT JOIN jelentkezesek j ON d.id = j.diak_id
    LEFT JOIN szakkorok s ON j.szakkor_id = s.id
    WHERE d.id = ?
    ORDER BY s.nev ASC
`
    const [eredmeny] = await pool.query(sql, [id])

    if (eredmeny.length === 0) {
    return res.status(404).json({ uzenet: 'Diák nem található!' });
}

    const diak = {
        id: eredmeny[0].diakId,
        nev: eredmeny[0].diakNev,
        osztaly: eredmeny[0].osztaly,
        szakkorok: eredmeny
            .filter(s => s.szakkorId !== null)
            .map(s => ({
                id: s.szakkorId,
                nev: s.szakkorNev,
                tanar: s.tanar,
                nap: s.nap
            }))
    };

res.json(diak);


})

export default router;