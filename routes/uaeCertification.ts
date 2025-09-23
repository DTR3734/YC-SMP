import { Router } from 'express';
import { uaeCertificationHandler } from '../services/uaeCertificationService.server';

const router = Router();

router.get('/uae-certification', uaeCertificationHandler);

export default router;
