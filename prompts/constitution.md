Create a constitution for a modern web application with the following specifications:

## Technology Stack
- **Frontend Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 with strict mode enabled
- **Deployment**: AWS SAM (Serverless Application Model) for serverless deployment
- **Database**: Amazon DynamoDB
- **Runtime**: Node.js 20.x LTS

## Architecture Principles
- Server-side rendering (SSR) and static generation (SSG) where appropriate
- API routes using Next.js App Router route handlers
- Serverless functions for backend logic
- Single-table design pattern for DynamoDB when possible
- Type safety throughout the entire application

## Code Organization
- Use the Next.js 16 App Router directory structure (`app/` directory)
- Separate business logic from presentation components
- Colocate related files (components, styles, tests)
- Keep AWS SAM template and infrastructure code in project root
- Store DynamoDB table definitions in SAM template

## Development Standards
- All code must be written in TypeScript with no implicit `any` types
- Use async/await for asynchronous operations
- Implement proper error handling and logging
- Follow Next.js best practices for data fetching and caching
- Use environment variables for configuration
- Implement proper CORS and security headers

## AWS Integration
- Use AWS SDK v3 with modular imports
- Implement DynamoDB Document Client for data operations
- Follow AWS Well-Architected Framework principles
- Use CloudWatch for logging and monitoring
- Implement proper IAM roles and permissions in SAM template

## Testing Requirements
- Unit tests for business logic and utility functions
- Integration tests for API routes
- Use Jest and React Testing Library
- Maintain minimum 80% code coverage for critical paths

## Performance Guidelines
- Implement proper Next.js caching strategies
- Optimize DynamoDB queries (avoid scans when possible)
- Use Next.js Image component for image optimization
- Implement code splitting and lazy loading
- Configure Lambda cold start optimization

## Security Standards
- Never commit secrets or API keys
- Use AWS Secrets Manager or Parameter Store for sensitive data
- Implement proper authentication and authorization
- Validate and sanitize all user inputs
- Follow OWASP security guidelines