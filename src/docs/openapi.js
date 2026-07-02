const swaggerUi = require('swagger-ui-express');

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Asynchronous Job Queue API',
    version: '4.0.0',
    description: 'Production API for jobs, DLQ, workers, metrics, health, and admin operations.'
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [
    { name: 'Jobs' },
    { name: 'DLQ' },
    { name: 'Workers' },
    { name: 'Metrics' },
    { name: 'Health' },
    { name: 'Admin' }
  ],
  paths: {
    '/jobs': {
      post: {
        tags: ['Jobs'],
        summary: 'Create a job',
        parameters: [
          { name: 'x-request-id', in: 'header', schema: { type: 'string' } },
          { name: 'x-idempotency-key', in: 'header', schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'payload'],
                properties: {
                  type: { type: 'string' },
                  payload: { type: 'object' },
                  idempotencyKey: { type: 'string' },
                  maxRetries: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Duplicate job returned' },
          201: { description: 'Job created' }
        }
      }
    },
    '/jobs/{id}': {
      get: {
        tags: ['Jobs'],
        summary: 'Get job by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Job details' }, 404: { description: 'Not found' } }
      }
    },
    '/dlq': {
      get: { tags: ['DLQ'], summary: 'List dead-letter jobs', responses: { 200: { description: 'DLQ jobs' } } }
    },
    '/dlq/{id}/retry': {
      post: { tags: ['DLQ'], summary: 'Retry a dead-letter job', responses: { 200: { description: 'Requeued' } } }
    },
    '/dlq/{id}': {
      delete: { tags: ['DLQ'], summary: 'Delete a dead-letter job', responses: { 200: { description: 'Deleted' } } }
    },
    '/workers': {
      get: { tags: ['Workers'], summary: 'List workers', responses: { 200: { description: 'Workers' } } }
    },
    '/metrics': {
      get: { tags: ['Metrics'], summary: 'Dashboard metrics', responses: { 200: { description: 'Metrics summary' } } }
    },
    '/metrics/jobs': {
      get: { tags: ['Metrics'], summary: 'Job metrics', responses: { 200: { description: 'Job metrics' } } }
    },
    '/metrics/workers': {
      get: { tags: ['Metrics'], summary: 'Worker metrics', responses: { 200: { description: 'Worker metrics' } } }
    },
    '/health': {
      get: { tags: ['Health'], summary: 'Health check', responses: { 200: { description: 'Health state' }, 503: { description: 'Down' } } }
    },
    '/admin/jobs': {
      get: { tags: ['Admin'], summary: 'Admin job list', responses: { 200: { description: 'Jobs' } } }
    },
    '/admin/workers': {
      get: { tags: ['Admin'], summary: 'Admin worker list', responses: { 200: { description: 'Workers' } } }
    },
    '/admin/alerts': {
      get: { tags: ['Admin'], summary: 'Admin alerts', responses: { 200: { description: 'Alerts' } } }
    },
    '/admin/statistics': {
      get: { tags: ['Admin'], summary: 'Admin statistics', responses: { 200: { description: 'Statistics' } } }
    }
  }
};

module.exports = { swaggerUi, swaggerSpec };