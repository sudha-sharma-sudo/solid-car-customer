# Solid Car Backend

Backend server for the Solid Car rental service application.

## Features

- User authentication and authorization
- Email verification and password reset
- MongoDB database integration
- Input validation and sanitization
- Error handling and logging
- Test setup with Jest
- Development tools (ESLint, Prettier)
- API documentation
- Security features (CORS, rate limiting, CSRF protection)

## Prerequisites

- Node.js (>= 14.0.0)
- MongoDB (>= 4.4)
- npm or yarn

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd solid-car-customer/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.development
```
Edit `.env.development` with your configuration.

4. Start MongoDB:
```bash
mongod
```

5. Seed the database (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The server will be running at http://localhost:3000

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues
- `npm run format` - Format code with Prettier
- `npm run seed` - Seed the database with sample data

## Project Structure

```
backend/
├── config/             # Configuration files
├── middleware/         # Express middleware
├── models/            # MongoDB models
├── routes/            # API routes
├── services/          # Business logic
├── tests/            # Test files
├── scripts/          # Utility scripts
└── uploads/          # File uploads
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "phone": "string (optional)",
  "terms": "boolean"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "string",
  "password": "string"
}
```

#### GET /api/auth/me
Get current user profile (requires authentication)

#### POST /api/auth/logout
Logout user

### Other endpoints documentation coming soon...

## Testing

The project uses Jest for testing. Tests are located in the `tests` directory.

To run all tests:
```bash
npm test
```

To run tests with coverage:
```bash
npm run test:coverage
```

## Development

1. Follow the code style guide (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed

## Security

- CORS protection
- Rate limiting
- CSRF protection
- Input validation
- HTTP-only cookies
- Helmet security headers
- Password hashing
- JWT token authentication

## Error Handling

The application uses a centralized error handling mechanism. All errors are logged and appropriate error responses are sent to the client.

## Logging

Winston is used for logging. Logs are stored in:
- `error.log` - Error logs
- `combined.log` - All logs

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the ISC License.
