import pool from '../data/db.js'
import { Router } from 'express'

const router = Router();

router.get('/', async(req,res)=>{

    const {nap,vanHely} = req.query
    const parameterek = [];

    let sql = `
    SELECT s.id, s.nev, s.tanar, s.nap, s.max_letszam AS maxLetszam, COUNT(DISTINCT j.diak_id) AS jelentkezett, s.max_letszam - COUNT(DISTINCT j.diak_id) AS szabadHely 
    FROM szakkorok s 
    LEFT JOIN jelentkezesek j ON s.id = j.szakkor_id  
    
`

    if(nap){
        sql+= 'WHERE s.nap = ?'
        parameterek.push(nap);
    }

    sql += ' GROUP BY s.id,s.nev,s.tanar,s.nap,s.max_letszam'


    if (vanHely === 'true') {
    sql += ' HAVING szabadHely > 0';
    }

    sql += `
    ORDER BY FIELD(s.nap, 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'),
    s.nev ASC
`

    const [eredmeny] = await pool.query(sql, parameterek)

    res.json(eredmeny)

})

router.get('/:id', async(req,res)=>{
    const id = Number(req.params.id)

    const sql1 = `
    SELECT s.id AS szakkorId, s.nev AS szakkorNev, s.tanar, s.nap, s.max_letszam AS maxLetszam, d.id AS diakId, d.nev AS diakNev, d.osztaly, j.datum AS jelentkezett 
    FROM szakkorok s
    LEFT JOIN jelentkezesek j ON s.id = j.szakkor_id
    LEFT JOIN diakok d ON j.diak_id = d.id
    WHERE s.id = ?
    ORDER BY d.nev ASC
`

    const [eredmeny] = await pool.query(sql1, [id])

    if (eredmeny.length === 0) {
        return res.status(404).json({ uzenet: 'Szakkör nem található!' });
    }

    const szakkor = {
        id: eredmeny[0].szakkorId,
        nev: eredmeny[0].szakkorNev,
        tanar: eredmeny[0].tanar,
        nap: eredmeny[0].nap,
        maxLetszam: eredmeny[0].maxLetszam,
        diakok: eredmeny
            .filter(d => d.diakId !== null)
            .map(d => ({
                id: d.diakId,
                nev: d.diakNev,
                osztaly: d.osztaly,
                jelentkezett: d.jelentkezett
            }))
    };

    res.json(szakkor)
})

export default router