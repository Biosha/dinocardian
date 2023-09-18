import { Router } from 'express';

const routes = Router();

routes.get('/test', (req, res) => {
    console.log(req.body)
  return res.json({ message: 'Hello World' });
});

routes.put('/save', (req, res) => {
    console.log(req.body)
    return res.json({ message: 'Hello World' });
  });

export default routes;