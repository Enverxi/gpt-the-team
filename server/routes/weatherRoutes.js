import { Router } from 'express';
import { getWeather, searchCities, detectLocation, getStatus } from '../controllers/weatherController.js';

const router = Router();

router.get('/', getWeather);
router.get('/current', getWeather);
router.get('/forecast', getWeather);
router.get('/search', searchCities);
router.get('/detect-location', detectLocation);
router.get('/status', getStatus);

export default router;
