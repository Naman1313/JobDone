import { Router } from 'express';
import {
    getJobs,
    createJob,
    applyToJob,
    getJobApplicants,
    hireWorker,
    getClientJobs,
    getWorkerApplications
} from '../controllers/jobController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

// Public / Authenticated discovery
router.get('/', protect, getJobs);

// Client only actions
router.get('/client', protect, restrictTo('client'), getClientJobs);
router.post('/', protect, restrictTo('client'), createJob);
router.get('/:id/applicants', protect, restrictTo('client'), getJobApplicants);
router.post('/:id/hire/:workerId', protect, restrictTo('client'), hireWorker);

// Worker only actions
router.get('/worker/applications', protect, restrictTo('worker'), getWorkerApplications);
router.post('/:id/apply', protect, restrictTo('worker'), applyToJob);

export default router;
