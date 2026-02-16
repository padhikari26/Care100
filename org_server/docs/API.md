# Healthcare Organization Authentication API

## Authentication

### Login
`POST /api/auth/login`

Request body:
```json
{
  "email": "string, required",
  "password": "string, required",
  "userType": "string, required (super_admin|organization|employee)"
}