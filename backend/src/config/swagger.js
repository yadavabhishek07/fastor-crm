const swaggerJsDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Fastor CRM REST API',
    version: '1.0.0',
    description:
      'Backend CRM REST API for Fastor Counselor Enquiry Management. Counselors can view unclaimed public leads and claim them atomically into their private list.',
    contact: {
      name: 'Abhishek Yadav',
      email: 'abhishek@fastor.crm'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from /api/auth/login or /api/auth/register'
      }
    },
    schemas: {
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66d0c1e8f1a23b45c67890ab' },
          name: { type: 'string', example: 'Jane Counselor' },
          email: { type: 'string', example: 'jane@fastor.ai' },
          role: { type: 'string', example: 'counselor' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Enquiry: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66d0c1e8f1a23b45c67890ef' },
          name: { type: 'string', example: 'John Student' },
          email: { type: 'string', example: 'john@example.com' },
          phone: { type: 'string', example: '+91 9876543210' },
          courseInterest: { type: 'string', example: 'Full Stack Web Development' },
          notes: { type: 'string', example: 'Interested in weekend batch' },
          status: { type: 'string', enum: ['unclaimed', 'claimed'], example: 'unclaimed' },
          claimedBy: { type: 'string', nullable: true, example: null },
          claimedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'System health check',
        tags: ['Health'],
        responses: {
          200: {
            description: 'API is running healthy'
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new employee/counselor',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Counselor' },
                  email: { type: 'string', example: 'jane@fastor.ai' },
                  password: { type: 'string', example: 'secret123' },
                  role: { type: 'string', enum: ['counselor', 'admin'], default: 'counselor' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Employee registered successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Employee already registered with this email' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in employee/counselor & get JWT token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'jane@fastor.ai' },
                  password: { type: 'string', example: 'secret123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Login successful with JWT token' },
          401: { description: 'Invalid email or password' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get current logged-in employee profile',
        tags: ['Authentication'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Profile retrieved' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/enquiries': {
      post: {
        summary: 'Public enquiry form submission (No auth needed)',
        tags: ['Public Enquiries'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'courseInterest'],
                properties: {
                  name: { type: 'string', example: 'Alex Morgan' },
                  email: { type: 'string', example: 'alex@example.com' },
                  phone: { type: 'string', example: '+91 9988776655' },
                  courseInterest: { type: 'string', example: 'Full Stack Web Development' },
                  notes: { type: 'string', example: 'Looking to start in November' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Enquiry submitted successfully' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/enquiries/public': {
      get: {
        summary: 'Fetch all unclaimed (public) leads for counselors',
        tags: ['CRM Enquiries'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'course', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of unclaimed public leads' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/enquiries/{id}/claim': {
      post: {
        summary: 'Claim an enquiry (Atomic concurrency safe)',
        tags: ['CRM Enquiries'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Enquiry successfully claimed' },
          404: { description: 'Enquiry not found' },
          409: { description: 'Conflict: Already claimed by another counselor' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/enquiries/mine': {
      get: {
        summary: 'Fetch leads claimed by the logged-in counselor',
        tags: ['CRM Enquiries'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'course', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of leads claimed by logged-in user' },
          401: { description: 'Unauthorized' }
        }
      }
    },
    '/api/enquiries/{id}': {
      get: {
        summary: 'Get single enquiry details by ID',
        tags: ['CRM Enquiries'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Enquiry details' },
          403: { description: 'Forbidden (Private to another counselor)' },
          404: { description: 'Enquiry not found' }
        }
      }
    }
  }
};

module.exports = swaggerJsDoc;
