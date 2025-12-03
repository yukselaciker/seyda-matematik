/**
 * Simple test endpoint to verify Vercel Serverless Functions are working
 * 
 * Test by visiting: https://your-domain.vercel.app/api/test
 */

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).json({
        success: true,
        message: '✅ Serverless function is working!',
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
    });
};
