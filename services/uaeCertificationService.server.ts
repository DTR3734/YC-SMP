import { Request, Response } from 'express';

export const uaeCertificationHandler = (req: Request, res: Response) => {
    const mode = req.app.get('mode');
    if (mode === 'uae-certification') {
        res.status(200).json({ message: 'UAE Certification is active.' });
    } else {
        res.status(400).json({ message: 'UAE Certification not available in current mode.' });
    }
};