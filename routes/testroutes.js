const express = require ("express");
const router = express.Router();
router.get('/', (req, res)=>{
    res.json({
        'message': 'hore',
        'status': 'tes berhasil'
    })
})
router.get('/tes', (req, res)=>{
    res.send ('tes berhasil');
});
module.exports = router;