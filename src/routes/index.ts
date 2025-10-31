import { Router } from 'express';
import authRouter from './auth';
import onboardingRouter from './onboarding';
import qrRouter from './qr';
import publicRouter from './public';
import avisRouter from './avis';
import campaignsRouter from './campaigns';
import menuRouter from './menu';
import copilotRouter from './copilot';
import dashboardRouter from './dashboard';
import reservationsRouter from './reservations';
import feedbackRouter from './feedback';
import waitlistRouter from './waitlist';
import emailRouter from './email';

const router = Router();

router.use('/auth', authRouter);
router.use('/onboarding', onboardingRouter);
router.use('/qr', qrRouter);
router.use('/avis', avisRouter);
router.use('/campaigns', campaignsRouter);
router.use('/menu', menuRouter);
router.use('/copilot', copilotRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reservations', reservationsRouter);
router.use('/feedback', feedbackRouter);
router.use('/waitlist', waitlistRouter);
router.use('/email', emailRouter);

// Public routes (no auth required)
router.use(publicRouter);

export default router;
