const express = require('express');
const multer = require('multer');

const { handleErrors, redirectAnonymous } = require('./middlewares');
const productsRepo = require('../../repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const productsIndexTemplate = require('../../views/admin/products/index');
const productsEditTemplate = require('../../views/admin/products/edit');
const { requireTitle, requirePrice } = require('./validators');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/admin/products',
    redirectAnonymous,
    async (req, res) => {
        const products = await productsRepo.getAll();
        res.send(productsIndexTemplate({ products }));
    }
)

router.get('/admin/products/new',
    redirectAnonymous,
    (req, res) => {
        res.send(productsNewTemplate({}));
    }
)

router.post('/admin/products/new',
    redirectAnonymous,
    upload.single('image'),
    [requireTitle, requirePrice],
    handleErrors(productsNewTemplate),
    async (req, res) => {
        let image = "";
        try {
            image = req.file.buffer.toString('base64');
        } catch {
            
        }
        const { title, price } = req.body;

        await productsRepo.create({ title, price, image });
        
        res.redirect('/admin/products');
    }
)

router.get('/admin/products/:id/edit',
    redirectAnonymous,
    async (req, res) => {
        const product = await productsRepo.getOne(req.params.id);
        if (product) {
            res.send(productsEditTemplate({ product }));
        }
        res.send('No product found!');
    }
)

router.post('/admin/products/:id/edit',
    redirectAnonymous,
    upload.single('image'),
    [requireTitle, requirePrice],
    handleErrors(productsEditTemplate, async (req) => {
        const product = await productsRepo.getOne(req.params.id);
        return { product };
    }),
    async (req, res) => {
        const changes = req.body;

        if (req.file) {
            changes.image = req.file.buffer.toString('base64');
        }

        try {
            await productsRepo.update(req.params.id, changes);
        } catch (err) {
            return res.send('Could not find product!');
        }

        res.redirect('/admin/products');
    }
)

router.post('/admin/products/:id/delete',
    redirectAnonymous,
    async (req, res) => {
        await productsRepo.delete(req.params.id);

        res.redirect('/admin/products');
    }
)

module.exports = router;