import swaggerJSDoc from 'swagger-jsdoc';
import { Role } from '~/enum/role.enum';
import { Major } from '~/enum/major.enum';
import { StatusAppointment } from '~/enum/statusAppointment.enum';
import { TypeAppointment } from '~/enum/type_appointment.enum';
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GenderCare APIs',
    version: '1.0.0',
    description: 'API documentation for Express.js project with TypeScript and TypeORM',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      Account: {
        type: 'object',
        properties: {
          account_id: { type: 'string', description: 'The account ID (UUID)' },
          full_name: { type: 'string', nullable: true, description: 'The full name of the account' },
          email: { type: 'string', description: 'The email of the account' },
          password: { type: 'string', description: 'The hashed password of the account' },
          phone: { type: 'string', nullable: true, description: 'The phone number of the account' },
          dob: { type: 'string', format: 'date', nullable: true, description: 'Date of birth' },
          gender: { type: 'string', nullable: true, description: 'Gender of the account' },
          avatar: { type: 'string', nullable: true, description: 'URL of the avatar' },
          role: { type: 'string', enum: Object.values(Role), description: 'Role of the account' },
          is_verified: { type: 'boolean', description: 'Verification status' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          refreshToken: { $ref: '#/components/schemas/RefreshToken', description: 'The refresh token associated with the account' },
          menstrualCycle: { $ref: '#/components/schemas/MenstrualCycle', description: 'The menstrual cycle associated with the account' },
          transaction: { type: 'array', items: { $ref: '#/components/schemas/Transaction' }, description: 'List of transactions' },
          blog: { type: 'array', items: { $ref: '#/components/schemas/Blog' }, description: 'List of blogs' },
          consult_appointment: { type: 'array', items: { $ref: '#/components/schemas/ConsultAppointment' }, description: 'List of consult appointments' },
          consultant_pattern: { type: 'array', items: { $ref: '#/components/schemas/ConsultantPattern' }, description: 'List of consultant patterns' },
          laborarity_appointment: { type: 'array', items: { $ref: '#/components/schemas/LaboratoryAppointment' }, description: 'List of laboratory appointments' },
          reply: { type: 'array', items: { $ref: '#/components/schemas/Reply' }, description: 'List of replies' },
          question: { type: 'array', items: { $ref: '#/components/schemas/Question' }, description: 'List of questions' },
        },
        required: ['account_id', 'email', 'password', 'role', 'is_verified', 'created_at', 'updated_at'],
      },
      Laborarity: {
        type: 'object',
        properties: {
          lab_id: { type: 'string', description: 'The laboratory ID (UUID)' },
          name: { type: 'string', description: 'Name of the laboratory test' },
          description: { type: 'string', description: 'Description of the test' },
          price: { type: 'number', description: 'Price of the test' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          laboratoryAppointment: { type: 'array', items: { $ref: '#/components/schemas/LaboratoryAppointment' }, description: 'List of laboratory appointments' },
        },
        required: ['lab_id', 'name', 'description', 'price', 'created_at', 'updated_at'],
      },
      MenstrualCycle: {
        type: 'object',
        properties: {
          cycle_id: { type: 'string', description: 'The menstrual cycle ID (UUID)' },
          start_date: { type: 'string', format: 'date', description: 'Start date of the cycle' },
          end_date: { type: 'string', format: 'date', description: 'End date of the cycle' },
          period: { type: 'integer', description: 'Cycle period in days' },
          note: { type: 'string', nullable: true, description: 'Additional notes' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          customer: { $ref: '#/components/schemas/Account', description: 'The customer associated with the cycle' },
        },
        required: ['cycle_id', 'start_date', 'end_date', 'period', 'created_at', 'updated_at'],
      },
      RefreshToken: {
        type: 'object',
        properties: {
          token_id: { type: 'string', description: 'The refresh token ID (UUID)' },
          token: { type: 'string', description: 'The refresh token string' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          account: { $ref: '#/components/schemas/Account', description: 'The account associated with the token' },
        },
        required: ['token_id', 'token', 'created_at', 'updated_at'],
      },
      Question: {
        type: 'object',
        properties: {
          ques_id: { type: 'string', description: 'The question ID (UUID)' },
          content: { type: 'string', description: 'Content of the question' },
          status: { type: 'boolean', description: 'Status of the question' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          customer: { $ref: '#/components/schemas/Account', description: 'The customer who asked the question' },
          reply: { $ref: '#/components/schemas/Reply', nullable: true, description: 'The reply to the question' },
        },
        required: ['ques_id', 'content', 'status', 'created_at', 'updated_at'],
      },
      Feedback: {
        type: 'object',
        properties: {
          feed_id: { type: 'string', description: 'The feedback ID (UUID)' },
          content: { type: 'string', description: 'Content of the feedback' },
          rating: { type: 'integer', nullable: true, description: 'Rating given' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          consult_appointment: { $ref: '#/components/schemas/ConsultAppointment', description: 'The consult appointment associated with the feedback' },
          laboratoryAppointment: { $ref: '#/components/schemas/LaboratoryAppointment', description: 'The laboratory appointment associated with the feedback' },
        },
        required: ['feed_id', 'content', 'created_at', 'updated_at'],
      },
      Blog: {
        type: 'object',
        properties: {
          blog_id: { type: 'string', description: 'The blog ID (UUID)' },
          major: { type: 'string', enum: Object.values(Major), description: 'Major category of the blog' },
          title: { type: 'string', description: 'Title of the blog' },
          content: { type: 'string', description: 'Content of the blog' },
          status: { type: 'boolean', description: 'Status of the blog' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          account: { $ref: '#/components/schemas/Account', description: 'The account that created the blog' },
        },
        required: ['blog_id', 'major', 'title', 'content', 'status', 'created_at', 'updated_at'],
      },
      ConsultAppointment: {
        type: 'object',
        properties: {
          app_id: { type: 'string', description: 'The consult appointment ID (UUID)' },
          status: { type: 'string', enum: Object.values(StatusAppointment), description: 'Status of the appointment' },
          description: { type: 'string', description: 'Description of the appointment' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          customer: { $ref: '#/components/schemas/Account', description: 'The customer who booked the appointment' },
          consultant_pattern: { $ref: '#/components/schemas/ConsultantPattern', description: 'The consultant pattern for the appointment' },
          feedback: { $ref: '#/components/schemas/Feedback', nullable: true, description: 'Feedback for the appointment' },
          report: { $ref: '#/components/schemas/ConsultReport', nullable: true, description: 'Report for the appointment' },
        },
        required: ['app_id', 'status', 'description', 'created_at', 'updated_at'],
      },
      ConsultReport: {
        type: 'object',
        properties: {
          report_id: { type: 'string', description: 'The consult report ID (UUID)' },
          name: { type: 'string', description: 'Name of the report' },
          description: { type: 'string', description: 'Description of the report' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          consult_appointment: { $ref: '#/components/schemas/ConsultAppointment', description: 'The consult appointment associated with the report' },
        },
        required: ['report_id', 'name', 'description', 'created_at', 'updated_at'],
      },
      ConsultantPattern: {
        type: 'object',
        properties: {
          pattern_id: { type: 'string', description: 'The consultant pattern ID (UUID)' },
          date: { type: 'string', format: 'date', description: 'Date of the consultant pattern' },
          is_booked: { type: 'boolean', description: 'Booking status of the pattern' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          working_slot: { $ref: '#/components/schemas/WorkingSlot', description: 'The working slot associated with the pattern' },
          consultant: { $ref: '#/components/schemas/Account', description: 'The consultant associated with the pattern' },
          consult_appointment: { $ref: '#/components/schemas/ConsultAppointment', description: 'The consult appointment associated with the pattern' },
        },
        required: ['pattern_id', 'date', 'is_booked', 'created_at', 'updated_at'],
      },
      WorkingSlot: {
        type: 'object',
        properties: {
          slot_id: { type: 'string', description: 'The working slot ID (UUID)' },
          name: { type: 'string', description: 'Name of the working slot' },
          start_at: { type: 'string', description: 'Start time of the slot', nullable: true },
          end_at: { type: 'string', description: 'End time of the slot', nullable: true },
          type: { type: 'string', enum: Object.values(TypeAppointment), description: 'Type of appointment' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          consultant_pattern: { type: 'array', items: { $ref: '#/components/schemas/ConsultantPattern' }, description: 'List of consultant patterns' },
          laborarity_appointment: { type: 'array', items: { $ref: '#/components/schemas/LaboratoryAppointment' }, description: 'List of laboratory appointments' },
          staff_pattern: { type: 'array', items: { $ref: '#/components/schemas/StaffPattern' }, description: 'List of staff patterns' },
        },
        required: ['slot_id', 'name', 'type', 'created_at', 'updated_at'],
      },
      Reply: {
        type: 'object',
        properties: {
          reply_id: { type: 'string', description: 'The reply ID (UUID)' },
          content: { type: 'string', description: 'Content of the reply' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          consultant: { $ref: '#/components/schemas/Account', description: 'The consultant who replied' },
          question: { $ref: '#/components/schemas/Question', description: 'The question being replied to' },
        },
        required: ['reply_id', 'content', 'created_at', 'updated_at'],
      },
      Result: {
        type: 'object',
        properties: {
          result_id: { type: 'string', description: 'The result ID (UUID)' },
          name: { type: 'string', description: 'Name of the result' },
          description: { type: 'string', description: 'Description of the result' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          laboratoryAppointment: { $ref: '#/components/schemas/LaboratoryAppointment', description: 'The laboratory appointment associated with the result' },
        },
        required: ['result_id', 'name', 'description', 'created_at', 'updated_at'],
      },
      LaboratoryAppointment: {
        type: 'object',
        properties: {
          app_id: { type: 'string', description: 'The laboratory appointment ID (UUID)' },
          queue_index: { type: 'integer', description: 'Queue index of the appointment' },
          description: { type: 'string', nullable: true, description: 'Description of the appointment' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          customer: { $ref: '#/components/schemas/Account', description: 'The customer who booked the appointment' },
          working_slot: { $ref: '#/components/schemas/WorkingSlot', description: 'The working slot for the appointment' },
          laborarity: { type: 'array', items: { $ref: '#/components/schemas/Laborarity' }, description: 'List of laboratory tests' },
          result: { $ref: '#/components/schemas/Result', nullable: true, description: 'Result of the appointment' },
          feedback: { $ref: '#/components/schemas/Feedback', nullable: true, description: 'Feedback for the appointment' },
        },
        required: ['app_id', 'queue_index', 'created_at', 'updated_at'],
      },
      StaffPattern: {
        type: 'object',
        properties: {
          pattern_id: { type: 'string', description: 'The staff pattern ID (UUID)' },
          date: { type: 'string', format: 'date', description: 'Date of the staff pattern' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          working_slot: { $ref: '#/components/schemas/WorkingSlot', description: 'The working slot associated with the pattern' },
          account: { $ref: '#/components/schemas/Account', description: 'The account associated with the pattern' },
        },
        required: ['pattern_id', 'date', 'created_at', 'updated_at'],
      },
      Transaction: {
        type: 'object',
        properties: {
          transaction_id: { type: 'string', description: 'The transaction ID (UUID)' },
          method: { type: 'string', description: 'Payment method' },
          app_id: { type: 'string', description: 'The associated appointment ID (UUID)' },
          date: { type: 'string', format: 'date-time', description: 'Date of the transaction' },
          description: { type: 'string', nullable: true, description: 'Description of the transaction' },
          created_at: { type: 'string', format: 'date-time', description: 'Creation timestamp' },
          updated_at: { type: 'string', format: 'date-time', description: 'Update timestamp' },
          customer: { $ref: '#/components/schemas/Account', description: 'The customer who made the transaction' },
        },
        required: ['transaction_id', 'method', 'app_id', 'date', 'created_at', 'updated_at'],
      },
    },
  },
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
};

const options = {
  swaggerDefinition,
  // Đường dẫn đến các file chứa JSDoc annotations
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Chỉ định nơi chứa các file route hoặc controller
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;