const express = require('express');
const multer = require('multer');
let pdfParse = require('pdf-parse');
if (pdfParse && pdfParse.default) pdfParse = pdfParse.default;
const fs = require('fs');
const path = require('path');
const { query } = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const analysisQueue = require('../jobs/analysisQueue');

const router = express.Router();
const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }

    return cb(null, true);
  },
});

function getUploadedFile(req) {
  if (req.file) {
    return req.file;
  }

  if (Array.isArray(req.files) && req.files.length > 0) {
    return req.files[0];
  }

  if (req.files && Array.isArray(req.files.file) && req.files.file.length > 0) {
    return req.files.file[0];
  }

  if (req.files && Array.isArray(req.files.document) && req.files.document.length > 0) {
    return req.files.document[0];
  }

  return null;
}

router.post('/upload', authMiddleware, upload.any(), async (req, res) => {
  const uploadedFile = getUploadedFile(req);
  let uploadedFilePath = uploadedFile?.path;
  let parser;

  try {
    if (!uploadedFile) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const fileBuffer = fs.readFileSync(uploadedFile.path);
    let extractedText = '';
    try {
      parser = new pdfParse.PDFParse({ data: fileBuffer });
      const parsedPdf = await parser.getText();
      extractedText = parsedPdf && parsedPdf.text ? parsedPdf.text : '';
    } catch (parseErr) {
      console.error('PDF parse error:', parseErr.message || parseErr);
      extractedText = '';
    }
    const filename = `${Date.now()}-${uploadedFile.originalname}`;

    const result = await query(
      'INSERT INTO documents (user_id, filename, original_name, doc_type, raw_text, overall_risk_score, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, status',
      [req.user.id, filename, uploadedFile.originalname, 'pdf', extractedText, 0, 'processing']
    );

    const documentId = result.rows[0].id;
    console.log('Queuing analysis for document', documentId)
    await analysisQueue.add({ documentId, rawText: extractedText })



    return res.status(201).json({
      documentId,
      status: result.rows[0].status,
      message: 'Document uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Failed to upload document' });
  } finally {
    if (parser && typeof parser.destroy === 'function') {
      await parser.destroy();
    }

    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      fs.unlinkSync(uploadedFilePath);
    }
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, filename, original_name, doc_type, overall_risk_score, status, created_at FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Fetch documents error:', error);
    return res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const documentResult = await query(
      'SELECT id, filename, original_name, doc_type, overall_risk_score, status, created_at FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const clausesResult = await query(
      `SELECT id, clause_type, original_text, risk_score, risk_explanation,
              risk_type, severity, suggested_text, negotiation_reasoning, standard_comparison
       FROM clauses
       WHERE document_id = $1
       ORDER BY risk_score DESC`,
      [req.params.id]
    );

    return res.json({
      ...documentResult.rows[0],
      clauses: clausesResult.rows,
    });
  } catch (error) {
    console.error('Fetch document error:', error);
    return res.status(500).json({ message: 'Failed to fetch document' });
  }
});

router.get('/:id/status', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, status, overall_risk_score, doc_type FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch document status error:', error);
    return res.status(500).json({ message: 'Failed to fetch document status' });
  }
});

module.exports = router;
