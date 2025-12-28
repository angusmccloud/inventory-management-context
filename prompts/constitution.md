Create a constitution for a modern web application with the following specifications:

## Technology Stack
- **Frontend Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 with strict mode enabled
- **Deployment**: AWS SAM (Serverless Application Model) for serverless deployment
- **Database**: Amazon DynamoDB
- **Runtime**: Node.js 24.x LTS
- **Local Development**: Colima for Docker runtime (Docker Desktop is NOT supported)

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

## Infrastructure as Code (IaC) Standards
- **ALWAYS prefer YAML-based configuration in `template.yaml` over manual AWS Console operations**
- All AWS resource configurations MUST be defined in the SAM template when possible
- Manual console operations should ONLY be used for:
  - Initial one-time setup (e.g., domain registration, Route 53 hosted zone creation)
  - Operations that cannot be automated via CloudFormation/SAM (e.g., third-party DNS provider configuration)
  - Emergency troubleshooting and debugging
- Document any manual steps that cannot be automated and explain why
- Infrastructure changes MUST be version-controlled and repeatable across environments
- Use SAM template parameters for environment-specific configuration (dev, staging, prod)
- Validate template changes with `sam validate` before deployment

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

## API Design Patterns
- **Response Format**: ALL API endpoints MUST return responses wrapped in a `data` field:
  ```typescript
  // ✅ CORRECT - Backend response format
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        items: [],
        totalCount: 0
      }
    })
  };
  
  // ❌ WRONG - Missing data wrapper
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: [],
      totalCount: 0
    })
  };
  ```
- **Frontend API Client**: All API clients MUST expect and unwrap the `{data: T}` format:
  ```typescript
  const response: ApiSuccess<T> = await response.json();
  return response.data; // Unwrap and return inner object
  ```
- **Empty List Handling**: Frontend components MUST handle empty arrays defensively:
  ```typescript
  // ✅ CORRECT - Defensive with fallback
  const items = response.items || [];
  
  // ❌ WRONG - Assumes array always exists
  const items = response.items;
  ```
- **Authentication**: ALWAYS use centralized auth utilities from `lib/auth`:
  ```typescript
  // ✅ CORRECT - Use shared auth utilities
  import { getUserContext, requireAdmin } from '../lib/auth';
  const userContext = getUserContext(event, logger);
  
  // ❌ WRONG - Custom auth implementation
  const userContext = event.requestContext.authorizer;
  ```
- **Family Context Resolution**: For new users without `custom:familyId` in JWT:
  ```typescript
  // Query Member table first to get familyId
  const member = await memberModel.getByMemberId(userContext.userId);
  if (!member) {
    throw new Error('User must be member of a family');
  }
  const familyId = member.familyId;
  ```
- **Error Responses**: Use consistent error format with proper status codes:
  ```typescript
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: 'Validation failed',
      details: zodError.errors
    })
  };
  ```

## Security Standards
- Never commit secrets or API keys
- Use AWS Secrets Manager or Parameter Store for sensitive data
- Implement proper authentication and authorization
- Validate and sanitize all user inputs
- Follow OWASP security guidelines