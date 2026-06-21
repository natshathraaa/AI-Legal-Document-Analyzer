const Queue = require('bull')
const { runDocumentPipeline } = require('../agents/pipeline')

const analysisQueue = new Queue('document-analysis', process.env.REDIS_URL)

analysisQueue.process(async (job) => {
  const { documentId, rawText } = job.data
  console.log('Queue picked up job for document', documentId)
  await runDocumentPipeline(documentId, rawText)
})

analysisQueue.on('completed', (job) => {
  console.log('Queue job completed for document', job.data.documentId)
})

analysisQueue.on('failed', (job, err) => {
  console.error('Queue job failed for document', job.data.documentId, err.message)
})

module.exports = analysisQueue
